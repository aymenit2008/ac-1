// Copyright (c) 2020, Aseel and contributors
// For license information, please see license.txt
frappe.provide("ac.administrative_communication");
frappe.ui.form.on('Administrative Transaction', {

	refresh: function (frm) {
		console.log('aseel')
		if(frm.doc.docstatus==1){
			frm.add_custom_button(
				__('Assignment Transaction'),
				function() {
					console.log('ahmed')
					frm.events.make_assignment_transaction(frm);
				},
				__('Make')
			);
			if (!frm.doc.assignment_date){
				cur_frm.page.set_inner_btn_group_as_primary(__('Make'));
			}
			if (frm.doc.status == 'Pending') {
				frm.add_custom_button(
					__('Completed'),
					function () {
						console.log('is_receipt')
						frm.events.set_status(frm,'Completed',true);
					},
					__('Set Status')
				);
				cur_frm.page.set_inner_btn_group_as_primary(__('Set Status'));
			}
		}
		
	},
	make_assignment_transaction: function(frm) {
		return frappe.call({
			method: 'ac.administrative_communication.doctype.assignment_transaction.assignment_transaction.get_assignment_transaction',
			args: {
				"dt": frm.doc.doctype,
				"dn": frm.doc.name
			},
			callback: function(r) {
				var doclist = frappe.model.sync(r.message);
				frappe.set_route("Form", doclist[0].doctype, doclist[0].name);
			}
		});
	},
	set_status: function (frm,status,update) {
		return frappe.call({
			doc: frm.doc,
			method: 'set_status',
			args:{status:status,update:update},
			callback: function (r) {
				frm.save();
				frm.refresh();
				frm.toolbar.refresh();
			}
		})
	}
});
