// frappe.ui.form.on('Test Plan', {
//     refresh(frm) {
//         if (!frm.is_new()) {
//             frm.add_custom_button('Add Test Cases', () => {
//                 show_test_case_selector(frm);
//             });
//         }
//     }
// });

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

//      frappe.msgprint(`Current Plan ID: <b>${frm.doc.name}</b>`);
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

// function show_test_case_selector(frm) {
//     const existing_test_cases = (frm.doc.test_cases || []).map(row => row.test_case);
//     const checked_values = existing_test_cases.map(name => ({ name }));
//     const multi_select_dialog = new frappe.ui.form.MultiSelectDialog({
//         doctype: "Test Case",
//         target: frm,
//         size: 'large',
//         setters: {
//             project: frm.doc.project || '',
//         },
//         add_filters_group: 1,
//         date_field: "creation",
//         primary_action_label: "Add Test Cases",  // ✅ Required to get full objects in selections
//         columns: ["test_case_id", "title"],
//         default_values: existing_test_cases,  // ✅ Pre-select already added test cases
//         get_query() {
//             return {
//                 query: "test_case_management.api.test_case.get_test_cases_query",
//                 filters: {
//                     project: frm.doc.project || '',
//                     custom_module: frm.doc.custom_module || ''
//                 }
//             };
//         },

//         action(selections) {
//             // ✅ Now selections contain objects like { name, title, test_case_id }
//             const to_add = selections.filter(tc => !existing_test_cases.includes(tc));

//             if (to_add.length === 0) {
//                 frappe.msgprint("No new Test Cases selected.");
//                 return;
//             }

//             to_add.forEach(name => {
//                 frappe.db.get_value("Test Case", name, "title").then(res => {
//                     const title = res.message.title;

//                     frm.add_child("test_cases", {
//                         test_case: name,
//                         test_case_title: title
//                     });

//                     remaining--;

//                     if (remaining === 0) {
//                         frm.refresh_field("test_cases");
//                         frappe.msgprint(`${to_add.length} Test Case(s) added.`);
//                     }
//                 });
//             });

//             frm.refresh_field("test_cases");
//             frappe.msgprint(`${to_add.length} Test Case(s) added.`);
//         }
//     });

//     multi_select_dialog.on_page_show = () => {
//         alert('....')
//         multi_select_dialog.set_checked_values(checked_values);
//         console.log("✅ Pre-selected test cases after data load.");
//     };

// }



// frappe.ui.form.on('Test Plan', {
//     refresh(frm) {
//         if (!frm.is_new()) {
//             frm.add_custom_button('Import Test Cases', () => {
//                 open_import_dialog(frm);
//             });
//         }
//     }
// });

// function open_import_dialog(frm) {
//     const d = new frappe.ui.Dialog({
//         title: 'Import Test Cases',
//         fields: [
//             {
//                 label: 'File Type',
//                 fieldname: 'file_type',
//                 fieldtype: 'Select',
//                 options: ['CSV', 'Excel'],
//                 reqd: 1
//             },
//             {
//                 label: 'File',
//                 fieldname: 'file_url',
//                 fieldtype: 'Attach',
//                 reqd: 1
//             }
//         ],
//         primary_action_label: 'Import',
//         primary_action(values) {
//             frappe.call({
//                 method: 'test_case_management.api.test_plan.import_test_cases_from_file',
//                 args: {
//                     test_plan: frm.doc.name,
//                     file_url: values.file_url,
//                     file_type: values.file_type
//                 },
//                 callback(r) {
//                     if (r.message) {
//                         frappe.msgprint(r.message);
//                         frm.reload_doc();
//                     }
//                     d.hide();
//                 }
//             });
//         }
//     });

//     d.show();
// }



// frappe.ui.form.on('Test Plan', {
//     refresh(frm) {
//         if (!frm.is_new()) {
//             frm.add_custom_button("Export Template", () => {
//                 let dialog = new frappe.ui.Dialog({
//                     title: "Export Template",
//                     fields: [
//                         {
//                             label: 'File Type',
//                             fieldname: 'file_type',
//                             fieldtype: 'Select',
//                             options: ['Excel', 'CSV'],
//                             default: 'Excel',
//                             reqd: 1
//                         }
//                     ],
//                     primary_action_label: 'Download',
//                     primary_action(values) {
//                         // Direct download via GET (file will be returned by frappe.response)
//                         const file_type = values.file_type;
//                         const url = `/api/method/test_case_management.api.test_plan.download_template?file_type=${file_type}`;
//                         window.open(url, '_blank');
//                         dialog.hide();
//                     }
//                 });

