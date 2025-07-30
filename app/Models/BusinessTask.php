<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class BusinessTask extends Model
{
    use HasFactory;
    protected $fillable = [
        'date',
        'opportunity_id',
        'opportunity_date',
        'customer_name',
        'segment',
        'category',
        'enquiry',
        'task_status',
        'lead_stage',
        'sde_team',
        'client_email',
        'enquiry_date_time',
        'client_company',
        'mob',
        'enq_msg',
        'enq_address',
        'enq_city',
        'enq_state',
        'product_name',
        'country',
        'alt_email',
        'alt_mobile',
        'phone',
        'alt_phone',
        'member_since',
        'customerfeedbackform',
        'customer_type',
        'priority',
        'stock_position',
        'inorbvict_commitment',
        'shipping_liabelity',
        'dimension_of_boxes',
        'volume_weight',
        'gross_wt',
        'cold_chain',
        'inco_term_id',
        'port_of_unloading',
        'transportation',
        'final_destination',
        'destination_code',
        'shipment_mode',
        'comments',
        'sourcing_due_date',
        'sourcing_status',
        'overdue',
        'make1',
        'model1',
        'supplier_name2',
        'warranty_extension',
        'product_authenticity',
        'physical_verification',
        'lead_time',
        'custvsvendcommitment',
        'expiry',
        'proformainvvsvendorqot',
        'quantity1',
        'technicalspecipm',
        'productspecicrutiny',
        'condition1',
        'product_type1',
        'transportation_cost',
        'warrenty',
        'year_of_manufacturing1',
        'packaging_cost',
        'freight_target_cost',
        'net_weight',
        'invoice_id',
        'company_id',
        'created_by'
    ];

    /**
     * @return \Illuminate\Database\Eloquent\Relations\BelongsTo
     */
    public function segments()
    {
        return $this->belongsTo(Segment::class, 'segment', 'id');
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
    public function categories()
    {
        return $this->belongsTo(Category::class, 'category', 'id');
    }

    /**
     * @return \Illuminate\Database\Eloquent\Relations\BelongsTo
     */
    public function userDetails()
    {
        return $this->belongsTo(Employee::class, 'created_by', 'user_id');
    }

    /**
     * @return \Illuminate\Database\Eloquent\Relations\BelongsTo
     */
    public function incoTermDetails()
    {
        return $this->belongsTo(IncoTerm::class, 'inco_term_id', 'id');
    }

    /**
     * @return \Illuminate\Database\Eloquent\Relations\HasOne
     */
    public function inwards() {
        return $this->hasOne(Warehouse::class, 'business_task_id');
    }

    /**
     * @return \Illuminate\Database\Eloquent\Relations\HasMany
     */
    public function invoices()
    {
        return $this->hasMany(Invoice::class, 'business_task_id');
    }

    /**
     * @return \Illuminate\Database\Eloquent\Relations\HasMany
     */
    public function irms()
    {
        return $this->hasMany(Irm::class, 'business_task_id');
    }
    /**
     * @return \Illuminate\Database\Eloquent\Relations\HasMany
     */
    public function purchase_orders()
    {
        return $this->hasMany(PoDetailsBt::class, 'business_task_id');
    }

    /**
     * @return \Illuminate\Database\Eloquent\Relations\HasMany
     */
    public function proforma_invoice()
    {
        return $this->hasMany(SdeAttachmentBt::class, 'business_task_id')->where('attachment_name', 'Proforma Invoice');
    }

    // /**
    //  * @return \Illuminate\Database\Eloquent\Relations\HasMany
    //  */
    // public function linked_po()
    // {
    //     return $this->hasMany(PurchaseOrder::class, 'business_task_id');
    // }
}
