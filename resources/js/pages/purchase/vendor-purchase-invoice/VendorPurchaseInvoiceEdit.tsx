import React, { useEffect, useState, useCallback } from 'react';
import { Form, Card, Row, Col, Alert, Tab, Nav } from 'react-bootstrap';
import { faPlus, faCaretLeft, faTrash } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import Button from '../../../components/base/Button';
import axiosInstance from '../../../axios';
import swal from 'sweetalert';
import { useAuth } from '../../../AuthContext';
import { useNavigate, useParams } from 'react-router-dom';
import { ToastContainer, toast } from "react-toastify";
import Dropzone from '../../../components/base/Dropzone';
import { PaymentHistory } from '../../productivity/business-task/AccountsWorksheet'
import { set } from 'date-fns';

interface BTListingData {
    id: number;
    customer_name: string;
}
interface VendorListingData {
    id: number;
    name: string;
}
interface PurchaseOrderData {
    id: number;
    purchase_order_number: string;
}

interface FormData {
    id: number | undefined;
    purchase_order_id: number;
    purchase_order: PurchaseOrderData | null;
    purchase_invoice_no: string;
    purchase_invoice_date: string;
    vendor_id: number;
    vendor: VendorListingData | null;
    business_task_id: number;
    business_task: BTListingData | null;
    base_amount: number;
    gst_percent: number;
    gst_amount: number;
    tds_deduction: number;
    tds_amount: number;
    net_payable: number;
    po_invoice_amount: number;
    po_balance_amount: number;
    paid_amount: number;
    bank_name: string;
    utr_number: string;
    utr_date: string;
}