//                 dialog.show();
//             });

//         }
//     }
// });




















//  ------------------------------------------------


// frappe.ui.form.on('Test Plan', {
//     refresh: function (frm) {
//         if (!frm.is_new()) {
//             frm.add_custom_button("Select Configurations", () => {
//                 // Step 1: Store already selected group-child rows
//                 const existingTitles = (frm.doc.configuration || []).map(row => row.title);

//                 // Step 2: Fetch all configurations
//                 frappe.call({
//                     method: "frappe.client.get_list",
//                     args: {
//                         doctype: "Configuration",
//                         fields: ["name", "title"]
//                     },
//                     callback: function (r) {
//                         const configs = r.message;

//                         const d = new frappe.ui.Dialog({
//                             title: 'Select Configurations and Children',
//                             fields: [
//                                 {
//                                     fieldtype: 'HTML',
//                                     fieldname: 'config_section',
//                                     // options: `<div id="config-popup"><i>Loading...</i></div>`
//                                 }
//                             ],
//                             primary_action_label: 'OK',
//                             primary_action() {
//                                 frm.clear_table("configuration");

//                                 // Add all checked children into child table
//                                 d.$wrapper.find('.group-child-checkbox:checked').each(function () {
//                                     const title = $(this).data('title');
//                                     const config_name = $(this).data('config');
//                                     // alert('config_name ...',config_name)
//                                     let row = frm.add_child("configuration");
//                                     row.title = title;
//                                     row.configuration = config_name;
//                                 });

//                                 frm.refresh_field("configuration");
//                                 d.hide();
//                             }
//                         });

//                         d.show();

//                         // Step 3: Fetch each configuration and its children
//                         const configPromises = configs.map(cfg =>
//                             frappe.call({
//                                 method: "frappe.client.get",
//                                 args: {
//                                     doctype: "Configuration",
//                                     name: cfg.name
//                                 }
//                             }).then(res => ({
//                                 config: cfg,
//                                 children: res.message.group_child || []
//                             }))
//                         );

//                         Promise.all(configPromises).then(results => {
//                             const html = results.map(({ config, children }) => {
//                                 const allSelected = children.length > 0 && children.every(child =>
//                                     existingTitles.includes(child.title)
//                                 );

//                                 const config_checkbox = `
//                                     <div>
//                                         <label>
//                                             <input type="checkbox" class="config-checkbox" data-config="${config.name}"
//                                                 ${allSelected ? 'checked' : ''}>
//                                             <strong>${config.title || config.name}</strong>
//                                         </label>
//                                     </div>
//                                 `;

//                                 const children_html = children.map(child => {
//                                     const isChecked = existingTitles.includes(child.title);
//                                     return `
//                                         <div style="margin-left: 20px;">
//                                             <input type="checkbox" class="group-child-checkbox"
//                                                 data-title="${child.title}"
//                                                 data-config="${config.name}"
//                                                 id="chk-${config.name}-${child.title}"
//                                                 ${isChecked ? 'checked' : ''}>
//                                             <label for="chk-${config.name}-${child.title}">${child.title}</label>
//                                         </div>
//                                     `;
//                                 }).join("");

//                                 return `
//                                     <div style="margin-bottom: 15px;">
//                                         ${config_checkbox}
//                                         <div class="child-container" id="children-${config.name}">
//                                             ${children_html}
//                                         </div>
//                                     </div>
//                                 `;
//                             }).join("");

//                             d.get_field('config_section').$wrapper.html(html);

//                             // Step 4: Select/Deselect all children when config is toggled
//                             d.$wrapper.on('change', '.config-checkbox', function () {
//                                 const config_name = $(this).data('config');
//                                 const checked = this.checked;
//                                 $(`#children-${config_name} .group-child-checkbox`).prop('checked', checked);
//                             });

//                             // Step 5: Update config checkbox when children are toggled
//                             d.$wrapper.on('change', '.group-child-checkbox', function () {
//                                 const config_name = $(this).data('config');
//                                 const all_children = $(`#children-${config_name} .group-child-checkbox`);
//                                 const all_checked = all_children.length === all_children.filter(':checked').length;
//                                 $(`.config-checkbox[data-config="${config_name}"]`).prop('checked', all_checked);
//                             });
//                         });
//                     }
//                 });
//             });
//         }
//     }
// });




// update test case name and title but duplicate
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

