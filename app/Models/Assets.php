<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Assets extends Model
{
    use HasFactory;
    protected $fillable = [
        'asset_name',
        'asset_id',
        'asset_desc',
        'asset_type_id',
        'purchase_date',
        'warranty_exp_date',
        'vendor_id',
        'warranty_card',
        'invoice',
        'assigned_to_emp',
        'assigned_date',
        'created_by'
    ];

    /**
     * @return \Illuminate\Database\Eloquent\Relations\BelongsTo
     */
    public function vendors()
    {
        return $this->belongsTo(Vendor::class, 'vendor_id', 'id');
    }

    /**
     * @return \Illuminate\Database\Eloquent\Relations\BelongsTo
     */
    public function assetType()
    {
        return $this->belongsTo(AssetType::class, 'asset_type_id', 'id');
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
    public function assigned_to_employee()
    {
        return $this->belongsTo(Employee::class, 'assigned_to_emp', 'id');
    }
}
