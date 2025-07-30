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
        Schema::create('products', function (Blueprint $table) {
            $table->id();
            $table->string('product_code');
            $table->string('segment_id');
            $table->string('category_id');
            $table->string('employee_name');
            $table->string('model_name');
            $table->string('product_name');
            $table->string('make');
            $table->string('functional_name');
            $table->string('hsn_code_id');
            $table->longText('printable_description');
            $table->string('unit_of_measurement_id');
            $table->string('pack_size')->nullable();
            $table->string('box_size')->nullable();
            $table->string('product_type_id')->nullable();
            $table->string('product_condition_id')->nullable();
            $table->text('confidential_info')->nullable();
            $table->string('optional_accessories')->nullable();
            $table->string('expiry')->nullable();
            $table->string('year_of_manufacturing')->nullable();
            $table->integer('product_base_price');
            $table->string('gst_percent_id');
            $table->string('selling_cost');
            $table->string('lbh')->nullable();
            $table->string('volume_weight')->nullable();
            $table->string('bottom_price')->nullable();
            $table->integer('checker_id')->nullable();
            $table->unsignedBigInteger('created_by')->nullable();
            $table->unsignedBigInteger('rejected_by')->nullable();
            $table->boolean('rejected')->nullable();
            $table->boolean('approved')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::dropIfExists('products');
    }
};
