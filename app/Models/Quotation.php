<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use App\Services\FinancialYearService;
use Illuminate\Database\Eloquent\SoftDeletes;

class Quotation extends Model
{
    use HasFactory;
    use SoftDeletes;
    protected $fillable = [
        'pi_number',
        'pi_date',
        'document_type',
        'buyer_id',
        'consignee_id',
        'sales_manager_id',
        'bank_id',
        'state_code',
        'currency_id',
        'exchange_rate',
        'port_of_loading',
        'port_of_discharge',
        'final_destination',
        'origin_country',
        'inco_term_id',
        'net_weight',
        'gross_weight',
        'igst',
        'cgst',
        'sgst',
        'total',
        'shipping_cost',
        'grand_total',
        'terms_and_conditions',
        'pi_product_ids',
        'created_by',
        'rejected_by',
        'rejected',
        'checker_id',
        'company_id',
        'business_task_id',
        'approved',
        'lead_id',
        'lead_customer_id'

    ];

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
        return $this->belongsTo(Consignee::class, 'consignee_id', 'id');
    }

    /**
     * @return \Illuminate\Database\Eloquent\Relations\BelongsTo
     */
    public function bankDetails()
    {
        return $this->belongsTo(BankAccount::class, 'bank_id', 'id');
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
    public function inco_term()
    {
        return $this->belongsTo(IncoTerm::class, 'inco_term_id', 'id');
    }

    /**
     * @return \Illuminate\Database\Eloquent\Relations\BelongsTo
     */
    public function employeeDetails()
    {
        return $this->belongsTo(Employee::class, 'sales_manager_id', 'id');
    }

    /**
     * @return \Illuminate\Database\Eloquent\Relations\BelongsTo
     */
    public function sdeAttachment()
    {
        return $this->hasOne(SdeAttachmentBt::class, 'attachment_details', 'id')->where('attachment_name', 'Proforma Invoice');
    }

    /**
     * @return \Illuminate\Database\Eloquent\Relations\hasMany
     */
    public function quotation_products()
    {
        return $this->hasMany(QuotationProduct::class, 'pi_order_id', 'id');
    }

    /**
     * @return \Illuminate\Database\Eloquent\Relations\BelongsTo
     */
    public function lead()
    {
        return $this->belongsTo(Lead::class, 'lead_id', 'id');
    }

    public function getLatestId() {
        $fy_service = new FinancialYearService;
        $fy_year = $fy_service->getFinancialYear();

        $company_id = session('company_id') ?? 1;
        $short_code = Companies::where('id', $company_id)->value('short_code');

        if($company_id == 1) {
            //Inorbvict Healthcare will continue its series
            $default = "PI/" . $fy_year ."/". 2001;
            $quotation = $this->where('company_id',$company_id)->orderBy('id','DESC')->first();
            if($quotation == null) {
                return $default;
            } else {
                $pi_number = explode("/", $quotation->pi_number);
                $pi_number = $pi_number[2];
                if($pi_number > 2000){
                    $pi_num = $pi_number + 1;
                    $default = "PI/" . $fy_year ."/". $pi_num;
                }
                return $default;
            }
        } else {
            //Any other company apart from Inorbvict Healthcare will generate PI number
            $count = $this->where('company_id',$company_id)->withTrashed()->count();
            return "PI-". $short_code ."/". $fy_year ."/". $count + 1001;
        }
    }
}
