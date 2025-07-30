<?php

namespace App\Http\Controllers;

use Carbon\Carbon;
use App\Models\Lead;
use App\Models\Victory;
use App\Models\Employee;
use App\Models\Quotation;
use App\Models\QuotationProduct;
use App\Models\PriceShared;
use App\Models\OpportunityDetail;
use App\Models\QuotationSent;
use App\Models\Procurement;
use App\Models\ProcurementProducts;
use App\Models\ProcurementVendor;
use App\Models\BusinessTask;
use Illuminate\Http\Request;
use App\Models\Lead_customer;
use App\Models\FollowUpDetail;
use App\Models\InquiryReceive;
use App\Models\ProductSourcing;
use App\Models\LeadAcknowledgment;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Auth;
use App\Services\ProcurementFilterService;
use Illuminate\Support\Facades\DB;



class DashboardController extends Controller
{
    public function getDashboardSummary(Request $request)
    {
        $user = Auth::user();
        if (!$user) {
            return response()->json(['message' => 'Unauthorized'], 401);
        }

        $employee = Employee::with('role')->where('user_id', $user->id)->first();

        if (!$employee) {
            return response()->json(['message' => 'Employee not found'], 404);
        }

        $isAdmin = in_array(optional($employee->role)->name, ['ADMIN', 'SDE-Manager']);
        $isSDE = optional($employee->role)->name === 'SDE';

        // Date filter logic
        $startDate = $request->query('start_date');
        $endDate = $request->query('end_date');
        if ($startDate && $endDate) {
            $start = Carbon::parse($startDate)->startOfDay();
            $end = Carbon::parse($endDate)->endOfDay();
        } else {
            $start = null;
            $end = null;
        }

        // Base lead query
        $leadQuery = Lead::query();
        if ($start && $end) {
            $leadQuery->whereBetween('created_at', [$start, $end]);
        }

        // Filter for SDE - only show their assigned leads
        if ($isSDE) {
            $leadQuery->where('salesperson_id', $employee->id);
        }

        // Customer counts are common
        $customerLeadQuery = Lead::query();
        if ($isSDE) {
            $customerLeadQuery->where('salesperson_id', $employee->id);
        }
        if ($start && $end) {
            $customerLeadQuery->whereBetween('created_at', [$start, $end]);
        }
        $customerLeadIds = $customerLeadQuery->whereNotNull('customer_id')->pluck('customer_id');
        
        $totalCustomers = $isSDE
            ? Lead_customer::whereIn('id', $customerLeadIds)->distinct()->count()
            : Lead_customer::count() + Lead::whereNull('customer_id')->distinct('id')->count();

        $customerStatusQuery = Lead_customer::query();
        if ($isSDE) {
            $customerStatusQuery->whereIn('id', $customerLeadIds);
        }
        $vipCustomers = $isSDE
            ? Lead_customer::whereIn('id', function ($query) use ($customerStatusQuery) {
                $query->select('customer_id')
                    ->from('leads')
                    ->whereIn('id', $customerStatusQuery->where('customer_status', 'VIP')->pluck('id'))
                    ->whereNotNull('customer_id');
            })->count()
            : Lead_customer::where('customer_status', 'VIP')->count();

        $genuineCustomers = $isSDE
            ? Lead_customer::where('customer_status', 'genuine')
                ->whereIn('id', $customerLeadIds)
                ->count()
            : Lead_customer::where('customer_status', 'genuine')->count();

        $blacklistedCustomers = $isSDE
            ? Lead_customer::where('customer_status', 'blacklist')
                ->whereIn('id', $customerLeadIds)
                ->count()
            : Lead_customer::where('customer_status', 'blacklist')->count();

        $remainingCustomers = $isSDE
            ? Lead_customer::whereNull('customer_status')
                ->whereIn('id', $customerLeadIds)
                ->count()
            : Lead_customer::whereNull('customer_status')->count();

        // Leads and inquiry-related counts
        $totalInquiries = $isSDE
            ? (clone $leadQuery)->where('salesperson_id', $employee->id)->count()
            : (clone $leadQuery)->count();

        $qualifiedBySoftware = $isSDE
            ? (clone $leadQuery)->where('salesperson_id', $employee->id)
            ->where('qualified', '1')
            ->count()
            : Lead::where('qualified', '1')
            ->count();

        $qualifiedByAgent = $isSDE
            ? (clone $leadQuery)->where('salesperson_id', $employee->id)
            ->where('qualified', '1')
            ->where('is_agent_qualified_lead', '1')
            ->count()
            : Lead::where('qualified', '1')
            ->where('is_agent_qualified_lead', '1')
            ->count();

        // Platform-wise counts
        $purveeLeads = (clone $leadQuery)->where('platform', 'Purvee')->count();
        $purvee_online_Leads = (clone $leadQuery)->where('platform', 'Purvee')->whereIn('query_type', ['W', 'P'])->count();
        $purvee_offline_Leads = (clone $leadQuery)->where('platform', 'Purvee')->whereIn('query_type', ['BIZ', 'B'])->count();
        $healthcareLeads = (clone $leadQuery)->where('platform', 'Inorbvict')->count();
        $healthcare_online_Leads = (clone $leadQuery)->where('platform', 'Inorbvict')->whereIn('query_type', ['W', 'P'])->count();
        $healthcare_offline_Leads = (clone $leadQuery)->where('platform', 'Inorbvict')->whereIn('query_type', ['BIZ', 'B'])->count();

        $vortexLeads = (clone $leadQuery)->where('platform', 'Vortex')->count();
        $vortex_online_Leads = (clone $leadQuery)->where('platform', 'Vortex')->whereIn('query_type', ['W', 'P'])->count();
        $vortex_offline_Leads = (clone $leadQuery)->where('platform', 'Vortex')->whereIn('query_type', ['BIZ', 'B'])->count();
        $tradeLeads = (clone $leadQuery)->where('platform', 'TradeIndia')->count();
        $chatbotLeads = (clone $leadQuery)->where('platform', 'Chatbot')->count();
        $manualLeads = (clone $leadQuery)->where('query_type', 'Manual')->count();
        // Lead acknowledgment data

        $inquiryReceiveQuery = InquiryReceive::query();
        if ($start && $end) {
            $inquiryReceiveQuery->whereBetween('created_at', [$start, $end]);
        }
        if ($isSDE) {
            $inquiryReceiveQuery->whereHas('lead', function ($q) use ($employee) {
                $q->where('salesperson_id', $employee->id);
            });
        }
       // Get the latest acknowledgment per lead_id where qualified is not null
        $latestLAcks = LeadAcknowledgment::query()
            ->when($isSDE, function ($query) use ($employee) {
                $query->whereHas('lead', function ($q) use ($employee) {
                    $q->where('salesperson_id', $employee->id);
                });
            })
            ->select('lead_acknowledgments.*')
            ->join(DB::raw('(SELECT lead_id, MAX(created_at) as max_created FROM lead_acknowledgments GROUP BY lead_id) as latest'), function($join) {
                $join->on('lead_acknowledgments.lead_id', '=', 'latest.lead_id')
                     ->on('lead_acknowledgments.created_at', '=', 'latest.max_created');
            })
            ->get();

        // Only take lead_ids where the latest acknowledgment is qualified (not just any qualified in history)
        $latestQualifiedLeadIds = $latestLAcks->filter(function ($ack) {
            return !is_null($ack->qualified);
        })->pluck('lead_id');

        // Count of InquiryReceive where lead_id is in the above list
        $totalProduct = InquiryReceive::whereIn('lead_id', $latestQualifiedLeadIds)->count();

        // For SDE: filter latest acknowledgment per lead_id, for ADMIN: use latest per lead_id
        // Get the latest acknowledgment per lead_id based on created_at, then count by status
        // Get the latest acknowledgment per lead_id (no join, just latest per lead)
        $latestAcks = LeadAcknowledgment::query()
            ->when($isSDE, function ($query) use ($employee) {
                $query->whereHas('lead', function ($q) use ($employee) {
                    $q->where('salesperson_id', $employee->id);
                });
            })
            ->select('lead_acknowledgments.*')
            ->join(DB::raw('(SELECT lead_id, MAX(created_at) as max_created FROM lead_acknowledgments GROUP BY lead_id) as latest'), function($join) {
                $join->on('lead_acknowledgments.lead_id', '=', 'latest.lead_id')
                     ->on('lead_acknowledgments.created_at', '=', 'latest.max_created');
            })
            ->get();

        $agentQualifiedList = $latestAcks->whereNotNull('qualified')->count();
        $agentDisqualifiedList = $latestAcks->whereNotNull('disqualified')->count();
        $agentClarityPendingList = $latestAcks->whereNotNull('clarity_pending')->count();




          $agentQualified = $isSDE
            ? LeadAcknowledgment::with('lead')
            ->get()
            ->filter(function ($ack) use ($employee) {
                return $ack->lead && $ack->lead->salesperson_id === $employee->id && $ack->qualified;
            })
            ->count()
            : LeadAcknowledgment::select('lead_id', DB::raw('MAX(created_at) as latest_created_at'))
                ->whereNotNull('qualified')
                ->groupBy('lead_id')
                ->get()
                ->count();
        // Product Sourcing Tdfracker 
        // Leads_qualified_by_agent
        // Get lead_ids whose latest lead_acknowledgment is qualified (not null)
        if ($isSDE) {
            $latestQualifiedLeadIds = \App\Models\LeadAcknowledgment::whereHas('lead', function ($q) use ($employee) {
                    $q->where('salesperson_id', $employee->id);
                })
                ->select('lead_acknowledgments.lead_id')
                ->join(DB::raw('(SELECT lead_id, MAX(created_at) as max_created FROM lead_acknowledgments GROUP BY lead_id) as latest'), function($join) {
                    $join->on('lead_acknowledgments.lead_id', '=', 'latest.lead_id')
                         ->on('lead_acknowledgments.created_at', '=', 'latest.max_created');
                })
                ->whereNotNull('lead_acknowledgments.qualified')
                ->pluck('lead_acknowledgments.lead_id');
        } else {
            $latestQualifiedLeadIds = \App\Models\LeadAcknowledgment::select('lead_acknowledgments.lead_id')
                ->join(DB::raw('(SELECT lead_id, MAX(created_at) as max_created FROM lead_acknowledgments GROUP BY lead_id) as latest'), function($join) {
                    $join->on('lead_acknowledgments.lead_id', '=', 'latest.lead_id')
                         ->on('lead_acknowledgments.created_at', '=', 'latest.max_created');
                })
                ->whereNotNull('lead_acknowledgments.qualified')
                ->pluck('lead_acknowledgments.lead_id');
        }

        $Sourcing_required = ProductSourcing::whereIn('lead_id', $latestQualifiedLeadIds)
            ->where('product_sourcing', 'yes')
            ->count();

        $Sourcing_not_required = ProductSourcing::whereIn('lead_id', $latestQualifiedLeadIds)
            ->where('product_sourcing', 'no')
            ->count();


        // Assigned vs Unassigned Sourcing
        // Use only lead_ids whose latest lead_acknowledgment is qualified (not null)
        if ($isSDE) {
            $productSourcingYesQualified = ProductSourcing::whereIn('lead_id', $latestQualifiedLeadIds)
                ->where('product_sourcing', 'yes')
                ->whereHas('lead', function ($q) use ($employee) {
                    $q->where('salesperson_id', $employee->id);
                })
                ->get(['id', 'lead_id']);
        } else {
            $productSourcingYesQualified = ProductSourcing::whereIn('lead_id', $latestQualifiedLeadIds)
                ->where('product_sourcing', 'yes')
                ->get(['id', 'lead_id']);
        }

        $assigned = 0;
        $not_assigned = 0;

        $procurementProducts = ProcurementProducts::select('id','proc_prod_id')->get();

        foreach ($productSourcingYesQualified as $value) {
            $hasProcurement = $procurementProducts->contains('proc_prod_id', $value->id);

            if ($hasProcurement) {
                $assigned++;
            } else {
                $not_assigned++;
            }
        }


        // Product Sourcing Done
        // Get all procurement IDs and their statuses
        if ($isSDE) {
            $procurements = Procurement::whereNotNull('lead_id')
                ->whereIn('lead_id', $latestQualifiedLeadIds)
                ->whereHas('lead', function ($q) use ($employee) {
                    $q->where('salesperson_id', $employee->id);
                })
                ->get(['id', 'status']);
        } else {
            $procurements = Procurement::whereNotNull('lead_id')
                ->whereIn('lead_id', $latestQualifiedLeadIds)
                ->get(['id', 'status']);
        }

        // Get all procurement_product procurement_ids
        $procurementProductIds = \DB::table('procurement_products')
            ->whereIn('procurement_id', $procurements->pluck('id'))
            ->pluck('procurement_id')
            ->unique();

        // Filter procurements that have at least one procurement_product
        $filteredProcurements = $procurements->whereIn('id', $procurementProductIds);

        // Get procurement IDs by status
        $completeProcurementIds = $filteredProcurements->where('status', 'Complete')->pluck('id');
        $inProgressProcurementIds = $filteredProcurements->where('status', 'In progress')->pluck('id');

        // Count procurement_products for each status
        $sourcing_done = \DB::table('procurement_products')
            ->whereIn('procurement_id', $completeProcurementIds)
            ->count();

        $sourcing_not_done = \DB::table('procurement_products')
            ->whereIn('procurement_id', $inProgressProcurementIds)
            ->count();


            
        // Sourcing Performance Status Tracker-TAT Wise
     $procurement_done = $isSDE
            ? Procurement::where('status', 'Complete')
            ->whereNotNull('lead_id')
            ->whereIn('lead_id', $latestQualifiedLeadIds)
            ->whereHas('lead', function ($q) use ($employee) {
                $q->where('salesperson_id', $employee->id);
            })
            ->count()
            : Procurement::where('status', 'Complete')->whereNotNull('lead_id')->whereIn('lead_id', $latestQualifiedLeadIds)->count();

        $procurement_not_done = $isSDE
            ? Procurement::where('status', 'In progress')
            ->whereNotNull('lead_id')
            ->whereIn('lead_id', $latestQualifiedLeadIds)
            ->whereHas('lead', function ($q) use ($employee) {
                $q->where('salesperson_id', $employee->id);
            })
            ->count()
            : Procurement::where('status', 'In progress')->whereNotNull('lead_id')->whereIn('lead_id', $latestQualifiedLeadIds)->count();


        // Product Sourcing Done
        $product_sourcing_done = $isSDE
            ? Procurement::with('lead')
            ->get()
            ->filter(function ($sourcing) use ($employee) {
                return $sourcing->lead && $sourcing->lead->salesperson_id === $employee->id && $sourcing->status === 'Complete';
            })
            ->count()
            : Procurement::where('status', 'Complete')->count();


        // Pass $latestQualifiedLeadIds to ProcurementFilterService for correct TAT filtering
        $procurementService = new ProcurementFilterService($employee, $isSDE, $latestQualifiedLeadIds);
        $tatStats = $procurementService->getProcurementTatStats();
        $productStats = $procurementService->getProductSourcingStats();
        // $targetCostTatStats = $procurementService->getTargetCostTatStats();

        $under_tat = $tatStats['under_tat'];
        $tat_expired = $tatStats['tat_expired'];
        $underTargetCostProducts = $productStats['under_target_cost'];
        $notAssignedTargetCostProducts = $productStats['not_assigned_target_cost'];
        $exceedTargetCostProducts = $productStats['exceed_target_cost'];
        $underTargetCostProducts_tat_expired = $productStats['under_target_cost_tat_expired'];
        $notAssignedTargetCostProducts_tat_expired = $productStats['not_assigned_target_cost_tat_expired'];
        $exceedTargetCostProducts_tat_expired = $productStats['exceed_target_cost_tat_expired'];


        // Under Target Cost
        $UnderTargetCost = $isSDE
            ? (
                function () use ($employee, $latestQualifiedLeadIds) {
                    \Log::info('=== UNDER TARGET COST CALCULATION (SDE) ===');
                    \Log::info('Employee ID: ' . $employee->id . ', Employee Name: ' . $employee->name);
                    
                    $procurements = Procurement::whereNotNull('lead_id')
                        ->whereIn('lead_id', $latestQualifiedLeadIds)
                        ->whereHas('lead', function ($q) use ($employee) {
                            $q->where('salesperson_id', $employee->id);
                        })
                        ->get(['id']);
                    
                    \Log::info('Found ' . $procurements->count() . ' procurements for SDE');
                    
                    $procurementIds = $procurements->pluck('id');

                    // Get target costs from procurement_products table
                    $procurementProducts = ProcurementProducts::whereIn('procurement_id', $procurementIds)
                        ->get(['procurement_id', 'product_service_name', 'target_cost']);
                    
                    \Log::info('Found ' . $procurementProducts->count() . ' procurement products with target costs');

                    $count = 0;
                    foreach ($procurementProducts as $product) {
                        $procId = $product->procurement_id;
                        $targetCost = $product->target_cost;
                        $productName = $product->product_service_name;
                        
                        \Log::info("Processing procurement ID: $procId, Product: $productName, Target Cost: " . ($targetCost ?? 'NULL'));
                        
                        if ($targetCost === null || $targetCost == 0) {
                            \Log::info("Skipping procurement $procId, product $productName - no target cost or target cost is zero");
                            continue;
                        }

                        // Get all vendors for this procurement to log their costs
                        $vendors = ProcurementVendor::where('procurement_id', $procId)->get(['id', 'product_cost']);
                        \Log::info("Vendors for procurement $procId: " . $vendors->map(function($v) { 
                            return "ID: {$v->id}, Cost: {$v->product_cost}"; 
                        })->implode(', '));

                        $hasUnderTarget = ProcurementVendor::where('procurement_id', $procId)
                            ->where('product_cost', '<=', $targetCost)
                            ->exists();

                        \Log::info("Has under target for procurement $procId, product $productName: " . ($hasUnderTarget ? 'YES' : 'NO'));

                        if ($hasUnderTarget) {
                            $count++;
                            \Log::info("Incrementing count for procurement $procId, product $productName. Current count: $count");
                        }
                    }
                    
                    \Log::info("Final Under Target Cost count: $count");
                    return $count;
                }
            )()
            : (
                function () use ($latestQualifiedLeadIds) {
                    \Log::info('=== UNDER TARGET COST CALCULATION (NON-SDE) ===');
                    
                    $procurements = Procurement::whereNotNull('lead_id')
                        ->whereIn('lead_id', $latestQualifiedLeadIds)
                        ->get(['id']);
                    
                    \Log::info('Found ' . $procurements->count() . ' procurements for non-SDE');
                    
                    $procurementIds = $procurements->pluck('id');

                    // Get target costs from procurement_products table
                    $procurementProducts = ProcurementProducts::whereIn('procurement_id', $procurementIds)
                        ->get(['procurement_id', 'product_service_name', 'target_cost']);
                    
                    \Log::info('Found ' . $procurementProducts->count() . ' procurement products with target costs');

                    $count = 0;
                    foreach ($procurementProducts as $product) {
                        $procId = $product->procurement_id;
                        $targetCost = $product->target_cost;
                        $productName = $product->product_service_name;
                        
                        \Log::info("Processing procurement ID: $procId, Product: $productName, Target Cost: " . ($targetCost ?? 'NULL'));
                        
                        if ($targetCost === null || $targetCost == 0) {
                            \Log::info("Skipping procurement $procId, product $productName - no target cost or target cost is zero");
                            continue;
                        }

                        // Get all vendors for this procurement to log their costs
                        $vendors = ProcurementVendor::where('procurement_id', $procId)->get(['id', 'product_cost']);
                        \Log::info("Vendors for procurement $procId: " . $vendors->map(function($v) { 
                            return "ID: {$v->id}, Cost: {$v->product_cost}"; 
                        })->implode(', '));

                        $hasUnderTarget = ProcurementVendor::where('procurement_id', $procId)
                            ->where('product_cost', '<=', $targetCost)
                            ->exists();

                        \Log::info("Has under target for procurement $procId, product $productName: " . ($hasUnderTarget ? 'YES' : 'NO'));

                        if ($hasUnderTarget) {
                            $count++;
                            \Log::info("Incrementing count for procurement $procId, product $productName. Current count: $count");
                        }
                    }
                    
                    \Log::info("Final Under Target Cost count: $count");
                    return $count;
                }
            )();

         //target cost exceed
        $TargetCostExceed = $isSDE
            ? (
                function () use ($employee, $latestQualifiedLeadIds) {
                    \Log::info('=== TARGET COST EXCEED CALCULATION (SDE) ===');
                    \Log::info('Employee ID: ' . $employee->id . ', Employee Name: ' . $employee->name);
                    
                    $procurements = Procurement::whereNotNull('lead_id')
                        ->whereIn('lead_id', $latestQualifiedLeadIds)
                        ->whereHas('lead', function ($q) use ($employee) {
                            $q->where('salesperson_id', $employee->id);
                        })
                        ->get(['id']);
                    
                    \Log::info('Found ' . $procurements->count() . ' procurements for SDE (exceed calculation)');
                    
                    $procurementIds = $procurements->pluck('id');

                    // Get target costs from procurement_products table
                    $procurementProducts = ProcurementProducts::whereIn('procurement_id', $procurementIds)
                        ->get(['procurement_id', 'product_service_name', 'target_cost']);
                    
                    \Log::info('Found ' . $procurementProducts->count() . ' procurement products with target costs (exceed calculation)');

                    $count = 0;
                    foreach ($procurementProducts as $product) {
                        $procId = $product->procurement_id;
                        $targetCost = $product->target_cost;
                        $productName = $product->product_service_name;
                        
                        \Log::info("Processing procurement ID: $procId, Product: $productName, Target Cost: " . ($targetCost ?? 'NULL') . " (exceed calculation)");
                        
                        if ($targetCost === null || $targetCost == 0) {
                            \Log::info("Skipping procurement $procId, product $productName - no target cost or target cost is zero (exceed calculation)");
                            continue;
                        }

                        // Get all vendors for this procurement to log their costs
                        $vendors = ProcurementVendor::where('procurement_id', $procId)->get(['id', 'product_cost']);
                        \Log::info("Vendors for procurement $procId (exceed): " . $vendors->map(function($v) { 
                            return "ID: {$v->id}, Cost: {$v->product_cost}"; 
                        })->implode(', '));

                        $hasExceedTarget = ProcurementVendor::where('procurement_id', $procId)
                            ->where('product_cost', '>', $targetCost)
                            ->exists();

                        \Log::info("Has exceed target for procurement $procId, product $productName: " . ($hasExceedTarget ? 'YES' : 'NO'));

                        if ($hasExceedTarget) {
                            $count++;
                            \Log::info("Incrementing exceed count for procurement $procId, product $productName. Current count: $count");
                        }
                    }
                    
                    \Log::info("Final Target Cost Exceed count: $count");
                    return $count;
                }
            )()
            : (
                function () use ($latestQualifiedLeadIds) {
                    \Log::info('=== TARGET COST EXCEED CALCULATION (NON-SDE) ===');
                    
                    $procurements = Procurement::whereNotNull('lead_id')
                        ->whereIn('lead_id', $latestQualifiedLeadIds)
                        ->get(['id']);
                    
                    \Log::info('Found ' . $procurements->count() . ' procurements for non-SDE (exceed calculation)');
                    
                    $procurementIds = $procurements->pluck('id');

                    // Get target costs from procurement_products table
                    $procurementProducts = ProcurementProducts::whereIn('procurement_id', $procurementIds)
                        ->get(['procurement_id', 'product_service_name', 'target_cost']);
                    
                    \Log::info('Found ' . $procurementProducts->count() . ' procurement products with target costs (exceed calculation)');

                    $count = 0;
                    foreach ($procurementProducts as $product) {
                        $procId = $product->procurement_id;
                        $targetCost = $product->target_cost;
                        $productName = $product->product_service_name;
                        
                        \Log::info("Processing procurement ID: $procId, Product: $productName, Target Cost: " . ($targetCost ?? 'NULL') . " (exceed calculation)");
                        
                        if ($targetCost === null || $targetCost == 0) {
                            \Log::info("Skipping procurement $procId, product $productName - no target cost or target cost is zero (exceed calculation)");
                            continue;
                        }

                        // Get all vendors for this procurement to log their costs
                        $vendors = ProcurementVendor::where('procurement_id', $procId)->get(['id', 'product_cost']);
                        \Log::info("Vendors for procurement $procId (exceed): " . $vendors->map(function($v) { 
                            return "ID: {$v->id}, Cost: {$v->product_cost}"; 
                        })->implode(', '));

                        $hasExceedTarget = ProcurementVendor::where('procurement_id', $procId)
                            ->where('product_cost', '>', $targetCost)
                            ->exists();

                        \Log::info("Has exceed target for procurement $procId, product $productName: " . ($hasExceedTarget ? 'YES' : 'NO'));

                        if ($hasExceedTarget) {
                            $count++;
                            \Log::info("Incrementing exceed count for procurement $procId, product $productName. Current count: $count");
                        }
                    }
                    
                    \Log::info("Final Target Cost Exceed count: $count");
                    return $count;
                }
            )();

         //target cost not assigned
       
       
         $TargetCostNotAssigned = $isSDE
            ? (
                function () use ($employee, $latestQualifiedLeadIds) {
                    // Get procurements with lead_id in $latestQualifiedLeadIds and for this SDE
                    $procurements = Procurement::whereNotNull('lead_id')
                        ->whereIn('lead_id', $latestQualifiedLeadIds)
                        ->whereHas('lead', function ($q) use ($employee) {
                            $q->where('salesperson_id', $employee->id);
                        })
                        ->get(['id']);
                    $procurementIds = $procurements->pluck('id');

                    // Get procurement_ids that exist in procurement_vendors
                    $vendorProcurementIds = ProcurementVendor::whereIn('procurement_id', $procurementIds)
                        ->pluck('procurement_id')
                        ->unique();

                    // Count procurements whose id is not in vendorProcurementIds
                    return $procurementIds->diff($vendorProcurementIds)->count();
                }
            )()
            : (
                function () use ($latestQualifiedLeadIds) {
                    // Get procurements with lead_id in $latestQualifiedLeadIds
                    $procurementIds = Procurement::whereNotNull('lead_id')
                        ->whereIn('lead_id', $latestQualifiedLeadIds)
                        ->pluck('id');

                    // Get procurement_ids that exist in procurement_vendors
                    $vendorProcurementIds = ProcurementVendor::whereIn('procurement_id', $procurementIds)
                        ->pluck('procurement_id')
                        ->unique();

                    // Count procurements whose id is not in vendorProcurementIds
                    return $procurementIds->diff($vendorProcurementIds)->count();
                }
            )();


            
             // Price Shared Count
            $Price_Shared = $isSDE
                ? PriceShared::whereIn('lead_id', $latestQualifiedLeadIds)
                    ->whereIn('lead_id', Lead::where('salesperson_id', $employee->id)->pluck('id'))
                    ->get(['lead_id', 'product'])
                    ->unique(function ($item) {
                        return $item['lead_id'] . '-' . $item['product'];
                    })
                    ->count()
                : PriceShared::whereIn('lead_id', $latestQualifiedLeadIds)
                    ->get(['lead_id', 'product'])
                    ->unique(function ($item) {
                        return $item['lead_id'] . '-' . $item['product'];
                    })
                    ->count();



                // Price Not Shared Count
                $Price_Not_Shared = $isSDE
                    ? (function() use ($employee) {
                        $count = 0;
                        
                        // 1. For procurements with status 'Complete'
                        $completeProcurements = Procurement::where('status', 'Complete')
                            ->whereNotNull('lead_id')
                            ->whereHas('lead', function($q) use ($employee) {
                                $q->where('salesperson_id', $employee->id);
                            })
                            ->get(['id', 'lead_id']);
                        
                        foreach ($completeProcurements as $procurement) {
                            // Get product_service_names from procurement_products
                            $productServiceNames = ProcurementProducts::where('procurement_id', $procurement->id)
                                ->pluck('product_service_name');
                            
                            foreach ($productServiceNames as $productServiceName) {
                                // Check if this lead_id + product_service_name exists in price_shareds
                                $exists = PriceShared::where('lead_id', $procurement->lead_id)
                                    ->where('product', $productServiceName)
                                    ->exists();
                                
                                if (!$exists) {
                                    $count++;
                                }
                            }
                        }
                        
                        // 2. For product_sourcings with product_sourcing = 'no'
                        $productSourcingNo = ProductSourcing::where('product_sourcing', 'no')
                            ->whereNotNull('lead_id')
                            ->whereHas('lead', function($q) use ($employee) {
                                $q->where('salesperson_id', $employee->id);
                            })
                            ->get(['lead_id', 'product_name']);
                        
                        foreach ($productSourcingNo as $sourcing) {
                            // Check if this lead_id + product_name exists in price_shareds
                            $exists = PriceShared::where('lead_id', $sourcing->lead_id)
                                ->where('product', $sourcing->product_name)
                                ->exists();
                            
                            if (!$exists) {
                                $count++;
                            }
                        }
                        
                        return $count;
                    })()
                    : (function() {
                        $count = 0;
                        
                        // 1. For procurements with status 'Complete'
                        $completeProcurements = Procurement::where('status', 'Complete')
                            ->whereNotNull('lead_id')
                            ->get(['id', 'lead_id']);
                        
                        foreach ($completeProcurements as $procurement) {
                            // Get product_service_names from procurement_products
                            $productServiceNames = ProcurementProducts::where('procurement_id', $procurement->id)
                                ->pluck('product_service_name');
                            
                            foreach ($productServiceNames as $productServiceName) {
                                // Check if this lead_id + product_service_name exists in price_shareds
                                $exists = PriceShared::where('lead_id', $procurement->lead_id)
                                    ->where('product', $productServiceName)
                                    ->exists();
                                
                                if (!$exists) {
                                    $count++;
                                }
                            }
                        }
                        
                        // 2. For product_sourcings with product_sourcing = 'no'
                        $productSourcingNo = ProductSourcing::where('product_sourcing', 'no')
                            ->whereNotNull('lead_id')
                            ->get(['lead_id', 'product_name']);
                        
                        foreach ($productSourcingNo as $sourcing) {
                            // Check if this lead_id + product_name exists in price_shareds
                            $exists = PriceShared::where('lead_id', $sourcing->lead_id)
                                ->where('product', $sourcing->product_name)
                                ->exists();
                            
                            if (!$exists) {
                                $count++;
                            }
                        }
                        
                        return $count;
                    })();
           
           
             // READY TO SHARE
            // Get procurement IDs where status is 'Complete' and lead_id is not null (filtered by SDE if needed)
            if ($isSDE) {
                $completeProcurementIds = Procurement::where('status', 'Complete')
                    ->whereHas('lead', function($q) use ($employee) {
                        $q->where('salesperson_id', $employee->id);
                    })
                    ->whereNotNull('lead_id')
                    ->whereIn('lead_id', $latestQualifiedLeadIds)
                    ->pluck('id');

                $assignedCount = ProcurementProducts::whereIn('procurement_id', $completeProcurementIds)->count();

                $productSourcingNoCount = ProductSourcing::where('product_sourcing', 'no')
                    ->whereHas('lead', function($q) use ($employee) {
                        $q->where('salesperson_id', $employee->id);
                    })
                    ->whereNotNull('lead_id')
                    ->whereIn('lead_id', $latestQualifiedLeadIds)
                    ->count();
            } else {
                $completeProcurementIds = Procurement::where('status', 'Complete')
                    ->whereNotNull('lead_id')
                    ->whereIn('lead_id', $latestQualifiedLeadIds)
                    ->pluck('id');

                $assignedCount = ProcurementProducts::whereIn('procurement_id', $completeProcurementIds)->count();

                $productSourcingNoCount = ProductSourcing::where('product_sourcing', 'no')
                    ->whereNotNull('lead_id')
                    ->whereIn('lead_id', $latestQualifiedLeadIds)
                    ->count();
            }

            $readyToShare = $productSourcingNoCount + $assignedCount;


            
            // Fix: For $isSDE, use QuotationSent::whereHas('lead', ...) instead of PriceShared
            // $readyToShareQuotation = $isSDE
            //     ? PriceShared::whereHas('lead', function($q) use ($employee) {
            //         $q->where('salesperson_id', $employee->id);
            //     })
            //     ->pluck('lead_id')->unique()->count()
            //     : PriceShared::pluck('lead_id')->unique()->count();
            $readyToShareQuotation = $isSDE
                ? PriceShared::whereHas('lead', function($q) use ($employee) {
                    $q->where('salesperson_id', $employee->id);
                })
                ->pluck('lead_id')
                ->unique()
                ->count()
                : PriceShared::pluck('lead_id')
                ->unique()
                ->count();



        $sharedLeadIds = PriceShared::pluck('lead_id')->unique();

                // $Price_Not_Shared = $isSDE
                //     ? PriceShared::with(['lead'])
                //         ->get()
                //         ->filter(function ($priceShared) use ($employee) {
                //             // Get the corresponding product sourcing record
                //             $productSourcing = ProductSourcing::where('lead_id', $priceShared->lead_id)
                //                 ->where('product_name', $priceShared->product)
                //                 ->first();

                //             return $priceShared->lead 
                //                 && $priceShared->lead->salesperson_id === $employee->id
                //                 && $productSourcing
                //                 && Carbon::parse($priceShared->created_at)->gt( // Changed from lte to gt
                //                     Carbon::parse($productSourcing->created_at)->addDays(2)
                //                 );
                //         })
                //         ->pluck('lead_id')
                //         ->unique()
                //         ->count()
                //     : PriceShared::whereExists(function ($query) {
                //             $query->select(DB::raw(1))
                //                 ->from('product_sourcings')
                //                 ->whereColumn('product_sourcings.lead_id', 'price_shareds.lead_id')
                //                 ->whereColumn('product_sourcings.product_name', 'price_shareds.product')
                //                 ->whereRaw('price_shareds.created_at > DATE_ADD(product_sourcings.created_at, INTERVAL 2 DAY)'); // Changed <= to >
                //         })
                //         ->distinct('lead_id')
                //         ->count('lead_id');


        // Get all shared price records with their created_at and lead_id
        $priceSharedRecords = PriceShared::all();

        // Get shared lead IDs
        $sharedLeadIds = $priceSharedRecords->pluck('lead_id')->unique();

        $quotationRecords = QuotationSent::all();

            // TAT Analysis For Price Shared - Modified to match Price_Shared count logic
            // Get the same data set that Price_Shared uses
            $completeProcurements = Procurement::where('status', 'Complete')
                ->whereNotNull('lead_id')
                ->get(['lead_id']);

            $productSourcingNo = ProductSourcing::where('product_sourcing', 'no')
                ->get(['lead_id', 'product_name']);

            // Collect unique (lead_id, product) pairs from price_shareds for those procurements
            $procurementLeadIds = $completeProcurements->pluck('lead_id')->unique()->filter();
            $productSourcingNoLeadProduct = $productSourcingNo->map(function($item) {
                return $item->lead_id . '||' . $item->product_name;
            })->unique();

            // For SDE, filter by salesperson_id
            if ($isSDE) {
                $procurementLeadIds = $procurementLeadIds->intersect(
                    Lead::where('salesperson_id', $employee->id)->pluck('id')
                );
                $productSourcingNoLeadProduct = $productSourcingNo->filter(function($item) use ($employee) {
                    $lead = Lead::find($item->lead_id);
                    return $lead && $lead->salesperson_id === $employee->id;
                })->map(function($item) {
                    return $item->lead_id . '||' . $item->product_name;
                })->unique();
            }

            // Get unique (lead_id, product) pairs from price_shareds for procurements
            $procurementPairs = collect(
                PriceShared::whereIn('lead_id', $procurementLeadIds)
                    ->get(['lead_id', 'product'])
                    ->map(function($item) {
                        return $item->lead_id . '||' . $item->product;
                    })
                    ->unique()
                    ->values()
            );

            // Get unique (lead_id, product) pairs from price_shareds for product_sourcing = 'no'
            $productSourcingNoPairs = collect(
                PriceShared::whereIn(DB::raw("CONCAT(lead_id, '||', product)"), $productSourcingNoLeadProduct)
                    ->get(['lead_id', 'product'])
                    ->map(function($item) {
                        return $item->lead_id . '||' . $item->product;
                    })
                    ->unique()
                    ->values()
            );

            // Merge both sets to get all price shared records that match Price_Shared logic
            $allPriceSharedPairs = $procurementPairs->merge($productSourcingNoPairs)->unique()->values();


            //Within TAT and TAT EXCEED COUNT
            // Get all unique (lead_id, product_name) pairs from product_sourcings
            if ($isSDE) {
                $sdeLeadIds = Lead::where('salesperson_id', $employee->id)->pluck('id');
                $productSourcings = DB::table('product_sourcings')
                    ->select('lead_id', 'product_name', 'created_at')
                    ->whereIn('lead_id', $latestQualifiedLeadIds)
                    ->whereIn('lead_id', $sdeLeadIds)
                    ->get();
            } else {
                $productSourcings = DB::table('product_sourcings')
                    ->select('lead_id', 'product_name', 'created_at')
                    ->whereIn('lead_id', $latestQualifiedLeadIds)
                    ->get();
            }

            $withinTatCount = 0;
            $tatExceededCount = 0;

            foreach ($productSourcings as $sourcing) {
                // Find the earliest price_shareds.created_at for this lead_id and product
                $earliestPriceShared = DB::table('price_shareds')
                    ->where('lead_id', $sourcing->lead_id)
                    ->where('product', $sourcing->product_name)
                    ->orderBy('created_at', 'asc')
                    ->first();

                if ($earliestPriceShared) {
                    $diffInDays = \Carbon\Carbon::parse($earliestPriceShared->created_at)
                        ->diffInDays(\Carbon\Carbon::parse($sourcing->created_at), false);

                    if ($diffInDays <= 2) {
                        $withinTatCount++;
                    } else {
                        $tatExceededCount++;
                    }
                }
            }





                                    //within TAT quotation send Within 3 days after sourcing
                $withinTatQuotationCount = 0;
                $tatExceededQuotationCount = 0;

                // Get unique lead_ids from price_shareds and their latest created_at, filtered by latestQualifiedLeadIds
                $priceShareds = \App\Models\PriceShared::select('lead_id', \DB::raw('MAX(created_at) as price_shared_at'))
                    ->whereIn('lead_id', $latestQualifiedLeadIds)
                    ->groupBy('lead_id')
                    ->get();

                foreach ($priceShareds as $ps) {
                    $leadId = $ps->lead_id;
                    $priceSharedAt = \Carbon\Carbon::parse($ps->price_shared_at);

                    // Find quotation_sent for this lead_id, filtered by latestQualifiedLeadIds
                    $quotationSent = \App\Models\QuotationSent::where('lead_id', $leadId)
                        ->whereIn('lead_id', $latestQualifiedLeadIds)
                        ->first();
                    if (!$quotationSent) continue;
                    $quotationId = $quotationSent->quotation_id;

                    // Find all quotation_products with pi_order_id = quotation_id
                    $quotationProducts = \App\Models\QuotationProduct::where('pi_order_id', $quotationId)->get();
                    foreach ($quotationProducts as $qp) {
                        $quotationProductAt = \Carbon\Carbon::parse($qp->created_at);
                        $diffInDays = $priceSharedAt->diffInDays($quotationProductAt, false);
                        if ($diffInDays <= 1 && $diffInDays >= 0) {
                            $withinTatQuotationCount++;
                        } elseif ($diffInDays > 1) {
                            $tatExceededQuotationCount++;
                        }
                    }
                }
            

    

        // Quotation_Send - Based on Price_Shared logic
       // Quotation_Send - Based on QuotationSent and QuotationProduct relationship
        // Get all quotation_ids from quotation_sents
        if ($isSDE) {
            $sdeLeadIds = Lead::where('salesperson_id', $employee->id)->pluck('id');
            $quotationIds = QuotationSent::whereIn('lead_id', $latestQualifiedLeadIds)
                ->whereIn('lead_id', $sdeLeadIds)
                ->pluck('quotation_id')->unique();
        } else {
            $quotationIds = QuotationSent::whereIn('lead_id', $latestQualifiedLeadIds)
                ->pluck('quotation_id')->unique();
        }

        // Count how many quotation_products have pi_order_id in those quotation_ids
        $Quotation_Send = QuotationProduct::whereIn('pi_order_id', $quotationIds)->count();

        // Count how many quotation_products do NOT have pi_order_id in those quotation_ids
        $Quotation_not_Send = QuotationProduct::whereNotIn('pi_order_id', $quotationIds)->count();

        $Quotation_Send_all = $isSDE
            ? Quotation::whereHas('lead', function($q) use ($employee) {
                $q->where('salesperson_id', $employee->id);
            })->count()
            : Quotation::count();


            $followUpTypes = [
                'Re-Engage the Lead',
                'Buyer is Thinking Internally',
                'Active Discussion & Objections',
                'Offer Under Final Review',
                'Ready to Close - Awaiting Payment',
            ];

            $follow_up_counts = [];

            // Get latest follow up per lead_id (any type), but only for leads in $latestQualifiedLeadIds
            $latestFollowUps = FollowUpDetail::query()
                ->whereIn('lead_id', $latestQualifiedLeadIds)
                ->when($isSDE, function ($query) use ($employee) {
                    $query->whereHas('lead', function ($q) use ($employee) {
                        $q->where('salesperson_id', $employee->id);
                    });
                })
                ->select('lead_id', DB::raw('MAX(created_at) as latest_created_at'))
                ->groupBy('lead_id')
                ->get();

            // Map: lead_id => latest_created_at
            $leadLatestMap = $latestFollowUps->pluck('latest_created_at', 'lead_id');

            // Get all follow ups for the relevant leads and types
            $allFollowUps = FollowUpDetail::query()
                ->whereIn('lead_id', $latestQualifiedLeadIds)
                ->whereIn('type', $followUpTypes)
                ->get(['lead_id', 'type', 'created_at']);

            // Filter to only the latest follow up per lead
            $latestTypeMap = $allFollowUps->filter(function ($item) use ($leadLatestMap) {
                return isset($leadLatestMap[$item->lead_id]) && $item->created_at == $leadLatestMap[$item->lead_id];
            });

            // Count how many leads have each type as their latest
            foreach ($followUpTypes as $type) {
                $follow_up_counts[$type] = $latestTypeMap->where('type', $type)->count();
            }
    
        // Victory Dashboard

        // Total Inquiry Received
        $total_inquiry_received = $isSDE
            ? InquiryReceive::with('lead')
            ->get()
            ->filter(function ($sourcing) use ($employee) {
                return $sourcing->lead && $sourcing->lead->salesperson_id === $employee->id && $sourcing->status === '0';
            })
            ->count()
            : InquiryReceive::count();

        // Lead Won
        // Lead Won
        $lead_won = $isSDE
            ? Victory::where('deal_won', '1')
                ->whereIn('lead_id', $latestQualifiedLeadIds)
                ->whereHas('lead', function($q) use ($employee) {
                    $q->where('salesperson_id', $employee->id);
                })
                ->count()
            : Victory::where('deal_won', '1')
                ->whereIn('lead_id', $latestQualifiedLeadIds)
                ->count();

            //key_opportunity
            // Lead Won
        $key_opportunity = $isSDE
            ? OpportunityDetail::where('key_opportunity', '1')
                ->whereHas('lead', function($q) use ($employee) {
                    $q->where('salesperson_id', $employee->id);
                })
                ->count()
            : OpportunityDetail::where('key_opportunity', '1')->count();

        // Total BT Created
        $bt_created = $isSDE
            ? BusinessTask::whereNotNull('opportunity_id')
                ->whereIn('opportunity_id', Lead::where('salesperson_id', $employee->id)
                    ->whereIn('id', $latestQualifiedLeadIds)
                    ->pluck('unique_query_id'))
                ->count()
            : BusinessTask::whereNotNull('opportunity_id')
                ->whereIn('opportunity_id', Lead::whereIn('id', $latestQualifiedLeadIds)
                    ->pluck('unique_query_id'))
                ->count();



        // Log final target cost summary
        \Log::info('=== FINAL TARGET COST SUMMARY ===');
        \Log::info("Under Target Cost: $UnderTargetCost");
        \Log::info("Target Cost Exceed: $TargetCostExceed");
        \Log::info("Target Cost Not Assigned: $TargetCostNotAssigned");
        \Log::info('=== END TARGET COST SUMMARY ===');

        return response()->json([
            'total_customers' => $totalCustomers,
            'customer_breakdown' => [
                'vip' => $vipCustomers,
                'genuine' => $genuineCustomers,
                'blacklisted' => $blacklistedCustomers,
                'remaining' => $remainingCustomers,
            ],
            'inquiries' => [
                'total' => $totalInquiries,
                'qualified_by_software' => $qualifiedBySoftware,
                'qualified_by_agent' =>  $agentQualified,
            ],
            'inquiry_received' => [
                'purvee' => $purveeLeads,
                'purvee_online_Leads' => $purvee_online_Leads,
                'purvee_offline_Leads' => $purvee_offline_Leads,
                'healthcare' => $healthcareLeads,
                'healthcare_online_Leads' => $healthcare_online_Leads,
                'healthcare_offline_Leads' => $healthcare_offline_Leads,

                'vortex' => $vortexLeads,
                'vortex_online_Leads' => $vortex_online_Leads,
                'vortex_offline_Leads' => $vortex_offline_Leads,

                'trade' => $tradeLeads,
                'chatbot' => $chatbotLeads,
                'manual' => $manualLeads,
            ],
            'lead_acknowledgment_software' => [
                'qualified' => $qualifiedBySoftware,
                'disqualified' => (clone $leadQuery)->where('disqualified', '1')->count(),
            ],
            'lead_acknowledgment_agent' => [
                'qualified' => $agentQualifiedList,
                'clarity_pending' => $agentClarityPendingList,
                'disqualified' => $agentDisqualifiedList,
                'qualified_by_software' => $qualifiedBySoftware,
            ],

            'Product_Sourcing_Tracker' => [
                'totalProduct_Sourcing' => $totalProduct,
                 'qualified_by_agent' =>  $agentQualified,
                // 'qualified_by_agent' => $qualifiedByAgent,
                'Sourcing_required' => $Sourcing_required,
                'Sourcing_not_required' => $Sourcing_not_required,
            ],

         
            'Assigned vs Unassigned Sourcing' =>
            [
                'assigned' => $assigned ,
                'not_assigned' => $not_assigned,
                'sourcing_required' => $Sourcing_required,
            ],

            'Product Sourcing Done or not done' =>
            [
                'assigned' => $assigned ,
                'sourcing_done' => $sourcing_done,
                'sourcing_not_done' => $sourcing_not_done,
            ],


            'Sourcing Performance Status Tracker-TAT Wise' =>
            [
                'product_sourcing_done' => $sourcing_done,
                'procurement_done' => $procurement_done,
                'under_tat' => $under_tat,
                'tat_expired' => $tat_expired,
                'under_target_cost' => $underTargetCostProducts,
                'target_cost_not_assigned' => $notAssignedTargetCostProducts,
                'exceed_target_cost' => $exceedTargetCostProducts,
                'under_target_cost_tat_expired' => $underTargetCostProducts_tat_expired,
                'not_assigned_target_cost_tat_expired' => $notAssignedTargetCostProducts_tat_expired,
                'exceed_target_cost_tat_expired' => $exceedTargetCostProducts_tat_expired
            ],

            'Sourcing Performance Status Tracker - Target Cost Wise' =>
            [
                'product_sourcing_done' => $sourcing_done,
                'procurement_done' => $procurement_done,
                'procurement_not_done' => $procurement_not_done,
                'procurement_products_count' => ProcurementProducts::whereIn('procurement_id', Procurement::whereNotNull('lead_id')->whereIn('lead_id', $latestQualifiedLeadIds)->pluck('id'))->count(),
                'procurement_vendors_count' => ProcurementVendor::whereIn(
                    'procurement_id',
                    Procurement::whereNotNull('lead_id')
                        ->whereIn('lead_id', $latestQualifiedLeadIds)
                        ->pluck('id')
                )->count(),
                'under_target_cost_products' => $UnderTargetCost,
                'target_cost_not_assigned_products' => $TargetCostNotAssigned,
                'exceed_target_cost_products' => $TargetCostExceed,
                // 'under_target_cost' => [
                //     'under_tat' => $targetCostTatStats['under_target_cost']['under_tat'],
                //     'tat_expired' => $targetCostTatStats['under_target_cost']['tat_expired']
                // ],
                // 'not_assigned_target_cost' => [
                //     'under_tat' => $targetCostTatStats['not_assigned_target_cost']['under_tat'],
                //     'tat_expired' => $targetCostTatStats['not_assigned_target_cost']['tat_expired']
                // ],
                // 'exceed_target_cost' => [
                //     'under_tat' => $targetCostTatStats['exceed_target_cost']['under_tat'],
                //     'tat_expired' => $targetCostTatStats['exceed_target_cost']['tat_expired']
                // ]
            ],

            'Ready To Share Price (Within 2 days after sourcing)' =>
            [
                'Product_sourcing_Assigned' => $assigned,
                'Price Shared' => $Price_Shared,
                'Price Not Shared' => $Price_Not_Shared,
                'Ready to share Price' =>  $readyToShare,

            ],
            'TAT Analysis For Price Shared' =>
            [
                'Price Shared' => $Price_Shared,
                'within_tat_count' => $withinTatCount,
                'tat_exceeded_count' => $tatExceededCount,
            ],

            'Quotation Send Dashboard' =>
            [
                // 'ready_to_share_quotation' =>$readyToShareQuotation,
                'ready_to_share_quotation' => $Price_Shared,
                'Quotation_Send' => $Quotation_Send,
                'Quotation_Send_all' => $Quotation_Send_all,
                'Quotation_not_Send' => $Quotation_not_Send,
                'within_tat_count' => $withinTatQuotationCount,
                'tat_exceeded_count' => $tatExceededQuotationCount,
            ],

             'Follow Up Tracker Charts' =>
            [
                'agent_qualified_lead' => $qualifiedByAgent,
                'price_shared' => $Price_Shared,
                'quotation_send' => $Quotation_Send,
                'key_opportunity' => $key_opportunity,
                'pre_qualified_opportunity'=>$qualifiedBySoftware,
                'qualified_opportunity'=>$qualifiedByAgent,
                'ready_to_share_quotation' =>$readyToShare,
                'sourcing_done' => $product_sourcing_done,
            ],

            'Follow Up Tracker' =>
            [
                'follow_up_count' => $follow_up_counts,
            ],

            'Opportunity Tracker' =>
            [
                'Total Qualified Inquiries By Software' => $qualifiedBySoftware,
                'Total Qualified Inquiries by Agent' =>  $agentQualified,
                'Total Sourcing Done' =>  $sourcing_done,
                'Ready to share Price' =>  $readyToShare,
                'Total Price Shared' =>  $Price_Shared,
                'Total Quotation Shared' => $Quotation_Send,
                // 'Total price and Quotation Send' =>
                'Deal Won' =>  $lead_won,
                //  'BT Created' =>  $lead_won,
                 'BT Created' =>  $bt_created,
            ],

            'Victory' =>
            [
                'Total Inquiry Received' => $totalInquiries,
                'Lead Won' => $lead_won,

            ]

        ]);
    }


/***********************************************************************************************/
   
public function getTeamDashboard(Request $request)
    {
        $user = Auth::user();
        if (!$user) {
            return response()->json(['message' => 'Unauthorized'], 401);
        }

        $employee = Employee::with('role')->where('user_id', $user->id)->first();

        if (!$employee) {
            return response()->json(['message' => 'Employee not found'], 404);
        }

        // Date filter logic
        $startDate = $request->query('start_date');
        $endDate = $request->query('end_date');
        if ($startDate && $endDate) {
            $start = Carbon::parse($startDate)->startOfDay();
            $end = Carbon::parse($endDate)->endOfDay();
        } else {
            $start = null;
            $end = null;
        }

        // Get team members who are directly under the current employee (is_under_id)
        // and have role_id 2 (SDE-Manager) or 3 (SDE), and have is_click_up_on = 1
        $teamMembers = Employee::where('is_under_id', $employee->id)
            ->whereIn('role_id', [2, 3]) // 2 for SDE-Manager, 3 for SDE
            ->where('is_click_up_on', 1)
            ->get();
        $teamMemberIds = $teamMembers->pluck('id');

        // For all queries below, add date filtering if $start and $end are set
        // Example for Lead:
        $leadQuery = Lead::query();
        if ($start && $end) {
            $leadQuery->whereBetween('created_at', [$start, $end]);
        }
        $leadQuery->whereIn('salesperson_id', $teamMemberIds);

        // Overall counts
        $totalCustomers = Lead_customer::whereIn('id', function ($query) use ($teamMemberIds) {
            $query->select('customer_id')
                ->from('leads')
                ->whereIn('salesperson_id', $teamMemberIds)
                ->whereNotNull('customer_id');
        })->distinct()->count();

        // Calculate overall opportunity tracker stats
        $overallOpportunityTracker = [
            'total_qualified_inquiries_by_software' => Lead::whereIn('salesperson_id', $teamMemberIds)
                ->where('qualified', '1')
                ->count(),
            'total_qualified_inquiries_by_agent' => LeadAcknowledgment::whereHas('lead', function($q) use ($teamMemberIds) {
                $q->whereIn('salesperson_id', $teamMemberIds);
            })->whereNotNull('qualified')->distinct('lead_id')->count('lead_id'),
            'total_sourcing_done' => Procurement::whereHas('lead', function($q) use ($teamMemberIds) {
                $q->whereIn('salesperson_id', $teamMemberIds);
            })->where('status', 'Complete')->count(),
            'ready_to_share_price' => PriceShared::whereHas('lead', function($q) use ($teamMemberIds) {
                $q->whereIn('salesperson_id', $teamMemberIds);
            })->count(),
            'total_price_shared' => PriceShared::whereHas('lead', function($q) use ($teamMemberIds) {
                $q->whereIn('salesperson_id', $teamMemberIds);
            })->count(),
            'total_quotation_shared' => Quotation::whereIn('lead_id', function($query) use ($teamMemberIds) {
                $query->select('id')
                    ->from('leads')
                    ->whereIn('salesperson_id', $teamMemberIds);
            })->count(),
            'deal_won' => Victory::whereHas('lead', function($q) use ($teamMemberIds) {
                $q->whereIn('salesperson_id', $teamMemberIds);
            })->where('deal_won', '1')->count(),
            'bt_created' => BusinessTask::whereIn('opportunity_id', function($query) use ($teamMemberIds) {
                $query->select('unique_query_id')
                    ->from('leads')
                    ->whereIn('salesperson_id', $teamMemberIds);
            })->count()
        ];

        // Calculate overall victory stats
        $overallVictoryStats = [
            'total_inquiries' => InquiryReceive::whereHas('lead', function($q) use ($teamMemberIds) {
                $q->whereIn('salesperson_id', $teamMemberIds);
            })->count(),
            'deals_won' => Victory::whereHas('lead', function($q) use ($teamMemberIds) {
                $q->whereIn('salesperson_id', $teamMemberIds);
            })->where('deal_won', '1')->count()
        ];

        $employeeStats = [];
        $platforms = ['Purvee', 'Inorbvict', 'Vortex', 'TradeIndia', 'Chatbot','Manual'];

        foreach ($teamMembers as $member) {
            $platformStats = [];
            
            foreach ($platforms as $platform) {
                if ($platform === 'Manual') {
                    $platformStats[$platform] = [
                        'total_inquiries' => Lead::where('salesperson_id', $member->id)
                            ->where('query_type', 'Manual')
                            ->count()
                    ];
                } else {
                    $baseQuery = Lead::where('salesperson_id', $member->id)
                                   ->where('platform', $platform);

                    $platformStats[$platform] = [
                        'total_inquiries' => (clone $baseQuery)->count(),
                        'software_qualified' => (clone $baseQuery)->where('qualified', '1')->count(),
                        'agent_qualified' => (clone $baseQuery)->where('qualified', '1')
                                                     ->where('is_agent_qualified_lead', '1')
                                                     ->count(),
                        'online_inquiries' => (clone $baseQuery)->whereIn('query_type', ['W', 'P'])->count(),
                        'offline_inquiries' => (clone $baseQuery)->whereIn('query_type', ['BIZ', 'B'])->count()
                    ];
                }
            }

            // Get the latest follow up per lead_id for the specified types, using MAX(created_at) logic
            $latestFollowUpsforCharts = FollowUpDetail::whereHas('lead', function($q) use ($member) {
                $q->where('salesperson_id', $member->id);
            })
            ->whereIn('type', [
                'Re-Engage the Lead',
                'Active Discussion & Objections',
                'Buyer is Thinking Internally'
            ])
            ->select('lead_id', 'type', 'created_at')
            ->whereIn('created_at', function($query) use ($member) {
                $query->selectRaw('MAX(created_at)')
                    ->from('follow_up_details as fud2')
                    ->whereColumn('fud2.lead_id', 'follow_up_details.lead_id')
                    ->whereIn('fud2.type', [
                        'Re-Engage the Lead',
                        'Active Discussion & Objections',
                        'Buyer is Thinking Internally'
                    ])
                    // Instead of whereHas, join with leads and filter by salesperson_id
                    ->whereExists(function($sub) use ($member) {
                        $sub->select(DB::raw(1))
                            ->from('leads')
                            ->whereColumn('leads.id', 'fud2.lead_id')
                            ->where('leads.salesperson_id', $member->id);
                    });
            })
            ->get()
            ->keyBy('lead_id');

         
         
                        $stats = [
                'employee_name' => $member->name,
                'employee_id' => $member->id,
                'total_customers' => Lead_customer::whereIn('id', function ($query) use ($member) {
                    $query->select('customer_id')
                        ->from('leads')
                        ->where('salesperson_id', $member->id)
                        ->whereNotNull('customer_id');
                })->distinct()->count(),
                'total_inquiries' => Lead::where('salesperson_id', $member->id)->count(),
                'total_software_qualified' => Lead::where('salesperson_id', $member->id)
                    ->where('qualified', '1')
                    ->count(),
                // 'total_agent_qualified' => Lead::where('salesperson_id', $member->id)
                //     ->where('qualified', '1')
                //     ->where('is_agent_qualified_lead', '1')
                //     ->count(),
                //   'total_agent_qualified' => LeadAcknowledgment::whereHas('lead', function($q) use ($member) {
                //     $q->where('salesperson_id', $member->id);
                // })->whereNotNull('qualified')->count(),
                   'total_agent_qualified' => LeadAcknowledgment::whereHas('lead', function($q) use ($member) {
                    $q->where('salesperson_id', $member->id);
                })->whereNotNull('qualified')->distinct('lead_id')->count('lead_id'),
                'platform_wise_stats' => $platformStats,
                'sourcing_stats' => [
                    'total_product_sourcing' => InquiryReceive::whereHas('lead', function($q) use ($member) {
                        $q->where('salesperson_id', $member->id);
                    })->count(),
                    'sourcing_required' => ProductSourcing::whereHas('lead', function($q) use ($member) {
                        $q->where('salesperson_id', $member->id);
                    })->where('product_sourcing', 'yes')->count(),
                     'sourcing_not_required' => ProductSourcing::whereHas('lead', function($q) use ($member) {
                        $q->where('salesperson_id', $member->id);
                    })->where('product_sourcing', 'no')->count(),
                    'sourcing_done' => Procurement::whereHas('lead', function($q) use ($member) {
                        $q->where('salesperson_id', $member->id);
                    })->where('status', 'Complete')->count(),
                      'sourcing_not_done' => Procurement::whereHas('lead', function($q) use ($member) {
                        $q->where('salesperson_id', $member->id);
                    })->where('status', 'In Progress')->count()
                ],
                'price_shared' => PriceShared::whereHas('lead', function($q) use ($member) {
                    $q->where('salesperson_id', $member->id);
                })->count(),
                'customer_status_stats' => [
                    'vip_customers' => Lead_customer::whereIn('id', function ($query) use ($member) {
                    $query->select('customer_id')
                        ->from('leads')
                        ->where('salesperson_id', $member->id)
                        ->whereNotNull('customer_id');
                    })->where('customer_status', 'VIP')->distinct()->count(),
                'genuine_customers' => Lead_customer::whereIn('id', function ($query) use ($member) {
                    $query->select('customer_id')
                        ->from('leads') 
                        ->where('salesperson_id', $member->id)
                        ->whereNotNull('customer_id');
                    })->where('customer_status', 'genuine')->distinct()->count(),
                'blacklisted_customers' => Lead_customer::whereIn('id', function ($query) use ($member) {
                    $query->select('customer_id')
                        ->from('leads')
                        ->where('salesperson_id', $member->id) 
                        ->whereNotNull('customer_id');
                    })->where('customer_status', 'blacklist')->distinct()->count(),
                'remaining_customers' => Lead_customer::whereIn('id', function ($query) use ($member) {
                    $query->select('customer_id')
                        ->from('leads')
                        ->where('salesperson_id', $member->id) 
                        ->whereNotNull('customer_id');
                    })->whereNull('customer_status')->distinct()->count()
                ],  
                 'lead_ack_bySoftware_stats' => [
                    'software_qualified_leads' => Lead::where('salesperson_id', $member->id)
                    ->where('qualified', '1')
                    ->count(),
                'software_disqualified_leads' => Lead::where('salesperson_id', $member->id)
                    ->where('disqualified', '1')
                    ->count(),
                ],  
                 'lead_ack_byAgent_stats' => [
                    // 'qualified' => LeadAcknowledgment::whereIn('customer_id', function ($query) use ($member) {
                    // $query->select('customer_id')
                    //     ->from('leads')
                    //     ->where('salesperson_id', $member->id)
                    //     ->whereNotNull('customer_id');
                    // })-> whereNotNull('qualified')->count(),
                              'qualified' => LeadAcknowledgment::whereHas('lead', function($q) use ($member) {
                    $q->where('salesperson_id', $member->id);
                })
                ->select('lead_acknowledgments.*')
                ->join(DB::raw('(SELECT lead_id, MAX(created_at) as max_created FROM lead_acknowledgments GROUP BY lead_id) as latest'), function($join) {
                    $join->on('lead_acknowledgments.lead_id', '=', 'latest.lead_id')
                         ->on('lead_acknowledgments.created_at', '=', 'latest.max_created');
                })
                ->whereNotNull('qualified')
                ->count(),

                'disqualified' => LeadAcknowledgment::whereHas('lead', function($q) use ($member) {
                    $q->where('salesperson_id', $member->id);
                })
                ->select('lead_acknowledgments.*')
                ->join(DB::raw('(SELECT lead_id, MAX(created_at) as max_created FROM lead_acknowledgments GROUP BY lead_id) as latest'), function($join) {
                    $join->on('lead_acknowledgments.lead_id', '=', 'latest.lead_id')
                         ->on('lead_acknowledgments.created_at', '=', 'latest.max_created');
                })
                ->whereNotNull('disqualified')
                ->count(),

                'clarity_pending' => LeadAcknowledgment::whereHas('lead', function($q) use ($member) {
                    $q->where('salesperson_id', $member->id);
                })
                ->select('lead_acknowledgments.*')
                ->join(DB::raw('(SELECT lead_id, MAX(created_at) as max_created FROM lead_acknowledgments GROUP BY lead_id) as latest'), function($join) {
                    $join->on('lead_acknowledgments.lead_id', '=', 'latest.lead_id')
                         ->on('lead_acknowledgments.created_at', '=', 'latest.max_created');
                })
                ->whereNotNull('clarity_pending')
                ->count(),
                ],
                'follow_up_tracker' => [
                    'follow_up_count' => FollowUpDetail::whereHas('lead', function($q) use ($member) {
                        $q->where('salesperson_id', $member->id);
                    })->count()
                ],
                'follow_up_tracker_charts' => [
                    'key_opportunity' => OpportunityDetail::whereIn('lead_id', function($query) use ($member) {
                        $query->select('id')
                            ->from('leads')
                            ->where('salesperson_id', $member->id);
                    })->where('key_opportunity', '1')->count(),
                    'pre_qualified_opportunity' => Lead::where('salesperson_id', $member->id)
                        ->where('qualified', '1')
                        ->count(),
                    'qualified_opportunity' => LeadAcknowledgment::whereHas('lead', function($q) use ($member) {
                        $q->where('salesperson_id', $member->id);
                    })->whereNotNull('qualified')->distinct('lead_id')->count('lead_id'),
                    're_engage_lead' => $latestFollowUpsforCharts->where('type', 'Re-Engage the Lead')->count(),
                    'active_discussion' => $latestFollowUpsforCharts->where('type', 'Active Discussion & Objections')->count(),
                    'in_progress_buyer' => $latestFollowUpsforCharts->where('type', 'Buyer is Thinking Internally')->count(),
                ],
                'ready_to_share_price' => [
                    'product_sourcing_assigned' => Procurement::whereHas('lead', function($q) use ($member) {
                        $q->where('salesperson_id', $member->id);
                    })->whereNotNull('assignee_name')->count(),
                    'price_shared' => PriceShared::whereHas('lead', function($q) use ($member) {
                        $q->where('salesperson_id', $member->id);
                    })
                    ->select('lead_id', DB::raw('MAX(created_at) as latest_created_at'))
                    ->groupBy('lead_id')
                    ->get()
                    ->count(),
                    'price_not_shared' => Procurement::whereHas('lead', function($q) use ($member) {
                        $q->where('salesperson_id', $member->id);
                    })->where('status', 'Complete')
                    ->whereNotNull('completion_date')
                    ->whereNotIn('lead_id', PriceShared::pluck('lead_id'))
                    ->count()
                ],
                'sourcing_performance_tat' => [
                    'product_sourcing_done' => Procurement::whereHas('lead', function($q) use ($member) {
                        $q->where('salesperson_id', $member->id);
                    })->where('status', 'Complete')->count(),
                    'under_tat' => Procurement::whereHas('lead', function($q) use ($member) {
                        $q->where('salesperson_id', $member->id);
                    })->where('status', 'Complete')
                    ->whereRaw('TIMESTAMPDIFF(HOUR, created_at, completion_date) <= 24')
                    ->count(),
                    'tat_expired' => Procurement::whereHas('lead', function($q) use ($member) {
                        $q->where('salesperson_id', $member->id);
                    })->where('status', 'Complete')
                    ->whereRaw('TIMESTAMPDIFF(HOUR, created_at, completion_date) > 24')
                    ->count()
                ],
                'sourcing_performance_target_cost' => [
                    'under_target_cost' => [
                        'under_tat' => Procurement::whereHas('lead', function($q) use ($member) {
                            $q->where('salesperson_id', $member->id);
                        })->where('status', 'Complete')
                        ->where('target_cost', '<=', 'actual_cost')
                        ->whereRaw('TIMESTAMPDIFF(HOUR, created_at, completion_date) <= 24')
                        ->count(),
                        'tat_expired' => Procurement::whereHas('lead', function($q) use ($member) {
                            $q->where('salesperson_id', $member->id);
                        })->where('status', 'Complete')
                        ->where('target_cost', '<=', 'actual_cost')
                        ->whereRaw('TIMESTAMPDIFF(HOUR, created_at, completion_date) > 24')
                        ->count()
                    ],
                    'not_assigned_target_cost' => [
                        'under_tat' => Procurement::whereHas('lead', function($q) use ($member) {
                            $q->where('salesperson_id', $member->id);
                        })->where('status', 'Complete')
                        ->whereNull('target_cost')
                        ->whereRaw('TIMESTAMPDIFF(HOUR, created_at, completion_date) <= 24')
                        ->count(),
                        'tat_expired' => Procurement::whereHas('lead', function($q) use ($member) {
                            $q->where('salesperson_id', $member->id);
                        })->where('status', 'Complete')
                        ->whereNull('target_cost')
                        ->whereRaw('TIMESTAMPDIFF(HOUR, created_at, completion_date) > 24')
                        ->count()
                    ],
                    'exceed_target_cost' => [
                        'under_tat' => Procurement::whereHas('lead', function($q) use ($member) {
                            $q->where('salesperson_id', $member->id);
                        })->where('status', 'Complete')
                        ->where('target_cost', '>', 'actual_cost')
                        ->whereRaw('TIMESTAMPDIFF(HOUR, created_at, completion_date) <= 24')
                        ->count(),
                        'tat_expired' => Procurement::whereHas('lead', function($q) use ($member) {
                            $q->where('salesperson_id', $member->id);
                        })->where('status', 'Complete')
                        ->where('target_cost', '>', 'actual_cost')
                        ->whereRaw('TIMESTAMPDIFF(HOUR, created_at, completion_date) > 24')
                        ->count()
                    ]
                ],
                'tat_analysis_price_shared' => [
                    'price_shared' => PriceShared::whereHas('lead', function($q) use ($member) {
                        $q->where('salesperson_id', $member->id);
                    })->count(),
                    'within_tat_count' => PriceShared::whereHas('lead', function($q) use ($member) {
                        $q->where('salesperson_id', $member->id);
                    })->whereRaw('TIMESTAMPDIFF(HOUR, created_at, updated_at) <= 48')
                    ->count(),
                    'tat_exceeded_count' => PriceShared::whereHas('lead', function($q) use ($member) {
                        $q->where('salesperson_id', $member->id);
                    })->whereRaw('TIMESTAMPDIFF(HOUR, created_at, updated_at) > 48')
                    ->count()
                ],
                'quotation_send_dashboard' => [
                    'quotation_send' => QuotationSent::whereIn('lead_id', function($query) use ($member) {
                        $query->select('id')
                            ->from('leads')
                            ->where('salesperson_id', $member->id);
                    })->count(),
                    'quotation_not_send' => Procurement::whereHas('lead', function($q) use ($member) {
                        $q->where('salesperson_id', $member->id);
                    })->where('status', 'Complete')
                    ->whereNotNull('completion_date')
                    ->whereNotIn('lead_id', QuotationSent::pluck('lead_id'))
                    ->count(),
                    'within_tat_count' => Quotation::whereIn('lead_id', function($query) use ($member) {
                        $query->select('id')
                            ->from('leads')
                            ->where('salesperson_id', $member->id);
                    })->whereRaw('TIMESTAMPDIFF(HOUR, created_at, updated_at) <= 72')
                    ->count(),
                    'tat_exceeded_count' => Quotation::whereIn('lead_id', function($query) use ($member) {
                        $query->select('id')
                            ->from('leads')
                            ->where('salesperson_id', $member->id);
                    })->whereRaw('TIMESTAMPDIFF(HOUR, created_at, updated_at) > 72')
                    ->count()
                ]
            ];

            $employeeStats[] = $stats;
        }

        

                    

        // Get follow-up dashboard counts for the team
        // Get the latest follow up per lead_id (any type)
        $latestFollowUps = FollowUpDetail::select('lead_id', DB::raw('MAX(created_at) as latest_created_at'))
            ->groupBy('lead_id')
            ->get();

        // Map: lead_id => latest_created_at
        $leadLatestMap = $latestFollowUps->pluck('latest_created_at', 'lead_id');

        // Get all follow ups for the relevant leads and types
        $allFollowUps = FollowUpDetail::whereIn('lead_id', $leadLatestMap->keys())
            ->whereIn('type', [
            'Re-Engage the Lead',
            'In Progress from Buyer Side',
            'Negotiation',
            'Contract Sent',
            'Payment Pending'
            ])
            ->get(['lead_id', 'type', 'created_at']);

        // Filter to only the latest follow up per lead
        $latestTypeMap = $allFollowUps->filter(function ($item) use ($leadLatestMap) {
            return isset($leadLatestMap[$item->lead_id]) && $item->created_at == $leadLatestMap[$item->lead_id];
        });

        // Count how many leads have each type as their latest
        $followUpTypes = [
            'Re-Engage the Lead',
            'In Progress from Buyer Side',
            'Negotiation',
            'Contract Sent',
            'Payment Pending'
        ];

        $followUpDashboard = [];
        foreach ($followUpTypes as $type) {
            $followUpDashboard[$type] = $latestTypeMap->where('type', $type)->count();
        }

        return response()->json([
            'overall_stats' => [
                'total_customers' => $totalCustomers,
                'total_inquiries' => Lead::whereIn('salesperson_id', $teamMemberIds)->count(),
                'total_software_qualified' => Lead::whereIn('salesperson_id', $teamMemberIds)
                    ->where('qualified', '1')
                    ->count(),
                // 'total_agent_qualified' => Lead::whereIn('salesperson_id', $teamMemberIds)
                //     ->where('qualified', '1')
                //     ->where('is_agent_qualified_lead', '1')
                //     ->count()
            //     'total_agent_qualified' => LeadAcknowledgment::whereHas('lead', function($q) use ($teamMemberIds) {
            //     $q->whereIn('salesperson_id', $teamMemberIds);
            // })->whereNotNull('qualified')->count(),
            'total_agent_qualified' => LeadAcknowledgment::whereHas('lead', function($q) use ($teamMemberIds) {
                $q->whereIn('salesperson_id', $teamMemberIds);
            })->whereNotNull('qualified')->distinct('lead_id')->count('lead_id'),
               
            ],
            'opportunity_tracker' => $overallOpportunityTracker,
            'victory_stats' => $overallVictoryStats,
            'employee_stats' => $employeeStats,
            'follow_up_dashboard' => $followUpDashboard
        ]);
    }

