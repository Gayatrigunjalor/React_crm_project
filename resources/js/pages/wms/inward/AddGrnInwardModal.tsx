import React, { useEffect, useState, useCallback } from 'react';
import { Form, Modal, Row, Col, Card, Nav, Tab } from 'react-bootstrap';
import Button from '../../../components/base/Button';
import axiosInstance from '../../../axios';
import swal from 'sweetalert';
import { useAuth } from '../../../AuthContext';
import ReactSelect from '../../../components/base/ReactSelect';
import { faDownload } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { downloadFile } from '../../../helpers/utils';
import { faPlus, faTrash } from '@fortawesome/free-solid-svg-icons';
import { ToastContainer, toast } from "react-toastify";

interface ProductsData {
    id: number;
    product_code: string;
    product_name: string;
}
interface LocationDetailsData{
    id: number;
    warehouse_name: string;
    rack_number: string;
    floor: string;
}
interface PurchaseOrderData {
    id: number;
    purchase_order_number: string;
}
interface BoxProductData {
    wms_product_id: number;
    product_details: { id: number; product_name: string } | null;
    product_id: number;
    hazardous_symbol: string;
    product_quantity: number | undefined;
    product_hsn: number | undefined;
    manufacture_year: any;
    box_content: any;
    [key: string]: any; // Allow dynamic keys
}
interface BoxData {
    wms_box_id: number;
    location_detail: { id: number; location: string; } | null;
    location_detail_id: number;
    net_weight: number | undefined;
    gross_weight: number | undefined;
    length: number | undefined;
    width: number | undefined;
    height: number | undefined;
    haz_symbol_attachment: File | null;
    box_sr_no_attachment: File | null;
    product_attachment: File | null;
    haz_attachment?: null;
    serial_attachment?: null;
    prod_image?: [];
    box_products: BoxProductData[];
}

interface FormData {
    inward_id: number;
    purchase_order: { id: number; purchase_order_number: string; } | null;
    purchase_order_id: number;
    vendor_tax_invoice_number: string;
    vendor_tax_invoice_date: string;
    vendor_tax_invoice_attachment: File | null;
    box_data: BoxData[];
}

interface BoxAttachments {
    haz_symbol_attachment: File | null;
    box_sr_no_attachment: File | null;
    product_attachment: File | null;
}

interface GrnAttachments {
    vendor_tax_invoice_attachment: File | null;
}

type FormControlElement = HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement;
type FileInputEvent = React.ChangeEvent<HTMLInputElement>;
type FormControlEvent = React.ChangeEvent<FormControlElement>;

interface GrnModalProps {
    inwardId: number;
    onHide: () => void;
    onSuccess: () => void;
}


