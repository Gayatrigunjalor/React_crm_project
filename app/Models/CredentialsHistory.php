<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class CredentialsHistory extends Model
{
    use HasFactory;
    protected $table = 'credentials_history';
    protected $fillable = [
        'credential_id',
        'employee_id',
        'assigned_on',
        'handover_date',
        'remarks',
        'created_by'
    ];

    /**
     * @return \Illuminate\Database\Eloquent\Relations\BelongsTo
     */
    public function credential()
    {
        return $this->belongsTo(Credentials::class, 'credential_id', 'id');
    }

    /**
     * @return \Illuminate\Database\Eloquent\Relations\BelongsTo
     */
    public function employee()
    {
        return $this->belongsTo(Employee::class, 'employee_id', 'id');
    }
}
