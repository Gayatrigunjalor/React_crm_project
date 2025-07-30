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
        Schema::create('warehouse_attachments', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('inward_id');
            $table->string('name');
            $table->string('attachment_type')->nullable();
            $table->string('attachment_details')->nullable();
            $table->integer('created_by')->nullable();
            $table->timestamps();
            $table->softDeletes();

            $table->foreign('inward_id')->references('id')->on('warehouse')->onDelete('cascade');
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::dropIfExists('warehouse_attachments');
    }
};
