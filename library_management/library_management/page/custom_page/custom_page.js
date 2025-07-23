frappe.pages['custom-page'].on_page_load = function(wrapper) {
     var page = frappe.ui.make_app_page({
         parent: wrapper,
         title: 'Custom Page',
         single_column: true
     });

    $(wrapper).find('.layout-main-section').html(`
        <h3>Hello from Custom Page!</h3>
        <p>This is a fully custom page in ERPNext.</p>
         <button class="btn btn-primary" id="custom-btn">Click Me</button>
    `);

   $('#custom-btn').on('click', function() {
        frappe.msgprint("Button Clicked!");
     });
};


