import React, { useEffect, useState, ChangeEvent } from 'react';
import { useParams } from 'react-router-dom';
import { Form, ListGroup, Col, Row, Nav, Tab, Card } from 'react-bootstrap';
import Button from '../../../components/base/Button';
import axiosInstance from '../../../axios';
import ReactSelect from '../../../components/base/ReactSelect';
import swal from 'sweetalert';
import { useAuth } from '../../../AuthContext';
import { useNavigate } from 'react-router-dom';
import { downloadFile } from '../../../helpers/utils';

interface BusinessTaskEditData {
    id: number;
    date: Date;
    customer_name: string;
    segment: number;
    category: number;
    enquiry: string;
    task_status: string;
    inco_term: {
        id: number;
        inco_term: string;
    }
    freight_target_cost: string;
    port_of_unloading: string;
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
    date: Date;
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
    quotation_products: QuotationProducts[];
}
const EnquiryDetailsOLD = () => {
    const { btId } = useParams();
    const [refreshData, setRefreshData] = useState<boolean>(false);
    const [validated, setValidated] = useState<boolean>(false);
    const [loading, setLoading] = useState(false);
    const [businessTaskData, setBusinessTaskData] = useState<BusinessTaskEditData>({id: 0, date: new Date(), customer_name: '', segment: 0, category: 0, enquiry: '', task_status: '', inco_term: { id: 0, inco_term: '' }, freight_target_cost: '', port_of_unloading: '', shipment_mode: '', segments: { id: 0, name: ''}, categories: { id: 0, name: ''}});
    const [error, setError] = useState<string | null>(null);
    const [segmentsData, setSegmentsData] = useState<SegmentData[]>([]);
    const [quotationData, setQuotationData] = useState<QuotationData[]>([]);
    const [customersData, setCustomersData] = useState([]);
    const [categoryData, setCategoryData] = useState([]);
    const { userPermission } = useAuth(); //check userRole & permissions
    const [custData, setUserData] = useState<FormData>({ date: new Date(), customer_name: '', segment: 0, category: 0, enquiry: '', task_status: '', segment_name: {id: null, name: null}, category_name: null });
    const navigate = useNavigate();

    const handleSuccess = () => {
        // Refresh data or perform any other action after successful submission
        setRefreshData(prev => !prev); // Toggle state to trigger re-fetch
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
        fetchBTData();
    }, [refreshData]);

    useEffect(() => {
        const fetchSegment = async () => {
            try {
                const response = await axiosInstance.get('/segmentListing');
                if (response.status !== 200) {
                    throw new Error('Failed to fetch data');
                }
                const data: SegmentData[] = await response.data;
                setSegmentsData(data);
            } catch (err: any) {
                setError(err.message);
            } finally {
            }
        };
        const fetchCustomers = async () => {
            try {
                const response = await axiosInstance.get('/customerList');
                if (response.status !== 200) {
                    throw new Error('Failed to fetch data');
                }
                const data = await response.data;
                setCustomersData(data);
            } catch (err: any) {
                setError(err.message);
            } finally {
            }
        };

        fetchSegment();
        fetchCustomers();
    }, []);

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
                    <Tab.Pane eventKey="enquiry_details">
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
                                    <span key={quote.id} className='fw-semibold'> <Button variant='link' onClick={() => handlePDFclicked(quote.id, 'pdfWithSignatureQuotation')}>{quote.pi_number}</Button></span>
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
                        <Row className='mb-2 px-4'>
                            <Form noValidate validated={validated} onSubmit={handleSubmit}>
                                <Row className="my-3 g-3">
                                    <Form.Group as={Col} className="mb-0" controlId="date">
                                        <Form.Label>Date <span className="text-danger">*</span></Form.Label>
                                        <Form.Control type="date" name="date" value={custData.date} onChange={handleChange} required />
                                        <Form.Control.Feedback type="invalid">Please enter date.</Form.Control.Feedback>
                                    </Form.Group>
                                    <Form.Group as={Col} className="mb-0" controlId="customer_name">
                                        <Form.Label>Customer Name <span className="text-danger">*</span></Form.Label>
                                        <ReactSelect
                                            options= {customersData.map((option: SegmentData) => (
                                                { value: option.name, label: option.name }
                                            ))}
                                            placeholder="Select Customer Name" name="customer_name" value={custData.customer_name ? { value: custData.customer_name, label: custData.customer_name } : null} onChange={(selectedOption) => handleRSelect(selectedOption, 'customer_name')} required
                                        />
                                        <Form.Control.Feedback type="invalid">Please enter Customer Name</Form.Control.Feedback>
                                    </Form.Group>
                                    <Form.Group as={Col} className="mb-0" controlId="segment_name">
                                        <Form.Label>Segment <span className="text-danger">*</span></Form.Label>
                                        <ReactSelect
                                            options= {segmentsData.map((option: SegmentData) => (
                                                { value: option.id, label: option.name }
                                            ))}
                                            placeholder="Select segment" name="segment_name" value={custData.segment_name ? {value: custData.segment_name.id, label: custData.segment_name.name } : null} onChange={(selectedOption) => handleRSelect(selectedOption, 'segment_name')} required
                                        />
                                        <Form.Control type="hidden" name="segment" value={custData.segment} />
                                        {validated && !custData.segment && (
                                            <div className="invalid-feedback d-block">Please enter segment</div>
                                        )}
                                    </Form.Group>
                                </Row>
                                <Row className="mb-3 g-3">
                                    <Form.Group as={Col} className="mb-0" controlId="category_name">
                                        <Form.Label>Category <span className="text-danger">*</span></Form.Label>
                                        <ReactSelect
                                            options= {categoryData.map((option: CategoryData) => (
                                                { value: option.id, label: option.name }
                                            ))}
                                            placeholder="Select Category" name="category_name" value={custData.category_name ? {value: custData.category_name.id, label: custData.category_name.name } : null} onChange={(selectedOption) => handleRSelect(selectedOption, 'category_name')} required
                                        />
                                        <Form.Control type="hidden" name="category" value={custData.category} />
                                        {validated && !custData.category && (
                                            <div className="invalid-feedback d-block">Please enter category</div>
                                        )}
                                    </Form.Group>
                                    <Form.Group as={Col} className="mb-0" controlId="enquiry">
                                        <Form.Label>Enquiry</Form.Label>
                                        <Form.Control as="textarea" rows={1} name="enquiry" value={custData.enquiry} onChange={handleChange}/>
                                    </Form.Group>
                                    <Form.Group as={Col} className="mb-0" controlId="task_status">
                                        <Form.Label>Task Status</Form.Label>
                                        <Form.Select name="task_status" value={custData.task_status} onChange={handleSelectChange}>
                                            <option value="">Select</option>
                                            <option value="Not started">Not started</option>
                                            <option value="In progress">In progress</option>
                                            <option value="Lost">Lost</option>
                                            <option value="On Hold">On Hold</option>
                                            <option value="Won">Won</option>
                                        </Form.Select>
                                    </Form.Group>
                                </Row>
                                <Row className="mb-3 g-3">
                                    <Col className='justify-content-center d-flex'>
                                        <Button variant="success" loading={loading} loadingPosition="start" type="submit">Save</Button>
                                    </Col>
                                </Row>
                            </Form>
                        </Row>
                        </Card>
                    </Tab.Pane>
                </Tab.Content>
            </Tab.Container>
        </>
    )
};

export default EnquiryDetailsOLD;

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
