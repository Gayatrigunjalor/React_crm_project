<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class TaxInvoiceDetailsBt extends Model
{
    use HasFactory;
    protected $fillable = [
        'vendornametax',
        'purchasetaxinvoiceno',
        'tax_invoice_amount',
        'product_name_tax',
        'quantity_tax',
        'rate_tax',
        'undertaking_pm',
        'business_task_id',
        'created_by'
    ];
}
