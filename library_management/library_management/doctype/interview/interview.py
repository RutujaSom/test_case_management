# import frappe

# def has_permission(doc, ptype, user):
#     if user == "Administrator":
#         return True

#     # Replace with correct child table fieldname
#     if any(row.interviewer == user for row in doc.interview_detail):
#         return True

#     return False


# def get_permission_query_conditions(user):
#     if user == "Administrator":
#         return ""

#     return f"""
#         EXISTS (
#             SELECT 1 FROM `tabInterview Detail` id
#             WHERE id.parent = `tabInterview`.name
#             AND id.interviewer = '{user}'
#         )
#     """
import frappe


def has_permission(doc, ptype, user):
    if user == "Administrator":
        return True

    # Use the correct child table fieldname
    if any(row.interviewer == user for row in doc.interview_details):
        return True

    return False


def get_permission_query_conditions(user):
    if user == "Administrator":
        return ""

    return f"""
        EXISTS (
            SELECT 1 FROM `tabInterview Detail` id
            WHERE id.parent = `tabInterview`.name
            AND id.interviewer = '{user}'
        )
    """



