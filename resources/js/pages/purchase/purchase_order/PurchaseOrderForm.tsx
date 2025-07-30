import { faPlus, faCaretLeft, faTrash, faDownload } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import Button from '../../../components/base/Button';
import { useEffect, useState, ChangeEvent } from 'react';
import { Col, Row, Card, Form, Alert } from 'react-bootstrap';
import PurchaseOrderTable, { poTableColumns } from './PurchaseOrderTable';
import useAdvanceTable from '../../../hooks/useAdvanceTable';
import AdvanceTableProvider from '../../../providers/AdvanceTableProvider';
import SearchBox from '../../../components/common/SearchBox';
import axiosInstance from '../../../axios';
import { useAuth } from '../../../AuthContext';
import { useNavigate, useParams } from 'react-router-dom';
import { ToastContainer, toast } from "react-toastify";
import ReactSelect from '../../../components/base/ReactSelect';
import Dropzone from '../../../components/base/Dropzone';
import { downloadFile } from '../../../helpers/utils';
import swal from 'sweetalert';
interface BTListingData {
    id: number;
    customer_name: string;
}
interface Props {
    id: number;
    btListData: BTListingData[];
}
interface VendorListingData {
    id: number;
    name: string;
}
interface FfdData {
    id: number;
    ffd_name: string;
}
interface IncoTermData{
    id: number;
    inco_term: string;
}
interface ProductsData {
    id: number;
    product_code: string;
    product_name: string;
}
interface ProductOption {
    value: number;
    label: string;
}
interface itemData{
    pp_id: number;
    prod_id: number;
    title: string;
    quantity: number;
    rate: number;
    tax: number;
    taxAmount: number;
    rateWithTax: number;
    amount: number;
}
interface PO_Attachment {
    id: number;
    po_id: number;
    name: string;
}
export interface POFormData {
    id: number | undefined;
    po_type: string;
    purchase_order_number: string;
    expected_delivery_date: string;
    order_date: string;
    employee_name: string;
    document_type: string;
    state_code: string;
    business_task: BTListingData | null;
    business_task_id: number;
    ffd: FfdData | null;
    ffd_id: number;
    vendor: VendorListingData | null;
    vendor_id: number;
    currency_id: number;
    currency: VendorListingData | null;
    exchange_rate: string;
    port_of_loading: string;
    port_of_discharge: string;
    final_destination: string;
    origin_country: string;
    inco_term_id: number;
    inco: IncoTermData | null;
    net_weight: string;
    gross_weight: string;
    shp_charge: number;
    pkg_charge: number;
    other_charge: number;
    total: string;
    igst: string;
    cgst: string;
    sgst: string;
    grand_total: number;
    terms_and_conditions: string;
    quotation_attach?: PO_Attachment[];
}

