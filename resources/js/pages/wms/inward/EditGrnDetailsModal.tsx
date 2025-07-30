import React, { useEffect, useState } from 'react';
import { Form, Modal, Row, Col, Card } from 'react-bootstrap';
import Button from '../../../components/base/Button';
import axiosInstance from '../../../axios';
import swal from 'sweetalert';
import { useAuth } from '../../../AuthContext';
import { ToastContainer, toast } from "react-toastify";
import { faDownload } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import ReactSelect from '../../../components/base/ReactSelect';

interface PurchaseOrderData {
    id: number;
    purchase_order_number: string;
    po_type?: string;
    vendor_id?: number;
}

interface FormData {
    id: number;
    inward_id: number;
    grn_number: string;
    purchase_order: PurchaseOrderData | null;
    purchase_order_id: number;
    vendor_tax_invoice_number: string;
    vendor_tax_invoice_date: string;
    inv_attachment?: string;
    vendor_tax_invoice_attachment: null,
}

interface EditGrnModalProps {
    inwardId: number;
    grnId: number;
    handleDownload: (name: string, path: string) => void;
    onSuccess: () => void;
    onHide: () => void;
}

const EditGrnDetailsModal: React.FC<EditGrnModalProps> = ({
    inwardId,
    grnId,
    handleDownload,
    onSuccess,
    onHide
}) => {
    const [inwardData, setInwardData] = useState<FormData>({
        id: 0,
        inward_id: inwardId,
        grn_number: '',
        purchase_order: null,
        purchase_order_id: 0,
        vendor_tax_invoice_number: '',
        vendor_tax_invoice_date: '',
        vendor_tax_invoice_attachment: null,
    });

    const [validated, setValidated] = useState<boolean>(false);
    const [vendorId, setVendorId] = useState<number | undefined>(0);
    const [vendorName, setVendorName] = useState<string>('');
    const [poData, setPoData] = useState<PurchaseOrderData[]>([]);
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    type FileAttachmentNames = 'vendor_tax_invoice_attachment';

    useEffect(() => {
        const fetchPoListing = async() => {
            try {
                const response = await axiosInstance.get(`/po_listing`);
                if (response.status !== 200) {
                    throw new Error('Failed to fetch data');
                }
                const data: PurchaseOrderData[] = await response.data;
                setPoData(data);
            } catch (err: any) {
                setError(err.data.message);
            }
        };
        fetchPoListing();
    }, []);

    useEffect(() => {
        const fetchGrnDetails = async() => {
            try {
                setVendorName('');
                setVendorId(0);
                const response = await axiosInstance.get(`/getGrnDetails`,{
                    params: { id: grnId }
                });
                if (response.status !== 200) {
                    throw new Error('Failed to fetch data');
                }
                const data: FormData = await response.data;
                if(data.purchase_order?.po_type == 'ffd') {
                    toast.error('Vendor name is not present as selected Purchase Order is of type FFD');
                } else{
                    setVendorId(data.purchase_order?.id);
                }
                setInwardData(data);

            } catch (err: any) {
                setError(err.data.message);
            }
        };
        if(poData.length > 0) {
            fetchGrnDetails();
        }
    }, [poData]);

    useEffect(() => {
        const fetchVendorDetails = async() => {
            try {
                const response = await axiosInstance.get(`/getPOVendorName?po_id=${vendorId}`);
                if (response.status !== 200) {
                    throw new Error('Failed to fetch data');
                }
                const data = await response.data;
                setVendorName(data);
            } catch (err: any) {
                setError(err.data.message);
            }
        };
        if(vendorId !== 0) {
            fetchVendorDetails();
        }
    }, [vendorId]);



    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setInwardData({ ...inwardData, [name]: value });
    };

    const handlePurchaseOrderInputChange = (selectedOption: any) => {
        if (selectedOption) {
            setInwardData(prev => ({
                ...prev,
                purchase_order: {
                    id: selectedOption.value,
                    purchase_order_number: selectedOption.label
                },
                purchase_order_id: selectedOption.value
            }));
            setVendorId(selectedOption.value);
        }
    };

    // Handler function for the file input change event
    const handleFileChange = (fileEvent: any, fileName: FileAttachmentNames) => {

        const file = fileEvent.target.files ? fileEvent.target.files[0] : null;
        setInwardData(prev => {
            const newData = { ...prev };
            newData.vendor_tax_invoice_attachment = file;
            return newData;
        });
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

        const apiCall = axiosInstance.post('/editPODetailsWMS', {
            grn_id: grnId,
            ...inwardData
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
            <Modal show onHide={onHide} size='lg' backdrop="static" keyboard={false}>
                <Modal.Header closeButton>
                    <Modal.Title>Freight Enquiry form </Modal.Title>
                </Modal.Header>
                <Form noValidate validated={validated} onSubmit={handleSubmit}>
                    <Modal.Body>
                        <Row className='g-2'>
                            <Form.Group as={Col} className="mb-3">
                                <Form.Label>Purchase Order Number <span className="text-danger">*</span></Form.Label>
                                <ReactSelect
                                    options= {poData.map((option: PurchaseOrderData) => (
                                        { value: option.id, label: option.purchase_order_number }
                                    ))}
                                    placeholder="Select Purchase Order" name="purchase_order" value={inwardData.purchase_order ? { value: inwardData.purchase_order.id, label: inwardData.purchase_order.purchase_order_number } : null} onChange={(selectedOption) => handlePurchaseOrderInputChange(selectedOption)} required
                                />
                                <Form.Control type="hidden" name="purchase_order_id" value={inwardData.purchase_order_id } />
                                {validated && !inwardData.purchase_order_id && (
                                    <div className="invalid-feedback d-block">Please select Purchase Order</div>
                                )}
                            </Form.Group>
                            <Form.Group as={Col} className="mb-3"  controlId={`vendor_name`}>
                                <Form.Label>Vendor Name <span className="text-danger">*</span></Form.Label>
                                <Form.Control type="text" placeholder="vendor name" name={`vendor_name`} value={vendorName} readOnly />
                            </Form.Group>
                        </Row>

                        <Row className='g-2'>
                            <Form.Group as={Col} className="mb-3"  controlId={`vendor_tax_invoice_number`}>
                                <Form.Label>Vendor Tax Invoice Number <span className="text-danger">*</span></Form.Label>
                                <Form.Control type="text" placeholder="Enter Vendor Tax Invoice Number" name={`vendor_tax_invoice_number`} value={inwardData.vendor_tax_invoice_number} onChange={handleChange} required />
                                <Form.Control.Feedback type="invalid">Please enter Vendor Tax Invoice Number.</Form.Control.Feedback>
                            </Form.Group>
                            <Form.Group as={Col} className="mb-3" controlId={`vendor_tax_invoice_date`}>
                                <Form.Label>Vendor Tax Invoice Date <span className="text-danger">*</span></Form.Label>
                                <Form.Control type="date" placeholder="Enter location" name={`vendor_tax_invoice_date`} value={inwardData.vendor_tax_invoice_date} onChange={handleChange} required />
                                <Form.Control.Feedback type="invalid">Please enter Vendor Tax Invoice Date.</Form.Control.Feedback>
                            </Form.Group>
                            <Form.Group as={Col} className="mb-3" controlId={`vendor_tax_invoice_attachment`}>
                                <Form.Label>Vendor Tax Invoice Attachment <span className="text-danger">*</span></Form.Label>
                                <Form.Control type="file" name='vendor_tax_invoice_attachment' onChange={(fileEvent) => handleFileChange(fileEvent, 'vendor_tax_invoice_attachment') } />
                                <Form.Control.Feedback type="invalid">Please enter Vendor Tax Invoice Attachment.</Form.Control.Feedback>
                                {inwardData.inv_attachment !== null && (
                                    <Button
                                        className="text-primary p-0"
                                        variant="link"
                                        title="Download"
                                        onClick={() => handleDownload(inwardData.inv_attachment, 'uploads/wms/vendor_tax_invoice/')}
                                        startIcon={<FontAwesomeIcon icon={faDownload} />}
                                    >
                                        {inwardData.inv_attachment}
                                    </Button>
                                )}
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
            <ToastContainer className='py-0' />
        </>
    );
};

export default EditGrnDetailsModal;
