# import frappe
# from frappe import _
# from hrms.hr.doctype.interview.interview import Interview as ERPInterview


# class CustomInterview(ERPInterview):
#     def validate(self):
#         frappe.msgprint("[DEBUG] CustomInterview.validate() called")

#         if not self.job_applicant or not self.round_name:
#             return

#         duplicate = frappe.db.exists("Interview", {
#             "job_applicant": self.job_applicant,
#             "round_name": self.round_name,
#             "name": ["!=", self.name]
#         })

#         if duplicate:
#             frappe.throw(_(
#                 f"Interview round '{self.round_name}' is already scheduled for applicant '{self.applicant_name}'."
#             ))


# import frappe
# from frappe import _
# from hrms.hr.doctype.interview.interview import Interview as ERPInterview

# class CustomInterview(ERPInterview):
#     def validate(self):
#         if not self.job_applicant or not self.interview_round:
#             return

#         duplicate = frappe.db.exists("Interview", {
#             "job_applicant": self.job_applicant,
#             "interview_round": self.interview_round,
#             "name": ["!=", self.name]
#         })

#         if duplicate:
#             frappe.throw(_(
#                 f"Interview round '{self.interview_round}' is already scheduled for applicant '{self.applicant_name}'."
#             ))




import frappe
from frappe import _
from hrms.hr.doctype.interview.interview import Interview as ERPInterview

class CustomInterview(ERPInterview):
    def validate(self):
        if not self.job_applicant or not self.interview_round:
            return

        # Safely get applicant name from Job Applicant doctype
        applicant_name = frappe.db.get_value(
            "Job Applicant", self.job_applicant, "applicant_name"
        ) or self.job_applicant  # fallback

        # Check for duplicate interview round for same applicant
        duplicate = frappe.db.exists("Interview", {
            "job_applicant": self.job_applicant,
            "interview_round": self.interview_round,
            "name": ["!=", self.name]
        })

        if duplicate:
            frappe.throw(_(
                f"Interview round '{self.interview_round}' is already scheduled for applicant '{applicant_name}'."
            ))



# import frappe
# from frappe import _
# from hrms.hr.doctype.interview.interview import Interview as ERPInterview

# class CustomInterview(ERPInterview):
#     def validate(self):
#         self.check_duplicate_interview()
#         self.populate_interview_skills_from_job_opening()  # Now runs on every save

#     def check_duplicate_interview(self):
#         if not self.job_applicant or not self.interview_round:
#             return

#         duplicate = frappe.db.exists("Interview", {
#             "job_applicant": self.job_applicant,
#             "interview_round": self.interview_round,
#             "name": ["!=", self.name]
#         })

#         if duplicate:
#             applicant_name = frappe.db.get_value("Job Applicant", self.job_applicant, "applicant_name")
#             frappe.throw(_(
#                 f"Interview round '{self.interview_round}' is already scheduled for applicant '{applicant_name or self.job_applicant}'."
#             ))

#     def populate_interview_skills_from_job_opening(self):
#         if not self.job_opening:
#             return

#         try:
#             job_opening = frappe.get_doc("Job Opening", self.job_opening)
#         except frappe.DoesNotExistError:
#             frappe.throw(_("Job Opening not found"))

#         skills = job_opening.get("custom_rquired_skills")
#         if not skills:
#             return

#         # Clear previous skills before adding new ones
#         self.set("custom_interview_skills", [])

#         for skill_row in skills:
#             if skill_row.skill:
#                 self.append("custom_interview_skills", {
#                     "skill": skill_row.skill,
#                     "skill_type": skill_row.skill_type
#                 })


