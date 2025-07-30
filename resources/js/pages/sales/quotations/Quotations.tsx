import { faPlus } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import Button from '../../../components/base/Button';
import { useEffect, useState, ChangeEvent } from 'react';
import { Card, Col, Row, Nav, Tab } from 'react-bootstrap';
import QuotationsTable, { quotationsTableColumns } from './QuotationsTable';
import useAdvanceTable from '../../../hooks/useAdvanceTable';
import AdvanceTableProvider from '../../../providers/AdvanceTableProvider';
import SearchBox from '../../../components/common/SearchBox';
import axiosInstance from '../../../axios';
import { useAuth } from '../../../AuthContext';
import { useNavigate } from 'react-router-dom';
import { downloadFile } from '../../../helpers/utils';

export interface QuotationsDataType {
    id: number;
    consignee: {
        id: number;
        name: string;
    };
    buyer: {
        id: number;
        name: string;
    };
    bank_details: {
        id: number;
        bank_name: string;
    };
    sde_attachment: {
        id: number;
        name: string;
        attachment_details: string;
        business_task_id: number;
    };
    pi_number: string;
    pi_date: string;
    document_type: string;
    buyer_id: number;
    consignee_id: number;
    sales_manager_id: string;
    bank_id: number;
    grand_total: number;
}

const Quotations = () => {
    const [quotationsWithBT, setQuotationsWithBT] = useState<QuotationsDataType[]>([]);
    const [quotationsWithoutBT, setquotationsWithoutBT] = useState<QuotationsDataType[]>([]);
    const [refreshData, setRefreshData] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const { userPermission } = useAuth(); //check userRole & permissions
    const navigate = useNavigate();



    const handleCreation = () => {
        navigate(`/sales/quotations/create`);
    };

    const handleQuotationEdit = (quoteId: number) => {
        navigate(`/sales/quotations/create/${quoteId}`);
    };

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

    const handleDelete = (prvId: number) => {
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
                axiosInstance.delete(`/quotations/${prvId}`)
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

    const handleTaskCheckbox = (empId: number) => {
        console.log(empId);
    };



    const handleSearchInputChange = (e: ChangeEvent<HTMLInputElement>) => {
        table.setGlobalFilter(e.target.value || undefined);
    };

    const handleDisabledSearchInputChange = (e: ChangeEvent<HTMLInputElement>) => {
        disabled_table.setGlobalFilter(e.target.value || undefined);
    };

    const table = useAdvanceTable({
        data: quotationsWithBT,
        columns: quotationsTableColumns(handleQuotationEdit,handlePDFclicked, handleDelete),
        pageSize: 10,
        pagination: true,
        sortable: true,
        selection: false,
    });

    const disabled_table = useAdvanceTable({
        data: quotationsWithoutBT,
        columns: quotationsTableColumns(handleQuotationEdit,handlePDFclicked, handleDelete),
        pageSize: 10,
        pagination: true,
        sortable: true,
        selection: false,
        initialState: {
            columnVisibility: {
                bt_id: false
            }
        }
    });

    //fetch employees table data on component load and update data on edit
    useEffect(() => {
        const fetchQuotationsData = async () => {
            try {
                const response = await axiosInstance.get('/quotations'); // Replace with your API URL
                if (response.status !== 200) {
                    throw new Error('Failed to fetch data');
                }

                const data: QuotationsDataType[] = await response.data;
                const piWithBT: QuotationsDataType[] = [];
                const piWithoutBT: QuotationsDataType[] = [];
                data.forEach((quote: QuotationsDataType) => {
                    if (quote.sde_attachment) {
                        piWithBT.push(quote);
                    } else {
                        piWithoutBT.push(quote);
                    }
                });
                setQuotationsWithBT(piWithBT);
                setquotationsWithoutBT(piWithoutBT);
            } catch (err: any) {
                setError(err.message);
            } finally {
            }
        };
        fetchQuotationsData();
    }, [refreshData]); // Empty array ensures this runs once on mount

    if (error) return <div>Error: {error}</div>;

    return (
        <>
            <h2 className="mb-5">Quotations</h2>
            <Card>
                <Card.Body>
                    <Tab.Container id="basic-tabs-example" defaultActiveKey="without">
                        <Row>
                            <Col>
                                <Nav variant="underline">
                                    <Nav.Item>
                                        <Nav.Link eventKey="without" className='fs-8'>Without Business Task</Nav.Link>
                                    </Nav.Item>
                                    <Nav.Item>
                                        <Nav.Link eventKey="enabled" className='fs-8'>With Business Task</Nav.Link>
                                    </Nav.Item>
                                </Nav>
                            </Col>
                            <Col className="d-flex justify-content-end">
                            {userPermission.quotation_create == 1 && (
                                <Button
                                variant="primary"
                                className=""
                                startIcon={<FontAwesomeIcon icon={faPlus} className="me-2" />}
                                onClick={() => handleCreation()}
                                >
                                    Add New Quotation
                                </Button>
                            )}
                            </Col>
                        </Row>

                        <Tab.Content>
                            <Tab.Pane eventKey="without">

                                        <AdvanceTableProvider {...disabled_table}>
                                            <Row className="g-3 justify-content-between my-2">
                                                <Col xs="auto">
                                                    <div className="d-flex">
                                                        <SearchBox
                                                            placeholder="Search employee"
                                                            className="me-2"
                                                            onChange={handleDisabledSearchInputChange}
                                                        />
                                                    </div>
                                                </Col>
                                            </Row>
                                            <QuotationsTable />
                                        </AdvanceTableProvider>

                            </Tab.Pane>
                            <Tab.Pane eventKey="enabled">
                                <AdvanceTableProvider {...table}>
                                    <Row className="g-3 justify-content-between my-2">
                                        <Col xs="auto">
                                            <div className="d-flex">
                                                <SearchBox
                                                    placeholder="Search employee"
                                                    className="me-2"
                                                    onChange={handleSearchInputChange}
                                                />
                                            </div>
                                        </Col>
                                    </Row>
                                    <QuotationsTable />
                                </AdvanceTableProvider>
                            </Tab.Pane>
                        </Tab.Content>
                    </Tab.Container>
                </Card.Body>
            </Card>
        </>
    )
};

export default Quotations;
