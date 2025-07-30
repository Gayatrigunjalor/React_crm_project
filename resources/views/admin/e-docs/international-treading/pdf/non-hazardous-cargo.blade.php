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
    <hr style="border: 1px solid red;margin-top:5px;margin-bottom:5px;">
    <table class="full-w" style="margin-bottom: 10px;">
        <tr>
            <td class="w-40" style="font-size:11px;vertical-align: top;">
                <strong>AWB/BL No : </strong>{{ $invoice->tracking_or_awb_number }}
            </td>
            <td class="w-20"></td>
            <td class="w-40" style="font-size:11px;vertical-align: top;">
                <strong>MAWB/MBL No : </strong>
            </td>
        </tr>
        <tr>
            <td colspan="3" style="font-size:11px;vertical-align: top;">
                This is to certify that the articles / substances of this shipment are properly described by name that they are not listed in the current edition of IATA / Dangerous Goods
                Regulations ( DGR ), Alphabetical List of Dangerous Goods,nor do they correspond to any of the hazard classes appearing in the DGR,Section 3,classification of
                Dangerous goods and that they are known not to be dangerous,I.e,not restricted. Furthermore the shipper confirms that the goods are in proper condition for
                transportation on passenger carrying aircraft ( DGR, 8.1.23.) of International Air Transport Association ( I A T A )
            </td>
        </tr>
    </table>

    <section class="product-area" style="margin-top:10px;">
        <table class="full-w" style="font-size:11px;">
            <thead>
                <tr>
                    <th class="w-20"> Marks and Number of Packages</th>
                    <th class="w-60">Proper Description of Goods / Give Technical Name (Trade Name Not Permitted,Specify each article separately)</th>
                    <th class="w-10">HSN</th>
                    <th class="w-10">Net Quantity</th>
                </tr>
            </thead>
            <tbody>
                @foreach ($invoiceProducts as $invoiceProduct)
                <tr class="text-left">
                    <td class="w-20">{{ $invoice->no_of_packages }} Box/Boxes</td>
                    <td class="w-60">{{ $invoiceProduct->product_name }}<br>{{ $invoiceProduct->description }}</td>
                    <td class="w-10">{{ $invoiceProduct->hsn }}</td>
                    <td class="w-10">{{ $invoiceProduct->quantity }}</td>
                </tr>
                @endforeach
            </tbody>
        </table>
    </section>
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
                <td class="w-30" style="vertical-align: top;text-align: right;font-size:11px;">
                    <strong>For Inorbvict Healthcare India Pvt Ltd</strong>
                </td>
            </tr>
        </table>
    </section>
    <table class="full-w" style="margin-top:15;">
        <tr>
            <td style="font-size:11px;vertical-align: top;">
                To be completed in duplicate duly signed & stamped by shipper
                ONE COPY to be filed with the AWB copy at ORIGIN & ONE COPY to accompany DEST: AWB
                Attach Lab Analysis Report, Material Safety Data Sheet for Bulk - Drugs / medicines / Chemicals / Cosmetics.
                pls certify that no hidden dangerous goods are stored or filled in any components or spare - parts.
                e.g.Plastic components / Transformer Spares / Elect & Electronic Appliances / for Plastic & Rubber(specify)
                PVC / etc Films(non - nitro - cellulose base) /<br>
            </td>
        </tr>
    </table>
</body>
</html>
