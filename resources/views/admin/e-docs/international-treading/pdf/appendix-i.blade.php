@include('admin.common.document-header')
<style>
    ol{
        padding-left:10px;
        margin-bottom:5%;
    }
    ol li,p{
        font-size: 11px;
        line-height: 20px;
    }
</style>
    <hr style="border: 1px solid red;margin-top:5px;margin-bottom:5px;">
    <table class="full-w" style="margin-bottom: 10px;">
        <tr>
            <td class="w-40" style="font-size:11px;vertical-align: top;">
                <span style="font-weight: bold">Invoice No : </span><span style="color: red;font-weight: bold;">{{ $invoice->invoice_number }}</span>
            </td>
            <td class="w-20"></td>
            <td class="w-40" style="font-size:11px;vertical-align: top;">
                <span style="font-weight: bold">Invoice Date : </span><span style="color: red;font-weight: bold;">{{ date("d/m/Y", strtotime($invoice->invoice_date)) }}</span>
            </td>
        </tr>
    </table>

    <strong style="font-size: 11px;">Declaration under Foreign Exchange Regulation Act, 1973 :</strong>
    <ol>
        <li>
            I/We hereby declare that I/We are the *SELLER/CONSIGNOR of the goods in respect of which this declaration is made and that the particulars given in the
            <strong>Shipping Bill No -</strong> <strong style="margin-left:15%; margin-right:15%;">Dated -</strong> are true and that,<br>
            (A)* The value as contracted with the buyer is same as the full export value in the above shipping bills.<br>
            (B)* The full export value of the goods are not ascertainable at the time of export and that the value declared is that which I/We, having regard
            to the prevailing market conditions, accept to receive on the sale of goods in the overseas market.
        </li>
        <li>
            I/We undertake that I/We will deliver to the bank named herein <strong style="color:red">{{ $bankDetails->bank_name }}</strong> the foreign exchange representing the full export value of the goods on
or before <strong style="color:red">{{ $invoice->received_amount }} {{ $invoice->currency }}</strong> in the manner prescribed in Rule 9 of the Foreign Exchange Regulation
        </li>
        <li>
            I/We further declares that I/We am/are resident in India and I/We have place of Business in India.
        </li>
        <li>
            We are not in Caution list of the Reserve Bank of India.
        </li>
    </ol>
    <hr style="border: 1px solid red;margin-top:5px;margin-bottom:5px;">
    <section class="tandc" style="margin-top:10px;">
        <table class="full-w">
            <tr>
                <td class="w-30" style="font-size:11px;vertical-align: top;">
                    @php
                        $qrString = '
                        Bank Name : '.$bankDetails->bank_name .'
                        Account Holder Name : '.$bankDetails->account_holder_name.'
                        Address : '.$bankDetails->address.'
                        Branch : '.$bankDetails->branch.'
                        Branch Code : '.$bankDetails->branch_code.'
                        Ad Code : '.$bankDetails->ad_code.'
                        Account No : '.$bankDetails->account_no.'
                        IFSC : '.$bankDetails->ifsc.'
                        Swift Code : '.$bankDetails->swift_code;
                    @endphp
                    <img src="data:image/png;base64,{{ DNS2D::getBarcodePNG($qrString, 'QRCODE', 2.5, 2.5) }}" />
                </td>
                <td class="w-40" style="font-size:11px;vertical-align: top;">
                    <strong>Bank Name : {{ $bankDetails->bank_name }}<br>
                    Account Holder Name : {{ $bankDetails->account_holder_name }}<br>
                    Address : {{ $bankDetails->address }}<br>
                    Branch : {{ $bankDetails->branch }}<br>
                    Branch Code : {{ $bankDetails->branch_code }}<br>
                    Ad Code : {{ $bankDetails->ad_code }}<br>
                    Account No : {{ $bankDetails->account_no }}<br>
                    IFSC : {{ $bankDetails->ifsc }}<br>
                    Swift Code : {{ $bankDetails->swift_code }}</strong>
                </td>
                <td class="w-30" style="vertical-align: top;text-align: right;font-size:11px;">
                    <strong>For Inorbvict Healthcare India Pvt Ltd</strong>
                </td>
            </tr>
        </table>
    </section>
</body>
</html>
