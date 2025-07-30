<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class OwnpickupBt extends Model
{
    use HasFactory;
    protected $fillable = [
        'ffd_id',
        'pick_up_location',
        'delivery_location',
        'agent_name',
        'opu_freight_cost',
        'purchase_order_no',
        'pickup_refrence_number',
        'pick_up_booking_date',
        'accepted_shipment_arrival_date',
        'own_pick_up_follow_up',
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
        return $this->belongsTo(PurchaseOrder::class, 'purchase_order_no', 'id');
    }

}
