<!doctype html>
<html lang="en">
<head>
    <!-- Required meta tags -->
    <meta http-equiv="Content-Type" content="text/html; charset=utf-8"/>
    <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no">
    <link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/font-awesome/4.6.3/css/font-awesome.min.css">
    <title>Packaging & Label</title>
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
        margin-top: 0.6cm;
        margin-left: 0.2cm;
        margin-right: 0.2cm;
        margin-bottom: 0px;
        font-family: 'Century Gothic', 'DejaVu Sans', sans-serif;
        color: #000000;
    }
    .table{
        width: 100%;
    }
    .table,.table td,.table th{
        padding: 1rem;
        border: 1px solid black;
        border-collapse: collapse;
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
    .border-bottom {
        border-bottom: 1px solid #000;
    }
    .fa {
        display: inline;
        font-style: normal;
        font-variant: normal;
        font-weight: normal;
        font-size: 11px;
        line-height: 1;
        font-family: FontAwesome;
        font-size: inherit;
        text-rendering: auto;
        -webkit-font-smoothing: antialiased;
        -moz-osx-font-smoothing: grayscale;
    }

</style>
<body>
    @foreach ($box_details as $box)
    <div style="border:1px solid #000;margin-bottom:15px;">
        <table width="100%" class="border-bottom">
            <tr>
                <td width="40%">
                    <div class="p-1 d-block">
                        <div class="barcode_cls" style="padding: 10px 10px 0px 10px;"><img src="data:image/png;base64,{{ DNS1D::getBarcodePNG($box['pl_id'], 'C128', 1.5, 30) }}" /></div>
                        <div class="barcode_cls">{{ $box['pl_id'] }}</div>
                        <div class="barcode_cls">{{ date("d M Y", strtotime($box['pl_date'])) }}</div>
                    </div>
                </td>
                <td width="60%"><div class="text-right"><strong><img width="180" src="data:image/png;base64,{{ base64_encode(file_get_contents(public_path('assets/logo.jpg'))) }}" alt="Logo" class="img-fluid"></div></td>
            </tr>
        </table>

        <table width="100%" class="border-bottom">
            <tr>
                <td width="50%">
                    <div class="p-1 d-flex justify-content-center">
                        <div class="barcode_cls" style="padding: 5px 10px;"><img src="data:image/png;base64,{{ DNS1D::getBarcodePNG('BT-'.$bt_id, 'C128', 1.5, 30) }}" /></div>
                        <div class="barcode_cls">{{ 'BT-'.$bt_id }} ({{ date("d M Y", strtotime($bt_date)) }})</div>
                        <div class="barcode_cls">{{ $inward }} ({{ date("d M Y", strtotime($inward_date)) }})</div>
                    </div>
                </td>
                <td width="50%">
                    <div class="p-1 d-block">
                        <div class="barcode_cls" style="padding: 5px 10px;"><img src="data:image/png;base64,{{ DNS1D::getBarcodePNG($box['grn_sys_id'], 'C128', 1.5, 30) }}" /></div>
                        <div class="text-center">{{ $box['grn_sys_id'] }} {{ $box['grn_date'] }}</div>
                        <div class="barcode_cls">{{ $box['box_sys_id'] }} {{ $incoTerm }}</div>
                    </div>
                </td>
            </tr>
        </table>
        <table width="100%" class="border-bottom">
            <tr>
                <td width="50%">
                    <div class="p-1 d-block">
                        @php

                        $qr1 = ' V REF No : '.$box['vendor_id'];
                        $qr1 .= ' Pro No : '.$box['po_number'].' PRO Date : '.$box['po_date'];
                        $qr1 .= ' Location : '.$box['location'];
                    @endphp
                    <div class="barcode_cls" style="padding: 5px 10px;"><img src="data:image/png;base64,{{ DNS2D::getBarcodePNG($qr1, 'QRCODE', 2, 2) }}" /></div>
                    </div>
                </td>
                <td width="50%">
                    <div class="p-1 d-block">
                        @php

                            $text = ' Net Wt : '.$box['net_weight'];
                            $text .= ' Gross Wt : '.$box['gross_weight'];
                            $text .= ' L(cm) : '.$box['length'];
                            $text .= ' W(cm) : '.$box['width'];
                            $text .= ' H(cm) : '.$box['height'];
                            $text .= ' IncoTerm : '.$incoTerm;
                        @endphp
                        <div class="barcode_cls" style="padding: 5px 10px;"><img src="data:image/png;base64,{{ DNS2D::getBarcodePNG($text, 'QRCODE', 2, 2) }}" /></div>
                    </div>
                </td>
            </tr>
        </table>
        <table width="100%" class="border-bottom">
            <tr>
                <td width="100%" class="">
                    <div class="p-1 d-block">
                        @if (strlen($buyer_name)<70)
                            <div class="barcode_cls" style="padding: 5px 10px;"><img src="data:image/png;base64,{{ DNS1D::getBarcodePNG($buyer_name, 'C128', 0.6, 30) }}" /></div>
                        @else
                        <div class="barcode_cls" style="padding: 5px 10px;"><img src="data:image/png;base64,{{ DNS2D::getBarcodePNG($buyer_name, 'QRCODE', 2, 2) }}" /></div>
                        @endif
                        <div class="barcode_cls">BUYER NAME</div>
                    </div>
                </td>
            </tr>
        </table>
        <table width="100%" class="border-bottom">
            <tr>
                <td width="100%" class="">
                    <div class="p-1 d-block">
                        <div class="barcode_cls" style="padding: 5px 10px;"><img src="data:image/png;base64,{{ DNS1D::getBarcodePNG($consignee_name, 'C128', 0.6, 30) }}" /></div>
                        <div class="barcode_cls">CONSIGNEE NAME</div>
                    </div>
                </td>
            </tr>
        </table>

        <table width="100%" class="border-bottom">
            <tr>
                <td width="50%"><strong>Product Code : </strong>{{ $box['product_code'] }}</td>
                <td width="25%"><strong>Qty :</strong>{{ $box['product_quantity'] }} </td>
                <td width="25%"><strong>HZ/NZ : </strong>{{ $box['hazardous_symbol'] }}</td>
            </tr>
        </table>

        <table width="100%">
            <tr>
                <td width="100%" class="align-left"><strong><span class="fa fa-eye"></span></strong>  {{ $box['employee_names'] }}</td>
            </tr>
        </table>

    </div>
    @if (!$loop->last)
        <div class="page-break"></div>
    @endif
    @endforeach
</body>
</html>
