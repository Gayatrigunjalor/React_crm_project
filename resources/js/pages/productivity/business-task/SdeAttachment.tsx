import React, { useEffect, useState, ChangeEvent } from 'react';
import { useParams } from 'react-router-dom';
import { Form, ListGroup, Modal, Col, Row, Nav, Tab, Card } from 'react-bootstrap';
import { faCirclePlus, faPlus, faEdit, faPenClip, faTrash, faDownload } from '@fortawesome/free-solid-svg-icons';
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
import { handlePDFclicked } from './EnquiryDetails';

interface Params {
    btId: number;
}
interface BusinessTaskEditData {
    id: number;
    customer_name: string;
    inco_term: {
        id: number;
        inco_term: string;
    }
    freight_target_cost: string;
    port_of_unloading: string;
    shipment_mode: string;
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

interface SdeAttachmentData {
    id: number;
    name: string;
    attachment_name: string;
    attachment_details: string;
    business_task_id: number;
}
const SdeAttachment = () => {
    const { btId } = useParams();
    const [refreshData, setRefreshData] = useState<boolean>(false);
    const [businessTaskData, setBusinessTaskData] = useState<BusinessTaskEditData>({id: 0, customer_name: '',  inco_term: { id: 0, inco_term: '' }, freight_target_cost: '', port_of_unloading: '',shipment_mode: ''});
    const [quotationData, setQuotationData] = useState<QuotationData[]>([]);
    const [sdeAttachment, setSdeAttachment] = useState<SdeAttachmentData[]>([]);
    const [error, setError] = useState<string | null>(null);
    const [showModal, setShowModal] = useState<boolean>(false); //modal
    const [selectedSdeId, setSelectedSdeId] = useState<number | undefined>(undefined);
    const { userPermission } = useAuth(); //check userRole & permissions
    const navigate = useNavigate();

    const handleShow = (sdeId?: number) => {
        setSelectedSdeId(sdeId);
        setShowModal(true);
    };

    const handleClose = () => setShowModal(false);
    useEffect(() => {
        const fetchBTData = async () => {
            try {
                const response = await axiosInstance.get(`/business-task/${btId}`);
                if (response.status !== 200) {
                    throw new Error('Failed to fetch data');
                }
                const data: BusinessTaskEditData = await response.data.businessTask;
                const quotation_data: QuotationData[] = await response.data.quotations;
                setBusinessTaskData(data);
                setQuotationData(quotation_data);
            } catch (err: any) {
                setError(err.data.message);
            }
        };
        const fetchSdeData = async() => {
            try {
                const response = await axiosInstance.get(`/sdeAttachmentListing/${btId}`);
                if (response.status !== 200) {
                    throw new Error('Failed to fetch data');
                }
                const data: SdeAttachmentData[] = await response.data;
                setSdeAttachment(data);
            } catch (err: any) {
                setError(err.data.message);
            }
        };

        fetchBTData();
        fetchSdeData();
    }, [refreshData]);

    const handleSuccess = () => {
        // Refresh data or perform any other action after successful submission
        setRefreshData(prev => !prev); // Toggle state to trigger re-fetch
    };

    const handleDelete = (sdeId: number) => {
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
                axiosInstance.delete(`/deleteSdeAttachment`, {
                    data: {
                        id: sdeId
                    }
                })
                .then(response => {
                    swal("Success!", response.data.message, "success");
                    handleSuccess();
                })
                .catch(error => {
                    swal("Error!", error.data.message, "error");
                });
            } else {
                swal("Your record is safe!");
            }
        });
    };

    const table = useAdvanceTable({
        data: sdeAttachment,
        columns: sdeAttachmentTableColumns(handleShow, handleDelete),
        pageSize: 10,
        pagination: true,
        sortable: true,
        selection: false,
        initialState: {
            columnVisibility: {

            }
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
            <Tab.Container id="basic-tabs-example" defaultActiveKey="sde_worksheet" onSelect={handleSelect}>
                <Row>
                    <Col>
                        <Nav variant="underline" className='ps-2 bg-body-secondary g-2'>
                            <Nav.Item>
                                <Nav.Link eventKey="enquiry_details" className='fs-8'>Enquiry Details</Nav.Link>
                            </Nav.Item>
                            <Nav.Item>
                                <Nav.Link eventKey="sde_worksheet" className='fs-8'>SDE Attachment</Nav.Link>
                            </Nav.Item>
                            <Nav.Item>
                                <Nav.Link eventKey="logistics_instruction" className='fs-8'>Logistics Instruction</Nav.Link>
                            </Nav.Item>
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
                    <Tab.Pane eventKey="sde_worksheet">
                        <Row className='mb-2 px-4'>
                            <Col className='bg-white border-bottom py-1'>
                                Customer Name: <span className='fw-semibold'> { businessTaskData.customer_name ?? '' } </span>
                            </Col>
                        </Row>
                        <Row className='mb-2 px-4'>
                            <Col className='bg-white border-bottom py-1'>
                                Inco Term: <span className='fw-semibold'> { businessTaskData.inco_term ? businessTaskData.inco_term.inco_term : '' } </span>
                            </Col>
                            <Col className='bg-white border-bottom py-1'>
                                Freight Target Cost: <span className='fw-semibold'> { businessTaskData.freight_target_cost } </span>
                            </Col>
                            <Col className='bg-white border-bottom py-1'>
                                Port Of Unloading: <span className='fw-semibold'> { businessTaskData.port_of_unloading } </span>
                            </Col>
                            <Col className='bg-white border-bottom py-1'>
                                Shipment Mode: <span className='fw-semibold'> { businessTaskData.shipment_mode } </span>
                            </Col>
                        </Row>
                        <Row className='mb-2 px-4'>
                            <Col className='bg-white border-bottom py-1'>
                                PI No(s): {quotationData.length > 0 && quotationData.map((quote: QuotationData) => (
                                    <span key={quote.id} className='fw-semibold'> <Button variant='link' onClick={() => handlePDFclicked(quote.id, 'pdfWithSignatureQuotation')}>{quote.pi_number}</Button> </span>
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
                            <Row className='m-2 p-4'>
                                <Col className='mb-3 d-flex justify-content-end'>
                                    <Button
                                        variant="primary"
                                        className=""
                                        startIcon={<FontAwesomeIcon icon={faPenClip} className="me-2" />}
                                        onClick={() => handleShow()}
                                    >
                                        Add Sde Attachment
                                    </Button>
                                </Col>
                                <AdvanceTableProvider {...table}>
                                    <SdeAttachmentTable />
                                </AdvanceTableProvider>
                            </Row>
                        </Card>
                    </Tab.Pane>

                </Tab.Content>
            </Tab.Container>

            {showModal && (
                <SdeModal sdeId={selectedSdeId} onHide={handleClose} onSuccess={handleSuccess} />
            )}


        </>
    )
};

export default SdeAttachment;

const sdeAttachmentTableColumns = (handleShow: (userId?: number) => void, handleDelete: (userId: number) => void): ColumnDef<SdeAttachmentData>[] => [
    {
        accessorKey: 'attachment_name',
        header: () => {
            return (
                <div className="d-inline-flex flex-center">
                    <span>Attachment Name</span>
                </div>
            );
        },
        cell: ({ row: { original } }) => {
            const { attachment_name } = original;
            return (
                <span>{attachment_name}</span>
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
        accessorKey: 'name',
        header: () => {
            return (
                <div className="d-inline-flex flex-center">
                    <span>Attachment</span>
                </div>
            );
        },
        cell: ({ row: { original } }) => {
            const { name } = original;
            return (
                <span>{name}</span>
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
        id: 'attachment_details',
        header: () => {
            return (
                <div className="d-inline-flex flex-center">
                    <span>Details</span>
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
        accessorFn: ({ attachment_details }) => attachment_details
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
            const { id, attachment_name } = original;
            const { userPermission } = useAuth(); //check userRole & permissions
            return (
                <>
                    {attachment_name != 'Proforma Invoice' && (
                        <Button className='text-info' variant='link' title='Download' onClick={() => handleShow(id)} startIcon={<FontAwesomeIcon icon={faDownload} />}></Button>
                    )}
                    {userPermission.business_task_edit == 1 && (
                        <Button className='text-success' variant='link' title='Edit SDE record' onClick={() => handleShow(id)} startIcon={<FontAwesomeIcon icon={faEdit} />}></Button>
                    )}
                    {userPermission.business_task_delete == 1 && (
                        <Button className='text-danger' variant='link' title='Delete SDE record' onClick={() => handleDelete(id)} startIcon={<FontAwesomeIcon icon={faTrash} />}></Button>
                    )}
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

const SdeAttachmentTable = () => {
    return (
        <div className="border-top border-translucent">
            <AdvanceTable
                tableProps={{ className: 'phoenix-table fs-9' }}
                rowClassName="hover-actions-trigger btn-reveal-trigger"
            />
            <AdvanceTableFooter pagination className="py-2" />
        </div>
    );
};

interface SdeModalProps {
    sdeId?: number;
    onHide: () => void;
    onSuccess: () => void;
}

interface PiListingData {
    id: number;
    pi_number: string;
    pi_date: string;
}
interface FormData {
    id?: number;
    attachment_name: string;
    attachment_details: string;
    inorbvict_commitment: string;
    name: File | null;
    attachment_title?: string;
    quotation: { id: number; pi_number: string; } | null;
}

const SdeModal: React.FC<SdeModalProps> = ({ sdeId, onHide, onSuccess}) => {
    const { btId } = useParams();
    const [custData, setUserData] = useState<FormData>({ id: 0, quotation: null, attachment_name: '', attachment_details: '', inorbvict_commitment: '', name: null });
    const [piListingData, setPiListingData] = useState<PiListingData[]>([]);
    const [isEditing, setIsEditing] = useState<boolean>(false);
    const [validated, setValidated] = useState<boolean>(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const { empData } = useAuth(); //check userRole & permissions

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setUserData({ ...custData, [name]: value });
    };
    const handleSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const { name, value } = e.target;
        setUserData({ ...custData, [name]: value });
    };

    useEffect(() => {

        if (sdeId) {
            setIsEditing(true);
            // Fetch sde data for editing
            axiosInstance.get(`/showSdeAttachmentBt/${sdeId}`)
            .then(response => {
                setUserData(response.data);
            })
            .catch(error => console.error('Error fetching sde data:', error));
        }
    }, [sdeId]);

    //fetch all listing data
    useEffect(() => {
        const fetchPiListing = async () => {
                try {
                    const response = await axiosInstance.get(`/piListing`);
                    if (response.status !== 200) {
                        throw new Error('Failed to fetch data');
                    }
                    const data: PiListingData[] = response.data;
                    setPiListingData(data);
                } catch (err: any) {
                    setError(err.data.message);
                }
            };
        fetchPiListing();
    }, []);

    // Handler function for the file input change event
    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files ? event.target.files[0] : null;
        setUserData({ ...custData, name: file });
    };

    const handleProformaSelect = (selectedOption: any) => {
        if (selectedOption) {
            setUserData(prev => ({
                ...prev,
                quotation: { id: selectedOption.value, pi_number: selectedOption.label },
                attachment_details: selectedOption.value
            }));
        }
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
            ? axiosInstance.post(`/updateSdeAttachmentBt`, {
                business_task_id: btId,
                sde_id: sdeId,
                name : custData.name,
                attachment_name : custData.attachment_name,
                attachment_details : custData.attachment_details,
                inorbvict_commitment : custData.inorbvict_commitment,
            }, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            })
            : axiosInstance.post('/storeSdeAttachmentBt', {
                ...custData,
                business_task_id: btId
            }, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            } );

        apiCall
            .then((response) => {
                swal("Success!", response.data.message, "success");
            onSuccess();
            onHide();
        })
        .catch(error => swal("Error!", error.data.message, "error"))
        .finally(() => { setLoading(false); });
    };

    if (error) return <div>Error: {error}</div>;

    return (
        <>
            <Modal show onHide={onHide} size="xl" backdrop="static" keyboard={false}>
                <Modal.Header closeButton>
                    <Modal.Title>{isEditing ? 'Edit Employees' : 'Add Employees'}</Modal.Title>
                </Modal.Header>
                <Form noValidate validated={validated} onSubmit={handleSubmit}>
                    <Modal.Body>
                        <Form.Control type="hidden" name="id" value={custData.id} />
                        <Row className="mb-3 g-3">
                            <Form.Group as={Col} className="mb-3" controlId="attachment_name">
                                <Form.Label>Attachment Name </Form.Label>
                                <Form.Select name="attachment_name" value={custData.attachment_name} onChange={handleSelectChange} required>
                                    <option value="">Select Status</option>
                                    <option value="Payment receipt attachment -Goes to Sales">Payment receipt / proof of payment</option>
                                    <option value="Proforma Invoice">Proforma Invoice</option>
                                </Form.Select>
                                <Form.Control.Feedback type="invalid">Please enter attachment name</Form.Control.Feedback>
                            </Form.Group>
                            {custData.attachment_name != 'Proforma Invoice' ? (
                                <>
                                    <Form.Group as={Col} className="mb-3" controlId="name">
                                        <Form.Label>Details <span className="text-danger">*</span></Form.Label>
                                        <Form.Control type="text" placeholder="Details" name="attachment_details" value={custData.attachment_details} onChange={handleChange} required />
                                        <Form.Control.Feedback type="invalid">Please enter details.</Form.Control.Feedback>
                                    </Form.Group>
                                    <Form.Group as={Col} controlId="name">
                                        <Form.Label>Attachment <span className="text-danger">*</span></Form.Label>
                                        <Form.Control type="file" name="filename" onChange={handleFileChange} required={!isEditing} />
                                        <Form.Control.Feedback type="invalid">Please enter attachment.</Form.Control.Feedback>
                                    </Form.Group>
                                    {isEditing && (<span className='text-danger'>Uploaded Attachment :- {custData.attachment_title ? custData.attachment_title : ''} </span>)}
                                </>
                            ) : (
                                <Form.Group as={Col} className="mb-3" controlId="quotation">
                                    <Form.Label>Proforma Invoice Number <span className="text-danger">*</span></Form.Label>
                                    <ReactSelect
                                        options= {piListingData.map((option: PiListingData) => (
                                            { value: option.id, label: option.pi_number }
                                        ))}
                                        placeholder="Select PI Number" name="quotation" value={custData.quotation ? { value: custData.quotation.id, label: custData.quotation.pi_number } : null} required onChange={(selectedOption) => handleProformaSelect(selectedOption)} />
                                    <Form.Control type="hidden" name="attachment_details" value={custData.attachment_details} />
                                    {validated && !custData.quotation && (
                                        <div className="invalid-feedback d-block">Please enter proforma invoice number</div>
                                    )}
                                </Form.Group>
                            )}
                        </Row>
                        <Row className="mb-3 g-3">
                            <Form.Group as={Col} className="mb-3" controlId="inorbvict_commitment">
                                <Form.Label>Inorbvict Commitment</Form.Label>
                                <Form.Control as="textarea" rows={3} placeholder="Inorbvict commitment" name="inorbvict_commitment" value={custData.inorbvict_commitment} onChange={handleChange} required/>
                                <Form.Control.Feedback type="invalid">Please enter inorbvict commitment.</Form.Control.Feedback>
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
