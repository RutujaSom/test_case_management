
import frappe

@frappe.whitelist()
def get_test_cases_query_for_project(doctype, txt, searchfield, start, page_len,filters):
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
        "txt": f"%{txt}%",
        "start": start,
        "page_len": page_len
    }, as_dict=True)
