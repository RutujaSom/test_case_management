# Copyright (c) 2025, Rutuja Somvanshi and contributors
# For license information, please see license.txt

# import frappe
from frappe.model.document import Document
import frappe

class TestCaseBank(Document):
	
	def validate(self):
		if self.workflow_state == "Rejected" and not self.remark:
			frappe.throw("Remark is mandatory when rejecting")
