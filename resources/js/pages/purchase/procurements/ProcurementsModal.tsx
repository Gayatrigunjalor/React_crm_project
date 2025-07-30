import React, { useEffect, useState, useCallback } from 'react';
import { Form, Modal, Row, Col, Alert } from 'react-bootstrap';
import Button from '../../../components/base/Button';
import axiosInstance from '../../../axios';
import swal from 'sweetalert';
import { useAuth } from '../../../AuthContext';
import ReactSelect from '../../../components/base/ReactSelect';
import Dropzone from '../../../components/base/Dropzone';
import { faPlus, faCaretLeft, faTrash } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

interface FormData {
    id: number;
    proc_number: string;
    product_service_name: string;
    description: string;
    target_cost: number;
    tat: string;
    status: string;
    assignee: { id: number; name: string; }
    assignee_name: number;
    lead_id: number | null;
    lead_customer_id: number | null;
    proc_products: ProcurementProduct[];
}

interface ProcurementProduct {
    proc_prod_id: number;
    procurement_id: number;
    product_service_name: string;
    description: string;
    target_cost: string;
    quantity: string;
}

interface EmployeeData {
    id: number;
    name: string;
}

interface ProductType {
    id: number;
    customer_id: number;
    lead_id: number;
    product_sourcing: string;
    product_name: string;
    make: string;
    model: string;
    quantity: number;
    target_price: string;
    product_code: string;
    procurement_id: number | null;
    no_of_product_vendor: number;
    status: string | null;
    created_at: string;
    updated_at: string;
}


interface ProcurementsModalProps {
    quoteId?: number;
    lead_id?: number | null;
    lead_customer_id?: number | null;
    selectedProducts?: ProductType[];
    onHide: () => void;
    onSuccess: () => void;
}

