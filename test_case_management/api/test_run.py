import frappe
import json

@frappe.whitelist()
def add_test_cases_to_existing_run(configurations, test_cases, test_plan):
    """
    Add given test cases to existing Test Runs for the specified configurations and test plan.
    Will never create a new Test Run — skips if none exists.
    """
    # Parse JSON strings to Python lists if needed
    configurations = json.loads(configurations) if isinstance(configurations, str) else configurations
    test_cases = json.loads(test_cases) if isinstance(test_cases, str) else test_cases

    for cfg in configurations:
        # Find an existing Test Run for this config + test plan
        test_run_name = frappe.db.get_value(
            "Test Run",
            {"configuration": cfg, "test_plan": test_plan},
            "name"
        )

        if not test_run_name:
            frappe.msgprint(f"⚠ No existing Test Run for configuration '{cfg}' — skipped")
            continue

        test_run = frappe.get_doc("Test Run", test_run_name)
        existing_cases = {row.test_case for row in (test_run.test_cases or [])}

        added_count = 0
        for tc in test_cases:
            if tc not in existing_cases:
                test_run.append("test_cases", {"test_case": tc})
                added_count += 1

        if added_count > 0:
            test_run.save(ignore_permissions=True)
            frappe.msgprint(f"✅ Added {added_count} Test Case(s) to Test Run {test_run.name}")
        else:
            frappe.msgprint(f"ℹ No new Test Cases for Test Run {test_run.name}")

    frappe.db.commit()
