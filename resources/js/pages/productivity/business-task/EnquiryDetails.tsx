import React, { useEffect, useState, ChangeEvent } from 'react';
import { useParams } from 'react-router-dom';
import { Form, ListGroup, Modal, Col, Row, Nav, Tab, Card } from 'react-bootstrap';
import Button from '../../../components/base/Button';
import axiosInstance from '../../../axios';
import ReactSelect from '../../../components/base/ReactSelect';
import swal from 'sweetalert';
import { useAuth } from '../../../AuthContext';
import { useNavigate } from 'react-router-dom';
import { downloadFile } from '../../../helpers/utils';
import { ColumnDef } from '@tanstack/react-table';
import useAdvanceTable from '../../../hooks/useAdvanceTable';
import AdvanceTableProvider from '../../../providers/AdvanceTableProvider';
import AdvanceTable from '../../../components/base/AdvanceTable';
import AdvanceTableFooter from '../../../components/base/AdvanceTableFooter';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCirclePlus, faPlus, faEdit, faPenClip, faTrash, faDownload } from '@fortawesome/free-solid-svg-icons';

interface BusinessTaskEditData {
    id: number;
    date: string;
    opportunity_id?: string;
    opportunity_date?: string;
    customer_name: string;
    shipping_liabelity?: string;
    cold_chain?: string;
    final_destination?: string;
    destination_code?: string;
    freight_target_cost?: string;
    port_of_unloading?: string;
    segment: number;
    category: number;
    enquiry: string;
    task_status: string;
    inco_term: {
        id: number;
        inco_term: string;
    }
    shipment_mode: string;
    segments: {
        id: number;
        name: string;
    }
    categories: {
        id: number;
        name: string;
    }
}

interface FormData {
    id?: number;
    date: string;
    customer_name: string;
    segment: number;
    category: number;
    enquiry: string;
    task_status: string;
    segment_name: {
        id: number | null;
        name: string | null;
    };

    category_name:  {
        id: number;
        name: string;
    } | null;

}

interface SegmentData {
    id: number;
    name: string;
}

