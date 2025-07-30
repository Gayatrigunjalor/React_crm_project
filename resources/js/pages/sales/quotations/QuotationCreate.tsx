import React, { useEffect, useState } from 'react';
import { Form, Card, Row, Col, Alert } from 'react-bootstrap';
import { faPlus, faTrash } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import Button from '../../../components/base/Button';
import axiosInstance from '../../../axios';
import swal from 'sweetalert';
import { useAuth } from '../../../AuthContext';
import ReactSelect from '../../../components/base/ReactSelect';
import { useNavigate, useParams } from 'react-router-dom';
import { ToastContainer, toast } from "react-toastify";

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
    buyer: CustomersData | null;
    consignee_id: number;
    consignee: ConsigneeData | null;
    sales_manager_id: string;
    bank_id: number;
    bank_details: BankAccountsData | null;
    state_code: string;
    currency_id: number;
    currency: CustomersData | null;
    exchange_rate: string;
    port_of_loading: string;
    port_of_discharge: string;
    final_destination: string;
    origin_country: string;
    inco_term_id: number;
    inco_term: IncoTermData | null;
    net_weight: string;
    gross_weight: string;
    igst: string;
    cgst: string;
    sgst: string;
    total: string;
    shipping_cost: number;
    grand_total: number;
    terms_and_conditions: string;
}

