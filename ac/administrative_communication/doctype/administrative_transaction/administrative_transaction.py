# -*- coding: utf-8 -*-
# Copyright (c) 2020, Aseel and contributors
# For license information, please see license.txt

from __future__ import unicode_literals
import frappe
from frappe import _, scrub, ValidationError
from frappe.model.document import Document
from frappe.utils import flt, comma_or, nowdate, getdate, now

class AdministrativeTransaction(Document):
	def validate(self):
		##frappe.msgprint('on valide AdministrativeTransaction')
		self.set_status()

	def before_cancel(self):
		self.set_status()

	def before_submit(self):
		self.set_status(update=True,status='Open')
		#self.posting_date=now()

	def set_status(self, update=False, status=None, update_modified=True):
		if self.is_new():
			self.status = 'Draft'
			self.db_set('posting_date', now())
			return
		
		if self.docstatus==1 and self.status=='Draft' :
			self.status='Open'
			self.db_set('posting_date', now(), update_modified = update_modified)
			return

		if update:
			if status=='Pending':
				self.db_set('status', status, update_modified = update_modified)
				self.db_set('assignment_date', now(), update_modified = update_modified)
				return
			elif status=='Open':
				self.db_set('status', status, update_modified = update_modified)
				self.db_set('posting_date', now(), update_modified = update_modified)
				return
			elif status=='Completed':
				self.db_set('status', status, update_modified = update_modified)
				self.db_set('closing_date', now(), update_modified = update_modified)
				return
			else:
				self.db_set('status', status, update_modified = update_modified)				
				return

@frappe.whitelist()
def get_decision_and_generalization(dt, dn):
	doc = frappe.get_doc(dt, dn)
	dg = frappe.new_doc("Decisions And Generalizations")

	if dt in ("Administrative Transaction"):
		dg.administrative_transaction = dn
		dg.content=doc.content
		dg.subject=doc.subject

	return dg


		
