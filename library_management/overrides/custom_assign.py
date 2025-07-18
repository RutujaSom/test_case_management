import frappe
from frappe.desk.form.assign_to import add as add_assignment

@frappe.whitelist()
def custom_assigned_to(args=None):
    # If args is None or empty, just call original
    if not args:
        return add_assignment()

    # If args is a JSON string, parse it
    if isinstance(args, str):
        args = frappe._dict(frappe.parse_json(args))

    # Safely suppress default notify
    args['notify'] = False

    # Call the original function with modified args
    return add_assignment(frappe.as_json(args))