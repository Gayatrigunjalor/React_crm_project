<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateOpportunityAttachmentsTable extends Migration
{
    public function up()
    {
        Schema::create('opportunity_attachments', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('opportunity_id');
            $table->string('file_path');
            $table->timestamps();

            $table->foreign('opportunity_id')->references('id')->on('opportunity_details')->onDelete('cascade');
        });
    }

    public function down()
    {
        Schema::dropIfExists('opportunity_attachments');
    }
}
