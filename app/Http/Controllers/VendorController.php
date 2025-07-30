<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Models\Vendor;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use App\Notifications\CheckerNotification;
use Illuminate\Support\Facades\Notification;

class VendorController extends Controller
{
    /**
     * @return \Illuminate\Contracts\View\View|\Illuminate\Contracts\View\Factory
     */
    public function index()
    {
        $this->authorize('vendor_list');
        $rows = Vendor::orderBy('id', 'desc')->get();
        return response()->json($rows, 200);
    }

    /**
     * @return \Illuminate\Contracts\View\View|\Illuminate\Contracts\View\Factory
     */
    public function vendorsList($sort=null)
    {
        $sort = 'desc';
        if($sort == 'asc'){
            $sort = 'asc';
        }
        $rows = Vendor::select('id','name')->where('approved', '=', '1')->orderBy('id', $sort)->get();
        return response()->json($rows, 200);
    }

    /**
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function store(Request $request)
    {
        $this->authorize('vendor_create');
        $this->validate($request,[
            'name' => 'required|max:100',
            'vender_type_id' => 'required',
            'employee_name' => 'required',
            'entity_type_id' => 'required',
            'segment_id' => 'required',
            'address' => 'required',
            'phone' => 'required',
            'vendor_behavior_id' => 'required',
            'contact_person' => 'required',
            'contact_person_number' => 'required',
            'designation' => 'required',
            'email' => 'required|email'
        ]);

        $form_id = Vendor::create([
            'name'                   => $request->name,
            'vender_type_id'         => $request->vender_type_id,
            'employee_name'          => $request->employee_name,
            'entity_type_id'         => $request->entity_type_id,
            'segment_id'             => $request->segment_id,
            'address'                => $request->address,
            'phone'                  => $request->phone,
            'vendor_behavior_id'     => $request->vendor_behavior_id,
            'contact_person'         => $request->contact_person,
            'contact_person_number'  => $request->contact_person_number,
            'designation'            => $request->designation,
            'email'                  => $request->email,
            'country_id'             => $request->country_id,
            'state_id'               => $request->state_id,
            'city'                   => $request->city,
            'pin_code'               => $request->pin_code,
            'website'                => $request->website,
            'rating'                 => $request->rating,
            'collaboration_interest' => $request->collaboration_interest,
            'created_by'             => Auth::id(),
            'approved'               => true
        ]);
        // if (Auth::user()->user_role != 0) {
        //     $checker = User::find(Auth::id());
        //     $checkerData = [
        //         'subject' => 'New Vendor Created',
        //         'body' => 'New Vendor Is Created by ' . $checker->employeeDetail->name . ' Please Check It',
        //         'url' => '/vendorChecker',
        //         'form_id' => $form_id->id
        //     ];
        //     if ($checker->checkers->vendor_c1 != null) {
        //         $userSchema = User::find($checker->checkers->vendor_c1);
        //         $checkerId = array(
        //             'checker_id' => 1
        //         );
        //         Vendor::find($form_id->id)->update($checkerId);
        //         Notification::send($userSchema, new CheckerNotification($checkerData));
        //     } elseif ($checker->checkers->vendor_admin_approve == 1) {
        //         $userSchema = User::find(1);
        //         $checkerId = array(
        //             'checker_id' => 0
        //         );
        //         Vendor::find($form_id->id)->update($checkerId);
        //         Notification::send($userSchema, new CheckerNotification($checkerData));
        //     } else {
        //         Vendor::find($form_id->id)->update(array('approved' => true));
        //     }
        // }
        return response()->json(['success' => true, 'message' => 'Vendor saved successfully'], 200);
    }

    /**
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function show($id)
    {
        $this->authorize('vendor_list');
        $vendor = Vendor::find($id);
        if($vendor) {
            return response()->json($vendor);
        } else {
            return response()->json(['success' => false, 'message' => 'Unable to find vendor'], 422);
        }
    }

    /**
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function update(Request $request, $id)
    {
        $this->authorize('vendor_edit');
        $this->validate($request,[
            'name' => 'required|max:100',
            'vender_type_id' => 'required',
            'entity_type_id' => 'required',
            'segment_id' => 'required',
            'address' => 'required',
            'phone' => 'required',
            'vendor_behavior_id' => 'required',
            'contact_person' => 'required',
            'contact_person_number' => 'required',
            'designation' => 'required',
            'email' => 'required|email'
        ]);
        if (Vendor::find($id)->update([
            'name' => $request->name,
            'vender_type_id'         => $request->vender_type_id,
            'entity_type_id'         => $request->entity_type_id,
            'segment_id'             => $request->segment_id,
            'address'                => $request->address,
            'phone'                  => $request->phone,
            'vendor_behavior_id'     => $request->vendor_behavior_id,
            'contact_person'         => $request->contact_person,
            'contact_person_number'  => $request->contact_person_number,
            'designation'            => $request->designation,
            'email'                  => $request->email,
            'country_id'             => $request->country_id,
            'state_id'               => $request->state_id,
            'city'                   => $request->city,
            'pin_code'               => $request->pin_code,
            'website'                => $request->website,
            'rating'                 => $request->rating,
            'collaboration_interest' => $request->collaboration_interest
        ]))
        {
            return response()->json(['success' => true, 'message' => 'Vendor updated successfully'], 200);
        } else {
            return response()->json(['success' => false, 'message' => 'Something went wrong'], 422);
        }
    }

    /**
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\JsonResponse|void
     */
    public function destroy($id)
    {
        $this->authorize('vendor_type_delete');
        // $vendorCount = Vendor::where('vender_type_id', $id)->count();
        // if($vendorCount > 0) {
        //     return response()->json(['success' => false, 'message' => 'Vendor type cannot be removed as it is used in Vendor\'s record.'], 422);
        // } else {
            if (Vendor::find($id)->delete()) {
                return response()->json(['success' => true, 'message' => 'Vendor deleted successfully'], 200);
            } else {
                return response()->json(['success' => false, 'message' => 'Something went wrong'], 422);
            }
        // }
    }

}
