// Copyright (c) 2025, Rutuja Somvanshi and contributors
// For license information, please see license.txt

const LOCKED_STATUSES = ["Draft", "Waiting For Approval"];


frappe.ui.form.on("Test Run", {
    refresh(frm) {

        const allowed_roles = ['Team Lead', 'Project Manager', 'System Manager'];
        const has_access = allowed_roles.some(role => frappe.user.has_role(role));

        if (!frm.is_new() && has_access) {
            frm.add_custom_button('Add Test Cases', () => {
                show_test_case_selector(frm);
            });
        }
 
        // Hide the default "Add Row" button
        frm.fields_dict['test_case'].grid.cannot_add_rows = true;
        frm.fields_dict['test_case'].grid.refresh();

        // Add your custom button
        frm.fields_dict['test_case'].grid.add_custom_button(
            __('+ Create Test Case'),
            function() {
                frappe.new_doc('Test Case', {
                    project: frm.doc.project,
                    test_run: frm.doc.name
                });
            }
        );

        frm.set_query("test_case", "test_case", function(doc, cdt, cdn) {
            return {
                filters: {
                    docstatus: 1,              // static filter
                    project: frm.doc.project   // dynamic filter from parent
                }
            };
        });

        fetch_test_case_states(frm).then(() => {
            block_approved_test_case_navigation(frm);
        });



        apply_all_row_rules(frm);
    },

    test_plan(frm) {
        if (frm.doc.test_plan) {
            frappe.db.get_value('Test Plan', frm.doc.test_plan, ['project', 'custom_module'])
                .then(r => {
                    if (r.message) {
                        if (r.message.project) {
                            frm.set_value('project', r.message.project);
                        }
                        if (r.message.custom_module) {
                            frm.set_value('custom_module', r.message.custom_module);
                        }
                    }
                });
        }
    }
});



frappe.ui.form.on('Test Run Case', {
    view_steps: function(frm, cdt, cdn) {
        const row = locals[cdt][cdn];

        if (!row.test_case) {
            frappe.msgprint(__('Please select a Test Case first.'));
            return;
        }

        // Fetch Test Case Steps from backend
        frappe.call({
            method: 'test_case_management.test_case_management.doctype.test_run.test_run.get_test_case_steps',
            args: { test_case: row.test_case },
            callback: function(r) {
                if (r.message && r.message.length) {
                    const stepStates = row.test_case_step_states ? JSON.parse(row.test_case_step_states) : {};

                    // Build HTML for steps
                    let html = `<div style="margin-top:10px;"><b>Test Case Steps:</b><form class="step-list-form"><ol style="padding-left: 20px;">`;

                    r.message.forEach(step => {
                        const stepTitle = step.title;
                        const checked = stepStates[stepTitle] ? "checked" : "";

                        html += `
                            <li style="margin-bottom:8px;">
                                <label>
                                    <input type="checkbox" data-step-title="${frappe.utils.escape_html(stepTitle)}" class="step-checkbox" style="margin-right:6px;" ${checked} />
                                    ${frappe.utils.escape_html(stepTitle)}
                                </label>
                            </li>`;
                    });

                    html += `</ol></form></div>`;

                    // Save HTML view content
                    frappe.model.set_value(cdt, cdn, 'test_case_steps_view', html);

                    // Access grid row's dialog
                    const grid = frm.get_field('test_case').grid;
                    const grid_row = grid.grid_rows_by_docname[row.name];

                    if (grid_row && grid_row.grid_form) {
                        const dialog = grid_row.grid_form;

                        if (dialog.fields_dict.test_case_steps_view) {
                            dialog.fields_dict.test_case_steps_view.$wrapper.html(html);

                            // Initial check to set is_steps_done if all are checked
                            let initialAllChecked = true;
                            dialog.fields_dict.test_case_steps_view.$wrapper.find('.step-checkbox').each(function () {
                                if (!$(this).is(':checked')) {
                                    initialAllChecked = false;
                                }
                            });
                            frappe.model.set_value(cdt, cdn, 'is_steps_done', initialAllChecked ? 1 : 0);

                            // On checkbox change, evaluate state
                            dialog.fields_dict.test_case_steps_view.$wrapper.find('.step-checkbox').on('change', function () {
                                const newStates = {};
                                let allChecked = true;

                                dialog.fields_dict.test_case_steps_view.$wrapper.find('.step-checkbox').each(function () {
                                    const stepTitle = $(this).data('step-title');
                                    const isChecked = $(this).is(':checked');
                                    newStates[stepTitle] = isChecked;
                                    if (!isChecked) {
                                        allChecked = false;
                                    }
                                });

                                frappe.model.set_value(cdt, cdn, 'test_case_step_states', JSON.stringify(newStates));
                                frappe.model.set_value(cdt, cdn, 'is_steps_done', allChecked ? 1 : 0);
                            });
                        }
                    }
                } else {
                    frappe.msgprint(__('No steps found for this Test Case.'));
                }
            }
        });
    },

    form_render(frm, cdt, cdn) {
        apply_row_rules(frm, cdt, cdn);
    },
});