    public function getSalesFunnelCount(Request $request)
    {
        try {
            $user = Auth::user();
            if (!$user) {
                Log::error('Unauthorized access attempt in getSalesFunnelCount');
                return response()->json(['message' => 'Unauthorized'], 401);
            }

            $employee = Employee::with('role')->where('user_id', $user->id)->first();

            if (!$employee) {
                Log::error('Employee not found for user_id: ' . $user->id);
                return response()->json(['message' => 'Employee not found'], 404);
            }

            $isSDE = optional($employee->role)->name === 'SDE';

            // Date filter logic
            $startDate = $request->query('start_date');
            $endDate = $request->query('end_date');
            if ($startDate && $endDate) {
                $start = Carbon::parse($startDate)->startOfDay();
                $end = Carbon::parse($endDate)->endOfDay();
            } else {
                $start = null;
                $end = null;
            }

            // Helper for date filtering
            $dateFilter = function ($query, $column = 'created_at') use ($start, $end) {
                if ($start && $end) {
                    $query->whereBetween($column, [$start, $end]);
                }
                return $query;
            };

            // 1. Inquiry Received (InquiryReceive)
            $inquiryReceivedQuery = InquiryReceive::query();
            $dateFilter($inquiryReceivedQuery, 'created_at');
            if ($isSDE) {
                $inquiryReceivedQuery->whereHas('lead', function ($q) use ($employee) {
                    $q->where('salesperson_id', $employee->id);
                });
            }
            $inquiryReceived = $inquiryReceivedQuery->distinct('lead_id')->count('lead_id');

            // 2. Lead Acknowledgment (LeadAcknowledgment)
            $leadAcknowledgedQuery = LeadAcknowledgment::query();
            $dateFilter($leadAcknowledgedQuery, 'created_at');
            if ($isSDE) {
                $leadAcknowledgedQuery->whereHas('lead', function($q) use ($employee) {
                    $q->where('salesperson_id', $employee->id);
                });
            }
            $leadAcknowledged = $leadAcknowledgedQuery->distinct('lead_id')->count('lead_id');

            // 3. Product Sourcing (ProductSourcing)
            $productSourcingQuery = ProductSourcing::query();
            $dateFilter($productSourcingQuery, 'created_at');
            if ($isSDE) {
                $productSourcingQuery->whereHas('lead', function($q) use ($employee) {
                    $q->where('salesperson_id', $employee->id);
                });
            }
            $productSourcing = $productSourcingQuery->distinct('lead_id')->count('lead_id');

            // 4. Price Shared (PriceShared)
            $priceSharedQuery = PriceShared::query();
            $dateFilter($priceSharedQuery, 'created_at');
            if ($isSDE) {
                $priceSharedQuery->whereHas('lead', function($q) use ($employee) {
                    $q->where('salesperson_id', $employee->id);
                });
            }
            $priceShared = $priceSharedQuery->distinct('lead_id')->count('lead_id');

            // 5. Quotation Sent (QuotationSent)
            $quotationSentQuery = QuotationSent::query();
            $dateFilter($quotationSentQuery, 'created_at');
            if ($isSDE) {
                $quotationSentQuery->whereHas('lead', function($q) use ($employee) {
                    $q->where('salesperson_id', $employee->id);
                });
            }
            $quotationSent = $quotationSentQuery->distinct('lead_id')->count('lead_id');

            // 6. Follow Up (FollowUpDetail)
            $followUpsQuery = FollowUpDetail::query();
            $dateFilter($followUpsQuery, 'created_at');
            if ($isSDE) {
                $followUpsQuery->whereHas('lead', function($q) use ($employee) {
                    $q->where('salesperson_id', $employee->id);
                });
            }
            $followUps = $followUpsQuery->distinct('lead_id')->count('lead_id');

            // 7. Victory Stage (Victory)
            $victoryStageQuery = Victory::where('deal_won', '1');
            $dateFilter($victoryStageQuery, 'created_at');
            if ($isSDE) {
                $victoryStageQuery->whereHas('lead', function($q) use ($employee) {
                    $q->where('salesperson_id', $employee->id);
                });
            }
            $victoryStage = $victoryStageQuery->distinct('lead_id')->count('lead_id');

            $data = [
                'inquiry_received' => $inquiryReceived,
                'lead_acknowledgment' => $leadAcknowledged, 
                'product_sourcing' => $productSourcing,
                'price_shared' => $priceShared,
                'quotation_sent' => $quotationSent,
                'follow_up' => $followUps,
                'victory_stage' => $victoryStage
            ];

            Log::info('Sales funnel data retrieved successfully for employee_id: ' . $employee->id, $data);

            return  response()->json([
                'sales_funnel' => $data
            ]);

        } catch (\Exception $e) {
            Log::error('Error in getSalesFunnelCount: ' . $e->getMessage());
            return response()->json([
                'message' => 'An error occurred while fetching sales funnel data',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function getOpportunityId(Request $request)
    {
        $request->validate([
            'sender_name' => 'required|string'
        ]);

        $opportunities = Lead::where('sender_name', $request->sender_name)->get();

        if ($opportunities->isEmpty()) {
            return response()->json(['message' => 'No opportunities found for this sender name'], 404);
        }

        $opportunityData = $opportunities->map(function ($opportunity) {
            return [
                'opportunity_id' => $opportunity->unique_query_id,
                'lead_id' => $opportunity->id,
                'customer_id' => $opportunity->customer_id,
                'sender_name' => $opportunity->sender_name
            ];
        });

        return response()->json([
            'opportunities' => $opportunityData,
            'total_count' => $opportunities->count()
        ]);
    }

     public function getProductsAgainstOpportunityId(Request $request)
    {
        $request->validate([
            'opportunity_id' => 'required|string'
        ]);

        // Step 1: Find the lead by opportunity_id
        $lead = Lead::where('unique_query_id', $request->opportunity_id)->first();

        if (!$lead) {
            return response()->json(['message' => 'No lead found for this opportunity id'], 404);
        }

        // Step 2: Get all products from inquiry_receives for this lead_id
        $products = InquiryReceive::where('lead_id', $lead->id)
            ->pluck('product')
            ->unique()
            ->values();

        return response()->json([
            'lead_id' => $lead->id,
            'products' => $products
        ]);
    }


    public function getOpportunityDetails(Request $request)
    {
        $request->validate([
            // 'customer_id' => 'required|integer',
            // 'lead_id' => 'required|integer', 
            'opportunity_id' => 'required|string'
        ]);

        $lead = Lead::with([
            'inquiryReceive',
            'leadAcknowledgment',
            'productSourcing',
            'priceShared',
            'quotation',
            'followUpDetail',
            'victory'
        ])
        // ->where('id', $request->lead_id)
        // ->where('customer_id', $request->customer_id)
        ->where('unique_query_id', $request->opportunity_id)
        ->first();

        if (!$lead) {
            return response()->json(['message' => 'No lead found with these details'], 404);
        }

        return response()->json([
            'lead_id' => $lead->id,
            'customer_id' => $lead->customer_id,
            'opportunity_id' => $lead->unique_query_id,
            'inquiry_received_date' => $lead->created_at,
            'lead_acknowledgment_date' => optional($lead->leadAcknowledgment)->created_at,
            'product_sourcing_date' => optional($lead->productSourcing)->created_at,
            'price_shared_date' => optional($lead->priceShared)->created_at,
            'quotation_sent_date' => optional($lead->quotation)->created_at,
            'followup_date' => optional($lead->followUpDetail)->created_at,
            'victory_stage_date' => optional($lead->victory)->created_at
        ]);
    }


    public function getOpportunityDetailsByProduct(Request $request)
    {
        $request->validate([
            'opportunity_id' => 'required|string',
            'product' => 'required|string'
        ]);

        $lead = Lead::where('unique_query_id', $request->opportunity_id)->first();

        if (!$lead) {
            return response()->json(['message' => 'No lead found with these details'], 404);
        }

        $lead_id = $lead->id;
        $product = $request->product;

        // Get the inquiry receive for this lead and product
        $inquiryReceive = InquiryReceive::where('lead_id', $lead_id)
            ->where('product', $product)
            ->orderBy('created_at', 'asc')
            ->first();

        // Get the lead acknowledgment for this lead only (no product filter)
        $leadAcknowledgment = LeadAcknowledgment::where('lead_id', $lead_id)
            ->orderBy('created_at', 'asc')
            ->first();

        // Get the product sourcing for this lead and product
        $productSourcing = ProductSourcing::where('lead_id', $lead_id)
            ->where('product_name', $product)
            ->orderBy('created_at', 'asc')
            ->first();

        // Get the price shared for this lead and product
        $priceShared = PriceShared::where('lead_id', $lead_id)
            ->where('product', $product)
            ->orderBy('created_at', 'asc')
            ->first();

        // Get the quotation sent for this lead only (no product filter)
        $quotationSent = QuotationSent::where('lead_id', $lead_id)
            ->orderBy('created_at', 'asc')
            ->first();

        // Get the quotation product for this quotation (if exists and matches product)
        $quotationProduct = null;
        if ($quotationSent) {
            $quotationProduct = QuotationProduct::where('pi_order_id', $quotationSent->quotation_id)
                ->where('product_name', $product)
                ->orderBy('created_at', 'asc')
                ->first();
        }

        // Get the follow up detail for this lead only (no product filter)
        $followUpDetail = FollowUpDetail::where('lead_id', $lead_id)
            ->orderBy('created_at', 'asc')
            ->first();

        // Get the victory for this lead only (no product filter)
        $victory = Victory::where('lead_id', $lead_id)
            ->orderBy('created_at', 'asc')
            ->first();

        return response()->json([
            'lead_id' => $lead_id,
            'customer_id' => $lead->customer_id,
            'opportunity_id' => $lead->unique_query_id,
            'product' => $product,
            'inquiry_received_date' => optional($inquiryReceive)->created_at,
            'lead_acknowledgment_date' => optional($leadAcknowledgment)->created_at,
            'product_sourcing_date' => optional($productSourcing)->created_at,
            'price_shared_date' => optional($priceShared)->created_at,
            'quotation_sent_date' => optional($quotationProduct)->created_at,
            'followup_date' => optional($followUpDetail)->created_at,
            'victory_stage_date' => optional($victory)->created_at
        ]);
    }

    public function getPlatformStats(Request $request)
    {
        // Validate request
        $validated = $request->validate([
            'salesperson_id' => 'required|exists:employees,id', 
            'platform' => 'required|string'
        ]);

        // Get customer IDs from leads that match both salesperson and platform 
        $customerIds = Lead::where('salesperson_id', $validated['salesperson_id'])
            ->where('platform', $validated['platform'])
            ->pluck('customer_id')
            ->filter(); // Remove any null values

        if ($customerIds->isEmpty()) {
            return response()->json([
                'message' => 'No matching leads found',
                'data' => [
                    'total_inquiries' => 0,
                    'total_acknowledgments' => 0, 
                    'total_sourcings' => 0,
                    'total_price_shared' => 0,
                    'total_quotations' => 0,
                    'total_victories' => 0,
                    'total_business_tasks' => 0
                ]
            ], 200);
        }

        // Get lead IDs and opportunity IDs for the given customers and platform
        $leads = Lead::where('salesperson_id', $validated['salesperson_id'])
            ->where('platform', $validated['platform'])
            ->get(['id', 'unique_query_id']);

        $leadIds = $leads->pluck('id');
        $opportunityIds = $leads->pluck('unique_query_id');

        // Count entries in each table for matching lead IDs
        $stats = [
            'total_inquiries' => $leads->count(),
            'total_acknowledgments' => LeadAcknowledgment::whereIn('lead_id', $leadIds)->count(),
            'total_sourcings' => ProductSourcing::whereIn('lead_id', $leadIds)->count(),
            'total_price_shared' => PriceShared::whereIn('lead_id', $leadIds)->count(),
            'total_quotations' => QuotationSent::whereIn('lead_id', $leadIds)->count(),
            'total_victories' => Victory::whereIn('lead_id', $leadIds)->count(),
            'total_business_tasks' => BusinessTask::whereIn('opportunity_id', $opportunityIds)->count()
        ];

        return response()->json([
            'message' => 'Platform statistics retrieved successfully',
            'data' => $stats
        ], 200);
    }

    public function getCnsEmployees()
    {
        // Get distinct assignee_name (which is employee id) from procurements where lead_id is not null and assignee_name is not null
        $assigneeIds = Procurement::whereNotNull('lead_id')
            ->whereNotNull('assignee_name')
            ->distinct()
            ->pluck('assignee_name');

        // Fetch employees with these ids
        $employees = Employee::whereIn('id', $assigneeIds)
            ->get(['id', 'name']);

        return response()->json([
            'employees' => $employees
        ]);
    }

    public function getSalesSourcingDataFromCNS(Request $request)
    {
        $request->validate([
            'id' => 'required|integer'
        ]);

        $assigneeId = $request->id;

        // Get all procurements where assignee_name = id and lead_id is not null
        $procurements = Procurement::where('assignee_name', $assigneeId)
            ->whereNotNull('lead_id')
            ->get();

        if ($procurements->isEmpty()) {
            return response()->json([]);
        }

        // Group procurements by created_by (user_id)
        $grouped = $procurements->groupBy('created_by');
        $result = [];

        foreach ($grouped as $createdByUserId => $procList) {
            // Find the employee with user_id = created_by
            $employee = Employee::where('user_id', $createdByUserId)->first();
            if (!$employee) {
                continue;
            }
            $sourcing_done = $procList->where('status', 'Complete')->count();
            $sourcing_not_done = $procList->where('status', 'In progress')->count();
            $result[] = [
                'employee_id' => $employee->id,
                'employee_name' => $employee->name,
                'sourcing_done' => $sourcing_done,
                'sourcing_not_done' => $sourcing_not_done
            ];
        }

        return response()->json($result);
    }

    public function getSalesEmployees()
    {
        // Get distinct assignee_name (which is employee id) from procurements where lead_id is not null and assignee_name is not null
        $assigneeIds = Procurement::whereNotNull('lead_id')
            ->whereNotNull('created_by')
            ->distinct()
            ->pluck('created_by');

        // Fetch employees with these ids
        $employees = Employee::whereIn('id', $assigneeIds)
            ->get(['id', 'name']);

        return response()->json([
            'employees' => $employees
        ]);
    }


    public function getCnsSourcingDataFromSales(Request $request)
    {
        $request->validate([
            'id' => 'required|integer'
        ]);

        $assigneeId = $request->id;

        // Get all procurements where assignee_name = id and lead_id is not null
        $procurements = Procurement::where('created_by', $assigneeId)
            ->whereNotNull('lead_id')
            ->get();

        if ($procurements->isEmpty()) {
            return response()->json([]);
        }

        // Group procurements by created_by (user_id)
        $grouped = $procurements->groupBy('assignee_name');
        $result = [];

        foreach ($grouped as $createdByUserId => $procList) {
            // Find the employee with user_id = created_by
            $employee = Employee::where('user_id', $createdByUserId)->first();
            if (!$employee) {
                continue;
            }
            $sourcing_done = $procList->where('status', 'Complete')->count();
            $sourcing_not_done = $procList->where('status', 'In progress')->count();
            $result[] = [
                'employee_id' => $employee->id,
                'employee_name' => $employee->name,
                'sourcing_done' => $sourcing_done,
                'sourcing_not_done' => $sourcing_not_done
            ];
        }

        return response()->json($result);
    }


    public function getTATDataFromSales(Request $request)
    {
        $request->validate([
            'id' => 'required|integer'
        ]);

        $assigneeId = $request->id;

        // Get all procurements where assignee_name = id and lead_id is not null
        $procurements = Procurement::where('created_by', $assigneeId)
            ->whereNotNull('lead_id')
            ->get();

        if ($procurements->isEmpty()) {
            return response()->json([]);
        }

        // Group procurements by assignee_name (which should be employee id)
        $grouped = $procurements->groupBy('assignee_name');
        $result = [];

        foreach ($grouped as $assigneeId => $procList) {
            // Find the employee with id = assigneeId
            $employee = Employee::where('id', $assigneeId)->first();
            if (!$employee) {
                continue;
            }
            // Under TAT: status = 'Complete', completion_date not null, completion_date <= tat
            $under_tat = $procList->where('status', 'Complete')
                ->whereNotNull('completion_date')
                ->filter(function ($proc) {
                    return $proc->completion_date <= $proc->tat;
                })
                ->count();

            // TAT Exceeded: status = 'Complete', completion_date not null, completion_date > tat
            $tat_exceed = $procList->where('status', 'Complete')
                ->whereNotNull('completion_date')
                ->filter(function ($proc) {
                    return $proc->completion_date > $proc->tat;
                })
                ->count();
            $result[] = [
                'employee_id' => $employee->id,
                'employee_name' => $employee->name,
                'under_tat' => $under_tat,
                'tat_exceed' => $tat_exceed
            ];
        }

        return response()->json($result);
    }


    public function getTargetCostDataFromSales(Request $request)
    {
        $request->validate([
            'id' => 'required|integer'
        ]);

        $assigneeId = $request->id;

        // Get all procurements where assignee_name = id and lead_id is not null
        $procurements = Procurement::where('created_by', $assigneeId)
            ->whereNotNull('lead_id')
            ->get();

        if ($procurements->isEmpty()) {
            return response()->json([]);
        }

        // Group procurements by assignee_name (which should be employee id)
        $grouped = $procurements->groupBy('assignee_name');
        $result = [];

        foreach ($grouped as $assigneeId => $procList) {
            // Find the employee with id = assigneeId
            $employee = Employee::where('id', $assigneeId)->first();
            if (!$employee) {
                continue;
            }

            $under_target_cost = 0;
            $target_cost_exceed = 0;
            $target_cost_not_assigned = 0;

            foreach ($procList as $proc) {
                // Get all procurement_products for this procurement
                $procurementProducts = ProcurementProducts::where('procurement_id', $proc->id)->get();

                if ($procurementProducts->isEmpty()) {
                    // If no procurement_products, skip this procurement
                    continue;
                }

                $hasVendor = false;
                foreach ($procurementProducts as $product) {
                    $targetCost = $product->target_cost;

                    // Get all vendors for this procurement
                    $vendors = ProcurementVendor::where('procurement_id', $proc->id)->get();

                    if ($vendors->isEmpty()) {
                        continue;
                    }

                    $hasVendor = true;
                    $foundUnder = false;
                    $foundExceed = false;

                    foreach ($vendors as $vendor) {
                        if ($targetCost === null) {
                            continue;
                        }
                        if ($vendor->grand_total <= $targetCost) {
                            $foundUnder = true;
                        } elseif ($vendor->grand_total > $targetCost) {
                            $foundExceed = true;
                        }
                    }

                    if ($foundUnder) {
                        $under_target_cost++;
                    } elseif ($foundExceed) {
                        $target_cost_exceed++;
                    }
                }

                // If there are procurement_products but no vendors, count as not assigned
                if (!$hasVendor) {
                    $target_cost_not_assigned++;
                }
            }

            $result[] = [
                'employee_id' => $employee->id,
                'employee_name' => $employee->name,
                'under_target_cost' => $under_target_cost,
                'target_cost_exceed' => $target_cost_exceed,
                'target_cost_not_assigned' => $target_cost_not_assigned
            ];
        }

        return response()->json($result);
    }

}
