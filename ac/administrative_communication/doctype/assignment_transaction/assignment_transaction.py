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
		if not self.assignment_transaction and self.administrative_transaction:		
			aa=frappe.db.get_list('Assignment Transaction',filters={'administrative_transaction': self.administrative_transaction,'assignment_transaction':("=", ""),'docstatus':1},fields=['status', 'name'])		
			newstatus=''
			for a in aa:				
				if a.status=='Completed':
					newstatus='Completed'
				else:					
					newstatus='Pending'
				##frappe.msgprint('{0} = {1}'.format(a.name,a.status))
			if newstatus!='':
				if self.administrative_transaction:
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
			self.validate_user_()						
			if self.assignment_description_result==reply:
				frappe.throw(_('Replay Must to be Not Same Last Replay'))
			else:
				self.flags.ignore_permissions = 1
				self.assignment_description_result=reply
				self.save()
				self.reload()
		else:
			frappe.throw(_('Status Should to be Received First'))
		
		
	def set_status(self,status=None,reason=None):		
		self.flags.ignore_permissions = 1
		if status:
			if status=='Received' or status=='Rejected':
				self.validate_user_()
				self.receive_date=now()				
			elif status=='Replied':
				self.validate_user_()								
			elif status=='Completed':
				self.validate_user()								
			elif status=='Cancelled':
				self.validate_user__()				
				frappe.db.set(self, 'status', 'Cancelled')
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

	def on_cancel(self):
		self.db_set('status', 'Cancelled', update_modified = True)		
	
	def on_submit(self):
		if self.administrative_transaction:
			frappe.get_doc("Administrative Transaction", self.administrative_transaction).set_status(update=True,status='Pending')
		from frappe.share import add
		if self.assigned_to_user:
			add(self.doctype, self.name, user=self.assigned_to_user, read=1, write=1, share=1, everyone=0,notify=1)			
		if self.assignment_transaction_cc:
			for atc in self.assignment_transaction_cc:
				if atc.employee_email:
					add(self.doctype, self.name, user=atc.employee_email, read=1, write=0, share=0, everyone=0,notify=1)
	
	def set_title(self):
		'''Set title '''
		if not self.title:
			if self.administrative_transaction:
				doc = frappe.get_doc('Administrative Transaction', self.administrative_transaction)			
				self.title = _('{0} ({1}) - {2}').format(self.assignment_transaction_action, doc.subject, self.assigned_to_employee_name)
			else:
				self.title = self.assignment_transaction_action
			


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

@frappe.whitelist()
def update_status(name,status=None,reason=None):
	at = frappe.get_doc("Assignment Transaction", name)
	at.set_status(status,reason)

@frappe.whitelist()
def update_reply(name,reply):
	at = frappe.get_doc("Assignment Transaction", name)
	at.set_reply(reply)

@frappe.whitelist()
def get_doc_details(dt, dn):
	doc = frappe.get_doc(dt, dn)

	if dt in ("Administrative Transaction"):
		frappe.msgprint("""<ul style='direction:rtl'>
			<li><b style='color:blue'>Source</b><h4>{0}</h4></li>
			<li><b style='color:blue'>Type</b><h4>{1}<h4> </li>
			<li><b style='color:blue'>Subject</b><h4>{2}<h4> </li>
			<li><b style='color:blue'>Category</b><h4>{3}<h4></li>
			<li><b style='color:blue'>Priority</b><h4>{4}<h4> </li>
			<li><b style='color:blue'>Original Type</b><h4>{5}<h4></li>
			<li><b style='color:blue'>Security Level</b><h4>{6}<h4></li>
			<li><b style='color:blue'>Content</b><h4>{7}</li>
			</ul>""".format(doc.source,doc.type,doc.subject,doc.category,doc.priority,doc.orginal_type,doc.secret_level,doc.content))

	elif dt in ("Assignment Transaction"):
		frappe.msgprint("""<ul style='direction:rtl'>
			<li><b style='color:blue'>Assignment Transaction Action</b><h4>{0}</h4></li>
			<li><b style='color:blue'>Status</b><h4>{1}<h4> </li>
			<li><b style='color:blue'>Description</b><h4>{2}<h4> </li>
			<li><b style='color:blue'>From Department</b><h4>{3}<h4></li>
			<li><b style='color:blue'>From Employee Name</b><h4>{4}<h4> </li>			
			<li><b style='color:blue'>To Department</b><h4>{5}<h4></li>
			<li><b style='color:blue'>To Employee Name</b><h4>{6}</li>			
			</ul>""".format(doc.assignment_transaction_action,
			doc.status,
			doc.assignment_description,
			doc.assigned_by_department,
			doc.assigned_by_employee_name,			
			doc.assigned_to_department,
			doc.assigned_to_employee_name))

@frappe.whitelist()
def get_attachments(ac):
	attachments = frappe.db.get_list("Administrative Transaction Attachments",
		{"parent": ac}, "attachment_type")
	if not attachments:
		frappe.throw(_("There is no attachment"))
	return {
		"attachments": attachments		
	}	