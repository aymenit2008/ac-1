// Copyright (c) 2021, Aseel and contributors
// For license information, please see license.txt

frappe.ui.form.on('Administrative Communication Party', {
	setup: function(frm) {

		frm.set_query('primary_contact', function(doc) {
			return {
				filters: {
					'link_doctype': 'Administrative Communication Party',
					'link_name': doc.name
				}
			}
		})
		frm.set_query('primary_address', function(doc) {
			return {
				filters: {
					'link_doctype': 'Administrative Communication Party',
					'link_name': doc.name
				}
			}
		})
	},
	refresh: function(frm) {
		frappe.dynamic_link = {doc: frm.doc, fieldname: 'name', doctype: 'Administrative Communication Party'}
		frm.toggle_display(['address_html','contact_html'], !frm.doc.__islocal);
		if(!frm.doc.__islocal) {
			frappe.contacts.render_address_and_contact(frm);
		}else{
			frappe.contacts.clear_address_and_contact(frm);
		}

	}
});
