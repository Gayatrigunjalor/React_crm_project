@include('admin.common.document-header')
<style>
    body {
        line-height: 80%;
    }
</style>
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
    <table class="full-w">
        <tr>
            <td class="w-40" style="font-size:11px;vertical-align: top;">
                <strong>Pre-carriage By : </strong>{{ $invoice->pre_carriage_by }}<br>
                <strong>Vessel / Flight No : </strong>{{ $invoice->vessel_no }} <br>
                <strong>Place of Receipt by pre-carrier : </strong>{{ $invoice->placereceiptprecarrier }}
            </td>
            <td class="w-20"></td>
            <td class="w-40" style="font-size:11px;vertical-align: top;">
                <strong>Terms of Delivery & payment </strong><br>
                <strong>Payment Terms : </strong>{{ $invoice->payment_terms }} <br>
                <strong>Marks & No. of Packages : </strong>{{ $invoice->no_of_packages }}
            </td>
        </tr>
    </table>

    <section class="product-area" style="margin-top:10px;">
        <table class="table full-w" style="font-size:11px;">
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

    <section class="product-area">
        <table class="table full-w" style="font-size:11px;">
            <thead>
                <tr>
                    <th style="text-align: center">Net Wt(kg)</th>
                    <th>Grs Wt(kg)</th>
                    <th>Vol Wt(kg)</th>
                    <th>No of Boxes</th>
                    <th>L(CMS)</th>
                    <th>B(CMS)</th>
                    <th>H(CMS)</th>
                </tr>
            </thead>
            <tbody>
                @foreach ($invoiceWeights as $invoiceWeight)
                <tr style="text-align: center">
                    <td style="text-align: center">{{ $invoiceWeight->net_wt }}</td>
                    <td>{{ $invoiceWeight->gross_wt }}</td>
                    <td>{{ $invoiceWeight->vol_wt }}</td>
                    <td>{{ $invoiceWeight->noofboxes }}</td>
                    <td>{{ $invoiceWeight->l_wt }} </td>
                    <td>{{ $invoiceWeight->b_wt }}</td>
                    <td>{{ $invoiceWeight->h_wt }}</td>
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
                    <img src="data:image/png;base64,{{ DNS2D::getBarcodePNG($qrString, 'QRCODE', 2.8, 2.8) }}" />
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
    <table class="full-w">
        <tr>
            <td style="font-size:11px;vertical-align: top;">
                Declaration : We declare that all particulars are true and correct.
            </td>
        </tr>
    </table>
</body>
</html>
