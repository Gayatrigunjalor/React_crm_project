<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('invoices', function (Blueprint $table) {
            $table->id();
            $table->string('invoice_number', 100);
            $table->date('invoice_date');
            $table->string('buyer_id')->nullable();
            $table->foreignId('bank_id');
            $table->string('consignee_ids')->nullable();
            $table->string('currency', 10);
            $table->float('exchange_rate', 14, 2)->nullable();
            $table->string('port_of_loading', 100)->nullable();
            $table->string('port_of_discharge', 100)->nullable();
            $table->string('final_destination', 100)->nullable();
            $table->string('origin_country', 50)->nullable();
            $table->foreignId('inco_term_id')->nullable();
            $table->float('total_net_weight', 14, 2)->nullable();
            $table->float('total_gross_weight', 14, 2)->nullable();
            $table->float('grand_total', 14, 2);
            $table->string('invoice_product_ids')->nullable();
            $table->string('invoice_weight_ids')->nullable();
            $table->string('invoice_irm_ids')->nullable();
            $table->string('po_number', 100)->nullable();
            $table->date('po_date')->nullable();
            $table->string('sli_number', 100)->nullable();
            $table->string('dc_number', 100)->nullable();
            $table->float('remmittance_value', 14, 2);
            $table->float('received_amount', 14, 2)->nullable();
            $table->string('shipment_type', 10);
            $table->float('total_value_weight', 14, 2);
            $table->float('freight_weight', 14, 2)->nullable();
            $table->string('pre_carriage_by', 100)->nullable();
            $table->string('placereceiptprecarrier', 100)->nullable();
            $table->text('payment_terms');
            $table->string('vessel_no', 20)->nullable();
            $table->string('no_of_packages', 20);
            $table->unsignedBigInteger('international_ffd_id');
            $table->foreign('international_ffd_id')->references('id')->on('ffds');
            $table->string('lut_export_under_bond', 5);
            $table->string('exportpaymentofigst', 30);
            $table->string('nature_of_payment', 30)->nullable();
            $table->string('exw_value', 20);
            $table->unsignedBigInteger('domestic_ffd_id');
            $table->foreign('domestic_ffd_id')->references('id')->on('ffds');
            $table->float('insurance', 14, 2)->nullable();
            $table->float('commission', 14, 2)->nullable();
            $table->float('discount', 14, 2)->nullable();
            $table->string('free_trade_sample', 5);
            $table->string('eou_shipping_bill', 5);
            $table->string('duty_drawback', 5);
            $table->string('epcg_shipping_bill', 5);
            $table->string('licenceshippingbill', 5);
            $table->string('rebate_of_state_levies', 5);
            $table->string('repair_and_return', 5);
            $table->string('advance_authorization', 5);
            $table->string('drwaback_or_rosctl', 5);
            $table->string('epcg', 5);
            $table->string('nfei', 5);
            $table->string('jobbing', 5);
            $table->string('re_export', 5);
            $table->string('drawback_epcg', 5);
            $table->string('eou', 5);
            $table->string('mesi', 5);
            $table->string('dbk_sl_no')->nullable();
            $table->string('regnnoanddtofepcglic')->nullable();
            $table->string('regnnodtepcglicregcopy')->nullable();
            $table->string('noadditionaldocrequire')->nullable();
            $table->string('orginable')->nullable();
            $table->string('invoice_copies');
            $table->string('packing_list_copies');
            $table->string('non_dg_declaration');
            $table->string('lab_analysis_report');
            $table->string('msds');
            $table->string('phytosanitary_cert');
            $table->string('visa_aepc_endorsement');
            $table->string('letter_to_dc');
            $table->string('nature_of_transaction');
            $table->string('gspcertificateoforigin');
            $table->string('bank_certificate');
            $table->string('annexure_a');
            $table->string('invitemnumberregno')->nullable();
            $table->string('invitemnumberregnodate')->nullable();
            $table->string('authorization_epcg')->nullable();
            $table->string('method_of_valuation');
            $table->string('buyer_saller_related');
            $table->string('buyersallerprice');
            $table->string('tracking_or_awb_number')->nullable();
            $table->string('ein_no')->nullable();
            $table->string('under_lut');
            $table->string('special_instuction');
            $table->string('preferentialagreement')->nullable();
            $table->string('standardunitdetails')->nullable();
            $table->string('state_of_origin_item')->nullable();
            $table->string('districtoforiginitem')->nullable();
            $table->string('exporter_type');
            $table->string('evd')->nullable();
            $table->string('advathoepcddtlregno')->nullable();
            $table->string('pickupreferencenumber')->nullable();
            $table->string('sdf_fema_declaration');
            $table->string('any_other', 5);
            $table->longText('remarks')->nullable();
            $table->string('ad_code');
            $table->string('all_symbol')->nullable();
            $table->string('volum_range', 10);
            $table->string('duty_free_commercial');
            $table->string('non_drawback');
            $table->boolean('logistics_id')->default(0);
            $table->boolean('regulatory_id')->default(0);
            $table->boolean('ebrc_id')->default(0);
            $table->string('business_task_id');
            $table->unsignedBigInteger('examine_id')->nullable();
            $table->integer('checker_id')->nullable();
            $table->unsignedBigInteger('created_by')->nullable();
            $table->unsignedBigInteger('rejected_by')->nullable();
            $table->boolean('rejected')->nullable();
            $table->boolean('approved')->nullable();
            $table->longText('extratermsconditions')->nullable();
            $table->string('allSymbol')->nullable();
            $table->boolean('outward_id')->default(0);
            $table->boolean('psd_id')->default(0);
            $table->unsignedBigInteger('company_id')->default(1);
            $table->foreign('company_id')->references('id')->on('companies')->onDelete('cascade');
            $table->timestamps();
            $table->softDeletes();
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::dropIfExists('invoices');
    }
};
