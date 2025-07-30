import React, { useEffect, useState, useCallback, FormEvent } from 'react';
import { Form, Card, Row, Col, Alert, Tab, Nav } from 'react-bootstrap';
import { faPlus, faCaretLeft, faTrash } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import Button from '../../../components/base/Button';
import axiosInstance from '../../../axios';
import swal from 'sweetalert';
import { useAuth } from '../../../AuthContext';
import ReactSelect from '../../../components/base/ReactSelect';
import { useNavigate, useParams } from 'react-router-dom';
import { ToastContainer, toast } from "react-toastify";

interface InvoicesData {
    id: number;
    invoice_number: string;
}

interface IrmData {
    id: number;
    irm_sys_id: string;
    reference_no: string;
    received_amount: string;
    invoice_amount: string;
    currency: { id:number; name: string;}
    buyer: { id:number; name: string;}
    consignee: { id:number; name: string;}
}

interface FormData {
    id: number | undefined;
    invoice_details: InvoicesData | null;
    invoice_id: number;
    e_brc_no: string;
    e_brc_date: string;
}

const EbrcForm = () => {
    const { ebrcId } = useParams();
    const [outwardData, setOutwardData] = useState<FormData>({
        id: undefined,
        invoice_details: null,
        invoice_id: 0,
        e_brc_no: '',
        e_brc_date: ''
    });

    const [isEditing, setIsEditing] = useState<boolean>(false);
    const [validated, setValidated] = useState<boolean>(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [irmTotal, setIrmTotal] = useState<number | null>(null);

    const [invoicesData, setInvoicesData] = useState<InvoicesData[]>([]);
    const [fetchedInvoiceData, setFetchedInvoiceData] = useState<IrmData[]>([]);

    const { userPermission } = useAuth(); //check userRole & permissions
    const navigate = useNavigate();

    const handleEbrcList = () => {
        navigate(`/ebrc`);
    };

    useEffect(() => {

        if (ebrcId) {
            setIsEditing(true);
            // Fetch ebrc data for editing
            axiosInstance.get(`/ebrc/${ebrcId}`)
            .then(response => {
                setOutwardData(response.data);
                axiosInstance.get(`/getEbrcInvoiceDetails`, {
                    params: {
                        invoice_id: response.data.invoice_id
                    }
                })
                .then(response => {
                    const resp: IrmData[] = response.data.irmRows;
                    const total: number = response.data.irmTotal;
                    setFetchedInvoiceData(resp);
                    setIrmTotal(total);
                });
            })
            .catch(error => console.error('Error fetching ebrc data:', error));
        }
        const fetchInvoiceListing = async () => {
            try {
                const response = await axiosInstance.get('/ebrcPendingInvoiceListing');
                if (response.status !== 200) {
                    throw new Error('Failed to fetch data');
                }
                const invoices: InvoicesData[] = await response.data;
                setInvoicesData(invoices);
            } catch (err: any) {
                setError(err.message);
            } finally {
            }
        };
        fetchInvoiceListing();
    }, []);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        // Handle top-level fields
        setOutwardData(prev => ({ ...prev, [name]: value }));
    };

    const handleInvoiceChange = (selectedOption: any) => {
        if (selectedOption) {
            setOutwardData(prev => ({
                ...prev,
                invoice_details: { id: selectedOption.value, invoice_number: selectedOption.label },
                invoice_id: selectedOption.value
            }));
            try {
                axiosInstance.get(`/getEbrcInvoiceDetails`, {
                    params: {
                        invoice_id: selectedOption.value
                    }
                })
                .then(response => {
                    const resp: IrmData[] = response.data.irmRows;
                    const total: number = response.data.irmTotal;
                    setFetchedInvoiceData(resp);
                    setIrmTotal(total);
                });
            } catch (err: any) {
                swal("Error!", err.data.message, "error");
            }
        }
    };


    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const form = e.currentTarget;
        if (form.checkValidity() === false) {
            e.preventDefault();
            e.stopPropagation();
            setValidated(true);
            return;
        }

        setLoading(true);
        setValidated(true);

        const apiCall = isEditing
            ? axiosInstance.put(`/ebrc/${outwardData.id}`,  {
                id: outwardData.id,
                invoice_id: outwardData.invoice_id,
                e_brc_no: outwardData.e_brc_no,
                e_brc_date: outwardData.e_brc_date,
            })
            : axiosInstance.post('/ebrc', {
                ...outwardData,
            }
        );

        apiCall
            .then((response) => {
                swal("Success!", response.data.message, "success");
                handleEbrcList();
        })
        .catch(error => swal("Error!", error.data.message, "error"))
        .finally(() => { setLoading(false); });

    };

    if (error) return <div>Error: {error}</div>;
    return (
        <>
            <Row>
                <Col><h3 className='px-4 mb-2'>{isEditing ? 'Edit E-Brc' : 'Create E-Brc'}</h3></Col>
            </Row>
            <hr></hr>
            <Card style={{ width: '100%' }}>
                <Card.Title>
                    <Row className='mt-4 px-4'>
                        <Col className='d-flex align-items-center justify-content-start'><h5>Select invoice to add E-Brc details</h5></Col>
                        <Col className='d-flex justify-content-end'><Button
                                size='sm'
                                variant="primary"
                                className=""
                                startIcon={<FontAwesomeIcon icon={faCaretLeft} className="me-2" />}
                                onClick={() => handleEbrcList()}
                                >
                                    E-Brc List
                            </Button>
                        </Col>
                    </Row>
                </Card.Title>

                <Card.Body className='pt-0'>
                    <Row>
                        <Form noValidate validated={validated} onSubmit={handleSubmit}>
                            <Row className='mb-2'>
                                <Form.Group as={Col} className="mb-3">
                                    <Form.Label>Select Invoice <span className="text-danger">*</span></Form.Label>
                                    <ReactSelect
                                        options= {invoicesData.map((option: InvoicesData) => (
                                            { value: option.id, label: `${option.invoice_number}` }
                                        ))}
                                        placeholder="Select Invoice" name="invoice_details" value={outwardData.invoice_details ? { value: outwardData.invoice_details.id, label: outwardData.invoice_details.invoice_number } : null} onChange={(selectedOption) => handleInvoiceChange(selectedOption)} />
                                        <Form.Control type="hidden" name="invoice_id" value={outwardData.invoice_id} />
                                        {validated && !outwardData.invoice_id && (
                                            <div className="invalid-feedback d-block">Please select Invoice</div>
                                        )}
                                </Form.Group>
                            </Row>

                            {outwardData.invoice_details && (
                                <>
                                    <hr className='border border-danger border-1'/>
                                    <Card.Title as="h5" className="text-dark">Selected Invoice : { outwardData.invoice_details ? outwardData.invoice_details.invoice_number : '' } </Card.Title>

                                    <table className='fs-8 table striped bordered mb-4'>
                                        <thead>
                                            <tr>
                                                <th className='p-2 border border-secondary'>IRM SYS ID</th>
                                                <th className='p-2 border border-secondary'>Reference Number</th>
                                                <th className='p-2 border border-secondary'>Currency</th>
                                                <th className='p-2 border border-secondary'>Received Amount</th>
                                                {/* <th className='p-2 border border-secondary'>Invoice Amount</th> */}
                                                <th className='p-2 border border-secondary'>Buyer Name</th>
                                                <th className='p-2 border border-secondary'>Consignee Name</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {fetchedInvoiceData && fetchedInvoiceData.map((irm: IrmData,index) => (
                                                <tr key={index} >
                                                    <td className='p-2 border border-secondary'>{irm.irm_sys_id}</td>
                                                    <td className='p-2 border border-secondary'>{irm.reference_no}</td>
                                                    <td className='p-2 border border-secondary'>{irm.currency.name}</td>
                                                    <td className='p-2 border border-secondary'>{irm.received_amount}</td>
                                                    {/* <td className='p-2 border border-secondary'>{irm.invoice_amount}</td> */}
                                                    <td className='p-2 border border-secondary'>{irm.buyer.name}</td>
                                                    <td className='p-2 border border-secondary'>{irm.consignee.name}</td>
                                                </tr>
                                            ))}
                                            <tr>
                                                <td className='p-2 border border-secondary' colSpan={3}>Total Received Amount</td>
                                                <td className='p-2 border border-secondary' colSpan={3}>{irmTotal}</td>
                                            </tr>
                                        </tbody>
                                    </table>
                                </>
                            )}
                            <Row className='mb-2'>
                                <Form.Group as={Col} className="mb-3" controlId="e_brc_no">
                                    <Form.Label>e-Brc Number <span className="text-danger">*</span></Form.Label>
                                    <Form.Control type="text" placeholder="e-Brc Number" name="e_brc_no" value={outwardData.e_brc_no} onChange={handleChange} required />
                                    <Form.Control.Feedback type="invalid">Please enter e-Brc Number.</Form.Control.Feedback>
                                </Form.Group>
                                <Form.Group as={Col} className="mb-3" controlId="e_brc_date">
                                    <Form.Label>e-Brc Date <span className="text-danger">*</span></Form.Label>
                                    <Form.Control type="date" name="e_brc_date" value={outwardData.e_brc_date} onChange={handleChange} required />
                                    <Form.Control.Feedback type="invalid">Please enter e-Brc Date.</Form.Control.Feedback>
                                </Form.Group>
                            </Row>

                            <hr />
                            <Row className='mt-2'>
                                <Col className='text-center'>
                                <Button variant="primary" loading={loading} loadingPosition="start" type="submit">{isEditing ? 'Update' : 'Save'}</Button>
                                </Col>
                            </Row>
                        </Form>
                    </Row>
                </Card.Body>
            </Card>
            <ToastContainer className='py-0' />
        </>
    )
};

export default EbrcForm;

