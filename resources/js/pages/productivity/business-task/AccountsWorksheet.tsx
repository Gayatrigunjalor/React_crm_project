import React, { useEffect, useState, ChangeEvent } from 'react';
import { useParams } from 'react-router-dom';
import { Card, Form, Modal, Col, Row, Nav, Tab, ListGroup } from 'react-bootstrap';
import { faCirclePlus, faDownload, faEdit, faPaperclip, faTrash } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import Button from '../../../components/base/Button';
import axiosInstance from '../../../axios';
import { ColumnDef } from '@tanstack/react-table';
import SearchBox from '../../../components/common/SearchBox';
import useAdvanceTable from '../../../hooks/useAdvanceTable';
import AdvanceTableProvider from '../../../providers/AdvanceTableProvider';
import AdvanceTable from '../../../components/base/AdvanceTable';
import AdvanceTableFooter from '../../../components/base/AdvanceTableFooter';
import swal from 'sweetalert';
import { useAuth } from '../../../AuthContext';
import { useNavigate } from 'react-router-dom';
import ReactSelect from '../../../components/base/ReactSelect';
import PaymentHistoryBTTable, {paymentHistoryTableColumns} from './PaymentHistoryBTTable'
import VendorPurchaseHistoryPMTable, {vendorPurchaseTableColumns} from './VendorPurchaseHistoryPMTable'
import { downloadFile } from '../../../helpers/utils';
import { handlePDFclicked } from './EnquiryDetails';
interface Params {
    btId: number;
}
interface BusinessTaskEditData {
    id: number;
    customer_name: string;
    freight_target_cost: string;
}
interface QuotationProducts {
    id: number;
    product_name: string;
    pi_order_id: number;
    quantity: number;
}
interface QuotationData {
    id: number;
    pi_number: string;
    quotation_products: QuotationProducts[];
}
interface SupplierScrutinyData {
    id?: number;
    vendor_id: number;
    vendor_details: VendorData;
    supplier_name: string;
    gst_number: string;
    gst_status: string;
    gst_last_filing_date: string;
    previousnongstinvoice: string;
    undertaking_accountant: number;
    business_task_id: number;
}
interface VendorData {
    id: number;
    name: string;
}

export interface PaymentHistory {
    id: number;
    po_id: string;
    po_invoice_number: string;
    po_invoice_amount: string;
    paid_amount: string;
    balance_amount: string;
    business_task_id: string;
    tds_amount: string;
    tds_rate: string;
    gst_rate: string;
    gst_amount: string;
    gst_type: string;
    bank_name: string;
    utr_number: string;
    utr_date: string;
}
export interface VendorPurchaseHistory {
    id: number;
    po_id: string;
    purchase_order: { purchase_order_number: string; };
    purchase_invoice_no: string;
    purchase_invoice_date: string;
    vendor_name: { name: string; };
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
    attachments: [{ id: number; name: string; }];
}

