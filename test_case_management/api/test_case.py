import frappe

def get_test_plan_flag(test_plan_name):
    if not test_plan_name:
        return 0
    return frappe.db.get_value("Test Plan", test_plan_name, "test_case_steps_mandatory")

def validate(self):
    # Only validate if status is being changed
    if self.status and self.test_plan:  # Assuming you link to Test Plan in Test Case
        mandatory_check = get_test_plan_flag(self.test_plan)

        if mandatory_check:
            incomplete_steps = [step for step in self.test_steps if not step.is_done]
            if incomplete_steps:
                frappe.throw("Cannot update status. All steps must be marked as done because 'Test Case Steps Mandatory' is checked in the related Test Plan.")




import frappe

def validate(self):
    print('vali .....',self)
    if not self.status:
        return

    # Find all Test Plans linked to this Test Case via Test Plan Case table
    test_plan_names = frappe.get_all(
        "Test Plan Case",
        filters={"test_case": self.name},
        fields=["parent"]
    )

    if not test_plan_names:
        return  # no linked test plan, skip

    for plan in test_plan_names:
        plan_name = plan.get("parent")

        # Check if that Test Plan has steps mandatory = True
        is_mandatory = frappe.db.get_value("Test Plan", plan_name, "test_case_steps_mandatory")
        
        if is_mandatory:
            # Now ensure all steps are marked done
            incomplete_steps = [step for step in self.test_steps if not step.is_done]
            if incomplete_steps:
                frappe.throw(f"Cannot update status. 'Test Case Steps Mandatory' is set in Test Plan '{plan_name}', so all steps must be marked done.")





@frappe.whitelist()
def get_test_cases_query(doctype, txt, searchfield, start, page_len, filters):
    import json
    if isinstance(filters, str):
        filters = json.loads(filters)

    return frappe.db.sql("""
        SELECT
            name,
            test_case_id,
            title
        FROM `tabTest Case`
        WHERE
            project = %(project)s
            AND (test_case_id LIKE %(txt)s OR title LIKE %(txt)s)
        ORDER BY creation DESC
        LIMIT %(start)s, %(page_len)s
    """, {
        "project": filters.get("project"),
        "txt": f"%{txt}%",
        "start": start,
        "page_len": page_len
    }, as_dict=True)

