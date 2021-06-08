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
		if self.ac_attachments:
			self.attachments_count=0
			for att in self.ac_attachments:
				self.attachments_count+=att.attachment_count
		if not self.is_new() and self.source=='Out':
			from frappe.share import add
			if self.small_user_signature and self.small_user_signature!=frappe.session.user:
				add(self.doctype, self.name, user=self.small_user_signature, read=1, write=1, share=1, everyone=0,notify=1)
			if self.user_signature and self.user_signature!=frappe.session.user:
				add(self.doctype, self.name, user=self.user_signature, read=1, write=1, share=1, everyone=0,notify=1)

	def before_cancel(self):
		self.set_status()

	def on_cancel(self):
		self.db_set('status', 'Cancelled', update_modified = True)
		
	def before_submit(self):
		self.set_status(update=True,status='Open')
		#self.posting_date=now()

	def set_status(self, update=False, status=None, update_modified=True):
		self.flags.ignore_permissions = 1
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
			elif status=='Cancelled':
				self.db_set('status', status, update_modified = update_modified)
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

@frappe.whitelist()
def get_administrative_transaction(dt, dn):	
	doc = frappe.get_doc(dt, dn)
	at = frappe.new_doc("Administrative Transaction")
	at.source='صادر'
	if dt in ("Assignment Transaction"):
		doc_ac = frappe.get_doc("Assignment Transaction", dn)
		
		at.assignment_transaction=doc_ac.name
		at.content=doc_ac.assignment_description_result
		##
		doc_at = frappe.get_doc("Administrative Transaction", doc_ac.administrative_transaction)
		if doc_at:
			at.subject=_("Replay: {0}".format(doc_at.subject))
			at.source=doc_at.source
			at.inbox_party_type=doc_at.inbox_party_type
			at.inbox_party=doc_at.inbox_party
			at.inbox_party_name=doc_at.inbox_party_name			
			at.inbox_type=doc_at.inbox_type
			at.inbox_date=nowdate()
			at.inbox_contact=doc_at.inbox_contact
			at.inbox_contact_name=doc_at.inbox_contact_name
			at.inbox_contact_email=doc_at.inbox_contact_email
			at.inbox_contact_mobile=doc_at.inbox_contact_mobile			
			at.append('ac_links',{'administrative_transaction':doc_ac.administrative_transaction})
	return at

		