const PurchaseOrderForm = () => {
    const { poId } = useParams();
    const { userPermission, empData } = useAuth(); //check userRole & permissions
    const [purchaseOrderData, setPurchaseOrderData] = useState<POFormData>({
        id: undefined,
        po_type: 'goods',
        purchase_order_number: '',
        order_date: '',
        employee_name: empData.name,
        document_type: 'Domestic',
        state_code: '',
        business_task: null,
        business_task_id:  0,
        ffd: null,
        ffd_id:  0,
        vendor_id:  0,
        expected_delivery_date: '',
        vendor: null,
        currency_id: 0,
        currency: null,
        exchange_rate: '',
        port_of_loading: '',
        port_of_discharge: '',
        final_destination: '',
        origin_country: '',
        inco_term_id: 0,
        inco: null,
        net_weight: '',
        gross_weight: '',
        shp_charge: 0.00,
        pkg_charge: 0.00,
        other_charge: 0.00,
        total: '',
        igst: '',
        cgst: '',
        sgst: '',
        grand_total: 0.00,
        terms_and_conditions: '',
        quotation_attach: [],
    });
    const [isEditing, setIsEditing] = useState<boolean>(false);
    const [validated, setValidated] = useState<boolean>(false);
    const [loading, setLoading] = useState(false);
    const [saveTotal, setSaveTotal] = useState(false);
    const [vendorData, setVendorData] = useState<VendorListingData[]>([]);
    const [btListingData, setBtListingData] = useState<BTListingData[]>([]);
    const [ffdData, setFfdData] = useState<FfdData[]>([]);
    const [incoTermData, setIncoTermData] = useState<IncoTermData[]>([]);
    const [currencies, setCurrencies] = useState<VendorListingData[]>([]);
    const [productsData, setProductsData] = useState<ProductsData[]>([]);
    const [items, setItems] = useState<itemData[]>([]);
    const [error, setError] = useState<string | null>(null);
    type FileAttachmentKeys = 'quotations_attachment';
    const [fileAttachments, setFileAttachments] = useState<Record<FileAttachmentKeys, File[]>>({
        quotations_attachment: [],
    });
    const [shipmentPhotoErrors, setShipmentPhotoErrors] = useState<{ files?: string }>({});
    const [fileValidations, setFileValidations] = useState<{ shipment_file?: string }>({});
    const [domestic, setDomestic] = useState<boolean>(true);
    const [selectedProduct, setSelectedProduct] = useState({ pp_id:0, prod_id: 0, title: '', quantity: 1, rate: 0, tax: 0, taxAmount: 0, rateWithTax: 0, amount: 0 });

    const navigate = useNavigate();

    const handlePOList = () => {
        navigate('/purchase-order');
    };

    //fetch employees table data on component load and update data on edit
    useEffect(() => {
        const today = new Date(); // Get today's date
        const formattedDate = today.toISOString().split('T')[0]; // Format it to YYYY-MM-DD

        const fetchNextInvoiceId = async () => {
            try {
                const response = await axiosInstance.get('/getNextPOId');
                if (response.status !== 200) {
                    throw new Error('Failed to fetch data');
                }
                const data = await response.data;
                setPurchaseOrderData({ ...purchaseOrderData, purchase_order_number: data, order_date: formattedDate});
            } catch (err: any) {
                setError(err.message);
            } finally {
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
        const fetchFfd = async () => {
            try {
                const response = await axiosInstance.get(`/ffdListingAll`);
                if (response.status !== 200) {
                    throw new Error('Failed to fetch data');
                }
                const data_dom: FfdData[] = response.data;
                setFfdData(data_dom);
            } catch (err: any) {
                setError(err.data.message);
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
        if(!isEditing) {
            fetchNextInvoiceId();
        }
        fetchBusinessTaskListing();
        fetchVendorData();
        fetchFfd();
        fetchIncoTerms();
        fetchCurrencies();
    }, []); // Empty array ensures this runs once on mount

    const mapToItemData = (data: any): itemData => {
        return {
            pp_id: data.id,
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
    useEffect(() => {
        if(poId){
            const fetchQuotation = async () => {
                try {
                    const response =  await axiosInstance.get(`/purchase-order/${poId}`);

                    if (response.status !== 200) {
                        throw new Error('Failed to fetch data');
                    }
                    if (response.status === 200) {
                        setIsEditing(true);
                        const data = await response.data;
                        const po_products: itemData[] = data.po_products.map(mapToItemData);
                        setItems(po_products);
                        response.data.document_type == 'International' ? setDomestic(false) : setDomestic(true);
                        const updatedData = { ...response.data };

                        setPurchaseOrderData(updatedData);
console.log(updatedData.quotation_attach[0]);

                        try {
                            const vendorResponse = await axiosInstance.get(`/getProductsByVendor`, {
                                params: { vendor_id : response.data.vendor_id }
                            });
                            if (vendorResponse.status !== 200) {
                                throw new Error('Failed to fetch data');
                            }
                            const data: ProductsData[] = await vendorResponse.data;
                            setProductsData(data);
                        } catch (err: any) {
                            toast(err.data.message)
                        }
                    }
                } catch (error: any) {
                    if(error.status === 404){
                        toast(error.data.message);
                        const timer = setTimeout(() => {
                            navigate(`/purchase-order`);
                        }, 5000);
                    } else {
                        console.error('Error fetching quotations data:', error)
                    }

                } finally {

                }
            }
            fetchQuotation();
        }
    }, [poId]);

    useEffect(() => {
        //calculate total on case of state code changed
        if(items.length > 0){
            calculateTotals(items);
        }
    },[purchaseOrderData.state_code, purchaseOrderData.document_type, purchaseOrderData.shp_charge, purchaseOrderData.pkg_charge, purchaseOrderData.other_charge]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        if(isEditing && name == 'po_type'){
            toast('PO type cannot be changed');
        } else {
            setPurchaseOrderData(prev => ({
                ...prev,
                [name]: value
            }));
            if(name === 'document_type') {
                value == 'International' ? setDomestic(false) : setDomestic(true);
            }
        }
    };

    const handleBTselection = (selectedOption: any) => {
        if (selectedOption) {
            setPurchaseOrderData(prev => ({
                ...prev,
                business_task: { id: selectedOption.value, customer_name: selectedOption.label },
                business_task_id: selectedOption.value
            }));
        }
    };

    const handleVendorSelection = async(selectedOption: any) => {
        if (selectedOption) {
            setPurchaseOrderData(prev => ({
                ...prev,
                vendor: { id: selectedOption.value, name: selectedOption.label },
                vendor_id: selectedOption.value
            }));
            try {
                const response = await axiosInstance.get(`/getProductsByVendor`, {
                    params: { vendor_id : selectedOption.value }
                });
                if (response.status !== 200) {
                    throw new Error('Failed to fetch data');
                }
                const data: ProductsData[] = await response.data;
                setProductsData(data);
            } catch (err: any) {
                toast(err.data.message)
            } finally {
            }
        }
    };
    const handleFfdSelection = (selectedOption: any) => {
        if (selectedOption) {
            setPurchaseOrderData(prev => ({
                ...prev,
                ffd: { id: selectedOption.value, ffd_name: selectedOption.label },
                ffd_id: selectedOption.value
            }));
        }
    };
    const handleCurrencySelect = (selectedOption: any) => {
        if (selectedOption) {
            setPurchaseOrderData(prev => ({
                ...prev,
                currency: { id: selectedOption.value, name: selectedOption.label },
                currency_id: selectedOption.value
            }));
        }
    };
    const handleIncoSelect = (selectedOption: any) => {
        if (selectedOption) {
            setPurchaseOrderData(prev => ({
                ...prev,
                inco: { id: selectedOption.value, inco_term: selectedOption.label },
                inco_term_id: selectedOption.value
            }));
        }
    };

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
                    if(rate >= 0 && domestic) {
                        taxAmount = (rate * tax) / 100;
                    } else {
                        tax = 0;
                        taxAmount = 0;
                    }
                    rateWithTax = Number((rate + taxAmount).toFixed(2));
                    amount = rateWithTax;
                    setSelectedProduct({pp_id: 0, prod_id: product.value, title: product.label, quantity: qty, rate: rate, tax: tax, taxAmount: taxAmount, rateWithTax: rateWithTax, amount: amount});
                });
        } else {
            console.log('No product selected');
        }
    }

    //on Quantity & Rate field change
    const handleItemInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = event.target;
        if(selectedProduct.title == ''){
            toast("Select a product first.");
            return;
        }
        if(name == 'quantity' && Number(value) < 1) {
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
        let shp_charge = 0;
        //calculate total from items array
        newItems.map(item => {
            total += Number(item.amount);
            taxAmount += Number(item.taxAmount);
        });

        grandTotal = Number((total));
        total = Number((total - taxAmount));
        taxAmount = Number((taxAmount));
        if(domestic){
            if(purchaseOrderData.state_code == '27'){
                cgst = sgst = (taxAmount / 2);
            } else {
                igst = taxAmount;
            }
            grandTotal = grandTotal + Number(purchaseOrderData.shp_charge) + Number(purchaseOrderData.pkg_charge) + Number(purchaseOrderData.other_charge);
        } else {
            grandTotal = grandTotal - taxAmount + Number(purchaseOrderData.shp_charge) + Number(purchaseOrderData.pkg_charge) + Number(purchaseOrderData.other_charge);
        }
        setPurchaseOrderData({ ...purchaseOrderData, total: total.toFixed(2), igst: igst.toFixed(2), cgst: cgst.toFixed(2), sgst: sgst.toFixed(2), grand_total: Number(grandTotal.toFixed(2)) });
    };

    useEffect(() => {
        if(isEditing) {
            saveTotalsOnPurchase();
        }
    }, [saveTotal])

    const addItemRow = () => {
        const isRepeatedProduct = items.some(item => item.prod_id == selectedProduct.prod_id);
        if (isRepeatedProduct) {
            toast("Product already added");
            return;
        }
        setItems([...items, { pp_id: 0, prod_id: selectedProduct.prod_id, title: selectedProduct.title, quantity: selectedProduct.quantity, rate: selectedProduct.rate, tax: selectedProduct.tax, taxAmount: selectedProduct.taxAmount, rateWithTax: selectedProduct.rateWithTax, amount: selectedProduct.amount }]);
        setSelectedProduct({ pp_id: 0, prod_id: 0, title: '', quantity: 1, rate: 0, tax: 0, taxAmount: 0, rateWithTax: 0, amount: 0 });
        calculateTotals([...items, {
            pp_id: 0,
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
        if(isEditing && items[index].pp_id != 0){
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
                    axiosInstance.delete(`/deletePOProduct`, {
                        data: {
                            id: items[index].pp_id
                        }
                    })
                    .then(response => {
                        swal("Success!", response.data.message, "success");
                        const newItems = items.filter((_, i) => i !== index);
                        setItems(newItems);
                        //re-calculate totals after product removed
                        calculateTotals(newItems);
                        setSaveTotal(prev => !prev);
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
            if(isEditing){
                toast(`Do not forget to press 'Update' button before leaving this page.`);
            }

            calculateTotals(newItems);
        }
    };

    //File uploads functions
    const handleDrop = (acceptedFiles: File[], fileName: FileAttachmentKeys) => {
        // Instead of creating a FileList, just update the files array
        setFileAttachments((prevState) => ({
            ...prevState,
            [fileName]: acceptedFiles, // acceptedFiles is already an array of File objects
        }));

        setFileValidations((prevErrors) => ({ ...prevErrors, [fileName]: undefined }));
        setShipmentPhotoErrors({ files: '' });
    };

    const handleFileRemove = (index: number, fileName: FileAttachmentKeys) => {
        const updatedFiles = fileAttachments[fileName].filter((_, i) => i !== index);

        setFileAttachments((prevState) => ({
            ...prevState,
            [fileName]: updatedFiles, // Update the files with the new array
        }));
    };

    async function saveTotalsOnPurchase() {
        const apiCall = axiosInstance.post(`/updatePo`, {
            ...purchaseOrderData,
            products: items
        });
        apiCall.then((response) => {
            toast("Totals updated successfully");
        })
        .catch(error => swal("Error!", error.data.message, "error"));
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
        if(!isEditing && fileAttachments.quotations_attachment.length < 1){
            setShipmentPhotoErrors({ files: 'Please upload at least one file.' });
            setValidated(true);
            return;
        }
        if(purchaseOrderData.grand_total === 0) {
            toast("Grand Total cannot be 0");
            return;
        }

        setLoading(true);
        setValidated(true);
        const apiCall = isEditing
        ? axiosInstance.post(`/updatePo`, {
            ...purchaseOrderData,
            products: items,
            quotations_attachment: fileAttachments.quotations_attachment
        }, {
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        })
        : axiosInstance.post('/purchase-order',{
            ...purchaseOrderData,
            products: items,
            quotations_attachment: fileAttachments.quotations_attachment
        }, {
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        });

        apiCall
            .then((response) => {
                swal("Success!", response.data.message, "success");
                handlePOList();
        })
        .catch(error => {
            if (!error || !error.data) return "An unknown error occurred"

            // Collect all unique error messages
            const uniqueMessages = new Set<string>()

            Object.values(error.data).forEach((fieldErrors: any) => {
                if (Array.isArray(fieldErrors)) {
                fieldErrors.forEach((message) => uniqueMessages.add(message))
                }
            })

            // Convert to bulleted list
            const errorMsgs = Array.from(uniqueMessages)
                .map((message) => `• ${message}`)
                .join("\n")
            console.log(error);
            swal("Error!", errorMsgs, "error");
        })
        .finally(() => { setLoading(false); });
    };

    const handleDownload = async (url: string) => {
        try {
            // Fetch the file from the server using the upload ID
            const response = await axiosInstance.get(`${url}`, {
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
    };

    const handleDeleteAttachment = async ( attachment_id: number,  po_id: number) => {
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
                axiosInstance.delete(`/deletePOQuotationsAttachment`, {
                    data: {
                        id: attachment_id,
                        po_id: po_id
                    }
                })
                .then(response => {
                    swal("Success!", response.data.message, "success");
                })
                .catch(error => {
                    swal("Error!", error.data.message, "error");
                });
            } else {
                swal("Your record is safe!");
            }
        });
    };

    if (error) return <div>Error: {error}</div>;

    return (
        <>
            <Row>
                <Col><h3 className='px-4 mb-4'>{isEditing ? 'Edit Purchase Order' : 'Add Purchase Order'}</h3></Col>
            </Row>
            <Card style={{ width: '100%' }}>
                <Card.Body>
                    <Row className='border-bottom border-gray-200'>
                        <Col className="d-flex justify-content-end mb-2">
                            <Button
                                size='sm'
                                variant="primary"
                                className=""
                                startIcon={<FontAwesomeIcon icon={faCaretLeft} className="me-2" />}
                                onClick={() => handlePOList()}
                                >
                                    Purchase Order List
                            </Button>
                        </Col>
                    </Row>
                    <Row className='py-3 border-bottom border-gray-200'>
                        <Col className='d-flex justify-content-start'><h4 className='text-danger'>PO Number : {purchaseOrderData.purchase_order_number}</h4></Col>
                        <Col className='d-flex justify-content-end'><h4 className='text-danger'> ({purchaseOrderData.order_date})</h4></Col>
                    </Row>
                    <Row>
                        <Form noValidate validated={validated} onSubmit={handleSubmit}>
                            <Form.Control type="hidden" name="id" value={purchaseOrderData.id} />
                            <Row className='mb-3'>
                                <Col md={4}>
                                    <Form.Group className="" controlId="po_type">
                                        <Form.Label>Purchase Order Type</Form.Label>
                                        <Form.Select name="po_type" value={purchaseOrderData.po_type} onChange={handleChange} required>
                                            <option value="goods">Goods</option>
                                            <option value="ffd">FFD PO</option>
                                            <option value="service">Service PO</option>
                                        </Form.Select>
                                        <Form.Control.Feedback type="invalid">Please enter PO type</Form.Control.Feedback>
                                    </Form.Group>
                                </Col>
                            </Row>
                            <Row className='mb-3'>
                                <Form.Group as={Col} className="mb-3" controlId="order_date">
                                    <Form.Label>Order Date <span className="text-danger">*</span></Form.Label>
                                    <Form.Control type="text" name="order_date" value={purchaseOrderData.order_date} readOnly style={{backgroundColor: 'whitesmoke', pointerEvents: 'none'}} required />
                                    <Form.Control.Feedback type="invalid">Please enter order date.</Form.Control.Feedback>
                                </Form.Group>
                                <Form.Group as={Col} className="mb-3" controlId="expected_delivery_date">
                                    <Form.Label>Expected Delivery Date <span className="text-danger">*</span></Form.Label>
                                    <Form.Control type="date" min={purchaseOrderData.order_date} name="expected_delivery_date" value={purchaseOrderData.expected_delivery_date} onChange={handleChange} required />
                                    <Form.Control.Feedback type="invalid">Please enter expected delivery date.</Form.Control.Feedback>
                                </Form.Group>
                                <Form.Group as={Col} className="mb-3">
                                    <Form.Label>Business Task Id <span className="text-danger">*</span></Form.Label>
                                    <ReactSelect
                                        options= {btListingData.map((option: BTListingData) => (
                                            { value: option.id, label: `${option.id} (${option.customer_name})` }
                                        ))}
                                        placeholder="Select Business Task" name="business_task" value={purchaseOrderData.business_task ? { value: purchaseOrderData.business_task.id, label: purchaseOrderData.business_task.customer_name } : null} onChange={(selectedOption) => handleBTselection(selectedOption)} />
                                        <Form.Control type="hidden" name="business_task_id" value={purchaseOrderData.business_task_id} />
                                        {validated && !purchaseOrderData.business_task_id && (
                                            <div className="invalid-feedback d-block">Please select Business Task Id</div>
                                        )}
                                </Form.Group>
                            </Row>
                            <Row>
                                {purchaseOrderData.po_type !== 'ffd' && (
                                    <Form.Group as={Col} className="mb-3">
                                        <Form.Label>Supplier <span className="text-danger">*</span></Form.Label>
                                        <ReactSelect
                                            options= {vendorData.map((option: VendorListingData) => (
                                                { value: option.id, label: `${option.name}` }
                                            ))}
                                            placeholder="Select Supplier" name="vendor" value={purchaseOrderData.vendor ? { value: purchaseOrderData.vendor.id, label: purchaseOrderData.vendor.name } : null} onChange={(selectedOption) => handleVendorSelection(selectedOption)} />
                                            <Form.Control type="hidden" name="vendor_id" value={purchaseOrderData.vendor_id} />
                                            {validated && !purchaseOrderData.vendor_id && (
                                                <div className="invalid-feedback d-block">Please select Vendor Id</div>
                                            )}
                                    </Form.Group>
                                )}
                                {purchaseOrderData.po_type === 'ffd' && (
                                    <Form.Group as={Col} className="mb-3">
                                        <Form.Label>FFD <span className="text-danger">*</span></Form.Label>
                                        <ReactSelect
                                            options= {ffdData.map((option: FfdData) => (
                                                { value: option.id, label: `${option.ffd_name}` }
                                            ))}
                                            placeholder="Select FFD" name="ffd" value={purchaseOrderData.ffd ? { value: purchaseOrderData.ffd.id, label: purchaseOrderData.ffd.ffd_name } : null} onChange={(selectedOption) => handleFfdSelection(selectedOption)} required/>
                                            <Form.Control type="hidden" name="ffd_id" value={purchaseOrderData.ffd_id} />
                                            {validated && !purchaseOrderData.ffd_id && (
                                                <div className="invalid-feedback d-block">Please select FFD Id</div>
                                            )}
                                    </Form.Group>
                                )}
                                <Form.Group as={Col} className="mb-3" controlId="employee_name">
                                    <Form.Label>Purchase Manager <span className="text-danger">*</span></Form.Label>
                                    <Form.Control type="text" name="employee_name" value={purchaseOrderData.employee_name ? purchaseOrderData.employee_name : empData.name} readOnly style={{backgroundColor: 'whitesmoke'}} />
                                </Form.Group>
                                <Form.Group as={Col} className="mb-3" controlId="document_type">
                                    <Form.Label>Document Type <span className="text-danger">*</span></Form.Label>
                                    <Form.Select name="document_type" value={purchaseOrderData.document_type} onChange={handleChange}>
                                        <option value="Domestic">Domestic</option>
                                        <option value="International">International</option>
                                    </Form.Select>
                                    <Form.Control.Feedback type="invalid">Please enter cold chain</Form.Control.Feedback>
                                </Form.Group>
                            </Row>
                            <hr />
                            {domestic ? (
                                <Form.Group as={Row} className="g-3 px-2" controlId='state_code'>
                                    <Col md={4} className="mb-3">
                                        <Form.Label>State Code <span className="text-danger">*</span></Form.Label>
                                        <Form.Control type="number" placeholder="State Code" name="state_code" value={purchaseOrderData.state_code} onChange={handleChange} min={0} onFocus={(e) => e.target.select()} required />
                                        <Form.Control.Feedback type="invalid">Please enter state code.</Form.Control.Feedback>
                                    </Col>
                                </Form.Group>
                            ) : (
                                <>
                                    <Row className="g-3 px-2">
                                        <Form.Group as={Col} className="mb-3" controlId="currency_id">
                                            <Form.Label>Currency <span className="text-danger">*</span></Form.Label>
                                            <ReactSelect
                                                options= {currencies.map((option: VendorListingData) => (
                                                    { value: option.id, label: option.name }
                                                ))}
                                                placeholder="Select Currency" name="currency" value={purchaseOrderData.currency ? { value: purchaseOrderData.currency.id, label: purchaseOrderData.currency.name } : null} onChange={(selectedOption) => handleCurrencySelect(selectedOption)} required
                                            />
                                            <Form.Control type="hidden" name="currency_id" value={purchaseOrderData.currency_id} />
                                            {validated && !purchaseOrderData.currency_id && (
                                                <div className="invalid-feedback d-block">Please enter currency</div>
                                            )}
                                        </Form.Group>
                                        <Form.Group as={Col} className="mb-3" controlId="exchange_rate">
                                            <Form.Label>Exchange Rate <span className="text-danger">*</span></Form.Label>
                                            <Form.Control type="text" placeholder="Exchange Rate" name="exchange_rate" value={purchaseOrderData.exchange_rate} onChange={handleChange} required />
                                            <Form.Control.Feedback type="invalid">Please enter Exchange Rate.</Form.Control.Feedback>
                                        </Form.Group>
                                        <Form.Group as={Col} className="mb-3" controlId="port_of_loading">
                                            <Form.Label>Port Of Loading</Form.Label>
                                            <Form.Control type="text" placeholder="Port Of Loading" name="port_of_loading" value={purchaseOrderData.port_of_loading} onChange={handleChange} required/>
                                            <Form.Control.Feedback type="invalid">Please enter port Of Loading.</Form.Control.Feedback>
                                        </Form.Group>
                                    </Row>
                                    <Row className="g-3 px-2">
                                        <Form.Group as={Col} className="mb-3" controlId="port_of_discharge">
                                            <Form.Label>Port Of Discharge <span className="text-danger">*</span></Form.Label>
                                            <Form.Control type="text" placeholder="Port Of Discharge" name="port_of_discharge" value={purchaseOrderData.port_of_discharge} onChange={handleChange} required />
                                            <Form.Control.Feedback type="invalid">Please enter Port Of Discharge.</Form.Control.Feedback>
                                        </Form.Group>
                                        <Form.Group as={Col} className="mb-3" controlId="final_destination">
                                            <Form.Label>Final Destination <span className="text-danger">*</span></Form.Label>
                                            <Form.Control type="text" placeholder="Final Destination" name="final_destination" value={purchaseOrderData.final_destination} onChange={handleChange} maxLength={20} required />
                                            <Form.Control.Feedback type="invalid">Please enter final destination.</Form.Control.Feedback>
                                        </Form.Group>
                                        <Form.Group as={Col} className="mb-3" controlId="origin_country">
                                            <Form.Label>Origin Country <span className="text-danger">*</span></Form.Label>
                                            <Form.Control type="text" placeholder="Origin Country" name="origin_country" value={purchaseOrderData.origin_country} onChange={handleChange} required />
                                            <Form.Control.Feedback type="invalid">Please enter origin country.</Form.Control.Feedback>
                                        </Form.Group>
                                    </Row>
                                    <Row className="g-3 px-2">
                                        <Form.Group as={Col} className="mb-3" controlId="inco">
                                            <Form.Label>Inco Term <span className="text-danger">*</span></Form.Label>
                                            <ReactSelect
                                                options= {incoTermData.map((option: IncoTermData) => (
                                                    { value: option.id, label: option.inco_term }
                                                ))}
                                                placeholder="Select Inco Term" name="inco" value={purchaseOrderData.inco ? { value: purchaseOrderData.inco.id, label: purchaseOrderData.inco.inco_term } : null} onChange={(selectedOption) => handleIncoSelect(selectedOption)} required/>
                                            <Form.Control type="hidden" name="inco_term_id" value={purchaseOrderData.inco_term_id} />
                                            {validated && !purchaseOrderData.inco_term_id && (
                                                <div className="invalid-feedback d-block">Please select Inco Term</div>
                                            )}
                                        </Form.Group>
                                        <Form.Group as={Col} className="mb-3" controlId="net_weight">
                                            <Form.Label>Net weight (kg) <span className="text-danger">*</span></Form.Label>
                                            <Form.Control type="text" placeholder="Net weight (kg)" name="net_weight" value={purchaseOrderData.net_weight} onChange={handleChange} required />
                                            <Form.Control.Feedback type="invalid">Please enter Net weight.</Form.Control.Feedback>
                                        </Form.Group>
                                        <Form.Group as={Col} className="mb-3" controlId="gross_weight">
                                            <Form.Label>Gross Weight (kg) <span className="text-danger">*</span></Form.Label>
                                            <Form.Control type="text" placeholder="Gross Weight (kg)" name="gross_weight" value={purchaseOrderData.gross_weight} onChange={handleChange} required />
                                            <Form.Control.Feedback type="invalid">Please enter Gross Weight.</Form.Control.Feedback>
                                        </Form.Group>
                                    </Row>
                                </>
                            )}
                            <hr />
                            <Row className='g-3 px-2'>
                                <Col md={6}>
                                    <Form.Group as={Col} className="mb-3" controlId="product_id">
                                        <Form.Label>Product <span className="text-danger">*</span></Form.Label>
                                        <ReactSelect
                                            options= {productsData.map((option: ProductsData) => (
                                                { value: option.id, label: option.product_name +' (' + option.product_code + ')' }
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
                                        <tr  className='w-100'>
                                            <th className=''style={{ width: '30%'}}>Item Details</th>
                                            <th className=''>Quantity</th>
                                            <th className=''>Rate</th>
                                            <th className=''>Tax %</th>
                                            <th className=''>Tax Amount</th>
                                            <th className=''>Rate With Tax</th>
                                            <th className=''>Amount</th>
                                            <th style={{width: '110px'}}>Add</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        <tr>
                                            <td>
                                                <Form.Control type="hidden" placeholder="prod_id" name="prod_id" value={selectedProduct.prod_id}/>
                                                <input type="text" className="form-control" name="title" value={selectedProduct.title} readOnly style={{backgroundColor: 'whitesmoke', pointerEvents: 'none'}}/>
                                            </td>
                                            <td>
                                                <Form.Control type="number" placeholder="quantity" name="quantity" value={selectedProduct.quantity} onChange={handleItemInputChange} min={1} onFocus={(e) => e.target.select()} />
                                            </td>
                                            <td>
                                                <Form.Control type="number" placeholder="rate" name="rate" value={selectedProduct.rate} onChange={handleItemInputChange} min={0} onFocus={(e) => e.target.select()} />
                                            </td>
                                            <td>
                                                <input type="number" className="form-control" name="tax" value={selectedProduct.tax} min={0} readOnly style={{backgroundColor: 'whitesmoke', pointerEvents: 'none'}} />
                                            </td>
                                            <td>
                                                <input type="text" className="form-control" name="taxAmount" value={selectedProduct.taxAmount} readOnly style={{backgroundColor: 'whitesmoke', pointerEvents: 'none'}} />
                                            </td>
                                            <td>
                                                <input type="text" className="form-control" name="rateWithTax" value={selectedProduct.rateWithTax} readOnly style={{backgroundColor: 'whitesmoke', pointerEvents: 'none'}} />
                                            </td>
                                            <td>
                                                <input type="text" className="form-control" name="amount" value={selectedProduct.amount} readOnly style={{backgroundColor: 'whitesmoke', pointerEvents: 'none'}} />
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
                                                    <input type="hidden" className="form-control" value={item.prod_id} readOnly style={{backgroundColor: 'whitesmoke', pointerEvents: 'none'}}/>
                                                    <input type="text" className="form-control" value={item.title} readOnly style={{backgroundColor: 'whitesmoke', pointerEvents: 'none'}}/>
                                                </td>
                                                <td>
                                                    <input type="number" className="form-control" value={item.quantity} readOnly style={{backgroundColor: 'whitesmoke', pointerEvents: 'none'}}/>
                                                </td>
                                                <td>
                                                    <input type="number" className="form-control" value={item.rate} readOnly style={{backgroundColor: 'whitesmoke', pointerEvents: 'none'}}/>
                                                </td>
                                                <td>
                                                    <input type="number" className="form-control" value={item.tax} readOnly style={{backgroundColor: 'whitesmoke', pointerEvents: 'none'}} />
                                                </td>
                                                <td>
                                                    <input type="text" className="form-control" value={item.taxAmount} readOnly style={{backgroundColor: 'whitesmoke', pointerEvents: 'none'}} />
                                                </td>
                                                <td>
                                                    <input type="text" className="form-control" value={item.rateWithTax} readOnly style={{backgroundColor: 'whitesmoke', pointerEvents: 'none'}} />
                                                </td>
                                                <td>
                                                    <input type="text" className="form-control" value={item.amount} readOnly style={{backgroundColor: 'whitesmoke', pointerEvents: 'none'}} />
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
                                        <Form.Label column lg={7}>Shipping Charge</Form.Label>
                                        <Col>
                                            <Form.Control type="number" name="shp_charge" value={purchaseOrderData.shp_charge} onChange={handleChange} min={0} onFocus={(e) => e.target.select()} />
                                        </Col>
                                    </Row>
                                </Col>
                            </Row>
                            <Row className="mb-3 g-3 px-2 justify-content-end">
                                <Col md={3}>
                                    <Row>
                                        <Form.Label column lg={7}>Packaging Charge</Form.Label>
                                        <Col>
                                            <Form.Control type="number" name="pkg_charge" value={purchaseOrderData.pkg_charge} onChange={handleChange} min={0} onFocus={(e) => e.target.select()} />
                                        </Col>
                                    </Row>
                                </Col>
                            </Row>
                            <Row className="mb-3 g-3 px-2 justify-content-end">
                                <Col md={3}>
                                    <Row>
                                        <Form.Label column lg={7}>Other Charge</Form.Label>
                                        <Col>
                                            <Form.Control type="number" name="other_charge" value={purchaseOrderData.other_charge} onChange={handleChange} min={0} onFocus={(e) => e.target.select()} />
                                        </Col>
                                    </Row>
                                </Col>
                            </Row>
                            <Row className="mb-3 g-3 px-2 justify-content-end">
                                <Col md={3}>
                                    <Row>
                                        <Form.Label column lg={7}>Total</Form.Label>
                                        <Col>
                                            <Form.Control type="text" name="total" value={purchaseOrderData.total} readOnly style={{backgroundColor: 'whitesmoke', pointerEvents: 'none'}} />
                                        </Col>
                                    </Row>
                                </Col>
                            </Row>
                            {domestic ? (
                                <>
                                    <Row className="mb-3 g-3 px-2 justify-content-end">
                                        <Col md={3}>
                                            <Row>
                                                <Form.Label column lg={7}>IGST</Form.Label>
                                                <Col>
                                                    <Form.Control type="text" name="igst" value={purchaseOrderData.igst} readOnly style={{backgroundColor: 'whitesmoke', pointerEvents: 'none'}} />
                                                </Col>
                                            </Row>
                                        </Col>
                                    </Row>
                                    <Row className="mb-3 g-3 px-2 justify-content-end">
                                        <Col md={3}>
                                            <Row>
                                                <Form.Label column lg={7}>CGST</Form.Label>
                                                <Col>
                                                    <Form.Control type="text" name="cgst" value={purchaseOrderData.cgst} readOnly style={{backgroundColor: 'whitesmoke', pointerEvents: 'none'}} />
                                                </Col>
                                            </Row>
                                        </Col>
                                    </Row>
                                    <Row className="mb-3 g-3 px-2 justify-content-end">
                                        <Col md={3}>
                                            <Row>
                                                <Form.Label column lg={7}>SGST</Form.Label>
                                                <Col>
                                                    <Form.Control type="text" name="sgst" value={purchaseOrderData.sgst} readOnly style={{backgroundColor: 'whitesmoke', pointerEvents: 'none'}} />
                                                </Col>
                                            </Row>
                                        </Col>
                                    </Row>
                                </>
                            ) : (
                                <>
                                </>
                            )}

                            <Row className="mb-3 g-3 px-2 justify-content-end">
                                <Col md={3}>
                                    <Row>
                                        <Form.Label column lg={7}>Grand Total</Form.Label>
                                        <Col>
                                            <Form.Control type="number" name="grand_total" value={purchaseOrderData.grand_total} readOnly style={{backgroundColor: 'whitesmoke', pointerEvents: 'none'}} min={1} />
                                        </Col>
                                    </Row>
                                </Col>
                            </Row>
                            <Row className='mb-3 g-3 px-2 '>
                                <Col md={6}>
                                    <Form.Label>Add quotation attachment  <span className="text-danger">*</span></Form.Label>
                                    <Dropzone onDrop={acceptedFiles => handleDrop(acceptedFiles, 'quotations_attachment')} onRemove={index => handleFileRemove(index, 'quotations_attachment')} />
                                    {shipmentPhotoErrors.files && <div className="text-danger mt-1">{shipmentPhotoErrors.files}</div>}
                                </Col>
                            </Row>
                            {isEditing && purchaseOrderData.quotation_attach !== undefined && purchaseOrderData.quotation_attach.length > 0 && (
                                <>
                                    <Row className='mb-3 px-4'>
                                        {purchaseOrderData?.quotation_attach.map((upload) => (
                                            <>
                                            <Col className='col-md-3 py-1 px-3 border'>
                                                <Button
                                                    key={upload.id}
                                                    className="text-primary p-0"
                                                    variant="link"
                                                    title="Download"
                                                    onClick={() => handleDownload(`/getFileDownload?filepath=uploads/purchase-order/quotations/${upload.name}`)}
                                                    startIcon={<FontAwesomeIcon icon={faDownload} />}
                                                >
                                                    {upload.name}
                                                </Button>
                                            </Col>
                                            </>
                                        ))}
                                    </Row>
                                </>
                            )}
                            <Row className="mb-3 g-3 px-2">
                                <Form.Group as={Col} className="mb-3" controlId="terms_and_conditions">
                                    <Form.Label>Terms And Conditions</Form.Label>
                                    <Form.Control as="textarea" rows={3} placeholder="Terms and Conditions" name="terms_and_conditions" value={purchaseOrderData.terms_and_conditions ? purchaseOrderData.terms_and_conditions : ''} onChange={handleChange} required/>
                                    <Form.Control.Feedback type="invalid">Please enter terms and conditions.</Form.Control.Feedback>
                                </Form.Group>
                            </Row>
                            <Row className='d-flex text-center'>
                                <Col className='mb-4'>
                                    <Button variant="secondary" className='mx-2' onClick={handlePOList}>Close</Button>
                                    <Button variant="primary" className='mx-2' loading={loading} loadingPosition="start" type="submit">{isEditing ? 'Update' : 'Add'}</Button>
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

export default PurchaseOrderForm;
