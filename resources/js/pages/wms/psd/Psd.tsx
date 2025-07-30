import { useEffect, useState, ChangeEvent } from 'react';
import { faPlus } from '@fortawesome/free-solid-svg-icons';
import { Col, Row, Card, Tab } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import useAdvanceTable from '../../../hooks/useAdvanceTable';
import AdvanceTableProvider from '../../../providers/AdvanceTableProvider';
import SearchBox from '../../../components/common/SearchBox';
import PsdTable, { psdTableColumns } from './PsdTable';
import { useAuth } from '../../../AuthContext';
import { useNavigate } from 'react-router-dom';
import Button from '../../../components/base/Button';
import axiosInstance from '../../../axios';
import { downloadFile } from '../../../helpers/utils';

export interface PsdDataType {
    id: number;
    psd_sys_id: string;
    psd_date: string;
    invoice: { invoice_number: string; };
    inward: { id: number;
        inward_sys_id: string;
        inward_date: string;
        port_of_loading: string;
        port_of_discharge: string;
        inco_term: { id: number; inco_term: string; };
        proforma_invoice: { pi_number: string; };
        business_task: { id: number; customer_name: string; };
        grns: [{ id: number; grn_number: string; }];
    }
    boxes_count: number;
}
const Psd = () => {
    const [psdData, setPsdData] = useState<PsdDataType[]>([]);
    const [refreshData, setRefreshData] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const { userPermission } = useAuth(); //check userRole & permissions
    const navigate = useNavigate();

    const handleCreatePsd = () => {
        navigate(`/warehouse-psd/create`);
    };

    const handlePsdEdit = async (inwardId: number) => {
        navigate(`/warehouse-psd/create/${inwardId}`);
    }
    const handleSuccess = () => {
        // Refresh data or perform any other action after successful submission
        setRefreshData(prev => !prev); // Toggle state to trigger re-fetch
    };

    const handlePsdDelete = async ( outward_id: number) => {
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
                axiosInstance.delete(`/warehouse-psd/${outward_id}`)
                .then(response => {
                    swal("Success!", response.data.message, "success");
                    handleSuccess();
                })
                .catch(error => {
                    swal("Error!", error.data.message, "error");
                });
            } else {
                swal("Your record is safe!");
            }
        });
    };

    const handleSearchInputChange = (e: ChangeEvent<HTMLInputElement>) => {
        table.setGlobalFilter(e.target.value || undefined);
    };

    const table = useAdvanceTable({
        data: psdData,
        columns: psdTableColumns(handlePsdEdit, handlePsdDelete),
        pageSize: 10,
        pagination: true,
        sortable: true,
        selection: false,
    });
    useEffect(() => {
        const fetchOutwardData = async () => {
            try {
                const response = await axiosInstance.get('/warehouse-psd'); // Replace with your API URL
                if (response.status !== 200) {
                    throw new Error('Failed to fetch data');
                }
                const data: PsdDataType[] = await response.data;
                setPsdData(data);
            } catch (err: any) {
                setError(err.message);
            } finally {
            }
        };
        fetchOutwardData();
    }, [refreshData]); // Empty array ensures this runs once on mount

    if (error) return <div>Error: {error}</div>;
    return (
        <>
            <h2 className="mb-5">PSD</h2>
            <Card className='border border-translucent'>
                <Row className='p-4'>
                    <Col>
                        <AdvanceTableProvider {...table}>
                            <Row className="g-3 justify-content-between my-2">
                                <Col xs="auto">
                                    <div className="d-flex">
                                        <SearchBox
                                            placeholder="Search psd"
                                            className="me-2"
                                            onChange={handleSearchInputChange}
                                        />
                                    </div>
                                </Col>
                                <Col className="d-flex justify-content-end">
                                    {userPermission.warehouse_create == 1 && (
                                        <Button
                                        variant="primary"
                                        className=""
                                        startIcon={<FontAwesomeIcon icon={faPlus} className="me-2" />}
                                        onClick={() => handleCreatePsd()}
                                        >
                                            Create PSD
                                        </Button>
                                    )}
                                </Col>
                            </Row>
                            <PsdTable />
                        </AdvanceTableProvider>
                    </Col>
                </Row>
            </Card>
        </>
    )
};

export default Psd;
