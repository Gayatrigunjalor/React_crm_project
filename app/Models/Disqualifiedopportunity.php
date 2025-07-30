<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Disqualifiedopportunity extends Model
{
    use HasFactory;

    protected $table = 'disqualified_opportunities'; // Table name

    protected $fillable = ['disqualified_opportunity']; // Add any other fields if needed
}
