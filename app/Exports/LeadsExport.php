<?php

namespace App\Exports;

use App\Models\Lead;
use Maatwebsite\Excel\Concerns\FromCollection;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\WithMapping;

class LeadsExport implements FromCollection, WithHeadings, WithMapping
{
    protected $type;

    public function __construct($type = 'all')
    {
        $this->type = $type;
    }

    public function collection()
    {
        switch ($this->type) {
            case 'qualified':
                return Lead::where('qualified', true)->get();
            case 'disqualified':
                return Lead::where('disqualified', true)->get();
            default:
                return Lead::all();
        }
    }

    public function headings(): array
    {
        return [
            'ID',
            'Query ID',
            'Query Type',
            'Date & Time',
            'Name',
            'Mobile',
            'Email',
            'Company',
            'Address',
            'City',
            'State',
            'Country',
            'Product Name',
            'Message',
            'Platform',
            'Status'
        ];
    }

    public function map($lead): array
    {
        return [
            $lead->id,
            $lead->unique_query_id,
            $lead->query_type,
            $lead->query_time,
            $lead->sender_name,
            $lead->sender_mobile,
            $lead->sender_email,
            $lead->sender_company,
            $lead->sender_address,
            $lead->sender_city,
            $lead->sender_state,
            $lead->sender_country_iso,
            $lead->query_product_name,
            $lead->query_message,
            $lead->platform,
            $lead->qualified ? 'Qualified' : ($lead->disqualified ? 'Disqualified' : 'New')
        ];
    }
}