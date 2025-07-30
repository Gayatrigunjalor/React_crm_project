<!doctype html>
<html lang="en">
<head>
    <!-- Required meta tags -->
    <meta http-equiv="Content-Type" content="text/html; charset=utf-8"/>
    <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no">
    <title>Buyer Declaration</title>
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
        <p>Date: {{ date("jS \of F Y", strtotime($quotation->pi_date)) }}<p></p>
        <p>The Director,<br>
        Inorbvict Healthcare India Pvt Ltd,<br>
        Office 311, 3rd Floor, Xion Mall, Hinjewadi<br>
        Pune 411057 Maharashtra State, India</p>
        <p>Dear Sir</p>
        <p>Sub: Directive letter for seller, Inorbvict Healthcare India Pvt Ltd to send shipment to consignee {{ $consigneeDetails->name }} instead of buyer {{ $buyerDetails->name }}.</p>
        <p>We, {{ $buyerDetails->name }} {{ $buyerDetails->address }} (hereinafter referred to as buyer) hereby declare as well as direct/ instruct to the seller, Inorbvict Healthcare India Pvt. Ltd (hereinafter referred to as seller) that for forthcoming dealings & shipments taking place between {{ $buyerDetails->name }} (buyer) & Inorbvict Healthcare India Pvt Ltd will be made through our one of authorized consignees or authorized agent which is, {{ $consigneeDetails->name }}, (hereinafter referred to as consignee)  {{ $consigneeDetails->address }}.</p>
        <p>We, {{ $buyerDetails->name }} hereby authorize {{ $consigneeDetails->name }} to pick up the goods and deliver them to us at our registered address.</p>
        <p>We, {{ $buyerDetails->name }} declare that the money remit to Inorbvict Healthcare India Pvt Ltd through normal banking channel.</p>
        <p>We also confirm that we are in the business of import for a period of more than six months.</p>
        <p>We, {{ $buyerDetails->name }} indemnify Inorbvict Healthcare India Pvt Ltd against any possible loss arising due to whatsoever reasons in processing this transaction.</p>
        <br><br>
        <p>Truly yours</p>
        <p>For, {{ $buyerDetails->name }}</p>
        <p style="margin-top:150px;">Sign, Stamp</p>
</body>
</html>
