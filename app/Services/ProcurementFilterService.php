<?php

namespace App\Services;

use Carbon\Carbon;
use App\Models\Procurement;
use App\Models\ProductSourcing;
use Illuminate\Support\Facades\DB;

class ProcurementFilterService
{
    protected $employee;
    protected $isSDE;
    // Add a protected property to hold latestQualifiedLeadIds
    protected $latestQualifiedLeadIds;

    public function __construct($employee, $isSDE, $latestQualifiedLeadIds = null)
    {
        $this->employee = $employee;
        $this->isSDE = $isSDE;
        $this->latestQualifiedLeadIds = $latestQualifiedLeadIds;
    }

    public function getProcurementTatStats()
    {
        return [
            'under_tat' => $this->getUnderTatCount(),
            'tat_expired' => $this->getTatExpiredCount()
        ];
    }

    public function getProductSourcingStats()
    {
        return [
            'under_target_cost' => $this->getUnderTargetCostCount(),
            'not_assigned_target_cost' => $this->getTargetCostNotAssinged(),
            'exceed_target_cost' => $this->getExceedTargetCostCount(),
            'under_target_cost_tat_expired' => $this->getUnderTargetCostCountTatExpired(),
            'not_assigned_target_cost_tat_expired' => $this-> getTargetCostNotAssingedTatExpired(),
            'exceed_target_cost_tat_expired' => $this->getExceedTargetCostCountTatExpired(),
        ];
    }

    public function getTargetCostTatStats()
    {
        return [
            'under_target_cost' => [
                'under_tat' => $this->getUnderTargetCostCount(),
                'tat_expired' => $this->getUnderTargetCostCountTatExpired()
            ],
            'not_assigned_target_cost' => [
                'under_tat' => $this->getTargetCostNotAssinged(),
                'tat_expired' => $this->getTargetCostNotAssingedTatExpired()
            ],
            'exceed_target_cost' => [
                'under_tat' => $this->getExceedTargetCostCount(),
                'tat_expired' => $this->getExceedTargetCostCountTatExpired()
            ]
        ];
    }

    protected function getBaseQuery()
    {
        return $this->isSDE
            ? ProductSourcing::with('procurement.lead')
            : ProductSourcing::with('procurement');
    }

    protected function filterProduct($product, $type, $tatExpired = false)
    {
        if (!$product->procurement ||
            $product->procurement->status !== 'Complete' ||
            !$product->procurement->completion_date ||
            !$product->procurement->tat) {
            return false;
        }

        $completionDate = Carbon::parse($product->procurement->completion_date);
        $tat = Carbon::parse($product->procurement->tat);
        $comparison = $tatExpired ? $completionDate->gt($tat) : $completionDate->lte($tat);

        if ($this->isSDE && (!$product->procurement->lead ||
            $product->procurement->lead->salesperson_id !== $this->employee->id)) {
            return false;
        }

        switch ($type) {
            case 'underTarget':
                return $product->procurement->target_cost > 0 && $comparison;
            case 'notAssigned':
                return $comparison;
            case 'exceedTarget':
                return $product->procurement->target_cost > 0 && $comparison;
            default:
                return false;
        }
    }

    protected function getFilteredProducts($type, $tatExpired = false)
    {
        return $this->getBaseQuery()
            ->get()
            ->filter(function ($product) use ($type, $tatExpired) {
                return $this->filterProduct($product, $type, $tatExpired);
            })
            ->count();
    }


     protected function getUnderTargetCostCountTatExpired()
    {
        $query = DB::table('procurements as p')
            ->join('procurement_vendors as pv', 'pv.procurement_id', '=', 'p.id')
            ->join('procurement_products as pp', 'pp.procurement_id', '=', 'p.id')
            ->where('p.status', 'Complete')
            ->whereColumn('p.completion_date', '>', 'p.tat')
            ->where('pp.target_cost', '>', 0)
            ->whereColumn('pp.target_cost', '<=', 'pv.product_cost');

        // Filter by salesperson if user is SDE
        if ($this->isSDE) {
            $query->join('leads', 'p.lead_id', '=', 'leads.id')
            ->where('leads.salesperson_id', $this->employee->id);
        }

        return $query->count();
    }

    
    protected function getExceedTargetCostCountTatExpired()
    {
       $query = DB::table('procurements as p')
            ->join('procurement_vendors as pv', 'pv.procurement_id', '=', 'p.id')
            ->join('procurement_products as pp', 'pp.procurement_id', '=', 'p.id')
            ->where('p.status', 'Complete')
            ->whereColumn('p.completion_date', '>', 'p.tat')
            ->where('pp.target_cost', '>', 0)
            ->whereColumn('pp.target_cost', '>', 'pv.product_cost');

        // Apply salesperson filter for SDE
        if ($this->isSDE && $this->employee) {
            $query->join('leads', 'p.lead_id', '=', 'leads.id')
            ->where('leads.salesperson_id', $this->employee->id);
        }

        return $query->count();
    }

