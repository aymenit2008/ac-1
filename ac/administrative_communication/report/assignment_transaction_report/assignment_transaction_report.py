# Copyright (c) 2013, Frappe Technologies Pvt. Ltd. and contributors
# For license information, please see license.txt

from __future__ import unicode_literals
import frappe
from frappe.utils import flt, cint
from frappe import _
from collections import defaultdict
from erpnext.setup.utils import get_exchange_rate

def execute(filters=None):
	if not filters:
		return [], []

	columns = get_columns(filters)
	conditions = get_conditions(filters)
	data = get_data(filters, conditions)

	return columns, data

def get_conditions(filters):
	conditions = ""
	if filters.get("status"):
		conditions += " AND ast.status = %(status)s"

	return conditions

def get_data(filters, conditions):
	data = frappe.db.sql("""
		SELECT
			ast.name,ast.administrative_transaction,ast.title,ast.assigned_by_employee_name,ast.assigned_by_department,
			ast.assigned_to_department,ast.assigned_to_employee_name,
			ast.status,ast.assignment_transaction_action,
			at.subject,  
			ast.receive_date,			
			DATEDIFF(IFNULL(ast.closing_date,NOW()), ast.receive_date) AS lating_days
		FROM
			`tabAssignment Transaction` ast
			INNER JOIN `tabAdministrative Transaction` at on ast.administrative_transaction=at.name 
		WHERE
			ast.docstatus < 2
			AND ast.receive_date between %(from_date)s and %(to_date)s
			{0}
			order by ast.naming_series desc""".format(conditions), filters, as_dict=1)

	return data

def get_columns(filters):	
	columns = [
	{
		"fieldname": "administrative_transaction",
		"label": _("administrative_transaction"),
		"fieldtype": "Link",
		"options": "Administrative Transaction",		
		"width": 110
	},
	{
		"fieldname": "name",
		"label": _("Assignment Transaction"),
		"fieldtype": "Link",
		"options": "Assignment Transaction",
		"width": 110
	},
	{
		"fieldname": "status",
		"label": _("Status"),
		"fieldtype": "Select",		
		"width": 80
	},
	
	{
		"fieldname": "assignment_transaction_action",
		"label": _("Action"),
		"fieldtype": "Link",
		"options": "Assignment Transaction Action",		
		
		"width": 100
	},
	{
		"fieldname": "subject",
		"label": _("Administrative Transaction Title"),
		"fieldtype": "Data",		
		"width": 100
	},
	{
		"fieldname": "assigned_by_department",
		"label": _("Assigned By Employee Department"),
		"fieldtype": "Data",		
		"width": 100
	},
	{
		"fieldname": "assigned_by_employee_name",
		"label": _("Assigned By Employee Name"),
		"fieldtype": "Data",		
		"width": 100
	},
	{
		"fieldname": "assigned_to_department",
		"label": _("Assigned To Department"),
		"fieldtype": "Data",		
		"width": 100
	},
	{
		"fieldname": "assigned_to_employee_name",
		"label": _("Assigned To Employee Name"),
		"fieldtype": "Data",		
		"width": 100
	},
	
	{
		"fieldname": "receive_date",
		"label": _("Receive Date"),
		"fieldtype": "Datetime",
		"width": 90
	},
	{
		"fieldname": "lating_days",
		"label": _("Lating Dates"),
		"fieldtype": "Int",
		"width": 50
	},
	]

	return columns