const VendorPurchaseInvoiceEdit = () => {
    const { vpiId } = useParams();
    const [vendorPurchaseData, setVendorPurchaseData] = useState<FormData>({
        id: undefined,
        purchase_order_id: 0,
        purchase_order: null,
        purchase_invoice_no: '',
        purchase_invoice_date: '',
        vendor_id: 0,
        vendor: null,
        business_task_id: 0,
        business_task: null,
        base_amount: 0,
        gst_percent: 0,
        gst_amount: 0,
        tds_deduction: 0,
        tds_amount: 0,
        net_payable: 0,
        po_invoice_amount: 0,
        po_balance_amount: 0,
        paid_amount: 0,
        bank_name: '',
        utr_number: '',
        utr_date: '',
    });

    const [combinedBTvalue, setCombinedBTvalue] = useState<string>('');
    const [isEditing, setIsEditing] = useState<boolean>(false);
    const [validated, setValidated] = useState<boolean>(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [proofOfPayment, setProofOfPayment] = useState<{ files?: string }>({});

    const [poPaymentDetails, setPoPaymentDetails] = useState<PaymentHistory[]>([]);

    type FileAttachmentKeys = 'proof_of_payment';

    const [fileAttachments, setFileAttachments] = useState<Record<FileAttachmentKeys, File[]>>({
        proof_of_payment: [],
    });
    const [fileValidations, setFileValidations] = useState<{ proof_of_payment?: string }>({});

    const { userPermission } = useAuth(); //check userRole & permissions
    const navigate = useNavigate();

    const handleVendorPurchaseList = () => {
        navigate(`/vendor-purchase-invoice`);
    };

    useEffect(() => {
        if(vpiId){
            setIsEditing(true);
            const fetchVendorPurchaseData = async() => {
                try {
                    const response = await axiosInstance.get(`/vendor-purchase-invoice/${vpiId}`);
                    if (response.status !== 200) {
                        throw new Error('Failed to fetch data');
                    }
                    const data = await response.data;
                    setVendorPurchaseData(data.vendor_purchase_invoice);
                    if(data.purchase_order_id != null){
                        setVendorPurchaseData(prev =>({
                            ...prev,
                            purchase_order: { id: data.po_details.id, purchase_order_number: data.po_details.purchase_order_number }
                        }))
                    }
                    if (data.paydetails != null){
                        setPoPaymentDetails(data.paydetails);
                    }
                    setCombinedBTvalue(`${data.vendor_purchase_invoice.business_task_id} - ${data.vendor_purchase_invoice.business_task?.customer_name}`);
                } catch (err: any) {
                    setError(err.data.message);
                }
            };
            fetchVendorPurchaseData();
        } else {
            handleVendorPurchaseList();
        }

    }, []);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setVendorPurchaseData({ ...vendorPurchaseData, [name]: value });
    };

    const handleDrop = (acceptedFiles: File[], fileName: FileAttachmentKeys) => {
        // Instead of creating a FileList, just update the files array
        setFileAttachments((prevState) => ({
            ...prevState,
            [fileName]: acceptedFiles, // acceptedFiles is already an array of File objects
        }));

        setFileValidations((prevErrors) => ({ ...prevErrors, [fileName]: undefined }));
    };

    const handleFileRemove = (index: number, fileName: FileAttachmentKeys) => {
        const updatedFiles = fileAttachments[fileName].filter((_, i) => i !== index);

        setFileAttachments((prevState) => ({
            ...prevState,
            [fileName]: updatedFiles, // Update the files with the new array
        }));
    };

    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        const form = event.currentTarget;
        if (!form.checkValidity()) {
            event.stopPropagation();
            setValidated(true);
            return;
        }

        try {
            // Create FormData for file uploads
            const formData = new FormData();

            if(!isEditing && fileAttachments.proof_of_payment.length < 1){
                setProofOfPayment({ files: 'Please upload at least one file.' });
                setValidated(true);
                return;
            }

            const response = await axiosInstance.post('/updateVendorPurchaseInvoice', {
                ...vendorPurchaseData,
                proof_of_payment: fileAttachments.proof_of_payment
            }, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });

            if (response.status === 200) {
                swal("Success!", response.data.message, "success");
                handleVendorPurchaseList(); // Redirect to list
            }
        } catch (error) {
            console.error('Error submitting form:', error);
            toast.error('Error occured while updating Vendor Purchase Invoice');
        }
    };

    if (error) return <div>Error: {error}</div>;
    return (
        <>
            <Row>
                <Col><h3 className='px-4 mb-2'>{isEditing ? 'Edit Vendor Purchase Invoice' : 'Add Vendor Purchase Invoice'}</h3></Col>
            </Row>
            <hr></hr>
            <Card style={{ width: '100%' }}>
                <Card.Body>
                    <Row className='border-bottom border-gray-200'>
                        <Col className="d-flex justify-content-end mb-2">
                            <Button
                                size='sm'
                                variant="primary"
                                className=""
                                startIcon={<FontAwesomeIcon icon={faCaretLeft} className="me-2" />}
                                onClick={() => handleVendorPurchaseList()}
                                >
                                    Vendor Purchase List
                            </Button>
                        </Col>
                    </Row>

                    <Row>
                        <Form noValidate validated={validated} onSubmit={handleSubmit}>

                            <Card.Title as="h5" className="mt-3 text-danger">Purchase Order Details</Card.Title>
                            <Row className='mb-2'>
                                <Form.Group as={Col} className="mb-3">
                                    <Form.Label>Purchase Order</Form.Label>
                                    <Form.Control type="text" name="purchase_order" value={vendorPurchaseData.purchase_order_id ? vendorPurchaseData.purchase_order?.purchase_order_number : ''} readOnly style={{backgroundColor: '#eff2f6b3', pointerEvents: 'none'}} />
                                </Form.Group>
                                <Form.Group as={Col} className="mb-3">
                                    <Form.Label>Business Task Id</Form.Label>
                                    <Form.Control type="text" name="business_task" value={combinedBTvalue} readOnly style={{backgroundColor: '#eff2f6b3', pointerEvents: 'none'}} />
                                </Form.Group>
                                <Form.Group as={Col} className="mb-3">
                                    <Form.Label>Vendor ID <span className="text-danger">*</span></Form.Label>
                                    <Form.Control type="text" name="vendor" value={vendorPurchaseData.vendor_id ? vendorPurchaseData.vendor?.name : ''} readOnly style={{backgroundColor: '#eff2f6b3', pointerEvents: 'none'}} />
                                </Form.Group>
                            </Row>

                            {poPaymentDetails.length > 0 && (
                                <>
                                    <Card.Title as="h5" className="mt-3 text-danger">Payment History</Card.Title>
                                    <table className='fs-8 table striped bordered mb-4'>
                                        <thead>
                                            <tr>
                                                <th className='p-2 border border-secondary-translucent'>Sr. No</th>
                                                <th className='p-2 border border-secondary-translucent'>Paid Amount</th>
                                                <th className='p-2 border border-secondary-translucent'>Bank</th>
                                                <th className='p-2 border border-secondary-translucent'>UTR Number</th>
                                                <th className='p-2 border border-secondary-translucent'>UTR Date</th>
                                                <th className='p-2 border border-secondary-translucent'>Balance Amount</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {poPaymentDetails.length > 0 && poPaymentDetails.map((pay: any,index) => (
                                                <tr key={index}>
                                                    <td className='p-2 border border-secondary-translucent'>{index + 1}</td>
                                                    <td className='p-2 border border-secondary-translucent'>{pay.paid_amount}</td>
                                                    <td className='p-2 border border-secondary-translucent'>{pay.bank_name}</td>
                                                    <td className='p-2 border border-secondary-translucent'>{pay.utr_number}</td>
                                                    <td className='p-2 border border-secondary-translucent'>{pay.utr_date}</td>
                                                    <td className='p-2 border border-secondary-translucent'>{pay.balance_amount}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </>
                            )}

                            <hr />
                            <Card.Title as="h5" className="text-danger">Vendor Invoice Details</Card.Title>

                            <Row className="g-3">
                                <Col md={4}>
                                    <Form.Group className="mb-3" controlId="purchase_invoice_no">
                                        <Form.Label>Purchase Invoice Number <span className="text-danger">*</span></Form.Label>
                                        <Form.Control type="text" placeholder="Enter invoice number" name="purchase_invoice_no" value={vendorPurchaseData.purchase_invoice_no} onChange={handleChange} required />
                                        <Form.Control.Feedback type="invalid">Please enter Purchase Invoice Number.</Form.Control.Feedback>
                                    </Form.Group>
                                </Col>
                                <Col md={4}>
                                    <Form.Group className="mb-3" controlId="purchase_invoice_date">
                                        <Form.Label>Purchase Invoice Date <span className="text-danger">*</span></Form.Label>
                                        <Form.Control type="date" name="purchase_invoice_date" value={vendorPurchaseData.purchase_invoice_date} onChange={handleChange} required />
                                        <Form.Control.Feedback type="invalid">Please enter purchase invoice date.</Form.Control.Feedback>
                                    </Form.Group>
                                </Col>
                            </Row>

                            <Row className="g-3">
                                <Col md={2}>
                                    <Form.Group as={Col} className="mb-3" controlId="paid_amount">
                                        <Form.Label>Paid Amount <span className="text-danger">*</span></Form.Label>
                                        <Form.Control type="number" min={0} placeholder="0.00" name="paid_amount" readOnly style={{backgroundColor: '#eff2f6b3', pointerEvents: 'none'}} value={vendorPurchaseData.paid_amount} onFocus={(e) => e.target.select()} />
                                        <Form.Control.Feedback type="invalid">Please enter Paid Amount.</Form.Control.Feedback>
                                    </Form.Group>
                                </Col>
                                <Col md={4}>
                                    <Form.Group as={Col} className="mb-3" controlId="bank_name">
                                        <Form.Label>Bank Name <span className="text-danger">*</span></Form.Label>
                                        <Form.Control type="text" placeholder="Bank Name" name="bank_name" value={vendorPurchaseData.bank_name} onChange={handleChange} required />
                                        <Form.Control.Feedback type="invalid">Please enter Bank Name.</Form.Control.Feedback>
                                    </Form.Group>
                                </Col>
                                <Col md={3}>
                                    <Form.Group as={Col} className="mb-3" controlId="utr_number">
                                        <Form.Label>UTR / Cheque Number <span className="text-danger">*</span></Form.Label>
                                        <Form.Control type="text"placeholder="eg txn ID" name="utr_number" value={vendorPurchaseData.utr_number} onChange={handleChange} required />
                                        <Form.Control.Feedback type="invalid">Please enter UTR / Cheque Number.</Form.Control.Feedback>
                                    </Form.Group>
                                </Col>
                                <Col md={3}>
                                    <Form.Group as={Col} className="mb-3" controlId="utr_date">
                                        <Form.Label>UTR / Cheque Date <span className="text-danger">*</span></Form.Label>
                                        <Form.Control type="date" name="utr_date" value={vendorPurchaseData.utr_date} onChange={handleChange} required />
                                        <Form.Control.Feedback type="invalid">Please enter UTR / Cheque Date.</Form.Control.Feedback>
                                    </Form.Group>
                                </Col>
                            </Row>

                            <hr />
                            <Card.Title as="h5" className="text-danger">Invoice Attachment</Card.Title>

                            <Row className='g-2'>
                                <Col md={6}>
                                    <Form.Label>Proof of Payment <span className="text-danger">*</span></Form.Label>
                                    <Dropzone onDrop={acceptedFiles => handleDrop(acceptedFiles, 'proof_of_payment')} onRemove={index => handleFileRemove(index, 'proof_of_payment')} />
                                    {proofOfPayment.files && <div className="text-danger mt-1">{proofOfPayment.files}</div>}
                                </Col>
                                <Col></Col>
                            </Row>

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

export default VendorPurchaseInvoiceEdit;

