app_name = "library_management"
app_title = "Library Management"
app_publisher = "Dnyaneshwari"
app_description = "Library management app for feappe-bench"
app_email = "sherkards06@gmail.com"
app_license = "mit"

# Apps
# ------------------

# required_apps = []

# Each item in the list will be shown as an app in the apps page
# add_to_apps_screen = [
# 	{
# 		"name": "library_management",
# 		"logo": "/assets/library_management/logo.png",
# 		"title": "Library Management",
# 		"route": "/library_management",
# 		"has_permission": "library_management.api.permission.has_app_permission"
# 	}
# ]

# Includes in <head>
# ------------------

# include js, css files in header of desk.html
# app_include_css = "/assets/library_management/css/library_management.css"
# app_include_js = "/assets/library_management/js/library_management.js"
# app_include_js = "/assets/library_management/js/custom_page.js"




# include js, css files in header of web template
# web_include_css = "/assets/library_management/css/library_management.css"
# web_include_js = "/assets/library_management/js/library_management.js"

# include custom scss in every website theme (without file extension ".scss")
# website_theme_scss = "library_management/public/scss/website"

# include js, css files in header of web form
# webform_include_js = {"doctype": "public/js/doctype.js"}
# webform_include_css = {"doctype": "public/css/doctype.css"}

# include js in page
# page_js = {"page" : "public/js/file.js"}

# include js in doctype views
# doctype_js = {"doctype" : "public/js/doctype.js"}
# doctype_list_js = {"doctype" : "public/js/doctype_list.js"}
# doctype_tree_js = {"doctype" : "public/js/doctype_tree.js"}
# doctype_calendar_js = {"doctype" : "public/js/doctype_calendar.js"}

#doctype_js = {
    #"Job Applicant": "public/js/job_applicant.js"
#}



# Svg Icons
# ------------------
# include app icons in desk
# app_include_icons = "library_management/public/icons.svg"

# Home Pages
# ----------

# application home page (will override Website Settings)
# home_page = "login"

# website user home page (by Role)
# role_home_page = {
# 	"Role": "home_page"
# }

# Generators
# ----------

# automatically create page for each record of this doctype
# website_generators = ["Web Page"]

# Jinja
# ----------

# add methods and filters to jinja environment
# jinja = {
# 	"methods": "library_management.utils.jinja_methods",
# 	"filters": "library_management.utils.jinja_filters"
# }

# Installation
# ------------

# before_install = "library_management.install.before_install"
# after_install = "library_management.install.after_install"

# Uninstallation
# ------------

# before_uninstall = "library_management.uninstall.before_uninstall"
# after_uninstall = "library_management.uninstall.after_uninstall"

# Integration Setup
# ------------------
# To set up dependencies/integrations with other apps
# Name of the app being installed is passed as an argument

# before_app_install = "library_management.utils.before_app_install"
# after_app_install = "library_management.utils.after_app_install"

# Integration Cleanup
# -------------------
# To clean up dependencies/integrations with other apps
# Name of the app being uninstalled is passed as an argument

# before_app_uninstall = "library_management.utils.before_app_uninstall"
# after_app_uninstall = "library_management.utils.after_app_uninstall"

# Desk Notifications
# ------------------
# See frappe.core.notifications.get_notification_config

# notification_config = "library_management.notifications.get_notification_config"

override_whitelisted_methods = {
    "frappe.desk.form.assigned_to.add": "library_management.overrides.custom_assigned.custom_assigned_to"
    # "frappe.www.job_opening.get_list_context": "library_management.www.job_opening.get_list_context"
   
    }



# override_doctype_class = {
#      "Interview": "library_management.api.interview.get_rounds_by_applicant"
#  }




override_doctype_class = {
     "Interview": "library_management.overrides.custom_interview.CustomInterview"
      
}

 



doctype_js = {
    "Job Applicant": "public/js/job_applicant.js",
    "Interview": "public/js/interview.js"
}

# doctype_js = {
#      "Interview": "public/js/interview.js"
#  }




permission_query_conditions = {
    "Interview": "library_management.library_management.doctype.interview.interview.get_permission_query_conditions"
}

has_permission = {
    "Interview": "library_management.library_management.doctype.interview.interview.has_permission"
}


# doc_events = {
#     "Job Offer": {
#         "after_insert": "library_management.api.job_offer.send_offer_email_on_status",
#         "on_update": "library_management.api.job_offer.send_offer_email_on_status"
#     }
# }



doc_events = {
    "Interview": {
        "on_update": "library_management.api.interview.send_interview_pending_notification"
    }
}







