<?php

use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

return new class extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('permissions', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('user_id')->unique();
            $table->foreign('user_id')->references('id')->on('users')->onDelete('cascade');
            $table->boolean('customer_list')->nullable()->default(0);
            $table->boolean('customer_create')->nullable()->default(0);
            $table->boolean('customer_edit')->nullable()->default(0);
            $table->boolean('customer_delete')->nullable()->default(0);
            $table->boolean('contact_person_list')->nullable()->default(0);
            $table->boolean('contact_person_create')->nullable()->default(0);
            $table->boolean('contact_person_edit')->nullable()->default(0);
            $table->boolean('contact_person_delete')->nullable()->default(0);
            $table->boolean('consignee_list')->nullable()->default(0);
            $table->boolean('consignee_create')->nullable()->default(0);
            $table->boolean('consignee_edit')->nullable()->default(0);
            $table->boolean('consignee_delete')->nullable()->default(0);
            $table->boolean('customer_attachment_list')->nullable()->default(0);
            $table->boolean('customer_attachment_create')->nullable()->default(0);
            $table->boolean('customer_attachment_edit')->nullable()->default(0);
            $table->boolean('customer_attachment_delete')->nullable()->default(0);
            $table->boolean('employee_list')->nullable()->default(0);
            $table->boolean('employee_create')->nullable()->default(0);
            $table->boolean('employee_edit')->nullable()->default(0);
            $table->boolean('recruitment_list')->nullable()->default(0);
            $table->boolean('recruitment_create')->nullable()->default(0);
            $table->boolean('recruitment_edit')->nullable()->default(0);
            $table->boolean('recruitment_delete')->nullable()->default(0);
            $table->boolean('recruitment_attachment_list')->nullable()->default(0);
            $table->boolean('recruitment_attachment_create')->nullable()->default(0);
            $table->boolean('recruitment_attachment_edit')->nullable()->default(0);
            $table->boolean('recruitment_attachment_delete')->nullable()->default(0);
            $table->boolean('recruitment_candidate_list')->nullable()->default(0);
            $table->boolean('recruitment_candidate_create')->nullable()->default(0);
            $table->boolean('recruitment_candidate_edit')->nullable()->default(0);
            $table->boolean('recruitment_candidate_delete')->nullable()->default(0);
            $table->boolean('quotation_list')->nullable()->default(0);
            $table->boolean('quotation_create')->nullable()->default(0);
            $table->boolean('quotation_edit')->nullable()->default(0);
            $table->boolean('quotation_delete')->nullable()->default(0);
            $table->boolean('vendor_list')->nullable()->default(0);
            $table->boolean('vendor_create')->nullable()->default(0);
            $table->boolean('vendor_edit')->nullable()->default(0);
            $table->boolean('vendor_contact_list')->nullable()->default(0);
            $table->boolean('vendor_contact_create')->nullable()->default(0);
            $table->boolean('vendor_contact_edit')->nullable()->default(0);
            $table->boolean('vendor_contact_delete')->nullable()->default(0);
            $table->boolean('vendor_attachment_list')->nullable()->default(0);
            $table->boolean('vendor_attachment_create')->nullable()->default(0);
            $table->boolean('vendor_attachment_edit')->nullable()->default(0);
            $table->boolean('vendor_attachment_delete')->nullable()->default(0);
            $table->boolean('product_list')->nullable()->default(0);
            $table->boolean('product_create')->nullable()->default(0);
            $table->boolean('product_edit')->nullable()->default(0);
            $table->boolean('product_vendor_list')->nullable()->default(0);
            $table->boolean('product_vendor_create')->nullable()->default(0);
            $table->boolean('product_vendor_edit')->nullable()->default(0);
            $table->boolean('product_vendor_delete')->nullable()->default(0);
            $table->boolean('product_attachment_list')->nullable()->default(0);
            $table->boolean('product_attachment_create')->nullable()->default(0);
            $table->boolean('product_attachment_edit')->nullable()->default(0);
            $table->boolean('product_attachment_delete')->nullable()->default(0);
            $table->boolean('purchase_order_list')->nullable()->default(0);
            $table->boolean('purchase_order_create')->nullable()->default(0);
            $table->boolean('purchase_order_edit')->nullable()->default(0);
            $table->boolean('procurement_list')->nullable()->default(0);
            $table->boolean('procurement_create')->nullable()->default(0);
            $table->boolean('procurement_edit')->nullable()->default(0);
            $table->boolean('procurement_vendor_list')->nullable()->default(0);
            $table->boolean('procurement_vendor_create')->nullable()->default(0);
            $table->boolean('procurement_vendor_edit')->nullable()->default(0);
            $table->boolean('procurement_vendor_delete')->nullable()->default(0);
            $table->boolean('procurement_attachment_list')->nullable()->default(0);
            $table->boolean('procurement_attachment_create')->nullable()->default(0);
            $table->boolean('procurement_attachment_edit')->nullable()->default(0);
            $table->boolean('procurement_attachment_delete')->nullable()->default(0);
            $table->boolean('directory_list')->nullable()->default(0);
            $table->boolean('directory_create')->nullable()->default(0);
            $table->boolean('directory_edit')->nullable()->default(0);
            $table->boolean('assets_list')->nullable()->default(0);
            $table->boolean('assets_create')->nullable()->default(0);
            $table->boolean('assets_edit')->nullable()->default(0);
            $table->boolean('assets_delete')->nullable()->default(0);
            $table->boolean('asset_type_list')->nullable()->default(0);
            $table->boolean('asset_type_create')->nullable()->default(0);
            $table->boolean('asset_type_edit')->nullable()->default(0);
            $table->boolean('asset_type_delete')->nullable()->default(0);
            $table->boolean('credentials_list')->nullable()->default(0);
            $table->boolean('credentials_create')->nullable()->default(0);
            $table->boolean('credentials_edit')->nullable()->default(0);
            $table->boolean('credentials_delete')->nullable()->default(0);
            $table->boolean('department_list')->nullable()->default(0);
            $table->boolean('department_create')->nullable()->default(0);
            $table->boolean('department_edit')->nullable()->default(0);
            $table->boolean('department_delete')->nullable()->default(0);
            $table->boolean('role_list')->nullable()->default(0);
            $table->boolean('role_create')->nullable()->default(0);
            $table->boolean('role_edit')->nullable()->default(0);
            $table->boolean('role_delete')->nullable()->default(0);
            $table->boolean('designation_list')->nullable()->default(0);
            $table->boolean('designation_create')->nullable()->default(0);
            $table->boolean('designation_edit')->nullable()->default(0);
            $table->boolean('designation_delete')->nullable()->default(0);
            $table->boolean('segment_list')->nullable()->default(0);
            $table->boolean('segment_create')->nullable()->default(0);
            $table->boolean('segment_edit')->nullable()->default(0);
            $table->boolean('segment_delete')->nullable()->default(0);
            $table->boolean('category_list')->nullable()->default(0);
            $table->boolean('category_create')->nullable()->default(0);
            $table->boolean('category_edit')->nullable()->default(0);
            $table->boolean('category_delete')->nullable()->default(0);
            $table->boolean('customer_type_list')->nullable()->default(0);
            $table->boolean('customer_type_create')->nullable()->default(0);
            $table->boolean('customer_type_edit')->nullable()->default(0);
            $table->boolean('customer_type_delete')->nullable()->default(0);
            $table->boolean('customer_base_list')->nullable()->default(0);
            $table->boolean('customer_base_create')->nullable()->default(0);
            $table->boolean('customer_base_edit')->nullable()->default(0);
            $table->boolean('customer_base_delete')->nullable()->default(0);
            $table->boolean('vendor_type_list')->nullable()->default(0);
            $table->boolean('vendor_type_create')->nullable()->default(0);
            $table->boolean('vendor_type_edit')->nullable()->default(0);
            $table->boolean('vendor_type_delete')->nullable()->default(0);
            $table->boolean('entity_type_list')->nullable()->default(0);
            $table->boolean('entity_type_create')->nullable()->default(0);
            $table->boolean('entity_type_edit')->nullable()->default(0);
            $table->boolean('entity_type_delete')->nullable()->default(0);
            $table->boolean('vendor_behavior_list')->nullable()->default(0);
            $table->boolean('vendor_behavior_create')->nullable()->default(0);
            $table->boolean('vendor_behavior_edit')->nullable()->default(0);
            $table->boolean('vendor_behavior_delete')->nullable()->default(0);
            $table->boolean('attachment_list')->nullable()->default(0);
            $table->boolean('attachment_create')->nullable()->default(0);
            $table->boolean('attachment_edit')->nullable()->default(0);
            $table->boolean('attachment_delete')->nullable()->default(0);
            $table->boolean('hsn_code_list')->nullable()->default(0);
            $table->boolean('hsn_code_create')->nullable()->default(0);
            $table->boolean('hsn_code_edit')->nullable()->default(0);
            $table->boolean('hsn_code_delete')->nullable()->default(0);
            $table->boolean('unit_of_measurement_list')->nullable()->default(0);
            $table->boolean('unit_of_measurement_create')->nullable()->default(0);
            $table->boolean('unit_of_measurement_edit')->nullable()->default(0);
            $table->boolean('unit_of_measurement_delete')->nullable()->default(0);
            $table->boolean('product_type_list')->nullable()->default(0);
            $table->boolean('product_type_create')->nullable()->default(0);
            $table->boolean('product_type_edit')->nullable()->default(0);
            $table->boolean('product_type_delete')->nullable()->default(0);
            $table->boolean('product_condition_list')->nullable()->default(0);
            $table->boolean('product_condition_create')->nullable()->default(0);
            $table->boolean('product_condition_edit')->nullable()->default(0);
            $table->boolean('product_condition_delete')->nullable()->default(0);
            $table->boolean('gst_percent_list')->nullable()->default(0);
            $table->boolean('gst_percent_create')->nullable()->default(0);
            $table->boolean('gst_percent_edit')->nullable()->default(0);
            $table->boolean('gst_percent_delete')->nullable()->default(0);
            $table->boolean('terms_and_conditions_list')->nullable()->default(0);
            $table->boolean('terms_and_conditions_create')->nullable()->default(0);
            $table->boolean('terms_and_conditions_edit')->nullable()->default(0);
            $table->boolean('terms_and_conditions_delete')->nullable()->default(0);
            $table->boolean('company_details_edit')->nullable()->default(0);
            $table->boolean('currency_list')->nullable()->default(0);
            $table->boolean('currency_create')->nullable()->default(0);
            $table->boolean('currency_edit')->nullable()->default(0);
            $table->boolean('currency_delete')->nullable()->default(0);
            $table->boolean('bank_account_list')->nullable()->default(0);
            $table->boolean('bank_account_create')->nullable()->default(0);
            $table->boolean('bank_account_edit')->nullable()->default(0);
            $table->boolean('bank_account_delete')->nullable()->default(0);
            $table->boolean('inco_terms_list')->nullable()->default(0);
            $table->boolean('inco_terms_create')->nullable()->default(0);
            $table->boolean('inco_terms_edit')->nullable()->default(0);
            $table->boolean('inco_terms_delete')->nullable()->default(0);
            $table->boolean('ffd_list')->nullable()->default(0);
            $table->boolean('ffd_create')->nullable()->default(0);
            $table->boolean('ffd_edit')->nullable()->default(0);
            $table->boolean('ffd_delete')->nullable()->default(0);
            $table->boolean('ffd_contact_list')->nullable()->default(0);
            $table->boolean('ffd_contact_create')->nullable()->default(0);
            $table->boolean('ffd_contact_edit')->nullable()->default(0);
            $table->boolean('ffd_contact_delete')->nullable()->default(0);
            $table->boolean('irm_list')->nullable()->default(0);
            $table->boolean('irm_create')->nullable()->default(0);
            $table->boolean('irm_edit')->nullable()->default(0);
            $table->boolean('irm_delete')->nullable()->default(0);
            $table->boolean('invoice_list')->nullable()->default(0);
            $table->boolean('invoice_create')->nullable()->default(0);
            $table->boolean('invoice_edit')->nullable()->default(0);
            $table->boolean('invoice_delete')->nullable()->default(0);
            $table->boolean('compliance_list')->nullable()->default(0);
            $table->boolean('compliance_create')->nullable()->default(0);
            $table->boolean('compliance_edit')->nullable()->default(0);
            $table->boolean('compliance_delete')->nullable()->default(0);
            $table->boolean('examine_list')->nullable()->default(0);
            $table->boolean('examine_create')->nullable()->default(0);
            $table->boolean('examine_edit')->nullable()->default(0);
            $table->boolean('examine_delete')->nullable()->default(0);
            $table->boolean('regulatory_list')->nullable()->default(0);
            $table->boolean('regulatory_create')->nullable()->default(0);
            $table->boolean('regulatory_edit')->nullable()->default(0);
            $table->boolean('regulatory_delete')->nullable()->default(0);
            $table->boolean('ebrc_list')->nullable()->default(0);
            $table->boolean('ebrc_create')->nullable()->default(0);
            $table->boolean('ebrc_edit')->nullable()->default(0);
            $table->boolean('ebrc_delete')->nullable()->default(0);
            $table->boolean('business_task_list')->nullable()->default(0);
            $table->boolean('business_task_create')->nullable()->default(0);
            $table->boolean('business_task_edit')->nullable()->default(0);
            $table->boolean('business_task_delete')->nullable()->default(0);
            $table->boolean('business_task_team_list')->nullable()->default(0);
            $table->boolean('business_task_team_create')->nullable()->default(0);
            $table->boolean('business_task_team_edit')->nullable()->default(0);
            $table->boolean('business_task_team_delete')->nullable()->default(0);
            $table->boolean('kpi_list')->nullable()->default(0);
            $table->boolean('kpi_create')->nullable()->default(0);
            $table->boolean('kpi_edit')->nullable()->default(0);
            $table->boolean('kpi_delete')->nullable()->default(0);
            $table->boolean('location_detail_list')->nullable()->default(0);
            $table->boolean('location_detail_create')->nullable()->default(0);
            $table->boolean('location_detail_edit')->nullable()->default(0);
            $table->boolean('location_detail_delete')->nullable()->default(0);
            $table->boolean('bank_details_list')->nullable()->default(0);
            $table->boolean('bank_details_create')->nullable()->default(0);
            $table->boolean('bank_details_edit')->nullable()->default(0);
            $table->boolean('bank_details_delete')->nullable()->default(0);
            $table->boolean('business_task_view_list')->nullable()->default(0);
            $table->boolean('business_task_view_create')->nullable()->default(0);
            $table->boolean('business_task_view_edit')->nullable()->default(0);
            $table->boolean('business_task_view_delete')->nullable()->default(0);
            $table->boolean('business_task_edit_list')->nullable()->default(0);
            $table->boolean('business_task_edit_create')->nullable()->default(0);
            $table->boolean('business_task_edit_edit')->nullable()->default(0);
            $table->boolean('business_task_edit_delete')->nullable()->default(0);
            $table->boolean('stages_list')->nullable()->default(0);
            $table->boolean('stages_create')->nullable()->default(0);
            $table->boolean('stages_edit')->nullable()->default(0);
            $table->boolean('stages_delete')->nullable()->default(0);
            $table->boolean('warehouse_list')->nullable()->default(0);
            $table->boolean('warehouse_create')->nullable()->default(0);
            $table->boolean('warehouse_edit')->nullable()->default(0);
            $table->boolean('warehouse_delete')->nullable()->default(0);
            $table->timestamps();
        });

        DB::table('permissions')->insert(
            array(
                'user_id' => '1',
                'customer_list' => true,
                'customer_create' => true,
                'customer_edit' => true,
                'customer_delete' => true,
                'contact_person_list' => true,
                'contact_person_create' => true,
                'contact_person_edit' => true,
                'contact_person_delete' => true,
                'consignee_list' => true,
                'consignee_create' => true,
                'consignee_edit' => true,
                'consignee_delete' => true,
                'customer_attachment_list' => true,
                'customer_attachment_create' => true,
                'customer_attachment_edit' => true,
                'customer_attachment_delete' => true,
                'employee_list' => true,
                'employee_create' => true,
                'employee_edit' => true,
                'recruitment_list' => true,
                'recruitment_create' => true,
                'recruitment_edit' => true,
                'recruitment_delete' => true,
                'recruitment_attachment_list' => true,
                'recruitment_attachment_create' => true,
                'recruitment_attachment_edit' => true,
                'recruitment_attachment_delete' => true,
                'recruitment_candidate_list' => true,
                'recruitment_candidate_create' => true,
                'recruitment_candidate_edit' => true,
                'recruitment_candidate_delete' => true,
                'quotation_list' => true,
                'quotation_create' => true,
                'quotation_edit' => true,
                'quotation_delete' => true,
                'vendor_list' => true,
                'vendor_create' => true,
                'vendor_edit' => true,
                'vendor_contact_list' => true,
                'vendor_contact_create' => true,
                'vendor_contact_edit' => true,
                'vendor_contact_delete' => true,
                'vendor_attachment_list' => true,
                'vendor_attachment_create' => true,
                'vendor_attachment_edit' => true,
                'vendor_attachment_delete' => true,
                'product_list' => true,
                'product_create' => true,
                'product_edit' => true,
                'product_vendor_list' => true,
                'product_vendor_create' => true,
                'product_vendor_edit' => true,
                'product_vendor_delete' => true,
                'product_attachment_list' => true,
                'product_attachment_create' => true,
                'product_attachment_edit' => true,
                'product_attachment_delete' => true,
                'purchase_order_list' => true,
                'purchase_order_create' => true,
                'purchase_order_edit' => true,
                'procurement_list' => true,
                'procurement_create' => true,
                'procurement_edit' => true,
                'procurement_vendor_list' => true,
                'procurement_vendor_create' => true,
                'procurement_vendor_edit' => true,
                'procurement_vendor_delete' => true,
                'procurement_attachment_list' => true,
                'procurement_attachment_create' => true,
                'procurement_attachment_edit' => true,
                'procurement_attachment_delete' => true,
                'directory_list' => true,
                'directory_create' => true,
                'directory_edit' => true,
                'assets_list' => true,
                'assets_create' => true,
                'assets_edit' => true,
                'assets_delete' => true,
                'asset_type_list' => true,
                'asset_type_create' => true,
                'asset_type_edit' => true,
                'asset_type_delete' => true,
                'credentials_list' => true,
                'credentials_create' => true,
                'credentials_edit' => true,
                'credentials_delete' => true,
                'department_list' => true,
                'department_create' => true,
                'department_edit' => true,
                'department_delete' => true,
                'role_list' => true,
                'role_create' => true,
                'role_edit' => true,
                'role_delete' => true,
                'designation_list' => true,
                'designation_create' => true,
                'designation_edit' => true,
                'designation_delete' => true,
                'segment_list' => true,
                'segment_create' => true,
                'segment_edit' => true,
                'segment_delete' => true,
                'category_list' => true,
                'category_create' => true,
                'category_edit' => true,
                'category_delete' => true,
                'customer_type_list' => true,
                'customer_type_create' => true,
                'customer_type_edit' => true,
                'customer_type_delete' => true,
                'customer_base_list' => true,
                'customer_base_create' => true,
                'customer_base_edit' => true,
                'customer_base_delete' => true,
                'vendor_type_list' => true,
                'vendor_type_create' => true,
                'vendor_type_edit' => true,
                'vendor_type_delete' => true,
                'entity_type_list' => true,
                'entity_type_create' => true,
                'entity_type_edit' => true,
                'entity_type_delete' => true,
                'vendor_behavior_list' => true,
                'vendor_behavior_create' => true,
                'vendor_behavior_edit' => true,
                'vendor_behavior_delete' => true,
                'attachment_list' => true,
                'attachment_create' => true,
                'attachment_edit' => true,
                'attachment_delete' => true,
                'hsn_code_list' => true,
                'hsn_code_create' => true,
                'hsn_code_edit' => true,
                'hsn_code_delete' => true,
                'unit_of_measurement_list' => true,
                'unit_of_measurement_create' => true,
                'unit_of_measurement_edit' => true,
                'unit_of_measurement_delete' => true,
                'product_type_list' => true,
                'product_type_create' => true,
                'product_type_edit' => true,
                'product_type_delete' => true,
                'product_condition_list' => true,
                'product_condition_create' => true,
                'product_condition_edit' => true,
                'product_condition_delete' => true,
                'gst_percent_list' => true,
                'gst_percent_create' => true,
                'gst_percent_edit' => true,
                'gst_percent_delete' => true,
                'terms_and_conditions_list' => true,
                'terms_and_conditions_create' => true,
                'terms_and_conditions_edit' => true,
                'terms_and_conditions_delete' => true,
                'company_details_edit' => true,
                'currency_list' => true,
                'currency_create' => true,
                'currency_edit' => true,
                'currency_delete' => true,
                'bank_account_list' => true,
                'bank_account_create' => true,
                'bank_account_edit' => true,
                'bank_account_delete' => true,
                'inco_terms_list' => true,
                'inco_terms_create' => true,
                'inco_terms_edit' => true,
                'inco_terms_delete' => true,
                'ffd_list' => true,
                'ffd_create' => true,
                'ffd_edit' => true,
                'ffd_delete' => true,
                'ffd_contact_list' => true,
                'ffd_contact_create' => true,
                'ffd_contact_edit' => true,
                'ffd_contact_delete' => true,
                'irm_list' => true,
                'irm_create' => true,
                'irm_edit' => true,
                'irm_delete' => true,
                'invoice_list' => true,
                'invoice_create' => true,
                'invoice_edit' => true,
                'invoice_delete' => true,
                'compliance_list' => true,
                'compliance_create' => true,
                'compliance_edit' => true,
                'compliance_delete' => true,
                'examine_list' => true,
                'examine_create' => true,
                'examine_edit' => true,
                'examine_delete' => true,
                'regulatory_list' => true,
                'regulatory_create' => true,
                'regulatory_edit' => true,
                'regulatory_delete' => true,
                'ebrc_list' => true,
                'ebrc_create' => true,
                'ebrc_edit' => true,
                'ebrc_delete' => true,
                'business_task_list' => true,
                'business_task_create' => true,
                'business_task_edit' => true,
                'business_task_delete' => true,
                'business_task_team_list' => true,
                'business_task_team_create' => true,
                'business_task_team_edit' => true,
                'business_task_team_delete' => true,
                'kpi_list' => true,
                'kpi_create' => true,
                'kpi_edit' => true,
                'kpi_delete' => true,
                'location_detail_list' => true,
                'location_detail_create' => true,
                'location_detail_edit' => true,
                'location_detail_delete' => true,
                'bank_details_list' => true,
                'bank_details_create' => true,
                'bank_details_edit' => true,
                'bank_details_delete' => true,
                'business_task_view_list' => true,
                'business_task_view_create' => true,
                'business_task_view_edit' => true,
                'business_task_view_delete' => true,
                'business_task_edit_list' => true,
                'business_task_edit_create' => true,
                'business_task_edit_edit' => true,
                'business_task_edit_delete' => true,
                'stages_list' => true,
                'stages_create' => true,
                'stages_edit' => true,
                'stages_delete' => true,
                'warehouse_list' => true,
                'warehouse_create' => true,
                'warehouse_edit' => true,
                'warehouse_delete' => true,
            )
        );
    }
    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::dropIfExists('permissions');
    }
};
