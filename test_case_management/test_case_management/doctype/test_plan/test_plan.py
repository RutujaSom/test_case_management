
# from frappe.model.document import Document
# from itertools import product
# import frappe

# class TestPlan(Document):
#     def validate(self):
#         # Only run logic if it's NOT a new document
#         if self.get("__islocal"):
#             print("🟡 New Test Plan — skipping test run creation.")
#             return

#         print("✅ Updating Test Plan — generating test runs.")
#         frappe.msgprint("Updating Test Plan — generating Test Runs.")
#         self.create_test_runs_from_combinations()

#     def create_test_runs_from_combinations(self):
#         config_map = {}
#         print("➡️ Project:", self.project, "| Test Plan:", self.name)

    
#         if not self.configuration:
#             frappe.msgprint("⚠️ No configuration data found.")
#             return

#         # Group titles by configuration group
#         for child in self.configuration:
#             if child.configuration and child.title:
#                 config_map.setdefault(child.configuration, []).append(child.title)

#         if len(config_map) < 2:
#             frappe.msgprint("⚠️ Need at least 2 configuration groups for combinations.")
#             return

#         # Delete existing test runs linked to this test plan
#         existing_runs = frappe.get_all("Test Run", filters={"test_plan": self.name}, pluck="name")
#         # for run in existing_runs:
#         #     frappe.delete_doc("Test Run", run)

#         # Get today's date
#         today_str = frappe.utils.nowdate()  # YYYY-MM-DD
#         formatted_date = frappe.utils.formatdate(today_str, "dd-mm-yyyy")

#         # Get all test runs created today to determine the next tag number
#         today_runs = frappe.get_all(
#             "Test Run",
#             filters={"creation": ["like", f"{today_str}%"]},
#             fields=["title"]
#         )

#         # Extract max tag number for today
#         max_tag_num = 0
#         for t in today_runs:
#             if t.title and "Test Run" in t.title:
#                 try:
#                     tag_part = t.title.split("Test Run")[1].strip().split(" ")[0]
#                     tag_num = int(tag_part)
#                     max_tag_num = max(max_tag_num, tag_num)
#                 except:
#                     continue

#         next_tag_number = str(max_tag_num + 1).zfill(3)
#         shared_tag = f"Test Run {next_tag_number} ({formatted_date})"

#         # Create combinations
#         combos = list(product(*config_map.values()))
#         for combo in combos:
#             run_title_part = " - ".join(combo)
#             run_title = f"{run_title_part}"
#             test_run = frappe.new_doc("Test Run")
#             test_run.tag = f"{shared_tag}"
#             test_run.test_plan = self.name
#             test_run.title = run_title
#             test_run.project = self.project
#             test_run.insert(ignore_permissions=True)

#         frappe.msgprint(f"✅ Created {len(combos)} Test Run(s) with tag: <b>{shared_tag}</b>.")





from frappe.model.document import Document
from itertools import product
import frappe

class TestPlan(Document):
    def validate(self):
        # Only run logic if it's NOT a new document
        if self.get("__islocal"):
            print("🟡 New Test Plan — skipping test run creation.")
            return

        print("✅ Updating Test Plan — generating test runs.")
        frappe.msgprint("Updating Test Plan — generating Test Runs.")
        self.create_test_runs_from_combinations()

    def create_test_runs_from_combinations(self):
       configurations = [c.configuration for c in self.configuration]
       test_cases = [t.test_case for t in self.test_cases]

       if not configurations or not test_cases:
        return

       combos = list(product(configurations, test_cases))
       shared_tag = frappe.generate_hash("", 10)

       for combo in combos:
        run_title_part = " - ".join(combo)
        run_title = f"{run_title_part}"

        existing_run_name = frappe.db.get_value(
            "Test Run",
            {"test_plan": self.name, "title": run_title},
            "name"
        )

        if not existing_run_name:
        #     # Skip creation entirely
        #     frappe.msgprint(f"⚠️ Skipping creation of new Test Run for combo '{run_title}'")
            continue

        # Load the existing Test Run
        test_run = frappe.get_doc("Test Run", existing_run_name)

        # Collect existing test_cases in the Test Run
        existing_cases = {row.test_case for row in (test_run.test_cases or [])}

        # Append missing test cases if not present
        added_count = 0
        for tc in test_cases:
            if tc not in existing_cases:
                test_run.append("test_cases", {"test_case": tc})
                added_count += 1

        if added_count > 0:
            test_run.save(ignore_permissions=True)
            frappe.msgprint(f"✅ Added {added_count} test cases to Test Run {test_run.name}")
        else:
            frappe.msgprint(f"ℹ No new test cases to add for Test Run {test_run.name}")




