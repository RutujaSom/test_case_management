// Copyright (c) 2025, Rutuja Somvanshi and contributors
// For license information, please see license.txt

// frappe.ui.form.on("Test Case", {
// 	refresh(frm) {

// 	},
// });

// Client Script on Test Case
frappe.ui.form.on('Test Case', {
    after_workflow_action(frm) {
        // Fires after any workflow transition completes
        if (frm.doc.docstatus === 2 && frm.doc.workflow_state === 'Cancelled') {
            frm.amend_doc();
        }
    }
});