<?php
namespace App\Jobs;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldBeUnique;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Http;
use App\Models\Lead;
use App\Models\Lead_customer;
use Illuminate\Support\Facades\Log;

class SendFollowupJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    protected $lead;
    protected $attempt;

    public function __construct(Lead $lead, $attempt)
    {
        $this->lead = $lead;
        $this->attempt = $attempt;
    }

    public function handle()
    {
        // Check if lead already has details
        if ($this->lead->sender_name && $this->lead->sender_email) {
            Log::info("Lead {$this->lead->id} already completed, no follow-up needed.");
            return;
        }

        Log::info("Sending follow-up attempt {$this->attempt} for lead {$this->lead->id}");

        $customer = Lead::where('id', $this->lead->id)->value('customer_id');
      
        
        if (!$customer) {
            Log::warning("No customer found in lead_customer table for lead {$this->lead->id}");
            return;
        }
       
        Http::post(url('/api/lead_followup'), [
            'lead_id' => $this->lead->id,
            'customer_id' => $customer,
            'message' => "Please provide your details for better assistance.",
            'attempt' => $this->attempt,
        ]);

       
        if ($this->attempt == 1) {
            SendFollowupJob::dispatch($this->lead, 2)->delay(now()->addHours(24));
        }
    }
}
