import { faCaretLeft, faCirclePlus, faDownload, faPlus } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import Button from '../../components/base/Button';
import React, { useEffect, useState, ChangeEvent } from 'react';
import { Card, Col, Row, Nav, Tab } from 'react-bootstrap';
import axiosInstance from '../../axios';
import useAdvanceTable from '../../hooks/useAdvanceTable';
import AdvanceTableProvider from '../../providers/AdvanceTableProvider';
import SearchBox from '../../components/common/SearchBox';
import { useAuth } from '../../AuthContext';
import { ColumnDef } from '@tanstack/react-table';
import AdvanceTable from '../../components/base/AdvanceTable';
import AdvanceTableFooter from '../../components/base/AdvanceTableFooter';
import swal from 'sweetalert';
import { useNavigate, useParams } from 'react-router-dom';
import { downloadFile } from '../../helpers/utils';

interface FfdPaymentData {
    id: number;
    vendor?: { name: string }
    purchase_invoice_no: string;
    purchase_invoice_date: string;
    business_task_id: string;
    base_amount: string;
    gst_percent: string;
    gst_amount: string;
    tds_deduction: string;
    tds_amount: string;
    net_payable: string;
    paid_amount: string;
    bank_name: string;
    utr_number: string;
    utr_date: string;
    attachments: [{ id: number; name: string; }]
}

interface FfdPurchaseOrderData {
    id: number;
    business_task_id?: number;
    purchase_order?: { purchase_order_number: string }
    vendor?: { name: string }
    purchase_invoice_no: string;
    purchase_invoice_date: string;
    base_amount: string;
    gst_percent: string;
    gst_amount: string;
    tds_deduction: string;
    tds_amount: string;
    net_payable: string;
    paid_amount: string;
    bank_name: string;
    utr_number: string;
    utr_date: string;
    attachments: [{ id: number; name: string; }]
}

const VendorPayment = () => {
    const [purchaseTableData, setPoTableData] = useState<FfdPurchaseOrderData[]>([]);
    const [vendorTableData, setVendorTableData] = useState<FfdPaymentData[]>([]);
    const [error, setError] = useState<string | null>(null);

    const navigate = useNavigate();

    const handleShow = (contactId?: number) => {
        // setSelectedContactId(contactId);
    };

    const handleFfdList = () => {
        navigate(`/master/ffds`)
    };

    const po_table = useAdvanceTable({
        data: purchaseTableData,
        columns: purchaseOrderDataTableColumns(handleShow),
        pageSize: 10,
        pagination: true,
        sortable: true,
        selection: false,
        initialState: {
            columnVisibility: { }
        }
    });

    const vendor_table = useAdvanceTable({
        data: vendorTableData,
        columns: vendorTableColumns(handleShow),
        pageSize: 10,
        pagination: true,
        sortable: true,
        selection: false,
        initialState: {
            columnVisibility: { }
        }
    });

    const handlePOSearchInputChange = (e: ChangeEvent<HTMLInputElement>) => {
        po_table.setGlobalFilter(e.target.value || undefined);
    };

    const handleSearchInputChange = (e: ChangeEvent<HTMLInputElement>) => {
        vendor_table.setGlobalFilter(e.target.value || undefined);
    };

    useEffect(() => {
        const fetchFfdData = async () => {
            try {
                const response = await axiosInstance.get(`/getVendorPayment`);
                if (response.status !== 200) {
                    throw new Error('Failed to fetch data');
                }
                const data = await response.data;
                const ffd_po_data: FfdPurchaseOrderData[] = data.purchase_orders; //po table data
                const vendor_po_data: FfdPaymentData[] = data.vendor_purchases; //winner table data
                setPoTableData(ffd_po_data);
                setVendorTableData(vendor_po_data);
            } catch (err: any) {
                setError(err.data.message);
            } finally {
            }
        };
        fetchFfdData();
    }, []);

    if (error) return <div>Error: {error}</div>;

    return (
        <>
            <h2 className="mt-2 mb-5">Purchase Orders</h2>
            <Card className="mb-4">
                <Card.Body>
                    <AdvanceTableProvider {...po_table}>
                        <Row className="g-3 justify-content-between my-2">
                            <Col xs="auto">
                                <div className="d-flex">
                                    <SearchBox
                                        placeholder="Search po"
                                        className="me-2"
                                        onChange={handlePOSearchInputChange}
                                    />
                                </div>
                            </Col>
                        </Row>
                        <DataTable />
                    </AdvanceTableProvider>

                </Card.Body>
            </Card>

            <Card>
                <Card.Body>
                    <Row>
                        <Col><h4 className='px-4 my-2'>Vendor Purchases without PO</h4></Col>
                    </Row>
                    <AdvanceTableProvider {...vendor_table}>
                        <Row className="g-3 justify-content-between my-2">
                            <Col xs="auto">
                                <div className="d-flex">
                                    <SearchBox
                                        placeholder="Search vendor"
                                        className="me-2"
                                        onChange={handleSearchInputChange}
                                    />
                                </div>
                            </Col>
                        </Row>
                        <DataTable />
                    </AdvanceTableProvider>
                </Card.Body>
            </Card>

        </>
    );
};

