# import frappe
# import json

# @frappe.whitelist()
# def add_test_cases_to_existing_run(configurations, test_cases, test_plan):
#     """
#     Add given test cases to existing Test Runs for the specified configurations and test plan.
#     Will never create a new Test Run — skips if none exists.
#     """
#     # Parse JSON strings to Python lists if needed
#     configurations = json.loads(configurations) if isinstance(configurations, str) else configurations
#     test_cases = json.loads(test_cases) if isinstance(test_cases, str) else test_cases

#     for cfg in configurations:
#         # Find an existing Test Run for this config + test plan
#         test_run_name = frappe.db.get_value(
#             "Test Run",
#             {"configuration": cfg, "test_plan": test_plan},
#             "name"
#         )

#         if not test_run_name:
#             frappe.msgprint(f"⚠ No existing Test Run for configuration '{cfg}' — skipped")
#             continue

#         test_run = frappe.get_doc("Test Run", test_run_name)
#         existing_cases = {row.test_case for row in (test_run.test_cases or [])}

#         added_count = 0
#         for tc in test_cases:
#             if tc not in existing_cases:
#                 test_run.append("test_cases", {"test_case": tc})
#                 added_count += 1

#         if added_count > 0:
#             test_run.save(ignore_permissions=True)
#             frappe.msgprint(f"✅ Added {added_count} Test Case(s) to Test Run {test_run.name}")
#         else:
#             frappe.msgprint(f"ℹ No new Test Cases for Test Run {test_run.name}")

#     frappe.db.commit()


import frappe
import json

@frappe.whitelist()
def add_test_cases_to_existing_run(configurations, test_cases, test_plan):
    """
    Add given test cases to ALL Test Runs for the specified configurations and test plan.
    """
    configurations = json.loads(configurations) if isinstance(configurations, str) else configurations
    test_cases = json.loads(test_cases) if isinstance(test_cases, str) else test_cases

    if not test_plan or not configurations or not test_cases:
        return

    # Fetch all Test Runs for this plan and selected configurations
    test_runs = frappe.get_all(
        "Test Run",
        filters={"test_plan": test_plan},
        fields=["name", "title", "project", "tag"]
    )

    added_total = 0
    for run in test_runs:
        # Check if this run matches any selected configuration
        if any(cfg in run.title for cfg in configurations):
            run_doc = frappe.get_doc("Test Run", run.name)
            if not hasattr(run_doc, "test_case") or run_doc.test_case is None:
                run_doc.test_case = []

            existing_keys = set(f"{tc.test_case}__{tc.configuration}" for tc in run_doc.test_case or [])

            for tc in test_cases:
                key = f"{tc}__{cfg}"
                if key not in existing_keys:
                    # Add test case for all configurations selected
                    for cfg in configurations:
                        run_doc.append("test_case", {
                            "test_case": tc,
                            "test_case_title": frappe.get_value("Test Case", tc, "title") or "",
                            "configuration": cfg,
                            "status": "Pending"
                        })
                        added_total += 1

            run_doc.save(ignore_permissions=True)

    return f"✅ Added {added_total} Test Cases to {len(test_runs)} Test Runs"
