import { faPlus } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import Button from '../../../components/base/Button';
import { useEffect, useState, ChangeEvent } from 'react';
import { Col, Row, Nav, Card } from 'react-bootstrap';
import PurchaseOrderTable, { poTableColumns } from './PurchaseOrderTable';
import useAdvanceTable from '../../../hooks/useAdvanceTable';
import AdvanceTableProvider from '../../../providers/AdvanceTableProvider';
import SearchBox from '../../../components/common/SearchBox';
import axiosInstance from '../../../axios';
import PurchaseOrderPaymentModal  from './PurchaseOrderPaymentModal';
import POAttachQuoteModal  from './POAttachQuoteModal';
import { useAuth } from '../../../AuthContext';
import { useNavigate } from 'react-router-dom';
import { downloadFile } from '../../../helpers/utils';

export interface PurchaseOrderTblData {
    id: number;
    po_type: string;
    purchase_order_number: string;
    order_date: string;
    business_task_id: number;
    ffd_id: number;
    vendor_id: number;
    expected_delivery_date: string;
    grand_total: number;
    quotation_attach: [{ id: number; po_id: number; name: string; }];
    ffd: { id:number; name: string; };
    vendor: { id:number; name: string; };
}
const PurchaseOrder = () => {
    const [directoryData, setDirectoryData] = useState<PurchaseOrderTblData[]>([]);
    const [showPaymentModal, setShowPaymentModal] = useState<boolean>(false); //modal
    const [showAttachModal, setShowAttachModal] = useState<boolean>(false); //View modal
    const [refreshData, setRefreshData] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const [selectedPoId, setSelectedPoId] = useState<number>(0);
    const [poId, setPoId] = useState<number>(0);
    const { userPermission } = useAuth(); //check userRole & permissions
    const navigate = useNavigate();

    const handlePaymentShow = (poId: number) => {
        setSelectedPoId(poId);
        setShowPaymentModal(true);
    };

    const handleClose = () => setShowPaymentModal(false); //close modal function

    const handleAttachQuotations = (poId: number) => {
        setPoId(poId);
        setShowAttachModal(true);
    };

    const handleAttachClose = () => setShowAttachModal(false); //close modal function

    const handlePOForm = () => {
        navigate('/purchase-order/create')
    };

    const handlePOedit = (poId: number) => {
        navigate(`/purchase-order/create/${poId}`)
    };

    const handleGoToBt = (btId: number) => {
        const url = `/bt/enquiryDetails/${btId}`;
        window.open(url, '_blank', 'noopener,noreferrer');
    };

    const handleSuccess = () => {
        // Refresh data or perform any other action after successful submission
        setRefreshData(prev => !prev); // Toggle state to trigger re-fetch
    };

    const handleDeleteAttachment = async ( attachment_id: number,  po_id: number) => {
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
                axiosInstance.delete(`/deletePOQuotationsAttachment`, {
                    data: {
                        id: attachment_id,
                        po_id: po_id
                    }
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
        data: directoryData,
        columns: poTableColumns(handlePOedit, handlePOdownload, handleDeleteAttachment, handleAttachQuotations, handlePaymentShow, handleGoToBt),
        pageSize: 10,
        pagination: true,
        sortable: true,
        selection: false,
    });

    //fetch employees table data on component load and update data on edit
    useEffect(() => {
        const fetchPurchaseOrderData = async () => {
            try {
                const response = await axiosInstance.get('/purchase-order'); // Replace with your API URL
                if (response.status !== 200) {
                    throw new Error('Failed to fetch data');
                }
                const data: PurchaseOrderTblData[] = await response.data;
                setDirectoryData(data);
            } catch (err: any) {
                setError(err.message);
            } finally {
            }
        };
        fetchPurchaseOrderData();
    }, [refreshData]); // Empty array ensures this runs once on mount

    if (error) return <div>Error: {error}</div>;

    return (
        <>
            <h2 className="mb-5">Purchase Order</h2>
        <Card>
            <Card.Body>
                <AdvanceTableProvider {...table}>
                    <Row className="g-3 justify-content-between my-2">
                        <Col xs="auto">
                            <div className="d-flex">
                                <SearchBox
                                    placeholder="Search PO"
                                    className="me-2"
                                    onChange={handleSearchInputChange}
                                />
                            </div>
                        </Col>

                        {userPermission.purchase_order_create === 1 && !error && (
                            <Col className="d-flex justify-content-end">
                                <Button
                                    variant="primary"
                                    className=""
                                    startIcon={<FontAwesomeIcon icon={faPlus} className="me-2" />}
                                    onClick={() => handlePOForm()}
                                >
                                    Add New Purchase Order
                                </Button>
                            </Col>
                        )}
                    </Row>
                    <hr />
                    <PurchaseOrderTable />
                </AdvanceTableProvider>
            </Card.Body>
        </Card>

            {showPaymentModal && (
                <PurchaseOrderPaymentModal poId={selectedPoId} onHide={handleClose} onSuccess={handleSuccess} />
            )}

            {showAttachModal && (
                <POAttachQuoteModal poId={poId} onHide={handleAttachClose} onSuccess={handleSuccess} />
            )}

        </>
    )
};

export default PurchaseOrder;

export const handlePOdownload = async (quoteId: number, path: string) => {
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
