<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Feedback extends Model
{
    use HasFactory;

    protected $fillable = [
        'lead_id',
        'customer_id',
        'service_satisfaction',
        'overall_experience',
        'recommend_services',
        'met_expectations',
        'service_quality',
        'timely_address',
        'support_satisfaction',
        'team_friendliness',
        'felt_heard',
        'speed_of_delivery',
        'worth_price',
        'compare_competitors',
        'delay_description',
    ];
}
