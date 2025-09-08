import frappe

@frappe.whitelist()
def get_dashboard_data(user=None, project=None):
    data = {}
    print("user....", user, "project....", project)

    # ---------------- Test Run Summary ----------------
    run_where, run_values = [], {}
    if project:
        run_where.append("project = %(project)s")
        run_values["project"] = project
    if user:
        run_where.append("tester = %(tester)s")
        run_values["tester"] = user
    run_clause = "WHERE " + " AND ".join(run_where) if run_where else ""

    run_summary = {}
    run_counts = frappe.db.sql(f"""
        SELECT test_plan, COUNT(*) as count
        FROM `tabTest Run`
        {run_clause}
        GROUP BY test_plan
    """, run_values, as_dict=True)

    run_plan_names = [row["test_plan"] for row in run_counts]

    for row in run_counts:
        run_summary[row["test_plan"]] = row["count"]

    data["test_run_summary"] = {
        "labels": list(run_summary.keys()),
        "values": list(run_summary.values())
    }

    # ---------------- Test Plan Summary ----------------
    plan_filters = {}
    if project:
        plan_filters["project"] = project

    if user and run_plan_names:
        plan_filters["name"] = ["in", run_plan_names]

    total_plans_count = frappe.db.count("Test Plan", plan_filters)

    active_count, completed_count = 0, 0
    if total_plans_count:
        where_clause = "WHERE 1=1"
        values = {}

        if project:
            where_clause += " AND project=%(project)s"
            values["project"] = project
        if user and run_plan_names:
            where_clause += " AND name in %(plans)s"
            values["plans"] = tuple(run_plan_names)

        plan_status_counts = frappe.db.sql(f"""
            SELECT status, COUNT(*) as count
            FROM `tabTest Plan`
            {where_clause}
            GROUP BY status
        """, values, as_dict=True)

        active_count = sum(r["count"] for r in plan_status_counts if r["status"] == "Active")
        completed_count = sum(r["count"] for r in plan_status_counts if r["status"] == "Completed")

    data["test_plan_summary"] = {
        "total": total_plans_count,
        "active": active_count,
        "completed": completed_count
    }

    # pass filtered plan names for card click filtering
    data["filtered_plan_names"] = run_plan_names if (user and run_plan_names) else []

    # ---------------- Test Case Summary ----------------
    where_clause = ""
    values = {}
    if project:
        where_clause = "WHERE project = %(project)s"
        values["project"] = project

    status_summary, priority_summary = {}, {}
    if frappe.db.has_column("Test Case", "status"):
        status_counts = frappe.db.sql(f"""
            SELECT status, COUNT(*) as count
            FROM `tabTest Case`
            {where_clause}
            GROUP BY status
        """, values, as_dict=True)
        status_summary = {r["status"]: r["count"] for r in status_counts}

    if frappe.db.has_column("Test Case", "priority"):
        priority_counts = frappe.db.sql(f"""
            SELECT priority, COUNT(*) as count
            FROM `tabTest Case`
            {where_clause}
            GROUP BY priority
        """, values, as_dict=True)
        priority_summary = {r["priority"]: r["count"] for r in priority_counts}

    data["test_case_summary"] = {"status": status_summary, "priority": priority_summary}

    return data


@frappe.whitelist()
def get_project_users(project=None):
    """
    Return distinct testers (full names) from Test Run.
    If no project is provided, return all active system users.
    """
    if project:
        users = frappe.db.sql("""
            SELECT DISTINCT tester
            FROM `tabTest Run`
            WHERE project = %s AND tester IS NOT NULL
        """, (project,), as_dict=True)

        return [
            {"tester": u["tester"], "full_name": frappe.utils.get_fullname(u["tester"])}
            for u in users if u.get("tester")
        ]
    else:
        users = frappe.get_all(
            "User",
            filters={"enabled": 1, "user_type": "System User"},
            fields=["name"]
        )
        return [
            {"tester": u["name"], "full_name": frappe.utils.get_fullname(u["name"])}
            for u in users
        ]
