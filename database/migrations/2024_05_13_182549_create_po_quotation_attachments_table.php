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
        Schema::create('po_quotation_attachments', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('po_id');
            $table->string('name');
            $table->string('attachment_type')->nullable();
            $table->string('attachment_details')->nullable();
            $table->integer('created_by')->nullable();
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
        Schema::dropIfExists('po_quotation_attachments_tanle');
    }
};
