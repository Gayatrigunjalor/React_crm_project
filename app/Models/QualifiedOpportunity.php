<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class QualifiedOpportunity extends Model
{
    use HasFactory;

    protected $table = 'qualified_opportunities'; // Table name

    protected $fillable = ['qualified_opportunity']; // Add any other fields if needed
}