const AccountsWorksheet = () => {
    const { btId } = useParams();
    const [showSupplierModal, setShowSupplierModal] = useState<boolean>(false);
    const [showSupplierAttachmentModal, setShowSupplierAttachmentModal] = useState<boolean>(false);
    const [refreshData, setRefreshData] = useState<boolean>(false);
    const [businessTaskData, setBusinessTaskData] = useState<BusinessTaskEditData>({id: 0, customer_name: '', freight_target_cost: '' });
    const [quotationData, setQuotationData] = useState<QuotationData[]>([]);
    const [vendorInvoicesData, setVendorInvoicesData] = useState([]);
    const [supplierScrutiny, setSupplierScrutiny] = useState<SupplierScrutinyData[]>([]);
    const [paymentHistory, setPaymentHistory] = useState<PaymentHistory[]>([]);
    const [vendorPurchaseHistory, setVendorPurchaseHistory] = useState<VendorPurchaseHistory[]>([]);
    const [vendorsList, setVendorsList] = useState<VendorData[]>([]);
    const [supId, setSupId] = useState<number | undefined>(undefined);
    const [error, setError] = useState<string | null>(null);
    const { userPermission } = useAuth(); //check userRole & permissions
    const navigate = useNavigate();
    useEffect(() => {
        const fetchBTData = async () => {
            try {
                const response = await axiosInstance.get(`/business-task/${btId}`);
                if (response.status !== 200) {
                    throw new Error('Failed to fetch data');
                }
                const data: BusinessTaskEditData = await response.data.businessTask;
                const quotation_data: QuotationData[] = await response.data.quotations;
                const vendor_invoices_data = await response.data.vendor_invoices;
                setBusinessTaskData(data);
                setQuotationData(quotation_data);
                setVendorInvoicesData(vendor_invoices_data);

            } catch (err: any) {
                setError(err.data.message);
            }
        };
        fetchBTData();
    }, []);

    useEffect(() => {
        const fetchSdeData = async() => {
            try {
                const response = await axiosInstance.get(`/getSupplierScrutinyBt/${btId}`);
                if (response.status !== 200) {
                    throw new Error('Failed to fetch data');
                }
                const data: SupplierScrutinyData[] = await response.data;
                setSupplierScrutiny(data);
            } catch (err: any) {
                setError(err.data.message);
            }
        };
        fetchSdeData();
    }, [refreshData]);

    useEffect(() => {
        const fetchPaymentHistoryList = async () => {
            try {
                const response = await axiosInstance.get(`/getPaymentHistoryBt/${btId}`);
                if (response.status !== 200) {
                    throw new Error('Failed to fetch data');
                }
                const data = await response.data;
                setPaymentHistory(data);
            } catch (err: any) {
                setError(err.message);
            } finally {
            }
        };
        fetchPaymentHistoryList();
    }, []);
    useEffect(() => {
        const fetchVendorPurchaseList = async () => {
            try {
                const response = await axiosInstance.get(`/vendorPurchaseHistory/${btId}`);
                if (response.status !== 200) {
                    throw new Error('Failed to fetch data');
                }
                const data = await response.data;
                setVendorPurchaseHistory(data);
            } catch (err: any) {
                setError(err.message);
            } finally {
            }
        };
        fetchVendorPurchaseList();
    }, []);
    useEffect(() => {
        const fetchVendorList = async () => {
            try {
                const response = await axiosInstance.get('/vendorsList');
                if (response.status !== 200) {
                    throw new Error('Failed to fetch data');
                }
                const data = await response.data;
                setVendorsList(data);
            } catch (err: any) {
                setError(err.message);
            } finally {
            }
        };
        fetchVendorList();
    }, []);

    const handleSupplierModal = (supId?: number) => {
        setSupId(supId);
        setShowSupplierModal(true);
    };
    const handleSupplierAttachmentModal = (supId?: number) => {
        setSupId(supId);
        setShowSupplierAttachmentModal(true);
    };

    const handleClose = () => {
        setShowSupplierModal(false)
    };

    const handleSupplierAttachmentClose = () => {
        setShowSupplierAttachmentModal(false)
    };

    const handlePaymentModal = () => {
        console.log();
    };

    const handleDownload = async (fileName: string, path: string) => {
        try {
            // Fetch the file from the server using the upload ID
            const response = await axiosInstance.get(`/getFileDownload?filepath=${path}/${fileName}`, {
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

    const handleSuccess = () => {
        // Refresh data or perform any other action after successful submission
        setRefreshData(prev => !prev); // Toggle state to trigger re-fetch
    };

    const suppliersTable = useAdvanceTable({
        data: supplierScrutiny,
        columns: supplierScrutinyTableColumns(handleSupplierModal,handleSupplierAttachmentModal),
        pageSize: 10,
        pagination: true,
        sortable: true,
        selection: false,
        initialState: {
            columnVisibility: {}
        }
    });

    const paymentHistoryTable = useAdvanceTable({
        data: paymentHistory,
        columns: paymentHistoryTableColumns(handlePaymentModal),
        pageSize: 10,
        pagination: true,
        sortable: true,
        selection: false,
        initialState: {
            columnVisibility: {}
        }
    });

    const vendorPurchaseHistoryTable = useAdvanceTable({
        data: vendorPurchaseHistory,
        columns: vendorPurchaseTableColumns(handleDownload),
        pageSize: 10,
        pagination: true,
        sortable: true,
        selection: false,
        initialState: {
            columnVisibility: {}
        }
    });

    const handleSelect = (eventKey: any) => {
        // Navigate based on the selected event key
        if (eventKey === "enquiry_details") {
            navigate(`/bt/enquiryDetails/${btId}`);
        }
        else if (eventKey === "sde_worksheet") {
            navigate(`/bt/sdeWorksheetEdit/${btId}`);
        }
        else if (eventKey === "logistics_instruction") {
            navigate(`/bt/logisticsInstructionEdit/${btId}`);
        }
        else if (eventKey === "accounts_worksheet") {
            navigate(`/bt/acWorksheetEdit/${btId}`);
        }
        else if (eventKey === "pm_worksheet") {
            navigate(`/bt/pmWorksheetEdit/${btId}`);
        }
        else if (eventKey === "lm_worksheet") {
            navigate(`/bt/lmWorksheetEdit/${btId}`);
        }
    };

    if (error) return <div>Error: {error}</div>;

    return (
        <>
            <h2 className="mb-5">Inter Departmental Collaboration | BT Id : { businessTaskData.id }</h2>
            <Tab.Container id="basic-tabs-example" defaultActiveKey="accounts_worksheet" onSelect={handleSelect}>
                <Row>
                    <Col>
                        <Nav variant="underline" className='ps-2 bg-body-secondary g-2'>
                            <Nav.Item>
                                <Nav.Link eventKey="enquiry_details" className='fs-8'>Sales Worksheet</Nav.Link>
                            </Nav.Item>
                            {/* <Nav.Item>
                                <Nav.Link eventKey="sde_worksheet" className='fs-8'>SDE Attachment</Nav.Link>
                            </Nav.Item>
                            <Nav.Item>
                                <Nav.Link eventKey="logistics_instruction" className='fs-8'>Logistics Instruction</Nav.Link>
                            </Nav.Item> */}
                            <Nav.Item>
                                <Nav.Link eventKey="accounts_worksheet" className='fs-8'>Accounts Worksheet</Nav.Link>
                            </Nav.Item>
                            <Nav.Item>
                                <Nav.Link eventKey="pm_worksheet" className='fs-8'>PM Worksheet</Nav.Link>
                            </Nav.Item>
                            <Nav.Item>
                                <Nav.Link eventKey="lm_worksheet" className='fs-8'>LM Worksheet</Nav.Link>
                            </Nav.Item>
                        </Nav>
                    </Col>
                </Row>
                <Tab.Content className='mt-3'>
                    <Tab.Pane eventKey="accounts_worksheet">
                        <Row className='mb-2 px-4'>
                            <Col className='bg-white border-bottom py-1'>
                                Customer Name: <span className='fw-semibold'> { businessTaskData.customer_name ?? '' } </span>
                            </Col>
                            <Col className='bg-white border-bottom py-1'>
                                Freight Target Cost: <span className='fw-semibold'> { businessTaskData.freight_target_cost } </span>
                            </Col>
                        </Row>
                        <Row className='mb-2 px-4'>
                            <Col className='bg-white border-bottom py-1'>
                                PI No(s): {quotationData.length > 0 && quotationData.map((quote: QuotationData) => (
                                    <span key={quote.id} className='fw-semibold'> <Button variant='link' onClick={() => handlePDFclicked(quote.id, 'pdfWithSignatureQuotation')}>{quote.pi_number}</Button> </span>
                                ))}
                            </Col>
                            <Col className='bg-white border-bottom py-1'>
                                PO number(s): {vendorInvoicesData.length > 0 && vendorInvoicesData.map((vendorInv) => (
                                    <span key={vendorInv} className='fw-semibold'>{vendorInv}&nbsp;&nbsp;&nbsp;</span>
                                ))}
                            </Col>
                        </Row>
                        <Row className='mb-2 px-2'>
                            <Col>
                                {quotationData.length > 0 && quotationData.map((quote: QuotationData) => (
                                    <ListGroup variant="flush" key={quote.id}>
                                        <ListGroup.Item className='bg-secondary text-light'>Product(s) of Proforma Invoice : {quote.pi_number}</ListGroup.Item>
                                        {quote.quotation_products.length > 0 ? (
                                            quote.quotation_products.map((product: QuotationProducts) => (
                                                <ListGroup.Item key={product.id}><span className='fw-semibold'> {product.product_name} </span> &nbsp;&nbsp;&nbsp; Qty: <span className='fw-semibold'>{product.quantity}</span></ListGroup.Item>
                                            ))
                                        ) : (
                                            <span>No products available</span>
                                        )}
                                    </ListGroup>
                                ))}
                            </Col>
                        </Row>

                        <Card className='border border-translucent'>
                            <Row className='mb-2 mx-4 mt-4 bg-success-lighter align-items-center justify-content-center'>
                                <Col sm={2} className='d-inline-flex'>
                                <Button
                                    variant="success"
                                    className=""
                                    startIcon={<FontAwesomeIcon icon={faCirclePlus} className="me-2" />}
                                    onClick={() => handleSupplierModal()}
                                >
                                    Add Supplier Scrutiny
                                </Button>
                                </Col>
                                <Col sm={3}></Col>
                                <Col sm={7} className='text-body-emphasis py-2'>
                                    Supplier Scrutiny
                                </Col>
                            </Row>
                            <Row className='mt-2 px-4 pb-4'>
                                <AdvanceTableProvider {...suppliersTable}>
                                    <SupplierScrutinyTable />
                                </AdvanceTableProvider>
                            </Row>

                            <Row className='mb-2 mx-4 mt-4 bg-success-lighter align-items-center text-center'>
                                <Col className='text-body-emphasis py-2'>Payment History</Col>
                            </Row>
                            <Row className='mt-2 px-4 pb-4'>
                                <AdvanceTableProvider {...paymentHistoryTable}>
                                    <PaymentHistoryBTTable />
                                </AdvanceTableProvider>
                            </Row>

                            <Row className='mb-2 mx-4 mt-4 bg-success-lighter align-items-center text-center'>
                                <Col className='text-body-emphasis py-2'>Vendor Purchase Invoice History</Col>
                            </Row>
                            <Row className='mt-2 px-4 pb-4'>
                                <AdvanceTableProvider {...vendorPurchaseHistoryTable}>
                                    <PaymentHistoryBTTable />
                                </AdvanceTableProvider>
                            </Row>
                        </Card>
                    </Tab.Pane>
                </Tab.Content>
            </Tab.Container>

            {showSupplierModal && (
                <SupplierModal supId={supId} businessTaskData={businessTaskData} vendorsList={vendorsList} onHide={handleClose} onSuccess={handleSuccess} />
            )}
            {showSupplierAttachmentModal && (
                <SupplierAttachmentModal supId={supId} businessTaskData={businessTaskData} onHide={handleSupplierAttachmentClose} onSuccess={handleSuccess} />
            )}
        </>
    )
};

export default AccountsWorksheet;

const supplierScrutinyTableColumns = (handleSupplierModal: (supId?: number) => void, handleSupplierAttachmentModal: (supId?: number) => void): ColumnDef<SupplierScrutinyData>[] => [
    {
        accessorKey: 'vendor_details',
        header: () => {
            return (
                <div className="d-inline-flex flex-center">
                    <span>Supplier Name</span>
                </div>
            );
        },
        cell: ({ row: { original } }) => {
            const { vendor_details } = original;
            const { supplier_name } = original;
            return (
                <span>{vendor_details ? vendor_details.name : supplier_name}</span>
            );
        },
        meta: {
            headerProps: {
                style: { width: '15%' },
                className: 'ps-2 pe-2 border-translucent'
            },
            cellProps: {
                className:
                'white-space-nowrap fw-semibold ps-2 border-translucent'
            }
        }
    },
    {
        accessorKey: 'gst_number',
        header: () => {
            return (
                <div className="d-inline-flex flex-center">
                    <span>GST Number</span>
                </div>
            );
        },
        cell: ({ row: { original } }) => {
            const { gst_number } = original;
            return (
                <span>{gst_number}</span>
            );
        },
        meta: {
            headerProps: {
                style: { width: '15%' },
                className: 'ps-2 pe-2 border-translucent'
            },
            cellProps: {
                className:
                'white-space-nowrap fw-semibold ps-2 border-translucent'
            }
        }
    },
    {
        accessorKey: 'gst_status',
        header: () => {
            return (
                <div className="d-inline-flex flex-center">
                    <span>GST Status</span>
                </div>
            );
        },
        cell: ({ row: { original } }) => {
            const { gst_status } = original;
            return (
                <span>{gst_status}</span>
            );
        },
        meta: {
            headerProps: {
                style: { width: '15%' },
                className: 'ps-2 pe-2 border-translucent'
            },
            cellProps: {
                className:
                'white-space-nowrap fw-semibold ps-2 border-translucent'
            }
        }
    },
    {
        accessorKey: 'gst_last_filing_date',
        header: () => {
            return (
                <div className="d-inline-flex flex-center">
                    <span>GST Last filing Date</span>
                </div>
            );
        },
        cell: ({ row: { original } }) => {
            const { gst_last_filing_date } = original;
            return (
                <span>{gst_last_filing_date}</span>
            );
        },
        meta: {
            headerProps: {
                className: 'ps-2 pe-2 border-translucent'
            },
            cellProps: {
                className:
                'white-space-nowrap fw-semibold ps-2 border-translucent'
            }
        }
    },
    {
        id: 'previousnongstinvoice',
        header: () => {
            return (
                <div className="d-inline-flex flex-center">
                    <span>Previous GST 2A</span>
                </div>
            );
        },
        meta: {
            headerProps: {
                className: 'ps-2 pe-2 border-translucent'
            },
            cellProps: {
                className:
                'ps-2 border-translucent'
            }
        },
        accessorFn: ({ previousnongstinvoice }) => previousnongstinvoice
    },
    {
        id: 'actions',
        header: () => {
            return (
                <div className="d-inline-flex flex-center">
                    <span>Actions</span>
                </div>
            );
        },
        cell: ({ row: { original } }) => {
            const { id } = original;
            const { userPermission } = useAuth(); //check userRole & permissions
            return (
                <>
                    <Button variant='link' title='Edit Supplier Scrutiny details' onClick={() => handleSupplierModal(id)} startIcon={<FontAwesomeIcon icon={faEdit} />}></Button>
                    <Button variant='link' className='text-success' title='Supplier Scrutiny attachment' onClick={() => handleSupplierAttachmentModal(id)} startIcon={<FontAwesomeIcon icon={faPaperclip} />}></Button>
                </>
            );
        },
        meta: {
            headerProps: {
                className: 'ps-2 pe-2 border-translucent'
            },
            cellProps: {
                className:
                'white-space-nowrap fw-semibold ps-2 border-translucent'
            }
        }
    },
];
const SupplierScrutinyTable = () => {
    return (
        <div className="border-top border-translucent">
            <AdvanceTable
                tableProps={{ className: 'phoenix-table fs-9' }}
                rowClassName="hover-actions-trigger btn-reveal-trigger"
            />
        </div>
    );
};

interface SupplierModalProps {
    supId?: number;
    businessTaskData: BusinessTaskEditData;
    vendorsList: VendorData[];
    onHide: () => void;
    onSuccess: () => void;
}
const SupplierModal: React.FC<SupplierModalProps> = ({ supId, businessTaskData, vendorsList, onHide, onSuccess}) => {
    const [custData, setUserData] = useState<SupplierScrutinyData>({ id: 0, business_task_id: businessTaskData.id, vendor_id:0, vendor_details: { id: 0, name: '' }, supplier_name: '', gst_number: '', gst_status: '', gst_last_filing_date: '', previousnongstinvoice: '', undertaking_accountant: 0 });
    const [isEditing, setIsEditing] = useState<boolean>(false);
    const [validated, setValidated] = useState<boolean>(false);
    const [loading, setLoading] = useState(false);
    useEffect(() => {

        if (supId) {
            setIsEditing(true);
            // Fetch supplier scrutiny data for editing
            axiosInstance.get(`/editSupplierScrutinyBt/${supId}`)
            .then(response => {
                setUserData(response.data);
            })
            .catch(error => console.error('Error fetching supplier scrutiny data:', error));
        }
    }, [supId]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;

        // Update purchase price
        const updatedCustData = { ...custData, [name]: value };

        setUserData(updatedCustData);
    };

    const handleRSelect = (selectedOption: { value: number; label: string } | null, fieldName: string) => {
        if (selectedOption) {
            setUserData({ ...custData, vendor_details: {
                id: selectedOption.value,
                name: selectedOption.label
            }, vendor_id: selectedOption.value });
        } else {
            setUserData({ ...custData, [fieldName]: null });
        }
    };

    const handleSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const { name, value } = e.target;
        setUserData({ ...custData, [name]: value });
    };
    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const form = e.currentTarget;
        if (form.checkValidity() === false) {
            e.preventDefault();
            e.stopPropagation();
            setValidated(true);
            return;
        }

        setLoading(true);
        setValidated(true);
        const apiCall = isEditing
            ? axiosInstance.put(`/updateSupplierScrutinyBt`,  {
                supplier_scrutiny_id: custData.id,
                vendor_id: custData.vendor_id,
                gst_number: custData.gst_number,
                gst_status: custData.gst_status,
                gst_last_filing_date: custData.gst_last_filing_date,
                previousnongstinvoice: custData.previousnongstinvoice,
                undertaking_accountant: custData.undertaking_accountant
            })
            : axiosInstance.post('/storeSupplierScrutinyBt', custData );

        apiCall
            .then((response) => {
                swal("Success!", response.data.message, "success");
            onSuccess();
            onHide();
        })
        .catch(error => swal("Error!", error.data.message, "error"))
        .finally(() => { setLoading(false); });
    };
    return (
        <>
            <Modal show onHide={onHide} size="xl" backdrop="static" keyboard={false}>
                <Modal.Header closeButton>
                    <Modal.Title>{isEditing ? 'Edit Supplier Scrutiny' : 'Add Supplier Scrutiny'}</Modal.Title>
                </Modal.Header>
                <Form noValidate validated={validated} onSubmit={handleSubmit}>
                    <Modal.Body>
                        <Form.Control type="hidden" name="id" value={custData.id} />
                        <Form.Control type="hidden" name="business_task_id" value={custData.business_task_id} />
                        <Row className="g-3">
                            <Form.Group as={Col} className="mb-3" controlId="vendor_details">
                                <Form.Label>Supplier Name <span className="text-danger">*</span></Form.Label>
                                <ReactSelect
                                    options= {vendorsList.map((option: VendorData) => (
                                        { value: option.id, label: option.name }
                                    ))}
                                    placeholder="Select Vendor" name="vendor_details" value={custData.vendor_details ? { value: custData.vendor_details.id, label: custData.vendor_details.name } : null} onChange={(selectedOption) => handleRSelect(selectedOption, 'vendor_details')} required
                                />
                                <Form.Control type="hidden" name="vendor_id" value={custData.vendor_id} />
                                {validated && !custData.vendor_id && (
                                            <div className="invalid-feedback d-block">Please enter supplier name</div>
                                        )}
                            </Form.Group>
                            <Form.Group as={Col} className="mb-3" controlId="gst_number">
                                <Form.Label>GST Number <span className="text-danger">*</span></Form.Label>
                                <Form.Control type="text" placeholder="GST Number" name="gst_number" value={custData.gst_number} onChange={handleChange} minLength={15} maxLength={15} required />
                                <Form.Control.Feedback type="invalid">Please enter GST Number. (min length : 15)</Form.Control.Feedback>
                            </Form.Group>
                            <Form.Group as={Col} className="mb-3" controlId="task_status">
                                <Form.Label>GST Status <span className="text-danger">*</span></Form.Label>
                                <Form.Select name="gst_status" value={custData.gst_status} onChange={handleSelectChange}>
                                    <option value="">Select</option>
                                    <option value="Active">Active</option>
                                    <option value="Inactive">Inactive</option>
                                </Form.Select>
                            </Form.Group>
                        </Row>
                        <Row className="g-3">
                            <Form.Group as={Col} className="mb-3" controlId="gst_last_filing_date">
                                <Form.Label>GST Last filing Date <span className="text-danger">*</span></Form.Label>
                                <Form.Control type="date" name="gst_last_filing_date" value={custData.gst_last_filing_date} onChange={handleChange} required />
                                <Form.Control.Feedback type="invalid">Please enter date.</Form.Control.Feedback>
                            </Form.Group>
                            <Form.Group as={Col} className="mb-3" controlId="previousnongstinvoice">
                                <Form.Label>Previous Non GST 2A reflected Invoice Number</Form.Label>
                                <Form.Control type="text" placeholder="Previous Non GST 2A reflected Invoice Number" name="previousnongstinvoice" value={custData.previousnongstinvoice} onChange={handleChange} />
                                <Form.Control.Feedback type="invalid">Please enter previous Non GST 2A reflected Invoice Number.</Form.Control.Feedback>
                            </Form.Group>
                        </Row>
                        <Row className="g-3">
                            <Form.Group as={Col} className="mb-3" controlId="defaultCheckbox">
                                <Form.Label>Undertaking Submission by Accountant <span className="text-danger">*</span></Form.Label>
                                <Form.Check
                                    type='checkbox'
                                    id='defaultCheckbox'
                                    label='I Hereby Declare and undertake that I have checked All Details Like Buyer Name, Address, GST, State code, supplier sign and stamp are correct. Also declare that supplier did not present same TAX Invoice before for payment or this is not repeated payment against same invoice number. Also I Declare that all previous TAX Invoices reflected in GST 2A and no ITC put on hold due to said supplier.'
                                    name="undertaking_accountant" checked={custData.undertaking_accountant} onChange={handleChange} required
                                />
                                <Form.Control.Feedback type="invalid">Please enter previous Non GST 2A reflected Invoice Number.</Form.Control.Feedback>
                            </Form.Group>
                        </Row>

                    </Modal.Body>
                    <Modal.Footer>
                        <Button variant="secondary" onClick={onHide}>
                            Close
                        </Button>
                        <Button variant="primary" loading={loading} loadingPosition="start" type="submit">{isEditing ? 'Update' : 'Add'}</Button>
                    </Modal.Footer>
                </Form>
            </Modal>
        </>
    );
};

interface SupplierAttachmentModalProps {
    supId?: number;
    businessTaskData: BusinessTaskEditData;
    onHide: () => void;
    onSuccess: () => void;
}
interface FormData {
    id?: number;
    attachment_name: string;
    attachment_details: string;
    name: File | null;
    attachment_title?: string;
}

interface SupplierAttachmentData{
    id: number;
    attachment_name: string;
    name: string;
    attachment_details: string;
}
const SupplierAttachmentModal: React.FC<SupplierAttachmentModalProps> = ({ supId, businessTaskData, onHide, onSuccess}) => {
    const [suppAttachment, setSuppAttachment] = useState<FormData>({ id: 0, attachment_name: '', attachment_details: '', name: null });
    const [suppAttachmentListing, setSuppAttachmentListing] = useState<SupplierAttachmentData[]>([]);
    // const [isEditing, setIsEditing] = useState<boolean>(false);
    const [validated, setValidated] = useState<boolean>(false);
    const [loading, setLoading] = useState(false);
    const [refreshAttachData, setRefreshAttachData] = useState<boolean>(false);
    const handleSuppAcSuccess = () => {
        setSuppAttachment({ id: 0, attachment_name: '', attachment_details: '', name: null });
        // Refresh data or perform any other action after successful submission
        setRefreshAttachData(prev => !prev); // Toggle state to trigger re-fetch
    };
    useEffect(() => {

        if (supId) {
            // Fetch supplier scrutiny Attachment data for editing
            axiosInstance.get(`/showAcAttachmentBt/${supId}`)
            .then(response => {
                setSuppAttachmentListing(response.data);
            })
            .catch(error => console.error('Error fetching supplier scrutiny Attachment data:', error));
        }
    }, [supId, refreshAttachData]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        const updatedCustData = { ...suppAttachment, [name]: value };
        setSuppAttachment(updatedCustData);
    };

    const handleSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const { name, value } = e.target;
        setSuppAttachment({ ...suppAttachment, [name]: value });
    };

    // Handler function for the file input change event
    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files ? event.target.files[0] : null;
        setSuppAttachment({ ...suppAttachment, name: file });
    };
    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const form = e.currentTarget;
        if (form.checkValidity() === false) {
            e.preventDefault();
            e.stopPropagation();
            setValidated(true);
            return;
        }

        setLoading(true);
        setValidated(true);
        const apiCall = axiosInstance.post('/storeAcAttachmentBt',{
            ...suppAttachment,
            supplier_scrutiny_id: supId
        }, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });

        apiCall.then((response) => {
            swal("Success!", response.data.message, "success");
            handleSuppAcSuccess();
        })
        .catch(error => swal("Error!", error.data.message, "error"))
        .finally(() => { setLoading(false); });
    };

    const handleDownload = async (fileName: string, path: string) => {
        try {
            // Fetch the file from the server using the upload ID
            const response = await axiosInstance.get(`/getFileDownload?filepath=${path}/${fileName}`, {
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

    const handleDelete = (suppAttachId: number) => {
        swal({
            title: "Are you sure?",
            text: "Once deleted, you will not be able to recover this record!",
            icon: "warning",
            buttons: {
                confirm: {
                    text: "Delete",
                    value: true,
                    visible: true,
                    className: "",
                    closeModal: true
                },
                cancel: {
                    text: "Cancel",
                    value: null,
                    visible: true,
                    className: "",
                    closeModal: true,
                }
            },
            dangerMode: true,
        })
        .then((willDelete) => {
            if (willDelete) {
                axiosInstance.delete(`/deleteAcAttachment/${suppAttachId}`)
                .then(response => {
                    swal("Success!", response.data.message, "success");
                    handleSuppAcSuccess();
                })
                .catch(error => {
                    swal("Error!", error.data.message, "error");
                });
            } else {
                swal("Your record is safe!");
            }
        });
    };

    return (
        <>
            <Modal show onHide={onHide} size="xl" backdrop="static" keyboard={false}>
                <Modal.Header closeButton>
                    <Modal.Title>Add Supplier Scrutiny</Modal.Title>
                </Modal.Header>
                <Form noValidate validated={validated} onSubmit={handleSubmit}>
                    <Modal.Body>
                        <Row className="g-3">
                            <Form.Group as={Col} className="mb-3" controlId="attachment_name">
                                <Form.Label>Attachment Name <span className="text-danger">*</span></Form.Label>
                                <Form.Select name="attachment_name" value={suppAttachment.attachment_name} onChange={handleSelectChange} required>
                                    <option value="">Select</option>
                                    <option value="GST Website screenshot / photo">GST Website screenshot / photo </option>
                                </Form.Select>
                                <Form.Control.Feedback type="invalid">Please enter attachment name.</Form.Control.Feedback>
                            </Form.Group>
                            <Form.Group as={Col} className="mb-3" controlId="name">
                                <Form.Label>Details <span className="text-danger">*</span></Form.Label>
                                <Form.Control type="text" placeholder="Details" name="attachment_details" value={suppAttachment.attachment_details} onChange={handleChange} required />
                                <Form.Control.Feedback type="invalid">Please enter details.</Form.Control.Feedback>
                            </Form.Group>
                            <Form.Group as={Col} controlId="name">
                                <Form.Label>Attachment <span className="text-danger">*</span></Form.Label>
                                <Form.Control type="file" name="name" onChange={handleFileChange} required />
                                <Form.Control.Feedback type="invalid">Please enter attachment.</Form.Control.Feedback>
                            </Form.Group>
                        </Row>
                    </Modal.Body>
                    <Modal.Footer>
                        <Button variant="secondary" onClick={onHide}>
                            Close
                        </Button>
                        <Button variant="primary" loading={loading} loadingPosition="start" type="submit">Save</Button>
                    </Modal.Footer>
                </Form>

                <Row className='my-3 px-4'>
                    <Col>
                        <>
                            <table className='fs-8 table striped bordered mb-4'>
                                <thead>
                                    <tr>
                                        <th className='p-2 border border-secondary'>Attachment Name</th>
                                        <th className='p-2 border border-secondary'>Attachment</th>
                                        <th className='p-2 border border-secondary'>Details</th>
                                        <th className='p-2 border border-secondary'>Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {suppAttachmentListing.length > 0 && suppAttachmentListing.map((box: any,index) => (
                                        <>
                                            <tr key={index}>
                                                <td className='p-2 border border-secondary'>{box.attachment_name}</td>
                                                <td className='p-2 border border-secondary'>{box.name}</td>
                                                <td className='p-2 border border-secondary'>{box.attachment_details}</td>
                                                <td className='p-2 border border-secondary'>
                                                    <Button
                                                        key={box.id}
                                                        className="text-primary p-0 me-2"
                                                        variant="link"
                                                        title="Download"
                                                        onClick={() => handleDownload(box.name, 'uploads/business-task/ac/scrutiny')}
                                                        startIcon={<FontAwesomeIcon icon={faDownload} />}
                                                    >
                                                        {box.name}
                                                    </Button>
                                                    <Button
                                                        className="text-danger p-0"
                                                        variant="link"
                                                        title="Delete"
                                                        onClick={() => handleDelete(box.id)}
                                                        startIcon={<FontAwesomeIcon icon={faTrash} />}
                                                    >
                                                    </Button>
                                                </td>
                                            </tr>
                                        </>
                                    ))}
                                </tbody>
                            </table>
                        </>
                    </Col>
                </Row>
            </Modal>
        </>
    );
};
