<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class WarehouseBoxProducts extends Model
{
    use HasFactory;

    protected $table = 'warehouse_box_products';
    protected $hidden = ['created_at', 'updated_at'];

    protected $fillable = [
        'warehouse_box_id',
        'product_code_id',
        'product_quantity',
        'product_hsn',
        'hazardous_symbol',
        'box_content',
        'manufacture_year'
    ];

    public function product_details() {
        return $this->hasOne(Product::class, 'id', 'product_code_id');
    }
}
