// Copyright (c) 2021, Aseel and contributors
// For license information, please see license.txt

frappe.ui.form.on('Decisions And Generalizations', {

	
	refresh: function(frm) {
		if(frm.doc.docstatus==1){
			frm.add_custom_button(
				__('نشر'),
				function() {
					return frappe.call({
						doc: frm.doc,
						method: 'notify_users',
						callback: function(r) {
						}
					})
				},
				__('نشر')
			);
			frm.add_custom_button(
				__('ملاحظة في النظام'),
				function() {
					frm.events.make_action(frm,"Note");
				},
				__('Make')
			);
			frm.add_custom_button(
				__('منشور داخلي'),
				function() {
					frm.events.make_action(frm,"Post");
				},
				__('Make')
			);
			frm.add_custom_button(
				__('حدث'),
				function() {
					frm.events.make_action(frm,"Event");
				},
				__('Make')
			);

	    }},
		make_action: function(frm,dt) {
		return frappe.call({
			method: 'ac.administrative_communication.doctype.decisions_and_generalizations.decisions_and_generalizations.make_action',
			args: {
				"dt": dt,
				"dn":frm.doc.name			
			},
			callback: function(r) {
				var doclist = frappe.model.sync(r.message);
				frappe.set_route("Form", doclist[0].doctype, doclist[0].name);
			}
		});
	},	 






});
