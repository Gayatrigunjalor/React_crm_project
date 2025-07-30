<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class PoDetailsBt extends Model
{
    use HasFactory;
    protected $fillable = [
        'purchase_order_id',
        'po_number',
        'vendor_name_po',
        'po_amount',
        'po_due_date',
        'payment_term',
        'business_task_id',
        'created_by'
    ];

    public function purchase_o_details() {
        return $this->hasOne(PurchaseOrder::class, 'purchase_order_id');
    }
}
