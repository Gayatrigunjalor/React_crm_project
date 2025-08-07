<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\LeadPageIndex;

class LeadPageIndexController extends Controller
{
    public function save(Request $request)
    {
        $userId = auth()->id();
        $leadId = $request->input('lead_id');
        $pageIndex = $request->input('page_index');

        LeadPageIndex::updateOrCreate(
            ['user_id' => $userId, 'lead_id' => $leadId],
            ['page_index' => $pageIndex]
        );

        return response()->json(['success' => true]);
    }

    // public function get(Request $request)
    // {
    //     $userId = auth()->id();
    //     $leadId = $request->query('lead_id');

    //     $record = LeadPageIndex::where('user_id', $userId)->where('lead_id', $leadId)->first();
    //     return response()->json(['page_index' => $record ? $record->page_index : 0]);
    // }
    public function get(Request $request)
{
    $leadId = $request->query('lead_id');

    // Get the maximum page_index for the given lead_id
    $maxPageIndex = LeadPageIndex::where('lead_id', $leadId)->max('page_index');

    return response()->json(['page_index' => $maxPageIndex ?? 0]);
}

} 