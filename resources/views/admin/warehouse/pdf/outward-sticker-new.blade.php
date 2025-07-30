<!doctype html>
<html lang="en">
<head>
    <!-- Required meta tags -->
    <meta http-equiv="Content-Type" content="text/html; charset=utf-8"/>
    <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no">
    <link rel="stylesheet" type="text/css" href="{{ asset('app-assets/css/bootstrap.css') }}">
    <title>Inward Box</title>
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
        font-size: 13px !important;
        margin-top: 0.6cm;
        margin-left: 0.2cm;
        margin-right: 0.2cm;
        margin-bottom: 0px;
        font-family: 'Century Gothic', 'DejaVu Sans', sans-serif;
        color: #000000;
    }
    table{
        width: 100%;
    }

    table td{
        font-size:11px;
        text-align: center;
        vertical-align: middle;
    }
    .align-left{
        text-align: left !important;
        vertical-align: middle;
        padding-left: 4px;
    }
    .barcode_cls {
        display: flex !important;
        justify-content: center !important;
    }
    .no-border {
        border: 0;
    }
    .border-bottom {
        border: 1px solid black;
    }
    .border-box-black {
        border: 1px solid black;
    }

</style>
<body>
    @foreach ($box_details as $box)
        <div style="border:1px solid #000; margin-bottom:5px;">
            <table class="border-bottom">
                <tr>
                    <td width="80%"><div class="text-right"><strong><img width="200" src="data:image/png;base64,{{ base64_encode(file_get_contents(public_path('assets/logo.jpg'))) }}" alt="Logo" class="img-fluid"></div></td>
                </tr>
            </table>
            <table class="border-bottom">
                <tr>
                    <td width="100%" class="align-left"><strong>SHIPPER : </strong>INORBVICT HEALTHCARE INDIA PVT. LTD<br>
                        {{ $companyDetails->address }}<br>
                        <a href="mailto:rajeshmeshram50@gmail.com">rajeshmeshram50@gmail.com</a> +91 9850558881
                    </td>
                </tr>
            </table>
            <table class="no-border border-bottom">
                <tr>
                    <td width="100%" class="align-left"><strong>BUYER : </strong>
                        {{ $buyer_details->name }} <br>
                        {{ $buyer_details->address }}<br>
                        {{ $buyer_details->mobile_number }} / {{ $buyer_details->contact_no }}<br>
                        {{ $buyer_details->email }}
                    </td>
                </tr>
            </table>
            <table class="no-border border-bottom">
                <tr>
                    <td width="100%" class="align-left"><strong>CONSIGNEE : </strong>
                        {{ $consignee_details->name }} <br>
                        {{ $consignee_details->address }} <br>
                        {{ $consignee_details->mobile }} {{ $consignee_details->email }}

                    </td>
                </tr>
            </table>
            <table class="no-border border-bottom">
                <tr>
                    <td width="50%"><strong>O/W No : </strong>{{ $outward_id }}</td>
                    <td width="50%"><strong>INV NO : </strong>{{ $invoice_number }}</td>
                </tr>
                <tr>
                    <td width="50%"><strong>Date : </strong>{{ $outward_date }}</td>
                    <td width="50%"><strong>Date : </strong>{{ $invoice_date }}</td>
                </tr>
                <tr>
                    <td width="50%"><strong>No of boxes : </strong>{{ $no_of_packages }}</td>
                    <td width="50%"><strong>E-Way Bill No : </strong>{{ $eway_bill_number }}</td>
                </tr>
            </table>
            <table class="no-border border-bottom">
                <tr>
                    <td width="50%">
                        <div class="p-1 d-block">
                            @php
                                $text = 'Prod Code : '. $box['product_code'];
                                $text .= ' Qty : '. $box['product_quantity'];
                                $text .= ' BT ID: '. $bt_id;
                                $text .= ' INW ID : '. $inward_id;
                            @endphp
                            <div class="barcode_cls" style="padding: 5px 10px;"><img src="data:image/png;base64,{{ DNS2D::getBarcodePNG($text, 'QRCODE', 2.5, 2.5) }}" /></div>
                        </div>
                    </td>
                    <td width="50%"></td>
                </tr>
            </table>
            <table class="no-border border-bottom">
                <tr>
                    <td>
                        <span style="text-align: center;"><strong>Inorbvict Healthcare is Govt. Recognized One Star Export House</strong></span>
                    </td>
                </tr>
            </table>
        </div>
        @if (!$loop->last)
            <div class="page-break"></div>
        @endif
    @endforeach
</body>
</html>
