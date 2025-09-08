

frappe.pages['test_management_dashboard'].on_page_load = function(wrapper) {
    var page = frappe.ui.make_app_page({
        parent: wrapper,
        title: 'Test Management Dashboard',
        single_column: true
    });

    let dashboard = $(`<div class="dashboard-container container mt-4">`).appendTo(page.body);

    // --- Filters Row ---
    let filter_row = $(`
        <div class="row filters-row mb-4">
            <div class="col-md-3">
                <label>Project</label>
                <select id="filter-project" class="form-control">
                    <option value="">All Projects</option>
                </select>
            </div>
            <div class="col-md-3">
                <label>User</label>
                <select id="filter-user" class="form-control">
                    <option value="">All Users</option>
                </select>
            </div>
            <div class="col-md-2 d-flex align-items-end">
                <button class="btn btn-primary w-100" id="apply-filters">Apply</button>
            </div>
        </div>
    `).appendTo(dashboard);

    // --- Dashboard Sections ---
    let plan_section = $('<div class="dashboard-section mb-5">').appendTo(dashboard);
    plan_section.html(`
        <h3 class="mb-3"> Test Plan Summary</h3>
        <div class="plan-cards row text-center" id="test-plan-cards"></div>
    `);

    let case_section = $('<div class="dashboard-section mb-5">').appendTo(dashboard);
    case_section.html(`
        <h3 class="mb-3"> Test Case Summary</h3>
        <div class="row">
            <div class="col-md-6">
                <h5>Status</h5>
                <div id="test-case-status-pie" style="height: 250px;"></div>
            </div>
            <div class="col-md-6">
                <h5>Priority</h5>
                <div id="test-case-priority-pie" style="height: 250px;"></div>
            </div>
        </div>
    `);

    let run_section = $('<div class="dashboard-section">').appendTo(dashboard);
    run_section.html(`
        <h3 class="mb-3">Test Run Summary</h3>
        <div id="test-run-bar" style="height: 300px;"></div>
    `);

    let testCaseStatusChart = null;
    let testCasePriorityChart = null;
    let testRunChart = null;

    function loadFilters() {
        loadProjects();
        loadUsers("");

        $("#filter-project").on("change", function() {
            let selectedProject = $(this).val();
            loadUsers(selectedProject);
            loadDashboardData("", selectedProject);
        });
    }

    function loadProjects() {
        let $proj = $("#filter-project");
        $proj.empty().append(`<option value="">All Projects</option>`);
        frappe.call({
            method: "frappe.client.get_list",
            args: {
                doctype: "Test Project",
                fields: ["name","title"]
            },
            callback: function(r) {
                if (r.message) {
                    r.message.forEach(p => {
                        $proj.append(`<option value="${p.name}">${p.title}</option>`);
                    });
                }
            }
        });
    }

    function loadUsers(project) {
        let $user = $("#filter-user");
        $user.empty().append(`<option value="">All Users</option>`);
        frappe.call({
            method: "test_case_management.test_case_management.page.test_management_dashboard.test_management_dashboard.get_project_users",
            args: { project: project || "" },
            callback: function(r) {
                if (r.message) {
                    r.message.forEach(u => {
                        $user.append(`<option value="${u.tester}">${u.full_name}</option>`);
                    });
                }
            }
        });
    }

    function loadDashboardData(user, project) {
        frappe.call({
            method: "test_case_management.test_case_management.page.test_management_dashboard.test_management_dashboard.get_dashboard_data",
            args: { user: user || "", project: project || "" },
            callback: function(r) {
                if (!r.message) return;
                let data = r.message;

                // --- Test Plan Summary Cards ---
                $('#test-plan-cards').html(`
                    <div class="col-md-4">
                        <div class="card shadow-sm p-3 mb-3 text-center dashboard-card" data-doctype="Test Plan" data-status="">
                            <h6>Total Plans</h6>
                            <h3 class="text-primary">${data.test_plan_summary.total}</h3>
                        </div>
                    </div>
                    <div class="col-md-4">
                        <div class="card shadow-sm p-3 mb-3 text-center dashboard-card" data-doctype="Test Plan" data-status="Active">
                            <h6>Active</h6>
                            <h3 class="text-success">${data.test_plan_summary.active}</h3>
                        </div>
                    </div>
                    <div class="col-md-4">
                        <div class="card shadow-sm p-3 mb-3 text-center dashboard-card" data-doctype="Test Plan" data-status="Completed">
                            <h6>Completed</h6>
                            <h3 class="text-info">${data.test_plan_summary.completed}</h3>
                        </div>
                    </div>
                `);

                // --- Make Cards Clickable ---
                $('.dashboard-card').off("click").on("click", function() {
                    let doctype = $(this).data("doctype");
                    let status = $(this).data("status");
                    let filters = {};
                    let project = $('#filter-project').val();
                    let user = $('#filter-user').val();

                    if (project) filters["project"] = project;
                    if (status) filters["status"] = status; // only apply if not total

                    if (user && data.filtered_plan_names && data.filtered_plan_names.length) {
                        filters["name"] = ["in", data.filtered_plan_names];
                    }

                    frappe.set_route("List", doctype, filters);
                });

                // --- Test Case Summary (Charts) ---
                let s = data.test_case_summary.status || {};
                if (testCaseStatusChart) testCaseStatusChart.destroy();
                if (Object.keys(s).length) {
                    testCaseStatusChart = new frappe.Chart("#test-case-status-pie", {
                        data: { labels: Object.keys(s), datasets: [{ name: "Test Cases", values: Object.values(s) }] },
                        type: 'pie',
                        height: 300
                    });
                } else {
                    $("#test-case-status-pie").html("<p class='text-muted'>No Data</p>");
                }

                let p = data.test_case_summary.priority || {};
                if (testCasePriorityChart) testCasePriorityChart.destroy();
                if (Object.keys(p).length) {
                    testCasePriorityChart = new frappe.Chart("#test-case-priority-pie", {
                        data: { labels: Object.keys(p), datasets: [{ name: "Test Cases", values: Object.values(p) }] },
                        type: 'pie',
                        height: 300
                    });
                } else {
                    $("#test-case-priority-pie").html("<p class='text-muted'>No Data</p>");
                }

                // --- Test Run Summary (Bar) ---
                let runs = data.test_run_summary || {};
                if (testRunChart) testRunChart.destroy();
                if (runs.labels && runs.values && runs.values.length) {
                    testRunChart = new frappe.Chart("#test-run-bar", {
                        data: { labels: runs.labels, datasets: [{ name: "Test Runs", values: runs.values }] },
                        type: 'bar',
                        height: 250
                    });
                } else {
                    $("#test-run-bar").html("<p class='text-muted'>No Runs Found</p>");
                }
            }
        });
    }

    $('#apply-filters').on('click', function() {
        let user = $('#filter-user').val();
        let project = $('#filter-project').val();
        loadDashboardData(user, project);
    });

    loadFilters();
    loadDashboardData();
};

