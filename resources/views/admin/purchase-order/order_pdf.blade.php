<style>
    body {
        line-height: 80%;
    }
</style>
@include('admin.common.document-header')
    <hr style="border: 1px solid red;margin-top:5px;margin-bottom:5px;">
    <table class="full-w">
        <tr>
            <td class="w-45" style="font-size:11px;vertical-align: top;">
                            <strong>BILL TO: </strong>{{ $companyDetails->name }}<br>
                            {{ $companyDetails->address }},<br>
                            {{ $companyDetails->city }}, {{ $companyDetails->state }}<br>
                            {{ $companyDetails->country }} {{ $companyDetails->pin_code }}<br>
                            {{ $companyDetails->mobile }}
            </td>
            <td class="w-15"></td>
            <td class="w-40"  rowspan="2" style="font-size:11px;vertical-align: top;">
                <strong>Order No : </strong>{{ $purchaseOrder->purchase_order_number }} <br>
                <strong>Date : </strong>{{ date("d/m/Y", strtotime($purchaseOrder->order_date )) }}<br>
                <strong>Date Of Supply : </strong>{{ date("d/m/Y", strtotime($purchaseOrder->expected_delivery_date )) }}<br>
                @if ($purchaseOrder->vendor_id != null)
                    <strong>Vendor : </strong><b>{{ $vendorDetails->name }}</b><br>

                    {{ $vendorDetails->address }},<br>
                    {{ $vendorDetails->city }}<br>
                    {{ $vendorDetails->pin_code }} <br>
                @endif
                @if ($purchaseOrder->document_type == "International")
                    <strong>Currency : </strong>{{ ($purchaseOrder->currency != null) ? $purchaseOrder->currency->name : "" }} <br>
                    <strong>Port Of Loading : </strong>{{ ($purchaseOrder->port_of_loading != null) ? $purchaseOrder->port_of_loading : "" }} <br>
                    <strong>Port of Discharge : </strong>{{ ($purchaseOrder->port_of_discharge != null) ? $purchaseOrder->port_of_discharge : "" }} <br>
                    <strong>Final Destination : </strong>{{ ($purchaseOrder->final_destination != null) ? $purchaseOrder->final_destination : "" }} <br>
                    <strong>Country of Origin : </strong>{{ ($purchaseOrder->origin_country != null) ? $purchaseOrder->origin_country : "" }} <br>
                    <strong>Incoterm : </strong>{{ ($purchaseOrder->inco != null) ? $purchaseOrder->inco->inco_term : "" }} <br>
                @endif
            </td>
        </tr>
        <tr>
            <td class="w-45" style="font-size:11px;vertical-align: top;">
                    <strong>SHIP TO: </strong>{{ $companyDetails->name }}<br>
                    {{ $companyDetails->address }},<br>
                    {{ $companyDetails->city }}, {{ $companyDetails->state }}<br>
                    {{ $companyDetails->country }} {{ $companyDetails->pin_code }}<br>
                    {{ $companyDetails->mobile }}
            </td>
            <td class="w-15"></td>
        </tr>
    </table>

    @if($purchaseOrder->po_type != 'ffd')
        <section class="product-area">
            <table class="table" style="font-size:11px;width:100%;">
                <thead>
                    <tr>
                        <th style="width:3%;">Sr No</th>
                        <th style="width:12%;">Product Name</th>
                        <th style="width:5%;">Brand</th>
                        <th style="width:68%;">Description</th>
                        <th style="width:3%;">Qty</th>
                        <th style="width:5%;">Price</th>
                        <th style="width:7%;">GST</th>
                        <th style="width:7%;">Amount</th>
                    </tr>
                </thead>
                <tbody>
                    @foreach ($purchaseProducts as $purchaseProduct)
                    <tr  class="text-left">
                        <td style="width:3%;vertical-align:top;">{{ $loop->iteration }}</td>
                        <td style="width:12%;vertical-align:top;">
                            {{ $purchaseProduct->product_name }}
                        </td>
                        <td style="width:5%;vertical-align:top;">{{ $purchaseProduct->model_name }}</td>
                        <td style="width:68%;vertical-align:top;" style="word-wrap:break-word;">{{ $purchaseProduct->product_description }} ({{ $purchaseProduct->product_code }})</td>
                        <td style="width:3%;vertical-align:top;">{{ $purchaseProduct->quantity }}</td>
                        <td style="width:5%;vertical-align:top;">{{ number_format($purchaseProduct->rate, 2) }}</td>
                        <td style="width:7%;vertical-align:top;">{{ $purchaseProduct->tax }}</td>
                        <td style="width:7%;vertical-align:top;">{{ number_format($purchaseProduct->amount, 2) }}</td>
                    </tr>
                    @endforeach
                </tbody>
            </table>
        </section>
    @else
    <hr style="border: 0.1px solid #000;margin-top:5px;margin-bottom:5px;">
    <span style="font-size:11px;"><strong>Freight forwarder : </strong> {{ $ffd_name }}</span>
    @endif
    <hr style="border: 0.2px solid #000;margin-top:5px;margin-bottom:5px;">
    <table class="full-w balance-info">
        <tr>
            <td class="w-60"></td>
            <td style="text-align: right;vertical-align:top;" class="w-40">
                <table class="table full-w border-0" style="font-size: 11px;">
                    @if($purchaseOrder->po_type != 'ffd')
                    <tr>
                        <td>SHIPPING CHARGE</td>
                        <td class="text-right">{{ number_format($purchaseOrder->shp_charge, 2) }}</td>
                    </tr>
                    <tr>
                        <td>PACKING CHARGE</td>
                        <td class="text-right">{{ number_format($purchaseOrder->pkg_charge, 2) }}</td>
                    </tr>
                    <tr>
                        <td>OTHER CHARGE</td>
                        <td class="text-right">{{ number_format($purchaseOrder->other_charge, 2) }}</td>
                    </tr>
                    <tr>
                        <td>SUB TOTAL</td>
                        <td class="text-right">{{ number_format($purchaseOrder->total, 2) }}</td>
                    </tr>
                    <tr>
                        <td>IGST</td>
                        <td class="text-right">{{ number_format($purchaseOrder->igst, 2) }}</td>
                    </tr>
                    <tr>
                        <td>CGST</td>
                        <td class="text-right">{{ number_format($purchaseOrder->cgst, 2) }}</td>
                    </tr>
                    <tr>
                        <td>SGST</td>
                        <td class="text-right">{{ number_format($purchaseOrder->sgst, 2) }}</td>
                    </tr>
                    <tfoot>
                    @endif
                    <tr>
                        <td><strong>TOTAL</strong></td>
                        <td class="text-right"><strong>{{ ($purchaseOrder->currency != null) ? $purchaseOrder->currency->symbol : "" }} {{ number_format($purchaseOrder->grand_total, 2) }}</strong></td>
                    </tr>
                    @if($purchaseOrder->po_type != 'ffd')
                        </tfoot>
                    @endif
                </table>
        </tr>
    </table>
    <div style="font-size:11px;color:white;margin-top:5px;margin-bottom:5px;text-align:left;padding:3px 3px;background-color:red;">
        {{-- <strong style="text-transform:capitalize;">AMOUNT IN WORDS : {{ ucwords((new NumberFormatter('en_IN', NumberFormatter::SPELLOUT))->format($purchaseOrder->grand_total)) }}</strong> --}}
    </div>
    <section style="margin-top:10px;">
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
    <section style="margin-top:10px;font-size:11px;">
        <p align="justify">Terms And Conditions : <br>
            @if ($termsAndConditions != null)
                <pre>{{ $termsAndConditions->terms_and_conditions }}</pre><br>
            @endif
            <pre>{{ $purchaseOrder->terms_and_conditions }}</pre></p>
    </section>
<script type="text/php">
    if (isset($pdf)) {
        $font = $fontMetrics->get_font("helvetica", "bold");
        $footer_size = 10;
        $x = 525;
        $y = 800;
        $text = "{PAGE_NUM} of {PAGE_COUNT}";
        $size = 7;
        $color = array(0,0,0);
        $word_space = 0.0;
        $char_space = 0.0;
        $angle = 0.0;
        $pdf->page_text($x, $y, $text, $font, $size, $color, $word_space, $char_space, $angle);
    }
</script>
</body>
</html>
