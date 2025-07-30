<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class RecruitmentCandidate extends Model
{
    use HasFactory;
    protected $fillable = [
        'name',
        'post_id',
        'qualification',
        'experience',
        'communication_skill',
        'address',
        'email',
        'mobile',
        'english_knowledge',
        'critical_relationship',
        'energy_level',
        'distance',
        'own_vehicle',
        'readiness_to_join',
        'working_status',
        'job_change_reason',
        'current_salary',
        'expected_salary',
        'notice_period',
        'interview_date',
        'candidate_status',
        'attachment_id',
        'created_by',
        'rejected_by',
        'rejected',
        'checker_id',
        'approved'
    ];

    /**
     * @return \Illuminate\Database\Eloquent\Relations\BelongsTo
    */
    public function createdName()
    {
        return $this->belongsTo(Employee::class, 'created_by', 'user_id');
    }
}
