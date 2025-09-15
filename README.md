<<<<<<< HEAD
### Library Management

Library management app for feappe-bench

### Installation

You can install this app using the [bench](https://github.com/frappe/bench) CLI:

```bash
cd $PATH_TO_YOUR_BENCH
bench get-app $URL_OF_THIS_REPO --branch develop
bench install-app library_management
```

### Contributing

This app uses `pre-commit` for code formatting and linting. Please [install pre-commit](https://pre-commit.com/#installation) and enable it for this repository:

```bash
cd apps/library_management
pre-commit install
```

Pre-commit is configured to use the following tools for checking and formatting your code:

- ruff
- eslint
- prettier
- pyupgrade

### CI

This app can use GitHub Actions for CI. The following workflows are configured:

- CI: Installs this app and runs unit tests on every push to `develop` branch.
- Linters: Runs [Frappe Semgrep Rules](https://github.com/frappe/semgrep-rules) and [pip-audit](https://pypi.org/project/pip-audit/) on every pull request.


### License

mit
# Recruitement
# Recruitement-model
=======
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
bench restart / bench start
>>>>>>> 0479305915b5b5b16b03ae45332e5f7946ba18fb
