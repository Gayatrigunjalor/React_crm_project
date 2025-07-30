<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class InvoiceProducts extends Model
{
    use HasFactory;
    protected $fillable = [
        'product_name',
        'invoice_id',
        'product_id',
        'description',
        'hsn',
        'quantity',
        'unit',
        'rate',
        'amount'
    ];

    /**
     * @return \Illuminate\Database\Eloquent\Relations\BelongsTo
     */
    public function productDetail(){
        return $this->belongsTo(Product::class,'product_id','id');
    }
}
