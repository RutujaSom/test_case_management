import frappe

def send_email_report():
    print("✅ Cron job is running...")

    frappe.sendmail(
        recipients=["admin@example.com"],
        subject="Cron Test",
        message="This is a test email from a cron job."
    )

    print("📨 Email sent successfully.")