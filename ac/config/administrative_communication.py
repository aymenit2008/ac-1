from __future__ import unicode_literals
from frappe import _

def get_data():
	return [
		{
			"label": _("Administrative Communication"),
			"items": [
				{
					"type": "doctype",
					"name": "Administrative Transaction",
					"description":_("Administrative Transaction"),
					"onboard": 1
				},
				{
					"type": "doctype",
					"name": "Assignment Transaction",
					"description":_("Assignment Transaction"),
					"onboard": 1
				},

			]
		},
		{
			"label": _("Setup"),
			"items": [
				{
					"type": "doctype",
					"name": "Administrative Communication Settings",
					"description":_("Administrative Communication Settings"),
					"onboard": 1,
				},

			]
		},
		{
			"label": _("Reports"),
			"items": [
				{
					"type": "report",
					"is_query_report": True,
					"name": "Administrative Transaction Report",
					"doctype": "Administrative Transaction"
				},
				{
					"type": "report",
					"is_query_report": True,
					"name": "Administrative Transaction Tracks",
					"doctype": "Administrative Transaction"
				},
			]
		},
	]