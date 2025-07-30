<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class QuotationSent extends Model
{
    use HasFactory;
    protected $fillable = [
        'customer_id',
        'lead_id',
        'product_name',
        'make',
        'model',
        'qty',
        'target_price',
        'quoted_price',
        'date',
        'status',
        'pi_number',
        'quotation_id',
        'currency'
            ];

   public function lead()
    {
        return $this->belongsTo(Lead::class);
    }
}
