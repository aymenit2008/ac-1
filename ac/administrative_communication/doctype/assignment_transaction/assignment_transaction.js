// Copyright (c) 2020, Aseel and contributors
// For license information, please see license.txt

frappe.ui.form.on('Assignment Transaction', {
	administrative_transaction_display: function (frm) {
		if (frm.doc.administrative_transaction) {
			frappe.db.get_value("Administrative Transaction", { "name": frm.doc.administrative_transaction }, ["*"], function (value) {
				msgprint("<ul style='direction:rtl'>"
					+ "<li><b style='color:blue'>نوع المعاملة</b></br><h4>" + value.source + " </h4></li>"
					+ "<li><b style='color:blue'>نوع الصادر</b> </br><h4>" + value.type + "<h4> </li>"
					+ "<li><b style='color:blue'>موضوع المعاملة</b> </br><h4>" + value.subject + "<h4> </li>"
					+ "<li><b style='color:blue'>تصنيف المعاملة</b> </br><h4>" + value.category + " <h4></li>"
					+ "<li><b style='color:blue'>اولوية المعاملة</b> </br><h4>" + value.priority + "<h4> </li>"
					+ "<li><b style='color:blue'>طبيعة اصل المعاملة</b> </br><h4>" + value.orginal_type + "<h4></li>"
					+ "<li><b style='color:blue'>مستوى سرية المعاملة</b> </br><h4>" + value.secret_level + "<h4></li>"
					+ "<li><b style='color:blue'>المحتوى</b> </br><h4>" + value.content + " </li>"

					+ "</ul>", __('Administrative Transaction Info'))
			})
		} else {
			frappe.show_alert(__('There is no Administrative Transaction'), 5);
		}
		//frappe.show_alert('Hi, do you have a new message', 5);
	},
	assignment_transaction_display: function (frm) {
		if (frm.doc.assignment_transaction) {
			frappe.db.get_value("Assignment Transaction", { "name": frm.doc.assignment_transaction }, ["*"], function (value) {
				msgprint("<ul style='direction:rtl'>"
					+ "<li><b style='color:blue'>الاجراء </b></br><h4>" + value.assignment_transaction_action + " </h4></li>"
					+ "<li><b style='color:blue'>حالة الاحالة</b> </br><h4>" + value.status + "<h4> </li>"
					+ "<li><b style='color:blue'>محتوى الرد على الاحالة</b> </br><h4>" + value.assignment_description + "<h4> </li>"
					+ "<li><b style='color:blue'>الجهة المحيلة</b> </br><h4>" + value.assigned_by_department + " <h4></li>"
					+ "<li><b style='color:blue'>الموضف المحيل</b> </br><h4>" + value.assigned_by_employee + "<h4> </li>"
					+ "<li><b style='color:blue'>احالة عاجلة</b> </br><h4>" + value.is_urgent + "<h4></li>"
					+ "<li><b style='color:blue'>الجهة المحال اليها</b> </br><h4>" + value.assigned_to_department + "<h4></li>"
					+ "<li><b style='color:blue'>الموضف المحال اليه</b> </br><h4>" + value.assigned_to_employee + " </li>"
					+ "<li><b style='color:blue'>المراسل</b> </br><h4>" + value.transporter + " </li>"
					+ "</ul>", __('Assignment Transaction Info'))
			})
		} else {
			frappe.show_alert(__('There is no Assignment Transactions'), 5);
		}
		//frappe.show_alert('Hi, do you have a new message', 5);
	},
	validate: function (frm) {
		if (!frm.doc.assigned_by_employee) {
			frappe.db.get_value("Employee", { "user_id": frappe.session.user }, ["name", "department"], function (value) {
				if (value.employee) {
					frm.set_value('assigned_by_department', value.department)
					frm.set_value('assigned_to_employee', value.employee)
					cur_frm.refresh()
				} else {
					frappe.msgprint(__('Current user has not Employee'))
				}
			})
		}
		if (!frm.doc.assigned_to_type) {
			msgprint(__('Assigned To Type is Mandatory'))
			validated = false;
		}
	},
	setup: function (frm) {		
		/*if (!frm.doc.assigned_by_employee) {
			frappe.db.get_value("Employee", { "user_id": frappe.session.user }, ["name", "department"], function (value) {
				if (value.employee) {
					frm.set_value('assigned_by_department', value.department)
					frm.set_value('assigned_to_employee', value.employee)
					cur_frm.refresh()
				} else {
					frappe.msgprint('Current user has not Employee')
				}
			})
		}*/
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
					console.log('value.department' + value.department)
					frm.set_value('assigned_to_department', value.department)
					cur_frm.refresh()
				} else {
					frappe.msgprint(__('This Employee has not Department'))
				}
			})
		}
	},
	/*assigned_by_employee: function (frm) {
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
	},*/
	refresh: function (frm) {
		frm.trigger('validate_assignment_description')
		if (frm.doc.docstatus == 1) {
			if (frm.doc.status == 'Open') {
				frm.add_custom_button(
					__('Received'),
					function () {
						console.log('is_receipt')
						frm.events.set_status(frm, 'Received');
					},
					__('Set Status')
				);
				cur_frm.page.set_inner_btn_group_as_primary(__('Set Status'));
			} else if (frm.doc.status == 'Received') {
				if(frm.doc.assignment_description_result){
					frm.add_custom_button(
						__('Replied'),
						function () {
							console.log('is_Replied')
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
						console.log('is_receipt')
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
					console.log('ahmed')
					frm.events.reply_dialog(frm);
				},
				__('Make')
			);
			if(!frm.doc.assignment_description_result){
				cur_frm.page.set_inner_btn_group_as_primary(__('Make'));
			}
			
		}	
		if (frm.doc.status != 'Open' && frm.doc.status != 'Draft' && frm.doc.status != 'Cancelled') {
			frm.add_custom_button(
				__('Assignment Transaction'),
				function () {
					console.log('ahmed')
					frm.events.make_assignment_transaction(frm);
				},
				__('Make')
			);
		}	
	},
	make_assignment_transaction: function (frm) {
		return frappe.call({
			method: 'ac.administrative_communication.doctype.assignment_transaction.assignment_transaction.get_assignment_transaction',
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
		return frappe.call({
			doc: frm.doc,
			method: 'set_status',
			args: { status: status },
			callback: function (r) {
				console.log(r)
				if(frm.doc.docstatus==0){
					//frm.save();
				}else{
					console.log(r)
					//frm.save('Update');
				}				
				frm.refresh();
				//frm.toolbar.refresh();
			}
		})
	},
	validate_assignment_description: function (frm) {
		if (frm.doc.__islocal) {
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
	receive_dialog: function (frm) {
		frappe.prompt({
			label: __('Please Confirm Receive'),
			fieldtype: 'Heading'
		},
			function () {
				frm.events.set_status(frm, 'Received');
			}
			, __('Confirm Message'), __('Confirm'));

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
			console.log(values.reply);
			return frappe.call({
				doc: frm.doc,
				method: 'set_reply',
				args: { reply: values.reply },
				callback: function (r) {
					console.log(r);
					frm.save('Update');						
					frm.refresh();
					frm.toolbar.refresh();
				}
			})
		}
			, __('Replay Content'), __('Replay'));

	}
});
