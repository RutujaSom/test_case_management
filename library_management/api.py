# import frappe

# @frappe.whitelist(allow_guest=True)
# def accept_offer(job_offer):
#     doc = frappe.get_doc("Job Offer", job_offer)
#     doc.status = "Accepted"
#     doc.save(ignore_permissions=True)
#     return "Offer Accepted"

# @frappe.whitelist(allow_guest=True)
# def reject_offer(job_offer):
#     doc = frappe.get_doc("Job Offer", job_offer)
#     doc.status = "Rejected"
#     doc.save(ignore_permissions=True)
#     return "Offer Rejected"


# import frappe

# @frappe.whitelist(allow_guest=True)
# def accept_offer(job_offer):
#     doc = frappe.get_doc("Job Offer", job_offer)
#     doc.status = "Accepted"
#     doc.save(ignore_permissions=True)
#     frappe.db.commit()  # <-- important to commit the DB transaction
#     return "Offer Accepted"

# @frappe.whitelist(allow_guest=True)
# def reject_offer(job_offer):
#     doc = frappe.get_doc("Job Offer", job_offer)
#     doc.status = "Rejected"
#     doc.save(ignore_permissions=True)
#     frappe.db.commit()
#     return "Offer Rejected"





# import frappe

# @frappe.whitelist(allow_guest=True)
# def accept_offer(job_offer):
#     doc = frappe.get_doc("Job Offer", job_offer)
#     doc.status = "Accepted"
#     doc.save(ignore_permissions=True)
#     frappe.db.commit()

#     return frappe.respond_as_web_page(
#         title="",
#         html="""
#             <div style="text-align: center; padding: 80px 20px; font-family: sans-serif;">
#                 <h1 style="font-size: 32px; color: #333;">🎉 Thank you for accepting the job offer!</h1>
#                 <p style="font-size: 18px; color: #666;">We look forward to having you onboard.</p>
#             </div>
#         """,
#         success=True,
#        # template=""  # disables ERPNext default card layout
#     )


# @frappe.whitelist(allow_guest=True)
# def reject_offer(job_offer):
#     doc = frappe.get_doc("Job Offer", job_offer)
#     doc.status = "Rejected"
#     doc.save(ignore_permissions=True)
#     frappe.db.commit()

#     return frappe.respond_as_web_page(
#         title="",
#         html="""
#             <div style="text-align: center; padding: 80px 20px; font-family: sans-serif;">
#                 <h1 style="font-size: 32px; color: #c00;">❌ You've rejected the offer</h1>
#                 <p style="font-size: 18px; color: #666;">Thank you for your response. Best wishes for your future.</p>
#             </div>
#         """,
#         success=True,
#         #template=""  # disables ERPNext default card layout
#     )






# import frappe

# @frappe.whitelist(allow_guest=True)
# def accept_offer(job_offer):
#     doc = frappe.get_doc("Job Offer", job_offer)
#     doc.status = "Accepted"
#     doc.save(ignore_permissions=True)
#     frappe.db.commit()

#     # Respond with plain HTML page
#     frappe.local.response.type = "text/html"
#     frappe.local.response.response = f"""
#     <!DOCTYPE html>
#     <html>
#     <head>
#         <title>Offer Accepted</title>
#         <style>
#             body {{
#                 font-family: 'Segoe UI', sans-serif;
#                 background: #f4f6f9;
#                 margin: 0;
#                 padding: 0;
#                 display: flex;
#                 align-items: center;
#                 justify-content: center;
#                 height: 100vh;
#             }}
#             .container {{
#                 text-align: center;
#             }}
#             h1 {{
#                 font-size: 2.5rem;
#                 color: #333;
#             }}
#             p {{
#                 font-size: 1.2rem;
#                 color: #666;
#             }}
#         </style>
#     </head>
#     <body>
#         <div class="container">
#             <h1>🎉 Thank you for accepting the job offer!</h1>
#             <p>We look forward to having you onboard.</p>
#         </div>
#     </body>
#     </html>
#     """


# @frappe.whitelist(allow_guest=True)
# def reject_offer(job_offer):
#     doc = frappe.get_doc("Job Offer", job_offer)
#     doc.status = "Rejected"
#     doc.save(ignore_permissions=True)
#     frappe.db.commit()

