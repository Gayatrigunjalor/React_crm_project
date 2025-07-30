<!doctype html>
<html lang="en">
<head>
    <!-- Required meta tags -->
    <meta http-equiv="Content-Type" content="text/html; charset=utf-8"/>
    <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no">
    <title>Sales Contract</title>
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
    margin-bottom: 1cm;
    font-family: 'Century Gothic', 'DejaVu Sans', sans-serif;
    color: #0a09098f;
    font-size:11px;
}
.table{
    width: 100%;
}

.table td{
    font-size:12px;
    vertical-align: top;
    line-height:20px;
}
.product-area .table,.product-area th,.product-area td {
  border: 1px solid black;
  border-collapse: collapse;
}
</style>
<body>
        <table class="table" style="margin-top:10px;">
            <tr>
                <td style="text-align:center;">
                    <strong>SALES CONTRACT</strong><br>
                    <strong>This Sales Agreement is entered into {{ date("jS \of F Y", strtotime($quotation->pi_date)) }} at Pune, India by and</strong><br>
                    <strong>between</strong>
                </td>
            </tr>
            <tr>
                <td>
                    <strong>Inorbvict Healthcare India Pvt. Ltd.</strong> with an address of Shop No. 311,  3rd. Floor, Xion Mall, Hinjewadi,  Pune-411057,  Maharashtra,  India (the “<strong>Seller</strong>”)<br>
                    and
                </td>
            </tr>
            <tr>
                <td>
                    <strong>{{ $buyerDetails->name }}</strong>, with an address of {{ $buyerDetails->address }}, (the “<strong>Buyer</strong>”), also individually referred to as “<strong>Party</strong>”, and collectively “the <strong>Parties</strong>.”
                </td>
            </tr>
        </table>
        <table class="table" style="margin-top:5px;">
            <tr>
                <td>
                    TT DETAILS: <br>
                    Beneficiary Account Name : {{ $bankDetails->account_holder_name }}<br>
                    Beneficiary Bank Name : {{ $bankDetails->bank_name }}<br>
                    Beneficiary Account No : {{ $bankDetails->account_no }}<br>
                    Beneficiary Bank Address : {{ $bankDetails->address }}<br>
                    Swift Code : {{ $bankDetails->swift_code }}
                    {{-- Branch : {{ $bankDetails->branch }}<br>
                    Branch Code : {{ $bankDetails->branch_code }}<br>
                    Ad Code : {{ $bankDetails->ad_code }}<br>
                    IFSC : {{ $bankDetails->ifsc }}<br> --}}
                </td>
            </tr>
        </table>

        <table class="table" style="margin-top:5px;">
            <tr>
                <td>
                    This contract is made by and between the Buyer and the Seller on the basis of mutually agreed terms & conditions of seller’s proforma invoice number <strong>{{ $quotation->pi_number }}</strong> on dated <strong>{{ date("d/m/Y", strtotime($quotation->pi_date)) }}</strong>, whereby the Buyer agrees to buy and the Seller agree to sell under– mentioned commodity according to the terms and conditions stipulated below: <br>
                </td>
            </tr>
            <tr>
                <td>
                    Inco term : </strong>@if(!empty($incoTerm)){{ $incoTerm->inco_term }}@endif <br>
                    Port of Loading : </strong>{{ $quotation->port_of_loading ?? '' }} <br>
                    Port of Discharge : </strong>{{ $quotation->port_of_discharge ?? '' }} <br>
                </td>
            </tr>
            <tr>
                <td>
                    The Buyer wishes to purchase the aforementioned product(s).
                </td>
            </tr>
        </table>
        <section class="product-area" style="margin-top:15px;">
            <table class="table">
                <thead>
                    <tr>
                        <th style="text-align:left;">Sr No</th>
                        <th style="text-align:left;">Product Name</th>
                        <th style="text-align:left;">Qty</th>
                        <th style="text-align:left;">HSN Code</th>
                        <th style="text-align:left;">Rate</th>
                        <th style="text-align:left;">Amount</th>
                    </tr>
                </thead>
                <tbody>
                    @foreach ($quotationProducts as $quotationProduct)
                    <tr>
                        <td>{{ $loop->iteration }}</td>
                        <td>
                            {{ $quotationProduct->product_name }}
                        </td>
                        <td>{{ $quotationProduct->quantity }}</td>
                        <td>{{ $quotationProduct->hsn }}</td>
                        <td>{{ number_format($quotationProduct->rate, 2) }}</td>
                        <td>{{ number_format($quotationProduct->amount, 2) }}</td>
                    </tr>
                    @endforeach
                    <tr>
                        <td colspan="5"><strong>TOTAL PRODUCT COST / EXW VALUE</strong></td>
                        <td><strong>@if($symbol){{ $symbol->symbol }}@endif {{ number_format($quotation->total, 2) }}</strong></td>
                    </tr>
                    <tr>
                        <td colspan="5"><strong>FREIGHT</strong></td>
                        <td><strong>@if($symbol){{ $symbol->symbol }}@endif {{ number_format($quotation->shipping_cost, 2) }}</strong></td>
                    </tr>
                    {{-- <tr>
                        <td colspan="5"><strong>INSURANCE</strong></td>
                        <td><strong>{{ number_format($quotation->insurance, 2) }}</strong></td>
                    </tr> --}}
                    <tr>
                        <td colspan="5"><strong>GRAND TOTAL</strong></td>
                        <td><strong>@if($symbol){{ $symbol->symbol }}@endif {{ number_format($quotation->grand_total, 2) }}</strong></td>
                    </tr>
                </tbody>
            </table>
        </section>

        <table class="table" style="margin-top:5px;">
            <tr>
                <td>THEREFORE, the Parties agree as follows:</td>
            </tr>
            <tr>
                <td>
                    <strong>1.</strong> Customs duty, taxes, charges for customs clearance, storage/demurrage, inland transportation & any other transportation charges, any other Government levies/ octroi/entry tax etc. are extra and are payable by the Purchaser directly to the concerned authorities/agencies in USD. The buyer will pay all insurance, consultation and installation charges of purchased goods.
                </td>
            </tr>
            <tr>
                <td>
                    <strong>2. DELIVERY :</strong> The goods will be dispatched by consolidated sea freight/air freight from any INDIAN sea/airport through the freight forwarder, as per the rules framed therein however this period may be extended if natural encumbrances arises , Under no circumstances will we accept a penalty clause. If any encumbrances arise during shipping or during aircraft passaging of goods, then buyer will contact with us and your queries may be solved promptly if appropriate. Once goods/items dispatched for delivery then buyer will be binding to receive the same. If the Consignee is a third party then a Tri Party Agreement shall be executed between the Seller, Sales Contract Page 3 of 5 Buyer and the Third Party Consignee. Then only the Seller shall draw the invoice in favor of the Third Party Consignee.
                </td>
            </tr>
            <tr>
                <td>
                    <strong>3. PAYMENT :</strong> Payment is to be made by a foreign demand draft in advance fund transfer (TT). The liability to pay all banking charges concerning inside and outside India will be of the Purchaser.
                </td>
            </tr>
            <tr>
                <td>
                    <strong>4.</strong> Seller reserves the right, at its sole discretion, to refuse order cancellation request for any reason whatsoever. In case of seller's approval of an cancellation request all such cancellation shall be without any liability to Seller & at the cost and liability of buyer only.
                </td>
            </tr>
            <tr>
                <td>
                    <strong>5. ERRORS :</strong> Seller reserves the right to correct clerical or stenographic errors or omissions. Errors in giving purchase orders by purchaser, there will be no responsibility of the seller.
                </td>
            </tr>
            <tr>
                <td>
                    <strong>6.</strong> Shipping cost will be valid for 10 days & product cost will be valid for 30 days.
                </td>
            </tr>
            <tr>
                <td>
                    <strong>7. Intellectual property :</strong> Trademark, copyright or any other type of intellectual property rights are property of their respective owner. Inorbvict Healthcare India Pvt Ltd is a trading, reselling company doing refurbished or remodeling works. Trademarks, service marks and/or logos [called “marks”] herein associated with the products listed on this” proforma invoice” are the property of their respective owners and if they appear with the listed products, it is only used for the purpose of identification of those products. we do not claim association with the mark owners, unless otherwise so specified. meaning of list number: - “r” means refurbished, “po” means preowned, “u” means used, “t” means trading, “m” means own manufactured, “ad” means authorized dealer of original equipment manufacturers.
                </td>
            </tr>
            <tr>
                <td>
                    <strong>8. RESPONSIBILITY :</strong> Seller is not responsible for any loss, damage, or delay that may occur after goods have been accepted for shipment by the carrier. The Inorbvict is not a manufacturer and hence all liabilities regarding manufacturing defects would be goes on manufacturer.
                </td>
            </tr>
            <tr>
                <td>
                    <strong>9. Force Majeure :</strong> Company is not responsible for any loss, damage , or delay that may occur after goods have been accepted for shipment by carrier. The Company shall not be liable for any loos or damage due to delay in manufacturer or delivery resulting from any conditions beyond the Company's reasonable Control, including but not limited to compliance with any regulations, order or instructions of any Central or Sate Government or any departments or agency thereof, acts of God, acts of Omissions of the Purchaser, fire Strike, factory shut down Sales Contract Page 4 of 5 or alternations, embargoes war, riots, delay in transport, labor trouble and any delay resulting such cause , shall extend delivery date Correspondingly. This delay also includes on account of procurement of bought - out items. Once material sold will not liable to return or replace.
                </td>
            </tr>
            <tr>
                <td>
                    <strong>10.</strong>Notwithstanding that, if the Indian(including state governments or authorities) or Foreign Government (including authorities or states) banned or restricted or prohibited to export the invoice purchased products or goods then above all T&C of invoice and purchased agreement will be not applied till the expiration period of said banned, restrictions, prohibition or release of same, from above said goods or products. (Note :- The buyer will be having sole responsibilities to check above said restrictions, banned or prohibited status of commodities or goods. Seller will not responsible for same.) Also Notwithstanding that if the seller is unable to supplied the purchased commodities to buyer as per agreement due to the act of god or due to the above said banned, restrictions or prohibitions to export the listed products, in that case buyer will have no right to claim return of advanced payment or any damages from the seller & the purchased commodities as per purchase agreement will be sent to buyer after said expiration of banned, restrictions or prohibitions or release of same.
                </td>
            </tr>
            <tr>
                <td>
                    <strong>11. Indemnity:</strong> Buyer shall defend, indemnify, keep indemnified and hold harmless Seller, its affiliates, successors or assigns and its respective directors, officers, shareholders, and employees etc. against any and all loss, injury, death, damage, liability, claim, action, subrogation, judgment, interest, penalty, fines, cost or expense, including reasonable attorney and professional fees and costs, and the cost of enforcing any right to indemnification hereunder (collectively, "Losses") in the event that possession of the Products or performance of the Services infringes or misappropriates a patent, copyright, trade secret or other intellectual property right of any third party. Buyer give indemnity to seller to any type of IPR infringement and seller will not be liable for the same & buyer will be sole responsible for legal matter, monitory consequences & legal fees. The buyer further agrees to indemnify and keep indemnified the Seller against all claims, damages, expenses including but not limited to "Losses" that the Seller may incur as a result of damage or loss to the material/equipment loaned to the buyer for job work/repairs under by way of spoilage, mishandling, improper use, pilferage, wrong processing, transit loss, theft, negligence or unauthorised use and against losses arising due to noncompliance with the cycle time and/or improper and limiting conditions of the materials used by the buyer or non-supply or proper return to the Seller in the same equipment Sales Contract Page 5 of 5 weight and the agreed scrap quantity norms fixed for the material/equipment. <br>All right reserved by seller, seller can cancel an order without any notice & Buyer liable to indemnify the seller for all the "Losses" mentioned above but not limiting to that only.
                </td>
            </tr>
            <tr>
                <td>
                    <strong>12. E&OE:</strong> Subject to Pune, Maharashtra, India Jurisdiction.
                </td>
            </tr>
        </table>
        <br>
        <table class="table">
            <tr>
                <td width="50%">
                    Sd/-<br><br><br><br><br>
                    <img src="data:image/png;base64,{{ base64_encode(file_get_contents(public_path('assets/image.jpg'))) }}" style="max-width: 100%;height: 100px;" alt="Signature"><br>
                    Seller, <strong>Inorbvict Healthcare India Pvt. Ltd</strong><br><br>
                </td>
                <td width="50%">
                    Sd/-<br><br><br><br><br><br><br><br><br>
                    Buyer, <strong>{{ $buyerDetails->name }}</strong><br><br>
                </td>
            </tr>
        </table>
    <script type="text/php">
        if (isset($pdf)) {
            $font = $fontMetrics->get_font("helvetica", "bold");
            $footer_size = 10;
            $x = 525;
            $y = 810;
            $text = "{PAGE_NUM} of {PAGE_COUNT}";
            $size = 7;
            $color = array(0,0,0);
            $word_space = 0.0;
            $char_space = 0.0;
            $angle = 0.0;
            $pdf->page_text($x, $y, $text, $font, $size, $color, $word_space, $char_space, $angle);
        }
    </script>
</body>
</html>