function apply_all_row_rules(frm) {
    const rows = frm.doc.test_case || [];
    rows.forEach((row) => {
        apply_row_rules(frm, row.doctype, row.name);
    });
}

function apply_row_rules(frm, cdt, cdn) {
    const row = locals[cdt][cdn];
    const grid = frm.fields_dict["test_case"].grid;
    const grid_row = grid.grid_rows_by_docname
        ? grid.grid_rows_by_docname[cdn]
        : grid.grid_rows.find((r) => r.doc.name === cdn);

    if (!grid_row) return;

    const is_locked = LOCKED_STATUSES.includes(row.status);

    // 1. If NOT locked, strip the reserved statuses from the dropdown options
    const status_df = (grid_row.docfields || []).find((df) => df.fieldname === "status");
    if (status_df) {
        const base_options = frappe.meta
            .get_docfield(row.doctype, "status", row.parent)
            .options.split("\n")
            .filter(Boolean);

        status_df.options = is_locked
            ? base_options.join("\n")
            : base_options.filter((opt) => !LOCKED_STATUSES.includes(opt)).join("\n");
    }
}



//update test run file with test case table test case title
function show_test_case_selector(frm) {
    // Get existing test_case names in child table
    const existing_test_cases = (frm.doc.test_case || []).map(row => row.test_case);

    const multi_select_dialog = new frappe.ui.form.MultiSelectDialog({
        doctype: "Test Case",
        target: frm,
        size: 'large',
        setters: {
            project: frm.doc.project || '',
            custom_module: frm.doc.custom_module || ''
        },
        add_filters_group: 1,
        date_field: "creation",
        primary_action_label: "Add Test Cases",
        columns: ["test_case_id", "title"],

        get_query() {
            const dialog = this.dialog;
            const project = dialog.fields_dict.project?.get_value();
            const custom_module = dialog.fields_dict.custom_module?.get_value();
            return {
                query: "test_case_management.api.test_case.get_test_cases_query",
                filters: {
                    docstatus:1,
                    ...(project && { project }),
                    ...(custom_module && { custom_module })
                }
            };
        },

        action(selections) {
            // If selections is array of strings (names), else adjust this accordingly
            const to_add = selections.filter(tc_name => !existing_test_cases.includes(tc_name));

            if (to_add.length === 0) {
                frappe.msgprint("No new Test Cases selected.");
                return;
            }

            let remaining = to_add.length;

            to_add.forEach(tc_name => {
                frappe.db.get_value("Test Case", tc_name, "title").then(res => {
                    frm.add_child("test_case", {
                        test_case: tc_name,
                        test_case_title: res.message.title,
                        status: "Pending"
                    });
                    

                    remaining--;

                    if (remaining === 0) {
                         frm.refresh_field("test_case");
                       
                        frappe.msgprint(`${to_add.length} Test Case(s) added.`);
                        this.dialog.hide();
                    
                    }
            
                     
                });
            });
        }
    });


    frappe.after_ajax(() => {
        const dialog = multi_select_dialog.dialog;
        if (!dialog.fields_dict) return;

        const module_field = dialog.fields_dict.custom_module;
        if (module_field) {
            module_field.df.onchange = () => {
                console.log("custom_module changed");
                multi_select_dialog.get_results();
            };

            module_field.$input.on('keydown', (e) => {
                if (e.key === "Enter") {
                    multi_select_dialog.get_results();
                }
            });
        }

        const project_field = dialog.fields_dict.project;
        if (project_field) {
            project_field.df.read_only = 1;
            project_field.refresh();
        }
    });
}









function fetch_test_case_states(frm) {
    const rows = frm.doc.test_case || [];
    if (!rows.length) {
        frm._test_case_state_map = {};
        return Promise.resolve();
    }

    const names = [...new Set(rows.map(r => r.test_case).filter(Boolean))];
    if (!names.length) {
        frm._test_case_state_map = {};
        return Promise.resolve();
    }

    return frappe.db.get_list('Test Case', {
        filters: { name: ['in', names] },
        fields: ['name', 'workflow_state'],
        limit: names.length
    }).then(results => {
        frm._test_case_state_map = {};
        results.forEach(r => { frm._test_case_state_map[r.name] = r.workflow_state; });
    });
}

function block_approved_test_case_navigation(frm) {
    const $grid_wrapper = frm.fields_dict['test_case'].$wrapper;

    $grid_wrapper.off('click.block_approved_nav').on(
        'click.block_approved_nav',
        '[data-fieldname="test_case"] a',
        function(e) {
            const $row = $(this).closest('.grid-row, .grid-row-open');
            const docname = $row.attr('data-name');
            if (!docname) return;

            const row = locals['Test Run Case'] && locals['Test Run Case'][docname]; // adjust doctype name
            const state_map = frm._test_case_state_map || {};

            if (row && state_map[row.test_case] === "Approved") {
                e.stopPropagation();
                e.preventDefault();
                frappe.show_alert({
                    message: __('Approved Test Cases cannot be opened from here'),
                    indicator: 'orange'
                });
            }
        }
    );
}