import React, { useEffect, useState, useCallback } from 'react';
import { Form, Modal, Row, Col, Card } from 'react-bootstrap';
import Button from '../../../components/base/Button';
import axiosInstance from '../../../axios';
import swal from 'sweetalert';
import { useAuth } from '../../../AuthContext';
import ReactSelect from '../../../components/base/ReactSelect';
import { faDownload } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { downloadFile } from '../../../helpers/utils';
import { faPlus, faTrash } from '@fortawesome/free-solid-svg-icons';
import Dropzone from '../../../components/base/Dropzone';

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
interface ProductModalProps {
    grnId: number;
    purchId: number;
    boxId?: number;
    handleDownload: (name: string, path: string) => void;
    onHide: () => void;
    onSuccess: () => void;
}

const BoxAddEditModal: React.FC<ProductModalProps> = ({ grnId, purchId, boxId, handleDownload, onHide, onSuccess }) => {

    const [boxData, setBoxData] = useState<BoxData>({
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
    });
    const [isEditing, setIsEditing] = useState<boolean>(false);
    const [validated, setValidated] = useState<boolean>(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [productsData, setProductsData] = useState<ProductsData[]>([]);
    const [locationDetailsData, setLocationDetailsData] = useState<LocationDetailsData[]>([]);
    type FileAttachmentNames = 'haz_symbol_attachment' | 'box_sr_no_attachment' | 'product_attachment';
    const [productAttachments, setProductAttachments] = useState({
        files: [] as File[],
    });
    const [errors, setErrors] = useState<{ files?: string }>({});


    useEffect(() => {
        console.log(boxId);

        if (boxId) {
            setIsEditing(true);
            try{
                axiosInstance.get(`/getBoxById`, {
                    params: { id: boxId }
                })
                .then(response => {
                    const responseData = response.data;
                    const boxSerialAttachment = responseData.box_attachments.find((attachment) => attachment.attachment_type === 'box_serial');
                    const hazSymbolAttachment = responseData.box_attachments.find((attachment) => attachment.attachment_type === 'haz_symbol');
                    setBoxData((prev) => ({
                        wms_box_id: responseData.id,
                        location_detail: { id: responseData.location_detail_id, location: 'Warehouse name: ' + responseData.location_details.warehouse_name + ' - Rack: ' + responseData.location_details.rack_number + ' - Floor: ' + responseData.location_details.floor },
                        location_detail_id: responseData.location_detail_id,
                        net_weight: responseData.net_weight,
                        gross_weight: responseData.gross_weight,
                        length: responseData.length,
                        width: responseData.width,
                        height: responseData.height,
                        haz_attachment: hazSymbolAttachment ? hazSymbolAttachment.name : null,
                        serial_attachment: boxSerialAttachment ? boxSerialAttachment.name : null,
                        prod_image: response.data.box_attachments_product,
                        haz_symbol_attachment: null, // Not present in response data
                        box_sr_no_attachment: null, // Not present in response data
                        product_attachment: null, // Not present in response data
                        box_products: responseData.products.map((product) => ({
                            wms_product_id: product.product_code_id,
                            product_details: product.product_details,
                            product_id: product.id,
                            hazardous_symbol: product.hazardous_symbol,
                            product_quantity: product.product_quantity,
                            product_hsn: product.product_hsn,
                            manufacture_year: product.manufacture_year,
                            box_content: product.box_content,
                        })),
                    }));
                });
            } catch (err: any) {
                swal("Error!", err.data.message, "error");
            }
        }
    }, [boxId]);

    useEffect(() => {
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
        fetchlocationDetails();
        fetchProducts();
    }, []);

    // Add new product to box
    const handleAddProduct = useCallback(() => {
        setBoxData(prev => {
            const newFormData = JSON.parse(JSON.stringify(prev));
            newFormData.box_products.push({
                wms_product_id: 0,
                product: null,
                product_id: 0,
                hazardous_symbol: '',
                product_quantity: undefined,
                product_hsn: undefined,
                manufacture_year: undefined,
                box_content: undefined,
            });
            return newFormData;
        });
    }, [boxData]);

    // Remove Product
    const handleRemoveProduct = (productIndex: number) => {
        setBoxData(prev => {
            const newFormData = { ...prev };
            newFormData.box_products =
                newFormData.box_products.filter((_, index) => index !== productIndex);
            return newFormData;
        });
    };

    const handleLocationDetailChange = (selectedOption: any) => {
        if (selectedOption) {
            setBoxData(prev => {
                const newData = { ...prev };
                newData.location_detail = {
                    id: selectedOption.value,
                    location: selectedOption.label
                }
                newData.location_detail_id = selectedOption.value;
                return newData;
            });
        }
    };


    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setBoxData({ ...boxData, [name]: value });
    };

    const handleProductChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>, productIndex: number) => {
        const { name, value } = e.target;
        setBoxData(prev => {
            const newData = { ...prev };
            newData.box_products[productIndex][name] = value;
            return newData;
        });
    };

    const handleProductInputChange = (selectedOption: any, productIndex: number) => {
        if (selectedOption) {
            setBoxData(prev => {
                const newData = { ...prev };
                newData.box_products[productIndex].product_details = { id: selectedOption.value, product_name: selectedOption.label };
                newData.box_products[productIndex].product_id = selectedOption.value;
                return newData;
            });
        }
    };
    const handleHazardousChange = (selectedOption: any, productIndex: number) => {
        if (selectedOption) {
            setBoxData(prev => {
                const newData = { ...prev };
                newData.box_products[productIndex].hazardous_symbol = selectedOption.target.value;
                return newData;
            });
        }
    };

    // Handler function for the file input change event
    const handleFileChange = (fileEvent: React.ChangeEvent<HTMLInputElement>, fileName: FileAttachmentNames) => {

        const file = fileEvent.target.files ? fileEvent.target.files[0] : null;
        setBoxData(prev => ({
            ...prev,
            [fileName]: file
        }));
    };

    const handleDrop = (acceptedFiles: File[]) => {
        // Instead of creating a FileList, just update the files array
        setProductAttachments((prevState) => ({
            ...prevState,
            files: acceptedFiles, // acceptedFiles is already an array of File objects
        }));

        setErrors((prevErrors) => ({ ...prevErrors, files: undefined }));
    };

    const handleRemoveFile = (index: number) => {
        const updatedFiles = productAttachments.files.filter((_, i) => i !== index);

        setProductAttachments((prevState) => ({
            ...prevState,
            files: updatedFiles, // Update the files with the new array
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

        // Validate the required field
        if (!isEditing && (!productAttachments.files || productAttachments.files.length === 0)) {
            setErrors({ files: 'Please upload at least one file.' });
            setValidated(true);
            return;
        }

        setLoading(true);
        setValidated(true);

        const apiCall = isEditing
        ? axiosInstance.post(`/addBoxToGrn`, {
            grn_id: grnId,
            purchase_order_id: purchId,
            ...boxData,
            productAttachments
        }, {
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        }) : axiosInstance.post('/addBoxToGrn', {
            grn_id: grnId,
            purchase_order_id: purchId,
            ...boxData,
            productAttachments
            }, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
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
            <Modal show onHide={onHide} fullscreen={true} contentClassName={'h-auto px-4'} backdrop="static" keyboard={false}>
                <Modal.Header closeButton>
                    <Modal.Title>{isEditing ? 'Edit Box Details' : `Add Box to GRN: ${grnId}` }</Modal.Title>
                </Modal.Header>
                <Form noValidate validated={validated} onSubmit={handleSubmit}>
                    <Form.Control type="hidden" name={`wms_box_id`} value={boxData.wms_box_id} />
                    <Modal.Body>
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
                                                    placeholder="Select Warehouse Location" name={`location_detail`} value={boxData.location_detail ? { value: boxData.location_detail.id, label: boxData.location_detail.location } : null} onChange={(selected: unknown) => handleLocationDetailChange(selected)} />
                                                <Form.Control type="hidden" name={`location_detail_id`} value={boxData.location_detail_id } />
                                                {validated && !boxData.location_detail_id && (
                                                    <div className="invalid-feedback d-block">Please select Location Detail</div>
                                                )}
                                            </Form.Group>
                                        </Col>
                                    </Row>
                                    <hr />
                                    <Row className='mb-3'>
                                        <Col md={4} className='d-flex align-items-center'>
                                            <h5 className='fs-7 text-danger me-4'>Box Products</h5>
                                            {!isEditing && (
                                            <Button size='sm' variant="success" className="" startIcon={<FontAwesomeIcon icon={faPlus} className="me-2" />} onClick={() => handleAddProduct()} >
                                                Add products
                                            </Button>
                                            )}
                                        </Col>
                                    </Row>

                                </div>
                                {/* Box Products Fields */}

                                {boxData.box_products.map((product, productIndex) => (
                                    <div key={productIndex} className="border p-3 mb-3 rounded position-relative">
                                        {productIndex > 0 && !isEditing && (
                                            <Button
                                                variant="link"
                                                className="text-danger position-absolute top-0 end-0 p-2"
                                                onClick={() => handleRemoveProduct(productIndex)}
                                            >
                                                <FontAwesomeIcon icon={faTrash} />
                                            </Button>
                                        )}
                                        <Row className='g-2'>
                                            <Col md={6}>
                                                <Row>
                                                    <Col md={8}>
                                                        <Form.Control type="hidden" name={`box_products.${productIndex}.wms_product_id`} value={boxData.box_products[productIndex].wms_product_id} />
                                                        <Form.Group className="mb-3">
                                                            <Form.Label>Product <span className="text-danger">*</span></Form.Label>
                                                            <ReactSelect
                                                                options= {productsData.map((option: ProductsData) => (
                                                                    { value: option.id, label: option.product_name +' (' + option.product_code + ')' }
                                                                ))}
                                                                placeholder="Select product" name="product_details" value={boxData.box_products[productIndex].product_details ? {value: boxData.box_products[productIndex].product_details.id, label: boxData.box_products[productIndex].product_details.product_name } : null} onChange={(selectedOption: unknown) => handleProductInputChange(selectedOption, productIndex)} required isDisabled={isEditing} />
                                                                <Form.Control type="hidden" name={`box_products.${productIndex}.product_id`} value={boxData.box_products[productIndex].product_id } />
                                                                {validated && !boxData.box_products[productIndex].product_id && (
                                                                    <div className="invalid-feedback d-block">Please select Product</div>
                                                                )}
                                                        </Form.Group>
                                                    </Col>
                                                    <Col md={4}>
                                                        <Form.Group className="mb-3" controlId={`hazardous_symbol_${productIndex}`}>
                                                            <Form.Label>Hazardous/Non Hazardous <span className="text-danger">*</span></Form.Label>
                                                            <Form.Select name={`box_products.${productIndex}.hazardous_symbol`} value={boxData.box_products[productIndex].hazardous_symbol} onChange={(selectedOption: unknown) => handleHazardousChange(selectedOption, productIndex)} required disabled={isEditing}>
                                                                <option value="">Please select</option>
                                                                <option value="Hazardous">Hazardous</option>
                                                                <option value="Non-Hazardous">Non-Hazardous</option>
                                                            </Form.Select>
                                                            <Form.Control.Feedback type="invalid">Please enter shipment type.</Form.Control.Feedback>
                                                        </Form.Group>
                                                    </Col>
                                                    <Col md={4}>
                                                        <Form.Group className="mb-3" controlId={`product_quantity_${productIndex}`}>
                                                            <Form.Label>Quantity <span className="text-danger">*</span></Form.Label>
                                                            <Form.Control type="text" placeholder="Mention product quantity" name={`product_quantity`} value={boxData.box_products[productIndex].product_quantity} onChange={(e) => handleProductChange(e, productIndex)} required disabled={isEditing}/>
                                                            <Form.Control.Feedback type="invalid">Please enter Quantity.</Form.Control.Feedback>
                                                        </Form.Group>
                                                    </Col>
                                                    <Col md={4}>
                                                        <Form.Group className="mb-3" controlId={`product_hsn_${productIndex}`}>
                                                            <Form.Label>HSN Code <span className="text-danger">*</span></Form.Label>
                                                            <Form.Control type="number" placeholder="Mention product HSN" name={`product_hsn`} value={boxData.box_products[productIndex].product_hsn} onChange={(e) => handleProductChange(e, productIndex)} required disabled={isEditing} />
                                                            <Form.Control.Feedback type="invalid">Please enter HSN Code.</Form.Control.Feedback>
                                                        </Form.Group>
                                                    </Col>
                                                    <Col md={4}>
                                                        <Form.Group className="mb-3" controlId={`manufacture_year_${productIndex}`}>
                                                            <Form.Label>Manufacture Year <span className="text-danger">*</span></Form.Label>
                                                            <Form.Control type="text" placeholder="Manufacture year" name={`manufacture_year`} value={boxData.box_products[productIndex].manufacture_year} onChange={(e) => handleProductChange(e, productIndex)} required disabled={isEditing}/>
                                                            <Form.Control.Feedback type="invalid">Please enter product manufacture year.</Form.Control.Feedback>
                                                        </Form.Group>
                                                    </Col>
                                                </Row>
                                            </Col>
                                            <Col  md={6}>
                                                <Form.Group className="mb-3" controlId={`box_content_${productIndex}`}>
                                                    <Form.Label>Box Content <span className="text-danger">*</span></Form.Label>
                                                    <Form.Control as="textarea" rows={3} placeholder="Product Description" name={`box_content`} value={boxData.box_products[productIndex].box_content} onChange={(e) => handleProductChange(e, productIndex)} required  disabled={isEditing} />
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
                                        <Form.Group as={Col} className="mb-3" controlId={`net_weight`}>
                                            <Form.Label>Net weight <span className="text-danger">*</span></Form.Label>
                                            <Form.Control type="number" placeholder="Enter weight (in KG)" name={`net_weight`} value={boxData.net_weight} onChange={handleChange} required />
                                            <Form.Control.Feedback type="invalid">Please enter Net weight.</Form.Control.Feedback>
                                        </Form.Group>
                                        <Form.Group as={Col} className="mb-3" controlId={`gross_weight`}>
                                            <Form.Label>Gross weight <span className="text-danger">*</span></Form.Label>
                                            <Form.Control type="number" placeholder="Enter weight (in KG)" name={`gross_weight`} value={boxData.gross_weight} onChange={handleChange} required />
                                            <Form.Control.Feedback type="invalid">Please enter Gross weight.</Form.Control.Feedback>
                                        </Form.Group>
                                    </Row>
                                    <hr />
                                    <span className='fs-8 text-danger me-4'>Box Dimensions</span>
                                    <Row>
                                        <Form.Group as={Col} className="mb-3" controlId={`length`}>
                                            <Form.Label>Length <span className="text-danger">*</span></Form.Label>
                                            <Form.Control type="number" placeholder="Enter length (in CM)" name={`length`} value={boxData.length} min={0} step={.01} onFocus={(e) => e.target.select()} onChange={handleChange} required />
                                            <Form.Control.Feedback type="invalid">Please enter Length.</Form.Control.Feedback>
                                        </Form.Group>
                                        <Form.Group as={Col} className="mb-3" controlId={`width`}>
                                            <Form.Label>Width <span className="text-danger">*</span></Form.Label>
                                            <Form.Control type="number" placeholder="Enter width (in CM)" name={`width`} value={boxData.width} min={0} step={.01} onFocus={(e) => e.target.select()} onChange={handleChange} required />
                                            <Form.Control.Feedback type="invalid">Please enter Width.</Form.Control.Feedback>
                                        </Form.Group>
                                        <Form.Group as={Col} className="mb-3" controlId={`height`}>
                                            <Form.Label>Height <span className="text-danger">*</span></Form.Label>
                                            <Form.Control type="number" placeholder="Enter height (in CM)" name={`height`} value={boxData.height} min={0} step={.01} onFocus={(e) => e.target.select()} onChange={handleChange} required />
                                            <Form.Control.Feedback type="invalid">Please enter Height.</Form.Control.Feedback>
                                        </Form.Group>
                                    </Row>
                                    <hr />
                                    <span className='fs-8 text-danger me-4'>Attachment details</span>
                                    <Row>
                                        <Form.Group as={Col} className="mb-3" controlId={`haz_symbol_attachment`}>
                                            <Form.Label>Hazardous Symbol <span className="text-danger">*</span></Form.Label>
                                            <Form.Control type="file" name={`haz_symbol_attachment`} onChange={(fileEvent) => handleFileChange(fileEvent, 'haz_symbol_attachment')} required={!isEditing} />
                                            <Form.Control.Feedback type="invalid">Please enter Hazardous Symbol Attachment.</Form.Control.Feedback>
                                            {boxData.haz_attachment !== null && (
                                                <Button
                                                    className="text-primary p-0"
                                                    variant="link"
                                                    title="Download"
                                                    onClick={() => handleDownload(boxData.haz_attachment, 'uploads/wms/inward/')}
                                                    startIcon={<FontAwesomeIcon icon={faDownload} />}
                                                >
                                                    {boxData.haz_attachment}
                                                </Button>
                                            )}
                                        </Form.Group>
                                        <Form.Group as={Col} className="mb-3" controlId={`box_sr_no_attachment`}>
                                            <Form.Label>Box Serial Number Sticker <span className="text-danger">*</span></Form.Label>
                                            <Form.Control type="file" name={`box_sr_no_attachment`} onChange={(fileEvent) => handleFileChange(fileEvent, 'box_sr_no_attachment')} required={!isEditing} />
                                            <Form.Control.Feedback type="invalid">Please enter Box Serial Number Sticker.</Form.Control.Feedback>
                                            {boxData.serial_attachment !== null && (
                                                <Button
                                                    className="text-primary p-0"
                                                    variant="link"
                                                    title="Download"
                                                    onClick={() => handleDownload(boxData.serial_attachment, 'uploads/wms/inward/')}
                                                    startIcon={<FontAwesomeIcon icon={faDownload} />}
                                                >
                                                    {boxData.serial_attachment}
                                                </Button>
                                            )}
                                        </Form.Group>
                                        <Form.Group as={Col} className="mb-3" controlId={`product_attachment`}>
                                            <Form.Label>Product Image <span className="text-danger">*</span></Form.Label>
                                            <Dropzone onDrop={acceptedFiles => handleDrop(acceptedFiles)} onRemove={index => handleRemoveFile(index)} />
                                            {errors.files && <div className="text-danger mt-1">{errors.files}</div>}
                                            <Form.Control.Feedback type="invalid">Please enter Product Image .</Form.Control.Feedback>

                                            {boxData.prod_image?.length > 0 && boxData.prod_image?.map((upload) => (
                                                <Button
                                                    key={upload.id}
                                                    className="text-primary p-0"
                                                    variant="link"
                                                    title="Download"
                                                    onClick={() => handleDownload(upload.name, 'uploads/wms/inward/product_images/')}
                                                    startIcon={<FontAwesomeIcon icon={faDownload} />}
                                                >
                                                    {upload.name}
                                                </Button>
                                            ))}
                                        </Form.Group>
                                    </Row>
                                </div>
                            </Card.Body>
                        </Card>

                    </Modal.Body>
                    <Modal.Footer>
                        <Button variant="secondary" onClick={onHide}>
                            Close
                        </Button>
                        <Button variant="primary" loading={loading} loadingPosition="start" type="submit">{isEditing ? 'Update' : 'Save'}</Button>
                    </Modal.Footer>
                </Form>
            </Modal>
        </>
    );
};
export default BoxAddEditModal;
