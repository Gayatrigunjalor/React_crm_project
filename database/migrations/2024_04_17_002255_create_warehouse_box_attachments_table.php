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
        Schema::create('warehouse_box_attachments', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('warehouse_box_id');
            $table->string('name');
            $table->string('attachment_type')->nullable();
            $table->string('attachment_details')->nullable();
            $table->integer('created_by')->nullable();
            $table->timestamps();
            $table->softDeletes();

            $table->foreign('warehouse_box_id')->references('id')->on('warehouse_box_details')->onDelete('cascade');
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::dropIfExists('warehouse_box_attachments');
    }
};
