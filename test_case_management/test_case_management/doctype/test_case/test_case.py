import frappe
from frappe.model.document import Document

class TestCase(Document):

    def validate(self):


        # 1. Check uniqueness in Test Case itself (project-wise, excluding self in update)
        exists_in_case = frappe.db.exists(
            'Test Case',
            {
                'test_case_id': self.test_case_id,
                'project': self.project,
                'name': ['!=', self.name]
            }
        )
        if exists_in_case:
            frappe.throw(f'Test Case ID "{self.test_case_id}" already exists in another Test Case for this project.')

        # 2. Validate Test Plan mandatory steps
        old_doc = self.get_doc_before_save()

        # Skip if status is unchanged
        if old_doc and old_doc.status == self.status:
            return

        # Get linked Test Plans
        test_plan_names = frappe.get_all(
            "Test Plan Cases",
            filters={"test_case": self.name},
            fields=["parent"]
        )

        for plan in test_plan_names:
            plan_name = plan.get("parent")

            is_mandatory = frappe.db.get_value("Test Plan", plan_name, "test_case_steps_manadatory")

            if is_mandatory:
                incomplete_steps = [step for step in self.case_steps if not step.step_completed]
                if incomplete_steps:
                    frappe.throw(
                        f"Cannot change status. 'Test Case Steps Mandatory' is set in Test Plan '{plan_name}', "
                        "so all steps must be marked as done."
                    )
