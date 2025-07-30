import React, { useEffect, useState, ChangeEvent } from 'react';
import { useParams } from 'react-router-dom';
import { Card, Form, Modal, Col, Row, Nav, Tab, ListGroup } from 'react-bootstrap';
import { faCirclePlus, faDownload, faEdit, faTrash } from '@fortawesome/free-solid-svg-icons';
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
import { downloadFile } from '../../../helpers/utils';
import { handlePDFclicked } from './EnquiryDetails';

interface Params {
    btId: number;
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
interface BusinessTaskEditData {
    id: number;
}
interface PurchaseOrderData {
    id: number;
    po_number: string;
}
interface PurchseDeptData {
    id: number;
    make1: string;
    model1: string;
    supplier_name2: string;
    warranty_extension: string;
    product_authenticity: string;
    physical_verification: string;
    lead_time: string;
    custvsvendcommitment: string;
    expiry: string;
    proformainvvsvendorqot: string;
    quantity1: number;
    technicalspecipm: string;
    productspecicrutiny: string;
    condition1: string;
    product_type1: string;
    transportation_cost: number;
    warrenty: string;
    year_of_manufacturing1: string;
    packaging_cost: string;
    ready_stock_quantity: string;
    business_task_id: number;
}
const PmWorksheet = () => {
    const { btId } = useParams();
    const [purchaseId, setPurchaseId] = useState<number | undefined>(undefined);
    const [showSupplierModal, setShowSupplierModal] = useState<boolean>(false);
    const [showSupplierAttachmentModal, setShowSupplierAttachmentModal] = useState<boolean>(false);
    const [refreshData, setRefreshData] = useState<boolean>(false);
    const [businessTaskData, setBusinessTaskData] = useState<BusinessTaskEditData>({ id: 0 });
    const [quotationData, setQuotationData] = useState<QuotationData[]>([]);
    const [poData, setPoData] = useState<PurchaseOrderData[]>([]);
    const [vendorInvoicesData, setVendorInvoicesData] = useState([]);
    const [supplierNamesData, setSupplierNamesData] = useState([]);
    const [purchaseData, setPurchaseData] = useState<PurchseDeptData[]>([]);
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
                const supplier_names_data = await response.data.supplier_names;
                const po_data: PurchaseOrderData[] = await response.data.po_numbers;
                setBusinessTaskData(data);
                setQuotationData(quotation_data);
                setPoData(po_data);
                setVendorInvoicesData(vendor_invoices_data);
                setSupplierNamesData(supplier_names_data);

            } catch (err: any) {
                setError(err.data.message);
            }
        };
        fetchBTData();
    }, []);

    useEffect(() => {
        const fetchPurchaseDeptData = async() => {
            try {
                const response = await axiosInstance.get(`/getPmWorksheetBt/${btId}`);
                if (response.status !== 200) {
                    throw new Error('Failed to fetch data');
                }
                const data: PurchseDeptData[] = await response.data;
                setPurchaseData(data);
            } catch (err: any) {
                setError(err.data.message);
            }
        };
        fetchPurchaseDeptData();
    }, [refreshData]);

    const handlePMModal = (purchaseId?: number) => {
        setPurchaseId(purchaseId);
        setShowSupplierModal(true);
    };

    const handlePMAttachmentModal = (purchaseId?: number) => {
        setPurchaseId(purchaseId);
        setShowSupplierAttachmentModal(true);
    };

    const purchaseTable = useAdvanceTable({
        data: purchaseData,
        columns: purchaseDeptTableColumns(handlePMModal),
        pageSize: 10,
        pagination: true,
        sortable: true,
        selection: false,
        initialState: {
            columnVisibility: {

            }
        }
    });

    const handleClose = () => {
        setShowSupplierModal(false)
    };

    const handleAttachmentClose = () => {
        setShowSupplierAttachmentModal(false)
    };

    const handleSuccess = () => {
        // Refresh data or perform any other action after successful submission
        setRefreshData(prev => !prev); // Toggle state to trigger re-fetch
    };

    const handleSelect = (eventKey) => {
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
            <Tab.Container id="basic-tabs-example" defaultActiveKey="pm_worksheet" onSelect={handleSelect}>
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
                    <Tab.Pane eventKey="pm_worksheet">
                        <Row className='mb-2 px-2'>
                            <Col>
                                {quotationData.length > 0 && quotationData.map((quote: QuotationData) => (
                                    <ListGroup variant="flush" key={quote.id}>
                                        <ListGroup.Item className='bg-secondary text-light'>Proforma Invoice Product(s)</ListGroup.Item>
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
                        <Row className='mb-2 px-4'>
                            <Col className='bg-white border-bottom border-top py-1'>
                                PO Number(s): {poData.length > 0 && poData.map((purchase_order: PurchaseOrderData) => (
                                    <span key={purchase_order.id} className='fw-semibold'> <Button variant='link' onClick={() => handlePDFclicked(purchase_order.id, 'pdfWithSignature')}>{purchase_order.po_number}</Button></span>
                                ))}
                            </Col>
                            <Col className='bg-white border-bottom border-top py-1'>
                                Vendor Invoice number: {vendorInvoicesData.length > 0 && vendorInvoicesData.map((vendorInv) => (
                                    <span key={vendorInv} className='fw-semibold'>{vendorInv}&nbsp;&nbsp;&nbsp;</span>
                                ))}
                            </Col>
                            <Col className='bg-white border-bottom border-top py-1'>
                                Supplier(s): {supplierNamesData.length > 0 && supplierNamesData.map((supplier) => (
                                    <span key={supplier} className='fw-semibold'>{supplier}&nbsp;&nbsp;&nbsp;</span>
                                ))}
                            </Col>
                        </Row>
                        <Card className='border border-translucent'>
                            <Row className='mb-2 mx-4 mt-4 bg-secondary align-items-center text-center'>
                                <Col sm={7} className='text-light justify-content-start py-2'>
                                    Purchase Departments Scrutiny
                                </Col>
                                <Col className='d-inline-flex justify-content-end text-light'>
                                    <Button
                                        variant="subtle-secondary"
                                        className="me-2"
                                        startIcon={<FontAwesomeIcon icon={faCirclePlus} className="me-2" />}
                                        onClick={() => handlePMModal()}
                                    >
                                        Add Purchase Dept Scrutiny
                                    </Button>
                                    <Button
                                        variant="subtle-secondary"
                                        className="ms-1"
                                        startIcon={<FontAwesomeIcon icon={faCirclePlus} className="me-2" />}
                                        onClick={() => handlePMAttachmentModal()}
                                    >
                                        Attachments
                                    </Button>
                                </Col>
                            </Row>
                            <Row className='mt-2 px-4 pb-4'>
                                <AdvanceTableProvider {...purchaseTable}>
                                    <PurchaseDeptTable />
                                </AdvanceTableProvider>
                            </Row>
                        </Card>
                    </Tab.Pane>
                </Tab.Content>
            </Tab.Container>
            {showSupplierModal && (
                <SupplierModal purchaseId={purchaseId} businessTaskData={businessTaskData} onHide={handleClose} onSuccess={handleSuccess} />
            )}

            {showSupplierAttachmentModal && (
                <SupplierAttachmentModal btId={Number(btId)} onHide={handleAttachmentClose} onSuccess={handleSuccess} />
            )}
        </>
    )
};

export default PmWorksheet;

const purchaseDeptTableColumns = (handlePMModal: (supId?: number) => void): ColumnDef<PurchseDeptData>[] => [
    {
        accessorKey: 'id',
        header: () => {
            return (
                <div className="d-inline-flex flex-center">
                    <span>Sr No.</span>
                </div>
            );
        },
        cell: ({ row: { original } }) => {
            const { id } = original;

            return (
                <span>{id}</span>
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
        accessorKey: 'make1',
        header: () => {
            return (
                <div className="d-inline-flex flex-center">
                    <span>Make</span>
                </div>
            );
        },
        cell: ({ row: { original } }) => {
            const { make1 } = original;
            return (
                <span>{make1}</span>
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
        accessorKey: 'model1',
        header: () => {
            return (
                <div className="d-inline-flex flex-center">
                    <span>Model</span>
                </div>
            );
        },
        cell: ({ row: { original } }) => {
            const { model1 } = original;
            return (
                <span>{model1}</span>
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
        accessorKey: 'supplier_name2',
        header: () => {
            return (
                <div className="d-inline-flex flex-center">
                    <span>Supplier</span>
                </div>
            );
        },
        cell: ({ row: { original } }) => {
            const { supplier_name2 } = original;
            return (
                <span>{supplier_name2}</span>
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
        accessorKey: 'quantity1',
        header: () => {
            return (
                <div className="d-inline-flex flex-center">
                    <span>Quantity</span>
                </div>
            );
        },
        cell: ({ row: { original } }) => {
            const { quantity1 } = original;
            return (
                <span>{quantity1}</span>
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
        id: 'condition1',
        header: () => {
            return (
                <div className="d-inline-flex flex-center">
                    <span>Condition</span>
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
        accessorFn: ({ condition1 }) => condition1
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
                <><Button variant='link' title='Edit Supplier Scrutiny details' onClick={() => handlePMModal(id)} startIcon={<FontAwesomeIcon icon={faEdit} />}></Button></>
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
const PurchaseDeptTable = () => {
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
    purchaseId?: number;
    businessTaskData: BusinessTaskEditData;
    onHide: () => void;
    onSuccess: () => void;
}
const SupplierModal: React.FC<SupplierModalProps> = ({ purchaseId, businessTaskData, onHide, onSuccess}) => {
    const [custData, setUserData] = useState<PurchseDeptData>({ id: 0, business_task_id: businessTaskData.id, make1: '', model1: '', supplier_name2: '', warranty_extension: '', product_authenticity: '', physical_verification: '', lead_time: '', custvsvendcommitment: '', expiry: '', proformainvvsvendorqot: '', quantity1: 0, technicalspecipm: '', productspecicrutiny: '', condition1: 'New', product_type1: 'Original', transportation_cost: 0, warrenty: '', year_of_manufacturing1: '', packaging_cost: '', ready_stock_quantity: '' });
    const [isEditing, setIsEditing] = useState<boolean>(false);
    const [validated, setValidated] = useState<boolean>(false);
    const [loading, setLoading] = useState(false);
    useEffect(() => {

        if (purchaseId) {
            setIsEditing(true);
            // Fetch purchase scrutiny data for editing
            axiosInstance.get(`/pmWorksheetEdit/${purchaseId}`)
            .then(response => {
                setUserData(response.data);
            })
            .catch(error => console.error('Error fetching purchase scrutiny data:', error));
        }
    }, [purchaseId]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;

        // Update purchase price
        const updatedCustData = { ...custData, [name]: value };

        setUserData(updatedCustData);
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
            ? axiosInstance.put(`/updatePmWorksheetBt/${custData.id}`,  {
                business_task_id: businessTaskData.id,
                make1                   : custData.make1,
                model1                  : custData.model1,
                supplier_name2          : custData.supplier_name2,
                warranty_extension      : custData.warranty_extension,
                product_authenticity    : custData.product_authenticity,
                physical_verification   : custData.physical_verification,
                lead_time               : custData.lead_time,
                custvsvendcommitment    : custData.custvsvendcommitment,
                expiry                  : custData.expiry,
                proformainvvsvendorqot  : custData.proformainvvsvendorqot,
                quantity1               : custData.quantity1,
                technicalspecipm        : custData.technicalspecipm,
                productspecicrutiny     : custData.productspecicrutiny,
                condition1              : custData.condition1,
                product_type1           : custData.product_type1,
                transportation_cost     : custData.transportation_cost,
                warrenty                : custData.warrenty,
                year_of_manufacturing1  : custData.year_of_manufacturing1,
                packaging_cost          : custData.packaging_cost,
                ready_stock_quantity    : custData.ready_stock_quantity
            })
            : axiosInstance.post('/addPmWorksheetBt', custData );

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
                    <Modal.Title>{isEditing ? 'Edit Purchase Dept Scrutiny' : 'Add Purchase Dept Scrutiny'}</Modal.Title>
                </Modal.Header>
                <Form noValidate validated={validated} onSubmit={handleSubmit}>
                    <Modal.Body>
                        <Form.Control type="hidden" name="id" value={custData.id} />
                        <Form.Control type="hidden" name="business_task_id" value={custData.business_task_id} />
                        <Row className="g-3">
                            <Form.Group as={Col} className="mb-3" controlId="make1">
                                <Form.Label>Make 1 <span className="text-danger">*</span></Form.Label>
                                <Form.Control type="text" placeholder="Make 1" name="make1" value={custData.make1} onChange={handleChange} required />
                                <Form.Control.Feedback type="invalid">Please enter make 1.</Form.Control.Feedback>
                            </Form.Group>
                            <Form.Group as={Col} className="mb-3" controlId="model1">
                                <Form.Label>Model 1 <span className="text-danger">*</span></Form.Label>
                                <Form.Control type="text" placeholder="Model 1" name="model1" value={custData.model1} onChange={handleChange} required />
                                <Form.Control.Feedback type="invalid">Please enter model 1.</Form.Control.Feedback>
                            </Form.Group>
                            <Form.Group as={Col} className="mb-3" controlId="supplier_name2">
                                <Form.Label>Supplier Name <span className="text-danger">*</span></Form.Label>
                                <Form.Control type="text" placeholder="Supplier Name" name="supplier_name2" value={custData.supplier_name2} onChange={handleChange} required />
                                <Form.Control.Feedback type="invalid">Please enter supplier name.</Form.Control.Feedback>
                            </Form.Group>
                        </Row>
                        <Row className="g-3">
                            <Form.Group as={Col} className="mb-3" controlId="warranty_extension">
                                <Form.Label>Warranty Extension <span className="text-danger">*</span></Form.Label>
                                <Form.Control type="text" placeholder="Negotiate More Than One Year" name="warranty_extension" value={custData.warranty_extension} onChange={handleChange} required />
                                <Form.Control.Feedback type="invalid">Please enter warranty Extension.</Form.Control.Feedback>
                            </Form.Group>
                            <Form.Group as={Col} className="mb-3" controlId="product_authenticity">
                                <Form.Label>Product Authenticity <span className="text-danger">*</span></Form.Label>
                                <Form.Control as="textarea" rows={2} placeholder='Verify Catlogue/Image/Video' name="product_authenticity" value={custData.product_authenticity} onChange={handleChange} required />
                                <Form.Control.Feedback type="invalid">Please enter Product Authenticity.</Form.Control.Feedback>
                            </Form.Group>
                            <Form.Group as={Col} className="mb-3" controlId="physical_verification">
                                <Form.Label>Physical Verification <span className="text-danger">*</span></Form.Label>
                                <Form.Control as="textarea" rows={2} placeholder="Physical Demo By Personal Visit" name="physical_verification" value={custData.physical_verification} onChange={handleChange} required />
                                <Form.Control.Feedback type="invalid">Please enter physical Verification.</Form.Control.Feedback>
                            </Form.Group>
                        </Row>
                        <Row className="g-3">
                            <Form.Group as={Col} className="mb-3" controlId="ready_stock_quantity">
                                <Form.Label>Ready Stock Quantity <span className="text-danger">*</span></Form.Label>
                                <Form.Control as="textarea" rows={2} placeholder='Confirm Ready Stock/Lead Time vs Quantity' name="ready_stock_quantity" value={custData.ready_stock_quantity} onChange={handleChange} required />
                                <Form.Control.Feedback type="invalid">Please enter Product Authenticity.</Form.Control.Feedback>
                            </Form.Group>
                            <Form.Group as={Col} className="mb-3" controlId="lead_time">
                                <Form.Label>Lead Time <span className="text-danger">*</span></Form.Label>
                                <Form.Control type="text" placeholder="Lead Time" name="lead_time" value={custData.lead_time} onChange={handleChange} required />
                                <Form.Control.Feedback type="invalid">Please enter Lead Time.</Form.Control.Feedback>
                            </Form.Group>
                            <Form.Group as={Col} className="mb-3" controlId="custvsvendcommitment">
                                <Form.Label>Cust Commitment Vs Vendor Commitment <span className="text-danger">*</span></Form.Label>
                                <Form.Control as="textarea" rows={2} placeholder="Scrutinies/Brand/Del Time/Warranty etc" name="custvsvendcommitment" value={custData.custvsvendcommitment} onChange={handleChange} required />
                                <Form.Control.Feedback type="invalid">Please enter Cust Commitment Vs Vendor Commitment.</Form.Control.Feedback>
                            </Form.Group>
                        </Row>
                        <Row className="g-3">
                            <Form.Group as={Col} className="mb-3" controlId="expiry">
                                <Form.Label>Expiry <span className="text-danger">*</span></Form.Label>
                                <Form.Control as="textarea" rows={2} placeholder='Medicine/Reagent/Food Products etc' name="expiry" value={custData.expiry} onChange={handleChange} required />
                                <Form.Control.Feedback type="invalid">Please enter expiry.</Form.Control.Feedback>
                            </Form.Group>
                            <Form.Group as={Col} className="mb-3" controlId="proformainvvsvendorqot">
                                <Form.Label>Proforma Invoice Vs Vendor Quote <span className="text-danger">*</span></Form.Label>
                                <Form.Control as="textarea" rows={2} placeholder="Scrutiny Product-Quantity-Condition-Rate-Del time etc" name="proformainvvsvendorqot" value={custData.proformainvvsvendorqot} onChange={handleChange} required />
                                <Form.Control.Feedback type="invalid">Please enter Proforma Invoice Vs Vendor Quote.</Form.Control.Feedback>
                            </Form.Group>
                            <Form.Group as={Col} className="mb-3" controlId="quantity1">
                                <Form.Label>Quantity1 <span className="text-danger">*</span></Form.Label>
                                <Form.Control type="number" placeholder="Quantity1" name="quantity1" value={custData.quantity1} min={0} onFocus={(e) => e.target.select()} onChange={handleChange} required />
                                <Form.Control.Feedback type="invalid">Please enter Quantity1.</Form.Control.Feedback>
                            </Form.Group>
                        </Row>
                        <Row className="g-3">
                            <Form.Group as={Col} className="mb-3" controlId="technicalspecipm">
                                <Form.Label>Technical Specification <span className="text-danger">*</span></Form.Label>
                                <Form.Control as="textarea" rows={2} placeholder='Match Cust vs Vendor Spec' name="technicalspecipm" value={custData.technicalspecipm} onChange={handleChange} required />
                                <Form.Control.Feedback type="invalid">Please enter Technical Specification.</Form.Control.Feedback>
                            </Form.Group>
                            <Form.Group as={Col} className="mb-3" controlId="productspecicrutiny">
                                <Form.Label>Product Specification Scrutiny <span className="text-danger">*</span></Form.Label>
                                <Form.Control as="textarea" rows={2} placeholder="Scrutinies/Brand/Del Time/Warranty etc" name="productspecicrutiny" value={custData.productspecicrutiny} onChange={handleChange} required />
                                <Form.Control.Feedback type="invalid">Please enter Product Specification Scrutiny.</Form.Control.Feedback>
                            </Form.Group>
                            <Form.Group as={Col} className="mb-3" controlId="condition1">
                                <Form.Label>Condition1 <span className="text-danger">*</span></Form.Label>
                                <Form.Select name="condition1" value={custData.condition1} onChange={handleSelectChange}>
                                    <option value="New">New</option>
                                    <option value="Used">Used</option>
                                    <option value="Refurb">Refurb</option>
                                </Form.Select>
                            </Form.Group>
                        </Row>
                        <Row className="g-3">
                            <Form.Group as={Col} className="mb-3" controlId="product_type1">
                                <Form.Label>ProductType1 <span className="text-danger">*</span></Form.Label>
                                <Form.Select name="product_type1" value={custData.product_type1} onChange={handleSelectChange}>
                                    <option value="Original">Original</option>
                                    <option value="Compactible">Compactible</option>
                                </Form.Select>
                            </Form.Group>
                            <Form.Group as={Col} className="mb-3" controlId="transportation_cost">
                                <Form.Label>Transportation Cost <span className="text-danger">*</span></Form.Label>
                                <Form.Control type="number" name="transportation_cost" placeholder='From vendor to our Premises' value={custData.transportation_cost} min={0} onFocus={(e) => e.target.select()} onChange={handleChange} required />
                                <Form.Control.Feedback type="invalid">Please enter transportation cost.</Form.Control.Feedback>
                            </Form.Group>
                            <Form.Group as={Col} className="mb-3" controlId="warrenty">
                                <Form.Label>Warranty <span className="text-danger">*</span></Form.Label>
                                <Form.Control type="text" placeholder="From vendor to our Premises" name="warrenty" value={custData.warrenty} onChange={handleChange} required />
                                <Form.Control.Feedback type="invalid">Please enter warranty.</Form.Control.Feedback>
                            </Form.Group>
                        </Row>
                        <Row className="g-3">
                            <Form.Group as={Col} className="mb-3" controlId="year_of_manufacturing1">
                                <Form.Label>Year Of Manufacturing 1 <span className="text-danger">*</span></Form.Label>
                                <Form.Control as="textarea" rows={2} placeholder="For Equipments" name="year_of_manufacturing1" value={custData.year_of_manufacturing1} onChange={handleChange} required />
                                <Form.Control.Feedback type="invalid">Please enter year of manufacturing 1.</Form.Control.Feedback>
                            </Form.Group>
                            <Form.Group as={Col} className="mb-3" controlId="packaging_cost">
                                <Form.Label>Packaging Cost <span className="text-danger">*</span></Form.Label>
                                <Form.Control type="text" placeholder="If Applicable" name="packaging_cost" value={custData.packaging_cost} onChange={handleChange} required />
                                <Form.Control.Feedback type="invalid">Please enter packaging cost.</Form.Control.Feedback>
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
    btId: number;
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
const SupplierAttachmentModal: React.FC<SupplierAttachmentModalProps> = ({ btId, onHide, onSuccess}) => {
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

        if (btId) {
            // Fetch supplier scrutiny Attachment data for editing
            axiosInstance.get(`/showPmAttachmentBt/${btId}`)
            .then(response => {
                setSuppAttachmentListing(response.data);
            })
            .catch(error => console.error('Error fetching supplier scrutiny Attachment data:', error));
        }
    }, [btId, refreshAttachData]);

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
        const apiCall = axiosInstance.post('/storePmAttachmentBt',{
            ...suppAttachment,
            business_task_id: btId
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

    const handleDownload = async (fileName: string) => {
        try {
            // Fetch the file from the server using the upload ID
            const response = await axiosInstance.get(`/getFileDownload?filepath=uploads/business-task/pm/${fileName}`, {
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
                axiosInstance.delete(`/deletePmAttachment/${suppAttachId}`)
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
                    <Modal.Title>Purchase Department Scrutiny Attachment</Modal.Title>
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
                                                        onClick={() => handleDownload(box.name)}
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
