<!doctype html>
<html lang="en">
<head>
    <!-- Required meta tags -->
    <meta http-equiv="Content-Type" content="text/html; charset=utf-8"/>
    <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no">
    <link rel="stylesheet" type="text/css" href="{{ asset('app-assets/css/bootstrap.css') }}">
    <title>Freight Enquiry</title>
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
        padding-top: 0.8cm;
        padding-left: 0.2cm;
        padding-right: 0.2cm;
        padding-bottom: 0.8cm;
        font-family: 'Century Gothic', 'DejaVu Sans', sans-serif;
        color: #0a09098f;
        background-color: #f1f1f1;
    }
    .red {
        color: red;
    }
    .no-border {
        border: 0 !important;
    }
    table{
        width: 100%;
        border-collapse: collapse;
    }
    .table,.table td,.table th{
        padding-left: 0.5rem;
        /* border: 1px solid black; */
        border-collapse: collapse;

        font-size:11px;
        text-align: left;
        vertical-align: top;
    }
    .table,.table tr{
        margin-bottom: 5px;
    }
    .align-left{
        text-align: left !important;
        vertical-align: top;
        padding-left: 4px;
    }
    .border-box-black {
        border: 1px solid black;
    }
    .grey {
        color: #0a09098f;
    }
    .gaps{
        padding-left: 1rem;
        padding-right: 1rem;
    }
