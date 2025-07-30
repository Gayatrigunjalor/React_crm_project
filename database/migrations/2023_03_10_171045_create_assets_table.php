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
        Schema::create('assets', function (Blueprint $table) {
            $table->id();
            $table->string('asset_id');
            $table->string('asset_name', 255);
            $table->text('asset_desc')->nullable();
            $table->unsignedBigInteger('asset_type_id')->nullable();
            $table->foreign('asset_type_id')->references('id')->on('asset_type');
            $table->date('purchase_date')->nullable();
            $table->date('warranty_exp_date')->nullable();
            $table->integer('vendor_id');
            $table->string('warranty_card')->nullable();
            $table->string('invoice')->nullable();
            $table->string('assigned_to_emp')->nullable();
            $table->string('assigned_date')->nullable();
            $table->unsignedBigInteger('created_by')->nullable();
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
        Schema::dropIfExists('assets');
    }
};
