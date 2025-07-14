# test_case_management/config/test_project_dashboard.py

from frappe import _

def get_data():
    return {
        'fieldname': 'project',
        'transactions': [
            {
                'label': _('Test Planning'),
                'items': ['Test Plan', 'Test Case']
            },
            {
                'label': _('Execution'),
                'items': ['Test Run']
            }
        ]
    }
