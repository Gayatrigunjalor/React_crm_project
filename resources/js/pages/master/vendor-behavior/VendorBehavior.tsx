import { faCirclePlus } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import Button from '../../../components/base/Button';
import React, { useEffect, useState, ChangeEvent } from 'react';
import { Col, Row } from 'react-bootstrap';
import axiosInstance from '../../../axios';
import VendorBehaviorTable, { vendorBehaviorTableColumns } from './VendorBehaviorTable';
import useAdvanceTable from '../../../hooks/useAdvanceTable';
import AdvanceTableProvider from '../../../providers/AdvanceTableProvider';
import SearchBox from '../../../components/common/SearchBox';
import VendorBehaviorModal from './VendorBehaviorModal';

export interface VendorBehaviorDataType {
    id: number;
    name: string;
}


const VendorBehavior = () => {
    const [vendorBehaviorTableData, setVendorBehaviorTableData] = useState<VendorBehaviorDataType[]>([]);
    const [error, setError] = useState<string | null>(null);

    const [showModal, setShowModal] = useState<boolean>(false);
    const [refreshData, setRefreshData] = useState<boolean>(false);
    const [selectedUserId, setSelectedUserId] = useState<number | undefined>(undefined);

    const handleShow = (userId?: number) => {
        setSelectedUserId(userId);
        setShowModal(true);
    };

    const handleClose = () => setShowModal(false);

    const handleSuccess = () => {
        // Refresh data or perform any other action after successful submission
        setRefreshData(prev => !prev); // Toggle state to trigger re-fetch
    };

    const table = useAdvanceTable({
        data: vendorBehaviorTableData,
        columns: vendorBehaviorTableColumns(handleShow, handleSuccess),
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
        const fetchVendorBehavior = async () => {
            try {
                const response = await axiosInstance.get('/vendor-behavior');
                if (response.status !== 200) {
                    throw new Error('Failed to fetch data');
                }
                const data: VendorBehaviorDataType[] = await response.data;
                setVendorBehaviorTableData(data);
            } catch (err: any) {
                setError(err.message);
            } finally {

            }
        };

        fetchVendorBehavior();
    }, [refreshData]);

    if (error) return <div>Error: {error}</div>;

    return (
        <>
            <AdvanceTableProvider {...table}>
                <h2 className="mb-5">Vendor Behaviour</h2>
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
                            startIcon={<FontAwesomeIcon icon={faCirclePlus} className="me-2" />}
                            onClick={() => handleShow()}
                        >
                            Add New Vendor Behaviour
                        </Button>
                    </Col>
                </Row>
                <VendorBehaviorTable handleShow={handleShow} handleSuccess={handleSuccess} />
            </AdvanceTableProvider>
            {showModal && (
                <VendorBehaviorModal userId={selectedUserId} onHide={handleClose} onSuccess={handleSuccess} />
            )}
        </>
    )
};

export default VendorBehavior;
