@include('admin.common.document-header')
<style>
    body {
        line-height: 95%;
    }
    ol{
        padding-left:10px;
    }
    ol li,p{
        font-size: 12px;
    }
</style>
    <hr style="border: 1px solid red;margin-top:5px;margin-bottom:5px;">
    <h5>See rule 7 of Customs valuation(Determination of value of export goods) Rules, 2007.</h5>
    <ol>
        <li><strong>Shipping Bill No :- <span style="margin-left: 22%;">Shipping Bill Date :-</span></strong></li>
        <li><strong>Invoice No :- </strong>{{ $invoice->invoice_number }}<strong><span style="margin-left: 15%;">Invoice Date :- </span></strong>{{ date("d/m/Y", strtotime($invoice->invoice_date)) }}</li>
        <li><strong>Nature Of Transaction :- </strong>{{ $invoice->nature_of_transaction }}</li>
        <li><strong>Method of Valuation :- </strong>{{ $invoice->method_of_valuation }}</li>
        <li><strong>Whether Seller and Buyer are Related :- </strong>{{ $invoice->buyer_saller_related }}</li>
        <li><strong>If yes, whether relationship has Influenced the price :- </strong>{{ $invoice->buyersallerprice }}</li>
        <li><strong>Terms of Payment :- </strong>{{ $invoice->payment_terms }}</li>
        <li><strong>Terms of Delivery :- </strong>{{ $invoice->incoterm->inco_term }}</li>
        <li>
            <strong>Previous export of identical / similar goods, if any :- </strong><br>
            <strong>Shipping Bill No :-<br>
                Shipping Bill Date :-</strong>
        </li>
        <li><strong>Any other relevant information (Attach separate sheet, if necessary) :- </strong>{{ $invoice->any_other }}</li>
    </ol>
    <h5 style="text-align: center;"><strong>DECLARATION</strong></h5>
    <p style="margin-top: 0;">I/We hereby declare that the information furnished above is true, complete and correct in every respect. I/We also undertake to bring to the notice of proper
        officer any particulars which subsequently come to my/our know which will have bearing on a valuation.</p>
    <span style="font-size: 12px;"><strong>Place :- </strong>{{ $companyDetails->city }}<br></span>
    <span style="font-size: 12px;"><strong>Date :- </strong>{{ date("d/m/Y", strtotime($invoice->invoice_date)) }}</span>
    <hr style="border: 1px solid red;margin-top:5px;margin-bottom:5px;">
    <section class="tandc" style="margin-top:10px;">
        <table class="full-w">
            <tr>
                <td class="w-30" style="vertical-align: top;">
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
                <td class="w-40" style="font-size:11px; line-height: 100%; vertical-align: top;">
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
