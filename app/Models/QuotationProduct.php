<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class QuotationProduct extends Model
{
    use HasFactory;
    protected $fillable = [
        'product_name',
        'pi_order_id',
        'product_id',
        'quantity',
        'tax',
        'tax_amount',
        'rate',
        'rate_with_tax',
        'amount'
    ];
}
