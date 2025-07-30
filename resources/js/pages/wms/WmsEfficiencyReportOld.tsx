import { useEffect, useState, ChangeEvent } from 'react';
import { faPlus, faRefresh } from '@fortawesome/free-solid-svg-icons';
import { Form, Card, Row, Col, Tab } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useAuth } from '../../AuthContext';
import { useNavigate } from 'react-router-dom';
import Button from '../../components/base/Button';
import axiosInstance from '../../axios';
import { downloadFile } from '../../helpers/utils';
import ReactSelect from '../../components/base/ReactSelect';
import swal from 'sweetalert';

interface InwardListingData {
    id: number;
    inward_sys_id: string;
}
interface BTListingData {
    id: number;
    customer_name: string;
}
interface InvoicesData {
    id: number;
    invoice_number: string;
}
export interface FormData {
    inward: InwardListingData | null;
    inward_id: number;
    business_task: BTListingData | null;
    business_task_id: number;
    invoice: InvoicesData | null;
    invoice_id: number;
}

interface Invoice {
    id: number;
    invoice_number: string;
    invoice_date: string;
    shipment_type: string;
    exchange_rate: number;
    currency: string;
    received_amount: number;
    grand_total: number;
    buyer_id: string;
    buyer: {
        id: number;
        name: string;
    };
    ebrc: null | any; // Assuming ebrc can be null or some other type
}

interface ProductDetails {
    id: number;
    product_code: string;
    product_name: string;
}

interface Product {
    id: number;
    warehouse_box_id: number;
    product_code_id: number;
    product_quantity: number;
    product_hsn: string;
    hazardous_symbol: string;
    manufacture_year: string;
    box_content: string;
    created_at: string;
    updated_at: string;
    product_details: ProductDetails;
}

interface LocationDetails {
    id: number;
    warehouse_name: string;
    rack_number: string;
    floor: string;
}

interface PurchaseOrderDetails {
    id: number;
    purchase_order_number: string;
    vendor_id: number;
    order_date: string;
    vendor: {
        id: number;
        name: string;
    };
}

interface GRNNumber {
    id: number;
    grn_number: string;
    vendor_tax_invoice_number: string;
    vendor_tax_invoice_date: string;
    vendor_tax_invoice_attachment: string;
}

interface Box {
    id: number;
    inward_id: number;
    grn_sys_id: number;
    box_sys_id: string;
    purchase_order_id: number;
    location_detail_id: number;
    box_packaging_done: number;
    net_weight: number;
    gross_weight: number;
    length: number;
    width: number;
    height: number;
    grn_number: GRNNumber;
    purchase_order_details: PurchaseOrderDetails;
    products: Product[];
    location_details: LocationDetails;
}

interface FFDDetails {
    id: number;
    ffd_name: string;
    ffd_type: string;
    ffd_relation: string;
    country_id: number;
    state_id: number;
    address: string;
    city: string;
    pin_code: string;
    website: string | null;
    created_at: string;
    updated_at: string;
}

interface InvoiceDetails {
    id: number;
    invoice_number: string;
    invoice_date: string;
    no_of_packages: string;
    total_net_weight: number;
    total_gross_weight: number;
    total_value_weight: number;
    international_ffd_id: number;
    domestic_ffd_id: number;
    ffd_international: FFDDetails;
    ffd_domestic: FFDDetails;
}

interface Outward {
    id: number;
    outward_sys_id: string;
    outward_date: string;
    inward_id: number;
    invoice_id: number;
    eway_bill_number: string;
    eway_bill_date: string;
    eway_bill_attachment: string;
    created_by: number;
    created_at: string;
    updated_at: string;
    deleted_at: string | null;
    invoice_number: string;
    invoice_date: string;
    no_of_packages: string;
    ffdInternational_ffd_name: string;
    ffdInternational_address: string;
    ffdInternational_city: string;
    ffdInternational_pin_code: string;
    total_net_weight: number;
    total_gross_weight: number;
    total_value_weight: number;
    ffdDomestic_ffd_name: string;
    ffdDomestic_address: string;
    ffdDomestic_city: string;
    ffdDomestic_pin_code: string;
    logistics: boolean;
    pickup_proof: string;
    e_way_bill: string;
    delivery_challan: string;
    id_card: string;
    delivery_boy_photo: string;
    kyc: string;
    invoice: InvoiceDetails;
}

interface ProformaInvoice {
    id: number;
    pi_number: string;
}

interface IncoTerm {
    id: number;
    inco_term: string;
}

interface BusinessTask {
    id: number;
    customer_name: string;
}
interface PSD {
    id: number;
    psd_sys_id: string;
    inward_id: number;
    invoice_id: number;
    psd_date: string;
    created_by: number;
    created_at: string;
    updated_at: string;
    deleted_at: string | null;
    regulation: boolean;
    awb_no: string;
    shipping_bill_no: string;
    egm_no: string;
    awb_date: string;
    shipping_bill_date: string;
    egm_date: string;
    invoice: InvoiceDetails;
    awb: string;
    shipping_bill: string;
    packing_list: string;
    other: string;
}
interface Inward {
    id: number;
    inward_sys_id: string;
    inward_date: string;
    mode_of_shipment: string;
    terms_of_shipment: string;
    proforma_invoice_id: number;
    business_task_id: number;
    port_of_loading: string;
    port_of_discharge: string;
    inco_term_id: number;
    pickup_location: string;
    boxes: Box[];
    business_task: BusinessTask;
    proforma_invoice: ProformaInvoice;
    inco_term: IncoTerm;
    outwards: Outward[];
    psds: PSD[];
}

