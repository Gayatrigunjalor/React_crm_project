<!doctype html>
<html lang="en">
    <head>
        <!-- Required meta tags -->
        <meta http-equiv="Content-Type" content="text/html; charset=utf-8"/>
        <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no">
        <title>Scomet</title>
    </head>
    <style>
        @page {
            margin: 0;
        }
        @font-face {
            font-family: 'Century Gothic', 'DejaVu Sans', sans-serif;
            font-style: normal;
            font-weight: normal;
            src: url(https://fonts.cdnfonts.com/css/century-gothic) format('truetype');
        }
        .page-break {
            page-break-after: always;
        }
        body {
            margin-top: 5cm;
            margin-left: 2cm;
            margin-right: 2cm;
            margin-bottom: 2cm;
            font-family: 'Century Gothic', 'DejaVu Sans', sans-serif;
            color: #181818;
            font-size:12px;
        }
    </style>
    <body>
        <p>Date: {{ date('d/m/Y') }}<p></p>
        <p>To,<br>
        <p>The Asst. Commissioner of customs/ Commissioner of customs,<br>
        Port of Loading: {{ $invoice->port_of_loading }}<br>
        Port Address: {{ $invoice->port_of_loading }}<br><br>

        <p>Ref: Our Inv no. <b>{{ $invoice->invoice_number }}</b> DT:  <b>{{ date('d/m/Y', strtotime($invoice->invoice_date)) }}</b></p>
        <p>Dear Sir,</p>
        <p><b>Sub: NON-SCOMET DECLARATION.</b></p>
        <p><b>Description of goods:</b></p>
        <p>
            <ul>
            @foreach ($invoiceProducts as $invoiceProduct)
                <li>{{ $invoiceProduct->product_name }} {{ $invoiceProduct->hsn }}</li>
            @endforeach
            </ul>
        </p>
        <p><b>Proper use of exporting goods and where: {{ $usage }}</b></p>

        <p>We are hereby confirming that these products mentioned in invoice number "<b>{{ $invoice->invoice_number }}</b>" on dated <b>{{ date('d/m/Y', strtotime($invoice->invoice_date)) }}</b> shipped are not used in any type of arms &amp; ammunition. These contain do not fall under Appendix -3 SCOMET List (Special, organisms, Material, Equipment, and Technologies)</p>
        <p>
            Above mentioned details are true &amp; checked by technical expert. <br>
            These Goods Does Not fall under SCOMET list. <br>
            We request to consider and process the export shipment. <br>
        </p>

        Thanking you
        <br><br>
        <p>Truly yours</p>
        <p>For:</p>
        <p>(Authorized Signatory)</p>
    </body>
</html>
