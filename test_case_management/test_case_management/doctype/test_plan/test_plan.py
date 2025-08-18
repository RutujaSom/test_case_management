from frappe.model.document import Document
from itertools import product
import frappe

class TestPlan(Document):
    def on_update(self):
        # only when configurations exist
        if not self.configuration:
            # frappe.msgprint("⚠️ No configurations selected.")
            return

        # Step 1: build config_map
        config_map = {}
        for child in self.configuration:
            if child.configuration and child.title:
                config_map.setdefault(child.configuration, []).append(child.title)

        if not config_map:
            frappe.msgprint("⚠️ No valid configuration data found.")
            return

        # Step 2: generate config combinations
        combos = list(product(*config_map.values()))

        for combo in combos:
            run_title = " - ".join(combo)

            # Step 3: check if run already exists
            existing_run = frappe.get_all(
                "Test Run",
                filters={"test_plan": self.name, "title": run_title},
                limit=1,
                pluck="name"
            )

            if existing_run:
                test_run = frappe.get_doc("Test Run", existing_run[0])
            else:
                test_run = frappe.new_doc("Test Run")
                test_run.test_plan = self.name
                test_run.project = self.project
                test_run.title = run_title

            # Step 4: attach test cases (old + new)
            existing_cases = {row.test_case for row in test_run.test_case}

            for tc in self.test_cases or []:
                if tc.test_case not in existing_cases:
                    test_run.append("test_case", {
                        "test_case": tc.test_case,
                        "test_case_title": tc.test_case_title,
                        "status": "Pending"
                    })

            test_run.save(ignore_permissions=True)

        frappe.msgprint(f"✅ Synced {len(combos)} Test Run(s) with mapped Test Cases.")


