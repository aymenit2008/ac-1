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
	
	message = get_message()

	return columns, data, message

def get_conditions(filters):
	conditions = ""
	if filters.get("status"):
		conditions += " AND adt.status = %(status)s"

	return conditions

def get_data(filters, conditions):
	data = frappe.db.sql("""
		SELECT
			ast.name, 
			ast.assignment_transaction_action,
			ast.status,
			ast.assigned_by_department,
			ast.assigned_to_department,
			ast.posting_date,
			ast.posting_date receive_date,
			ast.posting_date closing_date,						
			DATEDIFF(IFNULL(ast.posting_date,NOW()), ast.posting_date) AS lating_days,
			ast.assignment_transaction
		FROM
			`tabAssignment Transaction` ast	
		WHERE			
			ast.administrative_transaction = %(administrative_transaction)s			
			{0}
			order by ast.name asc""".format(conditions), filters, as_dict=1)

	return data

def get_columns(filters):	
	columns = [	
	{
		"fieldname": "name",
		"label": _("Assignment Transaction"),
		"fieldtype": "Link",
		"options": "Assignment Transaction",
		"width": 110
	},	
	{
		"fieldname": "assignment_transaction_action",
		"label": _("Assignment Transaction Action"),
		"fieldtype": "Data",		
		"width": 300
	},
	{
		"fieldname": "status",
		"label": _("Status"),
		"fieldtype": "Select",		
		"width": 80
	},
	{
		"fieldname": "assigned_by_department",
		"label": _("By Department"),
		"fieldtype": "Data",		
		"width": 100
	},
	{
		"fieldname": "assigned_to_department",
		"label": _("To Department"),
		"fieldtype": "Data",		
		"width": 100
	},
	{
		"fieldname": "posting_date",
		"label": _("Transaction Date"),
		"fieldtype": "Date",
		"width": 90
	},
	{
		"fieldname": "receive_date",
		"label": _("Receive Date"),
		"fieldtype": "Date",
		"width": 90
	},
	{
		"fieldname": "closing_date",
		"label": _("Closing Date"),
		"fieldtype": "Date",
		"width": 90
	},
	{
		"fieldname": "lating_days",
		"label": _("Lating Dates"),
		"fieldtype": "Int",
		"width": 50
	},	
	{
		"fieldname": "assignment_transaction",
		"label": _("Assignment Transaction"),
		"fieldtype": "Link",
		"options": "Assignment Transaction",
		"width": 110
	}
	]

	return columns

def get_message():
	return  """<span class="indicator">
		Valid till : &nbsp;&nbsp;
		</span>
		<span class="indicator orange">
		Expires in a week or less
		</span>
		&nbsp;&nbsp;
		<span class="indicator red">
		Expires today / Already Expired
		</span>"""