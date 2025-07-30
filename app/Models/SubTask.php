<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class SubTask extends Model
{
    use HasFactory;
    protected $fillable = [
        'stage_id',
        'title',
        'description',
        'user_ids',
        'priority',
        'start_date',
        'due_date',
        'e_hours',
        'e_minutes',
        'e_seconds',
        'task_id',
        'created_by',
        'sprint_point'
    ];

    /**
     * @return \Illuminate\Database\Eloquent\Relations\BelongsTo
     */
    public function stages()
    {
        return $this->belongsTo(Stage::class, 'stage_id', 'id');
    }
}
