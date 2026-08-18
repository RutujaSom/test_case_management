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
        print("self .......", self.workflow_state, '...self.docstatus....', self.docstatus)

        # Workflow-level cancel (if you have a "Cancelled" workflow_state separate from docstatus)
        if self.workflow_state == "Cancelled":
            self.remove_from_all_test_runs()
            return

        status = self.get_status_for_test_run()

        if not self.test_run:
            return

        test_run = frappe.get_doc("Test Run", self.test_run)

        # Check if this test case already exists in the child table
        existing_row = next(
            (row for row in test_run.test_case if row.test_case == self.name),
            None
        )

        if existing_row:
            # Update status if it has changed instead of skipping
            if existing_row.status != status:
                existing_row.status = status
                test_run.save(ignore_permissions=True)
                frappe.db.commit()

                frappe.msgprint(
                    f"Test Case {self.name} status updated to {status} in Test Run {test_run.name}",
                    alert=True
                )
            return

        test_run.append("test_case", {
            "test_case": self.name,
            "status": status
        })

        test_run.save(ignore_permissions=True)
        frappe.db.commit()

        frappe.msgprint(
            f"Test Case {self.name} added to Test Run {test_run.name}",
            alert=True
        )


    def on_cancel(self):
        """This actually fires when the document is cancelled (docstatus -> 2)."""
        print("in on_cancel ...")
        self.remove_from_all_test_runs()


    def get_status_for_test_run(self):
        status_map = {
            "Draft": "Draft",
            "Pending": "Waiting For Approval",
            "Approved": "Pending",
            "Rejected": "Draft",
        }
        return status_map.get(self.workflow_state, "Draft")


    def remove_from_all_test_runs(self):
        print("in remove ...")
        linked_rows = frappe.get_all(
            "Test Run Test Case",  # confirm this matches your actual child doctype name
            filters={"test_case": self.name},
            fields=["parent"]
        )

        if not linked_rows:
            return

        parent_names = set(row.parent for row in linked_rows)
        print("parent_names ...", parent_names)

        for test_run_name in parent_names:
            test_run = frappe.get_doc("Test Run", test_run_name)

            rows_to_remove = [
                row for row in test_run.test_case if row.test_case == self.name
            ]
            print("rows_to_remove ....", rows_to_remove)

            if not rows_to_remove:
                continue

            for row in rows_to_remove:
                test_run.remove(row)

            test_run.save(ignore_permissions=True)
            frappe.db.commit()

            frappe.msgprint(
                f"Test Case {self.name} removed from Test Run {test_run.name}",
                alert=True
            )