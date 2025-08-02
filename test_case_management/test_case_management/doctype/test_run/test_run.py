# Copyright (c) 2025, Rutuja Somvanshi and contributors
# For license information, please see license.txt


import frappe
from frappe import _
from frappe.model.document import Document
import json



# class TestRun(Document):
#     def validate(self):
#         if not self.test_plan:
#             return

#         test_plan = frappe.get_doc("Test Plan", self.test_plan)

#         if test_plan.test_case_steps_manadatory:
#             for row in self.test_case:
#                 if not row.test_case_step_states:
#                     frappe.throw(
#                         _("No step completion data found for Test Case: {0}").format(row.test_case),
#                         title=_("Test Case Steps Mandatory")
#                     )

#                 try:
#                     step_states = json.loads(row.test_case_step_states)
#                 except Exception:
#                     frappe.throw(
#                         _("Invalid step state format for Test Case: {0}").format(row.test_case)
#                     )

#                 # ✅ Check if all steps are marked completed
#                 all_completed = all(step_states.values())
                
#                 # ✅ If all are done, mark step_completed as True
#                 row.step_completed = 1 if all_completed else 0

#                 # ❗ If steps are mandatory, throw error if any step is incomplete
#                 if not all_completed:
#                     frappe.throw(
#                         _("All steps must be completed for Test Case: {0}").format(row.test_case),
#                         title=_("Test Case Steps Mandatory")
#                     )



# @frappe.whitelist()
# def get_test_case_steps(test_case):
#     steps = frappe.get_all(
#         "Test Case Steps",
#         filters={"parent": test_case},
#         fields=["name", "title"],
#         order_by="idx asc"
#     )
#     return steps







class TestRun(Document):
    def validate(self):
        if not self.test_plan:
            return

        test_plan = frappe.get_doc("Test Plan", self.test_plan)

        if test_plan.test_case_steps_manadatory:
            for row in self.test_case:
                # Skip validation if status is not Passed or Failed
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

                # Check if all steps are marked completed
                all_completed = all(step_states.values())

                # Set step_completed based on step_states
                row.step_completed = 1 if all_completed else 0

                # Throw error if any step is incomplete when status is Passed or Failed
                if not all_completed:
                    test_case_title = frappe.get_value("Test Case", row.test_case, "title") or row.test_case
                    frappe.throw(
                        _("All steps must be completed for Test Case: {0} with status {1}").format(test_case_title, row.status),
                        title=_("Test Case Steps Mandatory")
                    )

@frappe.whitelist()
def get_test_case_steps(test_case):
    steps = frappe.get_all(
        "Test Case Steps",
        filters={"parent": test_case},
        fields=["name", "title"],
        order_by="idx asc"
    )
    return steps
