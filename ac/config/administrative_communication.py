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
				{
					"type": "doctype",
					"name": "Decisions And Generalizations",
					"description":_("Decisions And Generalizations"),
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
{
					"type": "doctype",
					"name": "Administrative Communication Party",
					"description":_("Administrative Communication Party"),
					"onboard": 1
				},

{
					"type": "doctype",
					"name": "Administrative Transaction Source",
					"description":_("Administrative Transaction Source"),
					"onboard": 1
				},

{
					"type": "doctype",
					"name": "Administrative Transaction Type",
					"description":_("Administrative Transaction Type"),
					"onboard": 1
				},

{
					"type": "doctype",
					"name": "Administrative Transaction Category",
					"description":_("Administrative Transaction Category"),
					"onboard": 1
				},

{
					"type": "doctype",
					"name": "Assignment Transaction Action",
					"description":_("Assignment Transaction Action"),
					"onboard": 1
				},
{
					"type": "doctype",
					"name": "Letter Template",
					"description":_("Letter Template"),
					"onboard": 1
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