// Copyright (c) 2016, Aseel and contributors
// For license information, please see license.txt
/* eslint-disable */

frappe.query_reports["Administrative Transaction Tracks"] = {
	"filters": [
		{
			fieldtype: "Link",
			label: __("Administrative Transaction"),
			options: "Administrative Transaction",
			fieldname: "administrative_transaction",			
			"reqd": 1
		}
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
		else if (data.status == 'Received') {
			value = `<div style="color:blue">${value}</div>`;
		}
		else if (data.status == 'Hold') {
			value = `<div style="color:black">${value}</div>`;
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
