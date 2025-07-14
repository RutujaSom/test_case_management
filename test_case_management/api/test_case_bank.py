import frappe

@frappe.whitelist()
def get_test_cases_query_for_project(doctype, txt, searchfield, start, page_len, filters):
    """
    Custom query to fetch Test Case Bank entries for use in dialogs (e.g., MultiSelectDialog).

    Args:
        doctype (str): The DocType being queried (not used here but required by Frappe's API).
        txt (str): Search text input for filtering by test_case_id or title.
        searchfield (str): The field being searched (not used directly).
        start (int): Offset for pagination.
        page_len (int): Number of records per page.
        filters (dict): Additional filters (not used here, but included for API compatibility).

    Returns:
        List[Dict]: A list of dictionaries containing `name`, `test_case_id`, and `title`.
    """

    # SQL query to filter records where either test_case_id or title matches the search text
    return frappe.db.sql("""
        SELECT
            name,
            test_case_id,
            title
        FROM `tabTest Case Bank`
        WHERE
            test_case_id LIKE %(txt)s OR title LIKE %(txt)s
        ORDER BY creation DESC
        LIMIT %(start)s, %(page_len)s
    """, {
        "txt": f"%{txt}%",        # Enables partial match search
        "start": start,           # Offset for pagination
        "page_len": page_len      # Limit number of records returned
    }, as_dict=True)             # Return results as list of dictionaries
