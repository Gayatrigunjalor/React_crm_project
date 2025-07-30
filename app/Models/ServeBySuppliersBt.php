<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ServeBySuppliersBt extends Model
{
    use HasFactory;
    protected $fillable = [
        'ffd_id',
        'pod_lorry_receipt',
        'booking_date',
        'acpcted_shipment_arrivel_date',
        'follow_up_served_by',
        'pod_for_lorry',
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
