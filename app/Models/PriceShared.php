<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class PriceShared extends Model
{
    use HasFactory;

    protected $fillable = [
        'customer_id',
        'lead_id',
        'status',
        'product',
        'model',
        'make',
        'quantity',
        'target_price',
        'quoted_price',
        'currency'
    ];

    // Relationships
    public function customer()
    {
        return $this->belongsTo(Lead_customer::class);
    }

    public function lead()
    {
        return $this->belongsTo(Lead::class);
    }
}
