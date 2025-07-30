<?php

namespace App\Models;

use App\Services\FinancialYearService;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\SoftDeletes;

class Invoice extends Model
{
    use HasFactory;
    use SoftDeletes;
    protected $fillable = [
        'invoice_number',
        'invoice_date',
        'bank_id',
        'buyer_id',
        'consignee_ids',
        'currency',
        'exchange_rate',
        'port_of_loading',
        'port_of_discharge',
        'final_destination',
        'origin_country',
        'inco_term_id',
        'total_net_weight',
        'total_gross_weight',
        'grand_total',
        'invoice_product_ids',
        'invoice_weight_ids',
        'invoice_irm_ids',
        'quotation_id',
        'po_number',
        'po_date',
        'sli_number',
        'dc_number',
        'remmittance_value',
        'received_amount',
        'shipment_type',
        'total_value_weight',
        'freight_weight',
        'pre_carriage_by',
        'placereceiptprecarrier',
        'payment_terms',
        'vessel_no',
        'no_of_packages',
        'international_ffd_id',
        'lut_export_under_bond',
        'exportpaymentofigst',
        'nature_of_payment',
        'exw_value',
        'domestic_ffd_id',
        'insurance',
        'commission',
        'discount',
        'free_trade_sample',
        'eou_shipping_bill',
        'duty_drawback',
        'epcg_shipping_bill',
        'licenceshippingbill',
        'rebate_of_state_levies',
        'repair_and_return',
        'advance_authorization',
        'drwaback_or_rosctl',
        'epcg',
        'nfei',
        'jobbing',
        're_export',
        'drawback_epcg',
        'eou',
        'mesi',
        'any_other',
        'dbk_sl_no',
        'regnnoanddtofepcglic',
        'regnnodtepcglicregcopy',
        'noadditionaldocrequire',
        'orginable',
        'invoice_copies',
        'packing_list_copies',
        'non_dg_declaration',
        'lab_analysis_report',
        'msds',
        'phytosanitary_cert',
        'visa_aepc_endorsement',
        'letter_to_dc',
        'gspcertificateoforigin',
        'bank_certificate',
        'annexure_a',
        'invitemnumberregno',
        'invitemnumberregnodate',
        'authorization_epcg',
        'method_of_valuation',
        'buyer_saller_related',
        'buyersallerprice',
        'tracking_or_awb_number',
        'ein_no',
        'under_lut',
        'special_instuction',
        'preferentialagreement',
        'standardunitdetails',
        'state_of_origin_item',
        'districtoforiginitem',
        'exporter_type',
        'evd',
        'advathoepcddtlregno',
        'pickupreferencenumber',
        'sdf_fema_declaration',
        'extratermsconditions',
        'nature_of_transaction',
        'remarks',
        'ad_code',
        'all_symbol',
        'volum_range',
        'duty_free_commercial',
        'non_drawback',
        'allSymbol',
        'logistics_id',
        'regulatory_id',
        'ebrc_id',
        'business_task_id',
        'examine_id',
        'created_by',
        'rejected_by',
        'rejected',
        'checker_id',
        'approved',
        'outward_id',
        'psd_id',
        'company_id'
    ];

    /**
     * @return \Illuminate\Database\Eloquent\Relations\BelongsTo
     */
    public function quotation()
    {
        return $this->belongsTo(Quotation::class, 'quotation_id', 'id');
    }

    /**
     * @return \Illuminate\Database\Eloquent\Relations\BelongsTo
     */
    public function buyer()
    {
        return $this->belongsTo(Customer::class, 'buyer_id', 'id');
    }

    /**
     * @return \Illuminate\Database\Eloquent\Relations\BelongsTo
     */
    public function consignee()
    {
        return $this->belongsTo(Consignee::class, 'consignee_ids', 'id');
    }

    /**
     * @return \Illuminate\Database\Eloquent\Relations\BelongsTo
     */
    public function currency()
    {
        return $this->belongsTo(Currency::class, 'currency_id', 'id');
    }

    /**
     * @return \Illuminate\Database\Eloquent\Relations\BelongsTo
     */
    public function incoTerm()
    {
        return $this->belongsTo(IncoTerm::class, 'inco_term_id', 'id');
    }

    /**
     * @return \Illuminate\Database\Eloquent\Relations\BelongsTo
     */
    public function ffdInternational()
    {
        return $this->belongsTo(Ffd::class, 'international_ffd_id', 'id');
    }

    /**
     * @return \Illuminate\Database\Eloquent\Relations\BelongsTo
     */
    public function ffdDomestic()
    {
        return $this->belongsTo(Ffd::class, 'domestic_ffd_id', 'id');
    }

    /**
     * @return \Illuminate\Database\Eloquent\Relations\BelongsTo
     */
    public function bank()
    {
        return $this->belongsTo(BankAccount::class, 'bank_id', 'id');
    }

    /**
     * @return \Illuminate\Database\Eloquent\Relations\hasOne
     */
    public function regulatory_psd()
    {
        return $this->hasOne(RegulatoryDashboard::class, 'invoice_id');
    }

    /**
     * @return \Illuminate\Database\Eloquent\Relations\hasMany
     */
    public function proforma_attachment()
    {
        return $this->hasMany(ProfarmaInvoiceAttachment::class, 'invoice_id');
    }

    /**
     * @return \Illuminate\Database\Eloquent\Relations\hasMany
     */
    public function firc_attachment()
    {
        return $this->hasMany(FircAttachment::class, 'invoice_id');
    }

    /**
     * @return \Illuminate\Database\Eloquent\Relations\hasMany
     */
    public function tax_purchase_invoices()
    {
        return $this->hasMany(TaxPurchaseAttachment::class, 'invoice_id');
    }

    /**
     * @return \Illuminate\Database\Eloquent\Relations\hasMany
     */
    public function ebrc()
    {
        return $this->hasOne(Ebrc::class, 'invoice_id');
    }

    public function getLatestId() {
        $fy_service = new FinancialYearService;
        $fy_year = $fy_service->getFinancialYear();

        $company_id = session('company_id') ?? 1;
        $short_code = Companies::where('id', $company_id)->value('short_code');

        if($company_id == 1) {
            //Inorbvict Healthcare will continue its series
            $default = "INV/" . $fy_year ."/". 0001;
            $invoice = $this->where('company_id',$company_id)->orderBy('id','DESC')->first();
            if($invoice == null) {
                return $default;
            } else {
                $invoice_number = explode("/", $invoice->invoice_number);
                return "INV/" . $fy_year ."/". $invoice_number[2] + 1;
            }
        } else {
            //Any other company apart from Inorbvict Healthcare will generate PI number
            $count = $this->where('company_id',$company_id)->withTrashed()->count();
            return "INV-". $short_code ."/". $fy_year ."/". $count + 1001;
        }
    }
}
