# import frappe

# @frappe.whitelist()
# def get_dashboard_data(user=None, project=None):
#     data = {}

#     # --------------------------
#     # 1. Test Plan Summary
#     # --------------------------
#     plan_filters = {}
#     if project:
#         plan_filters["project"] = project
#     if user:
#         plan_filters["owner"] = user   # or "assigned_to" if that's your field

#     total_plans = frappe.db.count("Test Plan", plan_filters)

#     active_plans = frappe.db.count("Test Plan", {**plan_filters, "workflow_state": "Active"}) \
#         if frappe.db.has_column("Test Plan", "workflow_state") else 0
#     completed_plans = frappe.db.count("Test Plan", {**plan_filters, "workflow_state": "Completed"}) \
#         if frappe.db.has_column("Test Plan", "workflow_state") else 0

#     data["test_plan_summary"] = {
#         "total": total_plans,
#         "active": active_plans,
#         "completed": completed_plans
#     }

#     # --------------------------
#     # 2. Test Case Summary
#     # --------------------------
#     where = []
#     values = {}

#     if project:
#         where.append("project = %(project)s")
#         values["project"] = project
#     if user:
#         where.append("owner = %(owner)s")
#         values["owner"] = user

#     where_clause = "WHERE " + " AND ".join(where) if where else ""

#     status_summary = {}
#     if frappe.db.has_column("Test Case", "status"):
#         status_counts = frappe.db.sql(f"""
#             SELECT status, COUNT(*) as count
#             FROM `tabTest Case`
#             {where_clause}
#             GROUP BY status
#         """, values, as_dict=True)
#         for row in status_counts:
#             status_summary[row["status"]] = row["count"]

#     priority_summary = {}
#     if frappe.db.has_column("Test Case", "priority"):
#         priority_counts = frappe.db.sql(f"""
#             SELECT priority, COUNT(*) as count
#             FROM `tabTest Case`
#             {where_clause}
#             GROUP BY priority
#         """, values, as_dict=True)
#         for row in priority_counts:
#             priority_summary[row["priority"]] = row["count"]

#     data["test_case_summary"] = {
#         "status": status_summary,
#         "priority": priority_summary
#     }

#     # --------------------------
#     # 3. Test Run Summary
#     # --------------------------
#     run_summary = {"Pass": 0, "Fail": 0, "Not Run": 0}

#     run_where = []
#     run_values = {}

#     if project:
#         run_where.append("project = %(project)s")
#         run_values["project"] = project
#     if user:
#         run_where.append("owner = %(owner)s")
#         run_values["owner"] = user

#     run_clause = "WHERE " + " AND ".join(run_where) if run_where else ""

#     if frappe.db.has_column("Test Run", "result"):
#         run_counts = frappe.db.sql(f"""
#             SELECT result, COUNT(*) as count
#             FROM `tabTest Run`
#             {run_clause}
#             GROUP BY result
#         """, run_values, as_dict=True)
#         for row in run_counts:
#             run_summary[row["result"]] = row["count"]

#     data["test_run_summary"] = run_summary

#     return data

# import frappe

# @frappe.whitelist()
# def get_dashboard_data(user=None, project=None):
#     data = {}
#     print('project ......',project)
#     print('user......',user)

#     # --------------------------
#     # 1. Test Plan Summary
#     # --------------------------
#     plan_filters = {}
#     if project:
#         plan_filters["project"] = project
    
#     total_plans = frappe.db.count("Test Plan", plan_filters)

#     data["test_plan_summary"] = {
#         "total": total_plans,
#         "active": 0,       
#         "completed": 0    
#     }

#     # --------------------------
#     # 2. Test Case Summary
#     # --------------------------
#     where = []
#     values = {}
#     if project:
#         where.append("project = %(project)s")
#         values["project"] = project

#     where_clause = "WHERE " + " AND ".join(where) if where else ""

#     # status
#     status_summary = {}
#     if frappe.db.has_column("Test Case", "status"):
#         status_counts = frappe.db.sql(f"""
#             SELECT status, COUNT(*) as count
#             FROM `tabTest Case`
#             {where_clause}
#             GROUP BY status
#         """, values, as_dict=True)
#         for row in status_counts:
#             status_summary[row["status"]] = row["count"]

#     # priority
#     priority_summary = {}
#     if frappe.db.has_column("Test Case", "priority"):
#         priority_counts = frappe.db.sql(f"""
#             SELECT priority, COUNT(*) as count
#             FROM `tabTest Case`
#             {where_clause}
#             GROUP BY priority
#         """, values, as_dict=True)
#         for row in priority_counts:
#             priority_summary[row["priority"]] = row["count"]

#     data["test_case_summary"] = {
#         "status": status_summary,
#         "priority": priority_summary
#     }

#     # --------------------------
#     # 3. Test Run Summary
#     # --------------------------
#     run_summary = {"Pass": 0, "Fail": 0, "Not Run": 0}

#     run_where = []
#     run_values = {}

#     if project:
#         run_where.append("project = %(project)s")
#         run_values["project"] = project
#     if user:
#         run_where.append("tester = %(tester)s")
#         run_values["tester"] = user

#     run_clause = "WHERE " + " AND ".join(run_where) if run_where else ""

#     if frappe.db.has_column("Test Run", "test_plan"):
#         run_counts = frappe.db.sql(f"""
#             SELECT test_plan, COUNT(*) as count
#             FROM `tabTest Run`
#             {run_clause}
#             GROUP BY test_plan
#         """, run_values, as_dict=True)
#         for row in run_counts:
#             run_summary[row["test_plan"]] = row["count"]

#     data["test_run_summary"] = {
#         "labels": list(run_summary.keys()),
#         "values": list(run_summary.values())
#     }

#     return data







import frappe

@frappe.whitelist()
def get_dashboard_data(user=None, project=None):
    data = {}
    print('user....',user)
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

    return data


