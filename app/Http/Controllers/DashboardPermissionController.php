<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\DashboardPermission;

class DashboardPermissionController extends Controller
{
    /**
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function editDashboardPermission(Request $request)
    {
        $userId = $request->id;
        $row = DashboardPermission::select('cns', 'click_up', 'logistics', 'business_task', 'employee_database', 'assets_credentials', 'procurement', 'recruitment', 'bt_timeline', 'edoc_timeline', 'wms_reporting', 'wms_dashboard', 'itc_view', 'sb_knock_off', 'ffd_payment_view', 'vendor_payment_view')->where('user_id', '=', $userId)->first();
        return response()->json($row);
    }

    /**
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function updateDashboardPermission(Request $request)
    {
        $isExist = DashboardPermission::where('user_id', '=', $request->user_id)->first();
        if (!empty($isExist)) {
            $formArray = array(
                'cns' => $request->has('cns'),
                'click_up' => $request->has('click_up'),
                'logistics' => $request->has('logistics'),
                'business_task' => $request->has('business_task'),
                'employee_database' => $request->has('employee_database'),
                'assets_credentials' => $request->has('assets_credentials'),
                'procurement' => $request->has('procurement'),
                'recruitment' => $request->has('recruitment'),
                'bt_timeline' => $request->has('bt_timeline'),
                'edoc_timeline' => $request->has('edoc_timeline'),
                'wms_reporting' => $request->has('wms_reporting'),
                'wms_dashboard' => $request->has('wms_dashboard'),
                'itc_view' => $request->has('itc_view'),
                'sb_knock_off' => $request->has('sb_knock_off'),
                'ffd_payment_view' => $request->has('ffd_payment_view'),
                'vendor_payment_view' => $request->has('vendor_payment_view')
            );
            DashboardPermission::where("user_id", $request->user_id)->update($formArray);
        } else {
            $formArray = array(
                'cns' => $request->has('cns'),
                'click_up' => $request->has('click_up'),
                'logistics' => $request->has('logistics'),
                'business_task' => $request->has('business_task'),
                'employee_database' => $request->has('employee_database'),
                'assets_credentials' => $request->has('assets_credentials'),
                'procurement' => $request->has('procurement'),
                'recruitment' => $request->has('recruitment'),
                'bt_timeline' => $request->has('bt_timeline'),
                'edoc_timeline' => $request->has('edoc_timeline'),
                'wms_reporting' => $request->has('wms_reporting'),
                'wms_dashboard' => $request->has('wms_dashboard'),
                'itc_view'      => $request->has('itc_view'),
                'sb_knock_off'  => $request->has('sb_knock_off'),
                'ffd_payment_view' => $request->has('ffd_payment_view'),
                'vendor_payment_view' => $request->has('vendor_payment_view'),
                'user_id' => $request->user_id,
            );
            DashboardPermission::create($formArray);
        }
        return response()->json([ 'success' => true, 'message' => 'Dashboard permissions updated successfully' ],200);
    }
}
