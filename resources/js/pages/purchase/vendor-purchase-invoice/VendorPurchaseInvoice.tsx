import { faPlus } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import Button from '../../../components/base/Button';
import { useEffect, useState, ChangeEvent } from 'react';
import { Col, Row, Nav, Card } from 'react-bootstrap';
import VendorPurchaseTable, { vpiTableColumns } from './VendorPurchaseTable';
import useAdvanceTable from '../../../hooks/useAdvanceTable';
import AdvanceTableProvider from '../../../providers/AdvanceTableProvider';
import SearchBox from '../../../components/common/SearchBox';
import axiosInstance from '../../../axios';
import { useAuth } from '../../../AuthContext';
import { useNavigate } from 'react-router-dom';

export interface VendorPurchaseTblData {
    id: number;
    purchase_order_id: number;
    purchase_order: { id: number; purchase_order_number: string; }
    purchase_invoice_no: string;
    purchase_invoice_date: string;
    vendor_id: number;
    vendor: { id: number; name: string; }
    business_task_id: number;
    base_amount: number;
    gst_percent: number;
    gst_amount: number;
    tds_deduction: number;
    tds_amount: number;
    net_payable: number;
    paid_amount: number;
    bank_name: string;
    utr_number: string;
    utr_date: string;
    attachments: [{ id: number; name: string; }]
}
const VendorPurchaseInvoice = () => {
    const [vendorPurchase, setVendorPurchase] = useState<VendorPurchaseTblData[]>([]);
    const [error, setError] = useState<string | null>(null);
    const { userPermission } = useAuth(); //check userRole & permissions
    const navigate = useNavigate();

    const handleCreate = () => {
        navigate(`/vendor-purchase-invoice/create`);
    };
    const handleEdit = (vpiId: number) => {
        navigate(`/vendor-purchase-invoice/edit/${vpiId}`);
    };

    const handleSearchInputChange = (e: ChangeEvent<HTMLInputElement>) => {
        table.setGlobalFilter(e.target.value || undefined);
    };

    const table = useAdvanceTable({
        data: vendorPurchase,
        columns: vpiTableColumns(handleEdit),
        pageSize: 10,
        pagination: true,
        sortable: true,
        selection: false,
    });

    //fetch employees table data on component load and update data on edit
    useEffect(() => {
        const fetchPurchaseOrderData = async () => {
            try {
                const response = await axiosInstance.get('/vendor-purchase-invoice'); // Replace with your API URL
                if (response.status !== 200) {
                    throw new Error('Failed to fetch data');
                }
                const data: VendorPurchaseTblData[] = await response.data;
                setVendorPurchase(data);
            } catch (err: any) {
                setError(err.message);
            } finally {
            }
        };
        fetchPurchaseOrderData();
    }, []); // Empty array ensures this runs once on mount

    if (error) return <div>Error: {error}</div>;

    return (
        <>
            <h2 className="mb-5">Vendor Purchase Invoice</h2>
            <Card>
                <Card.Body>
                    <AdvanceTableProvider {...table}>
                        <Row className="g-3 justify-content-between my-2">
                            <Col xs="auto">
                                <div className="d-flex">
                                    <SearchBox
                                        placeholder="Search Vendor Purchase Invoice"
                                        className="me-2"
                                        onChange={handleSearchInputChange}
                                    />
                                </div>
                            </Col>

                            <Col className="d-flex justify-content-end">
                                <Button
                                    variant="primary"
                                    className=""
                                    startIcon={<FontAwesomeIcon icon={faPlus} className="me-2" />}
                                    onClick={() => handleCreate()}
                                >
                                    Add New Vendor Purchase Invoice
                                </Button>
                            </Col>
                        </Row>
                        <VendorPurchaseTable />
                    </AdvanceTableProvider>
                </Card.Body>
            </Card>
        </>
    )
};

export default VendorPurchaseInvoice;
