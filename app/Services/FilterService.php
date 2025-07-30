<?php

namespace App\Services;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class FilterService
{
    public function dueDateFilter(Request $request, $row, $filter)
    {
        if ($request->due_date_single_filter == 'Today') {
            return $filter->where('stage_id', '=', $row->id)->where('created_by', '=', $request->id)->where('due_date', '=', date("Y-m-d"))->orderBy('id', 'DESC');
        }
        if ($request->due_date_single_filter == 'Yesterday') {
            return $filter->where('stage_id', '=', $row->id)->where('created_by', '=', $request->id)->where('due_date', '=', date('Y-m-d', strtotime("-1 days")))->orderBy('id', 'DESC');
        }
        if ($request->due_date_single_filter == 'Tomorrow') {
            return $filter->where('stage_id', '=', $row->id)->where('created_by', '=', $request->id)->where('due_date', '=', date('Y-m-d', strtotime("+1 days")))->orderBy('id', 'DESC');
        }
        if ($request->due_date_single_filter == 'Date Range') {
            return $filter = $filter->where('stage_id', '=', $row->id)->where('created_by', '=', $request->id)->whereBetween('due_date', [$request->fromDateFilter, $request->toDateFilter])->orderBy('id', 'DESC');
        }
    }

    public function priorityFilter(Request $request, $row, $filter)
    {
        return $filter = $filter->where('stage_id', '=', $row->id)->where('created_by', '=', $request->id)->whereIn('priority', $request->priority_filter)->orderBy('id', 'DESC');
    }

    public function dateCreatedFilter(Request $request, $row, $filter)
    {
        if ($request->date_created_single_filter == 'Today') {
            return $filter->where('stage_id', '=', $row->id)->where('created_by', '=', $request->id)->where(DB::raw('DATE(created_at)'), '=', date("Y-m-d"))->orderBy('id', 'DESC');
        }
        if ($request->date_created_single_filter == 'Yesterday') {
            return $filter->where('stage_id', '=', $row->id)->where('created_by', '=', $request->id)->where(DB::raw('DATE(created_at)'), '=', date('Y-m-d', strtotime("-1 days")))->orderBy('id', 'DESC');
        }
        if ($request->date_created_single_filter == 'Tomorrow') {
            return $filter->where('stage_id', '=', $row->id)->where('created_by', '=', $request->id)->where(DB::raw('DATE(created_at)'), '=', date('Y-m-d', strtotime("+1 days")))->orderBy('id', 'DESC');
        }
        if ($request->date_created_single_filter == 'Date Range') {
            return $filter = $filter->where('stage_id', '=', $row->id)->where('created_by', '=', $request->id)->whereBetween(DB::raw('DATE(created_at)'), [$request->dateCreatedFromDateFilter, $request->dateCreatedToDateFilter])->orderBy('id', 'DESC');
        }
    }

    public function dateUpdatedFilter(Request $request, $row, $filter)
    {
        if ($request->date_updated_single_filter == 'Today') {
            return $filter->where('stage_id', '=', $row->id)->where('created_by', '=', $request->id)->where(DB::raw('DATE(updated_at)'), '=', date("Y-m-d"))->orderBy('id', 'DESC');
        }
        if ($request->date_updated_single_filter == 'Yesterday') {
            return $filter->where('stage_id', '=', $row->id)->where('created_by', '=', $request->id)->where(DB::raw('DATE(updated_at)'), '=', date('Y-m-d', strtotime("-1 days")))->orderBy('id', 'DESC');
        }
        if ($request->date_updated_single_filter == 'Tomorrow') {
            return $filter->where('stage_id', '=', $row->id)->where('created_by', '=', $request->id)->where(DB::raw('DATE(updated_at)'), '=', date('Y-m-d', strtotime("+1 days")))->orderBy('id', 'DESC');
        }
        if ($request->date_updated_single_filter == 'Date Range') {
            return $filter = $filter->where('stage_id', '=', $row->id)->where('created_by', '=', $request->id)->whereBetween(DB::raw('DATE(updated_at)'), [$request->dateUpdatedFromDateFilter, $request->dateUpdatedToDateFilter])->orderBy('id', 'DESC');
        }
    }

    public function startDateFilter(Request $request, $row, $filter)
    {
        if ($request->start_date_single_filter == 'Today') {
            return $filter->where('stage_id', '=', $row->id)->where('created_by', '=', $request->id)->where('start_date', '=', date("Y-m-d"))->orderBy('id', 'DESC');
        }
        if ($request->start_date_single_filter == 'Yesterday') {
            return $filter->where('stage_id', '=', $row->id)->where('created_by', '=', $request->id)->where('start_date', '=', date('Y-m-d', strtotime("-1 days")))->orderBy('id', 'DESC');
        }
        if ($request->start_date_single_filter == 'Tomorrow') {
            return $filter->where('stage_id', '=', $row->id)->where('created_by', '=', $request->id)->where('start_date', '=', date('Y-m-d', strtotime("+1 days")))->orderBy('id', 'DESC');
        }
        if ($request->start_date_single_filter == 'Date Range') {
            return $filter = $filter->where('stage_id', '=', $row->id)->where('created_by', '=', $request->id)->whereBetween('start_date', [$request->startDateFromDateFilter, $request->startDateToDateFilter])->orderBy('id', 'DESC');
        }
    }
}
