// Copyright (c) 2025, Rutuja Somvanshi and contributors
// For license information, please see license.txt

// frappe.ui.form.on("Test Run", {
// 	refresh(frm) {

// 	},
// });

const LOCKED_STATUSES = ["Draft", "Waiting For Approval"];


frappe.ui.form.on("Test Run", {
    refresh(frm) {
        frm.set_query("test_case", "test_case", function(doc, cdt, cdn) {
            return {
                filters: {
                    docstatus: 1,              // static filter
                    project: frm.doc.project   // dynamic filter from parent
                }
            };
        });

        apply_all_row_rules(frm);
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
    const grid = frm.fields_dict["test_case"].grid;
    (grid.data || []).forEach((row) => {
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

