import { faCirclePlus } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import Button from '../../../components/base/Button';
import React, { useEffect, useState, ChangeEvent } from 'react';
import { Col, Row } from 'react-bootstrap';
import axiosInstance from '../../../axios';
import CategoryTable, { categoryTableColumns } from './CategoryTable';
import useAdvanceTable from '../../../hooks/useAdvanceTable';
import AdvanceTableProvider from '../../../providers/AdvanceTableProvider';
import SearchBox from '../../../components/common/SearchBox';
import CategoryModal from './CategoryModal';
import {SegmentDataType} from './CategoryModal';

export interface CategoryDataType {
    id: number;
    name: string;
    description: string;
    segment: {
        id: number;
        name: string;
    };
};

const Category = () => {
    const [categoryTableData, setCategoryTableData] = useState<CategoryDataType[]>([]);
    const [segmentData, setSegmentData] = useState<SegmentDataType[]>([]);
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
        data: categoryTableData,
        columns: categoryTableColumns(handleShow, handleSuccess),
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
        const fetchCategory = async () => {
            try {
                const response = await axiosInstance.get('/category');
                if (response.status !== 200) {
                    throw new Error('Failed to fetch data');
                }
                const data: CategoryDataType[] = await response.data;
                setCategoryTableData(data);
            } catch (err: any) {
                setError(err.message);
            } finally {

            }
        };

        fetchCategory();
    }, [refreshData]);

    useEffect(() => {
        const fetchSegment = async () => {
            try {
                const response = await axiosInstance.get('/segmentListing');
                if (response.status !== 200) {
                    throw new Error('Failed to fetch data');
                }
                const segmentDt: SegmentDataType[] = await response.data;
                setSegmentData(segmentDt);
            } catch (err: any) {
                setError(err.message);
            } finally {

            }
        };

        fetchSegment();
    }, []);

    if (error) return <div>Error: {error}</div>;

    return (
        <>
            <AdvanceTableProvider {...table}>
                <h2 className="mb-5">Category</h2>
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
                            Add New Category
                        </Button>
                    </Col>
                </Row>
                <CategoryTable handleShow={handleShow} handleSuccess={handleSuccess} />
            </AdvanceTableProvider>
            {showModal && (
                <CategoryModal userId={selectedUserId} segmentData={segmentData} onHide={handleClose} onSuccess={handleSuccess} />
            )}
        </>
    )
};

export default Category;
