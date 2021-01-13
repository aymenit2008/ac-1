// Copyright (c) 2015, Frappe Technologies Pvt. Ltd. and Contributors
// License: GNU General Public License v3. See license.txt

// render
frappe.listview_settings['Administrative Transaction'] = {
	//hide_name_column: true,
	add_fields: ["source", "type", "category"],
	get_indicator: function(doc) {
		var status_color = {
			"Draft": "orange",
			"Open": "darkgrey",
			"Pending": "blue",
			"Received": "blue",
			"Completed": "green",
			"Cancelled": "red"
		};
		return [__(doc.status), status_color[doc.status], "status,=,"+doc.status];
	},
	button: {
		show: function(doc) {
			return doc.name;
		},
		get_label: function() {
			return __('Open');
		},
		get_description: function(doc) {
			return __('Open {0}', [`${doc.name}`])
		},
		action: function(doc) {
			frappe.route_options = {
				"administrative_transaction": doc.name
			};
			frappe.set_route("query-report", "Administrative Transaction Tracks");
		}
	},
};
