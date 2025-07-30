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
        Schema::create('directories', function (Blueprint $table) {
            $table->id();
            $table->string('company_name');
            $table->string('services');
            $table->string('address');
            $table->string('brand_name');
            $table->string('company_email', 100);
            $table->string('website', 100)->nullable();
            $table->string('current_status', 30);
            $table->string('business_card')->nullable();
            $table->string('any_disputes')->nullable();;
            $table->string('contact_person');
            $table->string('designation');
            $table->string('contact_number', 20);
            $table->string('email');
            $table->string('alternate_contact_number', 20)->nullable();
            $table->string('collaboration_interest')->nullable();
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
        Schema::dropIfExists('directories');
    }
};
