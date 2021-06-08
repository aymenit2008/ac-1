# -*- coding: utf-8 -*-
# Copyright (c) 2021, Aseel and contributors
# For license information, please see license.txt


from __future__ import unicode_literals
import frappe
from frappe import _, scrub, ValidationError
from frappe.model.document import Document
from frappe.utils import flt, comma_or, nowdate, getdate, now
from frappe.desk.doctype.notification_log.notification_log import enqueue_create_notification,\
	get_title, get_title_html

class DecisionsAndGeneralizations(Document):
	def notify_users(self):
		from frappe.share import add
		if self.public:
			add(self.doctype, self.name, read=1, write=0, share=0, everyone=1,notify=1)			
		elif self.assignment_transaction_cc:
			for atc in self.assignment_transaction_cc:
				add(self.doctype, self.name, user=atc.employee_email, read=1, write=0, share=0, everyone=0,notify=1)
	
	def on_submit(self):
		self.notify_users()

@frappe.whitelist()
def make_action(dt,dn):
	doc = frappe.get_doc('Decisions And Generalizations', dn)
	if dt in ("Note"):
		dg = frappe.new_doc("Note")
		dg.title=doc.subject
		dg.content=doc.content
		dg.public=doc.public
		return dg
	elif dt in ("Event"):
		dg = frappe.new_doc("Event")
		dg.starts_on=doc.from_date
		dg.subject=doc.subject
		dg.description=doc.content
		return dg
	elif dt in ("Post"):
		dg = frappe.new_doc("Post")
		dg.content=doc.content
		return dg
	return
	
	
