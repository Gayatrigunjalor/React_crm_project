import { useEffect, useState, ChangeEvent } from 'react';
import { useParams } from 'react-router-dom';
import { Form, ListGroup, Col, Row, Nav, Tab, Card } from 'react-bootstrap';
import { faCirclePlus, faEdit, faTrash } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import Button from '../../../components/base/Button';
import axiosInstance from '../../../axios';
import { ColumnDef } from '@tanstack/react-table';
import SearchBox from '../../../components/common/SearchBox';
import useAdvanceTable from '../../../hooks/useAdvanceTable';
import AdvanceTableProvider from '../../../providers/AdvanceTableProvider';
import AdvanceTable from '../../../components/base/AdvanceTable';
import AdvanceTableFooter from '../../../components/base/AdvanceTableFooter';
import swal from 'sweetalert';
import { useAuth } from '../../../AuthContext';
import { useNavigate } from 'react-router-dom';
import PreExportFreight from './PreOngoingShipment';
import ExportOngoingShipment from './ExportOngoingShipment';
import { handlePDFclicked } from './EnquiryDetails';

interface Params {
    btId: number;
}
interface BusinessTaskEditData {
    id: number;
    customer_name: string;
    inco_term_id: number;
    inco_term: IncoTermData;
    freight_target_cost: string;
    port_of_unloading: string;
    shipment_mode: [];
}
interface IncoTermData{
    id: number;
    inco_term: string;
}
interface QuotationProducts {
    id: number;
    product_name: string;
    pi_order_id: number;
    quantity: number;
}

