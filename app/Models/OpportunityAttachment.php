<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class OpportunityAttachment extends Model
{
    use HasFactory;

    protected $fillable = [
        'opportunity_id',
        'file_path',
    ];

    public function opportunity()
    {
        return $this->belongsTo(OpportunityDetail::class, 'opportunity_id');
    }
}
