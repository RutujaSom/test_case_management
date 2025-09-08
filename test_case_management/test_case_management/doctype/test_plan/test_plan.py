import frappe
from frappe.model.document import Document
from itertools import product

class TestPlan(Document):
    def on_update(self):
        # Generate runs only for new configurations (first-time only)
        if getattr(self, "configuration", None):
            self.generate_or_sync_runs()

        # Map test cases to existing runs
        if getattr(self, "test_cases", None):
            self.map_test_cases_to_runs()

    def generate_or_sync_runs(self):
        """Generate Test Runs ONLY if none exist. 
        If deleted manually, they will never be recreated."""
        self._new_runs = []

        # If any Test Runs already exist, skip creation completely
        existing_runs = frappe.get_all(
            "Test Run",
            filters={"test_plan": self.name},
            fields=["name", "title"]
        )
        if existing_runs:
            return  # ✅ Don't recreate anything

        # Build configuration map
        config_map = {}
        for child in getattr(self, "configuration", []):
            if child.configuration and child.title:
                config_map.setdefault(child.configuration, []).append(child.title)

        if not config_map:
            return

        combos = list(product(*config_map.values()))
        all_titles = [" - ".join(combo) for combo in combos]

        # Create fresh runs only once
        for run_title in all_titles:
            run = frappe.get_doc({
                "doctype": "Test Run",
                "test_plan": self.name,
                "project": getattr(self, "project", None),
                "title": run_title
            })
            run.insert(ignore_permissions=True)

            # Append reference in child table
            self.append("test_runs", {
                "test_run": run.name,
                "test_run_title": run_title
            })
            self._new_runs.append(run.name)

        self.db_update_all()
        frappe.db.commit()

    def map_test_cases_to_runs(self):
        """Add new test cases to existing runs, skip newly created runs in same transaction"""
        runs = frappe.get_all(
            "Test Run",
            filters={"test_plan": self.name},
            pluck="name"
        )

        for run_name in runs:
            if hasattr(self, "_new_runs") and run_name in self._new_runs:
                continue

            test_run = frappe.get_doc("Test Run", run_name)
            existing_cases = {row.test_case for row in test_run.test_case}

            for tc in getattr(self, "test_cases", []):
                if tc.test_case not in existing_cases:
                    test_run.append("test_case", {
                        "test_case": tc.test_case,
                        "test_case_title": tc.test_case_title,
                        "status": "Pending"
                    })

            test_run.save(ignore_permissions=True)
