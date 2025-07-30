<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ProcurementProducts extends Model
{
    use HasFactory;
    protected $fillable = [
        'procurement_id',
        'proc_prod_id',
        'product_service_name',
        'description',
        'target_cost',
        'quantity',
    ];

    public function procurementProductVendors()
    {
        return $this->hasMany(ProcurementVendor::class, 'procurement_product_id', 'id');
    }
}
