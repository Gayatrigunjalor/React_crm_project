<!doctype html>
<html lang="en">
<head>
    <!-- Required meta tags -->
    <meta http-equiv="Content-Type" content="text/html; charset=utf-8"/>
    <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no">
    <title>AP</title>
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
    margin-bottom: 150px;
    font-family: 'Century Gothic', 'DejaVu Sans', sans-serif;
    color: #0a09098f;
}
.logo img{
    height: 70px;
}
    .table{
        width: 100%;
    }
    .table,.table td,.table th{
        padding: 1rem;
        border: 1px solid black;
        border-collapse: collapse;
    }
    .table th{

    }
    .table td{
        font-size:12px;
        vertical-align: top;
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
</style>
<body>
    @for ($i = 0; $i < 2; $i++)
    <div style="border:1px solid #000;padding: 5px;margin-bottom:25px;">
    <table width="100%">
        <tr>
            <td width="40%" class="logo" >
                    <img src="data:image/png;base64,{{ base64_encode(file_get_contents(public_path('assets/logo.jpg'))) }}" alt="Logo" class="img-fluid">
            </td>
            <td width="20%"></td>
            <td width="40%" rowspan="2" style="font-size:11px;vertical-align: top;">
                <strong>Shipper Name : </strong><br>
                <strong>Inorbvict Healthcare India Private Limited</strong><br>
                {{ $companyDetails->address }},
                {{ $companyDetails->city }}, {{ $companyDetails->state }}
                {{ $companyDetails->country }} {{ $companyDetails->pin_code }}<br>
                {{ $companyDetails->mobile }}<br>
                <strong>GST No : </strong>{{ $companyDetails->gst_no }}<br>
                <strong>PAN No : </strong>{{ $companyDetails->pan_no }}<br>
                <strong>CIN : </strong>{{ $companyDetails->cin }}<br>
                <strong>IEC : </strong>{{ $companyDetails->iec }}<br>
                <strong>DRUG LIC : </strong>{{ $companyDetails->drug_lic_no }}<br>
                <strong>PCPNDT No  : </strong>{{ $companyDetails->pcpndt_no }}<br>
                <strong>ISO No : </strong>{{ $companyDetails->iso }}<br>
            </td>
        </tr>
        <tr>
            <td width="40%" style="vertical-align: bottom;">
                <strong><h2 style="margin:0px"></h2></strong>
            </td>
            <td width="20%"> </td>
        </tr>
    </table>
    <hr style="border: 1px solid red;margin-top:5px;margin-bottom:5px;">
    <table width="100%">
        <tr>
            <td width="40%" style="font-size:11px;vertical-align: top;">
                            <strong>Buyer Name : </strong>{{ $buyerDetails->name }}<br>
                            {{ $buyerDetails->address }}<br>{{ $buyerDetails->email }}
                            {{ $buyerDetails->contact_no }}
            </td>
            <td width="20%"></td>
            <td width="40%"  rowspan="2" style="font-size:11px;vertical-align: top;">
                @php
                $qrString = 'Buyer:
'.$buyerDetails->name.'
'.$buyerDetails->address.'
'.$buyerDetails->city.' '.$buyerDetails->state_name.' '.$buyerDetails->country_name.'
'.$buyerDetails->pin_code.'
'.$buyerDetails->email.'
'.$buyerDetails->contact_no.'
Consignee:
            '.$consigneeDetails->name.'
            '.$consigneeDetails->address.'
            '.$consigneeDetails->city.' '.$consigneeDetails->state_name.' '.$consigneeDetails->country_name.'
            '.$consigneeDetails->pin_code.'
            '.$consigneeDetails->email.'
            '.$consigneeDetails->mobile;
            @endphp
            <p>SHIP DATE {{ date("d/m/Y", strtotime($invoice->invoice_date)) }}</p>
                    <img src="data:image/png;base64, {!! base64_encode(QrCode::format('svg')->size(100)->generate($qrString)) !!}">
            </td>
        </tr>
        <tr>
            <td width="40%" style="font-size:11px;vertical-align: top;">
                @if (!empty($invoice->consignee_ids))
                    <strong>Consignee Name : </strong>{{ $consigneeDetails->name ?? '' }}<br>
                    {{ $consigneeDetails->address ?? '' }}<br>
                    {{ $consigneeDetails->email ?? '' }}{{ $consigneeDetails->mobile ?? '' }}
                @endif
            </td>
            <td width="20%"></td>
        </tr>
    </table>
    <hr style="border: 1px solid red;margin-top:5px;margin-bottom:10px;">
    <table width="100%">
        <tr>
            <td style="width:15%;"></td>
            <td style="font-size:11px;vertical-align: top; width:70%;text-align: center">
                <span>{!! DNS1D::getBarcodeHTML($invoice->invoice_number, 'C128') !!}</span><br>
                    <strong>{{ $invoice->invoice_number }}</strong><br>
                    <strong>Marks & No. of Packages : </strong>{{ $invoice->no_of_packages }}
            </td>
            <td style="width:15%;"></td>
        </tr>
    </table>
    </div>
    @endfor
</body>
</html>
