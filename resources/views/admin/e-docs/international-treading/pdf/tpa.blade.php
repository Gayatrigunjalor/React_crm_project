<!doctype html>
<html lang="en">
<head>
    <!-- Required meta tags -->
    <meta http-equiv="Content-Type" content="text/html; charset=utf-8"/>
    <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no">
    <title>TRI-PARTY AGREEMENT</title>
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
                    <strong>TRI-PARTY AGREEMENT</strong><br>
                    <strong>THIS AGREEMENT IS MADE AND EXECUTED AT THIS {{ date("jS \of F Y", strtotime($invoice->po_date)) }} AT PUNE,</strong><br>
                    <strong>BETWEEN</strong>
                </td>
            </tr>
            <tr>
                <td>
                    <strong>{{ $buyerDetails->name }}</strong>, {{ $buyerDetails->address }}, Email: {{ $buyerDetails->email }}, {{ $buyerDetails->contact_no }}, here in after referred to as the “<strong>Buyer</strong>”; (Which expression shall unless repugnant to the context, mean and include his heirs, executors, administrators and assigns) Party of the First Part.
                </td>
            </tr>
            <tr>
                <td style="text-align:center;">
                    AND
                </td>
            </tr>
            <tr>
                <td>
                    <strong>{{ $consigneeDetails->name }}</strong>, {{ $consigneeDetails->address }}, Email: {{ $consigneeDetails->email }}, {{ $consigneeDetails->mobile }},    here in after    referred    to    as    the “<strong>Consignee</strong>”; (Which expression shall unless repugnant to the context, mean and include his heirs, executors, administrators and assigns) Party of the Second Part.
                </td>
            </tr>
            <tr>
                <td style="text-align:center;">
                    AND
                </td>
            </tr>
            <tr>
                <td>
                    <strong>Inorbvict Healthcare India Pvt. Ltd. (Republic of India)</strong> having registered address at Office No 311, Xion Mall, Hinjewadi,  Pune-411057,  Maharashtra,  India,  represented  by  Director  Mr.  Rajesh  Ramcharan  Meshram, hereinafter referred to as the “<strong>Seller</strong>”; (Which expression shall unless repugnant to the context, mean and include his heirs, executors, administrators and assigns) Party of the Third Part.<br>
                    Each party shall hereinafter be individually referred to as the “<strong>Party</strong>” and collectively as the “<strong>Parties</strong>”.<br>
                    <strong>WHEREAS</strong>, Seller owns certain Goods, as defined below, and Seller desires to sell such Goods under the terms and conditions set forth in this Agreement.<br>
                    <strong>AND WHEREAS</strong>, Buyer desires to purchase the Goods offered for sale by Seller under the terms and conditions set forth in this Agreement.<br>
                    <strong>AND WHEREAS</strong>, Buyer desires to get the abovementioned goods delivered on Consignee’s delivery address
                    and this desire is free from any undue influence by any party.<br>
                    <strong>AND WHEREAS</strong>, Buyer understands that Seller is not responsible for Delivery of the Goods at Consignee’s
                    address.<br>
                    <strong>AND WHEREAS</strong>, Unless otherwise stated Buyer shall be responsible for all taxes in connection with the purchase of Goods in this Agreement.<br>
                    <strong>NOW THEREFORE</strong>, In consideration of the mutual promises and for other good and valuable consideration exchanged by the Parties as set forth in this Agreement, the Parties, intending to be legally bound, hereby mutually agrees as follows;<br>
                    <strong>Sale of Goods:</strong> That, Seller agrees to sell, transport and deliver to Buyer, and Buyer agrees to purchase the following items at <strong>{{ $symbol->symbol }} {{ number_format($invoice->grand_total, 2) }}</strong> the Price mentioned under Proforma Invoice No. <strong>{{ $invoice->po_number }}</strong> on dated <strong>{{ date("d/m/Y", strtotime($invoice->po_date)) }}</strong> (hereinafter referred to as the “Said Goods”). Incoterm is mutually agreed as per proforma invoice.<br>
                    <strong>Consideration Terms:</strong> That, the 100 % payment will be made in advance for the goods i.e<br>
                </td>
            </tr>
        </table>
        <section class="product-area" style="margin-top:15px;">
            <table class="table" style="font-size:11px;width:100%;">
                <thead>
                    <tr>
                        <th style="text-align:left;">Sr No</th>
                        <th style="text-align:left;">Product Name</th>
                        <th style="text-align:left;">HSN Code</th>
                        <th style="text-align:left;">Qty</th>
                        <th style="text-align:left;">Rate</th>
                        <th style="text-align:left;">Amount</th>
                    </tr>
                </thead>
                <tbody>
                    @foreach ($invoiceProducts as $invoiceProduct)
                    <tr>
                        <td style="font-size:11px;">{{ $loop->iteration }}</td>
                        <td style="font-size:11px;">
                            {{ $invoiceProduct->product_name }}
                        </td>
                        <td style="font-size:11px;">{{ $invoiceProduct->hsn }}</td>
                        <td style="font-size:11px;">{{ $invoiceProduct->quantity }}</td>
                        <td style="font-size:11px;">{{ number_format($invoiceProduct->rate, 2) }}</td>
                        <td style="font-size:11px;">{{ number_format($invoiceProduct->amount, 2) }}</td>
                    </tr>
                    @endforeach
                    <tr>
                        <td style="font-size:11px;" colspan="5"><strong>TOTAL PRODUCT COST / EXW VALUE</strong></td>
                        <td style="font-size:11px;"><strong>{{ number_format($invoice->exw_value, 2) }}</strong></td>
                    </tr>
                    <tr>
                        <td style="font-size:11px;" colspan="5"><strong>FREIGHT</strong></td>
                        <td style="font-size:11px;"><strong>{{ number_format($invoice->freight_weight, 2) }}</strong></td>
                    </tr>
                    <tr>
                        <td style="font-size:11px;" colspan="5"><strong>INSURANCE</strong></td>
                        <td style="font-size:11px;"><strong>{{ number_format($invoice->insurance, 2) }}</strong></td>
                    </tr>
                    <tr>
                        <td style="font-size:11px;" colspan="5"><strong>GRAND TOTAL</strong></td>
                        <td style="font-size:11px;"><strong>{{ $symbol->symbol }} {{ number_format($invoice->grand_total, 2) }}</strong></td>
                    </tr>
                </tbody>
            </table>
        </section>

        <table class="table" style="margin-top:5px;">
            <tr>
                <td>
                    <strong>That, Bank details are as follows:</strong> <br>
                    Bank Name : {{ $bankDetails->bank_name }}<br>
                    Account Holder Name : {{ $bankDetails->account_holder_name }}<br>
                    Address : {{ $bankDetails->address }}<br>
                    Branch : {{ $bankDetails->branch }}<br>
                    Branch Code : {{ $bankDetails->branch_code }}<br>
                    Ad Code : {{ $bankDetails->ad_code }}<br>
                    Account No : {{ $bankDetails->account_no }}<br>
                    IFSC : {{ $bankDetails->ifsc }}<br>
                    Swift Code : {{ $bankDetails->swift_code }}
                </td>
            </tr>
            <tr>
                <td>
                    <strong>General Provisions:</strong>
                </td>
            </tr>
            <tr>
                <td>
                    <strong>Amendments:</strong> That, No amendment to this Agreement will be effective unless it is in writing and signed by all the Parties.
                </td>
            </tr>
            <tr>
                <td>
                    <strong>Warranties:</strong> That, Each Party warrants to the other that (a) it has full authority to enter into this Agreement; and (b) in performing its obligations under this Agreement, it will comply with all applicable laws and regulations.
                </td>
            </tr>
            <tr>
                <td>
                    <strong>Risk of Loss:</strong> That, Title to and risk of loss of the Goods shall pass to Buyer [upon shipment of the Goods in accordance with this Agreement.
                </td>
            </tr>
            <tr>
                <td>
                    <strong>Force Majeure:</strong> That, Seller shall not be responsible for any claims or damages resulting from any delays in performance or for non-performance due to unforeseen  circumstances  or  causes  beyond  Seller’s reasonable control.
                </td>
            </tr>
            <tr>
                <td>
                    <strong>Limitation of Liability:</strong> That, Seller will not be liable for any indirect, special, consequential, or punitive damages (including lost profits) arising out of or relating to this Agreement or the transactions it contemplates (whether for breach of contract, tort, negligence, or other form of action) and irrespective of whether Seller has been advised of the possibility of any such damage. In no event will Seller’s liability exceed the price paid by Buyer to Seller for the Goods giving rise to the claim or cause of action.
                </td>
            </tr>
            <tr>
                <td>
                    <strong>Announcements:</strong> That, No announcement or notification will be made in relation to this Agreement or the Marketing Activities unless: (a) it is in a form agreed in writing between the Parties; or (b) it is required to be made by law or by any securities exchange or regulatory or governmental body to which a Party is subject, in which case that Party will use reasonable endeavors to consult with the other Party as to the form, content and timing of the announcement.
                </td>
            </tr>
            <tr>
                <td>
                    <strong>Survival:</strong> That, Any provision of this Agreement which contemplates performance or observance after the termination or expiry of this Agreement (including, without limitation, confidentiality and limitation of liability provisions) will survive such termination or expiry and continue in full force and effect.
                </td>
            </tr>
            <tr>
                <td>
                    <strong>Validity:</strong> This agreement is valid for 1 Year.
                </td>
            </tr>
            <tr>
                <td>
                    <strong>Waiver:</strong> That, No Party shall be deemed to have waived any provision of this Agreement or the exercise of any rights held under this Agreement unless such waiver is made expressly and in writing. Waiver by any Party will be deemed of a breach or violation of any provision of this Agreement and shall not constitute a waiver of any other subsequent breach or violation.
                </td>
            </tr>
            <tr>
                <td>
                    <strong>Indemnity:</strong> buyer shall defend, indemnify, keep indemnified and hold harmless Seller, its affiliates, successors or assigns and its respective directors, officers, shareholders, and employees etc. against any and all loss, injury, death, damage, liability, claim, action, subrogation, judgment, interest, penalty, fines, cost or expense, including reasonable attorney and professional fees and costs, and the cost of enforcing any right to indemnification hereunder (collectively, "Losses") in the event that possession of the Products or performance of the Services infringes or misappropriates a patent, copyright, trade secret or other intellectual property right of any third party. Buyer give indemnity to seller to any type of IPR infringement and seller will not be liable for the same & buyer will be sole responsible for legal matter, monitory consequences & legal fees.<br>
                    The buyer further agrees to indemnify and keep indemnified the Seller against all claims, damages, expenses including but not limited to Losses that the Seller may incur as a result of damage or  loss to the material/equipment loaned to the buyer for job work/repairs under by way of spoilage, mishandling, improper use, pilferage, wrong processing, transit loss, theft, negligence or unauthorised use and against Losses arising due to non-compliance with the cycle time and/or improper and limiting conditions of the materials used by the buyer or non-supply or proper return to the Seller in the same equipment weight and the agreed scrap quantity norms fixed for the material/equipment.<br>
	                All right reserved by seller, seller can cancel an order without any notice & Buyer liable to refund full amount within week else 24% interest per week will be applicable.
                </td>
            </tr>
            <tr>
                <td>
                    <strong>Assignment:</strong> That, Neither Party may assign or otherwise transfer this Agreement or any of its rights and obligations under this Agreement to any third party without the written consent of the other Party.
                </td>
            </tr>
            <tr>
                <td>
                    <strong>Entire Agreement:</strong> That, This Agreement constitutes the entire agreement between the Parties in relation to the subject matter of this Agreement.
                </td>
            </tr>
            <tr>
                <td>
                    <strong>Third Party Rights:</strong> That, This Agreement is made for the sole benefit and protection of the Parties, and no other person will benefit from or have any right of action under this Agreement.
                </td>
            </tr>
            <tr>
                <td>
                    <strong>No Exclusivity:</strong> That, All Parties understand and agree that this Agreement in no way restricts either Party from entering into other marketing arrangements or agreements with any third party (other than named in this agreement).
                </td>
            </tr>
            <tr>
                <td>
                    <strong>Miscellaneous:</strong> That, This Agreement shall be binding upon and inure to the benefit of the Parties and their respective heirs, successors and assigns. The provisions of this Agreement are severable. If any provision is held to be invalid or unenforceable, it shall not affect the validity or enforceability of any other provision. The section headings herein are for reference purposes only and shall not otherwise affect the meaning, construction or interpretation of any provision of this Agreement. This Agreement may be executed in one or more counterparts, each of which shall be deemed an original and  all of which  together,  shall constitute one and the same Agreement.
                </td>
            </tr>
            <tr>
                <td>
                    <strong>Governing Law and Arbitration:</strong> That, This Agreement shall be governed by the laws of India. The Courts in Pune shall have exclusive jurisdiction over the subject matter of this Agreement. In the event of any dispute or differences arising out of or in connection with this agreement, the parties hereto, agree to resolve their dispute by a sole arbitrator chosen by the seller in fast track procedure under the provisions of Arbitration and Conciliation Act of 1996.
                </td>
            </tr>
            <tr>
                <td>
                    &nbsp;&nbsp;&nbsp;&nbsp;(a)	That, the arbitration proceedings shall be conducted in English. The place of Arbitration shall be Pune. The award passed in the arbitration proceedings shall be final and binding on both the parties.
                </td>
            </tr>
            <tr>
                <td>
                    &nbsp;&nbsp;&nbsp;&nbsp;(b) That, the cost of arbitration proceedings shall be borne by the Judgment Debtor.
                </td>
            </tr>
            <tr>
                <td>
                    &nbsp;&nbsp;&nbsp;&nbsp;(c)	That,  Each  party  shall  individually  bear  the  fees  of  their  respective  Advocate/Counsel  for  the proceedings.
                </td>
            </tr>
            <tr>
                <td>
                    <strong>IN WITNESS WHEREOF</strong>, The Parties have entered into this Agreement and executed on the date stated at the beginning of it.<br><br>
                </td>
            </tr>
            <tr>
                <td>
                    Sd/-<br><br><br>
                    Buyer, <strong>LLC ARIKA TRADING EURASIA</strong><br><br>
                </td>
            </tr>
            <tr>
                <td>
                    Sd/-<br><br><br>
                    Consignee, <strong>POLARSTAR LOGISTICS LLC</strong><br><br>
                </td>
            </tr>
            <tr>
                <td>
                    Sd/-<br><br><br>
                    <img src="data:image/png;base64,{{ base64_encode(file_get_contents(public_path('assets/image.jpg'))) }}" style="max-width: 100%;height: 100px;" alt="Signature"><br>
                    Seller, <strong>Inorbvict Healthcare India Pvt. Ltd</strong><br><br>
                </td>
            </tr>
        </table>
</body>
</html>
