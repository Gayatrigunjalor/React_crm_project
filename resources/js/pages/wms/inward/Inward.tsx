import { useEffect, useState, ChangeEvent } from 'react';
import { faPlus } from '@fortawesome/free-solid-svg-icons';
import { Col, Row, Card, Tab } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import useAdvanceTable from '../../../hooks/useAdvanceTable';
import AdvanceTableProvider from '../../../providers/AdvanceTableProvider';
import SearchBox from '../../../components/common/SearchBox';
import InwardTable, { inwardTableColumns } from './InwardTable';
import FreightEnquiryModal from './FreightEnquiryModal';
import { useAuth } from '../../../AuthContext';
import { useNavigate } from 'react-router-dom';
import Button from '../../../components/base/Button';
import axiosInstance from '../../../axios';
import { downloadFile } from '../../../helpers/utils';

export interface InwardDataType {
    id: number;
    inward_sys_id: string;
    inward_date: string;
    proforma_invoice: { pi_number: string; };
    business_task: { id: number; customer_name: string; };
    port_of_loading: string;
    port_of_discharge: string;
    inco_term: { id: number; inco_term: string; };
    grns: [{ id: number; grn_number: string; }];
    boxes_count: number;
}
const Inward = () => {
    const [inwardData, setInwardData] = useState<InwardDataType[]>([]);
    const [refreshData, setRefreshData] = useState<boolean>(false);
    const [selectedInwardId, setSelectedInwardId] = useState<number>(0);
    const [showFreightModal, setShowFreightModal] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const { userPermission } = useAuth(); //check userRole & permissions
    const navigate = useNavigate();
    const handleRedirect = (path: string) => {
        navigate(`/${path}`);
    }

    const handleInwardCreate = () => {
        navigate(`/inward/create`);
    };

    const handleInwardEdit = (inwardId: number) => {
        navigate(`/warehouse-inward/edit/${inwardId}`);
    };

    const handleFreightClicked = (inwardId: number) => {
        setSelectedInwardId(inwardId);
        setShowFreightModal(true);
    };

    const handleClose = () => setShowFreightModal(false);

    const handlePDFclicked = async (quoteId: number, path: string) => {
        try {
            // Fetch the file from the server using the ID
            const response = await axiosInstance.get(`/${path}/${quoteId}`, {
                method: 'GET',
                responseType: 'blob',
            });
            if (response.status !== 200) {
                throw new Error('Failed to download the file');
            }
            // Create a Blob from the response data
            const blob = response.data;
            // Retrieve the filename from the response headers or construct it
            const contentDisposition = response.headers['content-disposition'];
            const filename = contentDisposition ? contentDisposition.split('filename=')[1]?.replace(/"/g, '') || 'downloaded-file' : 'downloaded-file';
            //call download file function from utils
            downloadFile(blob, filename); //pass blob data and filename
        } catch (error: any) {
            if (error.status === 404) {
                swal("Error!", 'File not found', "error");
            }
            console.error('Error downloading the file:', error);
        }
    }

    const handleSuccess = () => {
        // Refresh data or perform any other action after successful submission
        setRefreshData(prev => !prev); // Toggle state to trigger re-fetch
    };

    const handleInwardDelete = async ( inwardId: number) => {
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
                axiosInstance.delete(`/deleteInward`, {
                    params: { id: inwardId }
                })
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
        data: inwardData,
        columns: inwardTableColumns(handleInwardEdit, handleInwardDelete, handlePDFclicked, handleFreightClicked),
        pageSize: 10,
        pagination: true,
        sortable: true,
        selection: false,
    });
    useEffect(() => {
        const fetchInwardData = async () => {
            try {
                const response = await axiosInstance.get('/inwardListing'); // Replace with your API URL
                if (response.status !== 200) {
                    throw new Error('Failed to fetch data');
                }
                const data: InwardDataType[] = await response.data;
                setInwardData(data);
            } catch (err: any) {
                setError(err.message);
            } finally {
            }
        };
        fetchInwardData();
    }, [refreshData]); // Empty array ensures this runs once on mount

    if (error) return <div>Error: {error}</div>;
    return (
        <>
            <h2 className="mb-5">Warehouse Inward</h2>
            <Card className='border border-translucent'>
                <Row className='p-4'>
                    <Col>
                        <AdvanceTableProvider {...table}>
                            <Row className="g-3 justify-content-between my-2">
                                <Col xs="auto">
                                    <div className="d-flex">
                                        <SearchBox
                                            placeholder="Search Inward"
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
                                        onClick={() => handleInwardCreate()}
                                        >
                                            Add Inward
                                        </Button>
                                    )}
                                </Col>
                            </Row>
                            <InwardTable />
                        </AdvanceTableProvider>
                    </Col>
                </Row>
            </Card>

            {showFreightModal && (
                <FreightEnquiryModal inwardId={selectedInwardId} onHide={handleClose} />
            )}
        </>
    )
};

export default Inward;
