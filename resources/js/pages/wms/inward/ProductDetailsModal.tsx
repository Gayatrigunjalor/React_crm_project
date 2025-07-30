import React, { useEffect, useState } from 'react';
import { Form, Modal, Row, Col, Card } from 'react-bootstrap';
import Button from '../../../components/base/Button';
import axiosInstance from '../../../axios';
import swal from 'sweetalert';
import { useAuth } from '../../../AuthContext';
import ReactSelect from '../../../components/base/ReactSelect';
import { downloadFile } from '../../../helpers/utils';

interface ProductsData {
    id: number;
    product_code: string;
    product_name: string;
}

interface BoxProductData {
    wms_product_id?: number;
    product_details: { id: number; product_name: string } | null;
    product_id: number;
    hazardous_symbol: string;
    product_quantity: number | undefined;
    product_hsn: number | undefined;
    manufacture_year: string;
    box_content: string;
}
interface ProductModalProps {
    box_id: number;
    prodId?: number;
    onHide: () => void;
    onSuccess: () => void;
}

const ProductDetailsModal: React.FC<ProductModalProps> = ({ box_id, prodId, onHide, onSuccess }) => {

    const [productData, setProductData] = useState<BoxProductData>({
        wms_product_id: prodId,
        product_details: null,
        product_id: 0,
        hazardous_symbol: '',
        product_quantity: undefined,
        product_hsn: undefined,
        manufacture_year: '',
        box_content: ''
    });
    const [isEditing, setIsEditing] = useState<boolean>(false);
    const [validated, setValidated] = useState<boolean>(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [productsData, setProductsData] = useState<ProductsData[]>([]);

    useEffect(() => {
        if (prodId) {
            setIsEditing(true);
            try{
                axiosInstance.get(`/warehouse-products/${prodId}`)
                .then(response => {
                    setProductData(response.data);
                });
            } catch (err: any) {
                swal("Error!", err.data.message, "error");
            }
        }
    }, [prodId]);

    useEffect(() => {
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
        fetchProducts();
    }, []);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setProductData({ ...productData, [name]: value });
    };

    const handleSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const { name, value } = e.target;
        setProductData({ ...productData, [name]: value });
    };

    const handleProductInputChange = (selectedOption: any, ) => {
        if (selectedOption) {
            setProductData(prev => {
                const newData = { ...prev };
                newData.product_details = { id: selectedOption.value, product_name: selectedOption.label };
                newData.product_id = selectedOption.value;
                return newData;
            });
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

        const apiCall = isEditing
        ? axiosInstance.put(`/warehouse-products/${prodId}`, {
            warehouse_box_id: box_id,
            ...productData
        }) : axiosInstance.post('/warehouse-products', {
            warehouse_box_id: box_id,
            ...productData
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
                    <Modal.Title>{isEditing ? 'Edit Product Details' : `Add Product to Box: B-${box_id}` }</Modal.Title>
                </Modal.Header>
                <Form noValidate validated={validated} onSubmit={handleSubmit}>
                    <Modal.Body>
                        <Row className='g-2'>
                            <Col md={6}>
                                <Row>
                                    <Col md={8}>
                                        <Form.Control type="hidden" name={`wms_product_id`} value={productData.wms_product_id} />
                                        <Form.Group className="mb-3">
                                            <Form.Label>Product <span className="text-danger">*</span></Form.Label>
                                            <ReactSelect
                                                options= {productsData.map((option: ProductsData) => (
                                                    { value: option.id, label: option.product_name +' (' + option.product_code + ')' }
                                                ))}
                                                placeholder="Select product" name="product" value={productData.product_details ? {value: productData.product_details.id, label: productData.product_details.product_name } : null} onChange={(selectedOption: unknown) => handleProductInputChange(selectedOption)} />
                                                <Form.Control type="hidden" name={`product_id`} value={productData.product_id } />
                                                {validated && !productData.product_id && (
                                                    <div className="invalid-feedback d-block">Please select Product</div>
                                                )}
                                        </Form.Group>
                                    </Col>
                                    <Col md={4}>
                                        <Form.Group className="mb-3" controlId={`hazardous_symbol`}>
                                            <Form.Label>Hazardous/Non Hazardous <span className="text-danger">*</span></Form.Label>
                                            <Form.Select name={`hazardous_symbol`} value={productData.hazardous_symbol} onChange={handleSelectChange} required>
                                                <option value="">Please select</option>
                                                <option value="Hazardous">Hazardous</option>
                                                <option value="Non-Hazardous">Non-Hazardous</option>
                                            </Form.Select>
                                            <Form.Control.Feedback type="invalid">Please enter shipment type.</Form.Control.Feedback>
                                        </Form.Group>
                                    </Col>
                                    <Col md={4}>
                                        <Form.Group className="mb-3" controlId={`product_quantity`}>
                                            <Form.Label>Quantity <span className="text-danger">*</span></Form.Label>
                                            <Form.Control type="text" placeholder="Mention product quantity" name={`product_quantity`} value={productData.product_quantity} onChange={handleChange} required />
                                            <Form.Control.Feedback type="invalid">Please enter Quantity.</Form.Control.Feedback>
                                        </Form.Group>
                                    </Col>
                                    <Col md={4}>
                                        <Form.Group className="mb-3" controlId={`product_hsn`}>
                                            <Form.Label>HSN Code <span className="text-danger">*</span></Form.Label>
                                            <Form.Control type="number" placeholder="Mention product HSN" name={`product_hsn`} value={productData.product_hsn} onChange={handleChange} required />
                                            <Form.Control.Feedback type="invalid">Please enter HSN Code.</Form.Control.Feedback>
                                        </Form.Group>
                                    </Col>
                                    <Col md={4}>
                                        <Form.Group className="mb-3" controlId={`manufacture_year`}>
                                            <Form.Label>Manufacture Year <span className="text-danger">*</span></Form.Label>
                                            <Form.Control type="text" placeholder="Manufacture year" name={`manufacture_year`} value={productData.manufacture_year} onChange={handleChange} required />
                                            <Form.Control.Feedback type="invalid">Please enter product manufacture year.</Form.Control.Feedback>
                                        </Form.Group>
                                    </Col>
                                </Row>
                            </Col>
                            <Col  md={6}>
                                <Form.Group className="mb-3" controlId={`box_content`}>
                                    <Form.Label>Box Content <span className="text-danger">*</span></Form.Label>
                                    <Form.Control as="textarea" rows={3} placeholder="Product Description" name={`box_content`} value={productData.box_content} onChange={handleChange} required />
                                    <Form.Control.Feedback type="invalid">Please enter Box Content.</Form.Control.Feedback>
                                </Form.Group>
                            </Col>
                        </Row>

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
export default ProductDetailsModal;
