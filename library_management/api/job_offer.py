import frappe
from frappe.utils import get_url, format_date

def send_offer_email_on_status(doc, method):
    frappe.log_error(f"Triggered Job Offer Email Function on {doc.name}", "DEBUG: Job Offer Trigger")

    if doc.status != "Awaiting Response":
        frappe.log_error(f"Status is {doc.status}, not triggering mail", "DEBUG: Job Offer Status Check")
        return

    if not doc.applicant_email:
        frappe.log_error("Missing applicant_email", "Job Offer Email")
        return

    subject = f"Job Offer for {doc.designation} at Excellent Minds"

    message = f"""
    <p>Dear {doc.applicant_name or 'Candidate'},</p>
    <p>We are pleased to offer you the position of <strong>{doc.designation}</strong> at <strong>Excellent Minds</strong>.</p>
    <ul>
        <li><strong>Designation:</strong> {doc.designation}</li>
        <li><strong>Joining Date:</strong> {format_date(doc.joining_date)}</li>
    </ul>
    <p>Please confirm your decision by clicking one of the links below:</p>
    <p>
        <a href="{get_url()}/api/method/library_management.api.accept_offer?job_offer={doc.name}"
           style="background:#4CAF50;color:white;padding:10px 20px;text-decoration:none;border-radius:5px;">
            ✅ Accept Offer
        </a>
        &nbsp;&nbsp;
        <a href="{get_url()}/api/method/library_management.api.reject_offer?job_offer={doc.name}"
           style="background:#f44336;color:white;padding:10px 20px;text-decoration:none;border-radius:5px;">
            ❌ Reject Offer
        </a>
    </p>
    <p>Best regards,<br>HR Team<br>Excellent Minds</p>
    """

    try:
        frappe.sendmail(
            recipients=[doc.applicant_email],
            subject=subject,
            message=message
        )
        frappe.log_error(f"Email sent to {doc.applicant_email}", "Job Offer Email Sent")

    except Exception as e:
        frappe.log_error(f"Error sending mail: {str(e)}", "Job Offer Email Error")