    protected function getTargetCostNotAssingedTatExpired()
    {
        $query = DB::table('procurements as p')
            ->join('procurement_vendors as pv', 'pv.procurement_id', '=', 'p.id')
            ->join('procurement_products as pp', 'pp.procurement_id', '=', 'p.id')
            ->where('p.status', 'Complete')
            ->whereColumn('p.completion_date', '>', 'p.tat')
            ->where('pp.target_cost', '=', 0);

        // Filter by salesperson if user is SDE
        if ($this->isSDE && $this->employee) {
            $query->join('leads', 'p.lead_id', '=', 'leads.id')
            ->where('leads.salesperson_id', $this->employee->id);
        }

        return $query->count();
    }

    protected function getUnderTargetCostCount()
    {
            $query = DB::table('procurements as p')
            ->join('procurement_vendors as pv', 'pv.procurement_id', '=', 'p.id')
            ->join('procurement_products as pp', 'pp.procurement_id', '=', 'p.id')
            ->where('p.status', 'Complete')
            ->whereColumn('p.completion_date', '<=', 'p.tat')
            ->where('pp.target_cost', '>', 0)
            ->whereColumn('pp.target_cost', '>', 'pv.product_cost');


        // Filter by salesperson if user is SDE
        if ($this->isSDE) {
            $query->join('leads', 'p.lead_id', '=', 'leads.id')
            ->where('leads.salesperson_id', $this->employee->id);
        }

        return $query->count();
    }

    protected function getTargetCostNotAssinged()
    {
        $query = DB::table('procurements as p')
            ->join('procurement_vendors as pv', 'pv.procurement_id', '=', 'p.id')
            ->join('procurement_products as pp', 'pp.procurement_id', '=', 'p.id')
            ->where('p.status', 'Complete')
            ->whereColumn('p.completion_date', '<=', 'p.tat')
            ->where('pp.target_cost', '=', 0);

        // Filter by salesperson if user is SDE
        if ($this->isSDE) {
            $query->join('leads', 'p.lead_id', '=', 'leads.id')
            ->where('leads.salesperson_id', $this->employee->id);
        }

        return $query->count();
    }

    protected function getExceedTargetCostCount()
    {
        $query = DB::table('procurements as p')
            ->join('procurement_vendors as pv', 'pv.procurement_id', '=', 'p.id')
            ->join('procurement_products as pp', 'pp.procurement_id', '=', 'p.id')
            ->where('p.status', 'Complete')
            ->whereColumn('p.completion_date', '<=', 'p.tat')
            ->where('pp.target_cost', '>', 0)
            ->whereColumn('pp.target_cost', '<=', 'pv.product_cost');

        // Apply salesperson filter for SDE
        if ($this->isSDE && $this->employee) {
            $query->join('leads', 'p.lead_id', '=', 'leads.id')
            ->where('leads.salesperson_id', $this->employee->id);
        }

        return $query->count();
    }

    protected function getUnderTatCount()
    {
        if ($this->isSDE) {
            return Procurement::with('lead')
                ->where('status', 'Complete')
                ->whereIn('lead_id', $this->latestQualifiedLeadIds)
                ->get()
                ->filter(function ($procurement) {
                    return $procurement->lead &&
                        $procurement->lead->salesperson_id === $this->employee->id &&
                        $procurement->completion_date &&
                        $procurement->tat &&
                        Carbon::parse($procurement->completion_date)->lte(Carbon::parse($procurement->tat));
                })
                ->count();
        }
        
        return Procurement::where('status', 'Complete')
            ->whereIn('lead_id', $this->latestQualifiedLeadIds)
            ->whereColumn('completion_date', '<=', 'tat')
            ->count();
    }

    protected function getTatExpiredCount()
    {
        if ($this->isSDE) {
            return Procurement::with('lead')
                ->where('status', 'Complete')
                ->whereIn('lead_id', $this->latestQualifiedLeadIds)
                ->get()
                ->filter(function ($procurement) {
                    return $procurement->lead &&
                        $procurement->lead->salesperson_id === $this->employee->id &&
                        $procurement->completion_date &&
                        $procurement->tat &&
                        Carbon::parse($procurement->completion_date)->gt(Carbon::parse($procurement->tat));
                })
                ->count();
        }
        
        return Procurement::where('status', 'Complete')
            ->whereIn('lead_id', $this->latestQualifiedLeadIds)
            ->whereColumn('completion_date', '>', 'tat')
            ->count();
    }
}
