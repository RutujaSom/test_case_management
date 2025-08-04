import frappe

# Utility function to check if 'Test Case Steps Mandatory' is enabled in a given Test Plan
def get_test_plan_flag(test_plan_name):
    if not test_plan_name:
        return 0
    return frappe.db.get_value("Test Plan", test_plan_name, "test_case_steps_mandatory")


# Validation logic for Test Case (if only one Test Plan is directly linked via field `test_plan`)
def validate(self):
    print('in 1 fun')
    # Skip if no status is being updated or no test plan linked
    if self.status and self.test_plan:
        # Check if the related Test Plan enforces mandatory step completion
        mandatory_check = get_test_plan_flag(self.test_plan)

        if mandatory_check:
            # Find steps not marked as done
            incomplete_steps = [step for step in self.test_steps if not step.is_done]
            if incomplete_steps:
                frappe.throw("Cannot update status. All steps must be marked as done because 'Test Case Steps Mandatory' is checked in the related Test Plan.")


# Alternate validation logic (if a Test Case can be linked to multiple Test Plans through a child table)
def validate(self):

    if not self.status:
        return

    # Get all Test Plans that include this Test Case via the Test Plan Case table
    test_plan_names = frappe.get_all(
        "Test Plan Case",
        filters={"test_case": self.name},
        fields=["parent"]
    )

    if not test_plan_names:
        return  # No linked Test Plans, so skip validation

    for plan in test_plan_names:
        plan_name = plan.get("parent")

        # Check if this Test Plan requires all steps to be completed
        is_mandatory = frappe.db.get_value("Test Plan", plan_name, "test_case_steps_mandatory")
        
        if is_mandatory:
            # Check for any incomplete steps
            incomplete_steps = [step for step in self.test_steps if not step.is_done]
            if incomplete_steps:
                frappe.throw(f"Cannot update status. 'Test Case Steps Mandatory' is set in Test Plan '{plan_name}', so all steps must be marked done.")


# Server-side query function for fetching filtered and paginated Test Cases in dialogs
@frappe.whitelist()
def get_test_cases_query(doctype, txt, searchfield, start, page_len, filters):
    import json

    if isinstance(filters, str):
        filters = json.loads(filters)

    conditions = []
    query_filters = {
        "txt": f"%{txt}%",
    }

    for key, value in filters.items():
        if isinstance(value, list) and len(value) == 2:
            operator, val = value
            if isinstance(val, (str, int, float)):
                conditions.append(f"{key} {operator} %({key})s")
                query_filters[key] = val
        elif isinstance(value, (str, int, float)):
            conditions.append(f"{key} = %({key})s")
            query_filters[key] = value

    where_clause = " AND ".join(conditions)
    if where_clause:
        where_clause = " AND " + where_clause

    # 🚨 Note: LIMIT values are directly injected, NOT parameterized
    query = f"""
        SELECT
            name,
            test_case_id,
            title
        FROM tabTest Case
        WHERE
            (test_case_id LIKE %(txt)s OR title LIKE %(txt)s)
            {where_clause}
        ORDER BY creation DESC
        LIMIT {int(start)}, {int(page_len)}
    """

    return frappe.db.sql(query, query_filters, as_dict=True)