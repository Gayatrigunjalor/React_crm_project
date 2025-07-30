<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ExportAgentBt extends Model
{
    use HasFactory;
    protected $fillable = [
        'ffd_id',
        'agent_name',
        'freight_cost',
        'purchase_order_no',
        'pickup_ref_number',
        'pickup_booking_date',
        'awb_acceptance_date',
        'follow_up_export_agent',
        'accepted_shipment_delivery_date',
        'expected_documents_handover_date',
        'courier_pod_no',
        'business_task_id',
        'created_by'
    ];

    /**
     * @return \Illuminate\Database\Eloquent\Relations\BelongsTo
     */
    public function ffd_name()
    {
        return $this->belongsTo(Ffd::class, 'ffd_id', 'id');
    }
}
