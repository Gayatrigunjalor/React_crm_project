<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateLeadAcknowledgmentsTable extends Migration
{
    public function up()
    {
        Schema::create('lead_acknowledgments', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('customer_id');
            $table->unsignedBigInteger('lead_id');
            $table->string('qualified')->nullable();
            $table->string('disqualified')->nullable();
            $table->string('clarity_pending')->nullable();
            $table->string('status')->nullable();
            $table->timestamps();

            // Foreign key constraints
            $table->foreign('customer_id')->references('id')->on('customers')->onDelete('cascade');
            $table->foreign('lead_id')->references('id')->on('leads')->onDelete('cascade');
        });
    }

    public function down()
    {
        Schema::dropIfExists('lead_acknowledgments');
    }
}
