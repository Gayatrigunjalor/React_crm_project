import { faCirclePlus } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import Button from '../../../components/base/Button';
import React, { useEffect, useState, ChangeEvent } from 'react';
import { Col, Row } from 'react-bootstrap';
import axiosInstance from '../../../axios';
import HsnCodeTable, { hsnCodeTableColumns } from './HsnCodeTable';
import useAdvanceTable from '../../../hooks/useAdvanceTable';
import AdvanceTableProvider from '../../../providers/AdvanceTableProvider';
import SearchBox from '../../../components/common/SearchBox';
import HsnCodeModal from './HsnCodeModal';

export interface HsnCodeDataType {
    id: number;
    hsn_code: number;
}


const HsnCode = () => {
    const [hsnCodeTableData, setHsnCodeTableData] = useState<HsnCodeDataType[]>([]);
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
        data: hsnCodeTableData,
        columns: hsnCodeTableColumns(handleShow, handleSuccess),
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
        const fetchHsnCode = async () => {
            try {
                const response = await axiosInstance.get('/hsn-code');
                if (response.status !== 200) {
                    throw new Error('Failed to fetch data');
                }
                const data: HsnCodeDataType[] = await response.data;
                setHsnCodeTableData(data);
            } catch (err: any) {
                setError(err.message);
            } finally {

            }
        };

        fetchHsnCode();
    }, [refreshData]);

    if (error) return <div>Error: {error}</div>;

    return (
        <>
            <AdvanceTableProvider {...table}>
                <h2 className="mb-5">HSN code</h2>
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
                            Add New HSN code
                        </Button>
                    </Col>
                </Row>
                <HsnCodeTable handleShow={handleShow} handleSuccess={handleSuccess} />
            </AdvanceTableProvider>
            {showModal && (
                <HsnCodeModal userId={selectedUserId} onHide={handleClose} onSuccess={handleSuccess} />
            )}
        </>
    )
};

export default HsnCode;
