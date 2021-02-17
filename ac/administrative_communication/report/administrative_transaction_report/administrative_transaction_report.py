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
			adt.name, adt.subject,
			adt.status,  
			(select IFNULL(GROUP_CONCAT(ast.assigned_to_department order by ast.name asc SEPARATOR ', '),"") as departments from `tabAssignment Transaction` ast where ast.administrative_transaction=adt.name) as departments,
			adt.transaction_date,			
			DATEDIFF(IFNULL(adt.closing_date,NOW()), adt.posting_date) AS lating_days
		FROM
			`tabAdministrative Transaction` adt	
		WHERE
			adt.docstatus < 2
			AND adt.company = %(company)s
			AND adt.transaction_date between %(from_date)s and %(to_date)s
			{0}
			order by adt.name desc""".format(conditions), filters, as_dict=1)

	return data

def get_columns(filters):	
	columns = [
	{
		"fieldname": "name",
		"label": _("Administrative Transaction"),
		"fieldtype": "Link",
		"options": "Administrative Transaction",
		"width": 110
	},
	{
		"fieldname": "subject",
		"label": _("Subject"),
		"fieldtype": "Data",		
		"width": 400
	},
	{
		"fieldname": "status",
		"label": _("Status"),
		"fieldtype": "Select",		
		"width": 80
	},
	{
		"fieldname": "departments",
		"label": _("Departments"),
		"fieldtype": "Data",		
		"width": 300
	},
	{
		"fieldname": "transaction_date",
		"label": _("Transaction Date"),
		"fieldtype": "Date",
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