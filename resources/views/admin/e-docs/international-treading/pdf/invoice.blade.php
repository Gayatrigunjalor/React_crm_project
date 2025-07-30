@include('admin.common.document-header')
    <hr style="border: 1px solid red;margin-top:5px;margin-bottom:5px;">
    <table class="full-w">
        <tr>
            <td class="w-40" style="font-size:11px;vertical-align: top;">
                            <strong>Buyer Name : </strong>{{ $buyerDetails->name }}<br>
                            {{ $buyerDetails->address }}<br>{{ $buyerDetails->email }}
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
            </td>
        </tr>
        <tr>
            <td class="w-40" style="font-size:11px;vertical-align: top;">
                @if (!empty($invoice->consignee_ids))
                    <strong>Consignee Name : </strong>{{ $consigneeDetails->name ?? '' }}<br>
                    {{ $consigneeDetails->address ?? '' }}<br>
                    {{ $consigneeDetails->email ?? '' }}{{ $consigneeDetails->mobile ?? '' }}
                @endif
            </td>
            <td class="w-20"></td>
        </tr>
    </table>

            <section class="product-area">
                <table class="table" style="font-size:11px;width:100%;">
                    <thead>
                        <tr>
                            <th style="width:5%;">Sr No</th>
                            <th style="width:20%;">Product Name</th>
                            <th style="width:35%;">Description</th>
                            <th style="width:15%;">HSN Code</th>
                            <th style="width:10%;">Qty</th>
                            <th style="width:15%;">Rate</th>
                            <th style="width:15%;">Amount</th>
                        </tr>
                    </thead>
                    <tbody>
                        @foreach ($invoiceProducts as $invoiceProduct)
                        <tr  class="text-left">
                            <td style="width:5%;vertical-align:top;">{{ $loop->iteration }}</td>
                            <td style="width:20%;vertical-align:top;">
                                {{ $invoiceProduct->product_name }}
                            </td>
                            <td style="width:35%;vertical-align:top;">{{ $invoiceProduct->description }}</td>
                            <td style="width:15%;vertical-align:top;">{{ $invoiceProduct->hsn }}</td>
                            <td style="width:10%;vertical-align:top;">{{ $invoiceProduct->quantity }}</td>
                            <td style="width:15%;vertical-align:top;">{{ number_format($invoiceProduct->rate, 2) }}</td>
                            <td style="width:15%;vertical-align:top;">{{ number_format($invoiceProduct->amount, 2) }}</td>
                        </tr>
                        @endforeach
                    </tbody>
                </table>
            </section>

            <hr style="border: 0.2px solid #000;margin-top:5px;margin-bottom:5px;">

                <table class="balance-info full-w">
                    <tr>
                        <td class="w-50" style="text-align: left;font-size:12;"></td>
                        <td style="text-align: right;vertical-align:top;" class="w-50">
                            <table class="table full-w border-0" style="font-size: 11px;">
                                <tr>
                                    <td><strong>TOTAL PRODUCT COST / EXW VALUE</strong></td>
                                    <td class="text-right"><strong>{{ number_format($invoice->exw_value, 2) }}</strong></td>
                                </tr>
                                <tr>
                                    <td style="font-weight:normal"><strong>DISCOUNT</strong></td>
                                    <td style="font-weight:normal" class="text-right"><strong>{{ number_format($invoice->discount, 2) }}</strong></td>
                                </tr>
                                <tr>
                                    <td style="font-weight:normal"><strong>FREIGHT</strong></td>
                                    <td style="font-weight:normal" class="text-right"><strong>{{ number_format($invoice->freight_weight, 2) }}</strong></td>
                                </tr>
                                <tr>
                                    <td style="font-weight:normal"><strong>INSURANCE</strong></td>
                                    <td style="font-weight:normal" class="text-right"><strong>{{ number_format($invoice->insurance, 2) }}</strong></td>
                                </tr>
                                <tfoot>
                                        <tr>
                                            <td><strong>GRAND TOTAL</strong></td>
                                            <td class="text-right"><strong>{{ $symbol->symbol }} {{ number_format($invoice->grand_total, 2) }}</strong></td>
                                        </tr>
                                </tfoot>
                            </table>
                        </td>
                    </tr>
                </table>
                {{-- <hr style="border: 1px solid red;margin-top:5px;margin-bottom:5px;"> --}}
                <div style="font-size:11px;color:white;margin-top:5px;margin-bottom:5px;text-align:left;padding:3px 3px;background-color:red;">
                    <strong style="text-transform:capitalize;">AMOUNT IN WORDS : {{ $invoice->currency }} {{ ucwords((new NumberFormatter('en_IN', NumberFormatter::SPELLOUT))->format($invoice->grand_total)) }}</strong>
                </div>
                <section class="tandc" style="margin-top:10px;">
                    <table class="full-w">
                        <tr>
                            <td class="w-30" style="font-size:11px;vertical-align: top; padding-right: 10px;">
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
                                <img src="data:image/png;base64,{{ DNS2D::getBarcodePNG($qrString, 'QRCODE', 2.5, 2.5) }}" />
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
                            @if ($sign)
                            <td class="w-30" style="vertical-align: top;text-align: right;font-size:11px;">
                                <strong>For Inorbvict Healthcare India Pvt Ltd</strong>
                                <img src="data:image/png;base64,{{ base64_encode(file_get_contents(public_path('assets/image.jpg'))) }}" style="max-width: 100%;height: 100px;" alt="Signature">
                            </td>
                            @else
                            <td class="w-30" style="vertical-align: top;text-align: right;font-size:11px;">
                                <strong>For Inorbvict Healthcare India Pvt Ltd</strong>
                            </td>
                            @endif
                        </tr>
                    </table>
                </section>
                <table class="full-w" style="margin-top:15;">
                    <tr>
                        <td style="font-size:11px;vertical-align: top;">
                            Terms And Conditions : <br>
                            <pre>@if(!empty($termsAndConditions)){{ $termsAndConditions->terms_and_conditions }}@endif</pre><br>
                            <pre>{{ $invoice->extratermsconditions }}</pre>
                        </td>
                    </tr>
                </table>
</body>
</html>