const ProcurementsModal: React.FC<ProcurementsModalProps> = ({ quoteId, lead_id, lead_customer_id, selectedProducts, onHide, onSuccess }) => {
  console.log(selectedProducts);

    const [custData, setUserData] = useState<FormData>({
        id: 0,
        proc_number: '',
        product_service_name: '',
        description: '',
        target_cost: 0,
        tat: '',
        status: '',
        assignee: { id: 0, name: '' },
        assignee_name: 0,
        lead_id: lead_id ? lead_id : null,
        lead_customer_id: lead_customer_id ? lead_customer_id : null,
        proc_products: selectedProducts === undefined ? [{
            proc_prod_id: 0,
            procurement_id: 0,
            product_service_name: '',
            description:'',
            target_cost: '',
            quantity: ''
        }]: selectedProducts.map(product => ({
            proc_prod_id: product.id,
            procurement_id: 0,
            product_service_name: product.product_name,
            description: `${product.make} ${product.model}`,
            target_cost: typeof product.target_price === 'string'
                ? product.target_price.replace(/[^0-9.]/g, '')
                : String(product.target_price),
            quantity: product.quantity.toString()
        }))
    });
    const [isEditing, setIsEditing] = useState<boolean>(false);
    const [validated, setValidated] = useState<boolean>(false);
    const [employeeData, setEmployeeData] = useState<EmployeeData[]>([]);
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [procurementAttachments, setProcurementAttachments] = useState({
        files: [] as File[],
    });
    const [errors, setErrors] = useState<{ files?: string }>({});
    const { empData } = useAuth(); //check userRole & permissions

    useEffect(() => {

        if (quoteId) {
            setIsEditing(true);
            // Fetch customer data for editing
            axiosInstance.get(`/procurements/${quoteId}`)
            .then(response => {
                const responseData = response.data;
                // Map products to proc_products
                const procProducts = responseData.products.map((product: ProcurementProduct) => ({
                    proc_prod_id: product.id,
                    procurement_id: product.procurement_id,
                    product_service_name: product.product_service_name,
                    description: product.description,
                    target_cost: product.target_cost,
                    quantity: product.quantity
                }));

                // Update the state with the mapped proc_products
                setUserData({
                    ...responseData,
                    proc_products: procProducts
                });
            })
            .catch(error => console.error('Error fetching customer data:', error));
        }
    }, [quoteId]);

    useEffect(() => {
        const fetchEmployee = async () => {
            try {
                const response = await axiosInstance.get('/employees_list');
                if (response.status !== 200) {
                    throw new Error('Failed to fetch data');
                }
                const data: EmployeeData[] = await response.data;
                setEmployeeData(data);
            } catch (err: any) {
                setError(err.message);
            } finally {
            }
        };
    fetchEmployee();
    }, []);
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        // Handle nested fields with array indices
        const fields = name.split('.');
        if (fields.length > 1) {
            setUserData(prev => {
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
            setUserData(prev => ({ ...prev, [name]: value }));
        }
        // setUserData({ ...custData, [name]: value });
    };

    const handleSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const { name, value } = e.target;
        setUserData({ ...custData, [name]: value });
    };

    // Add new product to specific box in specific GRN
    const handleAddProduct = useCallback(() => {
        setUserData(prev => {
            const newFormData = JSON.parse(JSON.stringify(prev));
            newFormData.proc_products.push({
                proc_prod_id: 0,
                procurement_id: 0,
                product_service_name: '',
                description: '',
                target_cost: '',
                quantity: ''
            });
            return newFormData;
        });
    }, []);

    // Remove Product
    const handleRemoveProduct = (productIndex: number) => {
        setUserData(prev => {
            const newFormData = { ...prev };
            newFormData.proc_products =
                newFormData.proc_products.filter((_, index) => index !== productIndex);
            return newFormData;
        });
    };

    const handleRSelect = (selectedOption: { value: number; label: string } | null, fieldName: string) => {
        if (selectedOption) {

            if(fieldName == 'assignee') {
                setUserData({ ...custData, assignee: {
                    id: selectedOption.value,
                    name: selectedOption.label
                }, assignee_name: selectedOption.value });
            }
        } else {
            setUserData({ ...custData, [fieldName]: null });
        }
    };
    const handleDrop = (acceptedFiles: File[]) => {
        // Instead of creating a FileList, just update the files array
        setProcurementAttachments((prevState) => ({
            ...prevState,
            files: acceptedFiles, // acceptedFiles is already an array of File objects
        }));

        setErrors((prevErrors) => ({ ...prevErrors, files: undefined }));
    };

    const handleRemoveFile = (index: number) => {
        const updatedFiles = procurementAttachments.files.filter((_, i) => i !== index);

        setProcurementAttachments((prevState) => ({
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
        if (!isEditing && (!procurementAttachments.files || procurementAttachments.files.length === 0)) {
            setErrors({ files: 'Please upload at least one file.' });
            setValidated(true);
            return;
        }
        setLoading(true);
        setValidated(true);

        const apiCall = isEditing
            ? axiosInstance.put(`/procurements/${custData.id}`,  {
                product_service_name: custData.product_service_name,
                description: custData.description,
                target_cost: custData.target_cost,
                tat: custData.tat,
                status: custData.status,
                assignee_name: custData.assignee_name,
                lead_id: custData.lead_id,
                lead_customer_id: custData.lead_customer_id,
            })
            : axiosInstance.post('/procurements', {
                ...custData,
                procurementAttachments
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
                    <Modal.Title>{isEditing ? 'Edit Procurement' : 'Add Procurement'}</Modal.Title>
                </Modal.Header>
                <Form noValidate validated={validated} onSubmit={handleSubmit}>
                    <Modal.Body>
                        <Row className='mb-2'>
                            {error && (<Alert key={'danger'} variant={"subtle-danger"}>
                                {error}
                            </Alert>)}
                        </Row>
                        <Form.Control type="hidden" name="id" value={custData.id} />
                        <Form.Control type="hidden" name="lead_id" value={custData.lead_id ? custData.lead_id : undefined} />
                        <Form.Control type="hidden" name="lead_customer_id" value={custData.lead_customer_id ? custData.lead_customer_id : undefined} />
                        <h4>Product Details</h4>

                        {custData.proc_products.map((product, productIndex) => (
                            <div key={productIndex} className="border p-3 mb-3 rounded position-relative">
                                {productIndex > 0 && (
                                    <Button
                                        variant="link"
                                        className="text-danger position-absolute top-0 end-0 p-2"
                                        onClick={() => handleRemoveProduct(productIndex)}
                                    >
                                        <FontAwesomeIcon icon={faTrash} />
                                    </Button>
                                )}

                                <Row className="g-3 px-4">
                                    <Form.Group as={Col} className="mb-3" controlId={`product_service_name_${productIndex}`}>
                                        <Form.Label>Product-Service Name <span className="text-danger">*</span></Form.Label>
                                        <Form.Control type="text" placeholder="Product-Service Name" name={`proc_products.${productIndex}.product_service_name`} value={custData.proc_products[productIndex].product_service_name} onChange={handleChange} required />
                                        <Form.Control.Feedback type="invalid">Please enter Product-Service Name.</Form.Control.Feedback>
                                    </Form.Group>
                                    <Form.Group as={Col} className="mb-3" controlId={`description_${productIndex}`}>
                                        <Form.Label>Description <span className="text-danger">*</span></Form.Label>
                                        <Form.Control as="textarea" rows={3} placeholder="description" name={`proc_products.${productIndex}.description`} value={custData.proc_products[productIndex].description} onChange={handleChange} required/>
                                        <Form.Control.Feedback type="invalid">Please enter description.</Form.Control.Feedback>
                                    </Form.Group>
                                </Row>
                                <Row className="g-3 px-4">
                                    <Form.Group as={Col} className="mb-3" controlId={`target_cost_${productIndex}`}>
                                        <Form.Label>Target Cost <small>(Enter 0 if not present)</small></Form.Label>
                                        <Form.Control type="number" step={0.1} placeholder="Target Cost" name={`proc_products.${productIndex}.target_cost`} value={custData.proc_products[productIndex].target_cost} min={0} onFocus={(e) => e.target.select()} onChange={handleChange} />
                                        <Form.Control.Feedback type="invalid">Please enter target cost.</Form.Control.Feedback>
                                    </Form.Group>
                                    <Form.Group as={Col} className="mb-3" controlId={`quantity_${productIndex}`}>
                                        <Form.Label>Quantity <span className="text-danger">*</span></Form.Label>
                                        <Form.Control type="number" placeholder="Mention product quantity" name={`proc_products.${productIndex}.quantity`} value={custData.proc_products[productIndex].quantity} min={0} onFocus={(e) => e.target.select()} onChange={handleChange} required />
                                        <Form.Control.Feedback type="invalid">Please enter Quantity.</Form.Control.Feedback>
                                    </Form.Group>
                                </Row>
                            </div>
                        ))}

                        <Row className='mb-3'>
                            <Col className='d-flex justify-content-end'>
                                <Button size='sm' variant="success" className="" startIcon={<FontAwesomeIcon icon={faPlus} className="me-2" />} onClick={() => handleAddProduct()} >
                                    Add products
                                </Button>
                            </Col>
                        </Row>
                        <h4>Opportunity Details</h4>
                        <Row className="g-3 px-4">
                            <Form.Group as={Col} className="mb-3" controlId="tat">
                                <Form.Label>TAT <span className="text-danger">*</span></Form.Label>
                                <Form.Control type="date" name="tat" value={custData.tat} min={new Date().toISOString().split('T')[0]} onChange={handleChange} required />
                                <Form.Control.Feedback type="invalid">Please enter tat.</Form.Control.Feedback>
                            </Form.Group>
                            <Form.Group as={Col} className="mb-3" controlId="status">
                                <Form.Label>Status <span className="text-danger">*</span></Form.Label>
                                <Form.Select name="status" value={custData.status} onChange={handleSelectChange}>
                                    <option value="">Select Status</option>
                                    <option value="In progress">In progress</option>
                                    <option value="Complete">Complete</option>
                                </Form.Select>
                                <Form.Control.Feedback type="invalid">Please enter cold chain</Form.Control.Feedback>
                            </Form.Group>
                            <Form.Group as={Col} className="mb-3" controlId="assignee">
                                <Form.Label>Assignee Name <span className="text-danger">*</span></Form.Label>
                                <ReactSelect
                                    options= {employeeData.map((option: EmployeeData) => (
                                        { value: option.id, label: option.name }
                                    ))}
                                    placeholder="Select Assignee Name" name="assignee" value={custData.assignee ? { value: custData.assignee.id, label: custData.assignee.name } : null} onChange={(selectedOption) => handleRSelect(selectedOption, 'assignee')} required
                                />
                                <Form.Control type="hidden" name="assignee_name" value={custData.assignee_name} />
                                {validated && !custData.assignee_name && (
                                    <div className="invalid-feedback d-block">Please enter Assignee name</div>
                                )}
                            </Form.Group>
                        </Row>
                        {!isEditing && (
                            <Row className='g-3 px-4'>
                                <Col md={6}>
                                    <Form.Label>Attachments <span className="text-danger">*</span></Form.Label>
                                    <Dropzone onDrop={acceptedFiles => handleDrop(acceptedFiles)} onRemove={index => handleRemoveFile(index)} />
                                    {errors.files && <div className="text-danger mt-1">{errors.files}</div>}
                                </Col>
                            </Row>
                        )}

                    </Modal.Body>
                    <Modal.Footer>
                        <Button variant="secondary" onClick={onHide}>
                            Close
                        </Button>
                        <Button variant="primary" loading={loading} loadingPosition="start" type="submit">{isEditing ? 'Update' : 'Add'}</Button>
                    </Modal.Footer>
                </Form>
            </Modal>
        </>
    );
};

export default ProcurementsModal;
