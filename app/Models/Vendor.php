<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Vendor extends Model
{
    use HasFactory;
    protected $fillable = [
        'name',
        'vender_type_id',
        'employee_name',
        'entity_type_id',
        'segment_id',
        'country_id',
        'state_id',
        'address',
        'city',
        'pin_code',
        'phone',
        'website',
        'vendor_behavior_id',
        'rating',
        'contact_person',
        'contact_person_number',
        'designation',
        'email',
        'collaboration_interest',
        'created_by',
        'rejected_by',
        'rejected',
        'checker_id',
        'approved'
    ];

    /**
     * @return \Illuminate\Database\Eloquent\Relations\BelongsTo
     */
    public function vendorBehaviorDetails()
    {
        return $this->belongsTo(VendorBehavior::class, 'vendor_behavior_id', 'id');
    }

    /**
     * @return \Illuminate\Database\Eloquent\Relations\BelongsTo
     */
    public function segmentDetails()
    {
        return $this->belongsTo(Segment::class, 'segment_id', 'id');
    }

    /**
     * @return \Illuminate\Database\Eloquent\Relations\BelongsTo
     */
    public function entityTypeDetails()
    {
        return $this->belongsTo(EntityType::class, 'entity_type_id', 'id');
    }

    /**
     * @return \Illuminate\Database\Eloquent\Relations\BelongsTo
     */
    public function vendorTypeDetails()
    {
        return $this->belongsTo(VendorType::class, 'vender_type_id', 'id');
    }
}
