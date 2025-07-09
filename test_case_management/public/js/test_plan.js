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





function show_test_case_selector(frm) {
    const existing_test_cases = (frm.doc.test_cases || []).map(row => row.test_case);

    new frappe.ui.form.MultiSelectDialog({
        doctype: "Test Case",
        target: frm,
        size: 'large',
        setters: {
            project: frm.doc.project || ''
        },
        add_filters_group: 1,
        date_field: "creation",

        // ✅ Custom query that returns name, test_case_id, title
        get_query() {
            return {
                query: "test_case_management.api.test_case.get_test_cases_query",
                filters: {
                    project: frm.doc.project || ''
                }
            };
        },

        columns: ["test_case_id", "title"],

        action(selections) {
            const to_add = selections.filter(tc => !existing_test_cases.includes(tc));

            if (to_add.length === 0) {
                frappe.msgprint("No new Test Cases selected.");
                return;
            }

            to_add.forEach(tc => {
                frm.add_child("test_cases", {
                    test_case: tc,
                    test_case_title: tc.title
                });
            });

            frm.refresh_field("test_cases");
            frappe.msgprint(`${to_add.length} Test Case(s) added.`);
        }
    });

    // ✅ Auto-select already added test cases
    const interval = setInterval(() => {
        const checkboxes = $('input[data-name]');
        if (checkboxes.length) {
            checkboxes.each(function () {
                const rowName = $(this).attr('data-name');
                if (existing_test_cases.includes(rowName)) {
                    $(this).prop('checked', true);
                }
            });
            clearInterval(interval);
        }
    }, 200);
}




// ---------------------------------------------------------------

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