interface RootObject {
    invoices: Invoice[];
    selected_id: number;
    inward: Inward;
    show_report: boolean;
    boxes_by_grn: {
        [key: string]: Box[];
    };
    logistics_array: Outward[];
}

const WmsEfficiencyReportOld = () => {
    const [formData, setFormData] = useState<FormData>({
        inward: null,
        inward_id: 0,
        business_task: null,
        business_task_id: 0,
        invoice: null,
        invoice_id: 0,
    });

    const [inwardListingData, setInwardListingData] = useState<InwardListingData[]>([]);
    const [btListingData, setBtListingData] = useState<BTListingData[]>([]);
    const [invoicesData, setInvoicesData] = useState<InvoicesData[]>([]);
    const [refreshData, setRefreshData] = useState<boolean>(false);
    const [validated, setValidated] = useState<boolean>(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const { userPermission } = useAuth(); //check userRole & permissions
    const navigate = useNavigate();

    useEffect(() => {
        const fetchListingData = async () => {
            try {
                const response = await axiosInstance.get(`/wmsReporting`);
                if (response.status !== 200) {
                    throw new Error('Failed to fetch data');
                }
                const inward_list: InwardListingData[] = await response.data.inwards;
                const bt_list: BTListingData[] = response.data.business_task;
                const invoice_list: InvoicesData[] = response.data.invoices;

                setInwardListingData(inward_list);
                setBtListingData(bt_list);
                setInvoicesData(invoice_list);
            } catch (err: any) {
                setError(err.data.message);
            }
        };
        fetchListingData();
    }, []);

    const handleReset = () => {
        console.log('test');

    }

    const handleInwardSelect = (selectedOption: any) => {
        if (selectedOption) {
            setFormData(prev => ({
                ...prev,
                inward: { id: selectedOption.value, inward_sys_id: selectedOption.label },
                inward_id: selectedOption.value
            }));
        }
    };

    const handleBTselection = (selectedOption: any) => {
        if (selectedOption) {
            setFormData(prev => ({
                ...prev,
                business_task: { id: selectedOption.value, customer_name: selectedOption.label },
                business_task_id: selectedOption.value
            }));
        }
    };

    const handleInvoiceChange = (selectedOption: any) => {
        if (selectedOption) {
            setFormData(prev => ({
                ...prev,
                invoice: { id: selectedOption.value, invoice_number: selectedOption.label },
                invoice_id: selectedOption.value
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

        setLoading(true);
        setValidated(true);

        const apiCall = axiosInstance.post('/getReportingDetails', {
                ...formData,
            }
        );

        apiCall
            .then((response) => {
                console.log(response.data);

        })
        .catch(error => swal("Error!", error.data.message, "error"))
        .finally(() => { setLoading(false); });

    };

    if (error) return <div>Error: {error}</div>;
    return (
        <>
            <h2 className="mb-5">WMS Efficiency Report</h2>
            <Card className='border border-translucent'>
                <Card.Body>
                    <Form noValidate validated={validated} onSubmit={handleSubmit}>

                        <Row className='mb-2'>
                            <Form.Group as={Col} className="mb-3">
                                <Form.Label>Select Inward ID <span className="text-danger">*</span></Form.Label>
                                <ReactSelect
                                    options= {inwardListingData.map((option: InwardListingData) => (
                                        { value: option.id, label: option.inward_sys_id }
                                    ))}
                                    placeholder="Select Inward ID" name="inward" value={formData.inward ? { value: formData.inward.id, label: formData.inward.inward_sys_id } : null} onChange={(selectedOption) => handleInwardSelect(selectedOption)} />
                                <Form.Control type="hidden" name="inward_id" value={formData.inward_id} />

                            </Form.Group>
                            <Form.Group as={Col} className="mb-3">
                                <Form.Label>Business Task Id <span className="text-danger">*</span></Form.Label>
                                <ReactSelect
                                    options= {btListingData.map((option: BTListingData) => (
                                        { value: option.id, label: `${option.id} (${option.customer_name})` }
                                    ))}
                                    placeholder="Select Business Task" name="business_task" value={formData.business_task ? { value: formData.business_task.id, label: formData.business_task.customer_name } : null} onChange={(selectedOption) => handleBTselection(selectedOption)} />
                                    <Form.Control type="hidden" name="business_task_id" value={formData.business_task_id} />

                            </Form.Group>
                            <Form.Group as={Col} className="mb-3">
                                <Form.Label>Select Invoice <span className="text-danger">*</span></Form.Label>
                                <ReactSelect
                                    options= {invoicesData.map((option: InvoicesData) => (
                                        { value: option.id, label: `${option.invoice_number}` }
                                    ))}
                                    placeholder="Select Invoice" name="invoice" value={formData.invoice ? { value: formData.invoice.id, label: formData.invoice.invoice_number } : null} onChange={(selectedOption) => handleInvoiceChange(selectedOption)} />
                                    <Form.Control type="hidden" name="invoice_id" value={formData.invoice_id} />

                            </Form.Group>
                        </Row>
                        <Row className='mt-2'>
                            <Col className='text-center'>
                                <Button variant="primary" loading={loading} loadingPosition="start" type="submit">Generate Report</Button>
                                <Button variant="primary" className="ms-2" startIcon={<FontAwesomeIcon icon={faRefresh} className="me-2" />} onClick={() => { handleReset()}} >Reset</Button>
                            </Col>
                        </Row>
                    </Form>

                </Card.Body>
            </Card>

        </>
    )
};

export default WmsEfficiencyReportOld;
