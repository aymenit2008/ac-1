// Copyright (c) 2020, Aseel and contributors
// For license information, please see license.txt
frappe.provide("ac.administrative_communication");
frappe.ui.form.on('Administrative Transaction', {
	validate:function(frm) {
		if (!frm.doc.small_user_signature){
			frm.set_value('small_user_signature', frappe.session.user)
		}
		if (!frm.doc.user_signature){
			frm.set_value('user_signature', frappe.session.user)
		}
	},
	setup: function(frm) {
		frm.set_query("inbox_party_type", function() {
			
			return{
				filters: {
					"name": ["in", Object.keys(frappe.boot.party_account_types)],
				}
			}
		});
		frm.set_query("inbox_contact", function() {
			if (frm.doc.inbox_party) {
				return {
					query: 'frappe.contacts.doctype.contact.contact.contact_query',
					filters: {
						link_doctype: frm.doc.inbox_party_type,
						link_name: frm.doc.inbox_party
					}
				};
			}
		});
		if (frm.__islocal){
			if (!frm.doc.small_user_signature){
				frm.set_value('small_user_signature', frappe.session.user)
			}
			if (!frm.doc.user_signature){
				frm.set_value('user_signature', frappe.session.user)
			}
		}		
	},
	refresh: function (frm) {
		frm.set_df_property('ac_attachments_section',  'hidden',  frm.doc.__islocal ? 1 : 0);		
		if(frm.doc.docstatus==1){
			
			frm.add_custom_button(
				__('Assignment Transaction'),
				function() {
					frm.events.make_assignment_transaction(frm);
				},
				__('Make')
			);
			frm.add_custom_button(
				__('Decisions And Generalizations'),
				function() {					
					frm.events.make_decision_and_generalization(frm);
				},
				__('Make')
			);
			
			if (!frm.doc.assignment_date){
				cur_frm.page.set_inner_btn_group_as_primary(__('Make'));
			}
			if (frm.doc.status == 'Pending' || (frm.doc.status == 'Open' && frm.doc.source == 'Out' && frm.doc.type == 'External')) {
				frm.add_custom_button(
					__('Completed'),
					function () {						
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
	make_decision_and_generalization: function(frm) {		
		return frappe.call({
			method: 'ac.administrative_communication.doctype.administrative_transaction.administrative_transaction.get_decision_and_generalization',
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
				frm.refresh();
				frm.toolbar.refresh();
			}
		})
	},
	inbox_party_type: function(frm){
		frm.set_value('inbox_party','')
	},
	inbox_party: function(frm){
		frm.set_value('inbox_contact','')
		frm.set_value('inbox_party_name','')
		if(frm.doc.inbox_party){			
			if(frm.doc.inbox_party_type=='Administrative Communication Party'){
				frappe.db.get_value(frm.doc.inbox_party_type, {"name": frm.doc.inbox_party}, ["full_name"], function(value) {
					if(value.full_name){						
						frm.set_value('inbox_party_name',value.full_name)
					}
				})
			}else if(frm.doc.inbox_party_type=='Customer'){
				frappe.db.get_value(frm.doc.inbox_party_type, {"name": frm.doc.inbox_party}, ["customer_name"], function(value) {
					if(value.customer_name){						
						frm.set_value('inbox_party_name',value.customer_name)
					}
				})
			}else if(frm.doc.inbox_party_type=='Supplier'){
				frappe.db.get_value(frm.doc.inbox_party_type, {"name": frm.doc.inbox_party}, ["supplier_name"], function(value) {
					if(value.supplier_name){						
						frm.set_value('inbox_party_name',value.supplier_name)
					}
				})
			}else if(frm.doc.inbox_party_type=='Employee'){
				frappe.db.get_value(frm.doc.inbox_party_type, {"name": frm.doc.inbox_party}, ["employee_name"], function(value) {
					if(value.employee_name){						
						frm.set_value('inbox_party_name',value.employee_name)
					}
				})
			}else{
				frm.set_value('inbox_party_name','')
			}			
		}
	},
	inbox_contact: function(frm){
		frm.set_value('inbox_contact_mobile','')
		frm.set_value('inbox_contact_email','')
		if (frm.doc.inbox_contact){

		}
		frappe.db.get_value("Contact", {"name": frm.doc.inbox_contact}, ["email_id","mobile_no","first_name","last_name"], function(value) {
			var full_name=''
			if(value.email_id){
				frm.set_value('inbox_contact_email',value.email_id)
			}
			if(value.mobile_no){
				frm.set_value('inbox_contact_mobile',value.mobile_no)
			}
			if(value.first_name){
				full_name=value.first_name+' '
			}
			if(value.last_name){
				full_name+=value.last_name
			}
			frm.set_value('inbox_contact_name',full_name)
		});
	}
});
