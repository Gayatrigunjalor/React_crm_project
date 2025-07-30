<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class PmWorksheetBt extends Model
{
    use HasFactory;
    protected $fillable = [
        'make1',
        'model1',
        'supplier_name2',
        'warranty_extension',
        'product_authenticity',
        'physical_verification',
        'lead_time',
        'custvsvendcommitment',
        'expiry',
        'proformainvvsvendorqot',
        'quantity1',
        'technicalspecipm',
        'productspecicrutiny',
        'condition1',
        'product_type1',
        'transportation_cost',
        'warrenty',
        'year_of_manufacturing1',
        'packaging_cost',
        'ready_stock_quantity',
        'business_task_id',
        'created_by'
    ];
}
