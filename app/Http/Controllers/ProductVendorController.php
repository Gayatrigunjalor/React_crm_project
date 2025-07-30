<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Models\Vendor;
use App\Models\Product;
use Illuminate\Http\Request;
use App\Models\ProductVendor;
use Illuminate\Support\Facades\Auth;
use App\Notifications\CheckerNotification;
use Illuminate\Support\Facades\Notification;

class ProductVendorController extends Controller
{
    /**
     * @param  \Illuminate\Http\Request  $request
     * @return void
     */
    public function index($id)
    {
        $this->authorize('product_vendor_list');
        $product = Product::select('id','product_code','product_name','gst_percent_id')->with(['gstPercent:id,percent'])->find($id);
        if(!empty($product)){
            $rows = ProductVendor::with(['vendor_name:id,name','gstPercent:id,percent'])->where('product_id', $product->product_code)->get();
            if ($rows->count() > 0) {
                return response()->json([
                    'product' => $product,
                    'vendors' => $rows
                ],200);
            } else {
                return response()->json([
                    'product' => $product,
                    'vendors' => []
                ],200);
            }
        }
    }

    /**
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function store(Request $request)
    {
        $this->authorize('product_vendor_create');

        $this->validate($request, [
            'vendor_id' => 'required|integer',
            'purchase_price' => 'required',
            'product_id' => 'required|string',
            'gst' => 'required',
            'gst_amount' => 'required',
            'total_amount' => 'required',
            'shipping_charges' => 'required|numeric',
            'packaging_charges' => 'required|numeric',
            'other_charges' => 'required'
        ]);

        $formArray = $request->all();
        $formArray['created_by'] = Auth::id();

        $form_id = ProductVendor::create($formArray);
        if (Auth::user()->user_role == 0) {
            ProductVendor::find($form_id->id)->update(array('approved' => true));
        } else {
            // $checker = Auth::user();
            // $checkerData = [
            //     'subject' => 'New Product Vendor Created',
            //     'body' => 'New Product Vendor Is Created by ' . $checker->employeeDetail->name . ' Please Check It',
            //     'url' => '/productVendorChecker',
            //     'form_id' => $form_id->id
            // ];
            // if ($checker->checkers->product_vendor_c1 != null) {
            //     $userSchema = User::find($checker->checkers->product_vendor_c1);
            //     ProductVendor::find($form_id->id)->update(array('checker_id' => 1));
            //     Notification::send($userSchema, new CheckerNotification($checkerData));
            // } elseif ($checker->checkers->product_vendor_admin_approve == 1) {
            //     $userSchema = User::find(1);
            //     ProductVendor::find($form_id->id)->update(array('checker_id' => 0));
            //     Notification::send($userSchema, new CheckerNotification($checkerData));
            // } else {
                $data = array(
                    'approved' => true
                );
                ProductVendor::find($form_id->id)->update($data);
            // }
        }
        return response()->json(['success' => true, 'message' => 'Product vendor saved successfully'], 200);
    }

    /**
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function destroy($id)
    {
        $this->authorize('product_vendor_delete');
        ProductVendor::where("id", $id)->delete();
        return response()->json([
            'status' => 200,
        ]);
    }

    /**
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function show($id)
    {
        $this->authorize('product_vendor_edit');
        $productVendor = ProductVendor::with('vendor_name:id,name')->find($id);
        if($productVendor) {
            return response()->json($productVendor);
        } else {
            return response()->json(['success' => false, 'message' => 'Unable to find Product Vendor'], 422);
        }
    }

    /**
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function update(Request $request, $id)
    {
        $this->authorize('product_vendor_edit');
        $this->validate($request, [
            'vendor_id' => 'required|integer',
            'purchase_price' => 'required',
            'product_id' => 'required|string',
            'gst' => 'required',
            'gst_amount' => 'required',
            'total_amount' => 'required',
            'shipping_charges' => 'required|numeric',
            'packaging_charges' => 'required|numeric',
            'other_charges' => 'required'
        ]);
        if(ProductVendor::find($id)->update($request->all())){
            return response()->json(['success' => true, 'message' => 'Product vendor updated successfully'], 200);
        } else {
            return response()->json(['success' => false, 'message' => 'Something went wrong'], 422);
        }
    }

    /**
     * @param  \Illuminate\Http\Request  $request
     * @param \App\Services\CategoryService $categoryService
     * @return \Illuminate\Http\JsonResponse|void
     */
    public function getProductsByVendor(Request $request)
    {
        $vendorDetails = ProductVendor::where('vendor_id', $request->vendor_id)->pluck('product_id');
        if($vendorDetails->count() > 0){
            $products = Product::select('id','product_code','product_name')->whereIn('product_code', $vendorDetails)->get();
            if ($products->count() > 0) {
                return response()->json($products,200);
            }
        }
        return response()->json(['success' => false, 'message' => 'No products found for selected supplier'], 422);
    }
}
