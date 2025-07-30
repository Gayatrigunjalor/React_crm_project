<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class DashboardPermission extends Model
{
    use HasFactory;

    protected $fillable = [
        'cns', 'click_up', 'logistics', 'business_task', 'employee_database', 'assets_credentials', 'procurement', 'recruitment', 'user_id', 'bt_timeline', 'edoc_timeline', 'wms_reporting', 'wms_dashboard', 'roles_responsibility'
    ];
}
