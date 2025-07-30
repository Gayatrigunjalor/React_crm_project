@include('admin.common.document-header')
<style>
    body {
        font-size:11px;
    }
</style>
    <hr style="border: 1px solid red;margin-top:5px;margin-bottom:5px;">
        <strong>Delivery Note Number : </strong>{{ $invoice->dc_number }}<br>
        <strong>Delivery Date : </strong><br>
        <strong>International Freight Forwarder : </strong>{{ $invoice->ffdInternational->ffd_name ?? '' }}<br>{{ $invoice->ffdInternational->address ?? '' }} {{ $invoice->ffdInternational->city ?? '' }} {{ $invoice->ffdInternational->pin_code ?? '' }}<br>
        <strong>Buyer Name & Address : </strong>{{ $buyerDetails->name }} ,{{ $buyerDetails->address }},<br>
        {{ $buyerDetails->city }}, {{ $buyerDetails->country_name }},<br>
        {{ $buyerDetails->pin_code }}<br>
        <div style="margin-top: 20px;"></div>
        <strong>Consignee Name & Address : </strong>{{ $consigneeDetails->name ?? '' }}<br>{{ $consigneeDetails->address ?? '' }},<br>
        {{ $consigneeDetails->city ?? '' }}, {{ $consigneeDetails->state_name ?? '' }}<br>
        {{ $consigneeDetails->country_name ?? '' }}, {{ $consigneeDetails->pin_code ?? '' }}<br>
        <strong>Goods Receiver party on behalf of buyer or International Freight Forwarder:</strong>
        {{ $invoice->ffdDomestic->ffd_name ?? '' }} {{ $invoice->ffdDomestic->address ?? '' }} {{ $invoice->ffdDomestic->city ?? '' }} {{ $invoice->ffdInternational->pin_code ?? '' }}<br>

        <section class="product-area" style="margin-top:10px;">
            <table class="full-w" style="font-size:11px;">
                <thead>
                    <tr style="text-align:center;">
                        <th class="w-20">Item Name</th>
                        <th class="w-40">Description Of Goods</th>
                        <th class="w-10">HSN/SAC</th>
                        <th class="w-5">Qty</th>
                        <th class="w-5">Unit</th>
                        <th class="w-10">Rate</th>
                        <th class="w-10">Amount</th>
                    </tr>
                </thead>
                <tbody>
                    @foreach ($invoiceProducts as $invoiceProduct)
                    <tr style="vertical-align:top;">
                        <td>{{ $invoiceProduct->product_name }}</td>
                        <td>{{ $invoiceProduct->description }}</td>
                        <td>{{ $invoiceProduct->hsn }}</td>
                        <td style="text-align:center;">{{ $invoiceProduct->quantity }}</td>
                        <td style="text-align:center;">{{ $invoiceProduct->unit }}</td>
                        <td style="text-align:center;">{{ number_format($invoiceProduct->rate, 2) }}</td>
                        <td style="text-align:center;">{{ number_format($invoiceProduct->amount, 2) }}</td>
                    </tr>
                    @endforeach
                </tbody>
            </table>
        </section>

        <table class="full-w" style="margin-top:10px; font-size:11px; vertical-align: top;">
            <tr>
                <td>
                    Declaration: I/We, authorised representative/ agent of 'Goods receiving party' herby delcared & certify that material/ materials has/have been checked
                        by me/us & material found in good conditions & received as per item desciption with above mentioned quantity.
                </td>
            </tr>
            <tr>
                <td>
                    <br><br>Name of Goods Receiver<br><br><br><br>
                </td>
            </tr>
            <tr>
                <td>
                    Contact Number<br><br><br><br>
                </td>
            </tr>
            <tr>
                <td>
                    Name of Goods Receiver Company<br><br><br><br>
                </td>
            </tr>
            <tr>
                <td>
                    Sign/ Stamp<br><br><br><br>
                </td>
            </tr>
            <tr>
                <td>
                    Thumb impression<br><br><br><br>
                </td>
            </tr>
        </table>
        <hr style="border: 1px solid red;margin-top:5px;margin-bottom:5px;">
</body>
</html>
