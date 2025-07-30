<?php

namespace App\Http\Controllers;

use App\Models\Employee;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Contracts\Auth\StatefulGuard;
use Laravel\Fortify\LoginRateLimiter;
use Laravel\Fortify\Fortify;
use App\Http\Responses\LoginResponse;
use Laravel\Fortify\Http\Requests\LoginRequest;
use Laravel\Fortify\Contracts\LogoutResponse;
use Illuminate\Routing\Pipeline;
use Laravel\Fortify\Actions\EnsureLoginIsNotThrottled;
use App\Actions\Fortify\AttemptToAuthenticate;
use Laravel\Fortify\Features;
use Laravel\Fortify\Actions\RedirectIfTwoFactorAuthenticatable;

class AuthController extends Controller
{
        /**
     * The guard implementation.
     *
     * @var \Illuminate\Contracts\Auth\StatefulGuard
     */
    protected $guard;

    /**
     * The login rate limiter instance.
     *
     * @var \Laravel\Fortify\LoginRateLimiter
     */
    protected $limiter;

    /**
     * Create a new controller instance.
     *
     * @param  \Illuminate\Contracts\Auth\StatefulGuard  $guard
     * @param  \Laravel\Fortify\LoginRateLimiter  $limiter
     * @return void
     */
    public function __construct(StatefulGuard $guard, LoginRateLimiter $limiter)
    {
        $this->guard = $guard;
        $this->limiter = $limiter;
    }

    /**
     * Attempt to authenticate a new session.
    *
    * @param  \Laravel\Fortify\Http\Requests\LoginRequest  $request
    * @return mixed
    */
    public function store(LoginRequest $request)
    {
        return $this->loginPipeline($request)->then(function ($request) {
            return app(LoginResponse::class);
        });
    }

    /**
     * Get the authentication pipeline instance.
     *
     * @param  \Laravel\Fortify\Http\Requests\LoginRequest  $request
     * @return \Illuminate\Pipeline\Pipeline
     */
    protected function loginPipeline(LoginRequest $request)
    {

        if (Fortify::$authenticateThroughCallback) {
            return (new Pipeline(app()))->send($request)->through(array_filter(
                call_user_func(Fortify::$authenticateThroughCallback, $request)
            ));
        }

        if (is_array(config('fortify.pipelines.login'))) {
            return (new Pipeline(app()))->send($request)->through(array_filter(
                config('fortify.pipelines.login')
            ));
        }

        return (new Pipeline(app()))->send($request)->through(array_filter([
            config('fortify.limiters.login') ? null : EnsureLoginIsNotThrottled::class,
            Features::enabled(Features::twoFactorAuthentication()) ? RedirectIfTwoFactorAuthenticatable::class : null,
            AttemptToAuthenticate::class
        ]));
    }

    /**
     * Destroy an authenticated session.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Laravel\Fortify\Contracts\LogoutResponse
     */
    public function destroy(Request $request): LogoutResponse
    {
        $this->guard->logout();

        if ($request->hasSession()) {
            $request->session()->invalidate();
            $request->session()->regenerateToken();
        }

        return app(LogoutResponse::class);
    }

    public function login(Request $request)
    {
        $request->validate([
            'email' => 'required|email',
            'password' => 'required',
        ]);
        $user = User::where('email', $request->email)->first();

        if (!$user || !$this->guard->attempt($request->only(Fortify::username(), 'password'))) {
            return response()->json(['message' => 'Invalid credentials'], 401);
        }

        $token = $user->createToken('auth_token')->plainTextToken;
        // dd($token);
        return response()->json(['token' => $token]);
    }


    public function getPermissions()
    {

        $user = Auth::user();

        if (!$user) {
            return response()->json(['message' => 'User not found'], 404);
        }

        // Get the employee details for the authenticated user
        $employee = Employee::select('id','user_id','name','emp_id','department_id','role_id','is_click_up_on','leadership_kpi_id')->with(['empUser:id,email,user_role', 'role', 'leadershipKpi', 'showActiveEmployees'])
            ->where('user_id', $user->id)
            ->first();

        if (!$employee) {
            return response()->json(['message' => 'Employee not found for this user'], 404);
        }

        return response()->json([
            'emp_data' => $employee,
            'role' => $employee->role ? $employee->role->name : null,
            'permissions' => $employee->userPermissions ? $employee->userPermissions : null,
        ]);
    }

}
