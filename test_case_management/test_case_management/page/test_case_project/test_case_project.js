frappe.pages['test-case-project'].on_page_load = function(wrapper) {
	var page = frappe.ui.make_app_page({
		parent: wrapper,
		title: 'Test Case Project',
		single_column: true
	});
}