</style>
<body>
    <table class="gaps" width="100%">
        <tr>
            <td class="no-border" width="33.3%" style="text-align: left; vertical-align:middle;">
                <img width="250" src="data:image/png;base64,{{ base64_encode(file_get_contents(public_path('assets/inorbvict_red2.jpg'))) }}" alt="Logo" class="img-fluid">
            </td>
            <td width="33.3%" style="text-align: center;">
                <img width="100" src="data:image/png;base64,{{ base64_encode(file_get_contents(public_path('assets/govt_recognition.png'))) }}" alt="Logo" class="img-fluid">
            </td>
            <td class="no-border" width="33.3%" style="text-align: right; vertical-align:middle;">
                <img width="200" src="data:image/png;base64,{{ base64_encode(file_get_contents(public_path('assets/one_star_export.png'))) }}" alt="Logo" class="img-fluid">
            </td>
        </tr>
    </table>
    <hr style="border: 1px solid red; margin:1rem;">
    <h2 style="margin: 0; text-align: center;" class="gaps grey">REQUEST FOR QUOTATION</h2>
    <br>
    <table class="table">
        <tr>
            <td width="30%" style="text-align: top !important;"><strong>Address of Exporter</td></strong>
            <td width="70%"> {{ $exporter_address }}</td>
        </tr>
    </table>
    <table class="table">
        <tr>
            <td width="30%"><strong>Pickup Location</strong></td>
            <td width="70%">{{ $inward->pickup_location }}</td>
        </tr>
    </table>
    <table class="table">
        <tr>
            <td width="30%"><strong>Address of Importer</strong></td>
            <td width="70%">{{ $importer_address }}</td>
        </tr>
    </table>
    <table class="table">
        <tr>
            <td width="30%"><strong>Dimension Of Boxes <br> [</strong> L*B*H in CM(s) <strong>]</strong></td>
            <td width="70%">
                @foreach ($dimensions as $arr => $val)
                    {{ $val }} =  {{ $arr }}  <br>
                @endforeach
            </td>
        </tr>
    </table>
    <table class="table">
        <tr>
            <td width="30%"><strong>HSN code(s)</strong></td>
            <td width="70%">{{ implode(", ", $hsn_arr) }}</td>
        </tr>
    </table>
    <hr>
    <table class="table">
        <tr>
            <td width="50%" style="padding: 0 !important;">
                <table class="">
                    <tr>
                        <td width="40%"><strong>Mode Of Shipment</strong></td>
                        <td width="60%">@if( $inward->mode_of_shipment != "" || $inward->mode_of_shipment != null)
                                {{ ($inward->mode_of_shipment == "by_sea") ? "By Sea" : "By Air" }}
                            @endif
                        </td>
                    </tr>
                </table>
            </td>
            <td width="50%" style="padding: 0 !important;">
                <table class="">
                    <tr>
                        <td width="40%"><strong>Terms Of Shipment</strong></td>
                        <td width="60%">@if( $inward->terms_of_shipment != "" || $inward->terms_of_shipment != null)
                                @if($inward->terms_of_shipment == "door_to_door") Door to Door
                                @elseif ($inward->terms_of_shipment == "door_to_port") Door to Port
                                @else Port to Port
                                @endif
                            @endif
                        </td>
                    </tr>
                </table>
            </td>

        </tr>
    </table>

    <table class="table">
        <tr>
            <td width="50%" style="padding: 0 !important;">
                <table class="">
                    <tr>
                        <td width="40%"><strong>Port Of Unloading</strong></td>
                        <td width="60%">{{ $inward->port_of_discharge }}</td>
                    </tr>
                </table>
            </td>
            <td width="50%" style="padding: 0 !important;">
                <table class="">
                    <tr>
                        <td width="40%"><strong>Number of boxes</strong></td>
                        <td width="60%">{{ $box_count }}</td>
                    </tr>
                </table>
            </td>

        </tr>
    </table>
    <table class="table">
        <tr>
            <td width="50%" style="padding: 0 !important;">
                <table class="">
                    <tr>
                        <td width="40%"><strong>Total Net Weight</strong></td>
                        <td width="60%">{{ $total_net_weight }} KG</td>
                    </tr>
                </table>
            </td>
            <td width="50%" style="padding: 0 !important;">
                <table class="">
                    <tr>
                        <td width="40%"><strong>Total Gross Weight</strong></td>
                        <td width="60%">{{ $total_gross_weight }} KG</td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>

    <table class="table">
        <tr>
            <td width="50%" style="padding: 0 !important;">
                <table class="">
                    <tr>
                        <td width="40%"><strong>Total Volume Weight</strong></td>
                        <td width="60%">{{ round($total_volume_weight, 2) }} KG</td>
                    </tr>
                </table>
            </td>
            <td width="50%" style="padding: 0 !important;">
                <table class="">
                    <tr>
                        <td width="40%"><strong>Inco Term</strong></td>
                        <td width="60%">{{ $inward->inco_term->inco_term }}</td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
    <table class="table">
        <tr>
            <td width="50%" style="padding: 0 !important;">
                <table class="">
                    <tr>
                        <td width="40%"><strong>Cold Chain Req.</strong></td>
                        <td width="60%">{{ $cc }}</td>
                    </tr>
                    @if($temp != 'null')
                    <tr>
                        <td width="40%"><strong>Temprature</strong></td>
                        <td width="60%">{{ $temp }}</td>
                    </tr>
                    @endif
                </table>
            </td>
            <td width="50%" style="padding: 0 !important;">
                <table class="">
                    <tr>
                        <td width="40%"><strong>Insurance Req.</strong></td>
                        <td width="60%">{{ $ins }}</td>
                    </tr>
                    @if($ins_val != 'null')
                    <tr>
                        <td width="40%"><strong>Insurance Amount</strong></td>
                        <td width="60%">{{ $ins_val }}</td>
                    </tr>
                    @endif
                </table>
            </td>
        </tr>
    </table>
    <hr>

    <table class="table" width="100%" style="margin-top:15;">
        <tr>
            <td style="font-size:11px;vertical-align: top;">
                <strong>Contact Details:</strong> <br>
                <p style="font-size: 10px;">
                    1. Primary Point of Contact:<br>
                    Email: logistics@inhpl.com<br><br>
                    2. Senior Contact:<br>
                    Email: hod@inhpl.com<br><br>
                    3. Senior Management Contact:<br>
                    Email: rajeshmeshram50@gmail.com
                </p>
            </td>
        </tr>
    </table>
    <table class="table" width="100%" style="margin-top:15;">
        <tr>
            <td style="font-size:11px;vertical-align: top;">
                <strong> Terms And Conditions </strong> <br>
                <p style="font-size: 10px;">
                    1. Payment Terms: Payment shall be made upon receipt of original documents. All payments are to be made by cheque only. <br>
                    2. Price Validity:Prices quoted are valid for a period of one month from the date of the transportation quotation. <br>
                    3. Price Escalation: Inorbvict shall not be liable for any additional charges incurred due to escalations by airlines or shipping lines within one month of the transportation quotation date.<br>
                    4. Additional Charges:Inorbvict agrees to pay only the mutually agreed-upon quoted price and shall not be responsible for any additional charges like warehouse charges etc. unless explicitly agreed upon.<br>
                </p><br>
            </td>
        </tr>
    </table>









</body>
</html>