interface CategoryData {
    id: number;
    name: string;
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
    pi_date: string;
    quotation_products: QuotationProducts[];
}
interface SdeAttachmentData {
    id: number;
    name: string;
    attachment_name: string;
    attachment_details: string;
    business_task_id: number;
}
const EnquiryDetails = () => {
    const { btId } = useParams();
    const [refreshData, setRefreshData] = useState<boolean>(false);
    const [validated, setValidated] = useState<boolean>(false);
    const [loading, setLoading] = useState(false);
    const [businessTaskData, setBusinessTaskData] = useState<BusinessTaskEditData>({id: 0, date: '', customer_name: '', segment: 0, category: 0, enquiry: '', task_status: '', inco_term: { id: 0, inco_term: '' }, freight_target_cost: '', port_of_unloading: '', shipment_mode: '', segments: { id: 0, name: ''}, categories: { id: 0, name: ''}});
    const [error, setError] = useState<string | null>(null);
    const [segmentsData, setSegmentsData] = useState<SegmentData[]>([]);
    const [quotationData, setQuotationData] = useState<QuotationData[]>([]);
    const [sdeAttachment, setSdeAttachment] = useState<SdeAttachmentData[]>([]);
    const [customersData, setCustomersData] = useState([]);
    const [categoryData, setCategoryData] = useState([]);
    const [showModal, setShowModal] = useState<boolean>(false); //modal
    const [showCustomerModal, setShowCustomerModal] = useState<boolean>(false); //modal
    const [selectedBtId, setSelectedBtId] = useState<number>(0);
    const [selectedCustomerName, setSelectedCustomerName] = useState<string>('');
    const [selectedSdeId, setSelectedSdeId] = useState<number | undefined>(undefined);
    const { userPermission } = useAuth(); //check userRole & permissions
    const [custData, setUserData] = useState<FormData>({ date: '', customer_name: '', segment: 0, category: 0, enquiry: '', task_status: '', segment_name: {id: null, name: null}, category_name: null });
    const navigate = useNavigate();

    const handleSuccess = () => {
        // Refresh data or perform any other action after successful submission
        setRefreshData(prev => !prev); // Toggle state to trigger re-fetch
        setShowCustomerModal(false);
    };

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
                setUserData({ ...custData, customer_name: data.customer_name, date: data.date, segment: data.segment, category: data.category, enquiry: data.enquiry, task_status: data.task_status, segment_name: {id: data.segments?.id, name: data.segments?.name}, category_name: {id: data.categories?.id, name: data.categories?.name} });
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
        fetchSdeData();
        fetchBTData();
    }, [refreshData]);

    // useEffect(() => {
    //     const fetchSegment = async () => {
    //         try {
    //             const response = await axiosInstance.get('/segmentListing');
    //             if (response.status !== 200) {
    //                 throw new Error('Failed to fetch data');
    //             }
    //             const data: SegmentData[] = await response.data;
    //             setSegmentsData(data);
    //         } catch (err: any) {
    //             setError(err.message);
    //         } finally {
    //         }
    //     };
    //     const fetchCustomers = async () => {
    //         try {
    //             const response = await axiosInstance.get('/customerList');
    //             if (response.status !== 200) {
    //                 throw new Error('Failed to fetch data');
    //             }
    //             const data = await response.data;
    //             setCustomersData(data);
    //         } catch (err: any) {
    //             setError(err.message);
    //         } finally {
    //         }
    //     };

    //     fetchSegment();
    //     fetchCustomers();
    // }, []);

    const handleCustomerShow = (btId: number, custName: string) => {
        setSelectedBtId(btId);
        setSelectedCustomerName(custName);
        setShowCustomerModal(true);
    };
    const handleShow = (sdeId?: number) => {
        setSelectedSdeId(sdeId);
        setShowModal(true);
    };

    const handleCustomerClose = () => setShowCustomerModal(false);
    const handleClose = () => setShowModal(false);

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

    const handleDownload = async (path: string, fileName: string) => {
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

    const table = useAdvanceTable({
        data: sdeAttachment,
        columns: sdeAttachmentTableColumns(handleShow, handleDelete, handleDownload),
        pageSize: 10,
        pagination: true,
        sortable: true,
        selection: false,
        initialState: {
            columnVisibility: {

            }
        }
    });

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
        const apiCall = axiosInstance.post('/updateEnquiryDetailsBt',{
            ...custData,
            business_task_id: btId
        });

        apiCall.then((response) => {
                swal("Success!", response.data.message, "success");
                handleSuccess();
        }).catch(error => swal("Error!", error.data.message, "error"))
        .finally(() => { setLoading(false); });
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setUserData({ ...custData, [name]: value });
    };

    const handleRSelect = (selectedOption: { value: number; label: string } | null, fieldName: string) => {
        if (selectedOption) {
            if(fieldName == 'segment_name') {
                setUserData({ ...custData, segment_name: {
                    id: selectedOption.value,
                    name: selectedOption.label
                }, segment: selectedOption.value, category_name: null, category: 0});
                setCategoryData([]);
                axiosInstance.get(`/getCategories?segment_id=${selectedOption.value}`)
                .then(response => {
                    setCategoryData(response.data);
                });
            }
            if(fieldName == 'category_name') {
                setUserData({ ...custData, category_name: {
                    id: selectedOption.value,
                    name: selectedOption.label
                }, category: selectedOption.value });
            }
            if(fieldName == 'customer_name') {
                setUserData({ ...custData, customer_name: selectedOption.label});
            }

        } else {
            setUserData({ ...custData, [fieldName]: null });
        }
    };

    const handleSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const { name, value } = e.target;
        setUserData({ ...custData, [name]: value });
    };

    if (error) return <div>Error: {error}</div>;

    return (
        <>
            <h2 className="mb-5">Inter Departmental Collaboration | BT Id : { btId }</h2>
            <Tab.Container id="basic-tabs-example" defaultActiveKey="enquiry_details" onSelect={handleSelect}>
                <Row>
                    <Col>
                        <Nav variant="underline" className='ps-2 bg-body-secondary g-2'>
                            <Nav.Item>
                                <Nav.Link eventKey="enquiry_details" className='fs-8'>Sales Worksheet</Nav.Link>
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
                    <Tab.Pane eventKey="enquiry_details">
                        <Card>
                            <Card.Body>
                                <Row className='mb-2 px-4'>
                                    <Col className='py-1'>
                                        Opp ID: <span className='fw-semibold'> { businessTaskData.opportunity_id ?? '' } </span>
                                    </Col>
                                    <Col className='py-1'>
                                        Opp Date: <span className='fw-semibold'> { businessTaskData.opportunity_date ?? '' } </span>
                                    </Col>
                                    <Col className='py-1'>
                                        BT ID: <span className='fw-semibold'> { businessTaskData.id ?? '' } </span>
                                    </Col>
                                    <Col className='py-1'>
                                        BT Date: <span className='fw-semibold'> { businessTaskData.date ?? '' } </span>
                                    </Col>
                                </Row>
                                <Row className='mb-2 px-4 mt-5'>
                                    <h4 className='fs-7'>Inquiry Details:</h4>
                                </Row>
                                <Row className='mb-2 px-4'>
                                    <Col className='d-flex align-items-center'>
                                        Customer Name: <span className='fw-semibold ms-1'> { businessTaskData.customer_name ?? '' } </span> <span className='ms-4'><Button className='text-success p-0' variant='link' title='Edit customer name' onClick={() => handleCustomerShow(btId, businessTaskData.customer_name)} startIcon={<FontAwesomeIcon icon={faEdit} />}></Button></span>
                                    </Col>
                                </Row>
                                <Row className='mb-2 px-4'>
                                    <Col className='py-1'>
                                        PI No(s): {quotationData.length > 0 && quotationData.map((quote: QuotationData) => (
                                            <React.Fragment key={quote.id}>
                                                <span className='fw-semibold'> <Button variant='link' onClick={() => handlePDFclicked(quote.id, 'pdfWithSignatureQuotation')}>{quote.pi_number}</Button></span>
                                                <span className='ms-4'>PI Date: <b>{quote.pi_date}</b></span>
                                            </React.Fragment>
                                        ))}
                                    </Col>
                                </Row>
                                <Row className='mb-2 px-4 mt-5'>
                                    <h4 className='fs-7'>Logistics Instruction:</h4>
                                </Row>
                                <Row className='mb-2 px-4'>
                                    <Col className='py-1'>
                                        Shipping Liability: <span className='fw-semibold'> { businessTaskData.shipping_liabelity } </span>
                                    </Col>
                                    <Col className='py-1'>
                                        Cold Chain: <span className='fw-semibold'> { businessTaskData.cold_chain } </span>
                                    </Col>
                                    <Col className='py-1'>
                                        Final Destination: <span className='fw-semibold'> { businessTaskData.final_destination } </span>
                                    </Col>
                                </Row>
                                <Row className='mb-2 px-4'>
                                    <Col className='py-1'>
                                        Zip code: <span className='fw-semibold'> { businessTaskData.destination_code } </span>
                                    </Col>
                                    <Col className='py-1'>
                                        Freight Target Cost: <span className='fw-semibold'> { businessTaskData.freight_target_cost } </span>
                                    </Col>
                                    <Col className='py-1'>
                                        Port Of Unloading: <span className='fw-semibold'> { businessTaskData.port_of_unloading } </span>
                                    </Col>
                                </Row>
                                <Row className='mb-2 px-4'>
                                    <Col className='py-1'>
                                        Shipment Mode: <span className='fw-semibold'> { businessTaskData.shipment_mode } </span>
                                    </Col>
                                    <Col className='py-1'>
                                        Inco Term: <span className='fw-semibold'> { businessTaskData.inco_term ? businessTaskData.inco_term.inco_term : '' } </span>
                                    </Col>
                                    <Col className='py-1'></Col>
                                </Row>
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
                            </Card.Body>
                        </Card>
                    </Tab.Pane>
                </Tab.Content>
            </Tab.Container>
            {showModal && (
                <SdeModal sdeId={selectedSdeId} onHide={handleClose} onSuccess={handleSuccess} />
            )}
            {showCustomerModal && (
                <CustomerModal btId={selectedBtId} custName={selectedCustomerName} onHide={handleCustomerClose} onSuccess={handleSuccess} />
            )}
        </>
    )
};

