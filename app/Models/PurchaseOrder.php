<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use App\Services\FinancialYearService;
use Illuminate\Database\Eloquent\SoftDeletes;

class PurchaseOrder extends Model
{
    use HasFactory;
    use SoftDeletes;
    protected $fillable = [
        'purchase_order_number',
        'order_date',
        'expected_delivery_date',
        'po_type',
        'ffd_id',
        'product_names',
        'vendor_id',
        'employee_name',
        'document_type',
        'state_code',
        'business_task_id',
        'currency_id',
        'exchange_rate',
        'port_of_loading',
        'port_of_discharge',
        'final_destination',
        'origin_country',
        'inco_term_id',
        'net_weight',
        'gross_weight',
        'shp_charge',
        'pkg_charge',
        'other_charge',
        'total',
        'igst',
        'cgst',
        'sgst',
        'grand_total',
        'terms_and_conditions',
        'purchase_order_product_ids',
        'created_by',
        'rejected_by',
        'rejected',
        'checker_id',
        'company_id',
        'approved'
    ];

    public function getLatestId() {

        $fy_service = new FinancialYearService;
        $fy_year = $fy_service->getFinancialYear();

        $company_id = session('company_id') ?? 1;
        $short_code = Companies::where('id', $company_id)->value('short_code');

        if($company_id == 1) {
            //Inorbvict Healthcare will continue its series
            $default = "PO/" . $fy_year ."/". 1001; //default purchase order number for Inorbvict
            $po = $this->where('company_id',$company_id)->orderBy('id','DESC')->first();
            if($po == null){
                return $default;
            } else {
                $po_number = explode("/", $po->purchase_order_number);
                $po_number = $po_number[2];

                return "PO/" . $fy_year ."/". $po_number + 1;
            }
        } else {
            //Any other company apart from Inorbvict Healthcare will generate PO number
            $count = $this->where('company_id',$company_id)->withTrashed()->count();
            return "PO-". $short_code ."/". $fy_year ."/". $count + 1001;
        }
    }

    /**
     * @return \Illuminate\Database\Eloquent\Relations\BelongsTo
     */
    public function vendor()
    {
        return $this->belongsTo(Vendor::class, 'vendor_id', 'id');
    }

    /**
     * @return \Illuminate\Database\Eloquent\Relations\BelongsTo
     */
    public function inco()
    {
        return $this->belongsTo(IncoTerm::class, 'inco_term_id', 'id');
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
    public function payment_history()
    {
        return $this->hasMany(PaymentHistoryBt::class, 'po_id', 'id');
    }

    /**
     * @return \Illuminate\Database\Eloquent\Relations\HasMany
     */
    public function po_products()
    {
        return $this->hasMany(PurchaseOrderProduct::class, 'purchase_order_id');
    }

    /**
     * @return \Illuminate\Database\Eloquent\Relations\HasMany
     */
    public function quotation_attach()
    {
        return $this->hasMany(PO_Quotation_AttachmentModel::class, 'po_id');
    }

    /**
     * @return \Illuminate\Database\Eloquent\Relations\BelongsTo
     */
    public function ffd()
    {
        return $this->belongsTo(Ffd::class, 'ffd_id', 'id');
    }

    /**
     * @return \Illuminate\Database\Eloquent\Relations\BelongsTo
     */
    public function business_task()
    {
        return $this->belongsTo(BusinessTask::class, 'business_task_id', 'id');
    }
}
