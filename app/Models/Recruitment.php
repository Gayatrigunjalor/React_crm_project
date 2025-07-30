<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Recruitment extends Model
{
    use HasFactory;
    protected $fillable = [
        'post_name',
        'opening_date',
        'tat',
        'closer_date',
        'deviation',
        'opening_status',
        'job_description',
        'joined_candidate',
        'assignee_name',
        'created_by',
        'rejected_by',
        'rejected',
        'checker_id',
        'approved'
    ];

    /**
     * @return \Illuminate\Database\Eloquent\Relations\HasMany
     */
    public function recruitmentCandidates()
    {
        return $this->hasMany(RecruitmentCandidate::class, 'post_id', 'id');
    }

    /**
     * @return \Illuminate\Database\Eloquent\Relations\HasMany
     */
    public function recruitmentAttachments()
    {
        return $this->hasMany(RecruitmentAttachment::class, 'post_id', 'id');
    }

    /**
     * @return \Illuminate\Database\Eloquent\Relations\BelongsTo
     */
    public function assigneeName()
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
}
