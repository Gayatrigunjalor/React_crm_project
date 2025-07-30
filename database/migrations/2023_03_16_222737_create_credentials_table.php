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
        Schema::create('credentials', function (Blueprint $table) {
            $table->id();
            $table->string('cred_id',20);
            $table->text('website_name');
            $table->text('website_fxn')->nullable();
            $table->string('username',100)->nullable();
            $table->string('email_regd',150)->nullable();
            $table->string('phone_regd',20)->nullable();
            $table->string('mfa_by',50)->nullable();
            $table->string('subscription_type',100);
            $table->date('purchase_date')->nullable();
            $table->date('renew_date')->nullable();
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
        Schema::dropIfExists('credentials');
    }
};
