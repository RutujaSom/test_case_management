frappe.ui.form.on('Test Run', {
    refresh(frm) {
        if (!frm.is_new()) {
            frm.add_custom_button('Add Test Cases', () => {
                show_test_case_selector(frm);
            });
        }
    }
});

function show_test_case_selector(frm) {
    const existing_test_cases = (frm.doc.test_case || []).map(row => row.test_case);
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

                    frm.add_child("test_case", {
                        test_case: name,
                        // test_case_title: title,
                        status:"Pending"
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
        multi_select_dialog.set_checked_values(checked_values);
        console.log("✅ Pre-selected test cases after data load.");
    };

}




frappe.ui.form.on('Test Run', {
    test_plan: function(frm) {
        if (frm.doc.test_plan) {
            frappe.db.get_value('Test Plan', frm.doc.test_plan, 'project')
                .then(r => {
                    if (r.message && r.message.project) {
                        frm.set_value('project', r.message.project);
                    }
                });
        }
    }
});















