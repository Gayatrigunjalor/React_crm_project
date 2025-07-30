<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class PortOfLandingBt extends Model
{
    use HasFactory;
    protected $fillable = [
        'ffd_id',
        'agent_name',
        'freight_cost',
        'po_no',
        'pickup_refrence_number',
        'pickup_booking_date',
        'delivery_location',
        'expected_shipment',
        'accepted_shipment_delivery_date',
        'follow_up_port_of_landing',
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

    /**
     * @return \Illuminate\Database\Eloquent\Relations\BelongsTo
     */
    public function purchase_order()
    {
        return $this->belongsTo(PurchaseOrder::class, 'po_no', 'id');
    }
}