const AddGrnInwardModal: React.FC<GrnModalProps> = ({ inwardId, onHide, onSuccess }) => {

    const [grnData, setGrnData] = useState<FormData>({
        inward_id: inwardId,
        purchase_order: null,
        purchase_order_id: 0,
        vendor_tax_invoice_number: '',
        vendor_tax_invoice_date: '',
        vendor_tax_invoice_attachment: null,
        box_data:[{
            wms_box_id: 0,
            location_detail: null,
            location_detail_id: 0,
            net_weight: undefined,
            gross_weight: undefined,
            length: undefined,
            width: undefined,
            height: undefined,
            haz_symbol_attachment: null,
            box_sr_no_attachment: null,
            product_attachment: null,
            haz_attachment: null,
            serial_attachment: null,
            prod_image: [],
            box_products: [{
                wms_product_id: 0,
                product_details: null,
                product_id: 0,
                hazardous_symbol: '',
                product_quantity: undefined,
                product_hsn: undefined,
                manufacture_year: undefined,
                box_content: undefined,
            }]
        }]
    });
    const [isEditing, setIsEditing] = useState<boolean>(false);
    const [validated, setValidated] = useState<boolean>(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [poData, setPoData] = useState<PurchaseOrderData[]>([]);
    const [productsData, setProductsData] = useState<ProductsData[]>([]);
    const [locationDetailsData, setLocationDetailsData] = useState<LocationDetailsData[]>([]);
    const [activeBoxTabs, setActiveBoxTabs] = useState<{ [key: string]: string }>({ 'grn_1': 'box_1' })

    type FileAttachmentNames = 'vendor_tax_invoice_attachment' | 'haz_symbol_attachment' | 'box_sr_no_attachment' | 'product_attachment';


    useEffect(() => {
        const fetchPOListData = async() => {
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
        const fetchProducts = async () => {
            try {
                const response = await axiosInstance.get('/productList');
                if (response.status !== 200) {
                    throw new Error('Failed to fetch data');
                }
                const data: ProductsData[] = await response.data;
                setProductsData(data);
            } catch (err: any) {
                setError(err.message);
            } finally {
            }
        };
        const fetchlocationDetails = async () => {
            try {
                const response = await axiosInstance.get(`/locationDetailListing`);
                if (response.status !== 200) {
                    throw new Error('Failed to fetch data');
                }
                const data: LocationDetailsData[] = response.data;
                setLocationDetailsData(data);
            } catch (err: any) {
                setError(err.data.message);
            }
        };
        fetchPOListData();
        fetchProducts();
        fetchlocationDetails();
    }, []);


    // Add new box to specific GRN
    const handleAddBox = useCallback(() => {
        // Get current box count before update
        const currentBoxCount = grnData.box_data.length;
        const newBoxId = currentBoxCount + 1;

        setGrnData(prev => {
            // Ensure we're working with the latest state
            const newFormData = JSON.parse(JSON.stringify(prev));
            newFormData.box_data.push({
                wms_box_id: 0,
                location_detail: null,
                location_detail_id: 0,
                net_weight: undefined,
                gross_weight: undefined,
                length: undefined,
                width: undefined,
                height: undefined,
                haz_symbol_attachment: null,
                box_sr_no_attachment: null,
                product_attachment: null,
                box_products: [{
                    wms_product_id: 0,
                    product: null,
                    product_id: 0,
                    hazardous_symbol: '',
                    product_quantity: undefined,
                    product_hsn: undefined,
                    manufacture_year: '',
                    box_content: '',
                }]
            });

            return newFormData;
        });

        // Update active box tab after state update
        setTimeout(() => {
            setActiveBoxTabs(prev => {
                return {
                    ...prev,
                    [`grn_1`]: `box_${newBoxId}`
                };
            });
        }, 0);
    }, [grnData]); // Add formData as dependency

    // Add new product to specific box in specific GRN
    const handleAddProduct = useCallback((boxIndex: number) => {
        setGrnData(prev => {
            const newFormData = JSON.parse(JSON.stringify(prev));
            newFormData.box_data[boxIndex].box_products.push({
                wms_product_id: 0,
                product: null,
                product_id: 0,
                hazardous_symbol: '',
                product_quantity: undefined,
                product_hsn: undefined,
                manufacture_year: '',
                box_content: '',
            });
            return newFormData;
        });
    }, [grnData]);

    const handleChange = (e: FormControlEvent) => {
        const { name, value } = e.target;

        // Handle nested fields with array indices
        const fields = name.split('.');
        if (fields.length > 1) {
            setGrnData(prev => {
                const newData = { ...prev };
                let current: any = newData;

                // Navigate through the nested structure
                for (let i = 0; i < fields.length - 1; i++) {
                    const field = fields[i];
                    if (field.includes('[')) {
                        // Handle array fields
                        const [arrayName, indexStr] = field.split('[');
                        const index = parseInt(indexStr.replace(']', ''));
                        if (!current[arrayName]) {
                            current[arrayName] = [];
                        }
                        if (!current[arrayName][index]) {
                            current[arrayName][index] = {};
                        }
                        current = current[arrayName][index];
                    } else {
                        if (!current[field]) {
                            current[field] = {};
                        }
                        current = current[field];
                    }
                }

                // Set the final value
                const lastField = fields[fields.length - 1];
                current[lastField] = value;
                return newData;
            });
        } else {
            // Handle top-level fields
            setGrnData(prev => ({ ...prev, [name]: value }));
        }
    };


    const handleProductInputChange = (selectedOption: any, boxIndex: number, productIndex: number) => {
        if (selectedOption) {
            setGrnData(prev => {
                const newData = { ...prev };
                newData.box_data[boxIndex].box_products[productIndex].product = { id: selectedOption.value, product_name: selectedOption.label };
                newData.box_data[boxIndex].box_products[productIndex].product_id = selectedOption.value;
                return newData;
            });
        }
    };
    const handleHazardousChange = (selectedOption: any, boxIndex: number, productIndex: number) => {
        if (selectedOption) {
            setGrnData(prev => {
                const newData = { ...prev };
                newData.box_data[boxIndex].box_products[productIndex].hazardous_symbol = selectedOption.target.value;
                return newData;
            });
        }
    };

    const handleLocationDetailChange = (selectedOption: any, boxIndex: number) => {
        if (selectedOption) {
            setGrnData(prev => {
                const newData = { ...prev };
                newData.box_data[boxIndex].location_detail = {
                    id: selectedOption.value,
                    location: selectedOption.label
                }
                newData.box_data[boxIndex].location_detail_id = selectedOption.value;
                return newData;
            });
        }
    };
    const handlePurchaseOrderInputChange = (selectedOption: any ) => {
        if (selectedOption) {
            setGrnData(prev => {
                const newData = { ...prev };
                newData.purchase_order = {
                    id: selectedOption.value,
                    purchase_order_number: selectedOption.label
                }
                newData.purchase_order_id = selectedOption.value;
                return newData;
            });
        }
    };

    // Remove Box
    const handleRemoveBox = (boxIndex: number) => {
        setGrnData(prev => {
            const newFormData = { ...prev };
            newFormData.box_data =
                newFormData.box_data.filter((_, index) => index !== boxIndex);
            return newFormData;
        });
        setActiveBoxTabs(prev => ({
            ...prev,
            [`grn_1`]: 'box_1'
        }));
    };

    // Remove Product
    const handleRemoveProduct = (boxIndex: number, productIndex: number) => {
        setGrnData(prev => {
            const newFormData = { ...prev };
            newFormData.box_data[boxIndex].box_products =
                newFormData.box_data[boxIndex].box_products.filter((_, index) => index !== productIndex);
            return newFormData;
        });
    };

    // Add new state for tracking file attachments with proper types
    const [boxAttachments, setBoxAttachments] = useState<Record<string, BoxAttachments>>({});
    const [grnAttachments, setGrnAttachments] = useState<GrnAttachments>({
        vendor_tax_invoice_attachment: null
    });

    // Modify handleFileChange to use the new state management with proper typing
    const handleFileChange = (fileEvent: FormControlEvent, fileName: FileAttachmentNames, boxIndex?: number) => {
        // Type assertion since we know this is a file input
        const input = fileEvent.target as HTMLInputElement;
        const file = input.files?.[0] || null;

        if (boxIndex !== undefined) {
            // Handle box-specific attachments
            const boxKey = `${boxIndex}`;
            setBoxAttachments(prev => ({
                ...prev,
                [boxKey]: {
                    ...(prev[boxKey] || {}),
                    [fileName]: file
                } as BoxAttachments
            }));
        } else {
            // Handle GRN-specific attachments
            setGrnAttachments(prev => ({
                ...prev,
                vendor_tax_invoice_attachment: file
            }));
        }
    };

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const form = e.currentTarget;
        if (form.checkValidity() === false) {
            e.preventDefault();
            e.stopPropagation();
            setValidated(true);
            return;
        }

        try {
            setLoading(true);
            const formData = new FormData();

            // Validate required fields
            if (!grnData.purchase_order_id || !grnData.vendor_tax_invoice_number || !grnData.vendor_tax_invoice_date) {
                toast.error('Please fill in all required fields');
                setValidated(true);
                return;
            }

            // Append basic form fields
            formData.append('inward_id', grnData.inward_id.toString());
            formData.append('purchase_order_id', grnData.purchase_order_id.toString());
            formData.append('vendor_tax_invoice_number', grnData.vendor_tax_invoice_number.toString());
            formData.append('vendor_tax_invoice_date', grnData.vendor_tax_invoice_date.toString());
            formData.append(`vendor_tax_invoice_attachment`, grnAttachments.vendor_tax_invoice_attachment)
            // Add GRN attachment
            // const grnAttachment = grnAttachments.vendor_tax_invoice_attachment;
            // if (grnAttachment) {
            //     formData.append(`vendor_tax_invoice_attachment`, grnAttachment);
            // }

            // Add box data
            grnData.box_data.forEach((box, boxIndex) => {
                // Validate box required fields
                if (!box.location_detail_id || !box.net_weight || !box.gross_weight ||
                    !box.length || !box.width || !box.height) {
                    throw new Error(`Please fill in all required fields for Box ${boxIndex + 1} in GRN `);
                }

                formData.append(`box_data[${boxIndex}][location_detail_id]`, box.location_detail_id.toString());
                formData.append(`box_data[${boxIndex}][net_weight]`, box.net_weight.toString());
                formData.append(`box_data[${boxIndex}][gross_weight]`, box.gross_weight.toString());
                formData.append(`box_data[${boxIndex}][length]`, box.length.toString());
                formData.append(`box_data[${boxIndex}][width]`, box.width.toString());
                formData.append(`box_data[${boxIndex}][height]`, box.height.toString());

                // Add box attachments
                const boxKey = `${boxIndex}`;
                const boxAttachment = boxAttachments[boxKey];
                if (boxAttachment) {
                    if (boxAttachment.haz_symbol_attachment) {
                        formData.append(`box_data[${boxIndex}][haz_symbol_attachment]`, boxAttachment.haz_symbol_attachment);
                    }
                    if (boxAttachment.box_sr_no_attachment) {
                        formData.append(`box_data[${boxIndex}][box_sr_no_attachment]`, boxAttachment.box_sr_no_attachment);
                    }
                    if (boxAttachment.product_attachment) {
                        formData.append(`box_data[${boxIndex}][product_attachment]`, boxAttachment.product_attachment);
                    }
                }

                // Add box products
                box.box_products.forEach((product, productIndex) => {
                    // Validate product required fields
                    if (!product.product_id || !product.product_quantity || !product.product_hsn || !product.manufacture_year) {
                        throw new Error(`Please fill in all required fields for Product ${productIndex + 1} in Box ${boxIndex + 1}, GRN `);
                    }

                    formData.append(`box_data[${boxIndex}][box_products][${productIndex}][product_id]`, product.product_id.toString());
                    formData.append(`box_data[${boxIndex}][box_products][${productIndex}][product_quantity]`, product.product_quantity.toString());
                    formData.append(`box_data[${boxIndex}][box_products][${productIndex}][product_hsn]`, product.product_hsn.toString());
                    formData.append(`box_data[${boxIndex}][box_products][${productIndex}][manufacture_year]`, product.manufacture_year);
                    formData.append(`box_data[${boxIndex}][box_products][${productIndex}][hazardous_symbol]`, product.hazardous_symbol);
                    formData.append(`box_data[${boxIndex}][box_products][${productIndex}][box_content]`, product.box_content);
                });
            });

            const response = await axiosInstance.post('/addGrnToInward', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });

            if (response.status === 200) {
                swal("Success!", response.data.message, "success");
                onSuccess();
                onHide();
            } else {
                toast.error('Failed to add GRN');
            }
        } catch (error: unknown) {
            if (error instanceof Error) {
                console.error('Error submitting form:', error.message);
                toast.error(error.message);
            } else {
                console.error('Error submitting form:', error);
                toast.error('Error adding GRN');
            }
        } finally{
            setLoading(false);
        }
    };

    return (
        <>
            <Modal show onHide={onHide} fullscreen={true} contentClassName={'h-auto px-4'} backdrop="static" keyboard={false}>
                <Modal.Header closeButton>
                    <Modal.Title>Add GRN on Inward : I-{inwardId}</Modal.Title>
                </Modal.Header>
                <Form noValidate validated={validated} onSubmit={handleSubmit}>

                    <Modal.Body>
                        <Card style={{ width: '100%' }}>
                            <Card.Body>

                                {/* GRN Details */}
                                <div className="mb-4">
                                    <h3 className="text-lg font-semibold mb-3">GRN Details</h3>
                                    <Row className='g-2'>
                                        <Form.Group as={Col} className="mb-3">
                                            <Form.Label>Purchase Order Number <span className="text-danger">*</span></Form.Label>
                                            <ReactSelect
                                                options= {poData.map((option: PurchaseOrderData) => (
                                                    { value: option.id, label: option.purchase_order_number }
                                                ))}
                                                placeholder="Select Purchase Order" name="purchase_order" value={grnData.purchase_order ? { value: grnData.purchase_order.id, label: grnData.purchase_order.purchase_order_number } : null} onChange={(selectedOption) => handlePurchaseOrderInputChange(selectedOption)} required
                                            />
                                            <Form.Control type="hidden" name="purchase_order_id" value={grnData.purchase_order_id } />
                                            {validated && !grnData.purchase_order_id && (
                                                <div className="invalid-feedback d-block">Please select Purchase Order</div>
                                            )}
                                        </Form.Group>
                                        <Form.Group as={Col} className="mb-3"  controlId={`vendor_tax_invoice_number`}>
                                            <Form.Label>Vendor Tax Invoice Number <span className="text-danger">*</span></Form.Label>
                                            <Form.Control type="text" placeholder="Enter Vendor Tax Invoice Number" name={`vendor_tax_invoice_number`} value={grnData.vendor_tax_invoice_number} onChange={handleChange} required />
                                            <Form.Control.Feedback type="invalid">Please enter Vendor Tax Invoice Number.</Form.Control.Feedback>
                                        </Form.Group>
                                        <Form.Group as={Col} className="mb-3" controlId={`vendor_tax_invoice_date`}>
                                            <Form.Label>Vendor Tax Invoice Date <span className="text-danger">*</span></Form.Label>
                                            <Form.Control type="date" placeholder="Enter location" name={`vendor_tax_invoice_date`} value={grnData.vendor_tax_invoice_date} onChange={handleChange} required />
                                            <Form.Control.Feedback type="invalid">Please enter Vendor Tax Invoice Date.</Form.Control.Feedback>
                                        </Form.Group>
                                        <Form.Group as={Col} className="mb-3" controlId={`vendor_tax_invoice_attachment`}>
                                            <Form.Label>Vendor Tax Invoice Attachment <span className="text-danger">*</span></Form.Label>
                                            <Form.Control type="file" name={`vendor_tax_invoice_attachment`} onChange={(fileEvent) => handleFileChange(fileEvent, 'vendor_tax_invoice_attachment') } required />
                                            <Form.Control.Feedback type="invalid">Please enter Vendor Tax Invoice Attachment.</Form.Control.Feedback>
                                        </Form.Group>
                                    </Row>
                                </div>

                                <hr />

                                {/* Boxes */}
                                <div className="mb-4">
                                    <Row className='mb-3'>
                                        <Col md={4} className='d-flex align-items-center'>
                                            <h5 className='fs-7 text-danger me-2'>Boxes</h5> <span className='me-4'>(Add multiple boxes to GRN )</span>
                                            <Button variant="outline-primary" size="sm" onClick={() => handleAddBox()}>
                                                <FontAwesomeIcon icon={faPlus} className="mr-2" />
                                                Add Box
                                            </Button>
                                        </Col>
                                    </Row>

                                    <Tab.Container
                                    activeKey={activeBoxTabs[`grn_1`]}
                                    onSelect={(k) => k && setActiveBoxTabs(prev => ({
                                        ...prev,
                                        [`grn_1`]: k
                                    }))}
                                    >
                                        <Nav variant="pills" className="mb-3">
                                            {grnData.box_data.map((box, boxIndex) => (
                                            <Nav.Item key={`box_${boxIndex + 1}`} className='d-flex'>
                                                <Nav.Link eventKey={`box_${boxIndex + 1}`}>Box {boxIndex + 1}</Nav.Link>
                                                {boxIndex > 0 && (
                                                    <Button
                                                        variant="link"
                                                        className="text-danger p-0 ms-2 me-2"
                                                        title={`Delete Box ${boxIndex + 1}`}
                                                        onClick={() => handleRemoveBox(boxIndex)}
                                                    >
                                                        <FontAwesomeIcon icon={faTrash} />
                                                    </Button>
                                                )}
                                            </Nav.Item>
                                            ))}
                                        </Nav>

                                        <Tab.Content>
                                            {grnData.box_data.map((box, boxIndex) => (
                                            <Tab.Pane key={`box_${boxIndex + 1}`} eventKey={`box_${boxIndex + 1}`}>
                                                <Card>
                                                <Card.Body>
                                                    {/* Box Products */}
                                                    <div className="mb-4">
                                                    <div className="flex justify-between items-center mb-3">
                                                        <Row>
                                                            <Col md={6}>
                                                                <Form.Group className="mb-2">
                                                                    <Form.Label>Location Detail Id <span className="text-danger">*</span></Form.Label>
                                                                    <ReactSelect
                                                                        options= {locationDetailsData.map((option: LocationDetailsData) => (
                                                                            { value: option.id, label: `Warehouse name: ${option.warehouse_name} - Rack: ${option.rack_number} - Floor: ${option.floor}` }
                                                                        ))}
                                                                        placeholder="Select Warehouse Location" name={`box_data.${boxIndex}.location_detail`} value={grnData.box_data[boxIndex].location_detail ? { value: grnData.box_data[boxIndex].location_detail.id, label: grnData.box_data[boxIndex].location_detail.location } : null} onChange={(selected: unknown) => handleLocationDetailChange(selected, boxIndex)} />
                                                                    <Form.Control type="hidden" name={`box_data.${boxIndex}.location_detail_id`} value={grnData.box_data[boxIndex].location_detail_id } />
                                                                    {validated && !grnData.box_data[boxIndex].location_detail_id && (
                                                                        <div className="invalid-feedback d-block">Please select Location Detail</div>
                                                                    )}
                                                                </Form.Group>
                                                            </Col>
                                                        </Row>
                                                        <hr />
                                                        <Row className='mb-3'>
                                                            <Col md={4} className='d-flex align-items-center'>
                                                                <h5 className='fs-7 text-danger me-4'>Box Products</h5>
                                                                <Button size='sm' variant="success" className="" startIcon={<FontAwesomeIcon icon={faPlus} className="me-2" />} onClick={() => handleAddProduct(boxIndex)} >
                                                                    Add products
                                                                </Button>
                                                            </Col>
                                                        </Row>

                                                    </div>
                                                    {/* Box Products Fields */}

                                                    {box.box_products.map((product, productIndex) => (
                                                        <div key={productIndex} className="border p-3 mb-3 rounded position-relative">
                                                            {productIndex > 0 && (
                                                                <Button
                                                                    variant="link"
                                                                    className="text-danger position-absolute top-0 end-0 p-2"
                                                                    onClick={() => handleRemoveProduct(boxIndex, productIndex)}
                                                                >
                                                                    <FontAwesomeIcon icon={faTrash} />
                                                                </Button>
                                                            )}

                                                        <Row className='g-2'>
                                                            <Col md={6}>
                                                                <Row>
                                                                    <Col md={8}>
                                                                        <Form.Control type="hidden" name={`box_data.${boxIndex}.box_products.${productIndex}.wms_product_id`} value={grnData.box_data[boxIndex].box_products[productIndex].wms_product_id} />
                                                                        <Form.Group className="mb-3">
                                                                            <Form.Label>Product <span className="text-danger">*</span></Form.Label>
                                                                            <ReactSelect
                                                                                options= {productsData.map((option: ProductsData) => (
                                                                                    { value: option.id, label: option.product_name +' (' + option.product_code + ')' }
                                                                                ))}
                                                                                placeholder="Select product" name="product" value={grnData.box_data[boxIndex].box_products[productIndex].product ? {value: grnData.box_data[boxIndex].box_products[productIndex].product.id, label: grnData.box_data[boxIndex].box_products[productIndex].product.product_name } : null} onChange={(selectedOption: unknown) => handleProductInputChange(selectedOption, boxIndex, productIndex)} />
                                                                                <Form.Control type="hidden" name={`box_data.${boxIndex}.box_products.${productIndex}.product_id`} value={grnData.box_data[boxIndex].box_products[productIndex].product_id } />
                                                                                {validated && !grnData.box_data[boxIndex].box_products[productIndex].product_id && (
                                                                                    <div className="invalid-feedback d-block">Please select Product</div>
                                                                                )}
                                                                        </Form.Group>
                                                                    </Col>
                                                                    <Col md={4}>
                                                                        <Form.Group className="mb-3" controlId={`hazardous_symbol_${boxIndex}_${productIndex}`}>
                                                                            <Form.Label>Hazardous/Non Hazardous <span className="text-danger">*</span></Form.Label>
                                                                            <Form.Select name={`box_data.${boxIndex}.box_products.${productIndex}.hazardous_symbol`} value={grnData.box_data[boxIndex].box_products[productIndex].hazardous_symbol} onChange={(selectedOption: unknown) => handleHazardousChange(selectedOption, boxIndex, productIndex)}>
                                                                                <option value="">Please select</option>
                                                                                <option value="Hazardous">Hazardous</option>
                                                                                <option value="Non-Hazardous">Non-Hazardous</option>
                                                                            </Form.Select>
                                                                            <Form.Control.Feedback type="invalid">Please enter shipment type.</Form.Control.Feedback>
                                                                        </Form.Group>
                                                                    </Col>
                                                                    <Col md={4}>
                                                                        <Form.Group className="mb-3" controlId={`product_quantity_${boxIndex}_${productIndex}`}>
                                                                            <Form.Label>Quantity <span className="text-danger">*</span></Form.Label>
                                                                            <Form.Control type="number" placeholder="Mention product quantity" name={`box_data.${boxIndex}.box_products.${productIndex}.product_quantity`} value={grnData.box_data[boxIndex].box_products[productIndex].product_quantity} onChange={handleChange} required />
                                                                            <Form.Control.Feedback type="invalid">Please enter Quantity.</Form.Control.Feedback>
                                                                        </Form.Group>
                                                                    </Col>
                                                                    <Col md={4}>
                                                                        <Form.Group className="mb-3" controlId={`product_hsn_${boxIndex}_${productIndex}`}>
                                                                            <Form.Label>HSN Code <span className="text-danger">*</span></Form.Label>
                                                                            <Form.Control type="number" placeholder="Mention product HSN" name={`box_data.${boxIndex}.box_products.${productIndex}.product_hsn`} value={grnData.box_data[boxIndex].box_products[productIndex].product_hsn} onChange={handleChange} required />
                                                                            <Form.Control.Feedback type="invalid">Please enter HSN Code.</Form.Control.Feedback>
                                                                        </Form.Group>
                                                                    </Col>
                                                                    <Col md={4}>
                                                                        <Form.Group className="mb-3" controlId={`manufacture_year_${boxIndex}_${productIndex}`}>
                                                                            <Form.Label>Manufacture Year <span className="text-danger">*</span></Form.Label>
                                                                            <Form.Control type="text" placeholder="Manufacture year" name={`box_data.${boxIndex}.box_products.${productIndex}.manufacture_year`} value={grnData.box_data[boxIndex].box_products[productIndex].manufacture_year} onChange={handleChange} required />
                                                                            <Form.Control.Feedback type="invalid">Please enter product manufacture year.</Form.Control.Feedback>
                                                                        </Form.Group>
                                                                    </Col>
                                                                </Row>
                                                            </Col>
                                                            <Col  md={6}>
                                                                <Form.Group className="mb-3" controlId={`box_content_${boxIndex}_${productIndex}`}>
                                                                    <Form.Label>Box Content <span className="text-danger">*</span></Form.Label>
                                                                    <Form.Control as="textarea" rows={3} placeholder="Product Description" name={`box_data.${boxIndex}.box_products.${productIndex}.box_content`} value={grnData.box_data[boxIndex].box_products[productIndex].box_content} onChange={handleChange} required />
                                                                    <Form.Control.Feedback type="invalid">Please enter Box Content.</Form.Control.Feedback>
                                                                </Form.Group>
                                                            </Col>
                                                        </Row>
                                                        </div>
                                                    ))}
                                                    </div>

                                                    {/* Box Metrics */}
                                                    <div className="mb-0">
                                                    <hr />
                                                    {/* Box metrics form fields */}
                                                        <h5 className='fs-7 text-danger mb-3 me-4'>Box Metrics</h5>

                                                        <span className='fs-8 text-danger me-4'>Box Weight</span>
                                                        <Row>
                                                            <Form.Group as={Col} className="mb-3" controlId={`net_weight_${boxIndex}`}>
                                                                <Form.Label>Net weight <span className="text-danger">*</span></Form.Label>
                                                                <Form.Control type="number" placeholder="Enter weight (in KG)" name={`box_data.${boxIndex}.net_weight`} value={grnData.box_data[boxIndex].net_weight} min={0} step={.01} onFocus={(e) => e.target.select()} onChange={handleChange} required />
                                                                <Form.Control.Feedback type="invalid">Please enter Net weight.</Form.Control.Feedback>
                                                            </Form.Group>
                                                            <Form.Group as={Col} className="mb-3" controlId={`gross_weight_${boxIndex}`}>
                                                                <Form.Label>Gross weight <span className="text-danger">*</span></Form.Label>
                                                                <Form.Control type="number" placeholder="Enter weight (in KG)" name={`box_data.${boxIndex}.gross_weight`} value={grnData.box_data[boxIndex].gross_weight} min={0} step={.01} onFocus={(e) => e.target.select()} onChange={handleChange} required />
                                                                <Form.Control.Feedback type="invalid">Please enter Gross weight.</Form.Control.Feedback>
                                                            </Form.Group>
                                                        </Row>
                                                        <hr />
                                                        <span className='fs-8 text-danger me-4'>Box Dimensions</span>
                                                        <Row>
                                                            <Form.Group as={Col} className="mb-3" controlId={`length_${boxIndex}`}>
                                                                <Form.Label>Length <span className="text-danger">*</span></Form.Label>
                                                                <Form.Control type="number" placeholder="Enter length (in CM)" name={`box_data.${boxIndex}.length`} value={grnData.box_data[boxIndex].length} min={0} step={.01} onFocus={(e) => e.target.select()} onChange={handleChange} required />
                                                                <Form.Control.Feedback type="invalid">Please enter Length.</Form.Control.Feedback>
                                                            </Form.Group>
                                                            <Form.Group as={Col} className="mb-3" controlId={`width_${boxIndex}`}>
                                                                <Form.Label>Width <span className="text-danger">*</span></Form.Label>
                                                                <Form.Control type="number" placeholder="Enter width (in CM)" name={`box_data.${boxIndex}.width`} value={grnData.box_data[boxIndex].width} min={0} step={.01} onFocus={(e) => e.target.select()} onChange={handleChange} required />
                                                                <Form.Control.Feedback type="invalid">Please enter Width.</Form.Control.Feedback>
                                                            </Form.Group>
                                                            <Form.Group as={Col} className="mb-3" controlId={`height_${boxIndex}`}>
                                                                <Form.Label>Height <span className="text-danger">*</span></Form.Label>
                                                                <Form.Control type="number" placeholder="Enter height (in CM)" name={`box_data.${boxIndex}.height`} value={grnData.box_data[boxIndex].height} min={0} step={.01} onFocus={(e) => e.target.select()} onChange={handleChange} required />
                                                                <Form.Control.Feedback type="invalid">Please enter Height.</Form.Control.Feedback>
                                                            </Form.Group>
                                                        </Row>
                                                        <hr />
                                                        <span className='fs-8 text-danger me-4'>Attachment details</span>
                                                        <Row>
                                                            <Form.Group as={Col} className="mb-3" controlId={`haz_symbol_attachment_${boxIndex}`}>
                                                                <Form.Label>Hazardous Symbol <span className="text-danger">*</span></Form.Label>
                                                                <Form.Control type="file" name={`box_data.${boxIndex}.haz_symbol_attachment`} onChange={(fileEvent) => handleFileChange(fileEvent, 'haz_symbol_attachment', boxIndex)} required />
                                                                <Form.Control.Feedback type="invalid">Please enter Hazardous Symbol Attachment.</Form.Control.Feedback>
                                                            </Form.Group>
                                                            <Form.Group as={Col} className="mb-3" controlId={`box_sr_no_attachment_${boxIndex}`}>
                                                                <Form.Label>Box Serial Number Sticker <span className="text-danger">*</span></Form.Label>
                                                                <Form.Control type="file" name={`box_data.${boxIndex}.box_sr_no_attachment`} onChange={(fileEvent) => handleFileChange(fileEvent, 'box_sr_no_attachment', boxIndex)} required />
                                                                <Form.Control.Feedback type="invalid">Please enter Box Serial Number Sticker.</Form.Control.Feedback>
                                                            </Form.Group>
                                                            <Form.Group as={Col} className="mb-3" controlId={`product_attachment_${boxIndex}`}>
                                                                <Form.Label>Product Image <span className="text-danger">*</span></Form.Label>
                                                                <Form.Control type="file" name={`box_data.${boxIndex}.product_attachment`} onChange={(fileEvent) => handleFileChange(fileEvent, 'product_attachment', boxIndex)} required />
                                                                <Form.Control.Feedback type="invalid">Please enter Box Serial Number Sticker.</Form.Control.Feedback>
                                                            </Form.Group>
                                                        </Row>
                                                    </div>
                                                </Card.Body>
                                            </Card>
                                        </Tab.Pane>
                                    ))}
                                </Tab.Content>
                            </Tab.Container>
                        </div>
                    </Card.Body>
                </Card>

                    </Modal.Body>
                    <Modal.Footer className='justify-content-center'>
                        <Button variant="secondary" onClick={onHide}>
                            Close
                        </Button>
                        <Button variant="primary" loading={loading} loadingPosition="start" type="submit">{isEditing ? 'Update' : 'Save'}</Button>
                    </Modal.Footer>
                </Form>
            </Modal>
            <ToastContainer className='py-0' />
        </>
    );
};
export default AddGrnInwardModal;
