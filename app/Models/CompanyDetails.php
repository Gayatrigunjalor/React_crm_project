<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class CompanyDetails extends Model
{
    use HasFactory;
    protected $fillable = [
        'name',
        'short_code',
        'address',
        'city',
        'state',
        'country',
        'pin_code',
        'gst_no',
        'pan_no',
        'pcpndt_no',
        'drug_lic_no',
        'iec',
        'cin',
        'tds',
        'iso',
        'arn',
        'one_star_export_no',
        'aeo_code',
        'website',
        'optional_website',
        'mobile',
        'optional_mobile',
        'company_id'
    ];
}
