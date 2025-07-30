<?php

namespace App\Services;

use App\Models\BusinessTask;
use App\Models\Category;
use App\Models\Customer;
use App\Models\Segment;
use Illuminate\Http\Request;

class SegmentService
{
    public function listSegment()
    {
        $rows = Segment::select('id','name')->orderBy('id', 'desc')->get();
        return response()->json($rows, 200);
    }

    public function createSegment(Request $request)
    {
        if (Segment::create(['name' => $request->name])) {
            return response()->json(['success' => true, 'message' => 'Segment saved successfully'], 200);
        } else {
            return response()->json(['success' => false, 'message' => 'Something went wrong'], 422);
        }
    }

    public function editSegment($id)
    {
        return response()->json(Segment::select('id', 'name')->find($id));
    }

    public function deleteSegment($id)
    {
        $customerBaseCount = Customer::where('segment_id', $id)->count();
        $CategoryBaseCount = Category::where('segment_id', $id)->count();
        $bTCount = BusinessTask::where('segment_id', $id)->count();

        $message = '';
        $message = 'Segment cannot be removed as it is used in ';

        if($customerBaseCount > 0 || $CategoryBaseCount > 0 || $bTCount > 0) {
            if($customerBaseCount > 0) {
                $message .= ' | Customer | ';
            }
            if($CategoryBaseCount > 0) {
                $message .= ' | Category | ';
            }
            if($bTCount > 0) {
                $message .= ' | Business Task | ';
            }
            return response()->json(['success' => false, 'message' => $message. ' record(s)'], 422);
        } else {
            if (Segment::find($id)->delete()) {
                return response()->json(['success' => true, 'message' => 'Segment deleted successfully'], 200);
            } else {
                return response()->json(['success' => false, 'message' => 'Something went wrong'], 422);
            }
        }
    }
}
