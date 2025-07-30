<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Kpi extends Model
{
    use HasFactory;
    protected $fillable = [
        'kpi_name',
        'role_id',
        'user_ids',
        'description',
        'target_type',
        'priority'
    ];

    /**
     * @return \Illuminate\Database\Eloquent\Relations\BelongsTo
     */
    public function roles()
    {
        return $this->belongsTo(Role::class, 'role_id', 'id');
    }

    /**
     * @return \Illuminate\Database\Eloquent\Relations\BelongsTo
     */
    public function assignedTarget()
    {
        return $this->hasMany(Task::class, 'kpi_id', 'id');
    }

    /**
     * @return \Illuminate\Database\Eloquent\Relations\BelongsTo
     */
    public function currentMonthTarget()
    {
        return $this->hasMany(Task::class, 'kpi_id', 'id');
    }

    /**
     * @return \Illuminate\Database\Eloquent\Relations\BelongsTo
     */
    public function lastMonthTarget()
    {
        return $this->hasMany(Task::class, 'kpi_id', 'id');
    }

    /**
     * @return \Illuminate\Database\Eloquent\Relations\BelongsTo
     */
    public function secondLastMonthTarget()
    {
        return $this->hasMany(Task::class, 'kpi_id', 'id');
    }
}
