# -*- coding: utf-8 -*-
# Copyright (c) 2020, Aseel and contributors
# For license information, please see license.txt

from __future__ import unicode_literals
import frappe
from frappe import _, scrub, ValidationError
from frappe.model.document import Document
from frappe.utils import flt, comma_or, nowdate, getdate, add_days, now

class AssignmentTransaction(Document):
	def on_update_after_submit(self):
		if not self.assignment_transaction:		
			aa=frappe.db.get_list('Assignment Transaction',filters={'administrative_transaction': self.administrative_transaction,'assignment_transaction':("=", ""),'docstatus':1},fields=['status', 'name'])		
			newstatus=''
			for a in aa:				
				if a.status=='Completed':
					newstatus='Completed'
				else:					
					newstatus='Pending'
				##frappe.msgprint('{0} = {1}'.format(a.name,a.status))
			if newstatus!='':
				doc = frappe.get_doc("Administrative Transaction", self.administrative_transaction)
				if doc.status!=newstatus:
					doc.set_status(update=True,status=newstatus,update_modified=False)
					doc.reload()

	def validate(self):	
		if self.is_new():
			self.status='Draft'
			if not self.posting_date:
				self.posting_date=now()
			if not self.exp_closing_date:
				self.exp_closing_date=add_days(now(), frappe.db.get_single_value("Administrative Communication Settings", "default_assignment_closing_expected_days"))
		if self.assigned_to_type=='Employee':
			if not self.assigned_to_employee:
				frappe.throw(_('Assigned to Employee is Mandatory'))
		elif self.assigned_to_type=='Department':
			if not self.assigned_to_department:
				frappe.throw(_('Assigned to Department is Mandatory'))
		if self.posting_date>=self.exp_closing_date:
			frappe.throw(_('Posting Date Cannot be Greater than Expected Date'))
		self.set_title()


	def set_reply(self,reply=None):
		if not reply:	
			frappe.throw('Replay is Required')
		if self.status=='Received':
			self.validate_user()						
			if self.assignment_description_result==reply:
				frappe.throw(_('Replay Must to be Not Same Last Replay'))
			else:
				self.assignment_description_result=reply
		else:
			frappe.throw(_('Status Should to be Received First'))
		return True					
		
	def set_status(self,status=None,reason=None):	
		if status:
			if status=='Received' or status=='Rejected':
				self.validate_user_()
				self.receive_date=now()				
			elif status=='Replied':
				self.validate_user_()				
				self.reply_date=now()				
			elif status=='Completed':
				self.validate_user()
				if self.posting_date>=now():
					frappe.throw(_('Posting Date Cannot be Greater than Closing Date'))
				self.closing_date=now()
			elif status=='Cancelled':
				self.validate_user__()
				self.closing_date=now()
			self.status=status
			self.append('assignment_transaction_trace',{
            	'status':self.status,
            	'user':frappe.session.user,            
            	'date':now()})
			if status=='Rejected':
				self.assignment_description_result=_("Reason of Reject: {0}".format(reason))
				self.add_comment('Comment', text=self.assignment_description_result)
		self.save()
		self.reload()

	def validate_user(self):
		authorized_role=frappe.db.get_single_value("Administrative Communication Settings", "role_allowed_to_set_status")				
		if frappe.session.user!='Administrator' and frappe.session.user!=self.assigned_by_user:
			if authorized_role:
				if authorized_role not in frappe.get_roles(frappe.session.user):
					frappe.throw(_('You are not authorized to change status of current Assignment Transaction'))				
	def validate_user_(self):
		authorized_role=frappe.db.get_single_value("Administrative Communication Settings", "role_allowed_to_set_status")				
		if frappe.session.user!='Administrator' and frappe.session.user!=self.assigned_to_user:
			if authorized_role:
				if authorized_role not in frappe.get_roles(frappe.session.user):
					frappe.throw(_('You are not authorized to change status of current Assignment Transaction'))				
	def validate_user__(self):
		authorized_role=frappe.db.get_single_value("Administrative Communication Settings", "role_allowed_to_set_status")				
		if frappe.session.user!='Administrator':
			if authorized_role:
				if authorized_role not in frappe.get_roles(frappe.session.user):
					frappe.throw(_('You are not authorized to change status of current Assignment Transaction'))				
	def before_submit(self):
		self.status='Open'
		self.posting_date=now()
		self.append('assignment_transaction_trace',{
            'status':self.status,
            'user':frappe.session.user,            
            'date':now()})
		##frappe.msgprint('before_submit')
	
	def on_submit(self):
		frappe.get_doc("Administrative Transaction", self.administrative_transaction).set_status(update=True,status='Pending')
		from frappe.share import add
		if self.assigned_to_user:
			add(self.doctype, self.name, self.assigned_to_user, 1, 1, 1, 0)
		if self.assignment_transaction_cc:
			for atc in self.assignment_transaction_cc:
				if atc.employee_email:
					add(self.doctype, self.name, atc.employee_email, 1, 0, 0, 0)
	
	def set_title(self):
		'''Set title '''
		if not self.title:
			doc = frappe.get_doc('Administrative Transaction', self.administrative_transaction)			
			self.title = _('{0} ({1}) - {2}').format(self.assignment_transaction_action, doc.subject, self.assigned_to_employee_name)
			


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
			frappe.msgprint(_('This Employee {0} has not Department'.format(emp_name)))
	else:
		frappe.throw(_("This user {0} has not Employee".format(frappe.session.user)))

	return at