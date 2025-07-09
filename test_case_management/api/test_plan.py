
import frappe
import csv
import io
from openpyxl import load_workbook


@frappe.whitelist()
def import_test_cases_from_file(file_url, test_plan, file_type):  # file_type passed from dialog
    file_doc = frappe.get_doc("File", {"file_url": file_url})
    file_content = file_doc.get_content()
    filename = file_doc.file_name.lower()

    # Validate file extension based on selected file_type
    if file_type == "CSV" and not filename.endswith(".csv"):
        frappe.throw("Selected file type is CSV but uploaded file is not a .csv file.")
    elif file_type == "Excel" and not filename.endswith(".xlsx"):
        frappe.throw("Selected file type is Excel but uploaded file is not a .xlsx file.")

    test_plan_doc = frappe.get_doc("Test Plan", test_plan)
    project = test_plan_doc.project
    count = 0
    rows = []

    # Parse Excel
    if filename.endswith(".xlsx"):
        file_path = file_doc.get_full_path()
        with open(file_path, "rb") as f:
            wb = load_workbook(f, data_only=True)
            ws = wb.active
            headers = [cell.value for cell in ws[1]]
            for row in ws.iter_rows(min_row=2, values_only=True):
                rows.append(dict(zip(headers, row)))

    # Parse CSV
    elif filename.endswith(".csv"):
        try:
            content = file_content.decode("utf-8")
        except UnicodeDecodeError:
            content = file_content.decode("latin-1")
        reader = csv.DictReader(io.StringIO(content))
        rows = list(reader)

    for row in rows:
        title = (row.get("title") or "").strip()
        description = (row.get("description") or "").strip()
        expected_result = (row.get("expected_result") or "").strip()
        status = (row.get("status") or "Open").strip()
        pre_conditions = (row.get("pre_conditions") or "").strip()
        test_case_id = (row.get("test_case_id") or "").strip()
        priority = (row.get('priority') or "").strip()

        # Get steps from CSV/Excel, format: Step 1||Step 2||Step 3
        raw_steps = (row.get("steps") or "").strip()
        # step_titles = [s.strip() for s in raw_steps.split("||") if s.strip()]

        if not title or not expected_result:
            print(f"Skipping row due to missing title or expected_result: {row}")
            continue

        # Create Test Case
        test_case = frappe.new_doc("Test Case")
        test_case.title = title
        test_case.test_case_id = test_case_id
        test_case.description = description
        test_case.pre_conditions = pre_conditions
        test_case.expected_results = expected_result
        test_case.project = project
        test_case.status = status
        test_case.priority = priority

        # Add Test Case Steps
        # for step_title in step_titles:
        test_case.append("case_steps", {
            "title": raw_steps,
            "step_completed": 0  # default to not completed
        })

        # Save Test Case
        test_case.insert(ignore_permissions=True)

        # Link to Test Plan
        test_plan_doc.append("test_cases", {
            "test_case": test_case.name,
            "test_case_title": test_case.title  # <- This ensures it shows in the grid
        })
        count += 1



    test_plan_doc.save()
    frappe.db.commit()

    return f"{count} Test Case(s) imported and linked to Test Plan."
