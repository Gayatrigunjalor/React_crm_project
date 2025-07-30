<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class SupplierScrutinyBt extends Model
{
    use HasFactory;
    protected $fillable = [
        'vendor_id',
        'supplier_name',
        'gst_number',
        'gst_status',
        'gst_last_filing_date',
        'previousnongstinvoice',
        'undertaking_accountant',
        'business_task_id',
        'created_by'
    ];

    public function vendor_details() {
        return $this->belongsTo(Vendor::class, 'vendor_id');
    }
}
