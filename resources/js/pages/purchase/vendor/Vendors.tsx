import { faPlus } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import Button from '../../../components/base/Button';
import { useEffect, useState, ChangeEvent } from 'react';
import { Col, Row, Card } from 'react-bootstrap';
import VendorsTable, { vendorsTableColumns } from './VendorsTable';
import useAdvanceTable from '../../../hooks/useAdvanceTable';
import AdvanceTableProvider from '../../../providers/AdvanceTableProvider';
import SearchBox from '../../../components/common/SearchBox';
import axiosInstance from '../../../axios';
import VendorsModal  from './VendorsModal';
import VendorsViewModal  from './VendorsViewModal';
import { useAuth } from '../../../AuthContext';
import { useNavigate } from 'react-router-dom';
import { formatDateToDayMonthYear } from '../../../helpers/utils';

export interface VendorsDataType {
    id: number;
    name: string;
    vender_type_id: string;
    entity_type_id: string;
    segment_id: string;
    vendor_behavior_id: string;
    contact_person: string;
    employee_name: string;
    created_at: Date;
}

const Vendors = () => {
    const [vendorsTableData, setVendorsTableData] = useState<VendorsDataType[]>([]);
    const [entityTypeData, setEntityTypeData] = useState([]);
    const [segmentsData, setSegmentsData] = useState([]);
    const [vendorBehaviorsData, setVendorBehaviorsData] = useState([]);
    const [vendorTypesData, setVendorTypesData] = useState([]);
    const [countriesData, setCountriesData] = useState([]);
    const [showModal, setShowModal] = useState<boolean>(false); //modal
    const [viewModal, setViewModal] = useState<boolean>(false);
    const [refreshData, setRefreshData] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const [selectedUserId, setSelectedUserId] = useState<number | undefined>(undefined);
    const { userPermission } = useAuth(); //check userRole & permissions
    const navigate = useNavigate();

    const handleContacts = (id: number) => {
        navigate(`/purchase/vendors/contacts/${id}`);
    }

    const handleAttachments = (id: number) => {
        navigate(`/purchase/vendors/attachments/${id}`);
    }

    const handleShow = (userId?: number) => {
        setSelectedUserId(userId);
        setShowModal(true);
    };

    const handleView = (cusId?: number) => {
        setSelectedUserId(cusId);
        setViewModal(true);
    };

    const handleClose = () => setShowModal(false); //close modal function
    const handleViewClose = () => setViewModal(false);

    const handleSuccess = () => {
        // Refresh data or perform any other action after successful submission
        setRefreshData(prev => !prev); // Toggle state to trigger re-fetch
    };


    const handleSearchInputChange = (e: ChangeEvent<HTMLInputElement>) => {
        table.setGlobalFilter(e.target.value || undefined);
    };

    const table = useAdvanceTable({
        data: vendorsTableData,
        columns: vendorsTableColumns(handleView, handleShow, handleContacts, handleAttachments),
        pageSize: 10,
        pagination: true,
        sortable: true,
        selection: false,
        initialState: {
            columnVisibility: {

            }
        }
    });

    //fetch vendors table data on component load and update data on edit,delete table
    useEffect(() => {
        const fetchVendorsData = async () => {
            try {
                const response = await axiosInstance.get('/vendors'); // Replace with your API URL
                if (response.status !== 200) {
                    throw new Error('Failed to fetch data');
                }
                const data: VendorsDataType[] = await response.data;
                setVendorsTableData(data);
            } catch (err: any) {
                setError(err.message);
            } finally {
            }
        };
        fetchVendorsData();
    }, [refreshData]); // Empty array ensures this runs once on mount

    useEffect(() => {
        const fetchEntityType = async () => {
            try {
                const response = await axiosInstance.get('/entityTypeListing');
                if (response.status !== 200) {
                    throw new Error('Failed to fetch data');
                }
                const data = await response.data;
                setEntityTypeData(data);
            } catch (err: any) {
                setError(err.message);
            } finally {
            }
        };
        const fetchSegment = async () => {
            try {
                const response = await axiosInstance.get('/segmentListing');
                if (response.status !== 200) {
                    throw new Error('Failed to fetch data');
                }
                const data = await response.data;
                setSegmentsData(data);
            } catch (err: any) {
                setError(err.message);
            } finally {
            }
        };

        const fetchVendorBehavior = async () => {
            try {
                const response = await axiosInstance.get('/vendorBehaviorListing');
                if (response.status !== 200) {
                    throw new Error('Failed to fetch data');
                }
                const data = await response.data;
                setVendorBehaviorsData(data);
            } catch (err: any) {
                setError(err.message);
            } finally {
            }
        };
        const fetchVendorType = async () => {
            try {
                const response = await axiosInstance.get('/vendorTypeListing');
                if (response.status !== 200) {
                    throw new Error('Failed to fetch data');
                }
                const data = await response.data;
                setVendorTypesData(data);
            } catch (err: any) {
                setError(err.message);
            } finally {
            }
        };
        const fetchCountries = async () => {
            try {
                const response = await axiosInstance.get('/countryListing');
                if (response.status !== 200) {
                    throw new Error('Failed to fetch data');
                }
                const data = await response.data;
                setCountriesData(data);
            } catch (err: any) {
                setError(err.message);
            } finally {
            }
        };

        fetchVendorType();
        fetchVendorBehavior();
        fetchSegment();
        fetchEntityType();
        fetchCountries();
    }, []);

    if (error) return <div>Error: {error}</div>;

    return (
        <>
            <h2 className="mb-5">Vendors</h2>
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
                                    Add New Vendors
                                </Button>
                            </Col>
                        </Row>
                        <VendorsTable />
                    </AdvanceTableProvider>
                </Card.Body>
            </Card>
            {showModal && (
                <VendorsModal userId={selectedUserId} onHide={handleClose} onSuccess={handleSuccess} entityTypeData={entityTypeData} segmentsData={segmentsData} vendorBehaviorsData={vendorBehaviorsData} vendorTypesData={vendorTypesData} countriesData={countriesData} />
            )}
            {viewModal && (
                <VendorsViewModal cusId={selectedUserId} onHide={handleViewClose} />
            )}
        </>
    )
};

export default Vendors;
