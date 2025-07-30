<!doctype html>
<html lang="en">
<head>
    <!-- Required meta tags -->
    <meta http-equiv="Content-Type" content="text/html; charset=utf-8"/>
    <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no">
    <title>AWB/BL</title>
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
        margin-top: 1cm;
        margin-left: 1cm;
        margin-right: 1cm;
        margin-bottom: 1cm;
        font-family: 'Century Gothic', 'DejaVu Sans', sans-serif;
        color: #0a09098f;
    }

    pre{
        font-family: 'Century Gothic', sans-serif;
        color: #0a09098f;
        white-space: pre-wrap;
    }
    .logo img{
        height: 65px;
    }
    thead{
        color:#000;
        background: #d5d5d5;
    }
    .table td,.table th{
        padding: 5px;
    }
    tr th:first-child, tr td:first-child{
        text-align: left;
    }
    .media p{
        font-weight: 400;
        margin: 0;
    }
    .media p.title{
        font-weight: 600;
    }
    table td{
        padding: 4px;
        border: 1px solid black;
        font-size:11px;
        vertical-align: top;
    }
    .balance-info tr td:first-child{
        font-weight: 600;
    }
    tfoot{
        border-top: 1px solid #000;
    }
    tfoot td{
        font-weight: 600;
    }
    footer {
        position: fixed;
        bottom: 0cm;
        left: 0cm;
        right: 0cm;
        height:auto;
        padding: 10px;
        background: #720805;
        color:#fff;
        font-size: 10px;
    }
    .tabel-border{
        border: 1px solid black;
        border-collapse: collapse;
    }
    .no-border {
        border: 0 !important;
    }
    .barcode_cls {
        display: flex !important;
        justify-content: center !important;
    }
