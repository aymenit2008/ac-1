from __future__ import unicode_literals
from frappe import _


def get_data():
	return {
		'fieldname': 'administrative_transaction',
		'transactions': [
			{
				'label': _('Assignment Transaction'),
				'items': ['Assignment Transaction']
			}
		]
	}