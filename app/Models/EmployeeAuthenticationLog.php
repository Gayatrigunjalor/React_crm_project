<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class EmployeeAuthenticationLog extends Model
{
    use HasFactory;

    /**
     * The table associated with the model.
     *
     * @var string
     */
    protected $table = 'authentication_log';

    /**
     * @return \Illuminate\Database\Eloquent\Relations\BelongsTo
     */
    public function employeeDetails()
    {
        return $this->belongsTo(Employee::class, 'authenticatable_id', 'user_id');
    }
}