interface CustomersData {
    id: number;
    name: string;
}
interface LeadCustomersData {
    id: number;
    sender_name: string;
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
interface IncoTermData {
    id: number;
    inco_term: string;
}
interface ConsigneeData {
    id: number;
    name: string;
    contact_person?: string;
}

interface LeadCustomerConsigneeData {
    id: number;
    contact_person?: string;
}
interface itemData {
    qp_id: number;
    prod_id: number;
    title: string;
    quantity: number;
    rate: number;
    tax: number;
    taxAmount: number;
    rateWithTax: number;
    amount: number;
}

const QuotationCreate = () => {
    const [custData, setUserData] = useState<FormData>({
        id: 0,
        pi_number: '',
        pi_date: '',
        document_type: 'Domestic',
        buyer_id: 0,
        buyer: null,
        consignee_id: 0,
        consignee: null,
        sales_manager_id: '',
        bank_id: 0,
        bank_details: null,
        state_code: '',
        currency_id: 0,
        currency: null,
        exchange_rate: '',
        port_of_loading: '',
        port_of_discharge: '',
        final_destination: '',
        origin_country: '',
        inco_term_id: 0,
        inco_term: null,
        net_weight: '',
        gross_weight: '',
        igst: '',
        cgst: '',
        sgst: '',
        total: '',
        shipping_cost: 0,
        grand_total: 0,
        terms_and_conditions: ''
    });
    // const leadId = localStorage.getItem("lead_id");
    // const customer_id = localStorage.getItem("cst_id");

    const [isEditing, setIsEditing] = useState<boolean>(false);
    const [validated, setValidated] = useState<boolean>(false);
    const [customersData, setCustomersData] = useState<CustomersData[]>([]);
    const [productsData, setProductsData] = useState<ProductsData[]>([]);
    const [bankAccountsData, setBankAccountsData] = useState<BankAccountsData[]>([]);
    const [incoTermData, setIncoTermData] = useState<IncoTermData[]>([]);
    const [currencies, setCurrencies] = useState<CustomersData[]>([]);
    const [error, setError] = useState<string | null>(null);
    const [consigneeData, setConsigneeData] = useState<ConsigneeData[]>([]);
    const [leadcustomerconsigneeData, setLeadCustomerConsigneeData] = useState<LeadCustomerConsigneeData[]>([]);
    const [loading, setLoading] = useState(false);
    const [items, setItems] = useState<itemData[]>([]);
    const [selectedProduct, setSelectedProduct] = useState({ prod_id: 0, title: '', quantity: 1, rate: 0, tax: 0, taxAmount: 0, rateWithTax: 0, amount: 0 });
    const { empData } = useAuth(); //check userRole & permissions
    const [domestic, setDomestic] = useState<boolean>(true);
    const { quoteId } = useParams();
    const { leadId } = useParams();
    const { customer_id } = useParams();

    const navigate = useNavigate();



    // console.log('type', type);
    useEffect(() => {
        // Get today's date
        const today = new Date();
        // Format it to YYYY-MM-DD
        const formattedDate = today.toISOString().split('T')[0];

        const fetchNextQuotationId = async () => {
            try {
                const response = await axiosInstance.get('/createNextQuotationId');
                if (response.status !== 200) {
                    throw new Error('Failed to fetch data');
                }
                const data = await response.data;
                setUserData({ ...custData, pi_number: data, pi_date: formattedDate });
            } catch (err: any) {
                setError(err.message);
            } finally {
            }
        };

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




        fetchNextQuotationId();
        fetchCustomers();
        fetchProducts();
        fetchBankAccounts();
        fetchIncoTerms();
        fetchCurrencies();
    }, []);



    const mapToItemData = (data: any): itemData => {
        return {
            qp_id: data.id,
            prod_id: data.product_id, // 'product_id' maps to 'prod_id'
            title: data.product_name, // 'product_name' maps to 'title'
            quantity: parseInt(data.quantity), // 'quantity' is a string, convert to number
            rate: parseFloat(data.rate), // 'rate' is already a number
            tax: parseFloat(data.tax), // 'tax' is a string, convert to number
            taxAmount: data.tax_amount, // 'tax_amount' is already a number
            rateWithTax: data.rate_with_tax, // 'rate_with_tax' is already a number
            amount: data.amount, // 'amount' is already a number
        };
    };

    // useEffect(() => {
    //     if (quoteId !== '0' && quoteId !== undefined) {
    //         const fetchQuotation = async () => {
    //             try {
    //                 const response = await axiosInstance.get(`/quotations/${quoteId}`);

    //                 if (response.status !== 200) {
    //                     throw new Error('Failed to fetch data');
    //                 }
    //                 if (response.status === 200) {
    //                     setIsEditing(true);
    //                     const data = await response.data;
    //                     await axiosInstance.get(`/getConsignees/${response.data.buyer_id}`)
    //                         .then(response => {
    //                             setConsigneeData(response.data);
    //                         });
    //                     const quote_products: itemData[] = data.quotation_products.map(mapToItemData);
    //                     setItems(quote_products);
    //                     response.data.document_type == 'International' ? setDomestic(false) : setDomestic(true);
    //                     const updatedData = { ...response.data };
    //                     if (response.data.consignee_id != null) {
    //                         setUserData({
    //                             ...updatedData, consignee: {
    //                                 id: response.data.consignee.id,
    //                                 name: response.data.consignee.name,
    //                                 contact_person: response.data.consignee.contact_person
    //                             }
    //                         });
    //                     } else {
    //                         setUserData(updatedData);
    //                     }

    //                 }
    //             } catch (error: any) {
    //                 if (error.status === 404) {
    //                     toast(error.data.message);
    //                     const timer = setTimeout(() => {
    //                         navigate(`/sales/quotations`);
    //                     }, 5000);
    //                 } else {
    //                     console.error('Error fetching quotations data:', error)
    //                 }

    //             } finally {

    //             }
    //         }
    //         fetchQuotation();
    //     }
    // }, [quoteId]);

    useEffect(() => {
        if (quoteId !== '0' && quoteId !== undefined) {
            const fetchQuotation = async () => {
                try {
                    const response = await axiosInstance.get(`/quotations/${quoteId}`);

                    if (response.status !== 200) {
                        throw new Error('Failed to fetch data');
                    }

                    if (response.status === 200) {
                        setIsEditing(true);
                        const data = response.data;

                        // 🔁 Conditional API Call
                        if (data.type !== undefined) {
                            const contactPersonResponse = await axiosInstance.get(`/get-contact-person?cust_id=${data.buyer_id}`);
                            setLeadCustomerConsigneeData(contactPersonResponse.data);
                        } else {
                            const consigneeResponse = await axiosInstance.get(`/getConsignees/${data.buyer_id}`);
                            setConsigneeData(consigneeResponse.data);
                        }

                        const quote_products: itemData[] = data.quotation_products.map(mapToItemData);
                        setItems(quote_products);
                        data.document_type === 'International' ? setDomestic(false) : setDomestic(true);

                        const updatedData = { ...data };
                        if (data.consignee_id != null) {
                            setUserData({
                                ...updatedData,
                                consignee: {
                                    id: data.consignee.id,
                                    name: data.consignee.name,
                                    contact_person: data.consignee.contact_person
                                }
                            });
                        } else {
                            setUserData(updatedData);
                        }
                    }
                } catch (error: any) {
                    if (error?.response?.status === 404) {
                        toast(error.response.data.message);
                        const timer = setTimeout(() => {
                            navigate(`/sales/quotations`);
                        }, 5000);
                    } else {
                        console.error('Error fetching quotations data:', error);
                    }
                }
            };

            fetchQuotation();
        }
    }, [quoteId]);

    useEffect(() => {
        //calculate total on case of state code changed
        if (items.length > 0) {
            calculateTotals(items);
        }
    }, [custData.state_code, custData.document_type, custData.shipping_cost]);

    const onHide = () => {
        navigate(`/sales/quotations`);
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setUserData({ ...custData, [name]: value });
    };

    const handleSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const { name, value } = e.target;
        setUserData({ ...custData, [name]: value });
        if (name === 'document_type') {
            value == 'International' ? setDomestic(false) : setDomestic(true);
        }
    };
    const handleRSelect = (selectedOption: { value: number; label: string } | null, fieldName: string) => {
        if (selectedOption) {
            if (fieldName == 'buyer') {
                setUserData({
                    ...custData,
                    buyer: {
                        id: selectedOption.value,
                        name: selectedOption.label
                    },
                    buyer_id: selectedOption.value,
                    consignee: null,
                    consignee_id: 0
                });
                axiosInstance.get(`/getConsignees/${selectedOption.value}`)
                    .then(response => {
                        setConsigneeData(response.data);
                        // If there's only one consignee, automatically select it
                        if (response.data.length === 1) {
                            const consignee = response.data[0];
                            setUserData(prevData => ({
                                ...prevData,
                                consignee: {
                                    id: consignee.id,
                                    name: consignee.name,
                                    contact_person: consignee.contact_person
                                },
                                consignee_id: consignee.id
                            }));
                        }
                    });
            }
            if (fieldName == 'consignee') {
                setUserData({
                    ...custData,
                    consignee: {
                        id: selectedOption.value,
                        name: selectedOption.label,
                        contact_person: selectedOption.label
                    },
                    consignee_id: selectedOption.value
                });
            }
            if (fieldName == 'bank_details') {
                setUserData({
                    ...custData, bank_details: {
                        id: selectedOption.value,
                        bank_name: selectedOption.label
                    }, bank_id: selectedOption.value
                });
            }
            if (fieldName == 'currency') {
                setUserData({
                    ...custData, currency: {
                        id: selectedOption.value,
                        name: selectedOption.label
                    }, currency_id: selectedOption.value
                });
            }
            if (fieldName == 'inco_term') {
                setUserData({
                    ...custData, inco_term: {
                        id: selectedOption.value,
                        inco_term: selectedOption.label,
                    }, inco_term_id: selectedOption.value
                });
            }
        } else {
            setUserData({ ...custData, [fieldName]: null });
        }
    };

