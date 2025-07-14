# # Copyright (c) 2025, Rutuja Somvanshi
# # For license information, please see license.txt

# from frappe.model.document import Document
# from itertools import product
# import frappe
# import datetime

# class TestPlan(Document):
#     def validate(self):
#         print()
#         # Only run logic if it's NOT a new document
#         if self.get("__islocal"):
#             print("🟡 New doc — skipping test run creation.")
#             return

#         print("✅ Updating existing Test Plan — generating test runs.")
#         frappe.msgprint("Updating Test Plan — generating Test Runs.")
#         self.create_test_runs_from_combinations()

#     def create_test_runs_from_combinations(self):
#         config_map = {}
#         print("self ...project ",self.project,".....", self.name)

#         if not self.configuration:
#             frappe.msgprint("⚠️ No configuration data found.")
#             return

#         for child in self.configuration:
#             if child.configuration and child.title:
#                 config_map.setdefault(child.configuration, []).append(child.title)

#         if len(config_map) < 2:
#             frappe.msgprint("⚠️ Need at least 2 configuration groups for combinations.")
#             return

#         # Optional: delete old test runs
#         existing_runs = frappe.get_all("Test Run", filters={"test_plan": self.name}, pluck="name")
#         # for run in existing_runs:
#         #     frappe.delete_doc("Test Run", run)

#         combos = list(product(*config_map.values()))
#         tag = datetime.datetime.date
#         print('tag ....',tag)
#         for combo in combos:
#             run_title = " - ".join(combo)
#             test_run = frappe.new_doc("Test Run")
#             test_run.test_plan = self.name
#             test_run.title = run_title
#             test_run.project = self.project
#             test_run.insert(ignore_permissions=True)

#         frappe.msgprint(f"✅ Created {len(combos)} Test Run(s).")




# Copyright (c) 2025, Rutuja Somvanshi
# For license information, please see license.txt

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
        config_map = {}
        print("➡️ Project:", self.project, "| Test Plan:", self.name)
# Copyright (c) 2025, Rutuja Somvanshi
# # For license information, please see license.txt

# from frappe.model.document import Document
# from itertools import product
# import frappe
# import datetime

# class TestPlan(Document):
#     def validate(self):
#         print()
#         # Only run logic if it's NOT a new document
#         if self.get("__islocal"):
#             print("🟡 New doc — skipping test run creation.")
#             return

#         print("✅ Updating existing Test Plan — generating test runs.")
#         frappe.msgprint("Updating Test Plan — generating Test Runs.")
#         self.create_test_runs_from_combinations()

#     def create_test_runs_from_combinations(self):
#         config_map = {}
#         print("self ...project ",self.project,".....", self.name)

#         if not self.configuration:
#             frappe.msgprint("⚠️ No configuration data found.")
#             return

#         for child in self.configuration:
#             if child.configuration and child.title:
#                 config_map.setdefault(child.configuration, []).append(child.title)

#         if len(config_map) < 2:
#             frappe.msgprint("⚠️ Need at least 2 configuration groups for combinations.")
#             return

#         # Optional: delete old test runs
#         existing_runs = frappe.get_all("Test Run", filters={"test_plan": self.name}, pluck="name")
#         # for run in existing_runs:
#         #     frappe.delete_doc("Test Run", run)

#         combos = list(product(*config_map.values()))
#         tag = datetime.datetime.date
#         print('tag ....',tag)
#         for combo in combos:
#             run_title = " - ".join(combo)
#             test_run = frappe.new_doc("Test Run")
#             test_run.test_plan = self.name
#             test_run.title = run_title
#             test_run.project = self.project
#             test_run.insert(ignore_permissions=True)

#         frappe.msgprint(f"✅ Created {len(combos)} Test Run(s).")

    
        if not self.configuration:
            frappe.msgprint("⚠️ No configuration data found.")
            return

        # Group titles by configuration group
        for child in self.configuration:
            if child.configuration and child.title:
                config_map.setdefault(child.configuration, []).append(child.title)

        if len(config_map) < 2:
            frappe.msgprint("⚠️ Need at least 2 configuration groups for combinations.")
            return

        # Delete existing test runs linked to this test plan
        existing_runs = frappe.get_all("Test Run", filters={"test_plan": self.name}, pluck="name")
        # for run in existing_runs:
        #     frappe.delete_doc("Test Run", run)

        # Get today's date
        today_str = frappe.utils.nowdate()  # YYYY-MM-DD
        formatted_date = frappe.utils.formatdate(today_str, "dd-mm-yyyy")

        # Get all test runs created today to determine the next tag number
        today_runs = frappe.get_all(
            "Test Run",
            filters={"creation": ["like", f"{today_str}%"]},
            fields=["title"]
        )

        # Extract max tag number for today
        max_tag_num = 0
        for t in today_runs:
            if t.title and "Test Run" in t.title:
                try:
                    tag_part = t.title.split("Test Run")[1].strip().split(" ")[0]
                    tag_num = int(tag_part)
                    max_tag_num = max(max_tag_num, tag_num)
                except:
                    continue

        next_tag_number = str(max_tag_num + 1).zfill(3)
        shared_tag = f"Test Run {next_tag_number} ({formatted_date})"

        # Create combinations
        combos = list(product(*config_map.values()))
        for combo in combos:
            run_title_part = " - ".join(combo)
            run_title = f"{run_title_part}"
            test_run = frappe.new_doc("Test Run")
            test_run.tag = f"{shared_tag}"
            test_run.test_plan = self.name
            test_run.title = run_title
            test_run.project = self.project
            test_run.insert(ignore_permissions=True)

        frappe.msgprint(f"✅ Created {len(combos)} Test Run(s) with tag: <b>{shared_tag}</b>.")
