import { faPlus } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import Button from '../../../components/base/Button';
import { useEffect, useState, ChangeEvent } from 'react';
import { Col, Row, Card, Nav, Tab } from 'react-bootstrap';
import IrmsTable, { irmsTableColumns } from './IrmsTable';
import useAdvanceTable from '../../../hooks/useAdvanceTable';
import AdvanceTableProvider from '../../../providers/AdvanceTableProvider';
import SearchBox from '../../../components/common/SearchBox';
import axiosInstance from '../../../axios';
import IrmsModal  from './IrmsModal';
import { useAuth } from '../../../AuthContext';
import { useNavigate } from 'react-router-dom';

export interface IrmsDataType {
    id: number;
    irm_sys_id: string;
    reference_no: string;
    remittance_date: string;
    currency_id: number;
    currency: CustomersData;
    received_amount: number;
    buyer_id: number;
    buyer: CustomersData;
    consignee_ids: number;
    consignee: ConsigneeData;
    bank_id: number;
    bank: BankAccountsData;
    outstanding_amount: number;
    invoiceNumbers: [{ id: number; invoice_number: string;}]
    invoice_amount: number;
    invoice_id: string;
    map_to_trade: number;
    business_task_id: number;
    business_task: {
        id: number;
        customer_name: string;
    };
    shipment_type: string;
    quotations: [{ id: number; pi_number: string;}]
    irm_attachments: [{ id: number; irm_id : number; name: string; attachment_type: string; }]
}
interface CustomersData {
    id: number;
    name: string;
}
interface BankAccountsData {
    id: number;
    bank_name: string;
}
interface ConsigneeData{
    id: number;
    contact_person: string;
}
const Irms = () => {
    const [irmData, setIrmData] = useState<IrmsDataType[]>([]);
    const [showModal, setShowModal] = useState<boolean>(false); //modal
    const [showHistoryModal, setShowHistoryModal] = useState<boolean>(false); //History modal
    const [refreshData, setRefreshData] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const [selectedIrmId, setSelectedIrmId] = useState<number | undefined>(undefined);
    const { userPermission } = useAuth(); //check userRole & permissions
    const navigate = useNavigate();

    const handleShow = (irmId?: number) => {
        setSelectedIrmId(irmId);
        setShowModal(true);
    };

    const handleClose = () => setShowModal(false); //close modal function

    const handleHistoryShow = (irmId?: number) => {
        setSelectedIrmId(irmId);
        setShowHistoryModal(true);
    };

    const handleHistoryClose = () => setShowHistoryModal(false); //close modal function

    const handleTaskCheckbox = (empId: number) => {
        console.log(empId);
    };

    const handleSuccess = () => {
        // Refresh data or perform any other action after successful submission
        setRefreshData(prev => !prev); // Toggle state to trigger re-fetch
    };

    const handleDeleteAttachment = async ( attachment_id: number,  irm_id: number) => {
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
                axiosInstance.delete(`/deleteIrmAttachment`, {
                    data: {
                        id: attachment_id,
                        irm_id: irm_id
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

    const handlePaymentHistory = (id: number) => {
        navigate(`/irm/vendors/${id}`);
    }

    const table = useAdvanceTable({
        data: irmData,
        columns: irmsTableColumns(handleShow, handleDeleteAttachment),
        pageSize: 10,
        pagination: true,
        sortable: true,
        selection: false,
    });


    //fetch employees table data on component load and update data on edit
    useEffect(() => {
        const fetchIrmsData = async () => {
            try {
                const response = await axiosInstance.get('/irms'); // Replace with your API URL
                if (response.status !== 200) {
                    throw new Error('Failed to fetch data');
                }
                const data: IrmsDataType[] = await response.data;
                setIrmData(data);
            } catch (err: any) {
                setError(err.message);
            } finally {
            }
        };
        fetchIrmsData();
    }, [refreshData]); // Empty array ensures this runs once on mount

    if (error) return <div>Error: {error}</div>;

    return (
        <>
            <h2 className="mb-5">Irms</h2>
            <Card>
                <Card.Body>
                    <AdvanceTableProvider {...table}>
                        <Row className="g-3 justify-content-between my-2">
                            <Col xs="auto">
                                <div className="d-flex">
                                    <SearchBox
                                        placeholder="Search IRM"
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
                                    onClick={() => handleShow()}
                                >
                                    Add New Irm
                                </Button>
                            </Col>
                        </Row>
                        <IrmsTable />
                    </AdvanceTableProvider>
                </Card.Body>
            </Card>

            {showModal && (
                <IrmsModal irmId={selectedIrmId} onHide={handleClose} onSuccess={handleSuccess} />
            )}

            {showHistoryModal && (
                <IrmsModal irmId={selectedIrmId} onHide={handleHistoryClose} onSuccess={handleSuccess} />
            )}
        </>
    )
};

export default Irms;
