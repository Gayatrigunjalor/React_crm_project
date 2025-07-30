<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Procurement extends Model
{
    use HasFactory;
    protected $fillable = [
        'proc_number',
        'proc_prod_id',
        'product_service_name',
        'description',
        'target_cost',
        'tat',
        'status',
        'completion_date',
        'assignee_name',
        'lead_id',
        'lead_customer_id',
        'created_by',
        'rejected_by',
        'rejected',
        'checker_id',
        'approved'
    ];

    /**
     * @return \Illuminate\Database\Eloquent\Relations\BelongsTo
     */
    public function assignee()
    {
        return $this->belongsTo(Employee::class, 'assignee_name', 'id');
    }

    /**
     * @return \Illuminate\Database\Eloquent\Relations\BelongsTo
     */
    public function createdName()
    {
        return $this->belongsTo(Employee::class, 'created_by', 'user_id');
    }

    /**
     * @return \Illuminate\Database\Eloquent\Relations\hasMany
     */
    public function vendors()
    {
        return $this->hasMany(ProcurementVendor::class, 'procurement_id', 'id');
    }

    /**
     * @return \Illuminate\Database\Eloquent\Relations\hasMany
     */
    public function uploads()
    {
        return $this->hasMany(ProcurementUploads::class, 'procurement_id', 'id');
    }

    /**
     * @return \Illuminate\Database\Eloquent\Relations\hasMany
     */
    public function products()
    {
        return $this->hasMany(ProcurementProducts::class, 'procurement_id', 'id');
    }

    public function lead()
    {
        return $this->belongsTo(Lead::class);
    }


}
