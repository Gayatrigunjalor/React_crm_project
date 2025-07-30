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
        font-size: 11px !important;
        margin-top: 0.8cm;
        margin-left: 0.2cm;
        margin-right: 0.2cm;
        margin-bottom: 10px;
        font-family: 'Century Gothic', 'DejaVu Sans', sans-serif;
        color: #000000;
        background-color: white;
    }
    table{
        width: 100%;
        border-collapse: collapse;
    }
    .table,.table td,.table th{
        padding: 1rem;
        border: 1px solid black;
        border-collapse: collapse;
    }
    .table th{

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
    .border-box-black {
        border: 1px solid black;
    }

</style>
<body>
    @foreach ($box_details as $box)
    <div style="border:1px solid #000;padding: 0px;margin-bottom:5px;">
        <table width="100%" style="border-bottom: 1px solid #000;">
            <tr>
                <td width="40%">
                    <div class="p-1 d-block">
                        <div class="barcode_cls" style="padding: 10px 10px 0px 10px;"><img src="data:image/png;base64,{{ DNS1D::getBarcodePNG($inward,'C128', 2, 40) }}" /><br /> </div>
                        <div class="barcode_cls">{{ $inward }}</div>
                        <div class="barcode_cls">{{ date("d M Y", strtotime($inward_date)) }}</div>
                    </div>
                </td>
                <td width="60%"><div class="text-right"><strong><img width="200" src="data:image/png;base64,{{ base64_encode(file_get_contents(public_path('assets/logo.jpg'))) }}" alt="Logo" class="img-fluid"></div></td>
            </tr>
        </table>

        <table width="100%" style="border-bottom: 1px solid #000;">
            <tr>
                <td width="50%" class="align-left"><strong>PI : </strong>{{ $pi }}</td>
                <td width="50%" class="align-left"><strong>PO : </strong>{{ $box['po_number'] }}</td>
            </tr>
            <tr>
                <td width="50%" class="align-left">{{ date("d M Y", strtotime($pi_date)) }}</td>
                <td width="50%" class="align-left"></td>
            </tr>
        </table>
        <table width="100%"  style="border-bottom: 1px solid #000;">
            <tr>
                <td width="33.3%">
                    <div class="p-1 d-flex justify-content-center">
                        <div class="barcode_cls" style="padding: 5px 10px;">
                            <img src="data:image/png;base64,{{ DNS1D::getBarcodePNG($bt_id, 'C128', 1, 40) }}" /></div>
                        <div class="barcode_cls">{{ $bt_id }}</div>
                    </div>
                </td>
                {{-- <td width="33.3%">
                    <div class="p-1 d-block">
                        <div class="barcode_cls" style="padding: 5px 10px;"><img src="data:image/png;base64,{{ DNS1D::getBarcodePNG($box['grn_sys_id'], 'C128', 1, 40) }}" /></div>
                        <div class="text-center">{{ $box['grn_sys_id'] }}</div>
                    </div>
                </td>
                <td width="33.3%">
                    <div class="p-1 d-block">
                        <div class="barcode_cls" style="padding: 5px 10px;"><img src="data:image/png;base64,{{ DNS1D::getBarcodePNG($box['box_sys_id'], 'C128', 1, 40) }}" /></div>
                        <div class="text-center">{{ $box['box_sys_id'] }}</div>
                    </div>
                </td> --}}
            </tr>
        </table>
        <table width="100%">
            <tr>
                <td width="100%" class="align-left"><strong>Buyer Name : </strong>{{ $buyer_name }}</td>
            </tr>
        </table>
        <table width="100%">
            <tr>
                <td width="100%" class="align-left"><strong>Consignee Name : </strong>{{ $consignee_name }}</td>
            </tr>
        </table>
        <table width="100%">
            <tr>
                <td class="border-box-black" width="20%"><strong>L (CM) : </strong>{{ $box['length'] }}</td>
                <td class="border-box-black" width="20%"><strong>W (CM) : </strong>{{ $box['width'] }}</td>
                <td class="border-box-black" width="20%"><strong>H (CM) : </strong>{{ $box['height'] }}</td>
                <td class="border-box-black" width="20%"><strong>Net Wt (KG) : </strong>{{ $box['net_weight'] }}</td>
                <td class="border-box-black" width="20%"><strong>GRS Wt (KG) : </strong>{{ $box['gross_weight'] }}</td>
            </tr>
        </table>
        <table width="100%" style="border-bottom: 1px solid #000;">
            <tr>
                <td width="40%">
                    <div class="p-1 d-block">
                        {{-- <div class="barcode_cls" style="padding: 5px 10px;"><img src="data:image/png;base64,{{ DNS1D::getBarcodePNG($box['product_code'], 'C128', 1, 40) }}" /></div> --}}
                        {{-- <div class="text-center">{{ $box['product_code'] }}</div> --}}
                    </div>
                </td>

                <td width="30%"><strong>Qty : </strong>{{ $box['product_quantity'] }}</td>
                <td width="30%">{{ $box['hazardous_symbol'] }}</td>
            </tr>
        </table>

        <table width="100%">
            <tr>
                <td width="50%">
                    <div class="p-1 d-block">
                        {{-- <div class="barcode_cls" style="padding: 5px 10px;"><img src="data:image/png;base64,{{ DNS2D::getBarcodePNG($box['box_content'], 'QRCODE', 2.5, 2.5) }}" /></div> --}}
                    </div>
                </td>
                <td width="50%">
                    <div class="p-1 d-block">
                        @php

                            $text = ' Port of Loading : '.$port_of_loading;
                            $text .= ' Port of Discharge : '.$port_of_discharge;
                            $text .= ' Ref : '.$box['vendor_id'];
                            $text .= ' PRO : '.$box['po_number'];
                            $text .= ' Location : '.$box['location'];
                            $text .= ' IncoTerm : '.$incoTerm;
                        @endphp
                        <div class="barcode_cls" style="padding: 5px 10px;"><img src="data:image/png;base64,{{ DNS2D::getBarcodePNG($text, 'QRCODE', 2, 2) }}" /></div>
                    </div>
                </td>
            </tr>
        </table>
        <h5 style="text-align: center;">Inorbvict Healthcare is Govt. Recognized One Star Export House</h5>
    </div>
        @if (!$loop->last)
            <div class="page-break"></div>
        @endif
    @endforeach
</body>
</html>
