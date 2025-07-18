// frappe.ui.form.on("Job Applicant", {
//     onload: function (frm) {
//         // ✅ 1. Fetch full Job Opening details and store interview rounds
//         if (frm.doc.job_title) {
//             let job_opening_id = frm.doc.job_title;
//             // alert("🔍 Looking up full Job Opening for: " + job_opening_id);

//             frappe.call({
//                 method: "frappe.client.get",
//                 args: {
//                     doctype: "Job Opening",
//                     name: job_opening_id
//                 },
//                 callback: function (r) {
//                     if (r.message) {
//                         let job_opening = r.message;
//                         console.log("✅ Full Job Opening object:", job_opening);
//                         // alert("✅ Fetched Interview Rounds:\n" + JSON.stringify(job_opening.custom_interview_rounds));
                        
//                         // ✅ Store rounds for dialog use
//                         frm.custom_interview_rounds = job_opening.custom_interview_rounds;
//                     } else {
//                         alert("❌ No Job Opening found with name: " + job_opening_id);
//                     }
//                 }
//             });
//         }

//         alert("app "+frm);
//         // ✅ 2. Override the "Interview" create dialog
//         frm.override_create_dialog = frm.override_create_dialog || {};
//         alert("app");
//         frm.override_create_dialog["Interview"] = function () {
//             alert("app");
//             if (!frm.custom_interview_rounds || frm.custom_interview_rounds.length === 0) {
//                 frappe.msgprint("No Interview Rounds found for selected Job Opening.");
//                 return;
//             }

//             // Convert rows into dropdown options
//             let round_options = [];
//             let round_map = {};

//             frm.custom_interview_rounds.forEach(row => {
//                 let label = `${row.round_name} (${row.description || 'No Description'})`;
//                 round_options.push(label);
//                 round_map[label] = row;
//             });

//             const dialog = new frappe.ui.Dialog({
//                 title: "Enter Interview Round",
//                 fields: [
//                     {
//                         label: "Interview Round",
//                         fieldname: "round_name",
//                         fieldtype: "Link",
//                         options: "Interview Round",
//                         reqd: 1
//                     },
//                     {
//                         label: "Interview Date",
//                         fieldname: "interview_date",
//                         fieldtype: "Date",
//                         reqd: 1
//                     }
//                 ],
//                 primary_action_label: "Create Interview",
//                 primary_action(values) {
//                     let selected_row = round_map[values.round_label];

//                     frappe.call({
//                         method: "frappe.client.insert",
//                         args: {
//                             doc: {
//                                 doctype: "Interview",
//                                 job_applicant: frm.doc.name,
//                                 applicant_name: frm.doc.applicant_name,
//                                 job_opening: frm.doc.job_title,
//                                 designation: frm.doc.designation,
//                                 round_name: selected_row.round_name,
//                                 interview_date: values.interview_date
//                             }
//                         },
//                         callback: function (res) {
//                             if (res.message) {
//                                 frappe.set_route("Form", "Interview", res.message.name);
//                                 frappe.msgprint("✅ Interview Created Successfully");
//                             }
//                         }
//                     });

//                     dialog.hide();
//                 }
//             });

//             dialog.show();
//         };
//     }
// });







// frappe.ui.form.on("Job Applicant", {
//     onload: function (frm) {
//         // ✅ 1. Fetch Job Opening and store interview rounds
//         if (frm.doc.job_title) {
//             let job_opening_id = frm.doc.job_title;

//             frappe.call({
//                 method: "frappe.client.get",
//                 args: {
//                     doctype: "Job Opening",
//                     name: job_opening_id
//                 },
//                 callback: function (r) {
//                     if (r.message) {
//                         frm.custom_interview_rounds = r.message.custom_interview_rounds || [];
//                     }
//                 }
//             });
//         }

//         // ✅ 2. Override create_dialog instead of override_create_dialog
//         frm.events.create_dialog = function (frm) {
//             if (!frm.custom_interview_rounds || frm.custom_interview_rounds.length === 0) {
//                 frappe.msgprint("No Interview Rounds found for selected Job Opening.");
//                 return;
//             }

//             let round_options = [];
//             let round_map = {};

//             frm.custom_interview_rounds.forEach(row => {
//                  let label = `${row.round_name}`;
//                 round_options.push(label);
//                 round_map[label] = row;
//             });

//             let dialog = new frappe.ui.Dialog({
//                 title: "Enter Interview Round",
//                 fields: [
//                     {
//                         label: "Interview Round",
//                         fieldname: "round_name",
//                         fieldtype: "Select",
//                         options: round_options,
                       
//                     }
                
//                 ],




                
//                 primary_action_label: "Create Interview",
//                 primary_action(values) {
//                     let selected_row = round_map[values.round_name];
//                     frappe.call({
//                         method: "frappe.client.insert",
//                         args: {
//                             doc: {
//                                 doctype: "Interview",
//                                 job_applicant: frm.doc.name,
//                                 applicant_name: frm.doc.applicant_name,
//                                 job_opening: frm.doc.job_title,
//                                 designation: frm.doc.designation,
//                                 round_name: selected_row.round_name,
                                
