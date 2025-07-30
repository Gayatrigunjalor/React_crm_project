import { faPlus } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import Button from '../../../components/base/Button';
import { useEffect, useState, ChangeEvent } from 'react';
import { Col, Row, Card } from 'react-bootstrap';
import CustomersTable, { customersTableColumns } from './CustomersTable';
import useAdvanceTable from '../../../hooks/useAdvanceTable';
import AdvanceTableProvider from '../../../providers/AdvanceTableProvider';
import SearchBox from '../../../components/common/SearchBox';
import axiosInstance from '../../../axios';
import CustomersModal from "./CustomersModal";
import CustomersViewModal from "./CustomersViewModal";
import { useNavigate } from 'react-router-dom';
export interface CustomerDataType {
    id: number;
    cust_id: string;
    name: string;
    address: string;
    customer_type: {
        id: string;
        name: string;
    };
    country: CountriesData;
    segment: {
        id: string;
        name: string;
    };
    category: {
        id: string;
        name: string;
    };
    contact_person: string;
    contact_no: string;
}
export interface CountriesData {
    id: string;
    name: string;
};

const Customers = () => {
    const [customerTableData, setCustomerTableData] = useState<CustomerDataType[]>([]);
    const [error, setError] = useState<string | null>(null);
    const [refreshData, setRefreshData] = useState<boolean>(false);
    const [showModal, setShowModal] = useState<boolean>(false);
    const [viewModal, setViewModal] = useState<boolean>(false);
    const [selectedCusId, setSelectedCusId] = useState<number | undefined>(undefined);
    const navigate = useNavigate();

    const handleContacts = (id: number) => {
        navigate(`/sales/customers/contacts/${id}`);
    }

    const handleConsignees = (id: number) => {
        navigate(`/sales/customers/consignees/${id}`);
    }

    const handleAttachments = (id: number) => {
        navigate(`/sales/customers/attachments/${id}`);
    }

    const handleShow = (cusId?: number) => {
        setSelectedCusId(cusId);
        setShowModal(true);
    };

    const handleView = (cusId?: number) => {
        setSelectedCusId(cusId);
        setViewModal(true);
    };

    const handleClose = () => setShowModal(false);
    const handleViewClose = () => setViewModal(false);

    const handleSuccess = () => {
        // Refresh data or perform any other action after successful submission
        setRefreshData(prev => !prev); // Toggle state to trigger re-fetch
    };

    const table = useAdvanceTable({
        data: customerTableData,
        columns: customersTableColumns(handleView, handleShow,handleContacts,handleConsignees,handleAttachments,handleSuccess),
        pageSize: 10,
        pagination: true,
        sortable: true,
        selection: false,
        initialState: {
            columnVisibility: {

            }
        }
    });

    const handleSearchInputChange = (e: ChangeEvent<HTMLInputElement>) => {
        table.setGlobalFilter(e.target.value || undefined);
    };

    useEffect(() => {
        const fetchCustomer = async () => {
            try {
                const response = await axiosInstance.get('/customers'); // Replace with your API URL
                if (response.status !== 200) {
                    throw new Error('Failed to fetch data');
                }
                const data: CustomerDataType[] = await response.data;
                setCustomerTableData(data);
            } catch (err: any) {
                setError(err.message);
            } finally {

            }
        };

        fetchCustomer();
    }, [refreshData]); // Empty array ensures this runs once on mount

    if (error) return <div>Error: {error}</div>;

    return (
        <>
            <h2 className="mb-5">Customers</h2>
            <Card>
                <Card.Body>
                    <AdvanceTableProvider {...table}>
                        <Row className="g-3 justify-content-between mb-4">
                            <Col xs="auto">
                                <div className="d-flex">
                                    <SearchBox
                                        placeholder="Search by name"
                                        className="me-2"
                                        onChange={handleSearchInputChange}
                                    />
                                </div>
                            </Col>
                            <Col xs="auto">
                                <Button
                                    variant="primary"
                                    className=""
                                    startIcon={<FontAwesomeIcon icon={faPlus} className="me-2" />}
                                    onClick={() => handleShow()}
                                >
                                    Add New Customer
                                </Button>
                            </Col>
                        </Row>
                        <CustomersTable />
                    </AdvanceTableProvider>
                </Card.Body>
            </Card>
            {showModal && (
                <CustomersModal cusId={selectedCusId} onHide={handleClose} onSuccess={handleSuccess} />
            )}
            {viewModal && (
                <CustomersViewModal cusId={selectedCusId} onHide={handleViewClose} />
            )}
        </>
    )
};

export default Customers;
