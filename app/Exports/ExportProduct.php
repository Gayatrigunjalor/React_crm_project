<?php

namespace App\Exports;

// use App\Models\Product;
// use App\Models\ProductVendor;
// use App\Models\ProductAttachment;
// use Illuminate\Contracts\View\View;
// use Maatwebsite\Excel\Concerns\FromView;
// use Maatwebsite\Excel\Events\AfterSheet;
// use PhpOffice\PhpSpreadsheet\Style\Fill;
// use Maatwebsite\Excel\Concerns\WithEvents;

// class ExportProduct implements FromView, WithEvents
// {
//     public function view(): View
//     {
//         $rows = Product::with(['productType'])->orderBy('id', 'DESC')->get();
//         $i = 0;
//         foreach ($rows as $row) {
//             $rows[$i]['productVendors'] = ProductVendor::with(['vendor_name'])->where('product_id', $row->product_code)->get();
//             $rows[$i]['vendorCount'] = ProductVendor::where('product_id', '=', $row->product_code)->count();
//             $rows[$i]['attachmentCount'] = ProductAttachment::where('product_id', '=', $row->id)->count();
//             $i++;
//         }
//         return view('admin.product.list-rows-export', compact('rows'));
//     }

//     /**
//      * Write code on Method
//      *
//      * @return response()
//      */
//     public function registerEvents(): array
//     {
//         return [
//             AfterSheet::class    => function (AfterSheet $event) {
//                 $event->sheet->getDelegate()->getColumnDimension('A')->setAutoSize(true);
//                 $event->sheet->getDelegate()->getColumnDimension('B')->setAutoSize(true);
//                 $event->sheet->getDelegate()->getColumnDimension('C')->setAutoSize(true);
//                 $event->sheet->getDelegate()->getColumnDimension('D')->setAutoSize(true);
//                 $event->sheet->getDelegate()->getColumnDimension('E')->setAutoSize(true);
//                 $event->sheet->getDelegate()->getColumnDimension('F')->setAutoSize(true);
//                 $event->sheet->getDelegate()->getColumnDimension('G')->setAutoSize(true);
//                 $event->sheet->getDelegate()->getColumnDimension('H')->setAutoSize(true);
//                 $event->sheet->getDelegate()->getColumnDimension('I')->setAutoSize(true);
//                 $event->sheet->getDelegate()->getColumnDimension('J')->setAutoSize(true);
//                 $event->sheet->getDelegate()->getColumnDimension('K')->setAutoSize(true);

//                 $event->sheet->getDelegate()->getStyle('A1:K1')
//                     ->getFill()
//                     ->setFillType(Fill::FILL_SOLID)
//                     ->getStartColor()
//                     ->setARGB('DD4B39');
//             },
//         ];
//     }
// }
