<?php

namespace App\Http\Controllers;


use App\Models\User;
use Carbon\CarbonImmutable;
use Illuminate\Support\Facades\Auth;
use Laravel\Socialite\Facades\Socialite;
use Laravel\Socialite\Two\InvalidStateException;
// use Illuminate\Http\RedirectResponse as LaravelRedirectResponse;
// use Symfony\Component\HttpFoundation\RedirectResponse as SymfonyRedirectResponse;

class AuthGoogleController extends Controller
{
    // public string $domain = 'YOUR-GSUIT-DOMAIN.com'; // <-- foobar.com in the credentials.md example

    public function redirectToGoogle()
    {
        $url = Socialite::driver('google')->stateless()->redirect()->getTargetUrl();
        return response()->json(['url' => $url]);
    }

    public function processGoogleCallback()
    {
        try {
            /* @phpstan-ignore-next-line */
            $socialUser = Socialite::driver('google')->stateless()->user();

            if(!empty($socialUser) && $socialUser->email != null) {
                $user = User::where('email', $socialUser->email)->first();
                if(!$user) {

                    $payload = ['statusCode' => 422, 'success' => false, 'message' => 'This email ID not registered with IDIMS'];
                    return $this->makeResponse($payload, 422);
                }

                User::find($user->id)->update(['email_verified_at' => CarbonImmutable::now()->format('Y-m-d H:i:s')]);
                Auth::login($user);
                // $user = User::with('companies')->find($user->id);
                // if($user->companies){
                //     session(['company_id' => $user->companies[0]->id]);
                // }

                $payload = [
                    'statusCode' => 200,
                    'message' => 'Login with Google successfull',
                    'token' => $user->createToken('auth_token')->plainTextToken
                ];
                return $this->makeResponse($payload, 200);
            }

        } catch (InvalidStateException $exception) {
            $payload = ['statusCode' => 422, 'success' => false, 'message' => 'Login with Google failed. Please try again.'];
            return $this->makeResponse($payload, 422);
        }

        // Very Important! Stops anyone with a random google account
        // if (! Str::endsWith($socialUser->getEmail(), $this->domain)) {
        //     return redirect('/')
        //         ->withErrors([
        //             'oauth2' => [
        //                 __('Only :domain accounts can login.', ['domain' => $this->domain]),
        //             ],
        //         ]);
        // }
    }

    protected function makeResponse($payload, $statusCode) {
        return response()->make("
            <html><body>
            <script>
            window.opener.postMessage(".json_encode($payload).", window.location.origin);
            window.close();
            </script>
            </body></html>
        ", $statusCode, ['Content-Type' => 'text/html']);
    }
}

