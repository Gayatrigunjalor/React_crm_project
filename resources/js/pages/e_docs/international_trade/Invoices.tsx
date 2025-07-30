import { faPlus } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import Button from '../../../components/base/Button';
import { useEffect, useState, ChangeEvent } from 'react';
import { Card, Col, Row, Modal, Form } from 'react-bootstrap';
import InvoicesTable, { invoicesTableColumns } from './InvoicesTable';
import useAdvanceTable from '../../../hooks/useAdvanceTable';
import AdvanceTableProvider from '../../../providers/AdvanceTableProvider';
import SearchBox from '../../../components/common/SearchBox';
import axiosInstance from '../../../axios';
import { useAuth } from '../../../AuthContext';
import { useNavigate } from 'react-router-dom';
import { downloadFile } from '../../../helpers/utils';

export interface InvoicesDataType {
    id: number;
    invoice_number: string;
    invoice_date: string;
    shipment_type: string;
    exchange_rate: string;
    currency: string;
    received_amount: string;
    remmittance_value: string;
    grand_total: string;
    consignee: {
        id: number;
        name: string;
    };
    buyer: {
        id: number;
        name: string;
    };

}

const Invoices = () => {
    const [invoicesData, setInvoicesData] = useState<InvoicesDataType[]>([]);
    const [showScometModal, setShowScometModal] = useState<boolean>(false); //modal
    const [selectedInoviceId, setSelectedInoviceId] = useState<number>(0);
    const [refreshData, setRefreshData] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const { userPermission } = useAuth(); //check userRole & permissions
    const navigate = useNavigate();



    const handleInvoiceCreate = () => {
        navigate(`/invoices/international-trade`);
    };

    const handleInvoiceEdit = (invId: number) => {
        navigate(`/invoices/international-trade/${invId}`);
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

    const handleScometClicked = (invoiceId: number) => {
        setSelectedInoviceId(invoiceId);
        setShowScometModal(true);
    };
    const handleScometClose = () => setShowScometModal(false); //close modal function

    const handleSuccess = () => {
        // Refresh data or perform any other action after successful submission
        setRefreshData(prev => !prev); // Toggle state to trigger re-fetch
    };


    const handleSearchInputChange = (e: ChangeEvent<HTMLInputElement>) => {
        table.setGlobalFilter(e.target.value || undefined);
    };

    const table = useAdvanceTable({
        data: invoicesData,
        columns: invoicesTableColumns(handleInvoiceEdit, handlePDFclicked, handleScometClicked),
        pageSize: 10,
        pagination: true,
        sortable: true,
        selection: false,
    });

    //fetch employees table data on component load and update data on edit
    useEffect(() => {
        const fetchInvoicesData = async () => {
            try {
                const response = await axiosInstance.get('/invoices'); // Replace with your API URL
                if (response.status !== 200) {
                    throw new Error('Failed to fetch data');
                }
                const data: InvoicesDataType[] = await response.data;
                setInvoicesData(data);
            } catch (err: any) {
                setError(err.message);
            } finally {
            }
        };
        fetchInvoicesData();
    }, [refreshData]); // Empty array ensures this runs once on mount

    if (error) return <div>Error: {error}</div>;

    return (
        <>
            <h2 className="mb-5">Invoices</h2>
            <Card>
                <Card.Body>
                    <Row>
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
                                <Col className="d-flex justify-content-end">
                                    {userPermission.invoice_create == 1 && (
                                        <Button
                                        variant="primary"
                                        className=""
                                        startIcon={<FontAwesomeIcon icon={faPlus} className="me-2" />}
                                        onClick={() => handleInvoiceCreate()}
                                        >
                                            Add International Trade
                                        </Button>
                                    )}
                                </Col>
                            </Row>
                            <InvoicesTable />
                        </AdvanceTableProvider>
                    </Row>
                </Card.Body>
            </Card>

            {showScometModal && (
                <ScometModal invoiceId={selectedInoviceId} onHide={handleScometClose} />
            )}
        </>
    )
};

export default Invoices;

interface ScometModalProps {
    invoiceId: number;
    onHide: () => void;
}

interface FormData {
    use_of_goods: string;
}

const ScometModal: React.FC<ScometModalProps> = ({ invoiceId, onHide}) => {

    const [custData, setUserData] = useState<FormData>({ use_of_goods: '' });
    const [loading, setLoading] = useState(false);
    const [validated, setValidated] = useState<boolean>(false);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setUserData({ ...custData, [name]: value });
    };

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const form = e.currentTarget;
        if (form.checkValidity() === false) {
            e.preventDefault();
            e.stopPropagation();
            setValidated(true);
            return;
        }

        setValidated(true);
        setLoading(true);
        const apiCall = axiosInstance.get(`/getScometPDF/${invoiceId}/${custData.use_of_goods}`,{
            responseType: 'blob',
        });

        apiCall
            .then((response) => {
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
            onHide();
        })
        .catch(error => swal("Error!", error.data.message, "error"))
        .finally(() => { setLoading(false); });
    };
    return (
        <>
            <Modal show onHide={onHide} size="lg" backdrop="static" keyboard={false}>
                <Modal.Header closeButton>
                    <Modal.Title>SCOMET form</Modal.Title>
                </Modal.Header>
                <Form noValidate validated={validated} onSubmit={handleSubmit}>
                    <Modal.Body>
                        <Row className="mb-3 g-3">
                            <Form.Group as={Col} className="mb-3" controlId="use_of_goods">
                                <Form.Label>Use of exporting goods and where <span className="text-danger">*</span></Form.Label>
                                <Form.Control type="text" placeholder="Please mention proper use of exporting goods and where" name="use_of_goods" value={custData.use_of_goods} onChange={handleChange} required />
                                <Form.Control.Feedback type="invalid">Please mention proper use of exporting goods and where.</Form.Control.Feedback>
                            </Form.Group>
                        </Row>
                    </Modal.Body>
                    <Modal.Footer>
                        <Button variant="secondary" onClick={onHide}>Close</Button>
                        <Button variant="primary" loading={loading} loadingPosition="start" type="submit">Print</Button>
                    </Modal.Footer>
                </Form>
            </Modal>
        </>
    );
};
