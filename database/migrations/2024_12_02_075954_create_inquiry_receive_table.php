<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateInquiryReceiveTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('inquiry_receives', function (Blueprint $table) {
            $table->id(); // Auto-incrementing primary key
            $table->foreignId('customer_id')->constrained()->onDelete('cascade'); // Foreign key for customer
            $table->foreignId('lead_id')->constrained()->onDelete('cascade'); // Foreign key for lead
            $table->string('status')->nullable(); // Status of the inquiry
            $table->string('product')->nullable(); // Product name
            $table->string('model')->nullable(); // Model
            $table->string('make')->nullable(); // Make of the product
            $table->integer('quantity')->nullable(); // Quantity
            $table->decimal('target_price', 10, 2)->nullable(); // Target price for the product
            $table->text('buying_plan')->nullable(); // Buying plan
            $table->string('purchase_decision_maker')->nullable(); // Purchase decision maker
            $table->text('customer_specific_need')->nullable(); // Customer's specific needs
            $table->string('inorbvict_commitment')->nullable(); // Inorbvict commitment
            $table->string('attachment')->nullable(); // Attachment file path
            $table->text('message')->nullable(); // Message or comments
            $table->timestamps(); // Created at and updated at timestamps
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::dropIfExists('inquiry_receives');
    }
}
