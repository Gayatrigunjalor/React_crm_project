<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Task extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'stage_id',
        'title',
        'description',
        'kpi_id',
        'role_id',
        'role_type',
        'user_ids',
        'priority',
        'start_date',
        'due_date',
        'e_hours',
        'e_minutes',
        'e_seconds',
        'task_type',
        'created_by',
        'kpi_month',
        'kpi_year',
        'sprint_point',
        'target_type',
        'target_value',
        'target_completed',
        'target_remaining',
        'assigned_by',
        'created_by'
    ];

    /**
     * @return \Illuminate\Database\Eloquent\Relations\BelongsTo
     */
    public function stages()
    {
        return $this->belongsTo(Stage::class, 'stage_id', 'id');
    }
    /**
     * @return \Illuminate\Database\Eloquent\Relations\BelongsTo
     */
    public function createdBy()
    {
        return $this->belongsTo(Employee::class, 'created_by', 'user_id');
    }
    /**
     * @return \Illuminate\Database\Eloquent\Relations\BelongsTo
     */
    public function assignedBy()
    {
        return $this->belongsTo(Employee::class, 'assigned_by', 'user_id');
    }
    /**
     * @return \Illuminate\Database\Eloquent\Relations\BelongsTo
     */
    public function kpi()
    {
        return $this->belongsTo(Kpi::class, 'kpi_id', 'id');
    }

    public function subTasks()
    {
        return $this->hasMany(SubTask::class, 'task_id');
    }
}