interface QuotationData {
    id: number;
    pi_number: string;
    quotation_products: QuotationProducts[];
}
interface PurchaseOrderData {
    id: number;
    po_number: string;
}
const LmWorksheet = () => {
    const { btId } = useParams();
    const [refreshData, setRefreshData] = useState<boolean>(false);
    const [businessTaskData, setBusinessTaskData] = useState<BusinessTaskEditData>({id: 0, customer_name: '', inco_term_id: 0, inco_term: { id: 0, inco_term: '' }, freight_target_cost: '', port_of_unloading: '', shipment_mode: [] });
    const [quotationData, setQuotationData] = useState<QuotationData[]>([]);
    const [incoTermData, setIncoTermData] = useState<IncoTermData[]>([]);
        const [poData, setPoData] = useState<PurchaseOrderData[]>([]);
    const [vendorInvoicesData, setVendorInvoicesData] = useState([]);
    const [supplierNamesData, setSupplierNamesData] = useState([]);
    const [error, setError] = useState<string | null>(null);
    const [tabKey, setTabKey] = useState('home');
    const { userPermission } = useAuth(); //check userRole & permissions
    const navigate = useNavigate();

    useEffect(() => {
        const fetchBTData = async () => {
            try {
                const response = await axiosInstance.get(`/lmWorksheetEdit/${btId}`);
                if (response.status !== 200) {
                    throw new Error('Failed to fetch data');
                }
                const data: BusinessTaskEditData = await response.data.businessTask;
                const quotation_data: QuotationData[] = await response.data.quotations;
                const vendor_invoices_data = await response.data.vendor_invoices;
                const supplier_names_data = await response.data.supplier_names;
                const po_data: PurchaseOrderData[] = await response.data.po_numbers;
                setBusinessTaskData(data);
                setQuotationData(quotation_data);
                setPoData(po_data);
                setVendorInvoicesData(vendor_invoices_data);
                setSupplierNamesData(supplier_names_data);
            } catch (err: any) {
                setError(err.data.message);
            }
        };
        fetchBTData();
    }, [refreshData]);

    const handleSuccess = () => {
        // Refresh data or perform any other action after successful submission
        setRefreshData(prev => !prev); // Toggle state to trigger re-fetch
    };

    const handleSelect = (eventKey) => {
        // Navigate based on the selected event key
        if (eventKey === "enquiry_details") {
            navigate(`/bt/enquiryDetails/${btId}`);
        }
        else if (eventKey === "sde_worksheet") {
            navigate(`/bt/sdeWorksheetEdit/${btId}`);
        }
        else if (eventKey === "logistics_instruction") {
            navigate(`/bt/logisticsInstructionEdit/${btId}`);
        }
        else if (eventKey === "accounts_worksheet") {
            navigate(`/bt/acWorksheetEdit/${btId}`);
        }
        else if (eventKey === "pm_worksheet") {
            navigate(`/bt/pmWorksheetEdit/${btId}`);
        }
        else if (eventKey === "lm_worksheet") {
            navigate(`/bt/lmWorksheetEdit/${btId}`);
        }
    };

    if (error) return <div>Error: {error}</div>;

    return (
        <>
            <h2 className="mb-5">Inter Departmental Collaboration | BT Id : { businessTaskData.id }</h2>
            <Tab.Container id="basic-tabs-example" defaultActiveKey="lm_worksheet" onSelect={handleSelect}>
                <Row>
                    <Col>
                        <Nav variant="underline" className='ps-2 bg-body-secondary g-2'>
                            <Nav.Item>
                                <Nav.Link eventKey="enquiry_details" className='fs-8'>Sales Worksheet</Nav.Link>
                            </Nav.Item>
                            {/* <Nav.Item>
                                <Nav.Link eventKey="sde_worksheet" className='fs-8'>SDE Attachment</Nav.Link>
                            </Nav.Item>
                            <Nav.Item>
                                <Nav.Link eventKey="logistics_instruction" className='fs-8'>Logistics Instruction</Nav.Link>
                            </Nav.Item> */}
                            <Nav.Item>
                                <Nav.Link eventKey="accounts_worksheet" className='fs-8'>Accounts Worksheet</Nav.Link>
                            </Nav.Item>
                            <Nav.Item>
                                <Nav.Link eventKey="pm_worksheet" className='fs-8'>PM Worksheet</Nav.Link>
                            </Nav.Item>
                            <Nav.Item>
                                <Nav.Link eventKey="lm_worksheet" className='fs-8'>LM Worksheet</Nav.Link>
                            </Nav.Item>
                        </Nav>
                    </Col>
                </Row>
                <Tab.Content>
                    <Tab.Pane eventKey="lm_worksheet">
                        <Row className='mb-2 px-4'>
                            <Col className='bg-white border-bottom py-1'>
                                Customer Name: <span className='fw-semibold'> { businessTaskData.customer_name ?? '' } </span>
                            </Col>
                        </Row>
                        <Row className='mb-2 px-4'>
                            <Col className='bg-white border-bottom py-1'>
                                Inco Term: <span className='fw-semibold'> { businessTaskData.inco_term ? businessTaskData.inco_term.inco_term : '' } </span>
                            </Col>
                            <Col className='bg-white border-bottom py-1'>
                                Freight Target Cost: <span className='fw-semibold'> { businessTaskData.freight_target_cost } </span>
                            </Col>
                            <Col className='bg-white border-bottom py-1'>
                                Port Of Unloading: <span className='fw-semibold'> { businessTaskData.port_of_unloading } </span>
                            </Col>
                            <Col className='bg-white border-bottom py-1'>
                                Shipment Mode: <span className='fw-semibold'> { businessTaskData.shipment_mode } </span>
                            </Col>
                        </Row>
                        <Row className='mb-2 px-4'>
                            <Col className='bg-white border-bottom py-1'>
                                PI No(s): {quotationData.length > 0 && quotationData.map((quote: QuotationData) => (
                                    <span key={quote.id} className='fw-semibold'> <Button variant='link' onClick={() => handlePDFclicked(quote.id, 'pdfWithSignatureQuotation')}>{quote.pi_number}</Button> </span>
                                ))}
                            </Col>
                        </Row>
                        <Row className='mb-2 px-2'>
                            <Col>
                                {quotationData.length > 0 && quotationData.map((quote: QuotationData) => (
                                    <ListGroup variant="flush" key={quote.id}>
                                        <ListGroup.Item className='bg-secondary text-light'>Product(s) of Proforma Invoice : {quote.pi_number}</ListGroup.Item>
                                        {quote.quotation_products.length > 0 ? (
                                            quote.quotation_products.map((product: QuotationProducts) => (
                                                <ListGroup.Item key={product.id}><span className='fw-semibold'> {product.product_name} </span> &nbsp;&nbsp;&nbsp; Qty: <span className='fw-semibold'>{product.quantity}</span></ListGroup.Item>
                                            ))
                                        ) : (
                                            <span>No products available</span>
                                        )}
                                    </ListGroup>
                                ))}
                            </Col>
                        </Row>
                        <Row className='mb-2 px-4'>
                            <Col className='bg-white border-bottom border-top py-1'>
                                PO Number(s): {poData.length > 0 && poData.map((purchase_order: PurchaseOrderData) => (
                                    <span key={purchase_order.id} className='fw-semibold'> <Button variant='link' onClick={() => handlePDFclicked(purchase_order.id, 'pdfWithSignature')}>{purchase_order.po_number}</Button></span>
                                ))}
                            </Col>
                            <Col className='bg-white border-bottom border-top py-1'>
                                Vendor Invoice number: {vendorInvoicesData.length > 0 && vendorInvoicesData.map((vendorInv) => (
                                    <span key={vendorInv} className='fw-semibold'>{vendorInv}&nbsp;&nbsp;&nbsp;</span>
                                ))}
                            </Col>
                            <Col className='bg-white border-bottom border-top py-1'>
                                Supplier(s): {supplierNamesData.length > 0 && supplierNamesData.map((supplier) => (
                                    <span key={supplier} className='fw-semibold'>{supplier}&nbsp;&nbsp;&nbsp;</span>
                                ))}
                            </Col>
                        </Row>

                        <Card className='border border-translucent'>

                            <Row className='mt-4 px-4 pb-4'>
                            <Tab.Container
                                id="controlled-tab-example"
                                activeKey={tabKey}
                                onSelect={(k) => setTabKey(k)}
                                className="mb-3 nav-underline"
                            >
                            <Nav variant="underline" className="mb-3">
                                <Nav.Item>
                                    <Nav.Link eventKey="home" className='fs-8'>Pre Ongoing Shipment</Nav.Link>
                                </Nav.Item>
                                <Nav.Item>
                                    <Nav.Link eventKey="profile" className='fs-8'>Export Ongoing Shipment</Nav.Link>
                                </Nav.Item>

                            </Nav>
                            <Tab.Content>
                                <Tab.Pane eventKey="home">
                                    <PreExportFreight btId={btId} />
                                </Tab.Pane>
                                <Tab.Pane eventKey="profile">
                                    <ExportOngoingShipment btId={btId} />
                                </Tab.Pane>

                                </Tab.Content>
                            </Tab.Container>
                            </Row>
                        </Card>
                    </Tab.Pane>
                </Tab.Content>
            </Tab.Container>
        </>
    )
};

export default LmWorksheet;
