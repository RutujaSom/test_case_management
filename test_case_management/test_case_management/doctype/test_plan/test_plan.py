
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

        # Refresh list of test runs before creating new ones
        self.refresh_test_runs_list()

        # Create new ones if needed
        self.create_test_runs_from_combinations()

    def refresh_test_runs_list(self):
        """Clears and reloads the Test Runs child table from existing Test Run records."""
        self.set("test_runs", [])
        existing_runs = frappe.get_all(
            "Test Run",
            filters={"test_plan": self.name},
            fields=["name", "title", "tag"],
            order_by="creation asc"
        )
        for run in existing_runs:
            self.append("test_runs", {
                "test_run": run.name,                # Store ID internally
                "test_run_title": run.title,         # Display title in table
                "tag": run.tag
            })

    def create_test_runs_from_combinations(self):
        config_map = {}
        print("➡️ Project:", self.project, "| Test Plan:", self.name)

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

        # Get today's date
        today_str = frappe.utils.nowdate()
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
        created_count = 0

        for combo in combos:
            run_title_part = " - ".join(combo)
            run_title = f"{run_title_part}"

            # Check if a test run already exists for this combo
            existing_run = frappe.get_all(
                "Test Run",
                filters={
                    "test_plan": self.name,
                    "project": self.project,
                    "title": run_title
                },
                limit=1
            )

            if existing_run:
                print(f"⚠️ Skipping existing Test Run: {run_title}")
                continue  # Skip creating duplicate

            # Create a new test run (ERPNext will auto-add test cases here)
            test_run = frappe.new_doc("Test Run")
            test_run.tag = shared_tag
            test_run.test_plan = self.name
            test_run.title = run_title
            test_run.project = self.project
            test_run.insert(ignore_permissions=True)

            # Remove the auto-added test case(s)
            test_run.set("test_cases", [])
            test_run.save(ignore_permissions=True)

            created_count += 1

            # Append it to the child table (title shown instead of ID)
            self.append("test_runs", {
                "test_run": test_run.name,            # Keep ID for linking
                "test_run_title": test_run.title,     # Show title in table
                "tag": test_run.tag
            })

        if created_count:
            frappe.msgprint(
                f"✅ Created {created_count} new Test Run(s) with tag: <b>{shared_tag}</b>."
            )





