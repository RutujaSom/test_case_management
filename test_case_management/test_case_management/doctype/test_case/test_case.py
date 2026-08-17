import frappe
from frappe.model.document import Document

class TestCase(Document):

    def validate(self):

        if self.workflow_state == "Rejected" and not self.remark:
            frappe.throw("Remark is mandatory when rejecting")


        # 1. Check uniqueness in Test Case itself (project-wise, excluding self in update)
        exists_in_case = frappe.db.exists(
            'Test Case',
            {
                'test_case_id': self.test_case_id,
                'project': self.project,
                'name': ['!=', self.name],
                'docstatus': ["!=",2]
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

    def on_update(self):
        status = "Draft"
        # Only act when workflow_state is Approved and test_run is set
        if self.workflow_state == "Approved":
            status = "Pending"

        if not self.test_run:
            return

        test_run = frappe.get_doc("Test Run", self.test_run)

        # Avoid duplicate entries - check if this test case is already in the child table
        already_added = any(
            row.test_case == self.name for row in test_run.test_case
        )

        if already_added:
            return

        test_run.append("test_case", {
            "test_case": self.name,
            "status": "Pending"
        })

        test_run.save(ignore_permissions=True)
        frappe.db.commit()

        frappe.msgprint(
            f"Test Case {self.name} added to Test Run {test_run.name}",
            alert=True
        )