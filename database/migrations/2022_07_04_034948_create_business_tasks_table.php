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
        Schema::create('business_tasks', function (Blueprint $table) {
            $table->id();
            $table->date('date');
            $table->string('customer_name')->nullable();
            $table->integer('segment');
            $table->integer('category');
            $table->text('enquiry')->nullable();
            $table->string('task_status')->nullable();
            $table->string('lead_stage')->nullable();
            $table->string('sde_team');
            $table->string('client_email', 100)->nullable();
            $table->string('enquiry_date_time', 100)->nullable();
            $table->string('client_company', 100)->nullable();
            $table->string('mob')->nullable();
            $table->longText('enq_msg')->nullable();
            $table->string('enq_address')->nullable();
            $table->string('enq_city', 100)->nullable();
            $table->string('enq_state', 100)->nullable();
            $table->string('product_name')->nullable();
            $table->string('country', 100)->nullable();
            $table->string('alt_email', 100)->nullable();
            $table->string('alt_mobile', 25)->nullable();
            $table->string('phone', 25)->nullable();
            $table->string('alt_phone', 25)->nullable();
            $table->string('member_since', 15)->nullable();
            $table->string('customerfeedbackform', 10)->nullable();
            $table->string('customer_type', 100)->nullable();
            $table->string('priority', 10)->nullable();
            $table->string('stock_position', 100)->nullable();
            $table->longText('inorbvict_commitment')->nullable();
            $table->string('shipping_liabelity', 10)->nullable();
            $table->string('dimension_of_boxes', 100)->nullable();
            $table->string('volume_weight', 100)->nullable();
            $table->string('gross_wt', 100)->nullable();
            $table->string('cold_chain', 10)->nullable();
            $table->unsignedBigInteger('inco_term_id')->nullable();
            $table->string('port_of_unloading')->nullable();
            $table->string('transportation', 15)->nullable();
            $table->string('final_destination', 100)->nullable();
            $table->string('destination_code', 100)->nullable();
            $table->string('shipment_mode')->nullable();
            $table->string('comments')->nullable();
            $table->date('sourcing_due_date')->nullable();
            $table->string('sourcing_status', 20)->nullable();
            $table->string('overdue')->nullable();
            $table->string('set_reminder')->nullable();
            $table->string('freight_target_cost', 100)->nullable();
            $table->string('net_weight', 100)->nullable();
            $table->unsignedBigInteger('invoice_id')->nullable();
            $table->unsignedBigInteger('company_id')->default(1);
            $table->foreign('company_id')->references('id')->on('companies')->onDelete('cascade');
            $table->foreignId('created_by');
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
        Schema::dropIfExists('business_tasks');
    }
};
