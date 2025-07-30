import React, { useEffect, useState, useCallback, FormEvent } from 'react';
import { Form, Card, Row, Col, Alert, Tab, Nav } from 'react-bootstrap';
import { faPlus, faCaretLeft, faTrash, faDownload } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import Button from '../../../components/base/Button';
import axiosInstance from '../../../axios';
import swal from 'sweetalert';
import { useAuth } from '../../../AuthContext';
import ReactSelect from '../../../components/base/ReactSelect';
import { useNavigate, useParams } from 'react-router-dom';
import { ToastContainer, toast } from "react-toastify";
import { downloadFile } from '../../../helpers/utils';
import Dropzone from '../../../components/base/Dropzone';

interface InwardListingData {
    id: number;
    inward_sys_id: string;
}
interface InvoicesData {
    id: number;
    invoice_number: string;
}
interface FfdData {
    id: number;
    ffd_name: string;
    address: string;
    city: string;
    pin_code: string;
}

interface LogisticsData {
    id: number;
    invoice_id: number;
    ffd_id: number;
    pickup_proof: string;
    e_way_bill: string;
    delivery_challan: string;
    id_card: string;
    kyc: string;
    delivery_boy_photo: string;
    cargo_pickup_agent: string;
    ffd_quotation: string;
    insurance_attachment: string;
    other_attachment: string;
}
interface FetchedInvoiceData {
    id: number;
    invoice_number: string;
    invoice_date: string;
    total_net_weight: string;
    total_gross_weight: string;
    total_value_weight: string;
    no_of_packages: string;
    international_ffd_id: number;
    domestic_ffd_id: number;
    volum_range: string;
    logistics_id: number;
    ffd_international: FfdData;
    ffd_domestic: FfdData;
}


interface FormData {
    id: number | undefined;
    inward: InwardListingData | null;
    inward_id: number;
    invoice: InvoicesData | null;
    invoice_id: number;
    pickup_proof: File | null;
    delivery_challan: File | null;
    id_card: File | null;
    delivery_boy_photo: File | null;
    kyc: File | null;
    cargo_pickup_agent: File | null;
    ffd_quotation: File | null;
    insurance_attachment: File | null;
    other_attachment: File | null;
    e_way_bill: File | null;
    eway_bill_number: string;
    eway_bill_date: string;
    eway_bill_attachment?: string;
}

