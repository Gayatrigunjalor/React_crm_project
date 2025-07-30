import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Form, ListGroup, Col, Row, Nav, Tab, Card } from 'react-bootstrap';
import Button from '../../../components/base/Button';
import axiosInstance from '../../../axios';
import ReactSelect from '../../../components/base/ReactSelect';
import swal from 'sweetalert';
import { useAuth } from '../../../AuthContext';
import { useNavigate } from 'react-router-dom';
import { handlePDFclicked } from './EnquiryDetails';

interface Params {
    btId: number;
}
interface IncoTermData{
    id: number;
    inco_term: string;
}
interface BusinessTaskEditData {
    id: number;
    customer_name: string;
    inco_term_id: number;
    inco_term: IncoTermData;
    freight_target_cost: string;
    port_of_unloading: string;
    shipment_mode: [];
    shipping_liabelity: string;
    cold_chain: string;
    final_destination: string;
    destination_code: string;
    comments: string;
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
const LogisticsInstruction = () => {
    const { btId } = useParams();
    const [refreshData, setRefreshData] = useState<boolean>(false);
    const [businessTaskData, setBusinessTaskData] = useState<BusinessTaskEditData>({id: 0, customer_name: '', inco_term_id: 0, inco_term: { id: 0, inco_term: '' }, freight_target_cost: '', port_of_unloading: '', shipment_mode: [], shipping_liabelity: '', cold_chain: '', final_destination: '', destination_code: '', comments: '' });
    const [quotationData, setQuotationData] = useState<QuotationData[]>([]);
    const [incoTermData, setIncoTermData] = useState<IncoTermData[]>([]);
    const [error, setError] = useState<string | null>(null);
    const [validated, setValidated] = useState<boolean>(false);
    const [loading, setLoading] = useState(false);

    const [selectedOptions, setSelectedOptions] = useState([]);
    const { userPermission } = useAuth(); //check userRole & permissions
    const navigate = useNavigate();
    const shipmentOptions = [
        { value: 'Air', label: 'Air' },
        { value: 'Water', label: 'Water' },
        { value: 'Road', label: 'Road' },
        { value: 'Train', label: 'Train' },
    ];

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

                const modes = data.shipment_mode.split(','); // ["Road", "Train"]

                // Map the modes to the corresponding shipment options
                const selected = shipmentOptions.filter(option => modes.includes(option.value));

                // Set the selected options state
                setSelectedOptions(selected);
            } catch (err: any) {
                setError(err.data.message);
            }
        };
        fetchBTData();
    }, [refreshData]);

    useEffect(() => {
        const fetchIncoTerms = async () => {
            try {
                const response = await axiosInstance.get(`/incoTermsListing`);
                if (response.status !== 200) {
                    throw new Error('Failed to fetch data');
                }
                const data: IncoTermData[] = await response.data;
                setIncoTermData(data);
            } catch (err: any) {
                setError(err.data.message);
            }
        };
        fetchIncoTerms();
    }, []);

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

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setBusinessTaskData({ ...businessTaskData, [name]: value });
    };

    const handleModeChange = (selectedOptions) => {
        setSelectedOptions(selectedOptions);
    };

    const handleRSelect = (selectedOption: { value: number; label: string } | null, fieldName: string) => {
        if (selectedOption) {
            if(fieldName == 'inco_term') {
                setBusinessTaskData({ ...businessTaskData, inco_term: {
                    id: selectedOption.value,
                    inco_term: selectedOption.label
                }, inco_term_id: selectedOption.value });
            }
        } else {
            setBusinessTaskData({ ...businessTaskData, [fieldName]: null });
        }
    };
    const handleSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const { name, value } = e.target;
        setBusinessTaskData({ ...businessTaskData, [name]: value });
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
        const apiCall = axiosInstance.post(`/updateLogisticsInstructionBt`,  {
                business_task_id: businessTaskData.id,
                shipping_liabelity: businessTaskData.shipping_liabelity,
                cold_chain: businessTaskData.cold_chain,
                inco_term_id: businessTaskData.inco_term_id,
                freight_target_cost: businessTaskData.freight_target_cost,
                port_of_unloading: businessTaskData.port_of_unloading,
                final_destination: businessTaskData.final_destination,
                destination_code: businessTaskData.destination_code,
                shipment_mode: selectedOptions
            })

        apiCall
            .then((response) => {
                swal("Success!", response.data.message, "success");
                handleSuccess();
        })
        .catch(error => swal("Error!", error.data.message, "error"))
        .finally(() => { setLoading(false); });
    };

    if (error) return <div>Error: {error}</div>;

    return (
        <>
            <h2 className="mb-5">Inter Departmental Collaboration | BT Id : { businessTaskData.id }</h2>
            <Tab.Container id="basic-tabs-example" defaultActiveKey="logistics_instruction" onSelect={handleSelect}>
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
                    <Tab.Pane eventKey="logistics_instruction">
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
                            <Row className='mb-2 p-4'>
                                <Form noValidate validated={validated} onSubmit={handleSubmit}>
                                    <Row className="mb-3 g-3">
                                        <Form.Group as={Col} className="mb-3" controlId="shipping_liabelity">
                                            <Form.Label>Shipping Liability </Form.Label>
                                            <Form.Select name="shipping_liabelity" value={businessTaskData.shipping_liabelity} onChange={handleSelectChange}>
                                                <option value="">Select</option>
                                                <option value="Inorbvict">Inorbvict</option>
                                                <option value="Buyer">Buyer</option>
                                            </Form.Select>
                                            <Form.Control.Feedback type="invalid">Please enter shipping liability</Form.Control.Feedback>
                                        </Form.Group>
                                        <Form.Group as={Col} className="mb-3" controlId="cold_chain">
                                            <Form.Label>Cold Chain </Form.Label>
                                            <Form.Select name="cold_chain" value={businessTaskData.cold_chain} onChange={handleSelectChange}>
                                                <option value="">Select</option>
                                                <option value="Yes">Yes</option>
                                                <option value="No">No</option>
                                            </Form.Select>
                                            <Form.Control.Feedback type="invalid">Please enter cold chain</Form.Control.Feedback>
                                        </Form.Group>
                                        <Form.Group as={Col} className="mb-0" controlId="inco_term">
                                            <Form.Label>Inco Term <span className="text-danger">*</span></Form.Label>
                                            <ReactSelect
                                                options= {incoTermData.map((option: IncoTermData) => (
                                                    { value: option.id, label: option.inco_term }
                                                ))}
                                                placeholder="Select Inco Term" name="inco_term" value={businessTaskData.inco_term ? { value: businessTaskData.inco_term.id, label: businessTaskData.inco_term.inco_term } : null} onChange={(selectedOption) => handleRSelect(selectedOption, 'inco_term')} required
                                            />
                                            <Form.Control type="hidden" name="inco_term_id" value={businessTaskData.inco_term_id} />
                                            <Form.Control.Feedback type="invalid">Please enter Inco Term</Form.Control.Feedback>
                                        </Form.Group>
                                        <Form.Group as={Col} className="mb-3" controlId="freight_target_cost">
                                            <Form.Label>Freight Target Cost <span className="danger">*</span></Form.Label>
                                            <Form.Control type="text" placeholder="Freight Target Cost" name="freight_target_cost" value={businessTaskData.freight_target_cost} onChange={handleChange} required />
                                            <Form.Control.Feedback type="invalid">Please enter freight target cost.</Form.Control.Feedback>
                                        </Form.Group>
                                        <Form.Group as={Col} className="mb-3" controlId="shipment_mode">
                                            <Form.Label>Shipment Mode </Form.Label>
                                                <ReactSelect value={selectedOptions}
                                                    options={shipmentOptions}
                                                    isMulti
                                                    placeholder="Select Shipment Mode"
                                                    name="shipment_mode"
                                                    onChange={handleModeChange}
                                                />
                                            <Form.Control.Feedback type="invalid">Please enter shipment mode</Form.Control.Feedback>
                                        </Form.Group>
                                    </Row>
                                    <Row className="mb-3 g-3">
                                        <Form.Group as={Col} className="mb-3" controlId="port_of_unloading">
                                            <Form.Label>Port Of Discharge/Unloading <span className="danger">*</span></Form.Label>
                                            <Form.Control type="text" placeholder="Nearest Port From Consignee City" name="port_of_unloading" value={businessTaskData.port_of_unloading} onChange={handleChange} required />
                                            <Form.Control.Feedback type="invalid">Please enter freight target cost.</Form.Control.Feedback>
                                        </Form.Group>
                                        <Form.Group as={Col} className="mb-3" controlId="final_destination">
                                            <Form.Label>Final Destination <span className="danger">*</span></Form.Label>
                                            <Form.Control type="text" placeholder="Consignee City" name="final_destination" value={businessTaskData.final_destination} onChange={handleChange} required />
                                            <Form.Control.Feedback type="invalid">Please enter freight target cost.</Form.Control.Feedback>
                                        </Form.Group>
                                        <Form.Group as={Col} className="mb-3" controlId="destination_code">
                                            <Form.Label>Zip code <span className="danger">*</span></Form.Label>
                                            <Form.Control type="text" placeholder="Pincode/Zipcode/Postal Code" name="destination_code" value={businessTaskData.destination_code} onChange={handleChange} required />
                                            <Form.Control.Feedback type="invalid">Please enter freight target cost.</Form.Control.Feedback>
                                        </Form.Group>
                                    </Row>
                                    <Row className="g-3">
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

export default LogisticsInstruction;