</style>
<body>
    <table width="100%" class="no-border">
        <tr>
            <td width="40%" class="logo no-border">
                    <img height="65px" src="data:image/png;base64,{{ base64_encode(file_get_contents(public_path('assets/logo.jpg'))) }}" alt="Logo" class="img-fluid">
            </td>
            <td width="20%" class="no-border"></td>
            <td width="40%" class="no-border">
                @php
                    $text = 'Inorbvict Healthcare India Pvt Ltd';
                @endphp
                <div class="barcode_cls" style="padding: 10px 10px 0px 10px;"><img src="data:image/png;base64,{{ DNS1D::getBarcodePNG($text,'C128B', 0.8, 40) }}" /> </div>
            </td>
        </tr>
    </table>
    <hr style="border: 1px solid red;margin-top:5px;margin-bottom:5px;">
    <table width="100%" class="tabel-border">
        <tr>
            <td width="50%">
                <strong>{{ $companyDetails->name }}</strong><br>
                {{ $companyDetails->address }},
                {{ $companyDetails->city }}, {{ $companyDetails->state }}
                {{ $companyDetails->country }} {{ $companyDetails->pin_code }}<br>
                {{ $companyDetails->mobile }}<br>
                <strong>GST No : </strong>{{ $companyDetails->gst_no }}<br>
                <strong>PAN No : </strong>{{ $companyDetails->pan_no }}<br>
                <strong>CIN : </strong>{{ $companyDetails->cin }}<br>
                <strong>IEC : </strong>{{ $companyDetails->iec }}<br>

                <hr>
                @if (!empty($invoice->consignee_ids))
                <strong>CONSIGNEE NAME AND ADDRESS : </strong><span style="background-color: #b2ff66;">{{ $consigneeDetails->name ?? '' }}<br>
                    {{ $consigneeDetails->address ?? '' }}<br>
                    {{ $consigneeDetails->email ?? '' }}{{ $consigneeDetails->mobile ?? '' }}</span>
                    @endif
                </td>

                <td width="50%">
                    <h2>AWB/BL DRAFT</h2> <br>
                    <strong>Shipping Line : </strong> <br>
                    <strong>BKG NO : </strong><br>
                    <strong>Type of BL/AWB : </strong> <br>
                <br>
                <br>
            </td>
        </tr>
        <tr>
            <td width="50%">
                ISSUING CARRIER'S AGENT NAME AND CITY
            </td>

            <td width="50%">
                <span style="background-color: #b2ff66;"><strong>BUYER NAME & ADDRESS: </strong> {{ $buyerDetails->name }}<br>
                {{ $buyerDetails->address }}<br>{{ $buyerDetails->email }}
                {{ $buyerDetails->contact_no }} </span>
            </td>
        </tr>
        <tr>
            <td width="50%">
                <strong>AGENTS IATA CODE:</strong>
            </td>
            <td width="50%">
                <strong>VESSEL AND VOYAGE NO:</strong> <br>
                <strong>EXPORTER TYPE:</strong>
            </td>
        </tr>
    </table>
    <table width="100%" class="tabel-border">
        <tr>
            <td width="25%"><strong>PORT OF LOADING:</strong> <span style="background-color: #b2ff66;">{{ $invoice->port_of_loading }} </span></td>
            <td width="25%"><strong>PORT OF DISCHARGE:</strong> <span style="background-color: #b2ff66;">{{ $invoice->port_of_discharge }} </span></td>
            <td width="25%"><strong>FINAL DESTINATION:</strong> <span style="background-color: #b2ff66;">{{ $invoice->final_destination }} </span></td>
            <td width="25%"><span style="background-color: #b2ff66;"><strong>INCO TERM:</strong> {{ $invoice->incoterm->inco_term }}</span></td>
        </tr>
    </table>
    <table width="100%" class="tabel-border">
        <tr>
            <td width="20%" style="background-color: #d5d5d5"><strong>CONTAINER NOS. MARKS & NUMBERS</strong></td>
            <td width="65%" style="background-color: #d5d5d5"><strong>NUMBER AND KIND OF PACKAGES DESCRIPTION OF GOODS</strong></td>
            <td width="15%" style="background-color: #d5d5d5"> </td>
        </tr>
        <tr>
            <td class="no-broder" style="border : 0 !important;">
                <span style="background-color: #b2ff66;"><strong>No of Boxes:</strong> {{ $noofboxes }}</span>
            </td>
            <td class="no-broder" style="border : 0 !important;">
                <table width="100%" class="no-border" style="font-size:11px;width:100%;">

                    <tbody>
                        @foreach ($invoiceProducts as $invoiceProduct)
                        <tr class="text-left">
                            <td class="no-border" style="vertical-align:top;">
                                <span style="background-color: #b2ff66;">{{ $invoiceProduct->product_name }}</span><br>
                                <span style="background-color: #b2ff66;"><strong>HSN CODE:</strong> {{ $invoiceProduct->hsn }}</span><br>
                                <span style="background-color: #b2ff66;"><strong>QTY:</strong> {{ $invoiceProduct->quantity }}</span>
                            </td>
                            <td class="no-border"></td>
                            <td class="no-border"></td>
                        </tr>
                        @endforeach
                    </tbody>
                </table>
            </td>
            <td class="no-border"></td>
        </tr>
        <tr>
            <td class="no-border"></td>
            <td class="no-border">
                <table width="100%" class="no-border" style="font-size:11px;width:100%;">
                    <tr  class="text-left">
                        <td width="50%" class="no-border" style="width:20%;vertical-align:top;">
                            <span style="background-color: #b2ff66;"><strong>INVOICE NO:</strong> {{ $invoice->invoice_number }}</span>
                        </td>
                        <td width="50%" class="no-border" style="width:15%;vertical-align:top;"><span style="background-color: #b2ff66;"><strong>INVOICE DATE:</strong> {{ date('d F Y', strtotime($invoice->invoice_date)) }}</span></td>
                    </tr>
                </table>
            </td>
            <td class="no-border"></td>
        </tr>
        <tr>
            <td class="no-border"></td>
            <td class="no-border">
                <table width="100%" class="no-border" style="font-size:11px;width:100%;">
                    <tr  class="text-left">
                        <td width="50%" class="no-border" style="width:20%;vertical-align:top;">
                            <strong>SHIPPING BILL NO:</strong>
                        </td>
                        <td width="50%" class="no-border" style="width:15%;vertical-align:top;">
                            <strong>SHIPPING BILL DATE:</strong>
                        </td>
                    </tr>
                </table>
            </td>
            <td class="no-border"></td>
        </tr>
        <tr>
            <td class="no-border"></td>
            <td class="no-border" style="font-size:11px;">
                <span style="background-color: #b2ff66;"><strong>TOTAL NET WT:</strong> {{ $total_net_weight }} KG<span>
            </td>
            <td class="no-border"></td>
        </tr>
        <tr>
            <td class="no-border"></td>
            <td class="no-border" style="font-size:11px;">
                <span style="background-color: #b2ff66;"><strong>TOTAL GROSS WT:</strong> {{ $total_gross_weight }} KG</span>
            </td>
            <td class="no-border"></td>
        </tr>
        <tr>
            <td class="no-border"></td>
            <td class="no-border" style="font-size:11px;">
                <span style="background-color: #b2ff66;"><strong>TOTAL VOLUME WT:</strong> {{ $total_volume_weight }} KG</span>
            </td>
            <td class="no-border"></td>
        </tr>
        <tr>
            <td class="no-border"></td>
            <td class="no-border" style="font-size:11px;"><strong>DIMENSIONS in CM:</strong>
            </td>
            <td class="no-border"></td>
        </tr>
    </table>
    <h5>Important Note: "This draft is system-generated for AWB/BL. Green highlighted text is mandatory. Maintain it unchanged in your final document, avoiding spelling errors."</h5>
</body>
</html>
