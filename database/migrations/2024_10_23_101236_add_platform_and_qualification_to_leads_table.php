<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class AddPlatformAndQualificationToLeadsTable extends Migration
{
    public function up()
    {
        Schema::table('leads', function (Blueprint $table) {
            $table->string('platform')->nullable(); // platform like Indiamart, TradeIndia
            $table->boolean('qualified')->default(false); // true if country is in the qualified list
            $table->boolean('disqualified')->default(false); // true if country is in the disqualified list
        });
    }

    public function down()
    {
        Schema::table('leads', function (Blueprint $table) {
            $table->dropColumn(['platform', 'qualified', 'disqualified']);
        });
    }
}
