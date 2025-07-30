<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class RegulatoryDashboard extends Model
{
    use HasFactory;
    protected $fillable = [
        'invoice_id',
        'shipping_bill_no',
        'shipping_bill_date',
        'port_code',
        'awb_no',
        'awb_date',
        'cha',
        'egm_no',
        'egm_date',
        'invoice',
        'awb',
        'shipping_bill',
        'packing_list',
        'other',
        'created_by',
        'rejected_by',
        'rejected',
        'checker_id',
        'approved'
    ];

    /**
     * @return \Illuminate\Database\Eloquent\Relations\BelongsTo
     */
    public function invoiceDetails(){
        return $this->belongsTo(Invoice::class,'invoice_id','id');
    }
}
