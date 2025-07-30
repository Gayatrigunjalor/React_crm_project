<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\Http;

class CallLeadStoreAPI extends Command
{
    protected $signature = 'lead:store';

    protected $description = 'Call Lead Store API every 10 minutes';

    public function handle()
    {
        $response = Http::post(route('lead.store')); // API ko call karega

        if ($response->successful()) {
            $this->info('Lead Store API called successfully.');
        } else {
            $this->error('Failed to call Lead Store API.');
        }
    }
}
