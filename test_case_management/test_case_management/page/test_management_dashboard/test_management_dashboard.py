import frappe

@frappe.whitelist()
def get_dashboard_data(user=None, project=None):
    data = {}
    print('user....', user)

    # --------------------------
    # 1. Total Test Plan Summary (all plans for project)
    # --------------------------
    plan_filters = {}
    if project:
        plan_filters["project"] = project

    total_plans_count = frappe.db.count("Test Plan", plan_filters)

    # Get total active/completed counts
    if project:
        plan_status_counts = frappe.db.sql("""
            SELECT status, COUNT(*) as count
            FROM `tabTest Plan`
            WHERE project = %s
            GROUP BY status
        """, (project,), as_dict=True)
    else:
        plan_status_counts = frappe.db.sql("""
            SELECT status, COUNT(*) as count
            FROM `tabTest Plan`
            GROUP BY status
        """, as_dict=True)

    active_count = sum(row["count"] for row in plan_status_counts if row["status"] == "Active")
    completed_count = sum(row["count"] for row in plan_status_counts if row["status"] == "Completed")

    data["test_plan_summary"] = {
        "total": total_plans_count,
        "active": active_count,
        "completed": completed_count
    }

    # --------------------------
    # 2. Test Case Summary (project filtered)
    # --------------------------
    where_clause = ""
    values = {}
    if project:
        where_clause = "WHERE project = %(project)s"
        values["project"] = project

    # Status summary
    status_summary = {}
    if frappe.db.has_column("Test Case", "status"):
        status_counts = frappe.db.sql(f"""
            SELECT status, COUNT(*) as count
            FROM `tabTest Case`
            {where_clause}
            GROUP BY status
        """, values, as_dict=True)
        for row in status_counts:
            status_summary[row["status"]] = row["count"]

    # Priority summary
    priority_summary = {}
    if frappe.db.has_column("Test Case", "priority"):
        priority_counts = frappe.db.sql(f"""
            SELECT priority, COUNT(*) as count
            FROM `tabTest Case`
            {where_clause}
            GROUP BY priority
        """, values, as_dict=True)
        for row in priority_counts:
            priority_summary[row["priority"]] = row["count"]

    data["test_case_summary"] = {
        "status": status_summary,
        "priority": priority_summary
    }

    # --------------------------
    # 3. Test Run Summary (user filtered if selected)
    # --------------------------
    run_where = []
    run_values = {}

    if project:
        run_where.append("project = %(project)s")
        run_values["project"] = project
    if user:
        run_where.append("tester = %(tester)s")
        run_values["tester"] = user

    run_clause = "WHERE " + " AND ".join(run_where) if run_where else ""

    run_summary = {}
    if frappe.db.has_column("Test Run", "test_plan"):
        run_counts = frappe.db.sql(f"""
            SELECT test_plan, COUNT(*) as count
            FROM `tabTest Run`
            {run_clause}
            GROUP BY test_plan
        """, run_values, as_dict=True)

        for row in run_counts:
            run_summary[row["test_plan"]] = row["count"]

    data["test_run_summary"] = {
        "labels": list(run_summary.keys()),
        "values": list(run_summary.values())
    }

    # --------------------------
    # 4. Update Test Plan summary based on user-selected Test Runs
    # --------------------------
    if user and run_summary:
        plan_names = list(run_summary.keys())
        placeholders = ', '.join(['%s'] * len(plan_names))
        user_plan_status_counts = frappe.db.sql(f"""
            SELECT status, COUNT(*) as count
            FROM `tabTest Plan`
            WHERE name IN ({placeholders})
            GROUP BY status
        """, tuple(plan_names), as_dict=True)

        total_user_plans = sum(row["count"] for row in user_plan_status_counts)
        active_user_plans = sum(row["count"] for row in user_plan_status_counts if row["status"] == "Active")
        completed_user_plans = sum(row["count"] for row in user_plan_status_counts if row["status"] == "Completed")

        data["test_plan_summary"] = {
            "total": total_user_plans,
            "active": active_user_plans,
            "completed": completed_user_plans
        }

        data["filtered_plan_names"] = plan_names
    else:
        data["filtered_plan_names"] = []

    return data


@frappe.whitelist()
def get_user_projects(user=None):
    """
    Return distinct projects from Test Run where tester = user
    """
    if not user:
        return []

    projects = frappe.db.sql("""
        SELECT DISTINCT tr.project as project,
                        tp.title as title
        FROM `tabTest Run` tr
        LEFT JOIN `tabTest Project` tp ON tr.project = tp.name
        WHERE tr.tester = %s AND tr.project IS NOT NULL
    """, (user,), as_dict=True)

    return projects