export default VendorPayment;

const handleDownload = async (url: string) => {
    try {
        // Fetch the file from the server using the upload ID
        const response = await axiosInstance.get(`${url}`, {
            method: 'GET',
            responseType: 'blob',
        });
        if (response.status !== 200) {
            throw new Error('Failed to download the file');
        }
        // Create a Blob from the response data
        const blob = response.data;
        // Retrieve the filename from the response headers or construct it
        const contentDisposition = response.headers['content-disposition'];
        const filename = contentDisposition ? contentDisposition.split('filename=')[1]?.replace(/"/g, '') || 'downloaded-file' : 'downloaded-file';
        //call download file function from utils
        downloadFile(blob, filename); //pass blob data and filename
    } catch (error: any) {
        if (error.status === 404) {
            swal("Error!", 'File not found', "error");
        }
        console.error('Error downloading the file:', error);
    }
};

//PO table columns
const purchaseOrderDataTableColumns = (handleShow: (contactId?: number) => void): ColumnDef<FfdPurchaseOrderData>[] => [
    {
        accessorKey: 'purchase_order_number',
        header: () => {
            return (
                <div className="d-inline-flex flex-center">
                    <span>Po No</span>
                </div>
            );
        },
        cell: ({ row: { original } }) => {
            const { purchase_order } = original;
            return (
                <span>{purchase_order != null && (purchase_order.purchase_order_number)}</span>
            );
        },
        meta: {
            headerProps: {
                className: 'ps-2 pe-2 border-start border-end border-translucent'
            },
            cellProps: {
                className:
                'white-space-nowrap fw-semibold ps-2 border-start border-end border-translucent'
            }
        }
    },
    {
        accessorKey: 'purchase_invoice_no',
        header: () => {
            return (
                <div className="d-inline-flex flex-center">
                    <span>Purchase Invoice No</span>
                </div>
            );
        },
        cell: ({ row: { original } }) => {
            const { purchase_invoice_no } = original;
            return (
                <span>{purchase_invoice_no != null ? purchase_invoice_no : ''}</span>
            );
        },
        meta: {
            headerProps: {
                className: 'ps-2 pe-2 border-end border-translucent'
            },
            cellProps: {
                className:
                'white-space-nowrap fw-semibold ps-2 border-end border-translucent'
            }
        }
    },
    {
        accessorKey: 'purchase_invoice_date',
        header: () => {
            return (
                <div className="d-inline-flex flex-center">
                    <span>Purch. Inv. Date</span>
                </div>
            );
        },
        cell: ({ row: { original } }) => {
            const { purchase_invoice_date } = original;
            return (
                <span>{purchase_invoice_date ? purchase_invoice_date : '' }</span>
            );
        },
        meta: {
            headerProps: {
                className: 'ps-2 pe-2 border-end border-translucent'
            },
            cellProps: {
                className:
                'white-space-nowrap fw-semibold ps-2 border-end border-translucent'
            }
        }
    },
    {
        accessorKey: 'vendor',
        header: () => {
            return (
                <div className="d-inline-flex flex-center">
                    <span>Vendor Name</span>
                </div>
            );
        },
        cell: ({ row: { original } }) => {
            const { vendor } = original;
            return (
                <span>{vendor ? vendor.name : '' }</span>
            );
        },
        meta: {
            headerProps: {
                className: 'ps-2 pe-2 border-end border-translucent'
            },
            cellProps: {
                className:
                'white-space-nowrap fw-semibold ps-2 border-end border-translucent'
            }
        }
    },
    {
        accessorKey: 'business_task_id',
        header: () => {
            return (
                <div className="d-inline-flex flex-center">
                    <span>BT ID</span>
                </div>
            );
        },
        cell: ({ row: { original } }) => {
            const { business_task_id } = original;
            return (
                <span>{business_task_id ? business_task_id : '' }</span>
            );
        },
        meta: {
            headerProps: {
                className: 'ps-2 pe-2 border-end border-translucent'
            },
            cellProps: {
                className:
                'white-space-nowrap fw-semibold ps-2 border-end border-translucent'
            }
        }
    },
    {
        accessorKey: 'base_amount',
        header: () => {
            return (
                <div className="d-inline-flex flex-center">
                    <span>Base Amount</span>
                </div>
            );
        },
        cell: ({ row: { original } }) => {
            const { base_amount } = original;
            return (
                <span>{base_amount ? base_amount : '' }</span>
            );
        },
        meta: {
            headerProps: {
                className: 'ps-2 pe-2 border-end border-translucent'
            },
            cellProps: {
                className:
                'white-space-nowrap fw-semibold ps-2 border-end border-translucent'
            }
        }
    },
    {
        accessorKey: 'gst_percent',
        header: () => {
            return (
                <div className="d-inline-flex flex-center">
                    <span>GST </span>
                </div>
            );
        },
        cell: ({ row: { original } }) => {
            const { gst_percent } = original;
            return (
                <span>{gst_percent ? gst_percent : '' }</span>
            );
        },
        meta: {
            headerProps: {
                className: 'ps-2 pe-2 border-end border-translucent'
            },
            cellProps: {
                className:
                'white-space-nowrap fw-semibold ps-2 border-end border-translucent'
            }
        }
    },
    {
        accessorKey: 'gst_amount',
        header: () => {
            return (
                <div className="d-inline-flex flex-center">
                    <span>GST Amount</span>
                </div>
            );
        },
        cell: ({ row: { original } }) => {
            const { gst_amount } = original;
            return (
                <span>{gst_amount ? gst_amount : '' }</span>
            );
        },
        meta: {
            headerProps: {
                className: 'ps-2 pe-2 border-end border-translucent'
            },
            cellProps: {
                className:
                'white-space-nowrap fw-semibold ps-2 border-end border-translucent'
            }
        }
    },
    {
        accessorKey: 'tds_deduction',
        header: () => {
            return (
                <div className="d-inline-flex flex-center">
                    <span>TDS </span>
                </div>
            );
        },
        cell: ({ row: { original } }) => {
            const { tds_deduction } = original;
            return (
                <span>{tds_deduction ? tds_deduction : '' }</span>
            );
        },
        meta: {
            headerProps: {
                className: 'ps-2 pe-2 border-end border-translucent'
            },
            cellProps: {
                className:
                'white-space-nowrap fw-semibold ps-2 border-end border-translucent'
            }
        }
    },
    {
        accessorKey: 'tds_amount',
        header: () => {
            return (
                <div className="d-inline-flex flex-center">
                    <span>TDS Amount</span>
                </div>
            );
        },
        cell: ({ row: { original } }) => {
            const { tds_amount } = original;
            return (
                <span>{tds_amount ? tds_amount : '' }</span>
            );
        },
        meta: {
            headerProps: {
                className: 'ps-2 pe-2 border-end border-translucent'
            },
            cellProps: {
                className:
                'white-space-nowrap fw-semibold ps-2 border-end border-translucent'
            }
        }
    },
    {
        accessorKey: 'net_payable',
        header: () => {
            return (
                <div className="d-inline-flex flex-center">
                    <span>Net Payable</span>
                </div>
            );
        },
        cell: ({ row: { original } }) => {
            const { net_payable } = original;
            return (
                <span>{net_payable ? net_payable : '' }</span>
            );
        },
        meta: {
            headerProps: {
                className: 'ps-2 pe-2 border-end border-translucent'
            },
            cellProps: {
                className:
                'white-space-nowrap fw-semibold ps-2 border-end border-translucent'
            }
        }
    },
    {
        accessorKey: 'paid_amount',
        header: () => {
            return (
                <div className="d-inline-flex flex-center">
                    <span>Paid Amount</span>
                </div>
            );
        },
        cell: ({ row: { original } }) => {
            const { paid_amount } = original;
            return (
                <span>{paid_amount ? paid_amount : '' }</span>
            );
        },
        meta: {
            headerProps: {
                className: 'ps-2 pe-2 border-end border-translucent'
            },
            cellProps: {
                className:
                'white-space-nowrap fw-semibold ps-2 border-end border-translucent'
            }
        }
    },
    {
        accessorKey: 'bank_name',
        header: () => {
            return (
                <div className="d-inline-flex flex-center">
                    <span>Bank Name</span>
                </div>
            );
        },
        cell: ({ row: { original } }) => {
            const { bank_name } = original;
            return (
                <span>{bank_name ? bank_name : '' }</span>
            );
        },
        meta: {
            headerProps: {
                className: 'ps-2 pe-2 border-end border-translucent'
            },
            cellProps: {
                className:
                'white-space-nowrap fw-semibold ps-2 border-end border-translucent'
            }
        }
    },
    {
        accessorKey: 'utr_number',
        header: () => {
            return (
                <div className="d-inline-flex flex-center">
                    <span>UTR Number</span>
                </div>
            );
        },
        cell: ({ row: { original } }) => {
            const { utr_number } = original;
            return (
                <span>{utr_number ? utr_number : '' }</span>
            );
        },
        meta: {
            headerProps: {
                className: 'ps-2 pe-2 border-end border-translucent'
            },
            cellProps: {
                className:
                'white-space-nowrap fw-semibold ps-2 border-end border-translucent'
            }
        }
    },
    {
        accessorKey: 'utr_date',
        header: () => {
            return (
                <div className="d-inline-flex flex-center">
                    <span>UTR Date</span>
                </div>
            );
        },
        cell: ({ row: { original } }) => {
            const { utr_date } = original;
            return (
                <span>{utr_date ? utr_date : '' }</span>
            );
        },
        meta: {
            headerProps: {
                className: 'ps-2 pe-2 border-end border-translucent'
            },
            cellProps: {
                className:
                'white-space-nowrap fw-semibold ps-2 border-end border-translucent'
            }
        }
    },
    {
        accessorKey: 'attachments',
        header: () => {
            return (
                <div className="d-inline-flex flex-center">
                    <span>Attachments</span>
                </div>
            );
        },
        cell: ({ row: { original } }) => {
            const { attachments } = original;
            return (
                <>
                <span>
                {attachments.length > 0 ? (
                    attachments.map((upload) => (
                        <span className="d-flex">
                        <Button
                            key={upload.id}
                            className="text-primary p-0 d-flex"
                            variant="link"
                            title="Download"
                            onClick={() => handleDownload(`/getFileDownload?filepath=uploads/purchase-order/quotations/${upload.name}`)}
                            startIcon={<FontAwesomeIcon icon={faDownload} />}
                        >
                            {upload.name}
                        </Button>

                        </span>

                        ))
                ) : 'N/A'}
                </span>
                </>
            );
        },
        meta: {
            headerProps: {
                className: 'ps-2 pe-2 border-end border-translucent'
            },
            cellProps: {
                className:
                'white-space-nowrap fw-semibold ps-2 border-end border-translucent'
            }
        }
    },

];

//FFD table columns
const vendorTableColumns = (handleShow: (contactId?: number) => void): ColumnDef<FfdPaymentData>[] => [
    {
        accessorKey: 'purchase_invoice_no',
        header: () => {
            return (
                <div className="d-inline-flex flex-center">
                    <span>Purchase Invoice No</span>
                </div>
            );
        },
        cell: ({ row: { original } }) => {
            const { purchase_invoice_no } = original;
            return (
                <span>{purchase_invoice_no}</span>
            );
        },
        meta: {
            headerProps: {
                className: 'ps-2 pe-2 border-start border-end border-translucent'
            },
            cellProps: {
                className:
                'white-space-nowrap fw-semibold ps-2 border-start border-end border-translucent'
            }
        }
    },
    {
        accessorKey: 'purchase_invoice_date',
        header: () => {
            return (
                <div className="d-inline-flex flex-center">
                    <span>Purch. Inv. Date</span>
                </div>
            );
        },
        cell: ({ row: { original } }) => {
            const { purchase_invoice_date } = original;
            return (
                <span>{ purchase_invoice_date }</span>
            );
        },
        meta: {
            headerProps: {
                className: 'ps-2 pe-2 border-end border-translucent'
            },
            cellProps: {
                className:
                'white-space-nowrap fw-semibold ps-2 border-end border-translucent'
            }
        }
    },
    {
        accessorKey: 'vendor',
        header: () => {
            return (
                <div className="d-inline-flex flex-center">
                    <span>Vendor Name</span>
                </div>
            );
        },
        cell: ({ row: { original } }) => {
            const { vendor } = original;
            return (
                <span>{vendor ? vendor.name : '' }</span>
            );
        },
        meta: {
            headerProps: {
                className: 'ps-2 pe-2 border-end border-translucent'
            },
            cellProps: {
                className:
                'white-space-nowrap fw-semibold ps-2 border-end border-translucent'
            }
        }
    },
    {
        accessorKey: 'business_task_id',
        header: () => {
            return (
                <div className="d-inline-flex flex-center">
                    <span>BT ID</span>
                </div>
            );
        },
        cell: ({ row: { original } }) => {
            const { business_task_id } = original;
            return (
                <span>{business_task_id ? business_task_id : '' }</span>
            );
        },
        meta: {
            headerProps: {
                className: 'ps-2 pe-2 border-end border-translucent'
            },
            cellProps: {
                className:
                'white-space-nowrap fw-semibold ps-2 border-end border-translucent'
            }
        }
    },
    {
        accessorKey: 'base_amount',
        header: () => {
            return (
                <div className="d-inline-flex flex-center">
                    <span>Base Amount</span>
                </div>
            );
        },
        cell: ({ row: { original } }) => {
            const { base_amount } = original;
            return (
                <span>{base_amount ? base_amount : '' }</span>
            );
        },
        meta: {
            headerProps: {
                className: 'ps-2 pe-2 border-end border-translucent'
            },
            cellProps: {
                className:
                'white-space-nowrap fw-semibold ps-2 border-end border-translucent'
            }
        }
    },
    {
        accessorKey: 'gst_percent',
        header: () => {
            return (
                <div className="d-inline-flex flex-center">
                    <span>GST %</span>
                </div>
            );
        },
        cell: ({ row: { original } }) => {
            const { gst_percent } = original;
            return (
                <span>{gst_percent ? gst_percent : '' }</span>
            );
        },
        meta: {
            headerProps: {
                className: 'ps-2 pe-2 border-end border-translucent'
            },
            cellProps: {
                className:
                'white-space-nowrap fw-semibold ps-2 border-end border-translucent'
            }
        }
    },
    {
        accessorKey: 'gst_amount',
        header: () => {
            return (
                <div className="d-inline-flex flex-center">
                    <span>GST Amount</span>
                </div>
            );
        },
        cell: ({ row: { original } }) => {
            const { gst_amount } = original;
            return (
                <span>{gst_amount ? gst_amount : '' }</span>
            );
        },
        meta: {
            headerProps: {
                className: 'ps-2 pe-2 border-end border-translucent'
            },
            cellProps: {
                className:
                'white-space-nowrap fw-semibold ps-2 border-end border-translucent'
            }
        }
    },
    {
        accessorKey: 'tds_deduction',
        header: () => {
            return (
                <div className="d-inline-flex flex-center">
                    <span>TDS </span>
                </div>
            );
        },
        cell: ({ row: { original } }) => {
            const { tds_deduction } = original;
            return (
                <span>{tds_deduction ? tds_deduction : '' }</span>
            );
        },
        meta: {
            headerProps: {
                className: 'ps-2 pe-2 border-end border-translucent'
            },
            cellProps: {
                className:
                'white-space-nowrap fw-semibold ps-2 border-end border-translucent'
            }
        }
    },
    {
        accessorKey: 'tds_amount',
        header: () => {
            return (
                <div className="d-inline-flex flex-center">
                    <span>TDS Amount</span>
                </div>
            );
        },
        cell: ({ row: { original } }) => {
            const { tds_amount } = original;
            return (
                <span>{tds_amount ? tds_amount : '' }</span>
            );
        },
        meta: {
            headerProps: {
                className: 'ps-2 pe-2 border-end border-translucent'
            },
            cellProps: {
                className:
                'white-space-nowrap fw-semibold ps-2 border-end border-translucent'
            }
        }
    },
    {
        accessorKey: 'net_payable',
        header: () => {
            return (
                <div className="d-inline-flex flex-center">
                    <span>Net Payable</span>
                </div>
            );
        },
        cell: ({ row: { original } }) => {
            const { net_payable } = original;
            return (
                <span>{net_payable ? net_payable : '' }</span>
            );
        },
        meta: {
            headerProps: {
                className: 'ps-2 pe-2 border-end border-translucent'
            },
            cellProps: {
                className:
                'white-space-nowrap fw-semibold ps-2 border-end border-translucent'
            }
        }
    },
    {
        accessorKey: 'paid_amount',
        header: () => {
            return (
                <div className="d-inline-flex flex-center">
                    <span>Paid Amount</span>
                </div>
            );
        },
        cell: ({ row: { original } }) => {
            const { paid_amount } = original;
            return (
                <span>{paid_amount ? paid_amount : '' }</span>
            );
        },
        meta: {
            headerProps: {
                className: 'ps-2 pe-2 border-end border-translucent'
            },
            cellProps: {
                className:
                'white-space-nowrap fw-semibold ps-2 border-end border-translucent'
            }
        }
    },
    {
        accessorKey: 'bank_name',
        header: () => {
            return (
                <div className="d-inline-flex flex-center">
                    <span>Bank Name</span>
                </div>
            );
        },
        cell: ({ row: { original } }) => {
            const { bank_name } = original;
            return (
                <span>{bank_name ? bank_name : '' }</span>
            );
        },
        meta: {
            headerProps: {
                className: 'ps-2 pe-2 border-end border-translucent'
            },
            cellProps: {
                className:
                'white-space-nowrap fw-semibold ps-2 border-end border-translucent'
            }
        }
    },
    {
        accessorKey: 'utr_number',
        header: () => {
            return (
                <div className="d-inline-flex flex-center">
                    <span>UTR Number</span>
                </div>
            );
        },
        cell: ({ row: { original } }) => {
            const { utr_number } = original;
            return (
                <span>{utr_number ? utr_number : '' }</span>
            );
        },
        meta: {
            headerProps: {
                className: 'ps-2 pe-2 border-end border-translucent'
            },
            cellProps: {
                className:
                'white-space-nowrap fw-semibold ps-2 border-end border-translucent'
            }
        }
    },
    {
        accessorKey: 'utr_date',
        header: () => {
            return (
                <div className="d-inline-flex flex-center">
                    <span>UTR Date</span>
                </div>
            );
        },
        cell: ({ row: { original } }) => {
            const { utr_date } = original;
            return (
                <span>{utr_date ? utr_date : '' }</span>
            );
        },
        meta: {
            headerProps: {
                className: 'ps-2 pe-2 border-end border-translucent'
            },
            cellProps: {
                className:
                'white-space-nowrap fw-semibold ps-2 border-end border-translucent'
            }
        }
    },
    {
        accessorKey: 'vessel_airline_date',
        header: () => {
            return (
                <div className="d-inline-flex flex-center">
                    <span>Attachments</span>
                </div>
            );
        },
        cell: ({ row: { original } }) => {
            const { attachments } = original;
            return (
                <>
                <span>
                {attachments.length > 0 ? (
                    attachments.map((upload) => (
                        <span className="d-flex">
                        <Button
                            key={upload.id}
                            className="text-primary p-0 d-flex"
                            variant="link"
                            title="Download"
                            onClick={() => handleDownload(`/getFileDownload?filepath=uploads/purchase-order/quotations/${upload.name}`)}
                            startIcon={<FontAwesomeIcon icon={faDownload} />}
                        >
                            {upload.name}
                        </Button>

                        </span>

                        ))
                ) : 'N/A'}
                </span>
                </>
            );
        },
        meta: {
            headerProps: {
                className: 'ps-2 pe-2 border-end border-translucent'
            },
            cellProps: {
                className:
                'white-space-nowrap fw-semibold ps-2 border-end border-translucent'
            }
        }
    },

];

const DataTable = () => {
    return (
        <div className="border-top border-translucent">
            <AdvanceTable
                tableProps={{ className: 'phoenix-table fs-9' }}
                rowClassName="hover-actions-trigger btn-reveal-trigger"
            />
            <AdvanceTableFooter pagination className="py-4" />
        </div>
    );
};
