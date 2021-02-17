// Copyright (c) 2016, Aseel and contributors
// For license information, please see license.txt
/* eslint-disable */

frappe.query_reports["Administrative Transaction Report"] = {
	"filters": [
		{
			fieldtype: "Link",
			label: __("Company"),
			options: "Company",
			fieldname: "company",
			default: frappe.defaults.get_user_default("Company"),
			"reqd": 1
		},
		{
			"fieldname": "from_date",
			"label": __("From Date"),
			"fieldtype": "Date",
			"width": "80",
			"reqd": 1,
			"default": frappe.datetime.add_months(frappe.datetime.get_today(), -1),
		},
		{
			"fieldname": "to_date",
			"label": __("To Date"),
			"fieldtype": "Date",
			"width": "80",
			"reqd": 1,
			"default": frappe.datetime.get_today()
		},
		{
			fieldtype: "Select",
			label: __("Status"),
			options: ["", "Draft", "Open", "Pending", "Completed", "Cancelled"],
			fieldname: "status",
			default: ''
		},
	],
	formatter: (value, row, column, data, default_formatter) => {
		value = default_formatter(value, row, column, data);
		//if (column.fieldname === "status") {
		if (data.status == 'Draft') {
			value = `<div style="color:red">${value}</div>`;
		}
		else if (data.status == 'Open') {
			value = `<div style="color:darkorange">${value}</div>`;
		}
		else if (data.status == 'Pending') {
			value = `<div style="color:blue">${value}</div>`;
		}
		else if (data.status == 'Completed') {
			value = `<div style="color:green">${value}</div>`;
		}
		else if (data.status == 'Cancelled') {
			value = `<div style="color:red">${value}</div>`;
		}
		//}		
		return value;
	},
};