    const handleCSelect = (selectedOption: { value: number; label: string } | null, fieldName: string) => {
        if (selectedOption) {
            if (fieldName == 'buyer') {
                setUserData({
                    ...custData,
                    buyer: {
                        id: selectedOption.value,
                        name: selectedOption.label
                    },
                    buyer_id: selectedOption.value,
                    consignee: null,
                    consignee_id: 0
                });
                axiosInstance.get(`/get-contact-person?cust_id=${selectedOption.value}`)
                    .then(response => {
                        setLeadCustomerConsigneeData(response.data);
                        // If there's only one contact person, automatically select it
                        if (response.data.length === 1) {
                            const contactPerson = response.data[0];
                            setUserData(prevData => ({
                                ...prevData,
                                consignee: {
                                    id: contactPerson.id,
                                    name: contactPerson.contact_person,
                                    contact_person: contactPerson.contact_person
                                },
                                consignee_id: contactPerson.id
                            }));
                        }
                    });
            }
            if (fieldName == 'consignee') {
                setUserData({
                    ...custData,
                    consignee: {
                        id: selectedOption.value,
                        name: selectedOption.label,
                        contact_person: selectedOption.label
                    },
                    consignee_id: selectedOption.value
                });
            }
            if (fieldName == 'bank_details') {
                setUserData({
                    ...custData, bank_details: {
                        id: selectedOption.value,
                        bank_name: selectedOption.label
                    }, bank_id: selectedOption.value
                });
            }
            if (fieldName == 'currency') {
                setUserData({
                    ...custData, currency: {
                        id: selectedOption.value,
                        name: selectedOption.label
                    }, currency_id: selectedOption.value
                });
            }
            if (fieldName == 'inco_term') {
                setUserData({
                    ...custData, inco_term: {
                        id: selectedOption.value,
                        inco_term: selectedOption.label,
                    }, inco_term_id: selectedOption.value
                });
            }
        } else {
            setUserData({ ...custData, [fieldName]: null });
        }
    };

    const handleItemInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = event.target;
        if (selectedProduct.title == '') {
            toast("Select a product first.");
            return;
        }
        if (name == 'quantity' && Number(value) < 1) {
            toast("Quantity cannot be less than 1.");
            return;
        }
        // Update the selected product state first
        const updatedProduct = { ...selectedProduct, [name]: Number(value) };

        // Now do the calculation after updating the state
        let qty = updatedProduct.quantity;
        let rate = updatedProduct.rate;
        let tax = updatedProduct.tax;
        let taxAmount = 0;
        let rateWithTax = 0;
        let amount = 0;

