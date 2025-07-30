@include('admin.common.document-head')
<table class="full-w">
    <tbody>
        <tr>
            <td class="w-40 logo">
                <img src="data:image/png;base64,{{ base64_encode(file_get_contents(public_path('assets/logo.jpg'))) }}" alt="Logo" class="img-fluid">
            </td>
            <td class="w-20"></td>
            <td class="w-40" rowspan="2" style="font-size:11px;vertical-align: top;">
                <strong>{{ ucwords(strtolower($companyDetails->name)) }}</strong><br>
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
                <strong>AEO Code : </strong>{{ $companyDetails->aeo_code }}<br>
                <strong>ISO No : </strong>{{ $companyDetails->iso }}<br>
                <strong>GST State Code : </strong>27<br>
            </td>
        </tr>
        <tr>
            <td class="w-40" style="vertical-align: bottom;">
                @if (Str::wordCount($pdf_title) > 3)
                    <strong><h4 style="margin:0px">{{ strtoupper($pdf_title) }}</h4></strong>
                @else
                    <strong><h2 style="margin:0px">{{ strtoupper($pdf_title) }}</h2></strong>
                @endif
            </td>
            <td class="w-20"> </td>
        </tr>
    </tbody>
</table>
