
// update test case name and title
frappe.ui.form.on('Test Plan', {
    refresh(frm) {
        if (!frm.is_new()) {
            frm.add_custom_button("Select Configurations", () => {
                show_configurations_dialog(frm);
            });

            if ((frm.doc.configuration || []).length > 0) {
                frm.add_custom_button("Add Test Cases", () => {
                    show_test_case_selector(frm);
                });
            }
        }
    },

    after_save(frm) {
    // Only run if there are test cases
    if (!(frm.doc.test_cases || []).length) {
        return;
    }

    frappe.call({
        method: "frappe.client.get_list",
        args: {
            doctype: "Test Run",
            filters: { test_plan: frm.doc.name },
            fields: ["name"],
            limit_page_length: 1
        }
    }).then(res => {
        if (res.message?.length) {
            // ✅ Update existing Test Run
            const run_name = res.message[0].name;
            frappe.call({
                method: "frappe.client.get",
                args: { doctype: "Test Run", name: run_name }
            }).then(run_res => {
                let run_doc = run_res.message;
                if (!Array.isArray(run_doc.test_case)) {
                    run_doc.test_case = [];
                }

                let existing_keys = new Set(
                    run_doc.test_case.map(row =>
                        `${(row.test_case || "").trim()}__${(row.configuration || "").trim()}`
                    )
                );
            

                let added_count = 0;
                (frm.doc.test_cases || []).forEach(tc => {
                    const key = `${(tc.test_case || "").trim()}__${(tc.configuration || "").trim()}`;
                    
                    if (!existing_keys.has(key)) {
                        run_doc.test_case.push({
                            doctype: "Test Run Case",
                            parent: run_doc.name,
                            parenttype: "Test Run",
                            parentfield: "test_case",
                            test_case: tc.test_case,
                            test_case_title: tc.test_case_title,
                            configuration: tc.configuration,
                            status: "Pending"
                        });
                        existing_keys.add(key);
                        added_count++;
                    }
                });

                if (added_count > 0) {
                    // run_doc.test_cases = run_doc.test_cases.filter(tc => tc && tc.test_case);

                    frappe.call({
                        method: "frappe.client.save",
                        args: { doc: run_doc }
                    }).then(() => {
                         frappe.msgprint(`✅ Updated Test Run <a href="/app/test-run/${run_doc.name}" target="_blank">${run_doc.name}</a> with ${added_count} new Test Cases.`);
                    });
                }
            });
        } else {
            frappe.msgprint("⚠ No Test Run found for this Test Plan. Please create it first via 'Select Configurations'.");
        }
    });
}

                });
            
        



// ---------------------- Configuration Selection ----------------------
function show_configurations_dialog(frm) {
    const existingTitles = (frm.doc.configuration || []).map(row => row.title);

    frappe.call({
        method: "frappe.client.get_list",
        args: {
            doctype: "Configuration",
            fields: ["name", "title"]
        },
        callback: function (r) {
            const configs = r.message;

            const d = new frappe.ui.Dialog({
                title: 'Select Configurations and Children',
                fields: [{ fieldtype: 'HTML', fieldname: 'config_section' }],
                primary_action_label: 'OK',
                primary_action() {
                    frm.clear_table("configuration");

                    d.$wrapper.find('.group-child-checkbox:checked').each(function () {
                        const title = $(this).data('title');
                        const config_name = $(this).data('config');
                        let row = frm.add_child("configuration");
                        row.title = title;
                        row.configuration = config_name;
                    });

                    frm.refresh_field("configuration");
                    d.hide();
                    frm.save().then(() => frm.reload_doc());
                }
            });

            d.show();

            const configPromises = configs.map(cfg =>
                frappe.call({
                    method: "frappe.client.get",
                    args: { doctype: "Configuration", name: cfg.name }
                }).then(res => ({
                    config: cfg,
                    children: res.message.group_child || []
                }))
            );

            Promise.all(configPromises).then(results => {
                const html = results.map(({ config, children }) => {
                    const allSelected = children.length > 0 && children.every(child =>
                        existingTitles.includes(child.title)
                    );

                    const config_checkbox = `
                        <div>
                            <label>
                                <input type="checkbox" class="config-checkbox" data-config="${config.name}"
                                    ${allSelected ? 'checked' : ''}>
                                <strong>${config.title || config.name}</strong>
                            </label>
                        </div>
                    `;

                    const children_html = children.map(child => {
                        const isChecked = existingTitles.includes(child.title);
                        return `
                            <div style="margin-left: 20px;">
                                <input type="checkbox" class="group-child-checkbox"
                                    data-title="${child.title}"
                                    data-config="${config.name}"
                                    id="chk-${config.name}-${child.title}"
                                    ${isChecked ? 'checked' : ''}>
                                <label for="chk-${config.name}-${child.title}">${child.title}</label>
                            </div>
                        `;
                    }).join("");

                    return `
                        <div style="margin-bottom: 15px;">
                            ${config_checkbox}
                            <div class="child-container" id="children-${config.name}">
                                ${children_html}
                            </div>
                        </div>
                    `;
                }).join("");

                d.get_field('config_section').$wrapper.html(html);

                d.$wrapper.on('change', '.config-checkbox', function () {
                    const config_name = $(this).data('config');
                    $(`#children-${config_name} .group-child-checkbox`).prop('checked', this.checked);
                });

                d.$wrapper.on('change', '.group-child-checkbox', function () {
                    const config_name = $(this).data('config');
                    const all_children = $(`#children-${config_name} .group-child-checkbox`);
                    const all_checked = all_children.length === all_children.filter(':checked').length;
                    $(`.config-checkbox[data-config="${config_name}"]`).prop('checked', all_checked);
                });
            });
        }
    });
}

