// Copyright (c) 2020, Aseel and contributors
// For license information, please see license.txt

frappe.ui.form.on('Assignment Transaction', {
	administrative_transaction_display: function (frm) {
		if (frm.doc.administrative_transaction) {
			frappe.db.get_value("Administrative Transaction", { "name": frm.doc.administrative_transaction }, ["*"], function (value) {
				msgprint("<ul style='direction:rtl'>"
					+ "<li><b>" + value.source + "</b> source</li>"
					+ "<li><b>" + value.type + "</b> type</li>"
					+ "<li><b>" + value.subject + "</b> subject</li>"
					+ "<li><b>" + value.category + "</b> category</li>"
					+ "<li><b>" + value.priority + "</b> priority</li>"
					+ "<li><b>" + value.orginal_type + "</b> orginal_type</li>"
					+ "<li><b>" + value.secret_level + "</b> secret_level</li>"
					+ "<li><b>" + value.content + "</b> content</li>"

					+ "</ul>", 'Administrative Transaction Info')
			})
		} else {
			frappe.show_alert('There is no Administrative Transaction', 5);
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
					frappe.msgprint('Current user has not employee')
				}
			})
		}
		if (!frm.doc.assigned_to_type) {
			msgprint('assigned_to_type is Mandatory');
			validated = false;
		}
	},
	setup: function (frm) {
		frm.trigger('display_property')
		if (!frm.doc.assigned_by_employee) {
			frappe.db.get_value("Employee", { "user_id": frappe.session.user }, ["name", "department"], function (value) {
				if (value.employee) {
					frm.set_value('assigned_by_department', value.department)
					frm.set_value('assigned_to_employee', value.employee)
					cur_frm.refresh()
				} else {
					frappe.msgprint('Current user has not employee')
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
	},
	assigned_to_type: function (frm) {
		if (!frm.doc.assigned_to_type) {
			frm.set_value('assigned_to_department', '')
			frm.set_value('assigned_to_employee', '')
			frm.set_value('assigned_to_user', '')
			frm.set_df_property('assigned_to_department', 'hidden', 1);
			frm.set_df_property('assigned_to_employee', 'hidden', 1);
		}
		else if (frm.doc.assigned_to_type == 'Department') {
			frm.set_value('assigned_to_employee', '')
			frm.set_value('assigned_to_user', '')
			frm.set_df_property('assigned_to_department', 'reqd', 1);
			frm.set_df_property('assigned_to_employee', 'reqd', 1);
			frm.set_df_property('assigned_to_department', 'hidden', 0);
			frm.set_df_property('assigned_to_department', 'read_only', 0);
			frm.set_df_property('assigned_to_employee', 'hidden', 0);
			frm.set_df_property('assigned_to_employee', 'read_only', 1);
			frm.set_df_property('assigned_to_employee', 'label', 'مسؤول الجهة');
			frm.set_df_property('assigned_to_department', 'label', 'الجهة المحال اليها');
		} else if (frm.doc.assigned_to_type == 'Employee') {
			frm.set_value('assigned_to_department', '')
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
					frappe.msgprint('This Department has not Manager')
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
					frappe.msgprint('This Employee has not Department')
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
		if (frm.doc.docstatus == 1) {
			if (frm.doc.status == 'Open') {
				frm.add_custom_button(
					__('Received'),
					function () {
						console.log('is_receipt')
						frm.events.set_status(frm,'Received');
					},
					__('Set Status')
				);
				cur_frm.page.set_inner_btn_group_as_primary(__('Set Status'));
			} else if (frm.doc.status == 'Received') {
				frm.add_custom_button(
					__('Completed'),
					function () {
						console.log('is_receipt')
						frm.events.set_status(frm,'Completed');
					},
					__('Set Status')
				);
				cur_frm.page.set_inner_btn_group_as_primary(__('Set Status'));
			} else if (frm.doc.status == 'Completed') {
				frm.add_custom_button(
					__('Cancelled'),
					function () {
						console.log('is_receipt')
						frm.events.set_status(frm,'Cancelled');
					},
					__('Set Status')
				);				
			}
		}
		frm.add_custom_button(
			__('Assignment Transaction'),
			function () {
				console.log('ahmed')
				frm.events.make_assignment_transaction(frm);
			},
			__('Make')
		);
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
	set_status: function (frm,status) {
		return frappe.call({
			doc: frm.doc,
			method: 'set_status',
			args:{status:status},
			callback: function (r) {
				frm.save();
				frm.refresh();
				frm.toolbar.refresh();
			}
		})
	},
	display_property: function (frm) {
		if (frm.doc.administrative_transaction) {
			frm.set_df_property('administrative_transaction_display', 'hidden', 0);
		} else {
			frm.set_df_property('administrative_transaction_display', 'hidden', 1);
		}
		if (frm.doc.assignment_transaction) {
			frm.set_df_property('assignment_transaction_display', 'hidden', 0);
		} else {
			frm.set_df_property('assignment_transaction_display', 'hidden', 1);
		}
	},
});
