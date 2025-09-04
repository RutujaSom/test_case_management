frappe.listview_settings['Test Case Bank'] = {
    onload: function (listview) {
        listview.page.add_inner_button(__('Import Test Cases'), function () {
            open_import_dialog();
        });

        listview.page.add_inner_button(__('Export Template'), function () {
            open_export_dialog();
        });
    }
};

function open_import_dialog() {
    const d = new frappe.ui.Dialog({
        title: 'Import Test Cases',
        fields: [
            {
                label: 'File Type',
                fieldname: 'file_type',
                fieldtype: 'Select',
                options: ['CSV', 'Excel'],
                reqd: 1
            },
            {
                label: 'File',
                fieldname: 'file_url',
                fieldtype: 'Attach',
                reqd: 1
            }
        ],
        primary_action_label: 'Import',
        primary_action(values) {
            frappe.call({
                method: 'test_case_management.api.test_case_bank.import_test_cases_from_file_for_bank',
                args: {
                    file_url: values.file_url,
                    file_type: values.file_type
                },
                callback(r) {
                    if (r.message) {
                        frappe.msgprint(r.message);
                        listview.refresh();
                    }
                    d.hide();
                }
            });
        }
    });

    d.show();
}

function open_export_dialog() {
    const dialog = new frappe.ui.Dialog({
        title: "Export Template",
        fields: [
            {
                label: 'File Type',
                fieldname: 'file_type',
                fieldtype: 'Select',
                options: ['Excel', 'CSV'],
                default: 'Excel',
                reqd: 1
            }
        ],
        primary_action_label: 'Download',
        primary_action(values) {
            const file_type = values.file_type;
            const url = `/api/method/test_case_management.api.test_plan.download_template?file_type=${file_type}`;
            window.open(url, '_blank');
            dialog.hide();
        }
    });

    dialog.show();
}
