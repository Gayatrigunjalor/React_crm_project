<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class BusinessTaskTeam extends Model
{
    use HasFactory;
    protected $fillable = [
        'sde',
        'bpe',
        'deo',
        'pm',
        'lm',
        'cm',
    ];

    /**
     * @return \Illuminate\Database\Eloquent\Relations\BelongsTo
     */
    public function employeeSde()
    {
        return $this->belongsTo(Employee::class, 'sde', 'user_id');
    }

    /**
     * @return \Illuminate\Database\Eloquent\Relations\BelongsTo
     */
    public function employeeBpe()
    {
        return $this->belongsTo(Employee::class, 'bpe', 'user_id');
    }

    /**
     * @return \Illuminate\Database\Eloquent\Relations\BelongsTo
     */
    public function employeeDeo()
    {
        return $this->belongsTo(Employee::class, 'deo', 'user_id');
    }

    /**
     * @return \Illuminate\Database\Eloquent\Relations\BelongsTo
     */
    public function employeePm()
    {
        return $this->belongsTo(Employee::class, 'pm', 'user_id');
    }

    /**
     * @return \Illuminate\Database\Eloquent\Relations\BelongsTo
     */
    public function employeeLm()
    {
        return $this->belongsTo(Employee::class, 'lm', 'user_id');
    }

    /**
     * @return \Illuminate\Database\Eloquent\Relations\BelongsTo
     */
    public function employeeCm()
    {
        return $this->belongsTo(Employee::class, 'cm', 'user_id');
    }
}
