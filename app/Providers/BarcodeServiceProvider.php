<?php

namespace App\Providers;

use Illuminate\Support\ServiceProvider;
use Illuminate\Foundation\AliasLoader;
use Milon\Barcode\Facades\DNS1DFacade;
use Milon\Barcode\Facades\DNS2DFacade;

class BarcodeServiceProvider extends ServiceProvider
{
    // use DNS1DFacade, DNS2DFacade;
    /**
     * Register services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap services.
     */
    public function boot(): void
    {
        AliasLoader::getInstance()->alias('DNS1D', DNS1DFacade::class);
        AliasLoader::getInstance()->alias('DNS2D', DNS2DFacade::class);
    }
}
