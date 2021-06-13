// Copyright (c) 2020, Aseel and contributors
// For license information, please see license.txt

frappe.ui.form.on('Assignment Transaction', {
	administrative_transaction_display: function (frm) {
		if (frm.doc.administrative_transaction) {
			frappe.call({
				method: "ac.administrative_communication.doctype.assignment_transaction.assignment_transaction.get_doc_details",
				args: {dt: "Administrative Transaction", dn: frm.doc.administrative_transaction},
				callback: function(r){
					//frm.reload_doc();
				},
				always: function() {
					frappe.ui.form.is_saving = false;
				}
			});
		} else {
			frappe.show_alert(__('There is no Administrative Transaction'), 5);
		}		
	},
	download_attachments: function (frm) {
		if (frm.doc.administrative_transaction) {
			frappe.call({
				method: "ac.administrative_communication.doctype.assignment_transaction.assignment_transaction.get_attachments",
				args: {ac: frm.doc.administrative_transaction},
				callback: function(r){
					if (r.message) {
						if(r.message.attachments){							
						}
						$.each(r.message.attachments,  function(i,  d) {
							var file_url = d.attachment_type;
							if (d.attachment_type) {
								file_url = file_url.replace(/#/g, '%23');
							}
							window.open(file_url);
						});
					}
				},
				always: function() {
					frappe.ui.form.is_saving = false;
				}
			});
			
		} else {
			frappe.show_alert(__('There is no Administrative Transaction'), 5);
		}		
	},
	assignment_transaction_display: function (frm) {
		if (frm.doc.assignment_transaction) {
			frappe.call({
				method: "ac.administrative_communication.doctype.assignment_transaction.assignment_transaction.get_doc_details",
				args: {dt: "Assignment Transaction", dn: frm.doc.assignment_transaction},
				callback: function(r){					
				},
				always: function() {
					frappe.ui.form.is_saving = false;
				}
			});

		} else {
			frappe.show_alert(__('There is no Assignment Transactions'), 5);
		}	
	},
	validate: function (frm) {
		if (!frm.doc.assigned_to_type) {
			msgprint(__('Assigned To Type is Mandatory'))
			validated = false;
		}
		if (!frm.doc.assigned_by_employee) {
			frappe.db.get_value("Employee", { "user_id": frappe.session.user }, ["name", "department"], function (value) {
				if (value.name) {
					frm.set_value('assigned_by_department', value.department)
					frm.set_value('assigned_by_employee', value.name)
					cur_frm.refresh()
				} else {
					frappe.throw('Current user has not Employee')
				}
			})
		}
	},
	setup: function (frm) {		
		if (!frm.doc.assigned_by_employee) {
			frappe.db.get_value("Employee", { "user_id": frappe.session.user }, ["name", "department"], function (value) {
				if (value.name) {
					frm.set_value('assigned_by_department', value.department)
					frm.set_value('assigned_by_employee', value.name)
					cur_frm.refresh()
				} else {
					frappe.msgprint('Current user has not Employee')
				}
			})
		}
		if (!frm.doc.assigned_to_type) {
			frm.set_value('assigned_to_department', '')
			frm.set_value('assigned_to_employee', '')
			frm.set_value('assigned_to_user', '')
			frm.set_df_property('assigned_to_department', 'hidden', 1);
			frm.set_df_property('assigned_to_employee', 'hidden', 1);
		} else if (frm.doc.assigned_to_type == 'Department') {
			frm.set_df_property('assigned_to_employee', 'label', 'مسؤول الجهة');
			frm.set_df_property('assigned_to_department', 'label', 'الجهة المحال اليها');
		} else if (frm.doc.assigned_to_type == 'Employee') {
			frm.set_df_property('assigned_to_employee', 'label', 'الموظف المحال اليه');
			frm.set_df_property('assigned_to_department', 'label', 'جهة الموظف');
		}
		if (frappe.session.user=='Administrator'){
			frm.set_df_property('assigned_by_employee', 'read_only', 0);			
		}
			
	},
	assigned_to_type: function (frm) {
		frm.set_value('assigned_to_department', '')
			frm.set_value('assigned_to_employee', '')
			frm.set_value('assigned_to_user', '')		
		if (!frm.doc.assigned_to_type) {
			frm.set_df_property('assigned_to_department', 'hidden', 1);
			frm.set_df_property('assigned_to_employee', 'hidden', 1);
		}
		else if (frm.doc.assigned_to_type == 'Department') {
			frm.set_df_property('assigned_to_department', 'reqd', 1);
			frm.set_df_property('assigned_to_employee', 'reqd', 1);
			frm.set_df_property('assigned_to_department', 'hidden', 0);
			frm.set_df_property('assigned_to_department', 'read_only', 0);
			frm.set_df_property('assigned_to_employee', 'hidden', 0);
			frm.set_df_property('assigned_to_employee', 'read_only', 1);
			frm.set_df_property('assigned_to_employee', 'label', 'مسؤول الجهة');
			frm.set_df_property('assigned_to_department', 'label', 'الجهة المحال اليها');
		} else if (frm.doc.assigned_to_type == 'Employee') {				
			frm.set_df_property('assigned_to_department', 'reqd', 0);
			frm.set_df_property('assigned_to_employee', 'reqd', 1);
			frm.set_df_property('assigned_to_employee', 'hidden', 0);
			frm.set_df_property('assigned_to_employee', 'read_only', 0);
			frm.set_df_property('assigned_to_department', 'hidden', 0);
			frm.set_df_property('assigned_to_department', 'read_only', 1);
			frm.set_df_property('assigned_to_employee', 'label', 'الموظف المحال اليه');
			frm.set_df_property('assigned_to_department', 'label', 'جهة الموظف');
		}
	},
	assigned_to_department: function (frm) {
		if (frm.doc.assigned_to_type == 'Department' && frm.doc.assigned_to_department) {
			frappe.db.get_value("Department", { "name": frm.doc.assigned_to_department }, "department_manager", function (value) {
				if (value.department_manager) {
					frm.set_value('assigned_to_employee', value.department_manager)
				} else {
					frappe.msgprint(__('This Department has not Manager'))
				}
			})
		}
	},
	assigned_to_employee: function (frm) {
		if (frm.doc.assigned_to_type == 'Employee' && frm.doc.assigned_to_employee) {
			frappe.db.get_value("Employee", { "name": frm.doc.assigned_to_employee }, "department", function (value) {
				if (value.department) {					
					frm.set_value('assigned_to_department', value.department)
					cur_frm.refresh()
				} else {
					frappe.msgprint(__('This Employee has not Department'))
				}
			})
		}
	},
	assigned_by_employee: function (frm) {
		if (frm.doc.assigned_by_employee) {
			frappe.db.get_value("Employee", { "name": frm.doc.assigned_by_employee }, "department", function (value) {
				if (value.department) {
					frm.set_value('assigned_by_department', value.department)
					cur_frm.refresh()
				} else {
					frappe.msgprint('Current Employee has not Department')
				}
			})
		}
	},
	refresh: function (frm) {
		frm.trigger('validate_assignment_description')
		if (frm.doc.docstatus == 1) {
			if (frm.doc.status == 'Open') {
				frm.add_custom_button(
					__('Received'),
					function () {						
						frm.events.set_status(frm, 'Received');
					},
					__('Set Status')
				);
				frm.add_custom_button(
					__('Rejected'),
					function () {						
						frm.trigger('reject_dialog')						
					},
					__('Set Status')
				);
				cur_frm.page.set_inner_btn_group_as_primary(__('Set Status'));
			} else if (frm.doc.status == 'Received') {
				if(frm.doc.assignment_description_result){
					frm.add_custom_button(
						__('Replied'),
						function () {							
							frm.events.set_status(frm, 'Replied');
						},
						__('Set Status')
					);
					cur_frm.page.set_inner_btn_group_as_primary(__('Set Status'));
				}				
			}else if (frm.doc.status == 'Replied') {
				frm.add_custom_button(
					__('Completed'),
					function () {						
						frm.events.set_status(frm, 'Completed');
					},
					__('Set Status')
				);
				cur_frm.page.set_inner_btn_group_as_primary(__('Set Status'));
			}
		}
				
		if (frm.doc.status == 'Received') {
			frm.add_custom_button(
				__('Reply'),
				function () {					
					frm.events.reply_dialog(frm);
				},
				__('Make')
			);
			if(!frm.doc.assignment_description_result){
				if (frm.doc.status != 'Completed'){
					cur_frm.page.set_inner_btn_group_as_primary(__('Make'));
				}					
			}			
		}
		if (frm.doc.status != 'Open' && frm.doc.status != 'Draft' && frm.doc.status != 'Cancelled') {
			frm.add_custom_button(
				__('Assignment Transaction'),
				function () {				
					frm.events.make_transaction(frm,'ac.administrative_communication.doctype.assignment_transaction.assignment_transaction.get_assignment_transaction');
				},
				__('Make')
			);
			frm.add_custom_button(
				__('External Message'),
				function () {				
					frm.events.make_transaction(frm,'ac.administrative_communication.doctype.administrative_transaction.administrative_transaction.get_administrative_transaction');
				},
				__('Make')
			);
		}	
	},
	make_transaction: function (frm,method_path='') {
		return frappe.call({
			method: method_path,
			args: {
				"dt": frm.doc.doctype,
				"dn": frm.doc.name
			},
			callback: function (r) {
				var doclist = frappe.model.sync(r.message);
				frappe.set_route("Form", doclist[0].doctype, doclist[0].name);
			}
		});
	},
	set_status: function (frm, status) {
		frappe.ui.form.is_saving = true;
		frappe.call({
			method: "ac.administrative_communication.doctype.assignment_transaction.assignment_transaction.update_status",
			args: {status: status, name: frm.doc.name},
			callback: function(r){
				frm.reload_doc();
			},
			always: function() {
				frappe.ui.form.is_saving = false;
			}
		});
	},
	validate_assignment_description: function (frm) {
		if(frm.doc.status == 'Draft'){
		};
		if (frm.doc) {
			frm.set_df_property('assignment_description_result', 'hidden', 1);
			frm.set_df_property('assignment_description_result', 'read_only', 1);
		} else {			
			if (frm.doc.status == 'Received') {
				frm.set_df_property('assignment_description_result', 'hidden', 0);
			} else {				
				if (frm.doc.status == 'Open') {
					frm.trigger('receive_dialog')
				}				
			}
		}
	},
	reject_dialog: function (frm) {
		frappe.prompt({
			label: __('Reason of Reject'),
			fieldname: 'reason',
			fieldtype: 'SmallText',
			'reqd':1
		},
		(values) => {
			frappe.ui.form.is_saving = true;
			frappe.call({
				method: "ac.administrative_communication.doctype.assignment_transaction.assignment_transaction.update_status",
				args: {status: 'Rejected', reason:values.reason, name: frm.doc.name},
				callback: function(r){
					frm.reload_doc();
				},
				always: function() {
					frappe.ui.form.is_saving = false;
				}
			});			
		}		
		, __('Reject Message'), __('Reject'));
	},
	reply_dialog: function (frm) {
		frappe.prompt({
			label: __(''),
			fieldtype: 'TextEditor',
			fieldname: 'reply',
			'reqd':1,
			default:frm.doc.assignment_description_result
		},
		(values) => {
			frappe.ui.form.is_saving = true;
			frappe.call({
				method: "ac.administrative_communication.doctype.assignment_transaction.assignment_transaction.update_reply",
				args: {name:frm.doc.name,reply: values.reply},
				callback: function(r){					
					frm.reload_doc();
				},
				always: function() {
					frappe.ui.form.is_saving = false;
				}
			});			
		}
			, __('Replay Content'), __('Replay'));
	}
});
