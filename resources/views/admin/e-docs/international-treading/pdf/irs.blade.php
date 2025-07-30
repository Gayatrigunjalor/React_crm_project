<!doctype html>
<html lang="en">
<head>
    <!-- Required meta tags -->
    <meta http-equiv="Content-Type" content="text/html; charset=utf-8"/>
    <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no">
    <title>IRS</title>
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

body {
    margin-top: 1cm;
    margin-left: 1cm;
    margin-right: 1cm;
    font-family: 'Century Gothic', 'DejaVu Sans', sans-serif;
    color: #0a09098f;
    font-size: 11px;
}

.column img{
    height: 60px;
}
.row:after {
content: "";
display: table;
clear: both;
}
</style>
<body>
    <table style="width: 100%;">
        <tr>
            <td>
                <div class="column" style="border:1px solid #000;padding: 8px;margin:20px;">
                    <center><img src="data:image/png;base64,{{ base64_encode(file_get_contents(public_path('assets/logo.jpg'))) }}" alt="Logo" class="img-fluid"></center>
                    <hr style="border: 1px solid red;"><br>
                            <strong>Invoice Number : </strong>{{ $invoice->invoice_number }}<br>
                            <strong>Invoice Date : </strong>{{ $invoice->invoice_date }}<br>
                            <table class="table" style="width:100%;">
                                    <tr  style="font-weight:bold">
                                        <td>Product Code</td>
                                        <td>Qty</td>
                                    </tr>
                                    @foreach ($invoiceProducts as $invoiceProduct)
                                    <tr>
                                        <td>{{ $invoiceProduct->product_code }}</td>
                                        <td>{{ $invoiceProduct->quantity }}</td>
                                    </tr>
                                    @endforeach
                            </table>
                            <strong>Buyer Name : </strong>{{ $buyerDetails->name }}<br>
                            <strong>Consignee Name : </strong>{{ $consigneeDetails->name }}<br>
                            <strong>No Of Packages : </strong>{{ $invoice->no_of_packages }}<br>
                            <strong>Port of Loading : </strong>{{ $invoice->port_of_loading }}<br>
                            <strong>Port Of Discharge : </strong>{{ $invoice->port_of_discharge }}<br>
                            <strong>Final Destination : </strong>{{ $invoice->final_destination }}<br>
                            <strong>Shipment Type  : </strong>{{ $invoice->shipment_type }}<br>
                            <strong>Incoterm : </strong>{{ $invoice->incoterm->inco_term }}<br>
                            <strong>DFFD : </strong>{{ $invoice->ffdDomestic->ffd_name }}<br>
                            <strong>IFFD : </strong>{{ $invoice->ffdInternational->ffd_name }}<br>
                            <table class="table" style="width:100%;">
                                <tr style="text-align: left">
                                    <th>SDE</th>
                                    <th>BPE</th>
                                    <th>DEO</th>
                                    <th>PM</th>
                                    <th>LM</th>
                                    <th>ADMIN</th>
                                </tr>
                                <tr>
                                    <td style="text-align: center"><input type="checkbox"></td>
                                    <td style="text-align: center"><input type="checkbox"></td>
                                    <td style="text-align: center"><input type="checkbox"></td>
                                    <td style="text-align: center"><input type="checkbox"></td>
                                    <td style="text-align: center"><input type="checkbox"></td>
                                    <td style="text-align: center"><input type="checkbox"></td>
                                </tr>
                        </table>
                </div>
            </td>
            <td>
                <div class="column" style="border:1px solid #000;padding: 8px;margin:20px;">
                    <center><img src="data:image/png;base64,{{ base64_encode(file_get_contents(public_path('assets/logo.jpg'))) }}" alt="Logo" class="img-fluid"></center>
                    <hr style="border: 1px solid red;"><br>
                            <strong>Invoice Number : </strong>{{ $invoice->invoice_number }}<br>
                            <strong>Invoice Date : </strong>{{ $invoice->invoice_date }}<br>
                            <table class="table" style="width:100%;">
                                    <tr  style="font-weight:bold">
                                        <td>Product Code</td>
                                        <td>Qty</td>
                                    </tr>
                                    @foreach ($invoiceProducts as $invoiceProduct)
                                    <tr>
                                        <td>{{ $invoiceProduct->product_code }}</td>
                                        <td>{{ $invoiceProduct->quantity }}</td>
                                    </tr>
                                    @endforeach
                            </table>
                            <strong>Buyer Name : </strong>{{ $buyerDetails->name }}<br>
                            <strong>Consignee Name : </strong>{{ $consigneeDetails->name }}<br>
                            <strong>No Of Packages : </strong>{{ $invoice->no_of_packages }}<br>
                            <strong>Port of Loading : </strong>{{ $invoice->port_of_loading }}<br>
                            <strong>Port Of Discharge : </strong>{{ $invoice->port_of_discharge }}<br>
                            <strong>Final Destination : </strong>{{ $invoice->final_destination }}<br>
                            <strong>Shipment Type  : </strong>{{ $invoice->shipment_type }}<br>
                            <strong>Incoterm : </strong>{{ $invoice->incoterm->inco_term }}<br>
                            <strong>DFFD : </strong>{{ $invoice->ffdDomestic->ffd_name }}<br>
                            <strong>IFFD : </strong>{{ $invoice->ffdInternational->ffd_name }}<br>
                            <table class="table" style="width:100%;">
                                <tr style="text-align: left">
                                    <th>SDE</th>
                                    <th>BPE</th>
                                    <th>DEO</th>
                                    <th>PM</th>
                                    <th>LM</th>
                                    <th>ADMIN</th>
                                </tr>
                                <tr>
                                    <td style="text-align: center"><input type="checkbox"></td>
                                    <td style="text-align: center"><input type="checkbox"></td>
                                    <td style="text-align: center"><input type="checkbox"></td>
                                    <td style="text-align: center"><input type="checkbox"></td>
                                    <td style="text-align: center"><input type="checkbox"></td>
                                    <td style="text-align: center"><input type="checkbox"></td>
                                </tr>
                        </table>
                </div>
            </td>
        </tr>
        <tr>
            <td>
                <div class="column" style="border:1px solid #000;padding: 8px;margin:20px;">
                    <center><img src="data:image/png;base64,{{ base64_encode(file_get_contents(public_path('assets/logo.jpg'))) }}" alt="Logo" class="img-fluid"></center>
                    <hr style="border: 1px solid red;"><br>
                            <strong>Invoice Number : </strong>{{ $invoice->invoice_number }}<br>
                            <strong>Invoice Date : </strong>{{ $invoice->invoice_date }}<br>
                            <table class="table" style="width:100%;">
                                    <tr  style="font-weight:bold">
                                        <td>Product Code</td>
                                        <td>Qty</td>
                                    </tr>
                                    @foreach ($invoiceProducts as $invoiceProduct)
                                    <tr>
                                        <td>{{ $invoiceProduct->product_code }}</td>
                                        <td>{{ $invoiceProduct->quantity }}</td>
                                    </tr>
                                    @endforeach
                            </table>
                            <strong>Buyer Name : </strong>{{ $buyerDetails->name }}<br>
                            <strong>Consignee Name : </strong>{{ $consigneeDetails->name }}<br>
                            <strong>No Of Packages : </strong>{{ $invoice->no_of_packages }}<br>
                            <strong>Port of Loading : </strong>{{ $invoice->port_of_loading }}<br>
                            <strong>Port Of Discharge : </strong>{{ $invoice->port_of_discharge }}<br>
                            <strong>Final Destination : </strong>{{ $invoice->final_destination }}<br>
                            <strong>Shipment Type  : </strong>{{ $invoice->shipment_type }}<br>
                            <strong>Incoterm : </strong>{{ $invoice->incoterm->inco_term }}<br>
                            <strong>DFFD : </strong>{{ $invoice->ffdDomestic->ffd_name }}<br>
                            <strong>IFFD : </strong>{{ $invoice->ffdInternational->ffd_name }}<br>
                            <table class="table" style="width:100%;">
                                <tr style="text-align: left">
                                    <th>SDE</th>
                                    <th>BPE</th>
                                    <th>DEO</th>
                                    <th>PM</th>
                                    <th>LM</th>
                                    <th>ADMIN</th>
                                </tr>
                                <tr>
                                    <td style="text-align: center"><input type="checkbox"></td>
                                    <td style="text-align: center"><input type="checkbox"></td>
                                    <td style="text-align: center"><input type="checkbox"></td>
                                    <td style="text-align: center"><input type="checkbox"></td>
                                    <td style="text-align: center"><input type="checkbox"></td>
                                    <td style="text-align: center"><input type="checkbox"></td>
                                </tr>
                        </table>
                </div>
            </td>
            <td>
                <div class="column" style="border:1px solid #000;padding: 8px;margin:20px;">
                    <center><img src="data:image/png;base64,{{ base64_encode(file_get_contents(public_path('assets/logo.jpg'))) }}" alt="Logo" class="img-fluid"></center>
                    <hr style="border: 1px solid red;"><br>
                            <strong>Invoice Number : </strong>{{ $invoice->invoice_number }}<br>
                            <strong>Invoice Date : </strong>{{ $invoice->invoice_date }}<br>
                            <table class="table" style="width:100%;">
                                    <tr style="font-weight:bold">
                                        <td>Product Code</td>
                                        <td>Qty</td>
                                    </tr>
                                    @foreach ($invoiceProducts as $invoiceProduct)
                                    <tr>
                                        <td>{{ $invoiceProduct->product_code }}</td>
                                        <td>{{ $invoiceProduct->quantity }}</td>
                                    </tr>
                                    @endforeach
                            </table>
                            <strong>Buyer Name : </strong>{{ $buyerDetails->name }}<br>
                            <strong>Consignee Name : </strong>{{ $consigneeDetails->name }}<br>
                            <strong>No Of Packages : </strong>{{ $invoice->no_of_packages }}<br>
                            <strong>Port of Loading : </strong>{{ $invoice->port_of_loading }}<br>
                            <strong>Port Of Discharge : </strong>{{ $invoice->port_of_discharge }}<br>
                            <strong>Final Destination : </strong>{{ $invoice->final_destination }}<br>
                            <strong>Shipment Type  : </strong>{{ $invoice->shipment_type }}<br>
                            <strong>Incoterm : </strong>{{ $invoice->incoterm->inco_term }}<br>
                            <strong>DFFD : </strong>{{ $invoice->ffdDomestic->ffd_name }}<br>
                            <strong>IFFD : </strong>{{ $invoice->ffdInternational->ffd_name }}<br>
                            <table class="table" style="width:100%;">
                                <tr style="text-align: left">
                                    <th>SDE</th>
                                    <th>BPE</th>
                                    <th>DEO</th>
                                    <th>PM</th>
                                    <th>LM</th>
                                    <th>ADMIN</th>
                                </tr>
                                <tr>
                                    <td style="text-align: center"><input type="checkbox"></td>
                                    <td style="text-align: center"><input type="checkbox"></td>
                                    <td style="text-align: center"><input type="checkbox"></td>
                                    <td style="text-align: center"><input type="checkbox"></td>
                                    <td style="text-align: center"><input type="checkbox"></td>
                                    <td style="text-align: center"><input type="checkbox"></td>
                                </tr>
                        </table>
                </div>
            </td>
        </tr>
    </table>
</body>
</html>
