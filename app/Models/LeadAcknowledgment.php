<?php

namespace App\Models;

use App\Models\Lead_customer;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class LeadAcknowledgment extends Model
{
    use HasFactory;

    protected $fillable = [
        'customer_id',
        'lead_id',
        'qualified',
        'disqualified',
        'clarity_pending',
        'status',
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

    public function qualifiedData()
    {
        return $this->hasMany(QualifiedOpportunity::class, 'id', 'id');
    }

    // Relationship for Clarity Pending Data
    public function clarityPendingData()
    {
        return $this->hasMany(ClarityPending::class, 'id', 'id');
    }

    // Relationship for Disqualified Data
    public function disqualifiedData()
    {
        return $this->hasMany(DisqualifiedOpportunity::class, 'id', 'id');
    }

    // Custom methods to get parsed IDs
    public function getQualifiedIdsAttribute()
    {
        return array_filter(explode(',', $this->qualified));
    }

    public function getDisqualifiedIdsAttribute()
    {
        return array_filter(explode(',', $this->disqualified));
    }

    public function getClarityPendingIdsAttribute()
    {
        return array_filter(explode(',', $this->clarity_pending));
    }
}