const OutwardForm = () => {
    const { outwardId } = useParams();
    const [outwardData, setOutwardData] = useState<FormData>({
        id: undefined,
        inward: null,
        inward_id: 0,
        invoice: null,
        invoice_id: 0,
        pickup_proof: null,
        delivery_challan: null,
        id_card: null,
        delivery_boy_photo: null,
        kyc: null,
        cargo_pickup_agent: null,
        ffd_quotation: null,
        insurance_attachment: null,
        other_attachment: null,
        e_way_bill: null,
        eway_bill_number: '',
        eway_bill_date: '',
    });
    const [isEditing, setIsEditing] = useState<boolean>(false);
    const [validated, setValidated] = useState<boolean>(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    type LogisticsFile = 'pickup_proof' | 'delivery_challan' | 'id_card' | 'delivery_boy_photo' | 'kyc' | 'cargo_pickup_agent' | 'ffd_quotation' | 'e_way_bill';
    type FileAttachmentNames = 'pickup_proof' | 'delivery_challan' | 'id_card' | 'delivery_boy_photo' | 'kyc' | 'cargo_pickup_agent' | 'ffd_quotation' | 'insurance_attachment' | 'other_attachment' | 'e_way_bill';
    const [invoicesData, setInvoicesData] = useState<InvoicesData[]>([]);
    const [fetchedLogisticsData, setFetchedLogisticsData] = useState<LogisticsData | null>(null);
    const [fetchedInvoiceData, setFetchedInvoiceData] = useState<FetchedInvoiceData>({
        id: 0,
        invoice_number: '',
        invoice_date: '',
        total_net_weight: '',
        total_gross_weight: '',
        total_value_weight: '',
        no_of_packages: '',
        international_ffd_id: 0,
        domestic_ffd_id: 0,
        volum_range: '',
        logistics_id: 0,
        ffd_international: {id: 0, ffd_name: '', address: '', city: '', pin_code: '' },
        ffd_domestic: {id: 0, ffd_name: '', address: '', city: '', pin_code: '' },
    });
    const [inwardListingData, setInwardListingData] = useState<InwardListingData[]>([]);

    const { userPermission } = useAuth(); //check userRole & permissions
    const navigate = useNavigate();

    const handleOutwardList = () => {
        navigate(`/warehouse-outward`);
    };

    useEffect(() => {
        if (outwardId) {
            setIsEditing(true);
            // Fetch warehouse-outward data for editing
            axiosInstance.get(`/warehouse-outward/${outwardId}`)
            .then(response => {
                setOutwardData(response.data);
                axiosInstance.get(`/getInvoiceDetailsOnOutward`, {
                    params: {
                        invoice_id: response.data.invoice_id
                    }
                })
                .then(resp => {
                    // const resp: IrmData[] = response.data.irmRows;
                    // const total: number = response.data.invoice_details;
                    setFetchedInvoiceData(resp.data.invoice_details);
                    setFetchedLogisticsData(resp.data.logistics_details);
                });
            })
            .catch(error => console.error('Error fetching warehouse-outward data:', error));
        }
        const fetchInwardListing = async () => {
            try {
                const response = await axiosInstance.get('/createOutward');
                if (response.status !== 200) {
                    throw new Error('Failed to fetch data');
                }
                const data: InwardListingData[] = await response.data.inwards;
                const invoices: InvoicesData[] = await response.data.invoices;
                if(isEditing){
                    console.log(outwardData.invoice_id, outwardData.invoice?.invoice_number);

                    // Push the extra record to the data array
                    invoices.push({ id: outwardData.invoice_id, invoice_number: outwardData.invoice.invoice_number });
                }
                setInwardListingData(data);
                setInvoicesData(invoices);
            } catch (err: any) {
                setError(err.message);
            } finally {
            }
        };
        fetchInwardListing();
    }, []);

    const handleDownload = async (fileName: string, path: string) => {
        try {
            // Fetch the file from the server using the ID
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
    }

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        // Handle top-level fields
        setOutwardData(prev => ({ ...prev, [name]: value }));
    };

    const handleFileChange = (fileEvent: React.ChangeEvent<FormControlElement>, fileName: FileAttachmentNames) => {

        const file = fileEvent.target.files ? fileEvent.target.files[0] : null;
        setOutwardData(prev => ({
            ...prev,
            [fileName]: file
        }));
    };

    const handleInwardSelect = (selectedOption: any) => {
        if (selectedOption) {
            setOutwardData(prev => ({
                ...prev,
                inward: { id: selectedOption.value, inward_sys_id: selectedOption.label },
                inward_id: selectedOption.value
            }));
        }
    };

    const handleInvoiceChange = (selectedOption: any) => {
        if (selectedOption) {
            setFetchedLogisticsData(null);
            setOutwardData(prev => ({
                ...prev,
                invoice: { id: selectedOption.value, invoice_number: selectedOption.label },
                invoice_id: selectedOption.value
            }));
            try {
                axiosInstance.get(`/getInvoiceDetailsOnOutward`, {
                    params: {
                        outward_id: outwardData.id ? outwardData.id : '',
                        invoice_id: selectedOption.value
                    }
                })
                .then(response => {
                    const resp: FetchedInvoiceData = response.data.invoice_details;
                    const logistics: LogisticsData = response.data.logistics_details;
                    setFetchedInvoiceData(resp);
                    setFetchedLogisticsData(logistics);
                });
            } catch (err: any) {
                swal("Error!", err.data.message, "error");
            }
        }
    };


    const handleSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const { name, value } = e.target;
        setOutwardData({ ...outwardData, [name]: value });
    };


    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const form = e.currentTarget;
        // Validate the required field
        if (outwardData.inward_id === 0) {
            toast.error("Inward cannot be blank");
            setValidated(true);
            return;
        }
        if (outwardData.invoice_id === 0) {
            toast.error("Please select invoice number");
            setValidated(true);
            return;
        }
        if(!isEditing){
            swal({
                title: "",
                text: `You are about to map Invoice Number : ${outwardData.invoice?.invoice_number} with Inward ID : ${outwardData.inward?.inward_sys_id}`,
                icon: "info",
                buttons: {
                    confirm: {
                        text: "Confirm",
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
            .then((onceConfirmed) => {
                if (onceConfirmed) {
                    if (form.checkValidity() === false) {
                        e.preventDefault();
                        e.stopPropagation();
                        setValidated(true);
                        return;
                    }

                    if(!isEditing){
                        const logisticsFiles: LogisticsFile[] = [ 'pickup_proof', 'delivery_challan', 'id_card', 'delivery_boy_photo', 'kyc', 'cargo_pickup_agent', 'ffd_quotation', 'e_way_bill' ];
                        for (const complianceFile of logisticsFiles) {
                            if (outwardData[complianceFile] === null || outwardData[complianceFile] === undefined) {
                                toast.error(`${complianceFile} is required.`);
                                setValidated(true);
                                return false;
                            }
                        }
                    }
                    setLoading(true);
                    setValidated(true);

                    axiosInstance.post('/warehouse-outward', {
                        ...outwardData
                        }, {
                            headers: {
                                'Content-Type': 'multipart/form-data',
                            },
                        })
                        .then((response) => {
                            swal("Success!", response.data.message, "success");
                            handleOutwardList();
                        })
                        .catch(error => swal("Error!", error.data.message, "error"))
                        .finally(() => { setLoading(false);
                    });

                }
            });
        }
        else{
            const apiCall = axiosInstance.post('/updateOutward', {
                    ...outwardData,
                    fetchedLogisticsData
                }, {
                    headers: {
                        'Content-Type': 'multipart/form-data',
                    },
                }
            );

            apiCall.then((response) => {
                swal("Success!", response.data.message, "success");
                handleOutwardList();
            }).catch(error => swal("Error!", error.data.message, "error"))
            .finally(() => { setLoading(false); });
        }

    };

    if (error) return <div>Error: {error}</div>;
    return (
        <>
            <Row>
                <Col><h3 className='px-4 mb-2'>{isEditing ? 'Edit Outward' : 'Create Outward'}</h3></Col>
            </Row>
            <hr></hr>
            <Card style={{ width: '100%' }}>
                <Card.Title>
                    <Row className='mt-4 px-4'>
                        <Col className='d-flex align-items-center justify-content-start'><h5>Select inward to map invoice details</h5></Col>
                        <Col className='d-flex justify-content-end'><Button
                                size='sm'
                                variant="primary"
                                className=""
                                startIcon={<FontAwesomeIcon icon={faCaretLeft} className="me-2" />}
                                onClick={() => handleOutwardList()}
                                >
                                    Outward List
                            </Button>
                        </Col>
                    </Row>
                </Card.Title>

                <Card.Body className='pt-0'>
                    <Row>
                        <Form noValidate validated={validated} onSubmit={handleSubmit}>
                            <Row className='mb-2'>
                                <Form.Group as={Col} className="mb-3">
                                    <Form.Label>Select Inward ID <span className="text-danger">*</span> <small>List only contains Packed & labelled inwards.</small></Form.Label>
                                    <ReactSelect
                                        options= {inwardListingData.map((option: InwardListingData) => (
                                            { value: option.id, label: option.inward_sys_id }
                                        ))}
                                        placeholder="Select Inward ID" name="inward" value={outwardData.inward ? { value: outwardData.inward.id, label: outwardData.inward.inward_sys_id } : null} onChange={(selectedOption) => handleInwardSelect(selectedOption)} />
                                    <Form.Control type="hidden" name="inward_id" value={outwardData.inward_id} />
                                    {validated && !outwardData.inward_id && (
                                        <div className="invalid-feedback d-block">Please select Proforma Inward Number</div>
                                    )}
                                </Form.Group>
                                <Form.Group as={Col} className="mb-3">
                                    <Form.Label>Select Invoice <span className="text-danger">*</span></Form.Label>
                                    <ReactSelect
                                        options= {invoicesData.map((option: InvoicesData) => (
                                            { value: option.id, label: `${option.invoice_number}` }
                                        ))}
                                        placeholder="Select Invoice" name="invoice" value={outwardData.invoice ? { value: outwardData.invoice.id, label: outwardData.invoice.invoice_number } : null} onChange={(selectedOption) => handleInvoiceChange(selectedOption)} />
                                        <Form.Control type="hidden" name="invoice_id" value={outwardData.invoice_id} />
                                        {validated && !outwardData.invoice_id && (
                                            <div className="invalid-feedback d-block">Please select Invoice</div>
                                        )}
                                </Form.Group>
                            </Row>

                            {outwardData.invoice && (
                                <>
                                    <hr className='border border-danger border-1'/>
                                    <Card.Title as="h5" className="text-danger">Selected Invoice : { outwardData.invoice ? outwardData.invoice.invoice_number : '' } </Card.Title>

                                    <Row>
                                        <Col md={4}>
                                            <Form.Group as={Col} className="mb-3" controlId="volum_range">
                                                <Form.Label>Volume Range <span className="text-danger">*</span></Form.Label>
                                                <Form.Control type="text" name="volum_range" value={fetchedInvoiceData.volum_range} readOnly style={{backgroundColor: 'whitesmoke', pointerEvents: 'none'}} />
                                            </Form.Group>
                                        </Col>
                                    </Row>
                                    <Row>
                                        <Col md={3}>
                                            <Form.Group as={Col} className="mb-3" controlId="total_net_weight">
                                                <Form.Label>Total Net Weight <span className="text-danger">*</span></Form.Label>
                                                <Form.Control type="text" name="total_net_weight" value={fetchedInvoiceData.total_net_weight} readOnly style={{backgroundColor: 'whitesmoke', pointerEvents: 'none'}} />
                                            </Form.Group>
                                        </Col>
                                        <Col md={3}>
                                            <Form.Group as={Col} className="mb-3" controlId="total_gross_weight">
                                                <Form.Label>Total Gross Weight <span className="text-danger">*</span></Form.Label>
                                                <Form.Control type="text" name="total_gross_weight" value={fetchedInvoiceData.total_gross_weight} readOnly style={{backgroundColor: 'whitesmoke', pointerEvents: 'none'}} />
                                            </Form.Group>
                                        </Col>
                                        <Col md={3}>
                                            <Form.Group as={Col} className="mb-3" controlId="total_value_weight">
                                                <Form.Label>Total Volume Weight <span className="text-danger">*</span></Form.Label>
                                                <Form.Control type="text" name="total_value_weight" value={fetchedInvoiceData.total_value_weight} readOnly style={{backgroundColor: 'whitesmoke', pointerEvents: 'none'}} />
                                            </Form.Group>
                                        </Col>
                                        <Col md={3}>
                                            <Form.Group as={Col} className="mb-3" controlId="no_of_packages">
                                                <Form.Label>Marks & No. of Packages <span className="text-danger">*</span></Form.Label>
                                                <Form.Control type="text" name="no_of_packages" value={fetchedInvoiceData.no_of_packages} readOnly style={{backgroundColor: 'whitesmoke', pointerEvents: 'none'}} />
                                            </Form.Group>
                                        </Col>
                                    </Row>

                                    <Row className='mt-2 mb-3'>
                                        <Col md={6}>
                                            <h5>International FFD Details</h5>
                                            { fetchedInvoiceData.ffd_international && (
                                                <>
                                                    <span>{ fetchedInvoiceData.ffd_international.ffd_name ? fetchedInvoiceData.ffd_international.ffd_name : '' }</span> <br />
                                                    <span>{ fetchedInvoiceData.ffd_international.address ? fetchedInvoiceData.ffd_international.address : '' }</span><br />
                                                    <span>{ fetchedInvoiceData.ffd_international.city ? fetchedInvoiceData.ffd_international.city : '' } <b>Pincode : </b>{ fetchedInvoiceData.ffd_international.pin_code ? fetchedInvoiceData.ffd_international.pin_code : '' } </span><br />
                                                </>
                                            )}
                                        </Col>
                                        <Col md={6}>
                                            <h5>Domestic FFD Details</h5>
                                            { fetchedInvoiceData.ffd_domestic && (
                                                <>
                                                    <span>{ fetchedInvoiceData.ffd_domestic.ffd_name ? fetchedInvoiceData.ffd_domestic.ffd_name : '' }</span><br />
                                                    <span>{ fetchedInvoiceData.ffd_domestic.address ? fetchedInvoiceData.ffd_domestic.address : '' }</span><br />
                                                    <span>{ fetchedInvoiceData.ffd_domestic.city ? fetchedInvoiceData.ffd_domestic.city : '' } <b>Pincode : </b>{ fetchedInvoiceData.ffd_domestic.pin_code ? fetchedInvoiceData.ffd_domestic.pin_code : '' }</span><br />
                                                </>
                                            )}
                                        </Col>
                                    </Row>

                                    <hr className='border border-danger border-1'/>
                                    <Card.Title as="h5" className="text-danger">Logistics Compliance</Card.Title>

                                    <Card.Title as="h6" className="text-danger">Attachment Details  <small>(File upload max size : 2MB)</small></Card.Title>

                                    <Row className='g-2'>
                                        <Col md={6}>
                                            <Form.Group className="mb-3" controlId='pickup_proof'>
                                                <Form.Label>Pickup Proof <span className="text-danger">*</span> <small>(AWB / Courier Recipt / Email Confirmation) </small></Form.Label>
                                                <Form.Control type="file" name='pickup_proof' onChange={(fileEvent) => handleFileChange(fileEvent, 'pickup_proof')} required={!isEditing} />
                                                <Form.Control.Feedback type="invalid">Please enter Pickup Proof.</Form.Control.Feedback>
                                                {fetchedLogisticsData && (<Button className="text-primary py-2 d-flex" variant="link" title="Download" onClick={() => handleDownload(`${fetchedLogisticsData?.pickup_proof}`, 'uploads/compliance/pickupproof')} startIcon={<FontAwesomeIcon icon={faDownload} />}> {fetchedLogisticsData.pickup_proof} </Button>)}
                                            </Form.Group>
                                        </Col>
                                        <Col md={6}>
                                            <Form.Group className="mb-3" controlId='delivery_challan'>
                                                <Form.Label>Delivery Challan <span className="text-danger">*</span> <small>(Sign Copy)</small></Form.Label>
                                                <Form.Control type="file" name='delivery_challan' onChange={(fileEvent) => handleFileChange(fileEvent, 'delivery_challan')} required={!isEditing} />
                                                <Form.Control.Feedback type="invalid">Please enter Delivery Challan.</Form.Control.Feedback>
                                                {fetchedLogisticsData && (<Button className="text-primary py-2 d-flex" variant="link" title="Download" onClick={() => handleDownload(`${fetchedLogisticsData?.delivery_challan}`, 'uploads/compliance/deliverychallan')} startIcon={<FontAwesomeIcon icon={faDownload} />}> {fetchedLogisticsData.delivery_challan} </Button>)}
                                            </Form.Group>
                                        </Col>
                                        <Col md={6}>
                                            <Form.Group className="mb-3" controlId='id_card'>
                                                <Form.Label>Delivery Boy Id <span className="text-danger">*</span> <small>(Company Id)</small></Form.Label>
                                                <Form.Control type="file" name='id_card' onChange={(fileEvent) => handleFileChange(fileEvent, 'id_card')} required={!isEditing} />
                                                <Form.Control.Feedback type="invalid">Please enter Delivery Boy ID.</Form.Control.Feedback>
                                                {fetchedLogisticsData && (<Button className="text-primary py-2 d-flex" variant="link" title="Download" onClick={() => handleDownload(`${fetchedLogisticsData?.id_card}`, 'uploads/compliance/idcard')} startIcon={<FontAwesomeIcon icon={faDownload} />}> {fetchedLogisticsData.id_card} </Button>)}
                                            </Form.Group>
                                        </Col>
                                        <Col md={6}>
                                            <Form.Group className='mb-3' controlId='delivery_boy_photo'>
                                                <Form.Label>Delivery Boy Photo <span className="text-danger">*</span> <small>(Delivery Boy Passport size photo)</small></Form.Label>
                                                <Form.Control type="file" name='delivery_boy_photo' onChange={(fileEvent) => handleFileChange(fileEvent, 'delivery_boy_photo')} required={!isEditing} />
                                                <Form.Control.Feedback type="invalid">Please enter Delivery Boy Photo.</Form.Control.Feedback>
                                                {fetchedLogisticsData && (<Button className="text-primary py-2 d-flex" variant="link" title="Download" onClick={() => handleDownload(`${fetchedLogisticsData?.delivery_boy_photo}`, 'uploads/compliance/idcard')} startIcon={<FontAwesomeIcon icon={faDownload} />}> {fetchedLogisticsData.delivery_boy_photo} </Button>)}
                                            </Form.Group>
                                        </Col>
                                        <Col md={6}>
                                            <Form.Group className='mb-3' controlId='kyc'>
                                                <Form.Label>Delivery Boy Kyc <span className="text-danger">*</span> <small>(Pan Card / Aadhar Card / Election Card / Driving License)</small></Form.Label>
                                                <Form.Control type="file" name='kyc' onChange={(fileEvent) => handleFileChange(fileEvent, 'kyc')} required={!isEditing} />
                                                <Form.Control.Feedback type="invalid">Please enter Delivery Boy Kyc.</Form.Control.Feedback>
                                                {fetchedLogisticsData && (<Button className="text-primary py-1 d-flex" variant="link" title="Download" onClick={() => handleDownload(`${fetchedLogisticsData?.kyc}`, 'uploads/compliance/kyc')} startIcon={<FontAwesomeIcon icon={faDownload} />}> {fetchedLogisticsData.kyc} </Button>)}
                                            </Form.Group>
                                        </Col>
                                        <Col md={6}>
                                            <Form.Group className='mb-3' controlId='cargo_pickup_agent'>
                                                <Form.Label>Authorised Cargo Pickup Agent Declaration <span className="text-danger">*</span> </Form.Label>
                                                <Form.Control type="file" name='cargo_pickup_agent' onChange={(fileEvent) => handleFileChange(fileEvent, 'cargo_pickup_agent')} required={!isEditing} />
                                                <Form.Control.Feedback type="invalid">Please enter Authorised Cargo Pickup Agent Declaration.</Form.Control.Feedback>
                                                {fetchedLogisticsData && (<Button className="text-primary py-2 d-flex" variant="link" title="Download" onClick={() => handleDownload(`${fetchedLogisticsData?.cargo_pickup_agent}`, 'uploads/compliance/cargo_pickup')} startIcon={<FontAwesomeIcon icon={faDownload} />}> {fetchedLogisticsData.cargo_pickup_agent} </Button>)}
                                            </Form.Group>
                                        </Col>
                                        <Col md={6}>
                                            <Form.Group className='mb-3' controlId='ffd_quotation'>
                                                <Form.Label>FFD Quotation <span className="text-danger">*</span> </Form.Label>
                                                <Form.Control type="file" name='ffd_quotation' onChange={(fileEvent) => handleFileChange(fileEvent, 'ffd_quotation')} required={!isEditing} />
                                                <Form.Control.Feedback type="invalid">Please enter FFD Quotation.</Form.Control.Feedback>
                                                {fetchedLogisticsData && (<Button className="text-primary py-2 d-flex" variant="link" title="Download" onClick={() => handleDownload(`${fetchedLogisticsData?.ffd_quotation}`, 'uploads/compliance/ffd_quotation')} startIcon={<FontAwesomeIcon icon={faDownload} />}> {fetchedLogisticsData.ffd_quotation} </Button>)}
                                            </Form.Group>
                                        </Col>
                                        <Col md={6}>
                                            <Form.Group className='mb-3' controlId='insurance_attachment'>
                                                <Form.Label>Freight Insurance </Form.Label>
                                                <Form.Control type="file" name='insurance_attachment' onChange={(fileEvent) => handleFileChange(fileEvent, 'insurance_attachment')} />
                                                {fetchedLogisticsData && (<Button className="text-primary py-2 d-flex" variant="link" title="Download" onClick={() => handleDownload(`${fetchedLogisticsData?.insurance_attachment}`, 'uploads/compliance/insurance_attachment')} startIcon={<FontAwesomeIcon icon={faDownload} />}> {fetchedLogisticsData.insurance_attachment} </Button>)}
                                            </Form.Group>
                                        </Col>
                                        <Col md={6}>
                                            <Form.Group className='mb-3' controlId='other_attachment'>
                                                <Form.Label>Other Attachment </Form.Label>
                                                <Form.Control type="file" name='other_attachment' onChange={(fileEvent) => handleFileChange(fileEvent, 'other_attachment')} />
                                                {fetchedLogisticsData && (<Button className="text-primary py-2 d-flex" variant="link" title="Download" onClick={() => handleDownload(`${fetchedLogisticsData?.other_attachment}`, 'uploads/compliance/other_attachment')} startIcon={<FontAwesomeIcon icon={faDownload} />}> {fetchedLogisticsData.other_attachment} </Button>)}
                                            </Form.Group>
                                        </Col>
                                    </Row>

                                    <hr className='border border-danger border-1'/>
                                    <Card.Title as="h5" className="text-danger">Eway Bill</Card.Title>

                                    <Row>
                                        <Col md={6}>
                                            <Form.Group className='mb-3' controlId='e_way_bill'>
                                                <Form.Label>E Way Bill <span className="text-danger">*</span> </Form.Label>
                                                <Form.Control type="file" name='e_way_bill' onChange={(fileEvent) => handleFileChange(fileEvent, 'e_way_bill')} required={!isEditing} />
                                                <Form.Control.Feedback type="invalid">Please enter E Way Bill.</Form.Control.Feedback>
                                                {isEditing && (<Button className="text-primary py-2 d-flex" variant="link" title="Download" onClick={() => handleDownload(`${outwardData.eway_bill_attachment}`, 'uploads/wms/outward/')} startIcon={<FontAwesomeIcon icon={faDownload} />}> {outwardData.eway_bill_attachment} </Button>)}
                                            </Form.Group>
                                        </Col>
                                        <Col md={4}>
                                            <Form.Group as={Col} className="mb-3" controlId="eway_bill_number">
                                                <Form.Label>E-Way Bill Number <span className="text-danger">*</span></Form.Label>
                                                <Form.Control type="text" placeholder="E-Way Bill Number" name="eway_bill_number" value={outwardData.eway_bill_number} onChange={handleChange} required />
                                                <Form.Control.Feedback type="invalid">Please enter E-Way Bill Number.</Form.Control.Feedback>
                                            </Form.Group>
                                        </Col>
                                        <Col md={4}>
                                            <Form.Group as={Col} className="mb-3" controlId="eway_bill_date">
                                                <Form.Label>E-Way Bill Date <span className="text-danger">*</span></Form.Label>
                                                <Form.Control type="date" placeholder="E-Way Bill Date" name="eway_bill_date" value={outwardData.eway_bill_date} onChange={handleChange} required />
                                                <Form.Control.Feedback type="invalid">Please enter E-Way Bill Date.</Form.Control.Feedback>
                                            </Form.Group>
                                        </Col>
                                    </Row>

                                </>
                            )}

                            <hr />

                            <Row className='mt-2'>
                                <Col className='text-center'>
                                <Button variant="primary" loading={loading} loadingPosition="start" type="submit">{isEditing ? 'Update' : 'Save'}</Button>
                                </Col>
                            </Row>

                        </Form>
                    </Row>

                </Card.Body>
            </Card>

            <ToastContainer className='py-0' />
        </>
    )
};

export default OutwardForm;

