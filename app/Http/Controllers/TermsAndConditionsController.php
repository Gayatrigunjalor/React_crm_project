<?php

namespace App\Http\Controllers;

use App\Http\Requests\TermsAndConditionsRequest;
use App\Models\TermsAndConditions;
use Illuminate\Http\Request;

class TermsAndConditionsController extends Controller
{
    /**
     * @return \Illuminate\Contracts\View\View|\Illuminate\Contracts\View\Factory
     */
    public function index()
    {
        $this->authorize('terms_and_conditions_list');
        $rows = TermsAndConditions::orderBy('id', 'desc')->get();
        return response()->json($rows, 200);
    }

    /**
     * @param \App\Http\Requests\TermsAndConditionsRequest $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function store(TermsAndConditionsRequest $request)
    {
        $this->authorize('terms_and_conditions_create');
        if (TermsAndConditions::create([ 'order' => $request->order, 'terms_and_conditions' => $request->terms_and_conditions ])) {
            return response()->json(['success' => true, 'message' => 'Terms and Conditions added successfully'], 200);
        } else {
            return response()->json(['success' => false, 'message' => 'Something went wrong'], 422);
        }
    }

    /**
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function show($id)
    {
        $this->authorize('terms_and_conditions_edit');
        $tc = TermsAndConditions::find($id);
        return response()->json($tc, 200);
    }

    /**
     * @param \App\Http\Requests\TermsAndConditionsRequest $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function update(TermsAndConditionsRequest $request, $id)
    {
        $this->authorize('terms_and_conditions_edit');
        $this->validate($request, [
            'order' => 'required|string',
            'terms_and_conditions' => 'required|string'
        ], [
            'order.required' => 'Order field is required to determine document',
            'order.string' => 'Order must be string',
            'terms_and_conditions.required' => 'T&C is required and must be string'
        ]);
        if (TermsAndConditions::find($id)->update([ 'order' => $request->order, 'terms_and_conditions' => $request->terms_and_conditions ])) {
            return response()->json(['success' => true, 'message' => 'Terms and Conditions updated successfully'], 200);
        } else {
            return response()->json(['success' => false, 'message' => 'Something went wrong'], 422);
        }
    }

    /**
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function destroy($id)
    {
        $this->authorize('terms_and_conditions_delete');
        if (TermsAndConditions::find($id)->delete()) {
            return response()->json(['success' => true, 'message' => 'Terms and Conditions deleted successfully'], 200);
        } else {
            return response()->json(['success' => false, 'message' => 'Something went wrong'], 422);
        }
    }
}
