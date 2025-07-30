@include('admin.common.document-header')
    <hr style="border: 1px solid red;margin-top:5px;margin-bottom:5px;">
    <table class="full-w">
        <tr>
            <td class="w-40" style="font-size:11px;vertical-align: top;">
                            <strong>Buyer Name : </strong>{{ $buyerDetails->name }}<br>
                            {{ $buyerDetails->address }}<br>{{ $buyerDetails->city }} {{ $buyerDetails->country_name }}<br>
                            {{ $buyerDetails->pin_code }}<br>{{ $buyerDetails->email }}
                            {{ $buyerDetails->contact_no }}
            </td>
            <td class="w-20"></td>
            <td class="w-40"  rowspan="2" style="font-size:11px;vertical-align: top;">
                <strong>Invoice No : </strong>{{ $invoice->invoice_number }} <br>
                <strong>Date : </strong>{{ date("d/m/Y", strtotime($invoice->invoice_date)) }}<br>
                <strong>Currency : </strong>{{ $invoice->currency }} <br>
                <strong>Port Of Loading : </strong>{{ $invoice->port_of_loading }} <br>
                <strong>Port of Discharge : </strong>{{ $invoice->port_of_discharge }} <br>
                <strong>Final Destination : </strong>{{ $invoice->final_destination }} <br>
                <strong>Country of Origin : </strong>{{ $invoice->origin_country }} <br>
                <strong>Incoterm : </strong>{{ $invoice->incoterm->inco_term }} <br>
                <strong>Total Net Weight(kg) : </strong>{{ $invoice->total_net_weight }} <br>
                <strong>Total Gross Weight(kg) : </strong>{{ $invoice->total_gross_weight }} <br>
                <strong>Total Vol Weight(kg) : </strong>{{ $invoice->total_value_weight }} <br>
                <strong>No. of Boxes : </strong>{{ $invoice->no_of_packages }} <br>
                <strong>AWB/BL No : </strong>{{ $invoice->tracking_or_awb_number }}
            </td>
        </tr>
        <tr>
            <td class="w-40" style="font-size:11px;vertical-align: top;">
                @if (!empty($invoice->consignee_ids))
                    <strong>Consignee Name : </strong>{{ $consigneeDetails->name ?? '' }}<br>
                    {{ $consigneeDetails->address ?? '' }}<br>
                    {{ $consigneeDetails->city ?? '' }} {{ $consigneeDetails->state_name ?? '' }}<br>
                    {{ $consigneeDetails->country_name ?? '' }} {{ $consigneeDetails->pin_code ?? '' }}<br>
                    {{ $consigneeDetails->email ?? '' }}{{ $consigneeDetails->mobile ?? '' }}
                @endif
            </td>
            <td class="w-20"></td>
        </tr>
    </table>
    <hr style="border: 1px solid red;margin-top:5px;margin-bottom:5px;">
    <table class="full-w">
        <tr>
            <td width="33.33%" style="font-size:11px;vertical-align: top;">
                <strong>Exporter Type/Mfg : </strong>{{ $invoice->exporter_type }}<br>
                <strong>Breakup Cost : </strong>{{ $symbol->symbol }} {{ number_format($invoice->exw_value, 2) }}<br>
                <strong>Freight : </strong>{{ $symbol->symbol }} {{ number_format($invoice->freight_weight, 2) }}<br>
                <strong>Insurance : </strong> {{ $symbol->symbol }} {{ number_format($invoice->insurance, 2) }}<br>
                <strong>Currency Code : </strong>{{ $invoice->currency }}<br>
                <strong>Payment Term : </strong>{{ $invoice->payment_terms }}<br>
                <strong>Export Against : </strong>{{ $invoice->exportpaymentofigst }}
            </td>
            <td width="33.33%" style="font-size:11px;vertical-align: top;">
                <strong>Type Of Shipping Bill : </strong><br>
                <strong>Duty Drawback : </strong>{{ $invoice->duty_drawback }}<br>
                <strong>NFEI : </strong>{{ $invoice->nfei }}<br>
                <strong>Jobbing : </strong>{{ $invoice->jobbing }}<br>
                <strong>Repair & Return : </strong>{{ $invoice->repair_and_return }}<br>
                <strong>Advance Authorization (AA) : </strong>{{ $invoice->advance_authorization }}<br>
                <strong>Drawback / ROSCTL : </strong>{{ $invoice->drwaback_or_rosctl }}
            </td>
            <td width="33.33%" style="font-size:11px;vertical-align: top;">
                <strong>Re-Export : </strong>{{ $invoice->re_export }}<br>
                <strong>Drawback+EPCG : </strong>{{ $invoice->drawback_epcg }}<br>
                <strong>RoDTEP : </strong>{{ $invoice->mesi }}<br>
                <strong>EOU: </strong>{{ $invoice->eou }}<br>
                <strong>EPCG (Concesnal or zero duty) : </strong>{{ $invoice->epcg }}<br>
                <strong>Free trade sample : </strong> {{ $invoice->free_trade_sample }}<br>
                <strong>Duty free : </strong> {{ $invoice->duty_free_commercial }}<br>
                <strong>Advance license shipping bill : </strong> {{ $invoice->licenceshippingbill }}
            </td>
        </tr>
    </table>
    <hr style="border: 1px solid red;margin-top:5px;margin-bottom:5px;">
    <section class="product-area" style="margin-top:10px;">
        <table style="font-size:11px;width:100%;">
            <thead>
                <tr>
                    <th class="w-5">SrNo</th>
                    <th class="w-25">Product Name</th>
                    <th class="w-50">Description</th>
                    <th class="w-10">HSN Code</th>
                    <th class="w-10">Quantity</th>
                </tr>
            </thead>
            <tbody>
                @foreach ($invoiceProducts as $invoiceProduct)
                <tr class="text-left" style="vertical-align:top;">
                    <td class="w-5">{{ $loop->iteration }}</td>
                    <td class="w-25">{{ $invoiceProduct->product_name }}</td>
                    <td class="w-50">{{ $invoiceProduct->description }}</td>
                    <td class="w-10">{{ $invoiceProduct->hsn }}</td>
                    <td class="w-10">{{ $invoiceProduct->quantity }}</td>
                </tr>
                @endforeach
            </tbody>
        </table>
    </section>

    <table class="full-w" style="margin-top: 10px;font-size:10px;">
        <tr style="vertical-align: top;">
            <td>
                <strong>AWB/ BL (duly complete) : </strong> {{ $invoice->tracking_or_awb_number }}
            </td>
            <td>
                <strong>Original, Duplicate Visa (with 2 copies) : </strong> {{ $invoice->visa_aepc_endorsement }}
            </td>
            <td>
                <strong>PRE CARRIAGE BY : </strong>{{ $invoice->pre_carriage_by }}
            </td>
        </tr>

        <tr style="vertical-align: top;">
            <td>
                <strong>Certificate of Origin ? : </strong> {{ $invoice->gspcertificateoforigin }}
            </td>
            <td>
                <strong>Bank Certificate ( GR Waiver) : </strong> {{ $invoice->bank_certificate }}
            </td>
            <td>
                <strong>PLACE OF RECEIPT BY PRECARRIER : </strong>{{ $invoice->placereceiptprecarrier }}
            </td>
        </tr>

        <tr style="vertical-align: top;">
            <td>
                <strong>Invoice (6 copies) : </strong> {{ $invoice->invoice_copies }}
            </td>
            <td>
                <strong>EVD (Export Value Declaration)  : </strong> {{ $invoice->evd }}
            </td>
            <td>
                <strong>Advance Authorisation / EPCG Details : </strong>{{ $invoice->invitemnumberregno }}
            </td>
        </tr>

        <tr style="vertical-align: top;">
            <td>
                <strong>Packing List (5 copies) : </strong> {{ $invoice->packing_list_copies }}
            </td>
            <td>
                <strong>SDF / FEMA declaration : </strong> {{ $invoice->sdf_fema_declaration }}
            </td>
            <td>
                <strong>Inv Item No REG No : (If Lic prior to 2009)</strong>
            </td>
        </tr>

        <tr style="vertical-align: top;">
            <td>
                <strong>GSP/Certificate of Origin Form  : </strong> {{ $invoice->gspcertificateoforigin }}
            </td>
            <td>
                <strong>Details of preferential agreement : </strong>{{ $invoice->preferentialagreement }}
            </td>
            <td>
                <strong>Date : </strong>{{ $invoice->invitemnumberregnodate }}<br>
                <strong>Advance Authorisation / EPCG FILE NO, LIC No & Date : </strong>{{ $invoice->authorization_epcg }}
            </td>
        </tr>
    </table>
    <hr style="border: 1px solid red;margin-top:5px;margin-bottom:5px;">
    <section class="tandc" style="margin-top:10px;">
        <table class="full-w">
            <tr>
                <td class="w-30" style="font-size:11px;vertical-align: top;">
                    @php
                        $qrString = '
                        Bank Name : '.$bankDetails->bank_name .'
                        Account Holder Name : '.$bankDetails->account_holder_name.'
                        Address : '.$bankDetails->address.'
                        Branch : '.$bankDetails->branch.'
                        Branch Code : '.$bankDetails->branch_code.'
                        Ad Code : '.$bankDetails->ad_code.'
                        Account No : '.$bankDetails->account_no.'
                        IFSC : '.$bankDetails->ifsc.'
                        Swift Code : '.$bankDetails->swift_code;
                    @endphp
                    {{-- <img src="data:image/png;base64, {!! base64_encode(QrCode::format('svg')->size(150)->generate($qrString)) !!}"> --}}
                </td>
                <td class="w-40" style="font-size:11px;vertical-align: top;">
                    <strong>Bank Name : {{ $bankDetails->bank_name }}<br>
                    Account Holder Name : {{ $bankDetails->account_holder_name }}<br>
                    Address : {{ $bankDetails->address }}<br>
                    Branch : {{ $bankDetails->branch }}<br>
                    Branch Code : {{ $bankDetails->branch_code }}<br>
                    Ad Code : {{ $bankDetails->ad_code }}<br>
                    Account No : {{ $bankDetails->account_no }}<br>
                    IFSC : {{ $bankDetails->ifsc }}<br>
                    Swift Code : {{ $bankDetails->swift_code }}</strong>
                </td>
                <td class="w-30" style="vertical-align: top;text-align: right;font-size:11px;">
                    <strong>For Inorbvict Healthcare India Pvt Ltd</strong>
                </td>
            </tr>
        </table>
    </section>
    <table class="full-w" style="margin-top: 10px; ">
        <tr>
            <td style="font-size:11px;vertical-align: top;">
                Mandatory to provide email ID for dispatch of e - PSD email ID : rajeshmeshram50@gmail.com / logistics@inhpl.com 9850558881
Special Instruction : Don't forget to mention Buyer & Consignee Name on EP Copy & AWB/BL If Consignee Other than Buyer
            </td>
        </tr>
    </table>
</body>
</html>
