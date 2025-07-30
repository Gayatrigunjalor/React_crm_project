<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Employee extends Model
{
    use HasFactory;
    protected $fillable = [
        'name',
        'department_id',
        'date_of_birth',
        'is_under_id',
        'address',
        'role_id',
        'designation_id',
        'city',
        'pin_code',
        'mobile_number',
        'official_mobile_number',
        'emergency_mobile_number',
        'email',
        'gender',
        'blood_group',
        'photograph',
        'salary',
        'security_deposit',
        'joining_date',
        'anniversary_date',
        'status',
        'file_no',
        'biometric_no',
        'emp_id',
        'leadership_kpi_id',
        'ancillary_roles',
        'created_by',
        'rejected_by',
        'rejected',
        'checker_id',
        'approved',
        'is_under_user_ids'
    ];

    /**
     * @return \Illuminate\Database\Eloquent\Relations\BelongsTo
     */
    public function department()
    {
        return $this->belongsTo(Department::class, 'department_id', 'id');
    }

    /**
     * @return \Illuminate\Database\Eloquent\Relations\BelongsTo
     */
    public function designation()
    {
        return $this->belongsTo(Designation::class, 'designation_id', 'id');
    }

    /**
     * @return \Illuminate\Database\Eloquent\Relations\BelongsTo
     */
    public function role()
    {
        return $this->belongsTo(Role::class, 'role_id', 'id');
    }

    /**
     * @return \Illuminate\Database\Eloquent\Relations\BelongsTo
     */
    public function leadershipKpi()
    {
        return $this->belongsTo(Role::class, 'leadership_kpi_id', 'id') ?? null;
    }

    /**
     * @return \Illuminate\Database\Eloquent\Relations\BelongsTo
     */
    public function empUser()
    {
        return $this->belongsTo(User::class, 'user_id', 'id');
    }

    /**
     * @return \Illuminate\Database\Eloquent\Relations\BelongsTo
     */
    public function isUnder()
    {
        return $this->belongsTo(Employee::class, 'is_under_id');
    }

    /**
     * @return \Illuminate\Database\Eloquent\Relations\BelongsTo
     */
    public function manager()
    {
        return $this->belongsTo(Employee::class, 'is_under_id');
    }

    /**
     * @return \Illuminate\Database\Eloquent\Relations\HasOne
     */
    public function userPermissions()
    {
        return $this->hasOne(Permission::class, 'user_id', 'user_id');
    }

    /**
     * @return \Illuminate\Database\Eloquent\Relations\HasOne
     */
    public function showActiveEmployees()
    {
        return $this->hasOne(Permission::class, 'user_id', 'user_id')->orWhere('vendor_create', '1')->orWhere('directory_create', '1')->orWhere('product_create', '1');
    }

    /**
     * @return \Illuminate\Database\Eloquent\Relations\HasMany
     */
    public function leads()
    {
        return $this->hasMany(Lead::class, 'salesperson_id', 'id');
    }

    public function ancillaryRolesAttribute() {
        if(!empty($this->ancillary_roles)) {
            $ids = explode(",", $this->ancillary_roles);
            return Role::select('id','name')->whereIn('id', $ids)->get();
        }
        return collect();
    }


    public function aceAndGoalPreference() {
        return $this->hasMany(AceAndGoalPreferences::class, 'user_id', 'user_id');
    }

    public function subordinates() {
        return $this->hasMany(Employee::class, 'is_under_id', 'id')->where('is_click_up_on', 1);
    }
}
