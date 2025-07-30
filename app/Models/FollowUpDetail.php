<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class FollowUpDetail extends Model
{
    use HasFactory;

    protected $fillable = ['follow_up_id', 'lead_id', 'customer_id', 'type','date', 'data','status'];

    public function followUp()
    {
        return $this->belongsTo(FollowUp::class);
    }

    public function lead()
{
    return $this->belongsTo(Lead::class, 'lead_id');
}

}
