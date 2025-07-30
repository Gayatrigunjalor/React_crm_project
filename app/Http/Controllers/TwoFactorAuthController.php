<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Laravel\Fortify\TwoFactorAuthenticationProvider;

class TwoFactorAuthController extends Controller
{
    protected $twoFactorAuthProvider;

    public function __construct(TwoFactorAuthenticationProvider $twoFactorAuthProvider)
    {
        $this->twoFactorAuthProvider = $twoFactorAuthProvider;
    }

    public function store(Request $request)
    {
        $request->validate([
            'code' => 'nullable|string', // Regular 2FA code
            'recovery_code' => 'nullable|string', // Recovery code
        ]);

        // Fortify stores the user ID in session under 'login.id' during login pipeline
        $userId = $request->session()->get('login.id');
        if (! $userId) {
            return response()->json(['message' => 'Two-factor authentication session not found.'], 401);
        }

        $user = User::find($userId);
        if (! $user || ! $user->two_factor_secret) {
            return response()->json(['message' => 'Two factor authentication not enabled.'], 403);
        }

        $secret = decrypt($user->two_factor_secret); // decrypted secret

        // Verify the regular 2FA code if provided
        if ($request->filled('code')) {
            if (!$this->twoFactorAuthProvider->verify($secret, $request->code)) {
                return response()->json(['message' => 'Invalid two-factor authentication code.'], 401);
            }
        }

        // Verify the recovery code if the regular code is not provided
        if ($request->filled('recovery_code')) {
            $codes = json_decode(decrypt($user->two_factor_recovery_codes), true);

            if (! in_array($request->recovery_code, $codes)) {
                return response()->json(['message' => 'Invalid recovery code.'], 401);
            }

            // Remove used code and save updated codes
            $codes = array_values(array_diff($codes, [$request->recovery_code]));

            $user->two_factor_recovery_codes = encrypt(json_encode($codes));
            $user->save();
        }

        // If both codes are not provided, return an error
        if (!$request->filled('code') && !$request->filled('recovery_code')) {
            return response()->json(['message' => 'Either code or recovery code must be provided.'], 400);
        }

        // Generate a new token or return the existing one
        $token = $user->createToken('auth_token')->plainTextToken;

        return response()->json(['token' => $token]);
    }
}
