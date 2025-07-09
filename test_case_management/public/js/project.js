frappe.ui.form.on('Project', {
    refresh(frm) {
        if (!frm.is_new()) {
            frm.add_custom_button('Add Test Cases', () => {
                show_test_case_selector(frm);
            });
        }
    }
});



function show_test_case_selector(frm) {
    const existing_test_cases = (frm.doc.test_cases || []).map(row => row.test_case);

    new frappe.ui.form.MultiSelectDialog({
        doctype: "Test Case Bank",
        target: frm,
        size: 'large',
        add_filters_group: 1,
        date_field: "creation",
        setters: {}, // ✅ Include this to avoid the Object.keys() on undefined
        columns: ["name", "test_case_id", "title"],

        get_query() {
            return {
                query: "test_case_management.api.test_case_bank.get_test_cases_query_for_project"
            };
        },

        action(selections) {
            console.log("Selected rows:", selections);

            if (!Array.isArray(selections)) {
                frappe.throw("Invalid selection data.");
                return;
            }

            const to_add = selections
                .filter(tc => tc && tc.name && !existing_test_cases.includes(tc.name));

            if (to_add.length === 0) {
                frappe.msgprint("No new Test Cases selected.");
                return;
            }

            to_add.forEach(tc => {
                frm.add_child("test_cases", {
                    test_case: tc.name  // Use tc.name (the link field)
                });
            });

            frm.refresh_field("test_cases");
            frappe.msgprint(`${to_add.length} Test Case(s) added.`);
        }
    });

    // Pre-check already linked test cases
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