// ---------------------- Test Case Selection ----------------------
function show_test_case_selector(frm) {
    const selected_configurations = (frm.doc.configuration || []).map(row => row.configuration);

    if (!selected_configurations?.length) {
        frappe.msgprint("Please add configurations before selecting test cases.");
        return;
    }

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
        columns: ["test_case_id", "title"],
        primary_action_label: "Add Test Cases",

        get_query() {
            const dialog = multi_select_dialog.dialog;
            const project = dialog.fields_dict.project?.get_value() || frm.doc.project;
            const custom_module = dialog.fields_dict.custom_module?.get_value() || frm.doc.custom_module;

            return {
                query: "test_case_management.api.test_case.get_test_cases_query",
                filters: {
                    ...(project && { project }),
                    ...(custom_module && { custom_module })
                }
            };
        },

        action(selections) {
            if (!selections?.length) {
                frappe.msgprint("Please select at least one Test Case.");
                return;
            }

            // Clear the table so we only keep the newly selected ones
            frm.clear_table("test_cases");

            frappe.call({
                method: "frappe.client.get_list",
                args: {
                    doctype: "Test Case",
                    filters: { name: ["in", selections] },
                    fields: ["name", "title"]
                },
                callback: function (res) {
                    const test_case_map = {};
                    (res.message || []).forEach(tc => {
                        test_case_map[tc.name] = tc.title;
                    });

                    selections.forEach(tc_name => {
                        const title = test_case_map[tc_name] || "";
                        selected_configurations.forEach(cfg => {
                            frm.add_child("test_cases", {
                                test_case: tc_name,
                                test_case_title: title,
                                configuration: cfg
                            });
                        });
                    });

                    frm.refresh_field("test_cases");
                    frappe.show_alert({ message: `${selections.length} Test Case(s) added.`, indicator: 'green' });

                    // Push to backend so Test Run also gets updated
                    frappe.call({
                        method: "test_case_management.api.test_run.add_test_cases_to_existing_run",
                        args: {
                            configurations: selected_configurations,
                            test_cases: selections,
                            test_plan:""
                        }
                    });

                    multi_select_dialog.dialog.hide();
                }
            });
        }
    });



    frappe.after_ajax(() => {
        const dialog = multi_select_dialog.dialog;
        if (!dialog.fields_dict) return;

        const module_field = dialog.fields_dict.custom_module;
        if (module_field) {
            module_field.df.onchange = () => multi_select_dialog.get_results();
            module_field.$input.on('keydown', e => {
                if (e.key === "Enter") multi_select_dialog.get_results();
            });
        }

        const project_field = dialog.fields_dict.project;
        if (project_field) {
            project_field.df.read_only = 1;
            project_field.refresh();
        }
    });
}

