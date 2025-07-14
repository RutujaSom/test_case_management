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
