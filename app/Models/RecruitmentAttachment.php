<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class RecruitmentAttachment extends Model
{
    use HasFactory;
    protected $fillable = [
        'name',
        'attachment_name',
        'details',
        'post_id',
        'created_by',
        'rejected_by',
        'rejected',
        'checker_id',
        'approved'
    ];

    /**
     * @return \Illuminate\Database\Eloquent\Relations\BelongsTo
     */
    public function recruitment(){
        return $this->belongsTo(RecruitmentAttachment::class,'post_id','id');
    }
}
