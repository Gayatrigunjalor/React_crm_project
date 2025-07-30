import React, { useEffect, useState } from 'react';
import { Form, Modal, Row, Col, Alert } from 'react-bootstrap';
import Button from '../../../components/base/Button';
import axiosInstance from '../../../axios';
import swal from 'sweetalert';
import { useAuth } from '../../../AuthContext';
import ReactSelect from '../../../components/base/ReactSelect';

interface ProductOption {
    value: number;
    label: string;
}
interface FormData {
    id?: number;
    pi_number: string;
    pi_date: string;
    document_type: string;
    buyer_id: number;
    buyer_name: CustomersData;
    consignee_id: number;
    consignee_name: ConsigneeData;
    sales_manager_id: string;
    bank_id: number;
    bank_name: BankAccountsData;
    state_code: string;
    currency_id: number;
    currency_name: CustomersData;
    exchange_rate: string;
    port_of_loading: string;
    port_of_discharge: string;
    final_destination: string;
    origin_country: string;
    inco_term_id: number;
    inco_name: IncoTermData;
    net_weight: string;
    gross_weight: string;
    igst: string;
    cgst: string;
    sgst: string;
    total: string;
    shipping_cost: string;
    grand_total: string;
    terms_and_conditions: string;
}
interface QuotationModalProps {
    quoteId?: number;
    onHide: () => void;
    onSuccess: () => void;
}
interface CustomersData {
    id: number;
    name: string;
}
interface ProductsData {
    id: number;
    product_code: string;
    product_name: string;
}
interface BankAccountsData {
    id: number;
    bank_name: string;
}
interface IncoTermData{
    id: number;
    inco_term: string;
}
interface ConsigneeData{
    id: number;
    name: string;
    contact_person?: string;
}
const QuotationsModal: React.FC<QuotationModalProps> = ({ quoteId,  onHide, onSuccess }) => {
    const [custData, setUserData] = useState<FormData>({
        id: 0,
        pi_number: '',
        pi_date: '',
        document_type: 'Domestic',
        buyer_id: 0,
        buyer_name: { id: 0, name: '' },
        consignee_id: 0,
        consignee_name: { id: 0, name: '', contact_person: '' },
        sales_manager_id: '',
        bank_id: 0,
        bank_name: { id: 0, bank_name: '' },
        state_code: '',
        currency_id: 0,
        currency_name: { id: 0, name: '' },
        exchange_rate: '',
        port_of_loading: '',
        port_of_discharge: '',
        final_destination: '',
        origin_country: '',
        inco_term_id: 0,
        inco_name: { id: 0, inco_term: '' },
        net_weight: '',
        gross_weight: '',
        igst: '',
        cgst: '',
        sgst: '',
        total: '',
        shipping_cost: '',
        grand_total: '',
        terms_and_conditions: ''
    });
    const [isEditing, setIsEditing] = useState<boolean>(false);
    const [validated, setValidated] = useState<boolean>(false);
    const [customersData, setCustomersData] = useState<CustomersData[]>([]);
    const [productsData, setProductsData] = useState<ProductsData[]>([]);
    const [bankAccountsData, setBankAccountsData] = useState<BankAccountsData[]>([]);
    const [incoTermData, setIncoTermData] = useState<IncoTermData[]>([]);
    const [currencies, setCurrencies] = useState<CustomersData[]>([]);
    const [error, setError] = useState<string | null>(null);
    const [consigneeData, setConsigneeData] = useState<ConsigneeData[]>([]);
    const [loading, setLoading] = useState(false);
    const [items, setItems] = useState([{ title: '', quantity: 1, rate: 0, tax: 0, taxAmount: 0, rateWithTax: 0, amount: 0 }]);
    const [selectedProduct, setSelectedProduct] = useState({ title: '', quantity: 1, rate: 0, tax: 0, taxAmount: 0, rateWithTax: 0, amount: 0 });
    const { empData } = useAuth(); //check userRole & permissions
    const [totalTaxAmount, setTotalTaxAmount] = useState(0);
    const [grandTotal, setGrandTotal] = useState(0);
    useEffect(() => {

        if (quoteId) {
            setIsEditing(true);
            // Fetch customer data for editing
            axiosInstance.get(`/customers/${quoteId}`)
            .then(response => {
                setUserData(response.data);
            })
            .catch(error => console.error('Error fetching customer data:', error));
        }
    }, [quoteId]);

    useEffect(() => {
        const fetchCustomers = async () => {
            try {
                const response = await axiosInstance.get('/customerList');
                if (response.status !== 200) {
                    throw new Error('Failed to fetch data');
                }
                const data: CustomersData[] = await response.data;
                setCustomersData(data);
            } catch (err: any) {
                setError(err.message);
            } finally {
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
        const fetchBankAccounts = async () => {
            try {
                const response = await axiosInstance.get('/bankAccountList');
                if (response.status !== 200) {
                    throw new Error('Failed to fetch data');
                }
                const data: BankAccountsData[] = response.data;
                setBankAccountsData(data);
            } catch (err: any) {
                setError(err.message);
            } finally {
            }
        };
        const fetchIncoTerms = async () => {
            try {
                const response = await axiosInstance.get(`/incoTermsListing`);
                if (response.status !== 200) {
                    throw new Error('Failed to fetch data');
                }
                const data: IncoTermData[] = response.data;
                setIncoTermData(data);
            } catch (err: any) {
                setError(err.data.message);
            }
        };
        const fetchCurrencies = async () => {
            try {
                const response = await axiosInstance.get('/currencyListing');
                if (response.status !== 200) {
                    throw new Error('Failed to fetch data');
                }
                const data = await response.data;
                setCurrencies(data);
            } catch (err: any) {
                setError(err.message);
            } finally {
            }
        };

        fetchCustomers();
        fetchProducts();
        fetchBankAccounts();
        fetchIncoTerms();
        fetchCurrencies();
    }, []);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setUserData({ ...custData, [name]: value });
    };

    const handleSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const { name, value } = e.target;
        setUserData({ ...custData, [name]: value });
    };
    const handleRSelect = (selectedOption: { value: number; label: string } | null, fieldName: string) => {
        if (selectedOption) {
            if(fieldName == 'buyer_name') {
                setUserData({ ...custData, buyer_name: {
                    id: selectedOption.value,
                    name: selectedOption.label
                }, buyer_id: selectedOption.value });
                axiosInstance.get(`/getConsignees/${selectedOption.value}`)
                .then(response => {
                    setConsigneeData(response.data);
                });
            }
            if(fieldName == 'consignee_name') {
                setUserData({ ...custData, consignee_name: {
                    id: selectedOption.value,
                    name: selectedOption.label,
                    contact_person: selectedOption.label
                }, consignee_id: selectedOption.value });
            }

            if(fieldName == 'bank_name') {
                setUserData({ ...custData, bank_name: {
                    id: selectedOption.value,
                    bank_name: selectedOption.label
                }, bank_id: selectedOption.value });
            }
            if(fieldName == 'currency_name') {
                setUserData({ ...custData, currency_name: {
                    id: selectedOption.value,
                    name: selectedOption.label
                }, currency_id: selectedOption.value });
            }
            if(fieldName == 'inco_name') {
                setUserData({ ...custData, inco_name: {
                    id: selectedOption.value,
                    inco_term: selectedOption.label,
                }, inco_term_id: selectedOption.value });
            }
        } else {
            setUserData({ ...custData, [fieldName]: null });
        }
    };

    const handleInputChange = (index: number, event: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = event.target;
        const newItems = [...items];
        newItems[index][name] = value;

        if (name === 'quantity' || name === 'rate') {
            const quantity = parseFloat(newItems[index].quantity) || 0;
            const rate = parseFloat(newItems[index].rate) || 0;
            newItems[index].amount = (quantity * rate).toFixed(2);
            newItems[index].taxAmount = ((rate * newItems[index].tax) / 100).toFixed(2);
            newItems[index].rateWithTax = (parseFloat(newItems[index].amount) + parseFloat(newItems[index].taxAmount)).toFixed(2);
        }

        setItems(newItems);
        calculateTotals(newItems);
    };

    const calculateTotals = (newItems) => {
        let total = 0;
        let taxTotal = 0;

        newItems.forEach(item => {
            total += parseFloat(item.amount) || 0;
            taxTotal += parseFloat(item.taxAmount) || 0;
        });

        setTotalTaxAmount(taxTotal.toFixed(2));
        setGrandTotal((total + taxTotal).toFixed(2));
    };

    const addItemRow = () => {
        setItems([...items, { title: '', quantity: 1, rate: 0, tax: 0, taxAmount: 0, rateWithTax: 0, amount: 0 }]);
    };

    const removeItemRow = (index) => {
        const newItems = items.filter((_, i) => i !== index);
        setItems(newItems);
        calculateTotals(newItems);
    };

    const handleProductInputChange = (selected: unknown | null, fieldName: string) => {
        // const { name, value } = e.target;
        if (selected !== null) {
            const product = selected as ProductOption; // Type assertion
            axiosInstance.get(`/getProductRate/${product.value}`)
                .then(response => {
                    setSelectedProduct({title: product.label, quantity: 1, rate: response.data.product_base_price, tax: 0, taxAmount: 0, rateWithTax: 0, amount: 0});
                });
            console.log(`Value: ${product.value}, Label: ${product.label}`);
        } else {
            console.log('No product selected');
        }
    }

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
            ? axiosInstance.put(`/customers/${custData.id}`,  {
                sales_manager_id: empData.name

            })
            : axiosInstance.post('/customers', {
                ...custData,
                employee_name: empData.name
            });

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
            <Modal show onHide={onHide} fullscreen={true} backdrop="static" keyboard={false}>
                <Modal.Header closeButton>
                    <Modal.Title>{isEditing ? 'Edit Proforma Invoice' : 'Add Proforma Invoice'}</Modal.Title>
                </Modal.Header>
                <Form noValidate validated={validated} onSubmit={handleSubmit}>
                    <Modal.Body>
                        <Row className='mb-2'>
                            {error && (<Alert key={'danger'} variant={"subtle-danger"}>
                                This is a danger alert—check it out!
                            </Alert>)}
                        </Row>
                        <Form.Control type="hidden" name="id" value={custData.id} />
                        <Row className="g-3 px-4">
                            <Form.Group as={Col} className="mb-3" controlId="sales_manager_id">
                                <Form.Label>PI No</Form.Label>
                                <Form.Control type="text" name="sales_manager_id" value={custData.sales_manager_id ? custData.sales_manager_id : empData.name} readOnly style={{backgroundColor: 'whitesmoke', pointerEvents: 'none'}} />
                            </Form.Group>
                            <Form.Group as={Col} className="mb-3" controlId="sales_manager_id">
                                <Form.Label>PI Date</Form.Label>
                                <Form.Control type="text" name="sales_manager_id" value={custData.sales_manager_id ? custData.sales_manager_id : empData.name} readOnly style={{backgroundColor: 'whitesmoke', pointerEvents: 'none'}} />
                            </Form.Group>
                            <Form.Group as={Col} className="mb-3" controlId="document_type">
                                <Form.Label>Document Type </Form.Label>
                                <Form.Select name="document_type" value={custData.document_type} onChange={handleSelectChange}>
                                    <option value="Domestic">Domestic</option>
                                    <option value="International">International</option>
                                </Form.Select>
                                <Form.Control.Feedback type="invalid">Please enter cold chain</Form.Control.Feedback>
                            </Form.Group>
                        </Row>
                        <Row className="g-3 px-4">
                            <Form.Group as={Col} className="mb-3" controlId="buyer_name">
                                <Form.Label>Buyer Name <span className="text-danger">*</span></Form.Label>
                                <ReactSelect
                                    options= {customersData.map((option: CustomersData) => (
                                        { value: option.id, label: option.name }
                                    ))}
                                    placeholder="Select Buyer " name="buyer_name" value={custData.buyer_name ? { value: custData.buyer_name.id, label: custData.buyer_name.name } : null} onChange={(selectedOption) => handleRSelect(selectedOption, 'buyer_name')} required
                                />
                                <Form.Control type="hidden" name="buyer_id" value={custData.buyer_id} />
                                {validated && !custData.buyer_id && (
                                    <div className="invalid-feedback d-block">Please enter buyer name</div>
                                )}
                            </Form.Group>
                            <Form.Group as={Col} className="mb-3" controlId='consignee_name'>
                                <Form.Label>Consignee Name <span className="text-danger">*</span></Form.Label>
                                <ReactSelect
                                    options= {consigneeData.map((option: ConsigneeData) => (
                                        { value: option.id, label: option.name }
                                    ))}
                                    placeholder={"Select Consignee"} name="consignee_name" value={custData.consignee_name ? { value: custData.consignee_name.id, label: custData.consignee_name.name } : null} onChange={(selectedOption) => handleRSelect(selectedOption, 'consignee_name')} required
                                />
                                <Form.Control type="hidden" name="consignee_id" value={custData.consignee_id} />
                                {validated && !custData.consignee_id && (
                                    <div className="invalid-feedback d-block">Please enter consignee</div>
                                )}
                            </Form.Group>
                            <Form.Group as={Col} className="mb-3" controlId="sales_manager_id">
                                <Form.Label>Employee Name</Form.Label>
                                <Form.Control type="text" name="sales_manager_id" value={custData.sales_manager_id ? custData.sales_manager_id : empData.name} readOnly style={{backgroundColor: 'whitesmoke', pointerEvents: 'none'}} />
                            </Form.Group>
                        </Row>

                        <Form.Group as={Row} className="g-3 px-4" controlId='bank_name'>
                            <Col md={4} className="mb-3">
                                <Form.Label>Bank <span className="text-danger">*</span></Form.Label>
                                <ReactSelect
                                    options= {bankAccountsData.map((option: BankAccountsData) => (
                                        { value: option.id, label: option.bank_name }
                                    ))}
                                    placeholder="Select bank" name="bank_name" value={custData.bank_name ? { value: custData.bank_name.id, label: custData.bank_name.bank_name } : null} onChange={(selectedOption) => handleRSelect(selectedOption, 'bank_name')} required
                                />
                                <Form.Control type="hidden" name="bank_id" value={custData.bank_id} />
                                {validated && !custData.bank_id && (
                                    <div className="invalid-feedback d-block">Please enter bank</div>
                                )}
                            </Col>
                        </Form.Group>

                        <Row className="g-3 px-4">
                            <Form.Group as={Col} className="mb-3" controlId="currency_name">
                                <Form.Label>Currency <span className="text-danger">*</span></Form.Label>
                                <ReactSelect
                                    options= {currencies.map((option: CustomersData) => (
                                        { value: option.id, label: option.name }
                                    ))}
                                    placeholder="Select Currency" name="currency_name" value={custData.currency_name ? { value: custData.currency_name.id, label: custData.currency_name.name } : null} onChange={(selectedOption) => handleRSelect(selectedOption, 'currency_name')} required
                                />
                                <Form.Control type="hidden" name="currency_id" value={custData.currency_id} />
                                {validated && !custData.currency_id && (
                                    <div className="invalid-feedback d-block">Please enter currency</div>
                                )}
                            </Form.Group>
                            <Form.Group as={Col} className="mb-3" controlId="exchange_rate">
                                <Form.Label>Exchange Rate <span className="text-danger">*</span></Form.Label>
                                <Form.Control type="text" placeholder="Exchange Rate" name="exchange_rate" value={custData.exchange_rate} onChange={handleChange} required />
                                <Form.Control.Feedback type="invalid">Please enter Exchange Rate.</Form.Control.Feedback>
                            </Form.Group>
                            <Form.Group as={Col} className="mb-3" controlId="port_of_loading">
                                <Form.Label>Port Of Loading</Form.Label>
                                <Form.Control type="text" placeholder="Port Of Loading" name="port_of_loading" value={custData.port_of_loading} onChange={handleChange} />
                                <Form.Control.Feedback type="invalid">Please enter port Of Loading.</Form.Control.Feedback>
                            </Form.Group>
                        </Row>
                        <Row className="g-3 px-4">
                            <Form.Group as={Col} className="mb-3" controlId="port_of_discharge">
                                <Form.Label>Port Of Discharge <span className="text-danger">*</span></Form.Label>
                                <Form.Control type="text" placeholder="Port Of Discharge" name="port_of_discharge" value={custData.port_of_discharge} onChange={handleChange} required />
                                <Form.Control.Feedback type="invalid">Please enter Port Of Discharge.</Form.Control.Feedback>
                            </Form.Group>
                            <Form.Group as={Col} className="mb-3" controlId="final_destination">
                                <Form.Label>Final Destination <span className="text-danger">*</span></Form.Label>
                                <Form.Control type="text" placeholder="Final Destination" name="final_destination" value={custData.final_destination} onChange={handleChange} maxLength={20} required />
                                <Form.Control.Feedback type="invalid">Please enter final destination.</Form.Control.Feedback>
                            </Form.Group>
                            <Form.Group as={Col} className="mb-3" controlId="origin_country">
                                <Form.Label>Origin Country <span className="text-danger">*</span></Form.Label>
                                <Form.Control type="text" placeholder="Origin Country" name="origin_country" value={custData.origin_country} onChange={handleChange} required />
                                <Form.Control.Feedback type="invalid">Please enter origin country.</Form.Control.Feedback>
                            </Form.Group>
                        </Row>
                        <Row className="g-3 px-4">
                            <Form.Group as={Col} className="mb-3" controlId="inco_name">
                                <Form.Label>Inco Term</Form.Label>
                                <ReactSelect
                                    options= {incoTermData.map((option: IncoTermData) => (
                                        { value: option.id, label: option.inco_term }
                                    ))}
                                    placeholder="Select Time Zone" name="inco_name" value={custData.inco_name ? { value: custData.inco_name.id, label: custData.inco_name.inco_term } : null} onChange={(selectedOption) => handleRSelect(selectedOption, 'inco_name')} />
                                <Form.Control type="hidden" name="time_zone" value={custData.inco_term_id} />
                            </Form.Group>
                            <Form.Group as={Col} className="mb-3" controlId="net_weight">
                                <Form.Label>Net weight (kg)</Form.Label>
                                <Form.Control type="text" placeholder="Net weight (kg)" name="net_weight" value={custData.net_weight} onChange={handleChange} />
                                <Form.Control.Feedback type="invalid">Please enter Net weight.</Form.Control.Feedback>
                            </Form.Group>
                            <Form.Group as={Col} className="mb-3" controlId="gross_weight">
                                <Form.Label>Gross Weight (kg) <span className="text-danger">*</span></Form.Label>
                                <Form.Control type="text" placeholder="Gross Weight (kg)" name="gross_weight" value={custData.gross_weight} onChange={handleChange} required />
                                <Form.Control.Feedback type="invalid">Please enter Gross Weight.</Form.Control.Feedback>
                            </Form.Group>
                        </Row>
                        <hr />
                        <Row className='g-3 px-4'>
                            <Col md={4}>
                                <Form.Group as={Col} className="mb-3" controlId="product_id">
                                    <Form.Label>Product <span className="text-danger">*</span></Form.Label>
                                    <ReactSelect
                                        options= {productsData.map((option: ProductsData) => (
                                            { value: option.id, label: option.product_name +' (' + option.product_code + ')' }
                                        ))}
                                        placeholder="Select product" name="product_id" onChange={(selected: unknown) => handleProductInputChange(selected, 'product_id')} />
                                </Form.Group>
                            </Col>
                        </Row>
                        <Row className='g-3 px-4'>
                            <table className="table" style={{ width: '100%', overflowX: 'auto', whiteSpace: 'nowrap' }}>
                                <thead className="thead-dark">
                                    <tr  className='w-100'>
                                        <th className='w-30'>Item Details</th>
                                        <th className='w-10'>Quantity</th>
                                        <th className='w-10'>Rate</th>
                                        <th className='w-10'>Tax %</th>
                                        <th className='w-10'>Tax Amount</th>
                                        <th className='w-10'>Rate With Tax</th>
                                        <th className='w-10'>Amount</th>
                                        <th className='w-10'>Add</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {items.map((item, index) => (
                                        <tr key={index}>
                                            <td>
                                                <input type="text" className="form-control" name="title" value={selectedProduct.title} readOnly style={{backgroundColor: 'whitesmoke', pointerEvents: 'none'}}/>
                                            </td>
                                            <td>
                                                <input type="number" className="form-control" name="quantity" value={selectedProduct.quantity} onChange={(e) => handleInputChange(index, e)} min="1" />
                                            </td>
                                            <td>
                                                <input type="number" className="form-control" name="rate" value={selectedProduct.rate} onChange={(e) => handleInputChange(index, e)} min="0" />
                                            </td>
                                            <td>
                                                <input type="number" className="form-control" name="tax" value={selectedProduct.tax} onChange={(e) => handleInputChange(index, e)} min="0" />
                                            </td>
                                            <td>
                                                <input type="text" className="form-control" name="taxAmount" value={selectedProduct.taxAmount} readOnly />
                                            </td>
                                            <td>
                                                <input type="text" className="form-control" name="rateWithTax" value={selectedProduct.rateWithTax} readOnly />
                                            </td>
                                            <td>
                                                <input type="text" className="form-control" name="amount" value={selectedProduct.amount} readOnly />
                                            </td>
                                            <td>
                                                {items.length - 1 === index && (
                                                    <button className="btn btn-icon btn-success add-item" onClick={addItemRow}>
                                                        Add Item
                                                    </button>
                                                )}
                                                {items.length > 1 && (
                                                    <button className="btn btn-icon btn-danger remove-item" onClick={() => removeItemRow(index)}>
                                                        Remove
                                                    </button>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </Row>
                        <Row className="mb-3 g-3">
                            <Form.Group as={Col} className="mb-3" controlId="terms_and_conditions">
                                <Form.Label>Terms And Conditions</Form.Label>
                                <Form.Control as="textarea" rows={3} placeholder="terms_and_conditions" name="terms_and_conditions" value={custData.terms_and_conditions} onChange={handleChange} required/>
                                <Form.Control.Feedback type="invalid">Please enter terms and conditions.</Form.Control.Feedback>
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
        </>
    );
};

export default QuotationsModal;
