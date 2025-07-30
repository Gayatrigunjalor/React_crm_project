<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Customer extends Model
{
    use HasFactory;
    protected $fillable = [
        'name',
        'cust_id',
        'employee_name',
        'customer_type_id',
        'segment_id',
        'category_id',
        'customer_base_id',
        'address',
        'country_id',
        'city',
        'time_zone',
        'pin_code',
        'website',
        'country_code',
        'area_code',
        'contact_no',
        'contact_person',
        'designation',
        'landline_no',
        'email',
        'alternate_email',
        'mobile_number',
        'i_am_member_since',
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
        return $this->hasMany(Quotation::class, 'buyer_id', 'id');
    }

    /**
     * @return \Illuminate\Database\Eloquent\Relations\BelongsTo
     */
    public function country()
    {
        return $this->belongsTo(Country::class, 'country_id', 'id');
    }

    /**
     * @return \Illuminate\Database\Eloquent\Relations\BelongsTo
     */

    /**
     * @return \Illuminate\Database\Eloquent\Relations\BelongsTo
     */
    public function customerType()
    {
        return $this->belongsTo(CustomerType::class, 'customer_type_id', 'id');
    }

    /**
     * @return \Illuminate\Database\Eloquent\Relations\BelongsTo
     */
    public function segment()
    {
        return $this->belongsTo(Segment::class, 'segment_id', 'id');
    }

    /**
     * @return \Illuminate\Database\Eloquent\Relations\BelongsTo
     */
    public function category()
    {
        return $this->belongsTo(Category::class, 'category_id', 'id');
    }

    /**
     * @return \Illuminate\Database\Eloquent\Relations\BelongsTo
     */
    public function customerBase()
    {
        return $this->belongsTo(CustomerBase::class, 'customer_base_id', 'id');
    }

    /**
     * @return \Illuminate\Database\Eloquent\Relations\BelongsTo
     */
    public function timezone()
    {
        return $this->belongsTo(Timezone::class, 'time_zone', 'id');
    }
}
