// Copyright (c) 2025, Rutuja Somvanshi and contributors
// For license information, please see license.txt

// frappe.ui.form.on("Test Case Bank", {
// 	refresh(frm) {

// 	},
// });

frappe.ui.form.on('Test Case Bank', {
    after_workflow_action(frm) {
        // Fires after any workflow transition completes
        if (frm.doc.docstatus === 2 && frm.doc.workflow_state === 'Cancelled') {
            frm.amend_doc();
        }
    }
});