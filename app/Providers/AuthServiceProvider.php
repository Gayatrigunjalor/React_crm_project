<?php

namespace App\Providers;

use App\Models\User;
use Illuminate\Foundation\Support\Providers\AuthServiceProvider as ServiceProvider;
use Illuminate\Support\Facades\Gate;

class AuthServiceProvider extends ServiceProvider
{
    /**
     * The policy mappings for the application.
     *
     * @var array<class-string, class-string>
     */
    protected $policies = [
        // 'App\Models\Model' => 'App\Policies\ModelPolicy',
    ];

    /**
     * Register any authentication / authorization services.
     *
     * @return void
     */
    public function boot()
    {
        $this->registerPolicies();
        //customer
        Gate::define('customer_list',fn(User $user) => $user->permission->customer_list == 1);
        Gate::define('customer_create',fn(User $user) => $user->permission->customer_create == 1);
        Gate::define('customer_edit',fn(User $user) => $user->permission->customer_edit == 1);
        // contact person
        Gate::define('contact_person_list',fn(User $user) => $user->permission->contact_person_list == 1);
        Gate::define('contact_person_create',fn(User $user) => $user->permission->contact_person_create == 1);
        Gate::define('contact_person_edit',fn(User $user) => $user->permission->contact_person_edit == 1);
        Gate::define('contact_person_delete',fn(User $user) => $user->permission->contact_person_delete == 1);
        // consignee
        Gate::define('consignee_list',fn(User $user) => $user->permission->consignee_list == 1);
        Gate::define('consignee_create',fn(User $user) => $user->permission->consignee_create == 1);
        Gate::define('consignee_edit',fn(User $user) => $user->permission->consignee_edit == 1);
        Gate::define('consignee_delete',fn(User $user) => $user->permission->consignee_delete == 1);
        //customer_attachment
        Gate::define('customer_attachment_list',fn(User $user) => $user->permission->customer_attachment_list == 1);
        Gate::define('customer_attachment_create',fn(User $user) => $user->permission->customer_attachment_create == 1);
        Gate::define('customer_attachment_edit',fn(User $user) => $user->permission->customer_attachment_edit == 1);
        Gate::define('customer_attachment_delete',fn(User $user) => $user->permission->customer_attachment_delete == 1);
        //employee
        Gate::define('employee_list',fn(User $user) => $user->permission->employee_list == 1);
        Gate::define('employee_create',fn(User $user) => $user->permission->employee_create == 1);
        Gate::define('employee_edit',fn(User $user) => $user->permission->employee_edit == 1);

        //recruitment
        Gate::define('recruitment_list',fn(User $user) => $user->permission->recruitment_list == 1);
        Gate::define('recruitment_create',fn(User $user) => $user->permission->recruitment_create == 1);
        Gate::define('recruitment_edit',fn(User $user) => $user->permission->recruitment_edit == 1);
        Gate::define('recruitment_delete',fn(User $user) => $user->permission->recruitment_delete == 1);
        //recruitment_attachment
        Gate::define('recruitment_attachment_list',fn(User $user) => $user->permission->recruitment_attachment_list == 1);
        Gate::define('recruitment_attachment_create',fn(User $user) => $user->permission->recruitment_attachment_create == 1);
        Gate::define('recruitment_attachment_edit',fn(User $user) => $user->permission->recruitment_attachment_edit == 1);
        Gate::define('recruitment_attachment_delete',fn(User $user) => $user->permission->recruitment_attachment_delete == 1);
        //recruitment_candidate
        Gate::define('recruitment_candidate_list',fn(User $user) => $user->permission->recruitment_candidate_list == 1);
        Gate::define('recruitment_candidate_create',fn(User $user) => $user->permission->recruitment_candidate_create == 1);
        Gate::define('recruitment_candidate_edit',fn(User $user) => $user->permission->recruitment_candidate_edit == 1);
        Gate::define('recruitment_candidate_delete',fn(User $user) => $user->permission->recruitment_candidate_delete == 1);
        //quotation
        Gate::define('quotation_list',fn(User $user) => $user->permission->quotation_list == 1);
        Gate::define('quotation_create',fn(User $user) => $user->permission->quotation_create == 1);
        Gate::define('quotation_edit',fn(User $user) => $user->permission->quotation_edit == 1);
        Gate::define('quotation_delete',fn(User $user) => $user->permission->quotation_delete == 1);
        //vendor
        Gate::define('vendor_list',fn(User $user) => $user->permission->vendor_list == 1);
        Gate::define('vendor_create',fn(User $user) => $user->permission->vendor_create == 1);
        Gate::define('vendor_edit',fn(User $user) => $user->permission->vendor_edit == 1);
        //vendor_contact
        Gate::define('vendor_contact_list',fn(User $user) => $user->permission->vendor_contact_list == 1);
        Gate::define('vendor_contact_create',fn(User $user) => $user->permission->vendor_contact_create == 1);
        Gate::define('vendor_contact_edit',fn(User $user) => $user->permission->vendor_contact_edit == 1);
        Gate::define('vendor_contact_delete',fn(User $user) => $user->permission->vendor_contact_delete == 1);
        //vendor_attachment
        Gate::define('vendor_attachment_list',fn(User $user) => $user->permission->vendor_attachment_list == 1);
        Gate::define('vendor_attachment_create',fn(User $user) => $user->permission->vendor_attachment_create == 1);
        Gate::define('vendor_attachment_edit',fn(User $user) => $user->permission->vendor_attachment_edit == 1);
        Gate::define('vendor_attachment_delete',fn(User $user) => $user->permission->vendor_attachment_delete == 1);
        //product
        Gate::define('product_list',fn(User $user) => $user->permission->product_list == 1);
        Gate::define('product_create',fn(User $user) => $user->permission->product_create == 1);
        Gate::define('product_edit',fn(User $user) => $user->permission->product_edit == 1);
        //product_vendor
        Gate::define('product_vendor_list',fn(User $user) => $user->permission->product_vendor_list == 1);
        Gate::define('product_vendor_create',fn(User $user) => $user->permission->product_vendor_create == 1);
        Gate::define('product_vendor_edit',fn(User $user) => $user->permission->product_vendor_edit == 1);
        Gate::define('product_vendor_delete',fn(User $user) => $user->permission->product_vendor_delete == 1);
        //product_attachment
        Gate::define('product_attachment_list',fn(User $user) => $user->permission->product_attachment_list == 1);
        Gate::define('product_attachment_create',fn(User $user) => $user->permission->product_attachment_create == 1);
        Gate::define('product_attachment_edit',fn(User $user) => $user->permission->product_attachment_edit == 1);
        Gate::define('product_attachment_delete',fn(User $user) => $user->permission->product_attachment_delete == 1);
        //purchase_order
        Gate::define('purchase_order_list',fn(User $user) => $user->permission->purchase_order_list == 1);
        Gate::define('purchase_order_create',fn(User $user) => $user->permission->purchase_order_create == 1);
        Gate::define('purchase_order_edit',fn(User $user) => $user->permission->purchase_order_edit == 1);
        //procurement
        Gate::define('procurement_list',fn(User $user) => $user->permission->procurement_list == 1);
        Gate::define('procurement_create',fn(User $user) => $user->permission->procurement_create == 1);
        Gate::define('procurement_edit',fn(User $user) => $user->permission->procurement_edit == 1);
        //procurement_vendor
        Gate::define('procurement_vendor_list',fn(User $user) => $user->permission->procurement_vendor_list == 1);
        Gate::define('procurement_vendor_create',fn(User $user) => $user->permission->procurement_vendor_create == 1);
        Gate::define('procurement_vendor_edit',fn(User $user) => $user->permission->procurement_vendor_edit == 1);
        Gate::define('procurement_vendor_delete',fn(User $user) => $user->permission->procurement_vendor_delete == 1);
        //procurement_attachment
        Gate::define('procurement_attachment_list',fn(User $user) => $user->permission->procurement_attachment_list == 1);
        Gate::define('procurement_attachment_create',fn(User $user) => $user->permission->procurement_attachment_create == 1);
        Gate::define('procurement_attachment_edit',fn(User $user) => $user->permission->procurement_attachment_edit == 1);
        Gate::define('procurement_attachment_delete',fn(User $user) => $user->permission->procurement_attachment_delete == 1);
        //directory
        Gate::define('directory_list',fn(User $user) => $user->permission->directory_list == 1);
        Gate::define('directory_create',fn(User $user) => $user->permission->directory_create == 1);
        Gate::define('directory_edit',fn(User $user) => $user->permission->directory_edit == 1);
        //department
        Gate::define('department_list',fn(User $user) => $user->permission->department_list == 1);
        Gate::define('department_create',fn(User $user) => $user->permission->department_create == 1);
        Gate::define('department_edit',fn(User $user) => $user->permission->department_edit == 1);
        Gate::define('department_delete',fn(User $user) => $user->permission->department_delete == 1);
        //assets
        Gate::define('assets_list',fn(User $user) => $user->permission->assets_list == 1);
        Gate::define('assets_create',fn(User $user) => $user->permission->assets_create == 1);
        Gate::define('assets_edit',fn(User $user) => $user->permission->assets_edit == 1);
        Gate::define('assets_delete',fn(User $user) => $user->permission->assets_delete == 1);
        //asset type
        Gate::define('asset_type_list',fn(User $user) => $user->permission->asset_type_list == 1);
        Gate::define('asset_type_create',fn(User $user) => $user->permission->asset_type_create == 1);
        Gate::define('asset_type_edit',fn(User $user) => $user->permission->asset_type_edit == 1);
        Gate::define('asset_type_delete',fn(User $user) => $user->permission->asset_type_delete == 1);
        //credentials
        Gate::define('credentials_list',fn(User $user) => $user->permission->credentials_list == 1);
        Gate::define('credentials_create',fn(User $user) => $user->permission->credentials_create == 1);
        Gate::define('credentials_edit',fn(User $user) => $user->permission->credentials_edit == 1);
        Gate::define('credentials_delete',fn(User $user) => $user->permission->credentials_delete == 1);
        // role
        Gate::define('role_list',fn(User $user) => $user->permission->role_list == 1);
        Gate::define('role_create',fn(User $user) => $user->permission->role_create == 1);
        Gate::define('role_edit',fn(User $user) => $user->permission->role_edit == 1);
        Gate::define('role_delete',fn(User $user) => $user->permission->role_delete == 1);
        // designation
        Gate::define('designation_list',fn(User $user) => $user->permission->designation_list == 1);
        Gate::define('designation_create',fn(User $user) => $user->permission->designation_create == 1);
        Gate::define('designation_edit',fn(User $user) => $user->permission->designation_edit == 1);
        Gate::define('designation_delete',fn(User $user) => $user->permission->designation_delete == 1);
        // segment
        Gate::define('segment_list',fn(User $user) => $user->permission->segment_list == 1);
        Gate::define('segment_create',fn(User $user) => $user->permission->segment_create == 1);
        Gate::define('segment_edit',fn(User $user) => $user->permission->segment_edit == 1);
        Gate::define('segment_delete',fn(User $user) => $user->permission->segment_delete == 1);
        // category
        Gate::define('category_list',fn(User $user) => $user->permission->category_list == 1);
        Gate::define('category_create',fn(User $user) => $user->permission->category_create == 1);
        Gate::define('category_edit',fn(User $user) => $user->permission->category_edit == 1);
        Gate::define('category_delete',fn(User $user) => $user->permission->category_delete == 1);
        //customer_type
        Gate::define('customer_type_list',fn(User $user) => $user->permission->customer_type_list == 1);
        Gate::define('customer_type_create',fn(User $user) => $user->permission->customer_type_create == 1);
        Gate::define('customer_type_edit',fn(User $user) => $user->permission->customer_type_edit == 1);
        Gate::define('customer_type_delete',fn(User $user) => $user->permission->customer_type_delete == 1);
        //customer_base
        Gate::define('customer_base_list',fn(User $user) => $user->permission->customer_base_list == 1);
        Gate::define('customer_base_create',fn(User $user) => $user->permission->customer_base_create == 1);
        Gate::define('customer_base_edit',fn(User $user) => $user->permission->customer_base_edit == 1);
        Gate::define('customer_base_delete',fn(User $user) => $user->permission->customer_base_delete == 1);
        //vendor_type
        Gate::define('vendor_type_list',fn(User $user) => $user->permission->vendor_type_list == 1);
        Gate::define('vendor_type_create',fn(User $user) => $user->permission->vendor_type_create == 1);
        Gate::define('vendor_type_edit',fn(User $user) => $user->permission->vendor_type_edit == 1);
        Gate::define('vendor_type_delete',fn(User $user) => $user->permission->vendor_type_delete == 1);
        //entity_type
        Gate::define('entity_type_list',fn(User $user) => $user->permission->entity_type_list == 1);
        Gate::define('entity_type_create',fn(User $user) => $user->permission->entity_type_create == 1);
        Gate::define('entity_type_edit',fn(User $user) => $user->permission->entity_type_edit == 1);
        Gate::define('entity_type_delete',fn(User $user) => $user->permission->entity_type_delete == 1);
        //vendor_behavior
        Gate::define('vendor_behavior_list',fn(User $user) => $user->permission->vendor_behavior_list == 1);
        Gate::define('vendor_behavior_create',fn(User $user) => $user->permission->vendor_behavior_create == 1);
        Gate::define('vendor_behavior_edit',fn(User $user) => $user->permission->vendor_behavior_edit == 1);
        Gate::define('vendor_behavior_delete',fn(User $user) => $user->permission->vendor_behavior_delete == 1);
        // attachment
        Gate::define('attachment_list',fn(User $user) => $user->permission->attachment_list == 1);
        Gate::define('attachment_create',fn(User $user) => $user->permission->attachment_create == 1);
        Gate::define('attachment_edit',fn(User $user) => $user->permission->attachment_edit == 1);
        Gate::define('attachment_delete',fn(User $user) => $user->permission->attachment_delete == 1);
        // hsn_code
        Gate::define('hsn_code_list',fn(User $user) => $user->permission->hsn_code_list == 1);
        Gate::define('hsn_code_create',fn(User $user) => $user->permission->hsn_code_create == 1);
        Gate::define('hsn_code_edit',fn(User $user) => $user->permission->hsn_code_edit == 1);
        Gate::define('hsn_code_delete',fn(User $user) => $user->permission->hsn_code_delete == 1);
        // unit_of_measurement
        Gate::define('unit_of_measurement_list',fn(User $user) => $user->permission->unit_of_measurement_list == 1);
        Gate::define('unit_of_measurement_create',fn(User $user) => $user->permission->unit_of_measurement_create == 1);
        Gate::define('unit_of_measurement_edit',fn(User $user) => $user->permission->unit_of_measurement_edit == 1);
        Gate::define('unit_of_measurement_delete',fn(User $user) => $user->permission->unit_of_measurement_delete == 1);
        // product_type
        Gate::define('product_type_list',fn(User $user) => $user->permission->product_type_list == 1);
        Gate::define('product_type_create',fn(User $user) => $user->permission->product_type_create == 1);
        Gate::define('product_type_edit',fn(User $user) => $user->permission->product_type_edit == 1);
        Gate::define('product_type_delete',fn(User $user) => $user->permission->product_type_delete == 1);
        // product_condition
        Gate::define('product_condition_list',fn(User $user) => $user->permission->product_condition_list == 1);
        Gate::define('product_condition_create',fn(User $user) => $user->permission->product_condition_create == 1);
        Gate::define('product_condition_edit',fn(User $user) => $user->permission->product_condition_edit == 1);
        Gate::define('product_condition_delete',fn(User $user) => $user->permission->product_condition_delete == 1);
        // gst_percent
        Gate::define('gst_percent_list',fn(User $user) => $user->permission->gst_percent_list == 1);
        Gate::define('gst_percent_create',fn(User $user) => $user->permission->gst_percent_create == 1);
        Gate::define('gst_percent_edit',fn(User $user) => $user->permission->gst_percent_edit == 1);
        Gate::define('gst_percent_delete',fn(User $user) => $user->permission->gst_percent_delete == 1);
        // terms_and_conditions
        Gate::define('terms_and_conditions_list',fn(User $user) => $user->permission->terms_and_conditions_list == 1);
        Gate::define('terms_and_conditions_create',fn(User $user) => $user->permission->terms_and_conditions_create == 1);
        Gate::define('terms_and_conditions_edit',fn(User $user) => $user->permission->terms_and_conditions_edit == 1);
        Gate::define('terms_and_conditions_delete',fn(User $user) => $user->permission->terms_and_conditions_delete == 1);
        // company_details
        Gate::define('company_details_edit',fn(User $user) => $user->permission->company_details_edit == 1);
        // currency
        Gate::define('currency_list',fn(User $user) => $user->permission->currency_list == 1);
        Gate::define('currency_create',fn(User $user) => $user->permission->currency_create == 1);
        Gate::define('currency_edit',fn(User $user) => $user->permission->currency_edit == 1);
        Gate::define('currency_delete',fn(User $user) => $user->permission->currency_delete == 1);
        // bank_account
        Gate::define('bank_account_list',fn(User $user) => $user->permission->bank_account_list == 1);
        Gate::define('bank_account_create',fn(User $user) => $user->permission->bank_account_create == 1);
        Gate::define('bank_account_edit',fn(User $user) => $user->permission->bank_account_edit == 1);
        Gate::define('bank_account_delete',fn(User $user) => $user->permission->bank_account_delete == 1);
        // bank_details
        Gate::define('bank_details_list',fn(User $user) => $user->permission->bank_details_list == 1);
        Gate::define('bank_details_create',fn(User $user) => $user->permission->bank_details_create == 1);
        Gate::define('bank_details_edit',fn(User $user) => $user->permission->bank_details_edit == 1);
        Gate::define('bank_details_delete',fn(User $user) => $user->permission->bank_details_delete == 1);
        // inco_terms
        Gate::define('inco_terms_list',fn(User $user) => $user->permission->inco_terms_list == 1);
        Gate::define('inco_terms_create',fn(User $user) => $user->permission->inco_terms_create == 1);
        Gate::define('inco_terms_edit',fn(User $user) => $user->permission->inco_terms_edit == 1);
        Gate::define('inco_terms_delete',fn(User $user) => $user->permission->inco_terms_delete == 1);
        // ffd
        Gate::define('ffd_list',fn(User $user) => $user->permission->ffd_list == 1);
        Gate::define('ffd_create',fn(User $user) => $user->permission->ffd_create == 1);
        Gate::define('ffd_edit',fn(User $user) => $user->permission->ffd_edit == 1);
        Gate::define('ffd_delete',fn(User $user) => $user->permission->ffd_delete == 1);
        //ffd_contact
        Gate::define('ffd_contact_list',fn(User $user) => $user->permission->ffd_contact_list == 1);
        Gate::define('ffd_contact_create',fn(User $user) => $user->permission->ffd_contact_create == 1);
        Gate::define('ffd_contact_edit',fn(User $user) => $user->permission->ffd_contact_edit == 1);
        Gate::define('ffd_contact_delete',fn(User $user) => $user->permission->ffd_contact_delete == 1);
        // irm
        Gate::define('irm_list',fn(User $user) => $user->permission->irm_list == 1 || $user->permission->invoice_list == 1);
        Gate::define('irm_create',fn(User $user) => $user->permission->irm_create == 1);
        Gate::define('irm_edit',fn(User $user) => $user->permission->irm_edit == 1);
        Gate::define('irm_delete',fn(User $user) => $user->permission->irm_delete == 1);
        //invoice
        Gate::define('invoice_list',fn(User $user) => $user->permission->invoice_list == 1);
        Gate::define('invoice_create',fn(User $user) => $user->permission->invoice_create == 1);
        Gate::define('invoice_edit',fn(User $user) => $user->permission->invoice_edit == 1);
        Gate::define('invoice_delete',fn(User $user) => $user->permission->invoice_delete == 1);
        //compliance
        Gate::define('compliance_list',fn(User $user) => $user->permission->compliance_list == 1);
        Gate::define('compliance_create',fn(User $user) => $user->permission->compliance_create == 1);
        Gate::define('compliance_edit',fn(User $user) => $user->permission->compliance_edit == 1);
        Gate::define('compliance_delete',fn(User $user) => $user->permission->compliance_delete == 1);
        //examine
        Gate::define('examine_list',fn(User $user) => $user->permission->examine_list == 1);
        Gate::define('examine_create',fn(User $user) => $user->permission->examine_create == 1);
        Gate::define('examine_edit',fn(User $user) => $user->permission->examine_edit == 1);
        Gate::define('examine_delete',fn(User $user) => $user->permission->examine_delete == 1);
        //regulatory
        Gate::define('regulatory_list',fn(User $user) => $user->permission->regulatory_list == 1);
        Gate::define('regulatory_create',fn(User $user) => $user->permission->regulatory_create == 1);
        Gate::define('regulatory_edit',fn(User $user) => $user->permission->regulatory_edit == 1);
        Gate::define('regulatory_delete',fn(User $user) => $user->permission->regulatory_delete == 1);
         //ebrc
        Gate::define('ebrc_list',fn(User $user) => $user->permission->ebrc_list == 1);
        Gate::define('ebrc_create',fn(User $user) => $user->permission->ebrc_create == 1);
        Gate::define('ebrc_edit',fn(User $user) => $user->permission->ebrc_edit == 1);
        Gate::define('ebrc_delete',fn(User $user) => $user->permission->ebrc_delete == 1);

         //business_task
        Gate::define('business_task_list',fn(User $user) => $user->permission->business_task_list == 1);
        Gate::define('business_task_create',fn(User $user) => $user->permission->business_task_create == 1);
        Gate::define('business_task_edit',fn(User $user) => $user->permission->business_task_edit == 1);
        Gate::define('business_task_delete',fn(User $user) => $user->permission->business_task_delete == 1);

        //business_task_team
        Gate::define('business_task_team_list',fn(User $user) => $user->permission->business_task_team_list == 1);
        Gate::define('business_task_team_create',fn(User $user) => $user->permission->business_task_team_create == 1);
        Gate::define('business_task_team_edit',fn(User $user) => $user->permission->business_task_team_edit == 1);
        Gate::define('business_task_team_delete',fn(User $user) => $user->permission->business_task_team_delete == 1);

        //business_task_view
        Gate::define('business_task_view_list',fn(User $user) => $user->permission->business_task_view_list == 1);
        Gate::define('business_task_view_create',fn(User $user) => $user->permission->business_task_view_create == 1);
        Gate::define('business_task_view_edit',fn(User $user) => $user->permission->business_task_view_edit == 1);
        Gate::define('business_task_view_delete',fn(User $user) => $user->permission->business_task_view_delete == 1);

        //business_task_edit
        Gate::define('business_task_edit_list',fn(User $user) => $user->permission->business_task_edit_list == 1);
        Gate::define('business_task_edit_create',fn(User $user) => $user->permission->business_task_edit_create == 1);
        Gate::define('business_task_edit_edit',fn(User $user) => $user->permission->business_task_edit_edit == 1);
        Gate::define('business_task_edit_delete',fn(User $user) => $user->permission->business_task_edit_delete == 1);
        // kpi
        Gate::define('kpi_list',fn(User $user) => $user->permission->kpi_list == 1);
        Gate::define('kpi_create',fn(User $user) => $user->permission->kpi_create == 1);
        Gate::define('kpi_edit',fn(User $user) => $user->permission->kpi_edit == 1);
        Gate::define('kpi_delete',fn(User $user) => $user->permission->kpi_delete == 1);

        // stages
        Gate::define('stages_list',fn(User $user) => $user->permission->stages_list == 1);
        Gate::define('stages_create',fn(User $user) => $user->permission->stages_create == 1);
        Gate::define('stages_edit',fn(User $user) => $user->permission->stages_edit == 1);
        Gate::define('stages_delete',fn(User $user) => $user->permission->stages_delete == 1);

        //Location detail
        Gate::define('location_detail_list',    fn(User $user) => $user->permission->location_detail_list == 1);
        Gate::define('location_detail_create',  fn(User $user) => $user->permission->location_detail_create == 1);
        Gate::define('location_detail_edit',    fn(User $user) => $user->permission->location_detail_edit == 1);
        Gate::define('location_detail_delete',  fn(User $user) => $user->permission->location_detail_delete == 1);
        // location-detail ends

        //Warehouse-inward
        Gate::define('warehouse_list',    fn(User $user) => $user->permission->warehouse_list == 1);
        Gate::define('warehouse_create',  fn(User $user) => $user->permission->warehouse_create == 1);
        Gate::define('warehouse_edit',    fn(User $user) => $user->permission->warehouse_edit == 1);
        Gate::define('warehouse_delete',  fn(User $user) => $user->permission->warehouse_delete == 1);
        // //Warehouse-outward

        // Gate::define('warehouse_outward_list',    fn(User $user) => $user->permission->warehouse_outward_list == 1);
        // Gate::define('warehouse_outward_create',  fn(User $user) => $user->permission->warehouse_outward_create == 1);
        // Gate::define('warehouse_outward_edit',    fn(User $user) => $user->permission->warehouse_outward_edit == 1);
        // Gate::define('warehouse_outward_delete',  fn(User $user) => $user->permission->warehouse_outward_delete == 1);

        //Dashboard Permissions ********* coming from dashboard_permissions table
        Gate::define('bt_timeline', function(User $user) {
            if($user->dashboard_permission != null) {
                return $user->dashboard_permission->bt_timeline;
            } else {
                return false;
            }
        });
        Gate::define('edoc_timeline', function(User $user) {
            if($user->dashboard_permission != null) {
                return  $user->dashboard_permission->edoc_timeline;
            } else {
                return false;
            }
        });
        Gate::define('wms_reporting', function(User $user) {
            if($user->dashboard_permission != null) {
                return  $user->dashboard_permission->wms_reporting;
            } else {
                return false;
            }
        });
        Gate::define('wms_dashboard', function(User $user) {
            if($user->dashboard_permission != null) {
                return  $user->dashboard_permission->wms_dashboard;
            } else {
                return false;
            }
        });
    }

}
