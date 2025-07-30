import React, { useEffect, useState } from 'react';
import { Form, Modal, Row, Col, Card } from 'react-bootstrap';
import Button from '../../../components/base/Button';
import axiosInstance from '../../../axios';
import swal from 'sweetalert';
import { useAuth } from '../../../AuthContext';
import { ToastContainer, toast } from "react-toastify";
import { PaymentHistory } from '../../productivity/business-task/AccountsWorksheet'

interface PurchaseOrderData {
    id: number;
    purchase_order_number: string;
}

interface BTListingData {
    id: number;
    customer_name: string;
}
interface VendorListingData {
    id: number;
    name: string;
}
interface FormData {
    id: number | undefined;
    purchase_order_id: number;
    purchase_order: PurchaseOrderData | null;
    vendor_id: number;
    vendor: VendorListingData | null;
    business_task: BTListingData | null;
    business_task_id: number;
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
    payment_history_attach: File | null;
}

interface PoPaymentModalProps {
    poId: number;
    onHide: () => void;
    onSuccess: () => void;
}

const PurchaseOrderPaymentModal: React.FC<PoPaymentModalProps> = ({ poId, onHide, onSuccess }) => {
        const [vendorPurchaseData, setVendorPurchaseData] = useState<FormData>({
        id: undefined,
        purchase_order_id: poId,
        purchase_order: null,
        vendor_id: 0,
        vendor: null,
        business_task: null,
        business_task_id: 0,
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
        payment_history_attach: null
    });
    const [isEditing, setIsEditing] = useState<boolean>(false);
    const [validated, setValidated] = useState<boolean>(false);
    const [isBaseAmountDisabled, setIsBaseAmountDisabled] = useState(false); // State for disabling base amount
    const [isVendorSelectDisabled, setIsVendorSelectDisabled] = useState(false); // State for disabling select
    const [poPaymentDetails, setPoPaymentDetails] = useState<PaymentHistory[]>([]);
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState<{ files?: string }>({});
    const { empData } = useAuth(); //check userRole & permissions

    useEffect(() => {

        if (poId) {
            try{
                axiosInstance.get(`/getPaymentHistories`, {
                    params: {
                        po_id: poId
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
                    }
                    if(po_details.ffd_id != null){
                        toast("This is a Freight(FFD) Purchase Order. Leave Vendor ID as blank");
                        // Update base_amount and po_invoice_amount in vendorPurchaseData
                        setVendorPurchaseData(prev => ({
                            ...prev,
                            vendor_id: 0,
                            vendor: null,
                            purchase_order: { id: poId, purchase_order_number: po_details.purchase_order_number },
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
                            purchase_order: { id: poId, purchase_order_number: po_details.purchase_order_number },
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
    }, [poId]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        if(name == 'paid_amount' && vendorPurchaseData.po_balance_amount < Number(value) ){
            toast('Paid amount cannot be greater than Balance Amount');
            return;
        }
        setVendorPurchaseData({ ...vendorPurchaseData, [name]: value });
    };

    // Handler function for the file input change event
    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files ? event.target.files[0] : null;
        setVendorPurchaseData({ ...vendorPurchaseData, payment_history_attach: file });
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

    useEffect(() => {
        setIsBaseAmountDisabled(true);
        calculateTotals();
    }, [vendorPurchaseData.base_amount, vendorPurchaseData.gst_percent, vendorPurchaseData.tds_deduction]);
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

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const form = e.currentTarget;
        if (form.checkValidity() === false) {
            e.preventDefault();
            e.stopPropagation();
            setValidated(true);
            return;
        }
        if(vendorPurchaseData.paid_amount <= 0) {
            toast.error('Paid amount cannot be 0');
            return;
        }

        setLoading(true);
        setValidated(true);

        const apiCall = axiosInstance.post('/addPayment', {
                ...vendorPurchaseData
            }, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            }
        );

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
            <Modal show onHide={onHide} size='xl' backdrop="static" keyboard={false}>
                <Modal.Header closeButton>
                    <Modal.Title>Add payment history for <span className='text-danger'> {vendorPurchaseData.purchase_order?.purchase_order_number}</span> Vendor : <span className='text-danger'>{vendorPurchaseData.vendor?.name}</span> BT ID : <span className='text-danger'>{vendorPurchaseData.business_task?.id}</span></Modal.Title>
                </Modal.Header>
                <Form noValidate validated={validated} onSubmit={handleSubmit}>
                    <Modal.Body>
                        <Form.Control type="hidden" name="purchase_order_id" value={vendorPurchaseData.purchase_order_id} />

                        {poPaymentDetails.length > 0 && (
                                <>
                                    <Card.Title as="h5" className="my-3 text-danger">Payment History</Card.Title>
                                    <table className='fs-9 table striped bordered mb-4'>
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
                                        <Form.Control type="number" step={0.1} min={0} max={100} maxLength={3} placeholder="Enter %, if not applicable then enter 0 e.g. 2 (only number)" name="tds_deduction" value={vendorPurchaseData.tds_deduction} onChange={handleChange} required onFocus={(e) => e.target.select()} />
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
                            <Row className="g-3">
                                <Col md={2}>
                                    <Form.Group as={Col} className="mb-3" controlId="paid_amount">
                                        <Form.Label>Paid Amount <span className="text-danger">*</span></Form.Label>
                                        {/* pay_history_id */}
                                        <Form.Control type="number" min={0} placeholder="0.00" name="paid_amount" value={vendorPurchaseData.paid_amount} onChange={handleChange} required onFocus={(e) => e.target.select()} />
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
                            <Row className='g-3'>
                                <Form.Group as={Col} className="col-md-4 mb-3" controlId="payment_history_attach">
                                    <Form.Label>Attachment <span className="text-danger">*</span> <small>(Maximum file upload size is 2MB)</small></Form.Label>
                                    <Form.Control type="file" name='payment_history_attach' onChange={handleFileChange}/>
                                    <Form.Control.Feedback type="invalid">Please enter Business card.</Form.Control.Feedback>

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
            <ToastContainer className='py-0' />
        </>
    );
};

export default PurchaseOrderPaymentModal;
