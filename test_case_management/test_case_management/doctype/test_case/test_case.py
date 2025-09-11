# # Copyright (c) 2025, Rutuja Somvanshi and contributors
# # For license information, please see license.txt

# # import frappe
# from frappe.model.document import Document


# class TestCase(Document):
# 	pass



# Copyright (c) 2025, Rutuja Somvanshi and contributors
# For license information, please see license.txt

import frappe
from frappe.model.document import Document

class TestCase(Document):

    def validate(self):
        # Get the previous doc before saving
        old_doc = self.get_doc_before_save()

        # Only validate if status is being changed
        if old_doc and old_doc.status == self.status:
            return  # status not changed → skip validation

        # Find all Test Plans linked to this Test Case via Test Plan Case table
        test_plan_names = frappe.get_all(
            "Test Plan Cases",
            filters={"test_case": self.name},
            fields=["parent"]
        )

        if not test_plan_names:
            return  # no linked test plan, skip

        for plan in test_plan_names:
            plan_name = plan.get("parent")

            # Check if that Test Plan has steps mandatory = True
            is_mandatory = frappe.db.get_value("Test Plan", plan_name, "test_case_steps_manadatory")

            if is_mandatory:
                # Now ensure all steps are marked done
                incomplete_steps = [step for step in self.case_steps if not step.step_completed]
                if incomplete_steps:
                    frappe.throw(
                        f"Cannot change status. 'Test Case Steps Mandatory' is set in Test Plan '{plan_name}', "
                        "so all steps must be marked as done."
                    )
    def validate(self):
        # Check in Test Case Bank
        exists_in_bank = frappe.db.exists(
            'Test Case Bank',
            {
                'test_case_id': self.test_case_id,
                'project': self.project
            }
        )

        if exists_in_bank:
            frappe.throw(f'Test Case ID "{self.test_case_id}" already exists in the Test Case Bank for this project.')

        # Check in Test Case itself (exclude self for updates)
        exists_in_case = frappe.db.exists(
            'Test Case',
            {
                'test_case_id': self.test_case_id,
                'project': self.project,
                'name': ['!=', self.name]
            }
        )

        if exists_in_case:
            frappe.throw(f'Test Case ID "{self.test_case_id}" already exists in Test Cases for this project.')
