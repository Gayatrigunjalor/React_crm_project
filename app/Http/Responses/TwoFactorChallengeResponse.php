<?php

namespace App\Http\Responses;

use Laravel\Fortify\Contracts\TwoFactorLoginResponse as TwoFactorLoginResponseContract;

class TwoFactorChallengeResponse implements TwoFactorLoginResponseContract
{
    public function toResponse($request)
    {
        return $request->wantsJson()
            ? response()->json([
                'two_factor' => true,
                'temp_token' => $request->user()->createToken('2fa-temp')->plainTextToken
            ])
            : redirect()->route('two-factor-challenge');
    }
}
