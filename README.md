# Test Case Management

A Frappe app to manage software test cases, test plans, and test runs efficiently within the Frappe framework.

---

## 📦 Prerequisites

- Python 3.10+
- Frappe Framework (v14+ or compatible)
- Bench CLI
- Node.js & Yarn (for asset building)

Make sure you have Frappe installed and at least one site created using:

```bash
bench init frappe-bench --frappe-branch version-14
cd frappe-bench
bench new-site your-site-name

🚀 Installation

1. Get the app
bench get-app https://github.com/RutujaSom/test_case_management.git

2. Install the app on your site
bench --site your-site-name install-app test_case_management

3. Migrate to apply schema changes
bench --site your-site-name migrate

4. Build assets (optional)
bench build

🔁 Restart Bench
bench restart
