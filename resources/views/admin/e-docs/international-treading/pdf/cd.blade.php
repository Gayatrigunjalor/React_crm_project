<!doctype html>
<html lang="en">
<head>
    <!-- Required meta tags -->
    <meta http-equiv="Content-Type" content="text/html; charset=utf-8"/>
    <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no">
    <title>Consignee Declaration</title>
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
    font-size:12px;
}
</style>
<body>

<p>Date: 21 September 2022</p>
<p>The Director,<br>
    Inorbvict Healthcare India Pvt Ltd,<br>
    Office 311, 3rd Floor, Xion Mall, Hinjewadi<br>
    Pune 411057 Maharashtra State, India</p>
<p>Sub: Consignment acceptance letter for seller, Inorbvict Healthcare India Pvt Ltd to send shipment to consignee, {{ $consigneeDetails->name }} instead of buyer {{ $buyerDetails->name }}.</p>
<p>Dear Sir,</p>
<p>We, {{ $consigneeDetails->name }}, (hereinafter referred to as consignee)  {{ $consigneeDetails->address }} have been granted permission by the {{ $buyerDetails->name }}, {{ $buyerDetails->address }} (hereinafter referred to as buyer) to handle their future shipments between {{ $buyerDetails->name }} (the buyer) and Inorbvict Healthcare India Pvt Ltd (Seller) and we declare that we, {{ $consigneeDetails->name }} are authorized consignee or authorized agent of the {{ $buyerDetails->name }}.
    {{ $consigneeDetails->name }} confirm & agree to receive shipment from Inorbvict Healthcare India Pvt Ltd on behalf of {{ $buyerDetails->name }} and deliver them to {{ $buyerDetails->name }} at their registered address</p><br><br>

<p>Truly yours</p>
<p>For, {{ $consigneeDetails->name }}</p>
<p style="margin-top:150px;">Sign, Stamp</p>
</body>
</html>
