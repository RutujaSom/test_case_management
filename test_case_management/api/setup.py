import frappe
import os

def reload_permissions():
    """Force-reload all Test Case Management doctype permissions after every migrate."""
    app = "test_case_management"
    app_path = frappe.get_app_path(app)
    doctype_root = os.path.join(app_path, app, "doctype")

    if os.path.isdir(doctype_root):
        for dt_folder in os.listdir(doctype_root):
            json_file = os.path.join(doctype_root, dt_folder, f"{dt_folder}.json")
            if os.path.isfile(json_file):
                try:
                    frappe.reload_doc(app, "doctype", dt_folder, force=True)
                except Exception as e:
                    frappe.log_error(f"Failed to reload {dt_folder}: {e}", "Permission Reload")

    frappe.db.commit()