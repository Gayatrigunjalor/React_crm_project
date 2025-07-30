<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class FreightCostSourcingBt extends Model
{
    use HasFactory;
    protected $fillable = [
        'ffd_id',
        'freight_agent',
        'pick_up_location',
        'delivery_location',
        'quoting_price',
        'rate_contract_price',
        'contact_person_name',
        'contact_person_email',
        'contact_person_phone',
        'budget',
        'freight_cost_invoice',
        'tender_status',
        'business_task_id',
        'vessel_airline_name',
        'vessel_airline_date',
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
