<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use Laravel\Fortify\TwoFactorAuthenticatable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;
use Rappasoft\LaravelAuthenticationLog\Traits\AuthenticationLoggable;

class User extends Authenticatable
{
    /** @use HasFactory<\Database\Factories\UserFactory> */
    use HasApiTokens, HasFactory, Notifiable;
    use TwoFactorAuthenticatable;
    use AuthenticationLoggable;

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'name',
        'email',
        'password',
        'mobile_number',
        'address',
        'password',
        'password_changed_at',
        'email_verified_at'
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var array<int, string>
     */
    protected $hidden = [
        'password',
        'remember_token',
        'two_factor_recovery_codes',
        'two_factor_secret',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
        ];
    }

    /**
     * @return \Illuminate\Database\Eloquent\Relations\HasOne
     */
    public function permission()
    {
        return $this->hasOne('App\Models\Permission');
    }

    /**
     * @return \Illuminate\Database\Eloquent\Relations\HasOne
     */
    public function dashboard_permission()
    {
        return $this->hasOne('App\Models\DashboardPermission');
    }

    /**
     * @return \Illuminate\Database\Eloquent\Relations\HasOne
     */
    public function employeeRole()
    {
        return $this->hasOne('App\Models\Employee');
    }

    /**
     * @return \Illuminate\Database\Eloquent\Relations\HasOne
     */
    public function employeeDetail()
    {
        return $this->hasOne(Employee::class, 'user_id', 'id');
    }

    /**
     * @return \Illuminate\Database\Eloquent\Relations\HasOne
     */
    public function rolePermissions()
    {
        return $this->hasOne(Permission::class, 'user_id', 'id');
    }

    /**
     * @return \Illuminate\Database\Eloquent\Relations\HasOne
     */
    public function showActiveEmployees()
    {
        return $this->hasOne(Employee::class)->where('is_click_up_on', '1');
    }

    /**
     * @return \Illuminate\Database\Eloquent\Relations\HasMany
     */
    public function companies()
    {
        return $this->hasMany(UserCompaniesPermissions::class, 'user_id');
    }
}