        // Perform tax and amount calculations
        if (rate >= 0 && domestic) {
            taxAmount = (qty * rate * tax) / 100;
        } else {
            tax = 0;
            taxAmount = 0;
        }

        rateWithTax = Number(((qty * rate) + taxAmount).toFixed(2));
        amount = rateWithTax; // Amount includes quantity

        // Finally, update the state with the new values
        setSelectedProduct({
            ...updatedProduct,
            taxAmount: taxAmount,
            rateWithTax: rateWithTax,
            amount: amount
        });
    };

    const calculateTotals = (newItems: itemData[]) => {

        let total = 0;
        let taxAmount = 0;
        let grandTotal = 0;
        let igst = 0;
        let cgst = 0;
        let sgst = 0;
        let shipping_charges = 0;
        //calculate total from items array
        newItems.map(item => {
            total += Number(item.amount);
            taxAmount += Number(item.taxAmount);
        });

        grandTotal = Number((total));
        total = Number((total - taxAmount));
        taxAmount = Number((taxAmount));
        if (domestic) {
            if (custData.state_code == '27') {
                cgst = sgst = (taxAmount / 2);
            } else {
                igst = taxAmount;
            }
        } else {
            grandTotal = grandTotal + Number(custData.shipping_cost);
        }
        setUserData({ ...custData, total: total.toFixed(2), igst: igst.toFixed(2), cgst: cgst.toFixed(2), sgst: sgst.toFixed(2), grand_total: Number(grandTotal.toFixed(2)) });
    };

    const addItemRow = () => {
        const isRepeatedProduct = items.some(item => item.prod_id == selectedProduct.prod_id);
        if (isRepeatedProduct) {
            toast("Product already added");
            return;
        }
        setItems([...items, { qp_id: 0, prod_id: selectedProduct.prod_id, title: selectedProduct.title, quantity: selectedProduct.quantity, rate: selectedProduct.rate, tax: selectedProduct.tax, taxAmount: selectedProduct.taxAmount, rateWithTax: selectedProduct.rateWithTax, amount: selectedProduct.amount }]);
        setSelectedProduct({ prod_id: 0, title: '', quantity: 1, rate: 0, tax: 0, taxAmount: 0, rateWithTax: 0, amount: 0 });
        calculateTotals([...items, {
            qp_id: 0,
            prod_id: selectedProduct.prod_id,
            title: selectedProduct.title,
            quantity: selectedProduct.quantity,
            rate: selectedProduct.rate,
            tax: selectedProduct.tax,
            taxAmount: selectedProduct.taxAmount,
            rateWithTax: selectedProduct.rateWithTax,
            amount: selectedProduct.amount
        }]);
    };

    const removeItemRow = (index: number) => {
        //in case of edit mode directly delete product from database with confirmation
        if (isEditing && items[index].qp_id != 0) {
            swal({
                title: "Are you sure?",
                text: "Once deleted, you will not be able to recover this record!",
                icon: "warning",
                buttons: {
                    confirm: {
                        text: "Delete",
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
                .then((willDelete) => {
                    if (willDelete) {
                        axiosInstance.delete(`/deleteQuotationProduct`, {
                            data: {
                                id: items[index].qp_id
                            }
                        })
                            .then(response => {
                                swal("Success!", response.data.message, "success");
                                const newItems = items.filter((_, i) => i !== index);
                                setItems(newItems);
                                //re-calculate totals after product removed
                                calculateTotals(newItems);

                                //after total calculation is done save totals to the database if user forget to press save button
                                setTimeout(() => {
                                    saveTotalsOnQuotations();
                                }, 2000);
                            })
                            .catch(error => {
                                swal("Error!", error.data.message, "error");
                            });
                    } else {
                        swal("Your record is safe!");
                    }
                });
        } else {
            const newItems = items.filter((_, i) => i !== index);
            setItems(newItems);
            if (isEditing) {
                toast(`Do not forget to press 'Update' button before leaving this page.`);
            }
            //re-calculate totals after product removed
            calculateTotals(newItems);
        }
    };

    async function saveTotalsOnQuotations() {
        const apiCall = axiosInstance.put(`/quotations/${custData.id}`, {
            ...custData,
            sales_manager_id: empData.name
        });
        apiCall.then((response) => {
            toast("Totals updated successfully");
        })
            .catch(error => swal("Error!", error.data.message, "error"));
    }


    const handleProductInputChange = (selected: unknown | null, fieldName: string) => {
        // const { name, value } = e.target;
        if (selected !== null) {
            const product = selected as ProductOption; // Type assertion
            axiosInstance.get(`/getProductRate/${product.value}`)
                .then(response => {
                    let qty = 1;
                    let rate = response.data.product_base_price == '' ? 0 : Number(response.data.product_base_price);
                    let tax = response.data.gst_percent_id == '' ? 0 : Number(response.data.gst_percent.percent);
                    let taxAmount = 0;
                    let rateWithTax = 0;
                    let amount = 0;
                    if (rate >= 0 && domestic) {
                        taxAmount = (rate * tax) / 100;
                    } else {
                        tax = 0;
                        taxAmount = 0;
                    }
                    rateWithTax = Number((rate + taxAmount).toFixed(2));
                    amount = rateWithTax;
                    setSelectedProduct({ prod_id: product.value, title: product.label, quantity: qty, rate: rate, tax: tax, taxAmount: taxAmount, rateWithTax: rateWithTax, amount: amount });
                });
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

        if (custData.grand_total === 0) {
            toast("Grand Total cannot be 0");
            return;
        }

        setLoading(true);
        setValidated(true);
        const apiCall = isEditing
            ? axiosInstance.put(`/quotations/${custData.id}`, {
                ...custData,
                products: items,
                sales_manager_id: custData.sales_manager_id,
                lead_id: parseInt(leadId || '0', 10),
                lead_customer_id: parseInt(customer_id || '0', 10),

            })
            : axiosInstance.post('/quotations', {
                ...custData,
                products: items,
                sales_manager_id: empData.name,
                lead_id: parseInt(leadId || '0', 10),
                // lead_customer_id: custData.buyer_id,
                lead_customer_id: parseInt(customer_id || '0', 10),
            });

        apiCall
            .then((response) => {
                swal("Success!", response.data.message, "success");
                // onSuccess();
                onHide();
            })
            .catch(error => swal("Error!", error.data.message, "error"))
            .finally(() => { setLoading(false); });
    };

    return (
        <>
            <Row>
                <Col><h3 className='px-4 mb-4'>{isEditing ? `Edit Proforma Invoice : ${custData.pi_number}` : 'Add Proforma Invoice'}</h3></Col>
            </Row>
            <hr></hr>
            <Card>
                <Card.Body>
                    <Row>
                        <Form noValidate validated={validated} onSubmit={handleSubmit}>
                            <Row className='mb-2'>
                                {error && (<Alert key={'danger'} variant={"subtle-danger"}>
                                    This is a danger alert—check it out!
                                </Alert>)}
                            </Row>
                            <Form.Control type="hidden" name="id" value={custData.id} />
                            <Row className="g-3 px-4">
                                <Form.Group as={Col} className="mb-3" controlId="pi_number">
                                    <Form.Label>PI No <span className="text-danger">*</span></Form.Label>
                                    <Form.Control type="text" name="pi_number" value={custData.pi_number ? custData.pi_number : empData.name} readOnly style={{ backgroundColor: 'whitesmoke', pointerEvents: 'none' }} />
                                </Form.Group>
                                <Form.Group as={Col} className="mb-3" controlId="pi_date">
                                    <Form.Label>PI Date <span className="text-danger">*</span></Form.Label>
                                    <Form.Control type="date" name="pi_date" value={custData.pi_date} readOnly style={{ backgroundColor: 'whitesmoke', pointerEvents: 'none' }} />
                                </Form.Group>
                                <Form.Group as={Col} className="mb-3" controlId="document_type">
                                    <Form.Label>Document Type <span className="text-danger">*</span></Form.Label>
                                    <Form.Select name="document_type" value={custData.document_type} onChange={handleSelectChange}>
                                        <option value="Domestic">Domestic</option>
                                        <option value="International">International</option>
                                    </Form.Select>
                                    <Form.Control.Feedback type="invalid">Please enter document type</Form.Control.Feedback>
                                </Form.Group>
                            </Row>
                            <Row className="g-3 px-4">
                                <Form.Group as={Col} className="mb-3" controlId="buyer_id">
                                    <Form.Label>Buyer Name <span className="text-danger">*</span></Form.Label>
                                    <ReactSelect
                                        options={customersData.map((option: CustomersData) => (
                                            { value: option.id, label: option.name }
                                        ))}
                                        placeholder="Select Buyer " name="buyer" value={custData.buyer ? { value: custData.buyer.id, label: custData.buyer.name } : null} onChange={(selectedOption) => handleRSelect(selectedOption, 'buyer')} required
                                    />

                                    <Form.Control type="hidden" name="buyer_id" value={custData.buyer_id} />
                                    {validated && !custData.buyer_id && (
                                        <div className="invalid-feedback d-block">Please enter buyer name</div>
                                    )}
                                </Form.Group>
                                <Form.Group as={Col} className="mb-3" controlId='consignee_id'>
                                    <Form.Label>Consignee Name <span className="text-danger">*</span></Form.Label>
                                    <ReactSelect
                                        options={consigneeData.map((option: ConsigneeData) => (
                                            { value: option.id, label: option.name }
                                        ))}
                                        placeholder={"Select Consignee"} name="consignee" value={custData.consignee ? { value: custData.consignee.id, label: custData.consignee.name } : null} onChange={(selectedOption) => handleRSelect(selectedOption, 'consignee')} required
                                    />


                                    <Form.Control type="hidden" name="consignee_id" value={custData.consignee_id} />
                                    {validated && !custData.consignee_id && (
                                        <div className="invalid-feedback d-block">Please enter consignee</div>
                                    )}
                                </Form.Group>
                                <Form.Group as={Col} className="mb-3" controlId="sales_manager_id">
                                    <Form.Label>Employee Name <span className="text-danger">*</span></Form.Label>
                                    <Form.Control type="text" name="sales_manager_id" value={custData.sales_manager_id ? custData.sales_manager_id : empData.name} readOnly style={{ backgroundColor: 'whitesmoke', pointerEvents: 'none' }} />
                                </Form.Group>
                            </Row>

                            <Form.Group as={Row} className="g-3 px-4" controlId='bank_id'>
                                <Col md={4} className="mb-3">
                                    <Form.Label>Bank <span className="text-danger">*</span></Form.Label>
                                    <ReactSelect
                                        options={bankAccountsData.map((option: BankAccountsData) => (
                                            { value: option.id, label: option.bank_name }
                                        ))}
                                        placeholder="Select bank" name="bank_details" value={custData.bank_details ? { value: custData.bank_details.id, label: custData.bank_details.bank_name } : null} onChange={(selectedOption) => handleRSelect(selectedOption, 'bank_details')} required
                                    />
                                    <Form.Control type="hidden" name="bank_id" value={custData.bank_id} />
                                    {validated && !custData.bank_id && (
                                        <div className="invalid-feedback d-block">Please enter bank</div>
                                    )}
                                </Col>
                            </Form.Group>
                            <hr />
                            {domestic ? (
                                <Form.Group as={Row} className="g-3 px-4" controlId='state_code'>
                                    <Col md={4} className="mb-3">
                                        <Form.Label>State Code <span className="text-danger">*</span></Form.Label>
                                        <Form.Control type="text" placeholder="State Code" name="state_code" value={custData.state_code} onChange={handleChange} required />
                                        <Form.Control.Feedback type="invalid">Please enter state code.</Form.Control.Feedback>
                                    </Col>
                                </Form.Group>
                            ) : (
                                <>
                                    <Row className="g-3 px-4">
                                        <Form.Group as={Col} className="mb-3" controlId="currency_id">
                                            <Form.Label>Currency <span className="text-danger">*</span></Form.Label>
                                            <ReactSelect
                                                options={currencies.map((option: CustomersData) => (
                                                    { value: option.id, label: option.name }
                                                ))}
                                                placeholder="Select Currency" name="currency" value={custData.currency ? { value: custData.currency.id, label: custData.currency.name } : null} onChange={(selectedOption) => handleRSelect(selectedOption, 'currency')} required
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
                                            <Form.Control type="text" placeholder="Final Destination" name="final_destination" value={custData.final_destination} onChange={handleChange} maxLength={255} required />
                                            <Form.Control.Feedback type="invalid">Please enter final destination.</Form.Control.Feedback>
                                        </Form.Group>
                                        <Form.Group as={Col} className="mb-3" controlId="origin_country">
                                            <Form.Label>Origin Country <span className="text-danger">*</span></Form.Label>
                                            <Form.Control type="text" placeholder="Origin Country" name="origin_country" value={custData.origin_country} onChange={handleChange} required />
                                            <Form.Control.Feedback type="invalid">Please enter origin country.</Form.Control.Feedback>
                                        </Form.Group>
                                    </Row>
                                    <Row className="g-3 px-4">
                                        <Form.Group as={Col} className="mb-3" controlId="inco_term">
                                            <Form.Label>Inco Term</Form.Label>
                                            <ReactSelect
                                                options={incoTermData.map((option: IncoTermData) => (
                                                    { value: option.id, label: option.inco_term }
                                                ))}
                                                placeholder="Select Inco Term" name="inco_term" value={custData.inco_term ? { value: custData.inco_term.id, label: custData.inco_term.inco_term } : null} onChange={(selectedOption) => handleRSelect(selectedOption, 'inco_term')} />
                                            <Form.Control type="hidden" name="inco_term_id" value={custData.inco_term_id} />
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
                                </>
                            )}
                            <hr />
                            <Row className='g-3 px-4'>
                                <Col md={6}>
                                    <Form.Group as={Col} className="mb-3" controlId="product_id">
                                        <Form.Label>Product <span className="text-danger">*</span></Form.Label>
                                        <ReactSelect
                                            options={productsData.map((option: ProductsData) => (
                                                { value: option.id, label: option.product_name + ' (' + option.product_code + ')' }
                                            ))}
                                            placeholder="Select product" name="product_id" onChange={(selected: unknown) => handleProductInputChange(selected, 'product_id')} />
                                    </Form.Group>
                                </Col>
                                {isEditing && (
                                    <Col className='d-flex align-items-center'>
                                        <Alert key={'danger'} variant={"subtle-danger"} className='py-1 mb-0'> Note: After removing products, don't forget to press 'Update' button. </Alert>
                                    </Col>
                                )}
                            </Row>
                            <Row className='g-3 px-4'>
                                <table className="table" style={{ width: '100%', overflowX: 'auto', whiteSpace: 'nowrap' }}>
                                    <thead className="thead-dark">
                                        <tr className='w-100'>
                                            <th className='' style={{ width: '30%' }}>Item Details</th>
                                            <th className=''>Qty.</th>
                                            <th className=''>Product Rate</th>
                                            <th className=''>Tax %</th>
                                            <th className=''>Tax Amt.</th>
                                            <th className=''>Rate with Tax</th>
                                            <th className=''>Amount</th>
                                            <th style={{ width: '110px' }}>Add</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        <tr>
                                            <td>
                                                <Form.Control type="hidden" placeholder="prod_id" name="prod_id" value={selectedProduct.prod_id} />
                                                <input type="text" className="form-control" name="title" value={selectedProduct.title} readOnly style={{ backgroundColor: 'whitesmoke', pointerEvents: 'none' }} />
                                            </td>
                                            <td>
                                                <Form.Control type="number" placeholder="quantity" name="quantity" value={selectedProduct.quantity} onChange={handleItemInputChange} min="1" />
                                            </td>
                                            <td>
                                                <Form.Control type="number" placeholder="rate" name="rate" value={selectedProduct.rate} onChange={handleItemInputChange} min="0" />
                                            </td>
                                            <td>
                                                <input type="number" className="form-control" name="tax" value={selectedProduct.tax} min="0" readOnly style={{ backgroundColor: 'whitesmoke', pointerEvents: 'none' }} />
                                            </td>
                                            <td>
                                                <input type="text" className="form-control" name="taxAmount" value={selectedProduct.taxAmount} readOnly style={{ backgroundColor: 'whitesmoke', pointerEvents: 'none' }} />
                                            </td>
                                            <td>
                                                <input type="text" className="form-control" name="rateWithTax" value={selectedProduct.rateWithTax} readOnly style={{ backgroundColor: 'whitesmoke', pointerEvents: 'none' }} />
                                            </td>
                                            <td>
                                                <input type="text" className="form-control" name="amount" value={selectedProduct.amount} readOnly style={{ backgroundColor: 'whitesmoke', pointerEvents: 'none' }} />
                                            </td>
                                            <td className='white-space-nowrap'>
                                                <Button
                                                    variant="success"
                                                    className=""
                                                    startIcon={<FontAwesomeIcon icon={faPlus} size='lg' className="me-2" />}
                                                    onClick={() => addItemRow()}
                                                    disabled={selectedProduct.title != '' ? false : true}
                                                >Add</Button>
                                            </td>
                                        </tr>
                                        {items.length > 0 && items.map((item, index) => (
                                            <tr key={index}>
                                                <td>
                                                    <input type="hidden" className="form-control" value={item.prod_id} readOnly style={{ backgroundColor: 'whitesmoke', pointerEvents: 'none' }} />
                                                    <input type="text" className="form-control" value={item.title} readOnly style={{ backgroundColor: 'whitesmoke', pointerEvents: 'none' }} />
                                                </td>
                                                <td>
                                                    <input type="number" className="form-control" value={item.quantity} readOnly style={{ backgroundColor: 'whitesmoke', pointerEvents: 'none' }} />
                                                </td>
                                                <td>
                                                    <input type="number" className="form-control" value={item.rate} readOnly style={{ backgroundColor: 'whitesmoke', pointerEvents: 'none' }} />
                                                </td>
                                                <td>
                                                    <input type="number" className="form-control" value={item.tax} readOnly style={{ backgroundColor: 'whitesmoke', pointerEvents: 'none' }} />
                                                </td>
                                                <td>
                                                    <input type="text" className="form-control" value={item.taxAmount} readOnly style={{ backgroundColor: 'whitesmoke', pointerEvents: 'none' }} />
                                                </td>
                                                <td>
                                                    <input type="text" className="form-control" value={item.rateWithTax} readOnly style={{ backgroundColor: 'whitesmoke', pointerEvents: 'none' }} />
                                                </td>
                                                <td>
                                                    <input type="text" className="form-control" value={item.amount} readOnly style={{ backgroundColor: 'whitesmoke', pointerEvents: 'none' }} />
                                                </td>
                                                <td className='white-space-nowrap'>
                                                    {items.length > 0 && (
                                                        <Button
                                                            variant="danger"
                                                            className=""
                                                            startIcon={<FontAwesomeIcon icon={faTrash} size='lg' className="me-2" />}
                                                            onClick={() => removeItemRow(index)}
                                                        >Remove</Button>
                                                    )}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </Row>
                            <Row className="mb-3 g-3 px-2 justify-content-end">
                                <Col md={3}>
                                    <Row>
                                        <Form.Label column lg={5}>Total</Form.Label>
                                        <Col>
                                            <Form.Control type="text" name="total" value={custData.total} readOnly style={{ backgroundColor: 'whitesmoke', pointerEvents: 'none' }} />
                                        </Col>
                                    </Row>
                                </Col>
                            </Row>

                            {domestic ? (
                                <>
                                    <Row className="mb-3 g-3 px-2 justify-content-end">
                                        <Col md={3}>
                                            <Row>
                                                <Form.Label column lg={5}>IGST</Form.Label>
                                                <Col>
                                                    <Form.Control type="text" name="igst" value={custData.igst} readOnly style={{ backgroundColor: 'whitesmoke', pointerEvents: 'none' }} />
                                                </Col>
                                            </Row>
                                        </Col>
                                    </Row>
                                    <Row className="mb-3 g-3 px-2 justify-content-end">
                                        <Col md={3}>
                                            <Row>
                                                <Form.Label column lg={5}>CGST</Form.Label>
                                                <Col>
                                                    <Form.Control type="text" name="cgst" value={custData.cgst} readOnly style={{ backgroundColor: 'whitesmoke', pointerEvents: 'none' }} />
                                                </Col>
                                            </Row>
                                        </Col>
                                    </Row>
                                    <Row className="mb-3 g-3 px-2 justify-content-end">
                                        <Col md={3}>
                                            <Row>
                                                <Form.Label column lg={5}>SGST</Form.Label>
                                                <Col>
                                                    <Form.Control type="text" name="sgst" value={custData.sgst} readOnly style={{ backgroundColor: 'whitesmoke', pointerEvents: 'none' }} />
                                                </Col>
                                            </Row>
                                        </Col>
                                    </Row>
                                </>
                            ) : (
                                <>
                                    <Row className="mb-3 g-3 px-2 justify-content-end">
                                        <Col md={3}>
                                            <Row>
                                                <Form.Label column lg={5}>Shipping Cost</Form.Label>
                                                <Col>
                                                    <Form.Control type="number" name="shipping_cost" value={custData.shipping_cost} onChange={handleChange} min={0} />
                                                </Col>
                                            </Row>
                                        </Col>
                                    </Row>
                                </>
                            )}

                            <Row className="mb-3 g-3 px-2 justify-content-end">
                                <Col md={3}>
                                    <Row>
                                        <Form.Label column lg={5}>Grand Total</Form.Label>
                                        <Col>
                                            <Form.Control type="number" name="grand_total" value={custData.grand_total} readOnly style={{ backgroundColor: 'whitesmoke', pointerEvents: 'none' }} min={1} />
                                        </Col>
                                    </Row>
                                </Col>
                            </Row>

                            <Row className="mb-3 g-3 px-2">
                                <Form.Group as={Col} className="mb-3" controlId="terms_and_conditions">
                                    <Form.Label>Terms And Conditions</Form.Label>
                                    <Form.Control as="textarea" rows={3} placeholder="Terms and Conditions" name="terms_and_conditions" value={custData.terms_and_conditions} onChange={handleChange} required />
                                    <Form.Control.Feedback type="invalid">Please enter terms and conditions.</Form.Control.Feedback>
                                </Form.Group>
                            </Row>
                            <Row className='d-flex text-center'>
                                <Col className='mb-4'>
                                    <Button variant="secondary" className='mx-2' onClick={onHide}>Close</Button>
                                    <Button variant="primary" className='mx-2' loading={loading} loadingPosition="start" type="submit">{isEditing ? 'Update' : 'Add'}</Button>
                                </Col>
                            </Row>
                        </Form>
                    </Row>
                </Card.Body>
            </Card>
            <ToastContainer className='py-0' />
        </>
    );
};

export default QuotationCreate;
