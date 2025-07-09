# Copyright (c) 2025, Rutuja Somvanshi and contributors
# For license information, please see license.txt

# import frappe
from frappe.model.document import Document
import frappe

class TestProject(Document):
	def autoname(self):
		print('self. ....', self.title)
		self.name = frappe.scrub(self.title).replace("_", "-")

