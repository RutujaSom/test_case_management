

# import frappe
# from frappe.utils import now

# @frappe.whitelist()
# def reschedule_interview(docname, scheduled_on):
#     interview = frappe.get_doc("Interview", docname)
#     interview.scheduled_on = scheduled_on
#     interview.db_set("scheduled_on", scheduled_on)
#     interview.db_set("modified", now())

#     # ✅ Optional: save to trigger save hooks
#     interview.save()

#     # ✅ Custom email logic
#     frappe.sendmail(
#         recipients=[interview.custom_applicant_email, interview.interviewer],
#         subject=f"Interview: {interview.name} Rescheduled",
#         message=f"""
#             <p>Dear {interview.custom___applicant_name},</p>

#             <p>We are pleased to inform you that your interview with Excellent Minds has been Rescheduled. Below are the details of your interview:</p>

#             <p><strong>Company Name:</strong> Excellent Minds Software Technologies India Pvt. Ltd.</p>

#             <p><strong>Scheduled On:</strong> {interview.scheduled_on}</p>

#             <p><strong>Scheduled Time:</strong> {interview.from_time} - {interview.to_time}</p>

#             <p><strong>Interview Type:</strong> Online</p>

#             <p><strong>Google Meet Link:</strong>
#                 <a href="{interview.interview_link or 'https://meet.google.com/usn-tmxn-uzq'}">
#                     {interview.interview_link or 'https://meet.google.com/usn-tmxn-uzq'}
#                 </a>
#             </p>

#             <p>Please ensure that you are available at the specified time and prepared for the interview. If you have any questions or need to reschedule, please contact us at <a href="mailto:careers@excellminds.com">careers@excellminds.com</a> as soon as possible.</p>

#             <p>Please confirm your availability.</p>

#             <hr />
#             <p style="font-weight: bold;">Best regards,</p>
#             <div>Project Manager</div>
#             <div style="color: green;">Excellent Minds Software Technologies India Pvt. Ltd.</div>
#             <div style="font-weight: bold;">Website - <a href="http://www.excellminds.com" style="color: blue;">www.excellminds.com</a></div>
#         """,
#     )

#     return "done"

import frappe
from frappe.utils import format_datetime

def send_interview_pending_notification(doc, method=None):
    frappe.logger().info("📩 Backend Triggered: send_interview_pending_notification")

    if doc.status != "Pending":
        frappe.logger().info(f"⏹ Status is {doc.status}, not Pending. Exiting.")
        return

    # Collect recipients
    recipients = set()

    if doc.custom_applicant_email:
        recipients.add(doc.custom_applicant_email)

    if doc.interview_details:
        for row in doc.interview_details:
            if row.interviewer_email:
                recipients.add(row.interviewer_email)

    if not recipients:
        frappe.logger().info("⚠ No recipients found.")
        return

    try:
        subject = "Interview Scheduled with Excellent Minds"

        message = f"""
        <p>Dear Candidate/Interviewer,</p>

        <p>We are pleased to inform you that an interview has been scheduled. Below are the details:</p>

        <p><strong>Applicant Name:</strong> {doc.custom___applicant_name}</p>
        <p><strong>Company Name:</strong> Excellent Minds Software Technologies India Pvt. Ltd.</p>
        <p><strong>Scheduled On:</strong> {format_datetime(doc.scheduled_on)}</p>
        <p><strong>Scheduled Time:</strong> {doc.from_time} - {doc.to_time}</p>
        <p><strong>Interview Type:</strong> {doc.interview_type}</p>
        <p><strong>Job Title:</strong> {doc.job_opening}</p>

        <p>Best regards,<br>Excellent Minds HR Team</p>
        """

        frappe.sendmail(
            recipients=list(recipients),
            subject=subject,
            message=message,
            reference_doctype=doc.doctype,
            reference_name=doc.name
        )

        frappe.logger().info(f"✅ Email sent to: {recipients}")

    except Exception as e:
        frappe.log_error(frappe.get_traceback(), "❌ Error while sending Interview Email")



