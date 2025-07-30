<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Victory extends Model
{
    use HasFactory;
    protected $fillable = ['deal_won', 'lead_id', 'customer_id', 'status'];

    public function lead(): BelongsTo
    {
        return $this->belongsTo(Lead::class);
    }
}
