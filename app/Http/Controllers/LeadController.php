<?php

namespace App\Http\Controllers;

use Carbon\Carbon;
use App\Models\Lead;
use App\Models\User;
use App\Models\Employee;
use Illuminate\Support\Str;
use Illuminate\Http\Request;
use App\Jobs\SendFollowupJob;
use App\Models\Lead_customer;
use App\Models\CustomerConsignee;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Http;
use Maatwebsite\Excel\Facades\Excel;
use App\Models\CustomerContactPerson;
use App\Models\Disqualifiedopportunity;
use Illuminate\Support\Facades\Validator;
 use App\Exports\LeadsExport;
 use Illuminate\Support\Facades\DB;


 
class LeadController extends Controller
{
    public function __construct()
    {
        // Apply permission middleware for resource-wise actions
        // Uncomment the following lines if using a permission package
        // $this->middleware('permission:lead-list', ['only' => ['index']]);
        // $this->middleware('permission:lead-create', ['only' => ['store']]);
        // $this->middleware('permission:lead-edit', ['only' => ['edit', 'update']]);
        // $this->middleware('permission:lead-delete', ['only' => ['destroy']]);
    }

    public function exportToExcel(Request $request)
    {
        try {
            $type = $request->query('type', 'all');
            $timestamp = now()->format('Y-m-d_H-i-s');
            $fileName = "leads_{$type}_{$timestamp}.xlsx";
    
            return Excel::download(new LeadsExport($type), $fileName);
    
        } catch (\Exception $e) {
            Log::error('Excel export failed: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Failed to export leads',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    // public function index()
    // {
    //     // $this->authorize('lead-list');
    //     // Fetch leads with different conditions
    //     $qualifiedLeads = Lead::where('qualified', true)->get();
    //     $disqualifiedLeads = Lead::where('disqualified', true)->get();
    //     $allLeads = Lead::all();

    //     // Log counts for debugging
    //     Log::debug('Fetched qualified leads', ['count' => $qualifiedLeads->count()]);
    //     Log::debug('Fetched disqualified leads', ['count' => $disqualifiedLeads->count()]);

    //     // Return JSON response with lead data
    //     return response()->json([
    //         'qualifiedLeads' => $qualifiedLeads,
    //         'disqualifiedLeads' => $disqualifiedLeads,
    //         'allLeads' => $allLeads
    //     ], 200);
    // }

    
public function index()
{
    try {
        // Get authenticated user
        $user = Auth::user();
        if (!$user) {
            return response()->json(['message' => 'Unauthorized'], 401);
        }

        // Get employee details with role
        $employee = Employee::with('role')
            ->where('user_id', $user->id)
            ->first();

        if (!$employee) {
            return response()->json(['message' => 'Employee not found'], 404);
        }

        // Check user role and return appropriate leads
        if ($employee->role && $employee->role->name === 'ADMIN'
         || $employee->role->name === 'SDE-Manager') {
            // Admin can see all leads
            // $qualifiedLeads = Lead::where('qualified', true)->get();
            // $disqualifiedLeads = Lead::where('disqualified', true)->get();
            // $allLeads = Lead::all();
            $qualifiedLeads = Lead::where('qualified', true)->orderBy('created_at', 'desc')->get();
            $disqualifiedLeads = Lead::where('disqualified', true)->orderBy('created_at', 'desc')->get();
            $allLeads = Lead::orderBy('created_at', 'desc')->get();

            Log::debug('Admin fetched leads', [
                'qualified_count' => $qualifiedLeads->count(),
                'disqualified_count' => $disqualifiedLeads->count(),
                'all_count' => $allLeads->count()
            ]);

            return response()->json([
                'qualifiedLeads' => $qualifiedLeads,
                'disqualifiedLeads' => $disqualifiedLeads,
                'allLeads' => $allLeads
            ], 200);

        } elseif ($employee->role && $employee->role->name === 'SDE') {
            // SDE can only see assigned leads
            // $assignedLeads = Lead::where('salesperson_id', $employee->id)->get();
            $assignedLeads = Lead::where('salesperson_id', $employee->id)
                 ->orderBy('created_at', 'desc')
                 ->get();

            
            // Filter assigned leads into categories and convert to arrays
            $qualifiedLeads = $assignedLeads->where('qualified', true)->values();
            $disqualifiedLeads = $assignedLeads->where('disqualified', true)->values();

            Log::debug('SDE fetched assigned leads', [
            'employee_id' => $employee->id,
            'qualified_count' => $qualifiedLeads->count(),
            'disqualified_count' => $disqualifiedLeads->count(),
            'total_count' => $assignedLeads->count()
            ]);

            return response()->json([
            'qualifiedLeads' => $qualifiedLeads,
            'disqualifiedLeads' => $disqualifiedLeads,
            'allLeads' => $assignedLeads
            ], 200);

        } else {
            return response()->json([
                'message' => 'Unauthorized role',
                'role' => $employee->role ? $employee->role->name : 'No role assigned'
            ], 403);
        }

    } catch (\Exception $e) {
        Log::error('Error in leads index:', [
            'error' => $e->getMessage(),
            'trace' => $e->getTraceAsString()
        ]);

        return response()->json([
            'message' => 'Error fetching leads',
            'error' => $e->getMessage()
        ], 500);
    }
}


    // public function store(Request $request)
    // {
    //     $currentDate = date('Y-m-d');  // Get the current date in Y-m-d format

    //     $apiUrls = [
    //         // Inorbvict CRM Key
    //         'https://mapi.indiamart.com/wservce/crm/crmListing/v2/?glusr_crm_key=mRywFLxq5XfJSfet4HyI7liMo1LClDJi',
    //         // Purvee CRM key 
    //         'https://mapi.indiamart.com/wservce/crm/crmListing/v2/?glusr_crm_key=mRyyG7ts4HbES/eu432K7liNplLMmDhmWg==',
    //         // Vortex CRM key
    //         'https://mapi.indiamart.com/wservce/crm/crmListing/v2/?glusr_crm_key=mRyyG7ts4HjJQfep4H2I7lCMqlbCnDY=',
    //         // Dynamic TradeIndia API URL with current date
    //         "https://www.tradeindia.com/utils/my_inquiry.html?userid=12987350&profile_id=8372692&key=7011f80cc747b355bb82cd87b94d853e&from_date={$currentDate}&to_date={$currentDate}&limit=10&page_no=1",
    //     ];

    //     $leadFound = false;
    
    //     foreach ($apiUrls as $apiUrl) {
    //         Log::debug('Fetching leads from API', ['url' => $apiUrl]);
    //         if (strpos($apiUrl, 'tradeindia') !== false) {
    //             $leadFound = $this->fetchAndStoreTradeIndiaLeads($apiUrl) || $leadFound;
    //         } else {
    //             $leadFound = $this->fetchAndStoreLeads($apiUrl) || $leadFound;
    //         }
    //     }
    
    //     if (!$leadFound) {
    //         return response()->json(['status' => 'error', 'message' => 'Leads not found'], 404);
    //     }
    
    //     return response()->json(['status' => 'success', 'message' => 'Leads fetched successfully'], 200);
    // }
    
    // Updated to return boolean if leads were found
    // private function fetchAndStoreLeads($apiUrl)
    // {
    //     $response = Http::get($apiUrl);
    
    //     if ($response->successful()) {
    //         $leadsData = $response->json()['RESPONSE'] ?? [];
    
    //         if (empty($leadsData)) {
    //             Log::warning('No leads found in IndiaMart API response.', ['api_url' => $apiUrl]);
    //             return false;
    //         }
    
    //         foreach ($leadsData as $lead) {
    //             try {
    //                 $qualified = $this->isLeadQualified($lead);
    //                 $disqualified = !$qualified;
    
    //                 $customer = Lead_customer::updateOrCreate(
    //                     ['sender_mobile' => $lead['SENDER_MOBILE']],
    //                     [
    //                         'sender_name' => $lead['SENDER_NAME'] ?? null,
    //                         'sender_email' => $lead['SENDER_EMAIL'] ?? null,
    //                         'sender_company' => $lead['SENDER_COMPANY'] ?? null,
    //                         'address' => $lead['SENDER_ADDRESS'] ?? null,
    //                         'city' => $lead['SENDER_CITY'] ?? null,
    //                         'state' => $lead['SENDER_STATE'] ?? null,
    //                         'pincode' => $lead['SENDER_PINCODE'] ?? null,
    //                         'country_iso' => $lead['SENDER_COUNTRY_ISO'],
    //                     ]
    //                 );
    
    //                 Lead::updateOrCreate(
    //                     ['unique_query_id' => $lead['UNIQUE_QUERY_ID']],
    //                     [
    //                         'query_type' => $lead['QUERY_TYPE'],
    //                         'query_time' => $lead['QUERY_TIME'],
    //                         'sender_name' => $lead['SENDER_NAME'],
    //                         'sender_mobile' => $lead['SENDER_MOBILE'],
    //                         'sender_email' => $lead['SENDER_EMAIL'],
    //                         'sender_company' => $lead['SENDER_COMPANY'] ?? null,
    //                         'sender_address' => $lead['SENDER_ADDRESS'] ?? null,
    //                         'sender_city' => $lead['SENDER_CITY'] ?? null,
    //                         'sender_state' => $lead['SENDER_STATE'] ?? null,
    //                         'sender_pincode' => $lead['SENDER_PINCODE'] ?? null,
    //                         'sender_country_iso' => $lead['SENDER_COUNTRY_ISO'],
    //                         'query_product_name' => $lead['QUERY_PRODUCT_NAME'],
    //                         'query_message' => $lead['QUERY_MESSAGE'],
    //                         'qualified' => $qualified ? 1 : 0,
    //                         'disqualified' => $disqualified ? 1 : 0,
    //                         'platform' => 'IndiaMart',
    //                         'customer_id' => $customer->id
    //                     ]
    //                 );
    //             } catch (\Exception $e) {
    //                 Log::error('Error processing lead: ' . $e->getMessage(), ['lead' => $lead]);
    //             }
    //         }
    //         return true;
    //     } else {
    //         Log::error('Failed to fetch leads from IndiaMart API: ' . $response->body(), ['api_url' => $apiUrl]);
    //         return false;
    //     }
    // }

//     private function fetchAndStoreLeads($apiUrl)
// {
//     $response = Http::get($apiUrl);

//     // Extract CRM key or source name from the URL
//     $source = $this->getSourceFromUrl($apiUrl, 'IndiaMart');

//     if ($response->successful()) {
//         $leadsData = $response->json()['RESPONSE'] ?? [];

//         if (empty($leadsData)) {
//             Log::warning('No leads found in IndiaMart API response.', ['api_url' => $apiUrl]);
//             return false;
//         }

//         foreach ($leadsData as $lead) {
//             try {
//                 $qualified = $this->isLeadQualified($lead);
//                 $disqualified = !$qualified;

//                 $customer = Lead_customer::updateOrCreate(
//                     ['sender_mobile' => $lead['SENDER_MOBILE']],
//                     [
//                         'sender_name' => $lead['SENDER_NAME'] ?? null,
//                         'sender_email' => $lead['SENDER_EMAIL'] ?? null,
//                         'sender_company' => $lead['SENDER_COMPANY'] ?? null,
//                         'address' => $lead['SENDER_ADDRESS'] ?? null,
//                         'city' => $lead['SENDER_CITY'] ?? null,
//                         'state' => $lead['SENDER_STATE'] ?? null,
//                         'pincode' => $lead['SENDER_PINCODE'] ?? null,
//                         'country_iso' => $lead['SENDER_COUNTRY_ISO'],
//                     ]
//                 );

//                 Lead::updateOrCreate(
//                     ['unique_query_id' => $lead['UNIQUE_QUERY_ID']],
//                     [
//                         'query_type' => $lead['QUERY_TYPE'],
//                         'query_time' => $lead['QUERY_TIME'],
//                         'sender_name' => $lead['SENDER_NAME'],
//                         'sender_mobile' => $lead['SENDER_MOBILE'],
//                         'sender_email' => $lead['SENDER_EMAIL'],
//                         'sender_company' => $lead['SENDER_COMPANY'] ?? null,
//                         'sender_address' => $lead['SENDER_ADDRESS'] ?? null,
//                         'sender_city' => $lead['SENDER_CITY'] ?? null,
//                         'sender_state' => $lead['SENDER_STATE'] ?? null,
//                         'sender_pincode' => $lead['SENDER_PINCODE'] ?? null,
//                         'sender_country_iso' => $lead['SENDER_COUNTRY_ISO'],
//                         'query_product_name' => $lead['QUERY_PRODUCT_NAME'],
//                         'query_message' => $lead['QUERY_MESSAGE'],
//                         'qualified' => $qualified ? 1 : 0,
//                         'disqualified' => $disqualified ? 1 : 0,
//                         'platform' => $source,
//                         'customer_id' => $customer->id
//                     ]
//                 );
//             } catch (\Exception $e) {
//                 Log::error('Error processing lead: ' . $e->getMessage(), ['lead' => $lead]);
//             }
//         }
//         return true;
//     } else {
//         Log::error('Failed to fetch leads from IndiaMart API: ' . $response->body(), ['api_url' => $apiUrl]);
//         return false;
//     }
// }

// private function getSourceFromUrl($url, $platform)
// {
//     $sourceKey = '';
//     if (strpos($url, 'crmListing') !== false) {
//         preg_match('/glusr_crm_key=([^&]+)/', $url, $matches);
//         $sourceKey = $matches[1] ?? 'Unknown';
//     } elseif (strpos($url, 'tradeindia') !== false) {
//         $sourceKey = 'TradeIndia'; // Static source for TradeIndia
//     }
//     return "{$platform} - {$sourceKey}";
// }

    
    // Updated to return boolean if leads were found
    // private function fetchAndStoreTradeIndiaLeads($apiUrl)
    // {
    //     $response = Http::get($apiUrl);
    
    //     if ($response->successful()) {
    //         $leadsData = $response->json();
    
    //         if (empty($leadsData)) {
    //             Log::warning('No leads found in TradeIndia API response.', ['api_url' => $apiUrl]);
    //             return false;
    //         }
    
    //         foreach ($leadsData as $lead) {
    //             try {
    //                 $qualified = $this->isLeadQualified_tradeindia($lead);
    //                 $disqualified = !$qualified;
    
    //                 $formattedDate = date('Y-m-d', strtotime($lead['generated_date']));
    //                 $combinedDateTime = $formattedDate . ' ' . $lead['generated_time'];
    
    //                 $customer = Lead_customer::updateOrCreate(
    //                     ['sender_mobile' => $lead['sender_mobile']],
    //                     [
    //                         'sender_name' => $lead['sender_name'] ?? null,
    //                         'sender_email' => $lead['sender_email'] ?? null,
    //                         'sender_company' => $lead['sender_co'] ?? null,
    //                         'city' => $lead['sender_city'] ?? null,
    //                         'state' => $lead['sender_state'] ?? null,
    //                         'country_iso' => $lead['sender_country'],
    //                     ]
    //                 );
    
    //                 Lead::updateOrCreate(
    //                     ['unique_query_id' => $lead['rfi_id']],
    //                     [
    //                         'query_type' => $lead['inquiry_type'],
    //                         'query_time' => $combinedDateTime,
    //                         'sender_name' => $lead['sender_name'],
    //                         'sender_mobile' => $lead['sender_mobile'],
    //                         'sender_email' => $lead['sender_email'],
    //                         'sender_company' => $lead['sender_co'] ?? null,
    //                         'sender_city' => $lead['sender_city'] ?? null,
    //                         'sender_state' => $lead['sender_state'] ?? null,
    //                         'sender_country_iso' => $lead['sender_country'],
    //                         'query_product_name' => $lead['subject'],
    //                         'query_message' => $lead['message'],
    //                         'qualified' => $qualified ? 1 : 0,
    //                         'disqualified' => $disqualified ? 1 : 0,
    //                         'platform' => 'TradeIndia',
    //                         'customer_id' => $customer->id
    //                     ]
    //                 );
    //             } catch (\Exception $e) {
    //                 Log::error('Error processing TradeIndia lead: ' . $e->getMessage(), ['lead' => $lead]);
    //             }
    //         }
    //         return true;
    //     } else {
    //         Log::error('Failed to fetch leads from TradeIndia API: ' . $response->body(), ['api_url' => $apiUrl]);
    //         return false;
    //     }
    // }

       public function store(Request $request)
    {
        $currentDate = date('Y-m-d'); // Get the current date in Y-m-d format

        $apiUrls = [
            // Inorbvict CRM Key
            'https://mapi.indiamart.com/wservce/crm/crmListing/v2/?glusr_crm_key=' . env('INORBVICT_CRM_KEY'),
            // Purvee CRM Key
            'https://mapi.indiamart.com/wservce/crm/crmListing/v2/?glusr_crm_key=' . env('PURVEE_CRM_KEY'),
            // Vortex CRM Key
            'https://mapi.indiamart.com/wservce/crm/crmListing/v2/?glusr_crm_key=' . env('VORTEX_CRM_KEY'),
            // TradeIndia API URL with the current date
            "https://www.tradeindia.com/utils/my_inquiry.html?userid=12987350&profile_id=8372692&key=7011f80cc747b355bb82cd87b94d853e&from_date={$currentDate}&to_date={$currentDate}&limit=10&page_no=1",
        ];

        $leadFound = false;

        foreach ($apiUrls as $apiUrl) {
            Log::debug('Fetching leads from API', ['url' => $apiUrl]);
            if (strpos($apiUrl, 'tradeindia') !== false) {
                $leadFound = $this->fetchAndStoreTradeIndiaLeads($apiUrl) || $leadFound;
            } else {
                $leadFound = $this->fetchAndStoreLeads($apiUrl) || $leadFound;
            }
        }

        if (!$leadFound) {
            return response()->json(['status' => 'error', 'message' => 'Leads not found'], 404);
        }

        return response()->json(['status' => 'success', 'message' => 'Leads fetched successfully'], 200);
    }

    private function fetchAndStoreLeads($apiUrl)
    {
        $response = Http::get($apiUrl);

        if ($response->successful()) {
            $leadsData = $response->json()['RESPONSE'] ?? [];

            if (empty($leadsData)) {
                Log::warning('No leads found in IndiaMart API response.', ['api_url' => $apiUrl]);
                return false;
            }

            foreach ($leadsData as $lead) {
                try {
                    $qualified = $this->isLeadQualified($lead);
                    $disqualified = !$qualified;

                    $customer = Lead_customer::updateOrCreate(
                        ['sender_mobile' => $lead['SENDER_MOBILE']],
                        [
                            'sender_name' => $lead['SENDER_NAME'] ?? null,
                            'sender_email' => $lead['SENDER_EMAIL'] ?? null,
                            'sender_company' => $lead['SENDER_COMPANY'] ?? null,
                            'address' => $lead['SENDER_ADDRESS'] ?? null,
                            'city' => $lead['SENDER_CITY'] ?? null,
                            'state' => $lead['SENDER_STATE'] ?? null,
                            'pincode' => $lead['SENDER_PINCODE'] ?? null,
                            'country_iso' => $lead['SENDER_COUNTRY_ISO'],
                                  ]
                    );

                    Lead::updateOrCreate(
                        ['unique_query_id' => $lead['UNIQUE_QUERY_ID']],
                        [
                            'query_type' => $lead['QUERY_TYPE'],
                            'query_time' => $lead['QUERY_TIME'],
                            'sender_name' => $lead['SENDER_NAME'],
                            'sender_mobile' => $lead['SENDER_MOBILE'],
                            'sender_email' => $lead['SENDER_EMAIL'],
                            'sender_company' => $lead['SENDER_COMPANY'] ?? null,
                            'sender_address' => $lead['SENDER_ADDRESS'] ?? null,
                            'sender_city' => $lead['SENDER_CITY'] ?? null,
                            'sender_state' => $lead['SENDER_STATE'] ?? null,
                            'sender_pincode' => $lead['SENDER_PINCODE'] ?? null,
                            'sender_country_iso' => $lead['SENDER_COUNTRY_ISO'],
                            'query_product_name' => $lead['QUERY_PRODUCT_NAME'],
                            'query_message' => $lead['QUERY_MESSAGE'],
                            'qualified' => $qualified ? 1 : 0,
                            'disqualified' => $disqualified ? 1 : 0,
                            'platform' => $this->getSourceFromUrl($apiUrl),
                            'customer_id' => $customer->id
                        ]
                    );
                } catch (\Exception $e) {
                    Log::error('Error processing lead: ' . $e->getMessage(), ['lead' => $lead]);
                }
            }
            return true;
        } else {
            Log::error('Failed to fetch leads from IndiaMart API: ' . $response->body(), ['api_url' => $apiUrl]);
            return false;
        }
    }

    private function fetchAndStoreTradeIndiaLeads($apiUrl)
    {
        $response = Http::get($apiUrl);

        if ($response->successful()) {
            $leadsData = $response->json();

            if (empty($leadsData)) {
                Log::warning('No leads found in TradeIndia API response.', ['api_url' => $apiUrl]);
                return false;
            }

            foreach ($leadsData as $lead) {
                try {
                    $qualified = $this->isLeadQualified_tradeindia($lead);
                    $disqualified = !$qualified;

                    $formattedDate = date('Y-m-d', strtotime($lead['generated_date']));
                    $combinedDateTime = $formattedDate . ' ' . $lead['generated_time'];

                    $customer = Lead_customer::updateOrCreate(
                        ['sender_mobile' => $lead['sender_mobile']],
                        [
                            'sender_name' => $lead['sender_name'] ?? null,
                            'sender_email' => $lead['sender_email'] ?? null,
                            'sender_company' => $lead['sender_co'] ?? null,
                            'city' => $lead['sender_city'] ?? null,
                            'state' => $lead['sender_state'] ?? null,
                            'country_iso' => $lead['sender_country'],
                        ]
                    );

                    Lead::updateOrCreate(
                        ['unique_query_id' => $lead['rfi_id']],
                        [
                            'query_type' => $lead['inquiry_type'],
                            'query_time' => $combinedDateTime,
                            'sender_name' => $lead['sender_name'],
                            'sender_mobile' => $lead['sender_mobile'],
                            'sender_email' => $lead['sender_email'],
                            'sender_company' => $lead['sender_co'] ?? null,
                            'sender_city' => $lead['sender_city'] ?? null,
                            'sender_state' => $lead['sender_state'] ?? null,
                            'sender_country_iso' => $lead['sender_country'],
                            'query_product_name' => $lead['subject'],
                            'query_message' => $lead['message'],
                            'qualified' => $qualified ? 1 : 0,
                            'disqualified' => $disqualified ? 1 : 0,
                            'platform' => 'TradeIndia',
                            'customer_id' => $customer->id
                        ]
                    );
                } catch (\Exception $e) {
                    Log::error('Error processing TradeIndia lead: ' . $e->getMessage(), ['lead' => $lead]);
                }
            }
            return true;
        } else {
            Log::error('Failed to fetch leads from TradeIndia API: ' . $response->body(), ['api_url' => $apiUrl]);
            return false;
        }
    }

    private function getSourceFromUrl($url)
{
    $crmKeys = [
        env('INORBVICT_CRM_KEY') => 'Inorbvict',
        env('PURVEE_CRM_KEY') => 'Purvee',
        env('VORTEX_CRM_KEY') => 'Vortex',
    ];

    $sourceName = 'Unknown';

    if (strpos($url, 'crmListing') !== false) {
        preg_match('/glusr_crm_key=([^&]+)/', $url, $matches);
        $crmKey = $matches[1] ?? null;
        if ($crmKey && isset($crmKeys[$crmKey])) {
            $sourceName = $crmKeys[$crmKey];
        }
    } elseif (strpos($url, 'tradeindia') !== false) {
        $sourceName = 'TradeIndia';
    }

    return $sourceName; // Only the source name
}

    // Determine if a lead is qualified based on its properties (IndiaMart leads)
    private function isLeadQualified($data)
    {
        $qualifiedCountries = [
            'AL',
            'DZ',
            'AD',
            'AO',
            'AG',
            'AR',
            'AM',
            'AU',
            'AT',
            'AZ',
            'BS',
            'BH',
            'BB',
            'BY',
            'BE',
            'BZ',
            'BJ',
            'BO',
            'BA',
            'BW',
            'BR',
            'BN',
            'BG',
            'BF',
            'BI',
            'CV',
            'KH',
            'CM',
            'CA',
            'CF',
            'TD',
            'CL',
            'CN',
            'CO',
            'KM',
            'CG',
            'CR',
            'HR',
            'CU',
            'CY',
            'CZ',
            'CD',
            'DK',
            'DJ',
            'DM',
            'DO',
            'EC',
            'SV',
            'GQ',
            'ER',
            'EE',
            'SZ',
            'ET',
            'FJ',
            'FI',
            'FR',
            'GA',
            'GM',
            'GE',
            'DE',
            'GH',
            'GR',
            'GD',
            'GT',
            'GN',
            'GW',
            'GY',
            'HT',
            'HN',
            'HU',
            'IS',
            'ID',
            'IR',
            'IQ',
            'IE',
            'IL',
            'IT',
            'CI',
            'JM',
            'JP',
            'JO',
            'KZ',
            'KE',
            'KI',
            'KP',
            'KR',
            'XK',
            'KW',
            'KG',
            'LA',
            'LV',
            'LB',
            'LS',
            'LR',
            'LY',
            'LI',
            'LT',
            'LU',
            'MG',
            'MW',
            'ML',
            'MT',
            'MH',
            'MR',
            'MX',
            'FM',
            'MD',
            'MC',
            'MN',
            'ME',
            'MA',
            'MZ',
            'MM',
            'NA',
            'NR',
            'NL',
            'NZ',
            'NI',
            'NE',
            'NG',
            'MK',
            'NO',
            'OM',
            'PW',
            'PA',
            'PG',
            'PY',
            'PE',
            'PH',
            'PL',
            'PT',
            'QA',
            'RO',
            'RU',
            'RW',
            'KN',
            'LC',
            'VC',
            'WS',
            'SM',
            'ST',
            'SA',
            'SN',
            'RS',
            'SC',
            'SL',
            'SG',
            'SK',
            'SI',
            'SB',
            'SO',
            'ZA',
            'SS',
            'ES',
            'SD',
            'SR',
            'SE',
            'CH',
            'SY',
            'TW',
            'TJ',
            'TZ',
            'TH',
            'TL',
            'TG',
            'TO',
            'TT',
            'TN',
            'TR',
            'TM',
            'TV',
            'UG',
            'UA',
            'AE',
            'GB',
            'UK',
            'US',
            'UY',
            'UZ',
            'VU',
            'VA',
            'VE',
            'VN',
            'YE',
            'ZM',
            'ZW',
            'Canada'
        ];
        return in_array($data['SENDER_COUNTRY_ISO'], $qualifiedCountries);
    }

    private function isLeadQualified_tradeindia($data)
    {
        $qualifiedCountries =  [
            'Albania',
            'Algeria',
            'Andorra',
            'Angola',
            'Antigua and Barbuda',
            'Argentina',
            'Armenia',
            'Australia',
            'Austria',
            'Azerbaijan',
            'Bahamas',
            'Bahrain',
            'Barbados',
            'Belarus',
            'Belgium',
            'Belize',
            'Benin',
            'Bolivia',
            'Bosnia and Herzegovina',
            'Botswana',
            'Brazil',
            'Brunei',
            'Bulgaria',
            'Burkina Faso',
            'Burundi',
            'Cabo Verde',
            'Cambodia',
            'Cameroon',
            'Canada',
            'Central African Republic',
            'Chad',
            'Chile',
            'China',
            'Colombia',
            'Comoros',
            'Congo',
            'Costa Rica',
            'Croatia',
            'Cuba',
            'Cyprus',
            'Czechia',
            'Democratic Republic of the Congo',
            'Denmark',
            'Djibouti',
            'Dominica',
            'Dominican Republic',
            'Ecuador',
            'El Salvador',
            'Equatorial Guinea',
            'Eritrea',
            'Estonia',
            'Eswatini',
            'Ethiopia',
            'Fiji',
            'Finland',
            'France',
            'Gabon',
            'Gambia',
            'Georgia',
            'Germany',
            'Ghana',
            'Greece',
            'Grenada',
            'Guatemala',
            'Guinea',
            'Guinea-Bissau',
            'Guyana',
            'Haiti',
            'Honduras',
            'Hungary',
            'Iceland',
            'Indonesia',
            'Iran',
            'Iraq',
            'Ireland',
            'Israel',
            'Italy',
            'Ivory Coast',
            'Jamaica',
            'Japan',
            'Jordan',
            'Kazakhstan',
            'Kenya',
            'Kiribati',
            'North Korea',
            'South Korea',
            'Kosovo',
            'Kuwait',
            'Kyrgyzstan',
            'Laos',
            'Latvia',
            'Lebanon',
            'Lesotho',
            'Liberia',
            'Libya',
            'Liechtenstein',
            'Lithuania',
            'Luxembourg',
            'Madagascar',
            'Malawi',
            'Mali',
            'Malta',
            'Marshall Islands',
            'Mauritania',
            'Mexico',
            'Micronesia',
            'Moldova',
            'Monaco',
            'Mongolia',
            'Montenegro',
            'Morocco',
            'Mozambique',
            'Myanmar',
            'Namibia',
            'Nauru',
            'Netherlands',
            'New Zealand',
            'Nicaragua',
            'Niger',
            'Nigeria',
            'North Macedonia',
            'Norway',
            'Oman',
            'Palau',
            'Panama',
            'Papua New Guinea',
            'Paraguay',
            'Peru',
            'Philippines',
            'Poland',
            'Portugal',
            'Qatar',
            'Romania',
            'Russia',
            'Rwanda',
            'Saint Kitts and Nevis',
            'Saint Lucia',
            'Saint Vincent and the Grenadines',
            'Samoa',
            'San Marino',
            'Sao Tome and Principe',
            'Saudi Arabia',
            'Senegal',
            'Serbia',
            'Seychelles',
            'Sierra Leone',
            'Singapore',
            'Slovakia',
            'Slovenia',
            'Solomon Islands',
            'Somalia',
            'South Africa',
            'South Sudan',
            'Spain',
            'Sudan',
            'Suriname',
            'Sweden',
            'Switzerland',
            'Syria',
            'Taiwan',
            'Tajikistan',
            'Tanzania',
            'Thailand',
            'Timor-Leste',
            'Togo',
            'Tonga',
            'Trinidad and Tobago',
            'Tunisia',
            'Turkey',
            'Turkmenistan',
            'Tuvalu',
            'Uganda',
            'Ukraine',
            'United Arab Emirates',
            'United Kingdom',
            'United States',
            'Uruguay',
            'Uzbekistan',
            'Vanuatu',
            'Vatican City',
            'Venezuela',
            'Vietnam',
            'Yemen',
            'Zambia',
            'Zimbabwe'
        ];

        return in_array($data['sender_country'], $qualifiedCountries);
    }

    // chatboat_api
    public function store_lead(Request $request)
{
    // Validate the incoming request
    $validatedData = $request->validate([
        'phone' => 'required|string',
        'UNIQUE_QUERY_ID' => 'nullable|string',
        'QUERY_TYPE' => 'nullable|string',
        'purchase_time_frame' => 'nullable|string',
        'product_interested' => 'nullable|string',
        'product_quantity' => 'nullable|string',
        'complete_conversation' => 'nullable|string',
        'price'=>'nullable|string',
        'name' => 'nullable|string',
        'email' => 'nullable|string',
        'SENDER_COMPANY' => 'nullable|string',
        'SENDER_ADDRESS' => 'nullable|string',
        'SENDER_CITY' => 'nullable|string',
        'SENDER_STATE' => 'nullable|string',
        'SENDER_PINCODE' => 'nullable|string',
        'SENDER_COUNTRY_ISO' => 'nullable',
    ]);

    try {
        Log::debug('Processing lead', ['lead' => $validatedData]);

        // Extract country code from phone number
        $phone = $validatedData['phone'];
        preg_match('/^\+?(\d{1,4})/', $phone, $matches);
        $countryCode = $matches[1] ?? '91'; // Default to '91' if no country code found

        // Convert country code to ISO format
        $countryISO = $this->getCountryISO($countryCode);

        // Generate a random unique ID if UNIQUE_QUERY_ID is not provided
        $uniqueQueryId = $validatedData['UNIQUE_QUERY_ID'] ?? Str::uuid(2)->toString();

        // Check if the lead is qualified
        $qualified = $this->isLeadQualified($validatedData);
        $disqualified = !$qualified;

        // Update or create a customer record
        $customer = Lead_customer::updateOrCreate(
            ['sender_mobile' => $validatedData['phone']],
            [
                'sender_name' => $validatedData['name'] ?? null,
                'sender_email' => $validatedData['email'] ?? null,
                'sender_company' => $validatedData['SENDER_COMPANY'] ?? null,
                'address' => $validatedData['SENDER_ADDRESS'] ?? null,
                'city' => $validatedData['SENDER_CITY'] ?? null,
                'state' => $validatedData['SENDER_STATE'] ?? null,
                'pincode' => $validatedData['SENDER_PINCODE'] ?? null,
                'country_iso' => $validatedData['SENDER_COUNTRY_ISO'] ?? $countryISO,
            ]
        );

        // Update or create lead with the associated customer_id
        $lead = Lead::updateOrCreate(
            ['unique_query_id' => $uniqueQueryId],
            [
                'query_type' => 'Product Inquiry',
                'purchase_time_frame' => $validatedData['purchase_time_frame'],
                'price' => $validatedData['price'],
                'sender_name' => $validatedData['name'],
                'sender_mobile' => $validatedData['phone'],
                'sender_email' => $validatedData['email'],
                'sender_company' => $validatedData['SENDER_COMPANY'] ?? null,
                'sender_address' => $validatedData['SENDER_ADDRESS'] ?? null,
                'sender_city' => $validatedData['SENDER_CITY'] ?? null,
                'sender_state' => $validatedData['SENDER_STATE'] ?? null,
                'sender_pincode' => $validatedData['SENDER_PINCODE'] ?? null,
                'sender_country_iso' => $validatedData['SENDER_COUNTRY_ISO'] ?? $countryISO,
                'query_product_name' => $validatedData['product_interested'] ?? null,
                'product_quantity' => $validatedData['product_quantity'] ?? null,
                'query_message' => $validatedData['complete_conversation'] ?? null,
                'qualified' => $qualified ? 1 : 0,
                'disqualified' => $disqualified ? 1 : 0,
                'platform' => 'Chatbot',
                'customer_id' => $customer->id,
            ]
        );

        Log::debug('Lead record saved/updated', ['unique_query_id' => $uniqueQueryId]);

        // Schedule follow-up if required fields are missing
        if (!$lead->name || !$lead->email || !$lead->product_interested || !$lead->product_quantity || !$lead->complete_conversation) {
            Log::info("Scheduling first follow-up request for lead", ['lead_id' => $lead->id]);
            SendFollowupJob::dispatch($lead, 1)->delay(now()->addHours(4));
        }
        return response()->json([
            'message' => 'Lead stored successfully',
            'data' => $lead,
        ], 200);
    } catch (\Exception $e) {
        Log::error('Error processing lead: ' . $e->getMessage(), ['lead' => $validatedData]);
        return response()->json([
            'message' => 'Error storing lead',
            'error' => $e->getMessage()
        ], 500);
    }
}

/**
 * Convert country code to ISO format.
 */
private function getCountryISO($countryCode)
{
    $countryCodes = [
        '1' => 'US',    // United States
        '7' => 'RU',    // Russia
        '20' => 'EG',   // Egypt
        '27' => 'ZA',   // South Africa
        '30' => 'GR',   // Greece
        '31' => 'NL',   // Netherlands
        '32' => 'BE',   // Belgium
        '33' => 'FR',   // France
        '34' => 'ES',   // Spain
        '36' => 'HU',   // Hungary
        '39' => 'IT',   // Italy
        '40' => 'RO',   // Romania
        '41' => 'CH',   // Switzerland
        '43' => 'AT',   // Austria
        '44' => 'GB',   // United Kingdom
        '45' => 'DK',   // Denmark
        '46' => 'SE',   // Sweden
        '47' => 'NO',   // Norway
        '48' => 'PL',   // Poland
        '49' => 'DE',   // Germany
        '51' => 'PE',   // Peru
        '52' => 'MX',   // Mexico
        '53' => 'CU',   // Cuba
        '54' => 'AR',   // Argentina
        '55' => 'BR',   // Brazil
        '56' => 'CL',   // Chile
        '57' => 'CO',   // Colombia
        '58' => 'VE',   // Venezuela
        '60' => 'MY',   // Malaysia
        '61' => 'AU',   // Australia
        '62' => 'ID',   // Indonesia
        '63' => 'PH',   // Philippines
        '64' => 'NZ',   // New Zealand
        '65' => 'SG',   // Singapore
        '66' => 'TH',   // Thailand
        '81' => 'JP',   // Japan
        '82' => 'KR',   // South Korea
        '84' => 'VN',   // Vietnam
        '86' => 'CN',   // China
        '90' => 'TR',   // Turkey
        '91' => 'IN',   // India
        '92' => 'PK',   // Pakistan
        '93' => 'AF',   // Afghanistan
        '94' => 'LK',   // Sri Lanka
        '95' => 'MM',   // Myanmar
        '98' => 'IR',   // Iran
        '211' => 'SS',  // South Sudan
        '212' => 'MA',  // Morocco
        '213' => 'DZ',  // Algeria
        '216' => 'TN',  // Tunisia
        '218' => 'LY',  // Libya
        '220' => 'GM',  // Gambia
        '221' => 'SN',  // Senegal
        '222' => 'MR',  // Mauritania
        '223' => 'ML',  // Mali
        '224' => 'GN',  // Guinea
        '225' => 'CI',  // Ivory Coast
        '226' => 'BF',  // Burkina Faso
        '227' => 'NE',  // Niger
        '228' => 'TG',  // Togo
        '229' => 'BJ',  // Benin
        '230' => 'MU',  // Mauritius
        '231' => 'LR',  // Liberia
        '232' => 'SL',  // Sierra Leone
        '233' => 'GH',  // Ghana
        '234' => 'NG',  // Nigeria
        '235' => 'TD',  // Chad
        '236' => 'CF',  // Central African Republic
        '237' => 'CM',  // Cameroon
        '238' => 'CV',  // Cape Verde
        '239' => 'ST',  // São Tomé and Príncipe
        '240' => 'GQ',  // Equatorial Guinea
        '241' => 'GA',  // Gabon
        '242' => 'CG',  // Republic of the Congo
        '243' => 'CD',  // Democratic Republic of the Congo
        '244' => 'AO',  // Angola
        '245' => 'GW',  // Guinea-Bissau
        '246' => 'IO',  // British Indian Ocean Territory
        '248' => 'SC',  // Seychelles
        '249' => 'SD',  // Sudan
        '250' => 'RW',  // Rwanda
        '251' => 'ET',  // Ethiopia
        '252' => 'SO',  // Somalia
        '253' => 'DJ',  // Djibouti
        '254' => 'KE',  // Kenya
        '255' => 'TZ',  // Tanzania
        '256' => 'UG',  // Uganda
        '257' => 'BI',  // Burundi
        '258' => 'MZ',  // Mozambique
        '260' => 'ZM',  // Zambia
        '261' => 'MG',  // Madagascar
        '262' => 'RE',  // Réunion
        '263' => 'ZW',  // Zimbabwe
        '264' => 'NA',  // Namibia
        '265' => 'MW',  // Malawi
        '266' => 'LS',  // Lesotho
        '267' => 'BW',  // Botswana
        '268' => 'SZ',  // Eswatini
        '269' => 'KM',  // Comoros
    ];

    return $countryCodes[$countryCode] ?? 'IN'; // Default to 'IN'
}



    public function checkExistingUser(Request $request)
    {
        $contactNumber = $request->input('contact_number');
    
        // Inline validation for the contact_number field
        if (empty($contactNumber) || !preg_match('/^\+?[1-9]\d{0,3}[-]?\d{1,14}$/', $contactNumber)) {
            return response()->json([
                'error' => "Invalid or missing 'contact_number' parameter."
            ], 400);
        }
        
    
        try {
            // Check if user exists based on contact number
            $user = Lead_customer::where('sender_mobile', $contactNumber)->first();
    
            if ($user) {
                return response()->json([
                    'record_found' => true,
                    'name' => $user->sender_name,
                    'number' => $user->sender_mobile,
                    'email' => $user->sender_email,
                ], 200);
            } else {
                return response()->json([
                    'record_found' => false,
                ], 200);
            }
        } catch (\Exception $e) {
            return response()->json([
                'error' => "An unexpected error occurred. Please try again later.",
                'details' => $e->getMessage(),
            ], 500);
        }
    }
    public function deleteUser_temporary(Request $request)
    {
        $contactNumber = $request->input('contact_number');
    
        // Validate the contact number
        if (empty($contactNumber) || !preg_match('/^\+?[1-9]\d{0,3}[-]?\d{1,14}$/', $contactNumber)) {
            return response()->json([
                'error' => "Invalid or missing 'contact_number' parameter."
            ], 400);
        }
    
        try {
            // Find the customer by contact number
            $customer = Lead_customer::where('sender_mobile', $contactNumber)->first();
    
            if ($customer) {
                // Delete all leads associated with this customer
                Lead::where('customer_id', $customer->id)->delete();
    
                // Delete the customer record
                $customer->delete();
    
                return response()->json([
                    'message' => "Record deleted successfully.",
                    'contact_number' => $contactNumber,
                ], 200);
            } else {
                return response()->json([
                    'error' => "No record found for the given contact number.",
                ], 404);
            }
        } catch (\Exception $e) {
            return response()->json([
                'error' => "An unexpected error occurred. Please try again later.",
                'details' => $e->getMessage(),
            ], 500);
        }
    }
    



    public function convert_to_qualified(Request $request)
    {
        // Validate the incoming request
        $validated = $request->validate([
            'id' => 'required|exists:leads,id', // Ensure the lead ID exists in the leads table
        ]);

        // Find the lead by ID
        $lead = Lead::find($validated['id']);

        if (!$lead) {
            return response()->json(['message' => 'Lead not found'], 404);
        }

        // Update the lead status to qualified
        $lead->update([
            'qualified' => 1,
            'disqualified' => 0,
            'is_agent_qualified_lead' => 1,
        ]);

        return response()->json([
            'message' => 'Lead successfully converted to qualified',
            'lead' => $lead,
        ]);
    }

    public function convert_to_disqualified(Request $request)
    {
        // Validate the incoming request
        $validated = $request->validate([
            'id' => 'required|exists:leads,id', // Ensure the lead ID exists in the leads table
        ]);

        // Find the lead by ID
        $lead = Lead::find($validated['id']);

        if (!$lead) {
            return response()->json(['message' => 'Lead not found'], 404);
        }

        // Update the lead status to qualified
        $lead->qualified = 0;
        $lead->disqualified = 1; // Assuming 1 means 'qualified'
        $lead->save();

        return response()->json([
            'message' => 'Lead successfully converted to qualified',
            'lead' => $lead,
        ]);
    }


    public function showLead(Request $request)
    {
        // Validate the incoming request
        $validated = $request->validate([
            'id' => 'required|exists:leads,id', // Ensure the lead ID exists in the leads table
        ]);

        // Fetch the lead with its associated customer data
        $lead = Lead::with('customer_lead')->find($validated['id']);

        if (!$lead) {
            return response()->json(['message' => 'Lead not found'], 404);
        }

        return response()->json([
            'message' => 'Lead successfully retrieved',
            'lead' => $lead,
        ]);
    }


    public function updateLeadCustomer(Request $request)
    {
        // Validate the request to ensure `customer_id` is present and files are valid
        $request->validate([
            'customer_id' => 'required|integer', // Ensure `customer_id` is provided and valid
            'upload_wishing_card' => 'nullable|file|mimes:jpeg,png,pdf|max:2048', // Allow JPEG, PNG, or PDF
            'business_licence' => 'nullable|file|mimes:jpeg,png,pdf|max:2048',
            'owner_national_id' => 'nullable|file|mimes:jpeg,png,pdf|max:2048',
            'visiting_card' => 'nullable|file|mimes:jpeg,png,pdf|max:2048',
        ]);

        // Fetch the lead by `customer_id` from the request
        $lead = Lead::where('customer_id', $request->customer_id)->first();

        if (!$lead) {
            return response()->json(['message' => 'Lead not found'], 404);
        }

        // Extract the customer lead record
        $customerLead = Lead_Customer::where('id', $lead->customer_id)->first();
        
        if (!$customerLead) {
            return response()->json(['message' => 'Customer lead not found'], 404);
        }
        
        // Handle file uploads
        $data = $request->only([
            'customer_status',
            'country_status', 
            'sender_name',
            'sender_mobile',
            'sender_email',
            'sender_address',
            'sender_city',
            'sender_state',
            'sender_pincode',
            'sender_country_iso',
            'designation',
            'sender_company',
            'communication_via',
            'specialty_industry_sector',
            'website',
            'country',
        ]);

        $uploadFields = ['upload_wishing_card', 'business_licence', 'owner_national_id', 'visiting_card'];

        foreach ($uploadFields as $field) {
            if ($request->hasFile($field)) {
                $file = $request->file($field);
                $filePath = $file->store('uploads', 'public'); // Save in `storage/app/public/uploads`
                $data[$field] = $filePath;
            } else {
                $data[$field] = $customerLead->$field ?? 'NA'; // Keep existing value or set default
            }
        }

        // Update the customer lead
        $customerLead->update($data);

        // Update the lead table with matching fields
        $leadData = [
            'sender_mobile' => $request->sender_mobile,
            'sender_email' => $request->sender_email,
            'sender_address' => $request->sender_address,
            'sender_city' => $request->sender_city,
            'sender_state' => $request->sender_state,
            'sender_pincode' => $request->sender_pincode,
            'sender_country_iso' => $request->sender_country_iso,
        ];

        // Update all leads associated with this customer_id
        Lead::where('customer_id', $request->customer_id)->update($leadData);

        return response()->json([
            'message' => 'Customer lead and associated leads successfully updated',
            'customer_lead' => $customerLead,
            'leads_updated' => true
        ]);
    }
    
    public function storeCustomerContacts(Request $request)
    {
        $request->validate([
            'lead_id' => 'required|exists:leads,id',
            'lead_cust_id' => 'required|exists:lead_customers,id',
            'contacts' => 'required|array',
            'contacts.*.contact_person_name' => 'required|string|max:255',
            'contacts.*.city' => 'nullable|string|max:255',
            'contacts.*.country' => 'nullable|string|max:255',
            'contacts.*.mobile_no' => 'nullable|string|max:20',
            'contacts.*.address' => 'nullable|string|max:500',
            'contacts.*.pincode' => 'nullable|string|max:20',
            'contacts.*.state' => 'nullable|string|max:255',
            'contacts.*.email' => 'nullable|email|max:255',
            'contacts.*.designation' => 'nullable|string|max:255',
        ]);
    
        foreach ($request->contacts as $contact) {
            CustomerContactPerson::create(array_merge($contact, [
                'lead_id' => $request->lead_id,
                'lead_cust_id' => $request->lead_cust_id,
            ]));
        }
        return response()->json([
            'message' => 'Customer contacts successfully added.',
        ], 201);
    }

    public function updateCustomerContacts_directory(Request $request)
  {
    $request->validate([
        'lead_id' => 'required|exists:leads,id',
        'lead_cust_id' => 'required|exists:lead_customers,id',
        'contacts' => 'required|array',
        'contacts.*.id' => 'nullable|exists:customer_contact_persons,id',
        'contacts.*.contact_person_name' => 'required|string|max:255',
        'contacts.*.city' => 'nullable|string|max:255',
        'contacts.*.country' => 'nullable|string|max:255',
        'contacts.*.mobile_no' => 'nullable|string|max:20',
        'contacts.*.address' => 'nullable|string|max:500',
        'contacts.*.pincode' => 'nullable|string|max:20',
        'contacts.*.state' => 'nullable|string|max:255',
        'contacts.*.email' => 'nullable|email|max:255',
        'contacts.*.designation' => 'nullable|string|max:255',
    ]);

    foreach ($request->contacts as $contact) {
        if (isset($contact['id'])) {
            // Update the existing contact if 'id' is provided
            $existingContact = CustomerContactPerson::where('lead_id', $request->lead_id)
                ->where('lead_cust_id', $request->lead_cust_id)
                ->find($contact['id']);

            if ($existingContact) {
                $existingContact->update($contact);
            }
        } else {
            // Create a new contact if 'id' is not provided
            CustomerContactPerson::create(array_merge($contact, [
                'lead_id' => $request->lead_id,
                'lead_cust_id' => $request->lead_cust_id,
            ]));
        }
    }

    return response()->json([
        'message' => 'Customer contacts successfully updated.',
    ], 200);
}

public function updateCustomerContacts_directory_id(Request $request)
{
    try {
        // Validate input for a single contact
        $request->validate([
            'lead_id' => 'required|exists:leads,id',
            'lead_cust_id' => 'required|exists:lead_customers,id',
            'id' => 'required|exists:customer_contact_persons,id', // Single contact ID
            'contact_person_name' => 'required|string|max:255',
            'city' => 'nullable|string|max:255',
            'country' => 'nullable|string|max:255',
            'mobile_no' => 'nullable|string|max:20',
            'address' => 'nullable|string|max:500',
            'pincode' => 'nullable|string|max:20',
            'state' => 'nullable|string|max:255',
            'email' => 'nullable|email|max:255',
            'designation' => 'nullable|string|max:255',
        ]);

        // Find the existing contact by ID
        $existingContact = CustomerContactPerson::where('lead_id', $request->lead_id)
            ->where('lead_cust_id', $request->lead_cust_id)
            ->findOrFail($request->id);

        // Update the contact details
        $existingContact->update([
            'contact_person_name' => $request->contact_person_name,
            'city' => $request->city ?? $existingContact->city,
            'country' => $request->country ?? $existingContact->country,
            'mobile_no' => $request->mobile_no ?? $existingContact->mobile_no,
            'address' => $request->address ?? $existingContact->address,
            'pincode' => $request->pincode ?? $existingContact->pincode,
            'state' => $request->state ?? $existingContact->state,
            'email' => $request->email ?? $existingContact->email,
            'designation' => $request->designation ?? $existingContact->designation,
        ]);

        // Log the successful update
        Log::info("Contact updated successfully", [
            'contact_id' => $request->id,
            'lead_id' => $request->lead_id,
            'lead_cust_id' => $request->lead_cust_id,
        ]);

        return response()->json([
            'message' => 'Customer contact successfully updated.',
        ], 200);

    } catch (\Exception $e) {
        // Log the error with exception details
        Log::error("Error updating customer contact", [
            'error' => $e->getMessage(),
            'lead_id' => $request->lead_id,
            'lead_cust_id' => $request->lead_cust_id,
            'contact_id' => $request->id,
        ]);

        return response()->json([
            'message' => 'An error occurred while updating the customer contact.',
            'error' => $e->getMessage(),
        ], 500);
    }
}

public function deleteCustomerContacts_directory_id(Request $request)
{
    try {
        // Validate input for a single contact
        $request->validate([
            'lead_id' => 'required|exists:leads,id',
            'lead_cust_id' => 'required|exists:lead_customers,id',
            'id' => 'required|exists:customer_contact_persons,id', // Single contact ID
        ]);

        // Find the existing contact by ID
        $existingContact = CustomerContactPerson::where('lead_id', $request->lead_id)
            ->where('lead_cust_id', $request->lead_cust_id)
            ->findOrFail($request->id);

        // Delete the contact
        $existingContact->delete();

        // Log the successful deletion
        Log::info("Contact deleted successfully", [
            'contact_id' => $request->id,
            'lead_id' => $request->lead_id,
            'lead_cust_id' => $request->lead_cust_id,
        ]);

        return response()->json([
            'message' => 'Customer contact successfully deleted.',
        ], 200);

    } catch (\Exception $e) {
        // Log the error with exception details
        Log::error("Error deleting customer contact", [
            'error' => $e->getMessage(),
            'lead_id' => $request->lead_id,
            'lead_cust_id' => $request->lead_cust_id,
            'contact_id' => $request->id,
        ]);

        return response()->json([
            'message' => 'An error occurred while deleting the customer contact.',
            'error' => $e->getMessage(),
        ], 500);
    }
}



    public function showCustomerContactsDirectory(Request $request)
    {
        $request->validate([
            'lead_id' => 'required|exists:leads,id',
            'lead_cust_id' => 'required|exists:lead_customers,id',
        ]);
    
        // Fetch contacts based on lead_id and lead_cust_id
        $contacts = CustomerContactPerson::where('lead_id', $request->lead_id)
            ->where('lead_cust_id', $request->lead_cust_id)
            ->get();
    
        return response()->json([
            'message' => 'Customer contacts fetched successfully.',
            'contacts' => $contacts,
        ], 200);
    }
    

    public function storeCustomerConsignees(Request $request)
    {
        $request->validate([
            'lead_id' => 'required|exists:leads,id',
            'cust_id' => 'required|exists:lead_customers,id',
            'consignees' => 'required|array',
            'consignees.*.contact_person_name' => 'required|string|max:255',
            'consignees.*.city' => 'nullable|string|max:255',
            'consignees.*.country' => 'nullable|string|max:255',
            'consignees.*.mo_no' => 'nullable|string|max:20',
            'consignees.*.add' => 'nullable|string|max:500',
            'consignees.*.pincode' => 'nullable|string|max:20',
            'consignees.*.state' => 'nullable|string|max:255',
            'consignees.*.email' => 'nullable|email|max:255',
            'consignees.*.designation' => 'nullable|string|max:255',
        ]);
       

        foreach ($request->consignees as $consignee) {
            CustomerConsignee::create([
                'lead_id' => $request->lead_id,
                'cust_id' => $request->cust_id,
                'contact_person_name' => $consignee['contact_person_name'],
                'add' => $consignee['add'] ?? null,
                'city' => $consignee['city'] ?? null,
                'pincode' => $consignee['pincode'] ?? null,
                'country' => $consignee['country'] ?? null,
                'state' => $consignee['state'] ?? null,
                'mo_no' => $consignee['mo_no'] ?? null,
                'email' => $consignee['email'] ?? null,
                'designation' => $consignee['designation'] ?? null,
            ]);
        }

        return response()->json([
            'message' => 'Customer consignee details successfully added.',
        ], 201);
    }

  
    public function updateCustomerConsignees_directory(Request $request)
    {
        try {
            $request->validate([
                'lead_id' => 'required|exists:leads,id',
                'cust_id' => 'required|exists:lead_customers,id',
                'consignees' => 'required|array',
                'consignees.*.id' => 'required|exists:customer_consignees,id', // 'id' is now required for updating
                'consignees.*.contact_person_name' => 'required|string|max:255',
                'consignees.*.city' => 'nullable|string|max:255',
                'consignees.*.country' => 'nullable|string|max:255',
                'consignees.*.mo_no' => 'nullable|string|max:20',
                'consignees.*.add' => 'nullable|string|max:500',
                'consignees.*.pincode' => 'nullable|string|max:20',
                'consignees.*.state' => 'nullable|string|max:255',
                'consignees.*.email' => 'nullable|email|max:255',
                'consignees.*.designation' => 'nullable|string|max:255',
            ]);
    
            foreach ($request->consignees as $consignee) {
                // Ensure 'id' is provided and update the existing consignee
                $existingConsignee = CustomerConsignee::where('lead_id', $request->lead_id)
                    ->where('cust_id', $request->cust_id)
                    ->find($consignee['id']);
    
                if ($existingConsignee) {
                    $existingConsignee->update([
                        'contact_person_name' => $consignee['contact_person_name'],
                        'add' => $consignee['add'] ?? $existingConsignee->add,
                        'city' => $consignee['city'] ?? $existingConsignee->city,
                        'pincode' => $consignee['pincode'] ?? $existingConsignee->pincode,
                        'country' => $consignee['country'] ?? $existingConsignee->country,
                        'state' => $consignee['state'] ?? $existingConsignee->state,
                        'mo_no' => $consignee['mo_no'] ?? $existingConsignee->mo_no,
                        'email' => $consignee['email'] ?? $existingConsignee->email,
                        'designation' => $consignee['designation'] ?? $existingConsignee->designation,
                    ]);
    
                    // Log the successful update
                    Log::info("Consignee updated successfully", [
                        'consignee_id' => $consignee['id'],
                        'lead_id' => $request->lead_id,
                        'cust_id' => $request->cust_id,
                    ]);
                } else {
                    // Log if no matching consignee found (this case should not occur due to validation)
                    Log::warning("Consignee not found for update", [
                        'consignee_id' => $consignee['id'],
                        'lead_id' => $request->lead_id,
                        'cust_id' => $request->cust_id,
                    ]);
                }
            }
    
            return response()->json([
                'message' => 'Customer consignees successfully updated.',
            ], 200);
    
        } catch (\Exception $e) {
            // Log the error with exception details
            Log::error("Error updating customer consignees", [
                'error' => $e->getMessage(),
                'lead_id' => $request->lead_id,
                'cust_id' => $request->cust_id,
            ]);
    
            return response()->json([
                'message' => 'An error occurred while updating customer consignees.',
                'error' => $e->getMessage(),
            ], 500);
        }
    }
    
    public function updateCustomerConsignees_directory_id(Request $request)
{
    try {
        // Validate input for a single consignee
        $request->validate([
            'lead_id' => 'required|exists:leads,id',
            'cust_id' => 'required|exists:lead_customers,id',
            'id' => 'required|exists:customer_consignees,id', // Single consignee ID
            'contact_person_name' => 'required|string|max:255',
            'city' => 'nullable|string|max:255',
            'country' => 'nullable|string|max:255',
            'mo_no' => 'nullable|string|max:20',
            'add' => 'nullable|string|max:500',
            'pincode' => 'nullable|string|max:20',
            'state' => 'nullable|string|max:255',
            'email' => 'nullable|email|max:255',
            'designation' => 'nullable|string|max:255',
        ]);

        // Find the existing consignee by ID
        $existingConsignee = CustomerConsignee::where('lead_id', $request->lead_id)
            ->where('cust_id', $request->cust_id)
            ->findOrFail($request->id);

        // Update the consignee details
        $existingConsignee->update([
            'contact_person_name' => $request->contact_person_name,
            'add' => $request->add ?? $existingConsignee->add,
            'city' => $request->city ?? $existingConsignee->city,
            'pincode' => $request->pincode ?? $existingConsignee->pincode,
            'country' => $request->country ?? $existingConsignee->country,
            'state' => $request->state ?? $existingConsignee->state,
            'mo_no' => $request->mo_no ?? $existingConsignee->mo_no,
            'email' => $request->email ?? $existingConsignee->email,
            'designation' => $request->designation ?? $existingConsignee->designation,
        ]);

        // Log the successful update
        Log::info("Consignee updated successfully", [
            'consignee_id' => $request->id,
            'lead_id' => $request->lead_id,
            'cust_id' => $request->cust_id,
        ]);

        return response()->json([
            'message' => 'Consignee successfully updated.',
        ], 200);

    } catch (\Exception $e) {
        // Log the error with exception details
        Log::error("Error updating consignee", [
            'error' => $e->getMessage(),
            'lead_id' => $request->lead_id,
            'cust_id' => $request->cust_id,
            'consignee_id' => $request->id,
        ]);

        return response()->json([
            'message' => 'An error occurred while updating the consignee.',
            'error' => $e->getMessage(),
        ], 500);
    }
}

public function deleteCustomerConsignees_directory_id(Request $request)
{
    try {
        // Validate input for a single consignee
        $request->validate([
            'lead_id' => 'required|exists:leads,id',
            'cust_id' => 'required|exists:lead_customers,id',
            'id' => 'required|exists:customer_consignees,id', // Single consignee ID
        ]);

        // Find the existing consignee by ID
        $existingConsignee = CustomerConsignee::where('lead_id', $request->lead_id)
            ->where('cust_id', $request->cust_id)
            ->findOrFail($request->id);

        // Delete the consignee
        $existingConsignee->delete();

        // Log the successful deletion
        Log::info("Consignee deleted successfully", [
            'consignee_id' => $request->id,
            'lead_id' => $request->lead_id,
            'cust_id' => $request->cust_id,
        ]);

        return response()->json([
            'message' => 'Consignee successfully deleted.',
        ], 200);

    } catch (\Exception $e) {
        // Log the error with exception details
        Log::error("Error deleting consignee", [
            'error' => $e->getMessage(),
            'lead_id' => $request->lead_id,
            'cust_id' => $request->cust_id,
            'consignee_id' => $request->id,
        ]);

        return response()->json([
            'message' => 'An error occurred while deleting the consignee.',
            'error' => $e->getMessage(),
        ], 500);
    }
}

    

    public function showCustomerConsigneeDirectory(Request $request)
    {
        $request->validate([
            'lead_id' => 'required|exists:leads,id',
            'cust_id' => 'required|exists:lead_customers,id',
        ]);
    
        // Fetch contacts based on lead_id and lead_cust_id
        $consignee = CustomerConsignee::where('lead_id', $request->lead_id)
            ->where('cust_id', $request->cust_id)
            ->get();
    
        return response()->json([
            'message' => 'Customer consignee fetched successfully.',
            'consignee' => $consignee,
        ], 200);
    }
    // public function assignLeadToSalesperson(Request $request)
    // {
    //     $user = Auth::user();

    //     if (!$user) {
    //         return response()->json(['message' => 'User not found'], 404);
    //     }

    //     $employee = Employee::with('role')
    //         ->where('user_id', $user->id)
    //         ->first();

    //     if (!$employee) {
    //         return response()->json(['message' => 'Employee not found for this user'], 404);
    //     }

    //     if ($employee->role && $employee->role->name != 'ADMIN') {
    //         return response()->json(['message' => 'You are not authorized to assign leads'], 403);
    //     }

    //     $validated = $request->validate([
    //         'id' => 'required|exists:leads,id', // Ensure the lead exists
    //         'salesperson_id' => 'required|exists:users,id', // Ensure the salesperson exists
    //     ]);


    //     $lead = Lead::find($validated['id']);
    //     // $salesperson = User::find($validated['salesperson_id']);
    //     $salespersonEmployee = Employee::where('user_id', $validated['salesperson_id'])->first();

    //     if ($salespersonEmployee && $salespersonEmployee->role && $salespersonEmployee->role->name != 'SDE') {
    //         return response()->json(['message' => 'The selected user is not a valid salesperson'], 400);
    //     }

    //     $lead->salesperson_id = $salespersonEmployee->id; // Assuming there's a salesperson_id column in the leads table
    //     $lead->save();

    //     return response()->json([
    //         'message' => 'Lead successfully assigned to salesperson',
    //         'lead' => $lead,
    //     ]);
    // }
public function assignLeadToSalesperson(Request $request)
{
    $user = Auth::user();

    if (!$user) {
        return response()->json(['message' => 'User not found'], 404);
    }

    $employee = Employee::with('role')
        ->where('user_id', $user->id)
        ->first();

    if (!$employee) {
        return response()->json(['message' => 'Employee not found for this user'], 404);
    }

    if ($employee->role && !in_array($employee->role->name, ['ADMIN', 'SDE-Manager'])) {
        return response()->json(['message' => 'You are not authorized to assign leads'], 403);
    }

    $validated = $request->validate([
        'id' => 'required|exists:leads,id',
        'salesperson_id' => 'required|exists:users,id',
    ]);

    $lead = Lead::find($validated['id']);
    
    // Check if lead is already assigned to any salesperson
    if (!is_null($lead->salesperson_id)) {
        return response()->json([
            'message' => 'Lead with ID ' . $lead->id . ' is already assigned to a salesperson',
        ], 400);
    }

    $salespersonEmployee = Employee::where('user_id', $validated['salesperson_id'])->first();

    if (!$salespersonEmployee || ($salespersonEmployee->role && $salespersonEmployee->role->name != 'SDE')) {
        return response()->json(['message' => 'The selected user is not a valid salesperson'], 400);
    }

    $lead->salesperson_id = $salespersonEmployee->id;
    $lead->save();

    return response()->json([
        'message' => 'Lead successfully assigned to salesperson',
        'lead' => $lead,
    ]);
}
   
    // public function assignLeadToSalesperson2(Request $request)
    // {
    //     $user = Auth::user();

    //     if (!$user) {
    //         return response()->json(['message' => 'User not found'], 404);
    //     }

    //     $employee = Employee::with('role')
    //         ->where('user_id', $user->id)
    //         ->first();

    //     if (!$employee) {
    //         return response()->json(['message' => 'Employee not found for this user'], 404);
    //     }

    //     if ($employee->role && $employee->role->name != 'ADMIN') {
    //         return response()->json(['message' => 'You are not authorized to assign leads'], 403);
    //     }

    //     $validated = $request->validate([
    //         'platform' => 'required|string|exists:leads,platform',
    //         'dates' => 'required|array',
    //         'dates.*' => 'date',
    //         'salesperson_ids' => 'required|array',
    //         'salesperson_ids.*' => 'exists:users,id',
    //     ]);

    //     $leads = Lead::where('platform', $validated['platform'])
    //     ->whereBetween('created_at', [
    //         Carbon::parse($validated['dates'][0])->startOfDay(),
    //         Carbon::parse($validated['dates'][0])->endOfDay(),
    //     ])
    //     ->get();
    

    //     if ($leads->isEmpty()) {
    //         return response()->json(['message' => 'No leads found for the selected criteria'], 404);
    //     }

    //     foreach ($leads as $lead) {
    //         foreach ($validated['salesperson_ids'] as $salesperson_id) {
    //             $salespersonEmployee = Employee::where('user_id', $salesperson_id)->first();

    //             if ($salespersonEmployee && $salespersonEmployee->role && $salespersonEmployee->role->name != 'SDE') {
    //                 return response()->json(['message' => 'The selected user is not a valid salesperson'], 400);
    //             }

    //             $lead->salesperson_id = $salespersonEmployee->id;
    //             $lead->save();
    //         }
    //     }

    //     return response()->json([
    //         'message' => 'Leads successfully assigned to salesperson(s)',
    //         'leads' => $leads,
    //     ]);
    // }

    public function getAssignedLeadDates()
    {
        $assignedLeads = DB::table('leads')
            ->join('employees', 'leads.salesperson_id', '=', 'employees.id')
            ->join('users', 'employees.user_id', '=', 'users.id')
            ->whereNotNull('leads.salesperson_id')
            ->select(
                DB::raw('DATE(leads.created_at) as assigned_date'),
                'employees.name as salesperson_name',
                'leads.platform',
                DB::raw('COUNT(leads.id) as total_leads')
            )
            ->groupBy(DB::raw('DATE(leads.created_at)'), 'employees.name', 'leads.platform')
            ->orderBy('assigned_date', 'desc')
            ->get();
    
        return response()->json([
            'message' => 'Assigned lead details fetched successfully',
            'data' => $assignedLeads
        ]);
    }
    

    public function assignLeadToSalesperson2(Request $request)
    {
        $user = Auth::user();
    
        if (!$user) {
            return response()->json(['message' => 'User not found'], 404);
        }
    
        $employee = Employee::with('role')
            ->where('user_id', $user->id)
            ->first();
    
        if (!$employee) {
            return response()->json(['message' => 'Employee not found for this user'], 404);
        }
    
     if ($employee->role && !in_array($employee->role->name, ['ADMIN', 'SDE-Manager'])) {
        return response()->json(['message' => 'You are not authorized to assign leads'], 403);
    }
    
        $validated = $request->validate([
            'platforms' => 'required|array',
            'platforms.*' => 'string|exists:leads,platform',
            'dates' => 'required|array',
            'dates.*' => 'date',
            'salesperson_id' => 'required|exists:users,id',
        ]);
    
        $salespersonEmployee = Employee::where('user_id', $validated['salesperson_id'])->first();
    
        if (!$salespersonEmployee || ($salespersonEmployee->role && $salespersonEmployee->role->name != 'SDE')) {
            return response()->json(['message' => 'The selected user is not a valid salesperson'], 400);
        }
    
        // Convert dates to Y-m-d format
        $dates = array_map(function($date) {
            return \Carbon\Carbon::parse($date)->toDateString();
        }, $validated['dates']);

        $leads = Lead::whereIn('platform', $validated['platforms'])
            ->whereIn(\DB::raw('DATE(created_at)'), $dates)
            ->get();
    
        if ($leads->isEmpty()) {
            return response()->json(['message' => 'The leads are already assigned on this date or No leads found for these dates'], 404);
        }
    
        foreach ($leads as $lead) {
            // Check if the lead is already assigned to the same salesperson
            if ($lead->salesperson_id == $salespersonEmployee->id) {
                return response()->json([
                    'message' => 'Lead with ID ' . $lead->id . ' is already assigned to this salesperson',
                ], 400);
            }
    
            // Assign the lead to the salesperson
            $lead->salesperson_id = $salespersonEmployee->id;
            $lead->save();
        }
    
        return response()->json([
            'message' => 'Leads successfully assigned to salesperson',
            'leads' => $leads,
        ]);
    }
    
    


    public function getLeadsBySalesperson(Request $request)
    {
        // Validate the incoming request
        $validated = $request->validate([
            'salesperson_id' => 'required|exists:employees,id', // Ensure the salesperson exists
        ]);

        // Fetch leads based on the salesperson_id in descending order by created_at
        $leads = Lead::where('salesperson_id', $validated['salesperson_id'])
            ->orderBy('created_at', 'desc')
            ->get();

        if ($leads->isEmpty()) {
            return response()->json(['message' => 'No leads found for the specified salesperson'], 404);
        }

        return response()->json([
            'message' => 'Leads successfully retrieved',
            'leads' => $leads,
        ], 200);
    }
    public function Salesperson_List(Request $request)
    {
        // Fetch the id and name of employees with role_id = 2
        $employee_list = Employee::where('role_id', 3)
            ->select('id','user_id', 'name')
            ->get();
    
        // Check if the result is empty
        if ($employee_list->isEmpty()) {
            return response()->json([
                'message' => 'No salespersons found',
                'employee_list' => [],
            ], 404); 
        }
    
        return response()->json([
            'message' => 'Salesperson List',
            'employee_list' => $employee_list,
        ]);
    }

    public function Salesperson_List_new(Request $request)
    {
        // Fetch employees with role_id = 3 (salespersons) and their assigned leads
        $employee_list = Employee::where('role_id', 3)
            ->select('id', 'user_id', 'name', 'is_under_id')
            ->with([
                'leads' => function($query) {
                    $query->select('salesperson_id', 'platform');
                },
                'manager' => function($query) { // Add manager relationship
                    $query->select('id', 'name');
                }
            ])
            ->get()
            ->map(function($employee) {
                // Get platforms and their counts for each employee
                $platformCounts = $employee->leads
                    ->groupBy('platform')
                    ->map(function($leads) {
                        return $leads->count();
                    });

                // Get unique platforms with their counts
                $platforms = $platformCounts->map(function($count, $platform) {
                    return [
                        'name' => $platform,
                        'count' => $count
                    ];
                })->values();

                return [
                    'id' => $employee->id,
                    'user_id' => $employee->user_id,
                    'name' => $employee->name,
                    'manager_name' => $employee->manager ? $employee->manager->name : null, // Include manager name
                    'platforms' => $platforms,
                    'total_leads' => $employee->leads->count()
                ];
            });

        // Check if the result is empty
        if ($employee_list->isEmpty()) {
            return response()->json([
                'message' => 'No salespersons found',
                'employee_list' => [],
            ], 404);
        }

        return response()->json([
            'message' => 'Salesperson List',
            'employee_list' => $employee_list,
        ]);
    }
   

    public function filter_by_platform(Request $request)
    {
        // Validate the incoming request
        $validated = $request->validate([
            'platform' => 'required|string', // Ensure the platform parameter is provided and is a string
        ]);

        // Fetch leads based on the platform
        $leads = Lead::where('platform', $validated['platform'])->get();

        if ($leads->isEmpty()) {
            return response()->json(['message' => 'No leads found for the specified platform'], 404);
        }

        return response()->json([
            'message' => 'Leads successfully retrieved',
            'leads' => $leads,
        ], 200);
    }


    public function getSender(Request $request)
    {
        try {
            // Validate the request
            $validated = $request->validate([
                'lead_id' => 'required|exists:leads,id'
            ]);

            // Find the lead
            $lead = Lead::find($validated['lead_id']);

            if (!$lead) {
                return response()->json([
                    'message' => 'Lead not found'
                ], 404);
            }

            // Return the sender name
            return response()->json([
                'success' => true,
                'sender_name' => $lead->sender_name
            ], 200);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false, 
                'message' => 'Error retrieving sender name',
                'error' => $e->getMessage()
            ], 500);
        }
    }
    // public function sales_customer_list()
    // {
    //      $customer_list = Lead_customer::select('id','sender_name','sender_mobile','sender_email')->get();
    //        return response()->json([
    //         'customer_list' => $customer_list
    //     ], 200);
    // }
    public function sales_customer_list()
    {
        $user = Auth::user();

        if (!$user) {
            return response()->json(['message' => 'User not found'], 404);
        }

        // Get the employee linked to the logged-in user with their role
        $employee = Employee::with('role')->where('user_id', $user->id)->first();

        if (!$employee) {
            return response()->json(['message' => 'Employee not found'], 404);
        }

        // Initialize query for Lead_customer
        // $query = Lead_customer::select(
        //     'lead_customers.id',
        //     'lead_customers.sender_name',
        //     'lead_customers.sender_mobile', 
        //     'lead_customers.sender_email',
        //     'lead_customers.sender_company',
        //     'leads.sender_country_iso' // Changed to get country from leads table
        // )
        // ->leftJoin('leads', 'lead_customers.id', '=', 'leads.customer_id')
        // ->groupBy(
        //     'lead_customers.id',
        //     'lead_customers.sender_name',
        //     'lead_customers.sender_mobile',
        //     'lead_customers.sender_email',
        //     'lead_customers.sender_company',
        //     'leads.sender_country_iso' // Changed groupBy to match the select
        // )
        $query = Lead_customer::select(
            'id',
            'sender_name',
            'sender_mobile',
            'sender_email',
            'sender_company',
            'customer_status'
        )
        ->selectRaw('1 as leads_count');

        // If user is not admin, filter by assigned leads
        if ($employee->role && $employee->role->name !== 'ADMIN') {
            $query->whereIn('id', function($subquery) use ($employee) {
            $subquery->select('customer_id')
                ->from('leads')
                ->where('salesperson_id', $employee->id);
            });
        }

        $customer_list = $query->get();

        if ($customer_list->isEmpty()) {
            $message = $employee->role && $employee->role->name === 'ADMIN' 
                ? 'No customers found' 
                : 'No leads assigned to this salesperson';
            return response()->json(['message' => $message], 404);
        }

        return response()->json([
            'customer_list' => $customer_list,
            'user_role' => $employee->role ? $employee->role->name : 'No role assigned'
        ], 200);
    }





    public function customer_contact_person_list(Request $request)
    {
        $validated = $request->validate([
            'customer_id' => 'required', 
        ]);

        $leads = CustomerContactPerson::where('lead_cust_id', $validated['customer_id'])->get();

        if ($leads->isEmpty()) {
            return response()->json(['message' => 'No leads found'], 404);
        }

        return response()->json([
            'message' => 'Leads successfully retrieved',
            'leads' => $leads,
        ], 200);
    }


    public function customer_list_lead(Request $request)
    {
        $validated = $request->validate([
            'customer_id' => 'required', 
        ]);

        $leads = Lead::where('customer_id', $validated['customer_id'])->get();

        if ($leads->isEmpty()) {
            return response()->json(['message' => 'No leads found'], 404);
        }

        return response()->json([
            'message' => 'Leads successfully retrieved',
            'leads' => $leads,
        ], 200);
    }


    public function addQualifiedLead(Request $request)
    {
        try {
            // Validate required fields
            $validated = $request->validate([
                'sender_name' => 'required|string|max:255',
                'sender_mobile' => 'required|string|max:20',
                'sender_email' => 'required|email|max:255',
                'sender_company' => 'nullable|string|max:255',
                'sender_address' => 'nullable|string|max:500',
                'sender_city' => 'nullable|string|max:255', 
                'sender_state' => 'nullable|string|max:255',
                'sender_pincode' => 'nullable|string|max:20',
                'sender_country_iso' => 'nullable|string|max:3',
                // 'query_product_name' => 'required|string|max:255'
            ]);

            // Generate unique query ID (9 digits)
            $uniqueQueryId = mt_rand(100000000, 999999999);

            // Check if customer already exists
            $customer = Lead_customer::where('sender_mobile', $validated['sender_mobile'])->first();

            // If customer doesn't exist, create new customer
            if (!$customer) {
                $customer = Lead_customer::create([
                    'sender_name' => $validated['sender_name'],
                    'sender_mobile' => $validated['sender_mobile'],
                    'sender_email' => $validated['sender_email'],
                    'sender_company' => $validated['sender_company'],
                    'address' => $validated['sender_address'],
                    'city' => $validated['sender_city'],
                    'state' => $validated['sender_state'],
                    'pincode' => $validated['sender_pincode'],
                    'country_iso' => $validated['sender_country_iso']
                ]);
            }

            // Create lead record
            $lead = Lead::create([
                'unique_query_id' => $uniqueQueryId,
                'customer_id' => $customer->id,
                'query_type' => 'Manual',
                'query_time' => now()->format('Y-m-d H:i:s'),
                'sender_name' => $validated['sender_name'],
                'sender_mobile' => $validated['sender_mobile'],
                'sender_email' => $validated['sender_email'],
                'sender_company' => $validated['sender_company'],
                'sender_address' => $validated['sender_address'],
                'sender_city' => $validated['sender_city'],
                'sender_state' => $validated['sender_state'],
                'sender_pincode' => $validated['sender_pincode'],
                'sender_country_iso' => $validated['sender_country_iso'],
                // 'query_product_name' => $validated['query_product_name'],
                'platform' => 'Offline',
                'qualified' => 1,
                'sender_mobile_alt' => null,
                'sender_email_alt' => null,
                'query_message' => null,
                'query_mcat_name' => null,
                'call_duration' => null,
                'receiver_mobile' => null,
                'disqualified' => 0,
                'product_quantity' => null,
                'salesperson_id' => null,
                'is_agent_qualified_lead' => null
            ]);

            return response()->json([
                'message' => 'Qualified lead created successfully',
                'lead' => $lead,
                'is_new_customer' => !$customer->wasRecentlyCreated
            ], 201);

        } catch (\Exception $e) {
            Log::error('Error creating qualified lead: ' . $e->getMessage());
            return response()->json([
                'message' => 'Error creating qualified lead',
                'error' => $e->getMessage()
            ], 500);
        }
    }
    


public function getPlatformBySalesperson(Request $request)
    {
        // Validate request
        $validated = $request->validate([
            'id' => 'required_without:user_id|exists:employees,id',
            'user_id' => 'required_without:id|exists:employees,user_id'
        ]);

        // Build query based on provided parameter
        $query = Employee::where('role_id', 3);
        if (isset($validated['id'])) {
            $query->where('id', $validated['id']);
        } else {
            $query->where('user_id', $validated['user_id']);
        }

        // Fetch employee with relationships
        $employee = $query->select('id', 'user_id', 'name', 'is_under_id')
            ->with([
                'leads' => function($query) {
                    $query->select('salesperson_id', 'platform');
                },
                'manager' => function($query) {
                    $query->select('id', 'name');
                }
            ])
            ->first();

        if (!$employee) {
            return response()->json([
                'message' => 'Salesperson not found',
            ], 404);
        }

        // Format the response
        $platformCounts = $employee->leads
            ->groupBy('platform')
            ->map(function($leads) {
                return $leads->count();
            });

        $platforms = $platformCounts->map(function($count, $platform) {
            return [
                'name' => $platform,
                'count' => $count
            ];
        })->values();

        $response = [
            'id' => $employee->id,
            'user_id' => $employee->user_id,
            'name' => $employee->name,
            'manager_name' => $employee->manager ? $employee->manager->name : null,
            'platforms' => $platforms,
            'total_leads' => $employee->leads->count()
        ];

        return response()->json([
            'message' => 'Salesperson platform details retrieved successfully',
            'data' => $response
        ], 200);
    }

    
}
