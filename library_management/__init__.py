# __init__.py

__version__ = "0.0.1"

import frappe.desk.form.assign_to



def silent_notify_assignment(*args, **kwargs):
    # Override does nothing, silencing the default notification
    pass

# Override the default function
frappe.desk.form.assign_to.notify_assignment = silent_notify_assignment

def custom_assign_and_notify_both(doctype, name, new_user, description=None):
    """
    Assign a task and notify both the previous and new assignee if it's a reassignment.
    """
    # Get existing assignments
    existing_assignments = frappe.get_all("ToDo", {
        "reference_type": doctype,
        "reference_name": name,
        "status": "Open"
    }, ["name", "allocated_to"])

    already_assigned_users = [d.allocated_to for d in existing_assignments]

    is_reassignment = bool(existing_assignments) and new_user not in already_assigned_users

    # If reassignment, notify old + new assignees and clear old assignments
    if is_reassignment:
        for task in existing_assignments:
            notify_previous_assignee(task.allocated_to, doctype, name, new_user)
            frappe.delete_doc("ToDo", task.name)

    # Create new assignment
    assign_to.add({
        "assign_to": [new_user],
        "doctype": doctype,
        "name": name,
        "description": description or ""
    })

    # Notify new user
    if is_reassignment:
        notify_new_assignee(new_user, doctype, name, description)

# Notify previous assignee
def notify_previous_assignee(old_user, doctype, name, new_user):
    email = frappe.db.get_value("User", old_user, "email")
    if not email:
        return

    subject = f"Task Reassigned: {doctype} {name}"
    message = f"""
        <p>Hello {old_user},</p>
        <p>Your task <strong>{doctype} {name}</strong> has been reassigned to <strong>{new_user}</strong>.</p>
        <p><a href="{frappe.utils.get_url()}/app/{doctype.lower().replace(' ', '-')}/{name}">View Task</a></p>
    """
    frappe.sendmail(recipients=[email], subject=subject, message=message)

# Notify new assignee
def notify_new_assignee(new_user, doctype, name, description=None):
    email = frappe.db.get_value("User", new_user, "email")
    if not email:
        return

    subject = f"New Task Assigned: {doctype} {name}"
    message = f"""
        <p>Hello {new_user},</p>
        <p>You have been assigned to the task <strong>{doctype} {name}</strong>.</p>
        {f"<p><strong>Description:</strong> {description}</p>" if description else ""}
        <p><a href="{frappe.utils.get_url()}/app/{doctype.lower().replace(' ', '-')}/{name}">View Task</a></p>
    """
    frappe.sendmail(recipients=[email], subject=subject, message=message)