#     frappe.local.response.type = "text/html"
#     frappe.local.response.response = f"""
#     <!DOCTYPE html>
#     <html>
#     <head>
#         <title>Offer Rejected</title>
#         <style>
#             body {{
#                 font-family: 'Segoe UI', sans-serif;
#                 background: #fff0f0;
#                 margin: 0;
#                 padding: 0;
#                 display: flex;
#                 align-items: center;
#                 justify-content: center;
#                 height: 100vh;
#             }}
#             .container {{
#                 text-align: center;
#             }}
#             h1 {{
#                 font-size: 2.5rem;
#                 color: #c00;
#             }}
#             p {{
#                 font-size: 1.2rem;
#                 color: #444;
#             }}
#         </style>
#     </head>
#     <body>
#         <div class="container">
#             <h1>❌ You have rejected the job offer</h1>
#             <p>Thank you for your response. Wishing you the best!</p>
#         </div>
#     </body>
#     </html>
#     """





# import frappe

# @frappe.whitelist(allow_guest=True)
# def accept_offer(job_offer):
#     doc = frappe.get_doc("Job Offer", job_offer)
#     doc.status = "Accepted"
#     doc.save(ignore_permissions=True)
#     frappe.db.commit()

#     return frappe.respond_as_web_page(
#         title="Offer Accepted",
#         html="""
#             <style>
#                 body {
#                     font-family: 'Segoe UI', sans-serif;
#                     background: #f4f6f9;
#                     margin: 0;
#                     padding: 0;
#                     display: flex;
#                     align-items: center;
#                     justify-content: center;
#                     height: 100vh;
#                 }
#                 .container {
#                     text-align: center;
#                 }
#                 h1 {
#                     font-size: 2.5rem;
#                     color: #333;
#                 }
#                 p {
#                     font-size: 1.2rem;
#                     color: #666;
#                 }
#             </style>
#             <div class="container">
#                 <h1>🎉 Thank you for accepting the job offer!</h1>
#                 <p>We look forward to having you onboard.</p>
#             </div>
#         """,
#         success=True
#     )


# @frappe.whitelist(allow_guest=True)
# def reject_offer(job_offer):
#     doc = frappe.get_doc("Job Offer", job_offer)
#     doc.status = "Rejected"
#     doc.save(ignore_permissions=True)
#     frappe.db.commit()

#     return frappe.respond_as_web_page(
#         title="Offer Rejected",
#         html="""
#             <style>
#                 body {
#                     font-family: 'Segoe UI', sans-serif;
#                     background: #fff0f0;
#                     margin: 0;
#                     padding: 0;
#                     display: flex;
#                     align-items: center;
#                     justify-content: center;
#                     height: 100vh;
#                 }
#                 .container {
#                     text-align: center;
#                 }
#                 h1 {
#                     font-size: 2.5rem;
#                     color: #c00;
#                 }
#                 p {
#                     font-size: 1.2rem;
#                     color: #444;
#                 }
#             </style>
#             <div class="container">
#                 <h1>❌ You have rejected the job offer</h1>
#                 <p>Thank you for your response. Wishing you the best!</p>
#             </div>
#         """,
#         success=True
#     )







import frappe
from frappe import _

@frappe.whitelist(allow_guest=True)
def accept_offer(job_offer):
    if not job_offer:
        return "Missing job_offer parameter"

    doc = frappe.get_doc("Job Offer", job_offer)
    doc.status = "Accepted"
    doc.save(ignore_permissions=True)
    frappe.db.commit()

    # Respond with plain HTML (no card layout)
    return frappe.respond_as_web_page(
        title="Offer Accepted",
        html="""
        <div style="text-align:center; padding:60px; font-family:sans-serif;">
            <h1 style="color:green;">🎉 Thank you for accepting the job offer!</h1>
            <p>We look forward to having you onboard.</p>
        </div>
        """,
        success=True,
        indicator_color="green"
    )

@frappe.whitelist(allow_guest=True)
def reject_offer(job_offer):
    if not job_offer:
        return "Missing job_offer parameter"

    doc = frappe.get_doc("Job Offer", job_offer)
    doc.status = "Rejected"
    doc.save(ignore_permissions=True)
    frappe.db.commit()

    return frappe.respond_as_web_page(
        title="Offer Rejected",
        html="""
        <div style="text-align:center; padding:60px; font-family:sans-serif; background:#fff4f4;">
            <h1 style="color:red;">❌ You have rejected the job offer</h1>
            <p>Thank you for your response. Wishing you the best!</p>
        </div>
        """,
        success=True,
        indicator_color="red"
    )
