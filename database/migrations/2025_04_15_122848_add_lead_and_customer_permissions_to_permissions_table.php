<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::table('permissions', function (Blueprint $table) {
            // Customer View Permissions
            $table->boolean('customer_view_list')->nullable()->default(0)->after('warehouse_delete');
            $table->boolean('customer_view_create')->nullable()->default(0)->after('customer_view_list');
            $table->boolean('customer_view_edit')->nullable()->default(0)->after('customer_view_create');
            $table->boolean('customer_view_delete')->nullable()->default(0)->after('customer_view_edit');

            // Assignee Lead Permissions
            $table->boolean('assignee_lead_list')->nullable()->default(0)->after('customer_view_delete');
            $table->boolean('assignee_lead_create')->nullable()->default(0)->after('assignee_lead_list');
            $table->boolean('assignee_lead_edit')->nullable()->default(0)->after('assignee_lead_create');
            $table->boolean('assignee_lead_delete')->nullable()->default(0)->after('assignee_lead_edit');

            // Assign Lead Permissions
            $table->boolean('assign_lead_list')->nullable()->default(0)->after('assignee_lead_delete');
            $table->boolean('assign_lead_create')->nullable()->default(0)->after('assign_lead_list');
            $table->boolean('assign_lead_edit')->nullable()->default(0)->after('assign_lead_create');
            $table->boolean('assign_lead_delete')->nullable()->default(0)->after('assign_lead_edit');

            // Lead Source Permissions
            $table->boolean('lead_source_list')->nullable()->default(0)->after('assign_lead_delete');
            $table->boolean('lead_source_create')->nullable()->default(0)->after('lead_source_list');
            $table->boolean('lead_source_edit')->nullable()->default(0)->after('lead_source_create');
            $table->boolean('lead_source_delete')->nullable()->default(0)->after('lead_source_edit');
        });

        // Insert default permission set for user_id 1
      
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::table('permissions', function (Blueprint $table) {
            $table->dropColumn([
                'customer_view_list', 'customer_view_create', 'customer_view_edit', 'customer_view_delete',
                'assignee_lead_list', 'assignee_lead_create', 'assignee_lead_edit', 'assignee_lead_delete',
                'assign_lead_list', 'assign_lead_create', 'assign_lead_edit', 'assign_lead_delete',
                'lead_source_list', 'lead_source_create', 'lead_source_edit', 'lead_source_delete'
            ]);
        });
    }
};
