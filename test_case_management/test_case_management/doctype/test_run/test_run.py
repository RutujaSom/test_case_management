import frappe
from frappe import _
from frappe.model.document import Document
import json

class TestRun(Document):
    def validate(self):
        if not self.test_plan:
            return

        test_plan = frappe.get_doc("Test Plan", self.test_plan)

        if getattr(test_plan, "test_case_steps_manadatory", False):
            for row in self.test_case:
                if row.status not in ("Passed", "Failed"):
                    continue

                if not row.test_case_step_states:
                    test_case_title = frappe.get_value("Test Case", row.test_case, "title") or row.test_case
                    frappe.throw(
                        _("No step completion data found for Test Case: {0}").format(test_case_title),
                        title=_("Test Case Steps Mandatory")
                    )

                try:
                    step_states = json.loads(row.test_case_step_states)
                except Exception:
                    test_case_title = frappe.get_value("Test Case", row.test_case, "title") or row.test_case
                    frappe.throw(
                        _("Invalid step state format for Test Case: {0}").format(test_case_title)
                    )

                all_completed = all(step_states.values())
                row.step_completed = 1 if all_completed else 0

                if not all_completed:
                    test_case_title = frappe.get_value("Test Case", row.test_case, "title") or row.test_case
                    frappe.throw(
                        _("All steps must be completed for Test Case: {0} with status {1}").format(test_case_title, row.status),
                        title=_("Test Case Steps Mandatory")
                    )

    def on_trash(self):
        """Remove reference from parent Test Plan child table when this TestRun is deleted"""
        if not self.test_plan:
            return

        try:
            # Remove reference from Test Plan child table
            frappe.db.sql("""
                DELETE FROM `tabTest Run Reference`
                WHERE parent=%s AND test_run=%s
            """, (self.test_plan, self.name))
            
            frappe.db.commit()

        except Exception as e:
            frappe.log_error(f"Failed to remove Test Run {self.name} from Test Plan {self.test_plan}: {e}")


@frappe.whitelist()
def get_test_case_steps(test_case):
    steps = frappe.get_all(
        "Test Case Steps",
        filters={"parent": test_case},
        fields=["name", "title"],
        order_by="idx asc"
    )
    return steps
