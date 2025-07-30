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

interface FetchedInvoiceData {
    id: number;
    invoice_number: string;
    regulatory: {
        invoice_id: number;
        shipping_bill_no: string;
        shipping_bill_date: string;
        awb_no: string;
        awb_date: string;
        egm_no: string;
        egm_date: string;
        invoice: string;
        awb: string;
        shipping_bill: string;
        packing_list: string;
        other: string;
    }
}

interface FormData {
    id: number | undefined;
    inward: InwardListingData | null;
    inward_id: number;
    invoice: InvoicesData | null;
    invoice_id: number;
    psd_date: string;
    invoiceUpload: File | null;
    awbUpload: File | null;
    shippingBillUpload: File | null;
    packingListUpload: File | null;
    otherUpload: File | null;
}

const PsdForm = () => {
    const { inwardId } = useParams();
    const [outwardData, setOutwardData] = useState<FormData>({
        id: undefined,
        inward: null,
        inward_id: 0,
        invoice: null,
        invoice_id: 0,
        psd_date: '',
        invoiceUpload: null,
        awbUpload: null,
        shippingBillUpload: null,
        packingListUpload: null,
        otherUpload: null,
    });

    const [isEditing, setIsEditing] = useState<boolean>(false);
    const [validated, setValidated] = useState<boolean>(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    type FileAttachmentNames = 'invoiceUpload' | 'awbUpload' | 'shippingBillUpload' | 'packingListUpload' | 'otherUpload';
    const [invoicesData, setInvoicesData] = useState<InvoicesData[]>([]);
    const [fetchedInvoiceData, setFetchedInvoiceData] = useState<FetchedInvoiceData>({
        id: 0,
        invoice_number: '',
        regulatory: {
            invoice_id: 0,
            shipping_bill_no: '',
            shipping_bill_date: '',
            awb_no: '',
            awb_date: '',
            egm_no: '',
            egm_date: '',
            invoice: '',
            awb: '',
            shipping_bill: '',
            packing_list: '',
            other: ''
        }
    });
    const [inwardListingData, setInwardListingData] = useState<InwardListingData[]>([]);

    const { userPermission } = useAuth(); //check userRole & permissions
    const navigate = useNavigate();

    const handlePsdList = () => {
        navigate(`/warehouse-psd`);
    };

    const handleDownload = async (fileName: string, path: string) => {
        try {
            // Fetch the file from the server using the ID
            const response = await axiosInstance.get(`/${path}/${fileName}`, {
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

    useEffect(() => {
        const fetchInwardListing = async () => {
            try {
                const response = await axiosInstance.get('/createPsd');
                if (response.status !== 200) {
                    throw new Error('Failed to fetch data');
                }
                const data: InwardListingData[] = await response.data.inwards;
                const invoices: InvoicesData[] = await response.data.invoices;
                setInwardListingData(data);
                setInvoicesData(invoices);
            } catch (err: any) {
                setError(err.message);
            } finally {
            }
        };

        const fetchPsdData = async () => {
            try {
                const response = await axiosInstance.get(`/warehouse-psd/${inwardId}`);
                if (response.status !== 200) {
                    throw new Error('Failed to fetch data');
                }
                const data: FormData = await response.data;
                setOutwardData(data);
                axiosInstance.get(`/getInvoiceDetailsOnPsd`, {
                    params: {
                        invoice_id: response.data.invoice_id
                    }
                })
                .then(response => {
                    const resp: FetchedInvoiceData = response.data;
                    setFetchedInvoiceData(resp);
                });
            } catch (err: any) {
                setError(err.message);
            } finally {
            }

        };

        fetchInwardListing(); //fetch Inward and Invoices list for PSD
        if(inwardId) {
            fetchPsdData();
        }
    }, []);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        // Handle top-level fields
        setOutwardData(prev => ({ ...prev, [name]: value }));
    };

    const handleFetchedChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        // Handle top-level fields
        setFetchedInvoiceData(prev => ({ ...prev, regulatory: {
            ...prev.regulatory,
            [name]: value // Correctly using bracket notation to set the property
        } }));
    };

    const handleFileChange = (fileEvent: React.ChangeEvent, fileName: FileAttachmentNames) => {

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
            setOutwardData(prev => ({
                ...prev,
                invoice: { id: selectedOption.value, invoice_number: selectedOption.label },
                invoice_id: selectedOption.value
            }));
            try {
                axiosInstance.get(`/getInvoiceDetailsOnPsd`, {
                    params: {
                        invoice_id: selectedOption.value
                    }
                })
                .then(response => {
                    const resp: FetchedInvoiceData = response.data;
                    setFetchedInvoiceData(resp);
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

                    setLoading(true);
                    setValidated(true);

                    axiosInstance.post('/warehouse-psd', {
                        ...outwardData,
                        ...fetchedInvoiceData
                        }, {
                            headers: {
                                'Content-Type': 'multipart/form-data',
                            },
                        })
                        .then((response) => {
                            swal("Success!", response.data.message, "success");
                            handlePsdList();
                        })
                        .catch(error => swal("Error!", error.data.message, "error"))
                        .finally(() => { setLoading(false);
                    });

                }
            });
        }

    };

    if (error) return <div>Error: {error}</div>;
    return (
        <>
            <Row>
                <Col><h3 className='px-4 mb-2'>{isEditing ? 'Edit PSD' : 'Create PSD'}</h3></Col>
            </Row>
            <hr></hr>
            <Card style={{ width: '100%' }}>
                <Card.Title>
                    <Row className='mt-4 px-4'>
                        <Col className='d-flex align-items-center justify-content-start'><h5>Select inward to add PSD details</h5></Col>
                        <Col className='d-flex justify-content-end'><Button
                                size='sm'
                                variant="primary"
                                className=""
                                startIcon={<FontAwesomeIcon icon={faCaretLeft} className="me-2" />}
                                onClick={() => handlePsdList()}
                                >
                                    PSD List
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
                                <Form.Group as={Col} className="mb-3" controlId="psd_date">
                                    <Form.Label>PSD Date <span className="text-danger">*</span></Form.Label>
                                    <Form.Control type="date" placeholder="PSD Date" name="psd_date" value={outwardData.psd_date} onChange={handleChange} required />
                                    <Form.Control.Feedback type="invalid">Please enter PSD Date.</Form.Control.Feedback>
                                </Form.Group>
                            </Row>

                            {outwardData.invoice && (
                                <>
                                    <hr className='border border-danger border-1'/>
                                    <Card.Title as="h5" className="text-dark">Selected Invoice : { outwardData.invoice ? outwardData.invoice.invoice_number : '' } </Card.Title>

                                    <Card.Title as="h5" className="text-danger">Regulatory Dashboard</Card.Title>

                                    <Row>
                                        <Col md={2}>
                                            <Form.Group as={Col} className="mb-3" controlId="awb_no">
                                                <Form.Label>AWB / BL Number <span className="text-danger">*</span></Form.Label>
                                                <Form.Control type="text" placeholder="AWB Number" name="awb_no" value={fetchedInvoiceData.regulatory === null ? '' : fetchedInvoiceData.regulatory.awb_no} onChange={handleFetchedChange} required />
                                                <Form.Control.Feedback type="invalid">Please enter AWB Number.</Form.Control.Feedback>
                                            </Form.Group>
                                        </Col>
                                        <Col md={2}>
                                            <Form.Group as={Col} className="mb-3" controlId="awb_date">
                                                <Form.Label>AWB Date <span className="text-danger">*</span></Form.Label>
                                                <Form.Control type="date" name="awb_date" value={fetchedInvoiceData.regulatory === null ? '' : fetchedInvoiceData.regulatory.awb_date} onChange={handleFetchedChange} required />
                                                <Form.Control.Feedback type="invalid">Please enter E-Way Bill Date.</Form.Control.Feedback>
                                            </Form.Group>
                                        </Col>
                                        <Col md={2}>
                                            <Form.Group as={Col} className="mb-3" controlId="shipping_bill_no">
                                                <Form.Label>Shipping Bill No <span className="text-danger">*</span></Form.Label>
                                                <Form.Control type="text" placeholder="Shipping Bill Number" name="shipping_bill_no" value={fetchedInvoiceData.regulatory === null ? '' : fetchedInvoiceData.regulatory.shipping_bill_no} onChange={handleFetchedChange} required />
                                                <Form.Control.Feedback type="invalid">Please enter Shipping Bill Number.</Form.Control.Feedback>
                                            </Form.Group>
                                        </Col>
                                        <Col md={2}>
                                            <Form.Group as={Col} className="mb-3" controlId="shipping_bill_date">
                                                <Form.Label>Shipping Bill Date <span className="text-danger">*</span></Form.Label>
                                                <Form.Control type="date" name="shipping_bill_date" value={fetchedInvoiceData.regulatory === null ? '' : fetchedInvoiceData.regulatory.shipping_bill_date} onChange={handleFetchedChange} required />
                                                <Form.Control.Feedback type="invalid">Please enter Shipping Bill Date.</Form.Control.Feedback>
                                            </Form.Group>
                                        </Col>
                                        <Col md={2}>
                                            <Form.Group as={Col} className="mb-3" controlId="egm_no">
                                                <Form.Label>EGM Number <span className="text-danger">*</span></Form.Label>
                                                <Form.Control type="text" placeholder="EGM Number" name="egm_no" value={fetchedInvoiceData.regulatory === null ? '' : fetchedInvoiceData.regulatory.egm_no} onChange={handleFetchedChange} required />
                                                <Form.Control.Feedback type="invalid">Please enter EGM Number.</Form.Control.Feedback>
                                            </Form.Group>
                                        </Col>
                                        <Col md={2}>
                                            <Form.Group as={Col} className="mb-3" controlId="egm_date">
                                                <Form.Label>EGM Date <span className="text-danger">*</span></Form.Label>
                                                <Form.Control type="date" name="egm_date" value={fetchedInvoiceData.regulatory === null ? '' : fetchedInvoiceData.regulatory.egm_date} onChange={handleFetchedChange} required />
                                                <Form.Control.Feedback type="invalid">Please enter EGM Date.</Form.Control.Feedback>
                                            </Form.Group>
                                        </Col>
                                    </Row>

                                    <Card.Title as="h6" className="text-danger">Attachment Details  <small>(File upload max size : 2MB)</small></Card.Title>

                                    <Row className='g-2'>
                                        <Col md={4}>
                                            <Form.Group className="mb-3" controlId='invoiceUpload'>
                                                <Form.Label>Invoice <span className="text-danger">*</span></Form.Label>
                                                <Form.Control type="file" name='invoiceUpload' onChange={(fileEvent) => handleFileChange(fileEvent, 'invoiceUpload')} required={(fetchedInvoiceData.regulatory === null) ? true : false } />
                                                <Form.Control.Feedback type="invalid">Please enter Invoice.</Form.Control.Feedback>
                                                {fetchedInvoiceData.regulatory && (<Button className="text-primary py-2 d-flex" variant="link" title="Download" onClick={() => handleDownload(`${fetchedInvoiceData.regulatory.invoice}`, 'uploads/regulatory/invoice')} startIcon={<FontAwesomeIcon icon={faDownload} />}> {fetchedInvoiceData.regulatory.invoice} </Button>)}
                                            </Form.Group>
                                        </Col>
                                        <Col md={4}>
                                            <Form.Group className="mb-3" controlId='awbUpload'>
                                                <Form.Label>AWB <span className="text-danger">*</span></Form.Label>
                                                <Form.Control type="file" name='awbUpload' onChange={(fileEvent) => handleFileChange(fileEvent, 'awbUpload')} required={(fetchedInvoiceData.regulatory === null) ? true : false } />
                                                <Form.Control.Feedback type="invalid">Please enter AWB.</Form.Control.Feedback>
                                                {fetchedInvoiceData.regulatory && (<Button className="text-primary py-2 d-flex" variant="link" title="Download" onClick={() => handleDownload(`${fetchedInvoiceData.regulatory.awb}`, 'uploads/regulatory/awb')} startIcon={<FontAwesomeIcon icon={faDownload} />}> {fetchedInvoiceData.regulatory.awb} </Button>)}
                                            </Form.Group>
                                        </Col>
                                        <Col md={4}>
                                            <Form.Group className="mb-3" controlId='shippingBillUpload'>
                                                <Form.Label>Shipping Bill <span className="text-danger">*</span></Form.Label>
                                                <Form.Control type="file" name='shippingBillUpload' onChange={(fileEvent) => handleFileChange(fileEvent, 'shippingBillUpload')} required={(fetchedInvoiceData.regulatory === null) ? true : false } />
                                                <Form.Control.Feedback type="invalid">Please enter Shipping Bill.</Form.Control.Feedback>
                                                {fetchedInvoiceData.regulatory && (<Button className="text-primary py-2 d-flex" variant="link" title="Download" onClick={() => handleDownload(`${fetchedInvoiceData.regulatory.shipping_bill}`, 'uploads/regulatory/shippingbill')} startIcon={<FontAwesomeIcon icon={faDownload} />}> {fetchedInvoiceData.regulatory.shipping_bill} </Button>)}
                                            </Form.Group>
                                        </Col>
                                        <Col md={4}>
                                            <Form.Group className='mb-3' controlId='packingListUpload'>
                                                <Form.Label>Packing List <span className="text-danger">*</span></Form.Label>
                                                <Form.Control type="file" name='packingListUpload' onChange={(fileEvent) => handleFileChange(fileEvent, 'packingListUpload')} required={(fetchedInvoiceData.regulatory === null) ? true : false } />
                                                <Form.Control.Feedback type="invalid">Please enter Packing List.</Form.Control.Feedback>
                                                {fetchedInvoiceData.regulatory && (<Button className="text-primary py-2 d-flex" variant="link" title="Download" onClick={() => handleDownload(`${fetchedInvoiceData.regulatory.packing_list}`, 'uploads/regulatory/packinglist')} startIcon={<FontAwesomeIcon icon={faDownload} />}> {fetchedInvoiceData.regulatory.packing_list} </Button>)}
                                            </Form.Group>
                                        </Col>
                                        <Col md={4}>
                                            <Form.Group className='mb-3' controlId='otherUpload'>
                                                <Form.Label>Other </Form.Label>
                                                <Form.Control type="file" name='otherUpload' onChange={(fileEvent) => handleFileChange(fileEvent, 'otherUpload')} />
                                                {fetchedInvoiceData.regulatory && (<Button className="text-primary py-1 d-flex" variant="link" title="Download" onClick={() => handleDownload(`${fetchedInvoiceData.regulatory.other}`, 'uploads/regulatory/other')} startIcon={<FontAwesomeIcon icon={faDownload} />}> {fetchedInvoiceData.regulatory.other} </Button>)}
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

export default PsdForm;

