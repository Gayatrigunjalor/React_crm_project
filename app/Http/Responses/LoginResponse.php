<?php

namespace App\Http\Responses;

use Laravel\Fortify\Contracts\LoginResponse as LoginResponseContract;

class LoginResponse implements LoginResponseContract
{
    public function toResponse($request)
    {
        $user = $request->user();

        // Check if user has 2FA enabled
        $twoFactorEnabled = !empty($user->two_factor_secret);

        if ($twoFactorEnabled) {
            // If 2FA enabled, respond with flag so frontend can prompt for code
            return response()->json([
                'two_factor' => true,
                'message' => 'Two factor authentication required.',
            ]);
        }

        // If 2FA not enabled, respond with normal login success info
        return response()->json([
            'two_factor' => false,
            'message' => 'Login successful.',
            'token' => $user->createToken('auth_token')->plainTextToken
        ]);
    }
}
