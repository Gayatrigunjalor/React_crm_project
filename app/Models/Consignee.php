<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Consignee extends Model
{
    use HasFactory;
    use SoftDeletes;
    protected $fillable = [
        'contact_person',
        'email',
        'mobile',
        'name',
        'customer_id',
        'address',
        'city',
        'pin_code',
        'country',
        'state',
        'designation',
        'created_by',
        'rejected_by',
        'rejected',
        'checker_id',
        'approved'
    ];

    /**
     * @return \Illuminate\Database\Eloquent\Relations\HasMany
     */
    public function quotations()
    {
        return $this->hasMany(Quotation::class, 'consignee_id', 'id');
    }
    /**
     * @return \Illuminate\Database\Eloquent\Relations\BelongsTo
     */
    public function country_name()
    {
        return $this->belongsTo(Country::class, 'country', 'id');
    }
    /**
     * @return \Illuminate\Database\Eloquent\Relations\BelongsTo
     */
    public function state_name()
    {
        return $this->belongsTo(State::class, 'state', 'id');
    }
}
