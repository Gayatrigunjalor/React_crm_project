<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Product extends Model
{
    use HasFactory;
    protected $fillable = [
        'segment_id',
        'product_code',
        'category_id',
        'employee_name',
        'model_name',
        'product_name',
        'make',
        'functional_name',
        'hsn_code_id',
        'printable_description',
        'unit_of_measurement_id',
        'pack_size',
        'box_size',
        'product_type_id',
        'product_condition_id',
        'confidential_info',
        'optional_accessories',
        'expiry',
        'year_of_manufacturing',
        'product_base_price',
        'gst_percent_id',
        'selling_cost',
        'lbh',
        'volume_weight',
        'created_by',
        'rejected_by',
        'rejected',
        'checker_id',
        'approved',
        'bottom_price',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'created_at' => 'datetime:d-m-Y H:i:s', // Customize format here
        ];
    }

    /**
     * @return \Illuminate\Database\Eloquent\Relations\BelongsTo
     */
    public function hsn()
    {
        return $this->belongsTo(HsnCode::class, 'hsn_code_id', 'id');
    }

    /**
     * @return \Illuminate\Database\Eloquent\Relations\BelongsTo
     */
    public function unit()
    {
        return $this->belongsTo(UnitOfMeasurement::class, 'unit_of_measurement_id', 'id');
    }

    /**
     * @return \Illuminate\Database\Eloquent\Relations\BelongsTo
     */
    public function productType()
    {
        return $this->belongsTo(ProductType::class, 'product_type_id', 'id');
    }

    /**
     * @return \Illuminate\Database\Eloquent\Relations\BelongsTo
     */
    public function createdName()
    {
        return $this->belongsTo(Employee::class, 'created_by', 'user_id');
    }

    /**
     * @return \Illuminate\Database\Eloquent\Relations\BelongsTo
     */
    public function vendorCount()
    {
        return $this->hasMany(ProductVendor::class, 'product_id', 'product_code');
    }

    /**
     * @return \Illuminate\Database\Eloquent\Relations\BelongsTo
     */
    public function attachmentCount()
    {
        return $this->hasMany(ProductAttachment::class, 'product_id', 'id');
    }

    /**
     * @return \Illuminate\Database\Eloquent\Relations\BelongsTo
     */
    public function gstPercent()
    {
        return $this->belongsTo(GstPercent::class, 'gst_percent_id', 'id');
    }
}