# doc_events = {
#     "Interview": {
#         "validate": "library_management.library_management.doctype.interview.interview.validate"
#     }
# }





# Permissions
# -----------
# Permissions evaluated in scripted ways

# permission_query_conditions = {
# 	"Event": "frappe.desk.doctype.event.event.get_permission_query_conditions",
# }
#
# has_permission = {
# 	"Event": "frappe.desk.doctype.event.event.has_permission",
# }

# DocType Class
# ---------------
# Override standard doctype classes

# override_doctype_class = {
# 	"ToDo": "custom_app.overrides.CustomToDo"
# }

# Document Events
# ---------------
# Hook on document methods and events

doc_events = {
# 	"*": {
# 		"on_update": "method",
# 		"on_cancel": "method",
# 		"on_trash": "method"
# 	 }
   "Article Library":{
     "Validate":"library_management.utils.test_hook"
   }
}

# Scheduled Tasks
# ---------------


# 	"all": [
# 		"library_management.tasks.all"
# 	],
# 	"daily": [
# 		"library_management.tasks.daily"
# 	],
# 	"hourly": [
# 		"library_management.tasks.hourly"
# 	],
# 	"weekly": [
# 		"library_management.tasks.weekly"
# 	],
# 	"monthly": [
# 		"library_management.tasks.monthly"
# 	],
#}

# Testing
# -------

# before_tests = "library_management.install.before_tests"

# Overriding Methods
# ------------------------------
#
# override_whitelisted_methods = {
# 	"frappe.desk.doctype.event.event.get_events": "library_management.event.get_events"
# }
#
# each overriding function accepts a `data` argument;
# generated from the base implementation of the doctype dashboard,
# along with any modifications made in other Frappe apps
# override_doctype_dashboards = {
# 	"Task": "library_management.task.get_dashboard_data"
# }

# exempt linked doctypes from being automatically cancelled
#
# auto_cancel_exempted_doctypes = ["Auto Repeat"]

# Ignore links to specified DocTypes when deleting documents
# -----------------------------------------------------------

# ignore_links_on_delete = ["Communication", "ToDo"]

# Request Events
# ----------------
# before_request = ["library_management.utils.before_request"]
# after_request = ["library_management.utils.after_request"]

# Job Events
# ----------
# before_job = ["library_management.utils.before_job"]
# after_job = ["library_management.utils.after_job"]

# User Data Protection
# --------------------

# user_data_fields = [
# 	{
# 		"doctype": "{doctype_1}",
# 		"filter_by": "{filter_by}",
# 		"redact_fields": ["{field_1}", "{field_2}"],
# 		"partial": 1,
# 	},
# 	{
# 		"doctype": "{doctype_2}",
# 		"filter_by": "{filter_by}",
# 		"partial": 1,
# 	},
# 	{
# 		"doctype": "{doctype_3}",
# 		"strict": False,
# 	},
# 	{
# 		"doctype": "{doctype_4}"
# 	}
# ]

# Authentication and authorization
# --------------------------------

# auth_hooks = [
# 	"library_management.auth.validate"
# ]

# Automatically update python controller files with type annotations for this app.
# export_python_type_annotations = True

# default_log_clearing_doctypes = {
# 	"Logging DocType Name": 30  # days to retain logs
# }
 
# fixtures=[
#      "Library member",
#  ]


<<<<<<< HEAD
=======

fixtures = [
    {
        "doctype": "Custom Field",
        "filters": [
            ["dt", "=", "Job Applicant"]
        ]
    }
]


fixtures = [
    {
        "doctype": "Custom Field",
        "filters": [
            ["dt", "in", ["Job Applicant", "Interview"]]
        ]
    }
]

fixtures = [
    {
        "doctype": "Custom Field",
        "filters": [
            ["dt", "=", "Job Opening"]
        ]
    }
]


fixtures = [
    {"doctype": "Custom Field", "filters": [["dt", "in", [
        "Job Opening", 
        "Interview"
    ]]]},
     {"doctype": "Interview Rounds"},
    {"doctype": "Google meet oauth doc"},
    {"doctype": "Job Opening custom doc"},
    {"doctype": "Job Title"}
]


>>>>>>> 6873ee4 (Removed OAuth secrets)
fixtures = [
    {
        "doctype": "Custom Field",
        "filters": [
            ["dt", "=", "Job Applicant"]
        ]
    }
]


fixtures = [
    {
        "doctype": "Custom Field",
        "filters": [
            ["dt", "in", ["Job Applicant", "Interview"]]
        ]
    }
]
