import React, { useEffect, useState, useCallback } from 'react';
import { Form, Card, Row, Col, Alert, Tab, Nav } from 'react-bootstrap';
import { faPlus, faCaretLeft, faTrash } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import Button from '../../../components/base/Button';
import axiosInstance from '../../../axios';
import swal from 'sweetalert';
import { useAuth } from '../../../AuthContext';
import ReactSelect from '../../../components/base/ReactSelect';
import { useNavigate, useParams } from 'react-router-dom';
import { ToastContainer, toast } from "react-toastify";
import Dropzone from '../../../components/base/Dropzone';
import { downloadFile } from '../../../helpers/utils';
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

const VendorPurchaseForm = () => {
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

    const [isEditing, setIsEditing] = useState<boolean>(false);
    const [validated, setValidated] = useState<boolean>(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [proofOfPayment, setProofOfPayment] = useState<{ files?: string }>({});
    const [vendorData, setVendorData] = useState<VendorListingData[]>([]);
    const [btListingData, setBtListingData] = useState<BTListingData[]>([]);
    const [poData, setPoData] = useState<PurchaseOrderData[]>([]);
    const [poPaymentDetails, setPoPaymentDetails] = useState<PaymentHistory[]>([]);
    const [isBusinessTaskDisabled, setIsBusinessTaskDisabled] = useState(false); // State for disabling select
    const [isVendorSelectDisabled, setIsVendorSelectDisabled] = useState(false); // State for disabling select
    const [isBaseAmountDisabled, setIsBaseAmountDisabled] = useState(false); // State for disabling base amount
    const [isPaidAmountDisabled, setIsPaidAmountDisabled] = useState(false); // State for disabling select
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

    const handlePDFclicked = async (quoteId: number, path: string) => {
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

    useEffect(() => {
        const fetchPOListData = async() => {
            try {
                const response = await axiosInstance.get(`/po_vendor_only_listing`, {
                    params: { sort: 'desc' }
                });
                if (response.status !== 200) {
                    throw new Error('Failed to fetch data');
                }
                const data: PurchaseOrderData[] = await response.data;
                setPoData(data);
            } catch (err: any) {
                setError(err.data.message);
            }
        };
        const fetchBusinessTaskListing = async () => {
            try {
                const response = await axiosInstance.get(`/btDropdownListing`);
                if (response.status !== 200) {
                    throw new Error('Failed to fetch data');
                }
                const data: BTListingData[] = response.data;
                setBtListingData(data);
            } catch (err: any) {
                setError(err.data.message);
            }
        };
        const fetchVendorData = async () => {
            try {
                const response = await axiosInstance.get(`/vendorsList`);
                if (response.status !== 200) {
                    throw new Error('Failed to fetch data');
                }
                const data: VendorListingData[] = response.data;
                setVendorData(data);
            } catch (err: any) {
                setError(err.data.message);
            }
        };

        fetchPOListData();
        fetchBusinessTaskListing();
        fetchVendorData();
    }, []);


    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        if(vendorPurchaseData.purchase_order_id != 0){
            if(name == 'paid_amount' && vendorPurchaseData.po_balance_amount < Number(value) ){
                toast('Paid amount cannot be greater than balance amount');
                return;
            }
        }
        setVendorPurchaseData({ ...vendorPurchaseData, [name]: value });
    };

    const handleAlphaNumeric = (e) => {
        const input = e.target;
        const value = input.value;
        const alphaNumericRegex = /[^a-zA-Z0-9\s]/g; // Allows whitespace

        if (alphaNumericRegex.test(value)) {
            input.value = value.replace(alphaNumericRegex, ''); // Remove non-alphanumeric
            e.preventDefault(); // Prevent the character from being entered
        }
    };

    const handlePurchaseOrderInputChange = (selectedOption: any ) => {
        if (selectedOption) {
            setIsVendorSelectDisabled(false); // Disable the select after fetching data
            setIsBusinessTaskDisabled(false); // Disable the select after fetching data
            setVendorPurchaseData(prev => ({
                ...prev,
                purchase_order: { id: selectedOption.value, purchase_order_number: selectedOption.label },
                purchase_order_id: selectedOption.value
            }));
            try {
                axiosInstance.get(`/getPaymentHistories`, {
                    params: {
                        po_id: selectedOption.value
                    }
                })
                .then(response => {
                    const resp = response.data;
                    const po_details = response.data.po_details;
                    const pay_details: PaymentHistory[] = response.data.paydetails;
                    setPoPaymentDetails(pay_details);
                    const total = po_details.total;
                    const grandTotal = po_details.grand_total;
                    let gstAmount = 0;
                    let gstPercent = 0;
                    if(po_details.document_type == 'Domestic') {
                        gstAmount = Number((grandTotal - total).toFixed(2));
                        gstPercent = Math.trunc((gstAmount / total) * 100);
                    }
                    if(po_details.business_task_id != null){
                        setVendorPurchaseData(prev => ({
                            ...prev,
                            business_task: po_details.business_task,
                            business_task_id: po_details.business_task_id,
                        }));
                        setIsBusinessTaskDisabled(true);
                    }
                    if(po_details.ffd_id != null){
                        toast("This is a Freight(FFD) Purchase Order. Leave Vendor ID as blank");
                        // Update base_amount and po_invoice_amount in vendorPurchaseData
                        setVendorPurchaseData(prev => ({
                            ...prev,
                            vendor_id: 0,
                            vendor: null,
                            base_amount: total,           // Assign total to base_amount
                            gst_percent: gstPercent,      // Assign total to base_amount
                            gst_amount: gstAmount,        // Assign total to base_amount
                            po_invoice_amount: grandTotal // Assign grandTotal to po_invoice_amount
                        }));
                    }
                    if(po_details.vendor_id != null){
                        // Update base_amount and po_invoice_amount in vendorPurchaseData
                        setVendorPurchaseData(prev => ({
                            ...prev,
                            vendor_id: po_details.vendor_id,
                            vendor: po_details.vendor,
                            base_amount: total,           // Assign total to base_amount
                            gst_percent: gstPercent,      // Assign total to base_amount
                            gst_amount: gstAmount,        // Assign total to base_amount
                            po_invoice_amount: grandTotal // Assign grandTotal to po_invoice_amount
                        }));
                        setIsVendorSelectDisabled(true); // Disable the select after fetching data
                    }
                });
            } catch (err: any) {
                swal("Error!", err.data.message, "error");
            }
        }
    };

    useEffect(() => {
        calculateTotals();
    }, [vendorPurchaseData.base_amount, vendorPurchaseData.gst_percent, vendorPurchaseData.tds_deduction]);

    useEffect(() => {
        if(vendorPurchaseData.purchase_order_id != 0) {
            setIsPaidAmountDisabled(false);
            setIsBaseAmountDisabled(true);
        } else {
            setIsPaidAmountDisabled(true);
            setIsBaseAmountDisabled(false);
        }
    }, [vendorPurchaseData.purchase_order_id]);

    const calculateTotals = () => {

        let base_amount = 0;
        let gst_percent = 0;
        let gst_amount = 0;
        let tds_deduction = 0;
        let tds_amount = 0;
        let net_payable = 0;
        let po_balance_amount = 0;

        let paid_total = 0;
        poPaymentDetails.map(item => {
            paid_total += Number(item.paid_amount);
        });

        base_amount = Number(vendorPurchaseData.base_amount);
        gst_percent = Number(vendorPurchaseData.gst_percent);

        gst_amount = (base_amount / 100) * gst_percent;

        tds_deduction = Number(vendorPurchaseData.tds_deduction);
        tds_amount = (base_amount / 100) * tds_deduction;

        net_payable = base_amount + gst_amount - tds_amount;

        if(vendorPurchaseData.purchase_order_id != 0){
            po_balance_amount = (paid_total > 0) ? net_payable - paid_total : net_payable;
        } else {
            po_balance_amount = net_payable;
        }

        setVendorPurchaseData(prev => ({
            ...prev,
            base_amount: base_amount,
            gst_percent: gst_percent,
            gst_amount: Number(gst_amount.toFixed(2)),
            tds_deduction: tds_deduction,
            tds_amount: Number(tds_amount.toFixed(2)),
            net_payable: Number(net_payable.toFixed(2)),
            po_balance_amount: Number(po_balance_amount.toFixed(2)),
            paid_amount: po_balance_amount,
        }));
    };

    const handleVendorSelect = (selectedOption: any) => {
        if (selectedOption) {
            setVendorPurchaseData(prev => ({
                ...prev,
                vendor: { id: selectedOption.value, name: selectedOption.label },
                vendor_id: selectedOption.value
            }));
        }
    };
    const handleBTselection = (selectedOption: any) => {
        if (selectedOption) {
            setVendorPurchaseData(prev => ({
                ...prev,
                business_task: { id: selectedOption.value, customer_name: selectedOption.label },
                business_task_id: selectedOption.value
            }));
        }
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
        if(vendorPurchaseData.paid_amount <= 0) {
            toast.error('Paid amount cannot be 0');
            return;
        }
        setLoading(true);
        setValidated(true);
        try {
            // Create FormData for file uploads
            const formData = new FormData();

            if(!isEditing && fileAttachments.proof_of_payment.length < 1){
                setProofOfPayment({ files: 'Please upload at least one file.' });
                setValidated(true);
                return;
            }

            const response = await axiosInstance.post('/vendor-purchase-invoice', {
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
            toast.error('Error creating vendor purchase invoice');
        } finally {
            setLoading(false)
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
                                    <ReactSelect
                                        options= {poData.map((option: PurchaseOrderData) => (
                                            { value: option.id, label: option.purchase_order_number }
                                        ))}
                                        placeholder="Select Purchase Order" name="purchase_order" value={vendorPurchaseData.purchase_order ? { value: vendorPurchaseData.purchase_order.id, label: vendorPurchaseData.purchase_order.purchase_order_number } : null} onChange={(selectedOption) => handlePurchaseOrderInputChange(selectedOption)} />
                                    <Form.Control type="hidden" name="purchase_order_id" value={vendorPurchaseData.purchase_order_id } />
                                </Form.Group>
                                <Form.Group as={Col} className="mb-3">
                                    <Form.Label>Business Task Id</Form.Label>
                                    <ReactSelect
                                        options= {btListingData.map((option: BTListingData) => (
                                            { value: option.id, label: `${option.id} (${option.customer_name})` }
                                        ))}
                                        placeholder="Select Business Task" name="business_task" value={vendorPurchaseData.business_task ? { value: vendorPurchaseData.business_task.id, label: vendorPurchaseData.business_task.customer_name } : null} onChange={(selectedOption) => handleBTselection(selectedOption)} isDisabled={isBusinessTaskDisabled} />
                                    <Form.Control type="hidden" name="business_task_id" value={vendorPurchaseData.business_task_id} />
                                </Form.Group>
                                <Form.Group as={Col} className="mb-3">
                                    <Form.Label>Vendor ID <span className="text-danger">*</span></Form.Label>
                                    <ReactSelect
                                        options= {vendorData.map((option: VendorListingData) => (
                                            { value: option.id, label: option.name }
                                        ))}
                                        placeholder="Select Vendor" name="vendor" value={vendorPurchaseData.vendor ? { value: vendorPurchaseData.vendor.id, label: vendorPurchaseData.vendor.name } : null} onChange={(selectedOption) => handleVendorSelect(selectedOption)} isDisabled={isVendorSelectDisabled} required />
                                    <Form.Control type="hidden" name="vendor_id" value={vendorPurchaseData.vendor_id} />
                                    {validated && !vendorPurchaseData.vendor_id && (
                                        <div className="invalid-feedback d-block">Please select Vendor Id</div>
                                    )}
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

                            <Card.Title as="h5" className="text-danger">Tax Details</Card.Title>

                            <Row className="g-3">
                                <Form.Group as={Col} className="mb-3" controlId="base_amount">
                                    <Form.Label>Base Amount <span className="text-danger">*</span></Form.Label>
                                    <Form.Control type="number" min={0} placeholder="0.00" name="base_amount" value={vendorPurchaseData.base_amount} disabled={isBaseAmountDisabled} onChange={handleChange} required onFocus={(e) => e.target.select()} />
                                    <Form.Control.Feedback type="invalid">Please enter base amount.</Form.Control.Feedback>
                                </Form.Group>
                                <Form.Group as={Col} className="mb-3" controlId="gst_percent">
                                    <Form.Label>GST % <span className="text-danger">*</span></Form.Label>
                                    <Form.Select name="gst_percent" value={vendorPurchaseData.gst_percent} disabled={isBaseAmountDisabled} onChange={handleChange}>
                                        <option value="0">0%</option>
                                        <option value="5">5%</option>
                                        <option value="12">12%</option>
                                        <option value="18">18%</option>
                                        <option value="28">28%</option>
                                    </Form.Select>
                                    <Form.Control.Feedback type="invalid">Please select GST percentage.</Form.Control.Feedback>
                                </Form.Group>
                                <Form.Group as={Col} className="mb-3" controlId="gst_amount">
                                    <Form.Label>GST Amount</Form.Label>
                                    <Form.Control type="number" min={0} placeholder="0.00" name="gst_amount" value={vendorPurchaseData.gst_amount} readOnly style={{backgroundColor: '#eff2f6b3', pointerEvents: 'none'}} />
                                    <Form.Control.Feedback type="invalid">Please enter GST amount</Form.Control.Feedback>
                                </Form.Group>
                            </Row>

                            <Row className="g-3">
                                <Col md={4}>
                                    <Form.Group as={Col} className="mb-3" controlId="tds_deduction">
                                        <Form.Label>TDS Deduction Percentage</Form.Label>
                                        <Form.Control type="number" min={0} max={100} maxLength={3} placeholder="Enter %, if not applicable then enter 0 e.g. 2 (only number)" name="tds_deduction" value={vendorPurchaseData.tds_deduction} onChange={handleChange} required onFocus={(e) => e.target.select()}/>
                                        <Form.Control.Feedback type="invalid">Please enter tds percent, enter 0 if not applicable</Form.Control.Feedback>
                                    </Form.Group>
                                </Col>
                                <Col md={4}>
                                    <Form.Group as={Col} className="mb-3" controlId="tds_amount">
                                        <Form.Label>TDS Amount</Form.Label>
                                        <Form.Control name="tds_amount" value={vendorPurchaseData.tds_amount} readOnly style={{backgroundColor: '#eff2f6b3', pointerEvents: 'none'}} />
                                        <Form.Control.Feedback type="invalid">Please enter TDS amount.</Form.Control.Feedback>
                                    </Form.Group>
                                </Col>
                                {vendorPurchaseData.purchase_order_id !== 0 && (
                                    <>
                                        <Col md={4}>
                                            <Form.Group as={Col} className="mb-3" controlId="po_invoice_amount">
                                                <Form.Label>PO Grand Total <span className="text-danger">*</span></Form.Label>
                                                <Form.Control type="number" min={0} placeholder="0.00" name="po_invoice_amount" value={vendorPurchaseData.po_invoice_amount} readOnly style={{backgroundColor: '#eff2f6b3', pointerEvents: 'none'}} />
                                                <Form.Control.Feedback type="invalid">Please enter grand total.</Form.Control.Feedback>
                                            </Form.Group>
                                        </Col>
                                        <Col md={4}>
                                            <Form.Group as={Col} className="mb-3" controlId="po_balance_amount">
                                                <Form.Label><b>Balance Amount</b></Form.Label>
                                                <Form.Control type="number" min={0} placeholder="Enter %, if not applicable then enter zero e.g. 2 (only number)" name="po_balance_amount" value={vendorPurchaseData.po_balance_amount} readOnly style={{backgroundColor: '#eff2f6b3', pointerEvents: 'none'}} required />
                                                <Form.Control.Feedback type="invalid">Please enter tds percent, enter 0 if not applicable</Form.Control.Feedback>
                                            </Form.Group>
                                        </Col>
                                        <Col md={4}></Col>
                                    </>
                                )}
                                <Col md={4}>
                                    <Form.Group as={Col} className="mb-3" controlId="net_payable">
                                        <Form.Label>Net Payable(after TDS deduction) <span className="text-danger">*</span></Form.Label>
                                        <Form.Control name="net_payable" value={vendorPurchaseData.net_payable} readOnly style={{backgroundColor: '#eff2f6b3', pointerEvents: 'none'}} />
                                        <Form.Control.Feedback type="invalid">Please enter TDS amount.</Form.Control.Feedback>
                                    </Form.Group>
                                </Col>
                            </Row>



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
                                        {/* pay_history_id */}
                                        <Form.Control type="number" min={0} step="0.01" placeholder="0.00" name="paid_amount" value={vendorPurchaseData.paid_amount} disabled={isPaidAmountDisabled} onChange={handleChange} required onFocus={(e) => e.target.select()}/>
                                        <Form.Control.Feedback type="invalid">Please enter Paid Amount.</Form.Control.Feedback>
                                    </Form.Group>
                                </Col>
                                <Col md={4}>
                                    <Form.Group as={Col} className="mb-3" controlId="bank_name">
                                        <Form.Label>Bank Name <span className="text-danger">*</span></Form.Label>
                                        <Form.Control type="text" placeholder="Bank Name" name="bank_name" value={vendorPurchaseData.bank_name} onChange={handleChange} required onInput={(e) => handleAlphaNumeric(e)} />
                                        <Form.Control.Feedback type="invalid">Please enter Bank Name.</Form.Control.Feedback>
                                    </Form.Group>
                                </Col>
                                <Col md={3}>
                                    <Form.Group as={Col} className="mb-3" controlId="utr_number">
                                        <Form.Label>UTR / Cheque Number <span className="text-danger">*</span></Form.Label>
                                        <Form.Control type="text"placeholder="eg txn ID" name="utr_number" value={vendorPurchaseData.utr_number} onChange={handleChange} required onInput={(e) => handleAlphaNumeric(e)} />
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

export default VendorPurchaseForm;

