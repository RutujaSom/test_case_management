frappe.ui.form.on('Test Run', {
    refresh(frm) {
        if (!frm.is_new()) {
            frm.add_custom_button('Add Test Cases', () => {
                show_test_case_selector(frm);
            });
        }
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