export default EnquiryDetails;

const sdeAttachmentTableColumns = (handleShow: (userId?: number) => void, handleDelete: (userId: number) => void, handleDownload: (path: string, fileName: string) => void): ColumnDef<SdeAttachmentData>[] => [
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
            const { id, attachment_name, name } = original;
            const { userPermission } = useAuth(); //check userRole & permissions
            return (
                <>
                    {attachment_name != 'Proforma Invoice' && (
                        <Button className='text-info' variant='link' title='Download' onClick={() => handleDownload('uploads/business-task/sde', name)} startIcon={<FontAwesomeIcon icon={faDownload} />}></Button>
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


interface CustomerModalProps {
    btId: number;
    custName: string;
    onHide: () => void;
    onSuccess: () => void;
}
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
interface SdeFormData {
    id?: number;
    attachment_name: string;
    attachment_details: string;
    inorbvict_commitment: string;
    name: File | null;
    attachment_title?: string;
    quotation: { id: number; pi_number: string; } | null;
}

interface CustomerFormData {
    id?: number;
    customer_name: string;
}

const CustomerModal: React.FC<CustomerModalProps> = ({btId, custName, onHide, onSuccess}) => {
    const [custData, setUserData] = useState<CustomerFormData>({id: btId, customer_name: custName});
    const [validated, setValidated] = useState<boolean>(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
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
        const apiCall = axiosInstance.post('/updateEnquiryDetailsBt',{
            ...custData,
            business_task_id: btId
        });

        apiCall.then((response) => {
                swal("Success!", response.data.message, "success");
                onSuccess();
        }).catch(error => swal("Error!", error.data.message, "error"))
        .finally(() => { setLoading(false); });
    };

    if (error) return <div>Error: {error}</div>;

    return (
        <>
            <Modal show onHide={onHide} size="sm" backdrop="static" keyboard={false}>
                <Modal.Header closeButton>
                    <Modal.Title>Edit Customer</Modal.Title>
                </Modal.Header>
                <Form noValidate validated={validated} onSubmit={handleSubmit}>
                    <Modal.Body>
                        <Row className="my-3 g-3">
                            <Form.Group as={Col} className="mb-0" controlId="customer_name">
                                <Form.Label>Customer Name <span className="text-danger">*</span></Form.Label>
                                <Form.Control type="text" placeholder="Customer Name" name="customer_name" value={custData.customer_name} onChange={handleChange} required />
                                <Form.Control.Feedback type="invalid">Please enter Customer Name</Form.Control.Feedback>
                            </Form.Group>
                        </Row>
                    </Modal.Body>
                    <Modal.Footer>
                        <Button variant="secondary" onClick={onHide}>
                            Close
                        </Button>
                        <Button variant="primary" loading={loading} loadingPosition="start" type="submit">Update</Button>
                    </Modal.Footer>
                </Form>
            </Modal>
        </>
    )
}

const SdeModal: React.FC<SdeModalProps> = ({ sdeId, onHide, onSuccess}) => {
    const { btId } = useParams();
    const [custData, setUserData] = useState<SdeFormData>({ id: 0, quotation: null, attachment_name: '', attachment_details: '', inorbvict_commitment: '', name: null });
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
                    <Modal.Title>{isEditing ? 'Edit Attachments' : 'Add Attachments'}</Modal.Title>
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

export const handlePDFclicked = async (quoteId: number, path: string) => {
    try {
        // Fetch the file from the server using the ID
        const response = await axiosInstance.get(`/${path}/${quoteId}`, {
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
}
