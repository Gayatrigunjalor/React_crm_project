<?php

use Illuminate\Support\Facades\DB;
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
        Schema::create('employees', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('user_id')->unique();
            $table->foreign('user_id')->references('id')->on('users')->onDelete('cascade');
            $table->string('name', 100);
            $table->string('emp_id');
            $table->unsignedBigInteger('department_id');
            $table->foreign('department_id')->references('id')->on('departments');
            $table->date('date_of_birth')->nullable();
            $table->unsignedBigInteger('is_under_id')->nullable();
            $table->string('address')->nullable();
            $table->unsignedBigInteger('role_id');
            $table->foreign('role_id')->references('id')->on('roles');
            $table->unsignedBigInteger('designation_id');
            $table->foreign('designation_id')->references('id')->on('designations');
            $table->string('city', 50)->nullable();
            $table->string('pin_code', 20)->nullable();
            $table->string('mobile_number', 20)->nullable();
            $table->string('official_mobile_number', 20)->nullable();
            $table->string('emergency_mobile_number', 20)->nullable();
            $table->string('email')->nullable();
            $table->string('gender', 10)->nullable();
            $table->string('blood_group', 10)->nullable();
            $table->string('photograph', 2048)->nullable();
            $table->string('salary', 50)->nullable();
            $table->string('security_deposit', 50)->nullable();
            $table->date('joining_date')->nullable();
            $table->date('anniversary_date')->nullable();
            $table->string('status', 100)->nullable();
            $table->string('file_no', 50)->nullable();
            $table->string('biometric_no', 50)->unique()->nullable();
            $table->text('is_under_user_ids')->nullable();
            $table->boolean('is_click_up_on')->default(1);
            $table->integer('checker_id')->nullable();
            $table->unsignedBigInteger('created_by')->nullable();
            $table->unsignedBigInteger('rejected_by')->nullable();
            $table->boolean('rejected')->nullable();
            $table->boolean('approved')->nullable();
            $table->timestamps();
        });

        DB::table('employees')->insert(
            array(
                [
                    'id' => 1,
                    'user_id' => 1,
                    'name' => 'Admin',
                    'emp_id' => 'EMP000',
                    'department_id' => 1,
                    'role_id' => 1,
                    'designation_id' => 1
                ]
            )
        );
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::dropIfExists('employees');
    }
};