//                             }
//                         },
//                         callback: function (res) {
//                             if (res.message) {
//                                 frappe.set_route("Form", "Interview", res.message.name);
//                                 frappe.msgprint("✅ Interview Created Successfully");
//                             }
//                         }
//                     });

//                     dialog.hide();
//                 }
//             });

//             dialog.show();
//         };
//     }
// });






// frappe.ui.form.on("Job Applicant", {
//     onload: function (frm) {
//         // ✅ Fetch interview rounds from Job Opening
//         if (frm.doc.job_title) {
//             let job_opening_id = frm.doc.job_title;

//             frappe.call({
//                 method: "frappe.client.get",
//                 args: {
//                     doctype: "Job Opening",
//                     name: job_opening_id
//                 },
//                 callback: function (r) {
//                     if (r.message) {
//                         frm.custom_interview_rounds = r.message.custom_interview_rounds || [];
//                     }
//                 }
//             });
//         }

//         // ✅ Override create_dialog to show round dropdown
//         frm.events.create_dialog = function (frm) {
//             if (!frm.custom_interview_rounds || frm.custom_interview_rounds.length === 0) {
//                 frappe.msgprint("No Interview Rounds found for selected Job Opening.");
//                 return;
//             }

//             // Get only round names
//             let round_options = frm.custom_interview_rounds.map(r => r.round_name);

//             let d = new frappe.ui.Dialog({
//                 title: "Enter Interview Round",
//                 fields: [
//                     {
//                         label: "Interview Round",
//                         fieldname: "interview_round",
//                         fieldtype: "Select",
//                         options: round_options,
//                         reqd: 1
//                     }
//                 ],
//                 primary_action_label: __("Create Interview"),
//                 primary_action(values) {
//                     frm.events.create_interview(frm, values);
//                     d.hide();
//                 }
//             });

//             d.show();
//         };

//         // ✅ Use ERPNext’s standard create_interview logic
//         frm.events.create_interview = function (frm, values) {
//             frappe.call({
//                 method: "hrms.hr.doctype.job_applicant.job_applicant.create_interview",
//                 args: {
//                     doc: frm.doc,
//                     interview_round: values.interview_round,
//                 },
//                 callback: function (r) {
//                     if (r.message) {
//                         var doclist = frappe.model.sync(r.message);
//                         frappe.set_route("Form", doclist[0].doctype, doclist[0].name);
//                     }
//                 }
//             });
//         };
//     }
// });






frappe.ui.form.on("Job Applicant", {
    onload: function (frm) {
        // ✅ Fetch interview rounds from Job Opening
        if (frm.doc.job_title) {
            let job_opening_id = frm.doc.job_title;

            frappe.call({
                method: "frappe.client.get",
                args: {
                    doctype: "Job Opening",
                    name: job_opening_id
                },
                callback: function (r) {
                    if (r.message) {
                        frm.custom_interview_rounds = r.message.custom_interview_rounds || [];
                    }
                }
            });
        }

        // ✅ Override create_dialog to show round dropdown
        frm.events.create_dialog = function (frm) {
            if (!frm.custom_interview_rounds || frm.custom_interview_rounds.length === 0) {
                frappe.msgprint("No Interview Rounds found for selected Job Opening.");
                return;
            }

            // Get only round names
            let round_options = frm.custom_interview_rounds.map(r => r.round_name);

            let d = new frappe.ui.Dialog({
                title: "Enter Interview Round",
                fields: [
                    {
                        label: "Interview Round",
                        fieldname: "interview_round",
                        fieldtype: "Select",
                        options: round_options,
                        reqd: 1
                    }
                ],
                primary_action_label: __("Create Interview"),
                primary_action(values) {
                    frm.events.create_interview(frm, values);
                    d.hide();
                }
            });

            d.show();
        };

        // ✅ Use ERPNext’s standard create_interview logic
        frm.events.create_interview = function (frm, values) {
            frappe.call({
                method: "hrms.hr.doctype.job_applicant.job_applicant.create_interview",
                args: {
                    doc: frm.doc,
                    interview_round: values.interview_round,
                },
                callback: function (r) {
                    if (r.message) {
                        var doclist = frappe.model.sync(r.message);
                        frappe.set_route("Form", doclist[0].doctype, doclist[0].name);
                    }
                }
            });
        };
    }, // ⬅️⏹️ END OF onload FUNCTION — insert refresh below this line

    // ✅ INSERTED HERE: Add shortlist button on form
    refresh: function (frm) {
        if (!frm.doc.__islocal) {
            frm.add_custom_button("Shortlist Applicant", () => {
                frappe.call({
                    method: "library_management.doctype.job_applicant.job_applicant.send_shortlist_email",
                    args: {
                        docname: frm.doc.name
                    },
                    freeze: true,
                    callback: function () {
                        frappe.msgprint("Shortlist email sent to applicant.");
                    }
                });
            }, __("Actions"));
        }
    }
});






