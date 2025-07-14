// Triggered when the Test Project form is loaded or refreshed
frappe.ui.form.on('Test Project', {
    refresh(frm) {
        // Show the button only if the document is not new
        if (!frm.is_new()) {
            frm.add_custom_button('Add Test Cases from Bank', () => {
                show_test_case_selector(frm);
            });
        }
    }
});


/**
 * Opens a MultiSelectDialog to select Test Cases from the Test Case Bank
 * and creates corresponding Test Case documents linked to the current Test Project.
 */
function show_test_case_selector(frm) {
    new frappe.ui.form.MultiSelectDialog({
        doctype: "Test Case Bank",
        target: frm,
        size: 'large',
        add_filters_group: 1,  // Allows filtering inside the dialog
        setters: {},  // No initial filters

        // Columns to display in selection dialog
        columns: ["test_case_id", "title"],

        // Custom query to fetch relevant Test Case Bank records
        get_query() {
            return {
                query: "test_case_management.api.test_case_bank.get_test_cases_query_for_project"
            };
        },

        // Action to perform after selecting one or more test cases
        async action(selections) {
            if (!selections.length) {
                frappe.msgprint("No Test Cases selected.");
                return;
            }

            frappe.show_progress("Creating Test Cases", 0, selections.length);
            let created = 0;

            // Loop over selected test cases
            for (let i = 0; i < selections.length; i++) {
                const bank_case = selections[i];

                try {
                    // Get full Test Case Bank document
                    const details = await frappe.db.get_doc("Test Case Bank", bank_case);

                    // Prepare step list for Test Case from bank
                    const steps = (details.case_steps || []).map(step => {
                        return {
                            doctype: "Test Case Steps",
                            title: step.title || "",
                            step_completed: 0  // default to not completed
                        };
                    });

                    // Build a new Test Case document from the bank case
                    const new_test_case_doc = {
                        doctype: "Test Case",
                        title: details.title,
                        test_case_id: details.test_case_id,
                        priority: details.priority || "Medium",
                        pre_conditions: details.pre_conditions || "",
                        expected_results: details.expected_results || "",
                        status: details.status || "Draft",
                        test_case_type: details.test_case_type || "",
                        estimated_time: details.estimated_time || "",
                        attachment: details.attachment || "",
                        project: frm.doc.name,
                        case_steps: steps
                    };

                    // Insert the new Test Case using frappe.client.insert
                    const res = await frappe.call({
                        method: "frappe.client.insert",
                        args: {
                            doc: new_test_case_doc
                        }
                    });

                    // If insert was successful, Increase Count
                    created++;   

                } catch (err) {
                    console.error(`Failed to create Test Case from ${bank_case.name}:`, err);
                }

                // Update progress bar
                frappe.show_progress("Creating Test Cases", i + 1, selections.length);
            }

            // Refresh the test_cases child table on the form
            frm.refresh_field("test_cases");

            // Show success message
            frappe.msgprint(`${created} Test Case(s) created under project '${frm.doc.title}'.`);
        }
    });
}




//  -------------------------------
frappe.ui.form.on('Test Project', {
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
                method: 'test_case_management.api.test_project.import_test_cases_from_file_for_project',
                args: {
                    project: frm.doc.name,
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



frappe.ui.form.on('Test Project', {
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
