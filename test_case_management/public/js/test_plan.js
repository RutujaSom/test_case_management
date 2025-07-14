frappe.ui.form.on('Test Plan', {
    refresh(frm) {
        if (!frm.is_new()) {
            frm.add_custom_button('Add Test Cases', () => {
                show_test_case_selector(frm);
            });
        }
    }
});

// function show_test_case_selector(frm) {
//     const existing_test_cases = (frm.doc.test_cases || []).map(row => row.test_case);
//     alert('existing_test_cases....'+JSON.stringify(existing_test_cases))
//     new frappe.ui.form.MultiSelectDialog({
//         doctype: 'Test Case',
//         target: frm,
//         setters: {
//             project: frm.doc.project || undefined
//         },
//         add_filters_group: 1,
//         date_field: 'creation',
//         get_query() {
//             return {
//                 filters: {
//                     project: frm.doc.project || undefined
//                 }
//             };
//         },
//         default_values: existing_test_cases,
        
//         action(selections) {
//             alert('existing_test_cases ..'+JSON.stringify(existing_test_cases))
//             const to_add = selections.filter(tc => !existing_test_cases.includes(tc));

//             to_add.forEach(test_case_name => {
//                 frm.add_child('test_cases', {
//                     test_case: test_case_name
//                 });
//             });

//             frm.refresh_field('test_cases');
//             frappe.msgprint(`${to_add.length} Test Case(s) added.`);
//         }
//     });

//     // frappe.msgprint(`Current Plan ID: <b>${frm.doc.name}</b>`);
// }





// function show_test_case_selector(frm) {
//     const existing_test_cases = (frm.doc.test_cases || []).map(row => row.test_case);

//     new frappe.ui.form.MultiSelectDialog({
//         doctype: "Test Case",
//         target: frm,
//         size: 'large',
//         setters: {
//             project: frm.doc.project || ''
//         },
//         add_filters_group: 1,
//         date_field: "creation",

//         // ✅ Custom query that returns name, test_case_id, title
//         get_query() {
//             return {
//                 query: "test_case_management.api.test_case.get_test_cases_query",
//                 filters: {
//                     project: frm.doc.project || ''
//                 }
//             };
//         },

//         columns: ["test_case_id", "title"],

//         action(selections) {
//             alert(selections + " ....")
//             const to_add = selections.filter(tc => !existing_test_cases.includes(tc));

//             if (to_add.length === 0) {
//                 frappe.msgprint("No new Test Cases selected.");
//                 return;
//             }

//             to_add.forEach(tc => {
//                 frm.add_child("test_cases", {
//                     test_case: tc,
//                     test_case_title: tc.title
//                 });
//             });

//             frm.refresh_field("test_cases");
//             frappe.msgprint(`${to_add.length} Test Case(s) added.`);
//         }
//     });

//     // ✅ Auto-select already added test cases
//     const interval = setInterval(() => {
//         const checkboxes = $('input[data-name]');
//         if (checkboxes.length) {
//             checkboxes.each(function () {
//                 const rowName = $(this).attr('data-name');
//                 if (existing_test_cases.includes(rowName)) {
//                     $(this).prop('checked', true);
//                 }
//             });
//             clearInterval(interval);
//         }
//     }, 200);
// }

function show_test_case_selector(frm) {
    const existing_test_cases = (frm.doc.test_cases || []).map(row => row.test_case);
    const checked_values = existing_test_cases.map(name => ({ name }));
    const multi_select_dialog = new frappe.ui.form.MultiSelectDialog({
        doctype: "Test Case",
        target: frm,
        size: 'large',
        setters: {
            project: frm.doc.project || ''
        },
        add_filters_group: 1,
        date_field: "creation",
        primary_action_label: "Add Test Cases",  // ✅ Required to get full objects in selections
        columns: ["test_case_id", "title"],
        default_values: existing_test_cases,  // ✅ Pre-select already added test cases
        get_query() {
            return {
                query: "test_case_management.api.test_case.get_test_cases_query",
                filters: {
                    project: frm.doc.project || ''
                }
            };
        },

        action(selections) {
            // ✅ Now selections contain objects like { name, title, test_case_id }
            const to_add = selections.filter(tc => !existing_test_cases.includes(tc));

            if (to_add.length === 0) {
                frappe.msgprint("No new Test Cases selected.");
                return;
            }

            to_add.forEach(name => {
                frappe.db.get_value("Test Case", name, "title").then(res => {
                    const title = res.message.title;

                    frm.add_child("test_cases", {
                        test_case: name,
                        test_case_title: title
                    });

                    remaining--;

                    if (remaining === 0) {
                        frm.refresh_field("test_cases");
                        frappe.msgprint(`${to_add.length} Test Case(s) added.`);
                    }
                });
            });

            frm.refresh_field("test_cases");
            frappe.msgprint(`${to_add.length} Test Case(s) added.`);
        }
    });

    multi_select_dialog.on_page_show = () => {
        alert('....')
        multi_select_dialog.set_checked_values(checked_values);
        console.log("✅ Pre-selected test cases after data load.");
    };

}



