@include('admin.common.document-header')
    <hr style="border: 1px solid red;margin-top:5px;margin-bottom:5px;">
    <table class="full-w">
        <tr>
            <td class="w-40" style="font-size:11px;vertical-align: top;">
                            <strong>Buyer Name : </strong>{{ $buyerDetails->name }}<br>
                            {{ $buyerDetails->address }}<br>{{ $buyerDetails->email }}<br>
                            {{ $buyerDetails->contact_no }}
            </td>
            <td class="w-20"></td>
            <td class="w-40" rowspan="2" style="font-size:11px;vertical-align: top;">
                <strong>Order No : </strong>{{ $quotation->pi_number }} <br>
                <strong>Date : </strong>{{ date("d/m/Y", strtotime($quotation->pi_date)) }}<br>
                @if ($quotation->document_type=="International")
                <strong>Currency : </strong>{{ $quotation->currency_name }} <br>
                <strong>Port Of Loading : </strong>{{ $quotation->port_of_loading }} <br>
                <strong>Port of Discharge : </strong>{{ $quotation->port_of_discharge }} <br>
                <strong>Final Destination : </strong>{{ $quotation->final_destination }} <br>
                <strong>Country of Origin : </strong>{{ $quotation->origin_country }} <br>
                <strong>Incoterm : </strong>{{ $quotation->inco_term_name }} <br>
                <strong>Net Weight(kg) : </strong>{{ $quotation->net_weight }} <br>
                <strong>Gross Weight(kg) : </strong>{{ $quotation->gross_weight }} <br>
                @endif
            </td>
        </tr>
        <tr>
            @if(empty($quotation->consignee_id))
                <td class="w-40" style="font-size:11px;vertical-align: top;">
                    <strong>Consignee Name : </strong>{{ $buyerDetails->name }}<br>
                            {{ $buyerDetails->address }}<br>{{ $buyerDetails->email }}<br>
                            {{ $buyerDetails->contact_no }}
                </td>
            @else
                <td class="w-40" style="font-size:11px;vertical-align: top;">
                    <strong>Consignee Name : </strong>{{ $consigneeDetails->name ?? '' }}<br>
                    {{ $consigneeDetails->address ?? '' }}<br>
                    {{ $consigneeDetails->email ?? '' }}<br>{{ $consigneeDetails->mobile ?? '' }}
                </td>
            @endif
            <td class="w-20"></td>
        </tr>
    </table>

    <section class="product-area">
        <table class="table prod_table" style="table-layout: fixed;font-size:11px;width:100%;">
            <thead>
                <tr>
                    <th class="w-5">Sr No</th>
                    <th class="w-20">Product Name</th>
                    <th class="w-15">Brand</th>
                    <th class="w-40">Description</th>
                    <th class="w-5">Qty</th>
                    <th class="w-10">Rate</th>
                    <th class="w-5">GST</th>
                    <th class="w-10">Amount</th>
                </tr>
            </thead>
            <tbody>
                @foreach ($quotationProducts as $quotationProduct)
                <tr class="text-left" style="vertical-align:top;">
                    <td class="w-5">{{ $loop->iteration }}</td>
                    <td class="w-20">
                        {{ $quotationProduct->product_name }}
                    </td>
                    <td class="w-15">{{ $quotationProduct->model_name }}</td>
                    <td class="w-40"  style="word-wrap:break-word;">{{ $quotationProduct->product_description }} ({{ $quotationProduct->product_code }})</td>
                    <td class="w-5">{{ $quotationProduct->quantity }}</td>
                    <td class="w-10">{{ number_format($quotationProduct->rate, 2) }}</td>
                    <td class="w-5">{{ $quotationProduct->tax }}</td>
                    <td class="w-10">{{ number_format($quotationProduct->amount, 2) }}</td>
                </tr>
                @endforeach
            </tbody>
        </table>
    </section>

    <hr style="border: 0.2px solid #000;margin-top:5px;margin-bottom:5px;">
    <table class="full-w balance-info">
        <tr>
            <td class="w-60"></td>
            <td class="w-40" style="vertical-align:top;">
                <table class="table border-0 full-w" style="font-size: 11px;">
                    <tr>
                        <th><strong>SUB TOTAL</strong></th>
                        <th class="text-right"><strong>{{ number_format($quotation->total, 2) }}</strong></th>
                    </tr>
                    @if ($quotation->document_type == "Domestic")
                        <tr>
                            <td>IGST</td>
                            <td class="text-right">{{ number_format($quotation->igst, 2) }}</td>
                        </tr>
                        <tr>
                            <td>CGST</td>
                            <td class="text-right">{{ number_format($quotation->cgst, 2) }}</td>
                        </tr>
                        <tr>
                            <td>SGST</td>
                            <td class="text-right">{{ number_format($quotation->sgst, 2) }}</td>
                        </tr>
                    @endif
                    @if($quotation->document_type == "International")
                        <tr>
                            <td>SHIPPING COST</td>
                            <td class="text-right">{{ number_format($quotation->shipping_cost, 2) }}</td>
                        </tr>
                    @endif
                    <tfoot>
                        <tr>
                            <td><strong>TOTAL</strong></td>
                            <td class="text-right"><strong>{{ $quotation->currency_name }} {{ number_format($quotation->grand_total, 2) }}</strong></td>
                        </tr>
                    </tfoot>
                </table>
            </td>
        </tr>
    </table>
    <div style="font-size:11px;color:white;margin-top:5px;margin-bottom:5px;text-align:left;padding:3px 3px;background-color:red;">
        <strong style="text-transform:capitalize;">AMOUNT IN WORDS : {{ ucwords((new NumberFormatter('en_IN', NumberFormatter::SPELLOUT))->format($quotation->grand_total)) }} {{ $quotation->currency_name }}</strong>
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
                @if ($signature == 'Yes')
                <td class="w-30" style="vertical-align: top;text-align: right;font-size:11px;">
                    <strong>For Inorbvict Healthcare India Pvt Ltd</strong>
                    <img src="data:image/png;base64,{{ base64_encode(file_get_contents(public_path('assets/image.jpg'))) }}" style="max-width: 100%;height: 100px;" alt="Signature">
                </td>
                @endif
                @if ($signature == 'No')
                <td class="w-30" style="vertical-align: top;text-align: right;font-size:11px;">
                    <strong>For Inorbvict Healthcare India Pvt Ltd</strong>
                </td>
                @endif
            </tr>
        </table>
    </section>
    <section  class="tandc" style="margin-top:10px;font-size:11px;">
        <p align="justify">Terms And Conditions : <br>
            @if(!empty($termsAndConditions))<pre>{{ $termsAndConditions->terms_and_conditions }}</pre><br>@endif
            <pre>{{ $quotation->terms_and_conditions }}</pre></p>
    </section>

</body>
</html>
