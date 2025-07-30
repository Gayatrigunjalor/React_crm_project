import { faCirclePlus } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import Button from '../../../components/base/Button';
import React, { useEffect, useState, ChangeEvent } from 'react';
import { Card, Col, Row } from 'react-bootstrap';
import axiosInstance from '../../../axios';
import AssetsTable, { assetTableColumns } from './AssetsTable';
import useAdvanceTable from '../../../hooks/useAdvanceTable';
import AdvanceTableProvider from '../../../providers/AdvanceTableProvider';
import SearchBox from '../../../components/common/SearchBox';
import AssetModal from './AssetsModal';
import AssetHistoryModal from './AssetHistoryModal';

export interface AssetDataType {
    id: number;
    asset_id: string;
    asset_name: string;
    asset_desc: string;
    warranty_card: string;
    invoice: string;
    asset_type: {
        id: number;
        name: string;
    };
    purchase_date: Date;
    warranty_exp_date: Date;
    vendor_id: number;
    vendors: {
        id: number;
        name: string;
    };
    assigned_to_emp: null | number;
};

const Assets = () => {
    const [assetTableData, setAssetTableData] = useState<AssetDataType[]>([]);
    const [error, setError] = useState<string | null>(null);

    const [showModal, setShowModal] = useState<boolean>(false);
    const [showAssetHistoryModal, setShowAssetHistoryModal] = useState<boolean>(false);
    const [refreshData, setRefreshData] = useState<boolean>(false);
    const [selectedUserId, setSelectedUserId] = useState<number | undefined>(undefined);
    const [selectedHistoryUserId, setSelectedHistoryUserId] = useState<number | undefined>(undefined);

    const handleShow = (userId?: number) => {
        setSelectedUserId(userId);
        setShowModal(true);
    };

    const handleClose = () => setShowModal(false);

    const handleHistoryShow = (userId: number) => {
        setSelectedHistoryUserId(userId);
        setShowAssetHistoryModal(true);
    };

    const handleHistoryClose = () => setShowAssetHistoryModal(false);

    const handleSuccess = () => {
        // Refresh data or perform any other action after successful submission
        setRefreshData(prev => !prev); // Toggle state to trigger re-fetch
    };

    const table = useAdvanceTable({
        data: assetTableData,
        columns: assetTableColumns(handleShow, handleSuccess,handleHistoryShow),
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
        const fetchAsset = async () => {
            try {
                const response = await axiosInstance.get('/assets');
                if (response.status !== 200) {
                    throw new Error('Failed to fetch data');
                }
                const data: AssetDataType[] = await response.data;
                setAssetTableData(data);
            } catch (err: any) {
                setError(err.message);
            } finally {

            }
        };

        fetchAsset();
    }, [refreshData]);



    if (error) return <div>Error: {error}</div>;

    return (
        <>
            <h2 className="mb-5">Asset</h2>
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
                                    startIcon={<FontAwesomeIcon icon={faCirclePlus} className="me-2" />}
                                    onClick={() => handleShow()}
                                >
                                    Add New Asset
                                </Button>
                            </Col>
                        </Row>
                        <AssetsTable handleShow={handleShow} handleSuccess={handleSuccess} />
                    </AdvanceTableProvider>
                </Card.Body>
            </Card>
            {showModal && (
                <AssetModal userId={selectedUserId} onHide={handleClose} onSuccess={handleSuccess} />
            )}

            {showAssetHistoryModal && (
                <AssetHistoryModal userId={selectedHistoryUserId} onHide={handleHistoryClose} />
            )}
        </>
    )
};

export default Assets;
