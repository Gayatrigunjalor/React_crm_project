<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class LogisticsCompliance extends Model
{
    use HasFactory;
    protected $fillable = [
        'invoice_id',
        'ffd_id',
        'pickup_proof',
        'e_way_bill',
        'delivery_challan',
        'id_card',
        'kyc',
        'created_by',
        'rejected_by',
        'rejected',
        'checker_id',
        'approved',
        'delivery_boy_photo',
        'cargo_pickup_agent',
        'ffd_quotation',
        'insurance_attachment',
        'other_attachment'
    ];

    /**
     * @return \Illuminate\Database\Eloquent\Relations\BelongsTo
     */
    public function ffd(){
        return $this->belongsTo(Ffd::class,'ffd_id','id');
    }
    /**
     * @return \Illuminate\Database\Eloquent\Relations\BelongsTo
     */
    public function invoice(){
        return $this->belongsTo(Invoice::class,'invoice_id','id');
    }
}