frappe.ui.form.on('Test Plan', {
    refresh(frm) {
        if (!frm.is_new()) {
            frm.add_custom_button('Import Test Cases', () => {
                open_import_dialog(frm);
            });
        }
    }
});

function open_import_dialog(frm) {
    const d = new frappe.ui.Dialog({
        title: 'Import Test Cases',
        fields: [
            {
                label: 'File Type',
                fieldname: 'file_type',
                fieldtype: 'Select',
                options: ['CSV', 'Excel'],
                reqd: 1
            },
            {
                label: 'File',
                fieldname: 'file_url',
                fieldtype: 'Attach',
                reqd: 1
            }
        ],
        primary_action_label: 'Import',
        primary_action(values) {
            frappe.call({
                method: 'test_case_management.api.test_plan.import_test_cases_from_file',
                args: {
                    test_plan: frm.doc.name,
                    file_url: values.file_url,
                    file_type: values.file_type
                },
                callback(r) {
                    if (r.message) {
                        frappe.msgprint(r.message);
                        frm.reload_doc();
                    }
                    d.hide();
                }
            });
        }
    });

    d.show();
}



frappe.ui.form.on('Test Plan', {
    refresh(frm) {
        if (!frm.is_new()) {
            frm.add_custom_button("Export Template", () => {
                let dialog = new frappe.ui.Dialog({
                    title: "Export Template",
                    fields: [
                        {
                            label: 'File Type',
                            fieldname: 'file_type',
                            fieldtype: 'Select',
                            options: ['Excel', 'CSV'],
                            default: 'Excel',
                            reqd: 1
                        }
                    ],
                    primary_action_label: 'Download',
                    primary_action(values) {
                        // Direct download via GET (file will be returned by frappe.response)
                        const file_type = values.file_type;
                        const url = `/api/method/test_case_management.api.test_plan.download_template?file_type=${file_type}`;
                        window.open(url, '_blank');
                        dialog.hide();
                    }
                });

                dialog.show();
            });

        }
    }
});




















//  ------------------------------------------------


frappe.ui.form.on('Test Plan', {
    refresh: function (frm) {
        if (!frm.is_new()) {
            frm.add_custom_button("Select Configurations", () => {
                // Step 1: Store already selected group-child rows
                const existingTitles = (frm.doc.configuration || []).map(row => row.title);

                // Step 2: Fetch all configurations
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
                            fields: [
                                {
                                    fieldtype: 'HTML',
                                    fieldname: 'config_section',
                                    options: `<div id="config-popup"><i>Loading...</i></div>`
                                }
                            ],
                            primary_action_label: 'OK',
                            primary_action() {
                                frm.clear_table("configuration");

                                // Add all checked children into child table
                                d.$wrapper.find('.group-child-checkbox:checked').each(function () {
                                    const title = $(this).data('title');
                                    const config_name = $(this).data('config');

                                    let row = frm.add_child("configuration");
                                    row.title = title;
                                    row.configuration = config_name;
                                });

                                frm.refresh_field("configuration");
                                d.hide();
                            }
                        });

                        d.show();

                        // Step 3: Fetch each configuration and its children
                        const configPromises = configs.map(cfg =>
                            frappe.call({
                                method: "frappe.client.get",
                                args: {
                                    doctype: "Configuration",
                                    name: cfg.name
                                }
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

                            // Step 4: Select/Deselect all children when config is toggled
                            d.$wrapper.on('change', '.config-checkbox', function () {
                                const config_name = $(this).data('config');
                                const checked = this.checked;
                                $(`#children-${config_name} .group-child-checkbox`).prop('checked', checked);
                            });

                            // Step 5: Update config checkbox when children are toggled
                            d.$wrapper.on('change', '.group-child-checkbox', function () {
                                const config_name = $(this).data('config');
                                const all_children = $(`#children-${config_name} .group-child-checkbox`);
                                const all_checked = all_children.length === all_children.filter(':checked').length;
                                $(`.config-checkbox[data-config="${config_name}"]`).prop('checked', all_checked);
                            });
                        });
                    }
                });
            });
        }
    }
});
