# -*- coding: utf-8 -*-
# Copyright (c) 2020, Aseel and contributors
# For license information, please see license.txt

from __future__ import unicode_literals
import frappe
from frappe import _, scrub, ValidationError
from frappe.utils import flt, comma_or, nowdate, getdate, add_days, now
from frappe.model.document import Document

class AssignmentTransaction(Document):
	def validate(self):
		self.set_status()

	def set_status(self,status=None):
		if self.is_new():
			self.db_set('status','Draft')
			self.db_set('posting_date', now())			
			return
		elif self.docstatus==1 and self.status=='Draft' :
			self.db_set('status','Assigned')			
			self.db_set('posting_date', now())		
			return
		frappe.msgprint('on_change_status')
		##self.is_receipt=1		
		if status:
			if status=='Received':
				self.set('receive_date',now())
			elif status=='Completed':
				self.set('closing_date',now())
			self.set('status', status)
			return
		#self.save()
		#self.reload()

	def on_submit(self):
		frappe.msgprint('on_submit')
		if self.administrative_transaction:
			frappe.msgprint('on_submit')
			##frappe.get_doc("Administrative Transaction", self.administrative_transaction).validate()

	def before_submit(self):
		self.set_status(status='Open')
		if self.administrative_transaction:
			frappe.get_doc("Administrative Transaction", self.administrative_transaction).set_status(update=True,status='Pending')
			


@frappe.whitelist()
def get_assignment_transaction(dt, dn):
	doc = frappe.get_doc(dt, dn)

	if dt in ("Administrative Transaction"):
		administrative_transaction = dn
		assignment_transaction=None

	elif dt in ("Assignment Transaction"):
		doc_ac = frappe.get_doc("Assignment Transaction", dn)
		administrative_transaction = doc_ac.administrative_transaction
		assignment_transaction=dn


	at = frappe.new_doc("Assignment Transaction")
	at.administrative_transaction = administrative_transaction
	at.assignment_transaction=assignment_transaction
	

	at.posting_date=now()
	at.exp_closing_date=add_days(now(), frappe.db.get_single_value("Administrative Communication Settings", "default_assignment_closing_expected_days"))

	emp_name=frappe.get_value('Employee',{'user_id': frappe.session.user}, 'name')
	if emp_name:
		at.assigned_by_employee=emp_name
		at.assigned_by_user=frappe.session.user
		emp_dep=frappe.get_value('Employee',{'name': emp_name}, 'department')
		if emp_dep:
			at.assigned_by_department=emp_dep
		else:
			frappe.msgprint(_('this employee {0} has not department'.format(emp_name)))
	else:
		frappe.throw(_("This user {0} has not employee".format(frappe.session.user)))

	return at

