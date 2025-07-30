<?php

namespace App\Models;

use App\Models\Lead_customer;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ProductSourcing extends Model
{
    use HasFactory;

    protected $fillable = [
        'customer_id',
        'lead_id',
        'product_sourcing',
        'product_name',
        'make',
        'model',
        'quantity',
        'target_price',
        'product_code',
        'procurement_id',
        'no_of_product_vendor',
        'status'
    ];

    // Relationships (if applicable)
    public function customer()
    {
        return $this->belongsTo(Lead_customer::class);
    }

    public function lead()
    {
        return $this->belongsTo(Lead::class);
    }

    public function procurement()
    {
        return $this->belongsTo(Procurement::class);
    }
}

