frappe.ui.form.on('Test Plan', {
    refresh(frm) {
        if (!frm.is_new()) {
            // Button to select configurations
            frm.add_custom_button("Select Configurations", () => {
                show_configurations_dialog(frm);
            });

            // Button to add test cases only if configurations exist
            if ((frm.doc.configuration || []).length > 0) {
                frm.add_custom_button("Add Test Cases", () => {
                    show_test_case_selector(frm);
                });
            }
        }
    },

    before_save(frm) {
        // Temporary object to store selected test cases if needed
        frm.doc._temp_test_case = frm.test_case_obj;
    }
});

// ---------------------- Configuration Selection ----------------------
function show_configurations_dialog(frm) {
    // Step 1: Get all Test Runs linked to this Test Plan
    frappe.call({
        method: "frappe.client.get_list",
        args: {
            doctype: "Test Run",
            filters: { test_plan: frm.doc.name },
            fields: ["name"] // Only fetch main field
        },
        callback: function(run_list) {
            const run_names = (run_list.message || []).map(r => r.name);

            // Fetch all configurations used in each Test Run
            const usedConfigurationsPromises = run_names.map(run_name => 
                frappe.call({
                    method: "frappe.client.get",
                    args: { doctype: "Test Run", name: run_name }
                }).then(res => {
                    return (res.message.configuration || []).map(row => row.configuration);
                })
            );

            Promise.all(usedConfigurationsPromises).then(results => {
                const usedConfigurations = [].concat(...results);

                // Step 2: Get all configurations
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

                                // Add checked child configurations
                                d.$wrapper.find('.group-child-checkbox:checked:not(:disabled)').each(function () {
                                    const title = $(this).data('title');
                                    const config_name = $(this).data('config');
                                    let row = frm.add_child("configuration");
                                    row.title = title;
                                    row.configuration = config_name;
                                });

                                frm.refresh_field("configuration");
                                d.hide();
                                frappe.show_alert({ 
                                    message: `Configurations updated. Please save Test Plan to generate Test Runs.`,
                                    indicator: 'blue' 
                                });
                            }
                        });

                        d.show();

                        // Get children for each configuration
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
                                // Disabled if used in any Test Run
                                const isUsed = usedConfigurations.includes(config.name);

                                const config_checkbox = `
                                    <div>
                                        <label>
                                            <input type="checkbox" class="config-checkbox" data-config="${config.name}"
                                                ${isUsed ? 'disabled' : ''}>
                                            <strong>${config.title || config.name} ${isUsed ? '(Used)' : ''}</strong>
                                        </label>
                                    </div>
                                `;

                                const children_html = children.map(child => {
                                    // Always unchecked if no Test Run exists
                                    const isChecked = false;

                                    return `
                                        <div style="margin-left: 20px;">
                                            <input type="checkbox" class="group-child-checkbox"
                                                data-title="${child.title}"
                                                data-config="${config.name}"
                                                id="chk-${config.name}-${child.title}"
                                                ${isChecked ? 'checked' : ''}
                                                ${isUsed ? 'disabled' : ''}>
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

                            // Sync parent checkbox with children
                            d.$wrapper.on('change', '.config-checkbox', function () {
                                const config_name = $(this).data('config');
                                $(`#children-${config_name} .group-child-checkbox:not(:disabled)`).prop('checked', this.checked);
                            });

                            // Sync children checkboxes with parent
                            d.$wrapper.on('change', '.group-child-checkbox:not(:disabled)', function () {
                                const config_name = $(this).data('config');
                                const all_children = $(`#children-${config_name} .group-child-checkbox:not(:disabled)`);
                                const all_checked = all_children.length === all_children.filter(':checked').length;
                                $(`.config-checkbox[data-config="${config_name}"]:not(:disabled)`).prop('checked', all_checked);
                            });
                        });
                    }
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

            // Clear existing test cases before adding new ones
            frm.clear_table("test_cases");

            frappe.call({
                method: "frappe.client.get_list",
                args: {
                    doctype: "Test Case",
                    filters: { name: ["in", selections] },
                    fields: ["name", "title"]
                },
                callback: function (res) {
                    (res.message || []).forEach(tc => {
                        let row = frm.add_child("test_cases");
                        row.test_case = tc.name;
                        row.test_case_title = tc.title;
                    });

                    frm.refresh_field("test_cases");
                    multi_select_dialog.dialog.hide();

                    // frappe.show_alert({
                    //      message: `${res.message.length} Test Case(s) added.`,
                    //     indicator: 'green'
                    // });
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
