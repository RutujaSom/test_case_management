frappe.pages['test_management_dashboard'].on_page_load = function(wrapper) {
    var page = frappe.ui.make_app_page({
        parent: wrapper,
        title: 'Test Management Dashboard',
        single_column: true
    });

    // Dashboard container
    let dashboard = $(`<div class="dashboard-container container mt-4">`).appendTo(page.body);

    // --- Filters Row ---
    let filter_row = $(`
        <div class="row filters-row mb-4">
            <div class="col-md-3">
                <label>User</label>
                <select id="filter-user" class="form-control">
                    <option value="">All Users</option>
                </select>
            </div>
            <div class="col-md-3">
                <label>Project</label>
                <select id="filter-project" class="form-control">
                    <option value="">All Projects</option>
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

    // --- Global chart references ---
    let testCaseStatusChart = null;
    let testCasePriorityChart = null;
    let testRunChart = null;

    // --- Load filter options (Users + Projects) ---
    function loadFilters() {
        // Users
        frappe.call({
            method: "frappe.client.get_list",
            args: {
                doctype: "User",
                fields: ["name"],
                filters: { enabled: 1 }
            },
            callback: function(r) {
                if (r.message) {
                    let $user = $("#filter-user");
                    r.message.forEach(u => {
                        $user.append(`<option value="${u.name}">${u.name}</option>`);
                    });

                    // When user changes, reload projects accordingly
                    $user.on("change", function() {
                        let selectedUser = $(this).val();
                        loadProjects(selectedUser);
                    });
                }
            }
        });

        // Initial load → all projects
        loadProjects();
    }

    // --- Load Projects ---
    function loadProjects(user) {
        let $proj = $("#filter-project");
        $proj.empty();
        $proj.append(`<option value="">All Projects</option>`);

        if (!user || user === "Administrator") {
            // Show all projects
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
        } else {
            // Show only projects linked to that user
            frappe.call({
                method: "test_case_management.test_case_management.page.test_management_dashboard.test_management_dashboard.get_user_projects",
                args: { user: user },
                callback: function(r) {
                    if (r.message) {
                        r.message.forEach(p => {
                            $proj.append(`<option value="${p.project}">${p.title || p.project}</option>`);
                        });
                    }
                }
            });
        }
    }

    // --- Load Dashboard Data ---
    function loadDashboardData(user, project) {
        frappe.call({
            method: "test_case_management.test_case_management.page.test_management_dashboard.test_management_dashboard.get_dashboard_data",
            args: { user: user || "", project: project || "" },
            callback: function(r) {
                if (!r.message) return;
                let data = r.message;

                // --- Test Plan Summary ---
                $('#test-plan-cards').html(`
                    <div class="col-md-4">
                        <div class="card shadow-sm p-3 mb-3 text-center dashboard-card" data-doctype="Test Plan">
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

                // --- Make cards clickable ---
                $('.dashboard-card').off("click").on("click", function() {
                    let doctype = $(this).data("doctype");
                    let status = $(this).data("status");
                    let filters = {};
                    let project = $('#filter-project').val();
                    let user = $('#filter-user').val();

                    if (project) filters["project"] = project;
                    if (status) filters["status"] = status;

                    // If user is selected, apply filtered_plan_names
                    if (user && data.filtered_plan_names && data.filtered_plan_names.length) {
                        filters["name"] = ["in", data.filtered_plan_names];
                    }

                    frappe.set_route("List", doctype, filters);
                });

                // --- Test Case Summary (Status Pie) ---
                let s = data.test_case_summary.status || {};
                if (testCaseStatusChart) testCaseStatusChart.destroy();
                if (Object.keys(s).length) {
                    testCaseStatusChart = new frappe.Chart("#test-case-status-pie", {
                        data: {
                            labels: Object.keys(s),
                            datasets: [{ name: "Test Cases", values: Object.values(s) }]
                        },
                        type: 'pie',
                        height: 300,
                        colors: ['#28a745', '#dc3545', '#6c757d', '#ffc107']
                    });

                    testCaseStatusChart.parent.addEventListener('data-select', (e) => {
                        let status = Object.keys(s)[e.index];
                        let filters = {};
                        let project = $('#filter-project').val();
                        if (project) filters["project"] = project;
                        filters["status"] = status;
                        frappe.set_route("List", "Test Case", filters);
                    });
                } else {
                    $("#test-case-status-pie").html("<p class='text-muted'>No Data</p>");
                }

                // --- Test Case Summary (Priority Pie) ---
                let p = data.test_case_summary.priority || {};
                if (testCasePriorityChart) testCasePriorityChart.destroy();
                if (Object.keys(p).length) {
                    testCasePriorityChart = new frappe.Chart("#test-case-priority-pie", {
                        data: {
                            labels: Object.keys(p),
                            datasets: [{ name: "Test Cases", values: Object.values(p) }]
                        },
                        type: 'pie',
                        height: 300,
                        colors: ['#dc3545', '#ffc107', '#6c757d']
                    });

                    testCasePriorityChart.parent.addEventListener('data-select', (e) => {
                        let priority = Object.keys(p)[e.index];
                        let filters = {};
                        let project = $('#filter-project').val();
                        if (project) filters["project"] = project;
                        filters["priority"] = priority;
                        frappe.set_route("List", "Test Case", filters);
                    });
                } else {
                    $("#test-case-priority-pie").html("<p class='text-muted'>No Data</p>");
                }

                // --- Test Run Summary (Bar Chart) ---
                let runs = data.test_run_summary || {};
                if (testRunChart) testRunChart.destroy();

                if (runs.labels && runs.values && runs.values.length) {
                    testRunChart = new frappe.Chart("#test-run-bar", {
                        data: {
                            labels: runs.labels,
                            datasets: [
                                {
                                    name: "Test Runs",
                                    values: runs.values
                                }
                            ]
                        },
                        type: 'bar',
                        height: 250,
                        colors: ['#28a745', '#dc3545', '#6c757d']
                    });

                    testRunChart.parent.addEventListener('data-select', (e) => {
                        let selectedPlan = runs.labels[e.index];
                        let filters = {};
                        let project = $('#filter-project').val();
                        if (project) filters["project"] = project;
                        filters["test_plan"] = selectedPlan;
                        frappe.set_route("List", "Test Run", filters);
                    });
                } else {
                    $("#test-run-bar").html("<p class='text-muted'>No Runs Found</p>");
                }

            }
        });
    }

    // --- Apply Filters ---
    $('#apply-filters').on('click', function() {
        let user = $('#filter-user').val();
        let project = $('#filter-project').val();
        loadDashboardData(user, project);
    });

    // Load filters & Initial Dashboard Data
    loadFilters();
    loadDashboardData();
};
