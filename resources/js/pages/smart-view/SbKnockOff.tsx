import 'react-date-range/dist/styles.css'; // main style file
import 'react-date-range/dist/theme/default.css'; // theme css file
import { DateRangePicker } from 'react-date-range';
import { addDays, subDays, setYear, startOfQuarter, endOfQuarter, subQuarters, startOfYear, endOfYear, subYears } from 'date-fns';
import { faCaretLeft, faRefresh, faDownload, faPlus } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import Button from '../../components/base/Button';
import React, { useEffect, useState, ChangeEvent } from 'react';
import { Card, Col, Row, Modal } from 'react-bootstrap';
import axiosInstance from '../../axios';
import { useAuth } from '../../AuthContext';
import swal from 'sweetalert';
import { useNavigate, useParams } from 'react-router-dom';
import { downloadFile } from '../../helpers/utils';

interface AttachmentData {
    id: number;
    invoice_id: number;
    attachment_name: string;
}
interface InvoicesData {
    id: number;
    invoice_number: string;
    invoice_date: string;
    grand_total: number;
    regulatory_psd: {
        id: number;
        invoice_id: number;
        awb: string;
        shipping_bill: string;
    },
    tax_purchase_invoices: AttachmentData[],
    proforma_attachment: AttachmentData[],
    firc_attachment: AttachmentData[]
}

const SbKnockOff = () => {
    const [error, setError] = useState<string | null>(null);
    const navigate = useNavigate();
    const [itcData, setItcData] = useState<InvoicesData[]>([]);
    const [isEditing, setIsEditing] = useState<boolean>(false);
    const [validated, setValidated] = useState<boolean>(false);
    const [loading, setLoading] = useState(false);
    const [commercialModalShow, setCommercialModalShow] = useState(false);
    const [open, setOpen] = useState(false);
    const [selectedInvId, setSelectedInvId] = useState({invId: 0, type: '' });
    const { empData } = useAuth(); //check userRole & permissions
    const [selectDate, setSelectDate] = useState([
        {
            startDate: subDays(new Date(), 7),
            endDate: new Date(),
            key: 'selection'
        },
    ]);

    const handleInvoiceDownload = (invoiceId: number, docType: string) => {
        setCommercialModalShow(true);
        setSelectedInvId({invId: invoiceId, type: docType })
    };

    const handlePLDownload = (invoiceId: number, docType: string) => {
        setCommercialModalShow(true);
        setSelectedInvId({invId: invoiceId, type: docType })
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

    const handleDownload = async (fileName: string, path: string) => {
        try {
            // Fetch the file from the server using the upload ID
            const response = await axiosInstance.get(`/getFileDownload?filepath=${path}/${fileName}`, {
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
    };

    const handleSubmit = () => {
        setItcData([]);

        setLoading(true);
        setValidated(true);
        const apiCall = axiosInstance.post('/sb-knockoff', ...selectDate );

        apiCall
            .then((response) => {
            setItcData(response.data);
        })
        .catch(error => swal("Error!", error.data.message, "error"))
        .finally(() => { setLoading(false); });
    };

    if (error) return <div>Error: {error}</div>;

    return (
        <>
            <h2 className="mt-2 mb-5">Shipping Bill Knockoff</h2>
            <Card className="mb-4">
                <Card.Body>
                    <Row>
                        <Col>
                        <DateRangePicker
                            onChange={item => setSelectDate([item.selection])}
                            maxDate={new Date()}
                            showPreview={false}
                            showSelectionPreview={true}
                            showDateDisplay={true}
                            moveRangeOnFirstSelection={false}
                            weekStartsOn={1}
                            months={1}
                            ranges={selectDate}
                            direction="horizontal"
                            />
                        </Col>
                    </Row>

                    <Row className='d-flex p2 text-center'>
                        <Col>
                            <Button
                                variant="success"
                                className="me-2"
                                loading={loading} loadingPosition="start"
                                startIcon={<FontAwesomeIcon icon={faPlus} className="me-2" />}
                                onClick={() => handleSubmit()}
                            >
                                Submit
                            </Button>
                            <Button
                                variant="primary"
                                className="ms-2"
                                startIcon={<FontAwesomeIcon icon={faRefresh} className="me-2" />}
                                onClick={() => {
                                        setItcData([]);
                                        setSelectDate([
                                            {
                                                startDate: subDays(new Date(), 7),
                                                endDate: new Date(),
                                                key: 'selection'
                                            },
                                        ]);
                                    }
                                }
                            >
                                Reset
                            </Button>
                        </Col>
                    </Row>
                </Card.Body>
            </Card>
            <Card>
                <Card.Body>
                {itcData.map((inv) => (
                <React.Fragment key={inv.id}>
                    <Row className="px-2 bg-light align-items-center">
                        <Col className="py-1 ">
                            <h5 className='white-space-nowrap'><strong>Invoice Number :</strong> {inv.invoice_number}</h5>
                        </Col>
                        <Col className="py-1 ">
                            <h5><strong>Invoice Date :</strong> {inv.invoice_date}</h5>
                        </Col>
                        <Col className="py-1 ">
                            <h5><strong>Invoice Grand Total :</strong> {inv.grand_total}</h5>
                        </Col>
                        <Col className="py-1 ">
                            <Button variant='success' size='sm' onClick={() => handleInvoiceDownload(inv.id, 'TI')}>Commercial Invoice</Button>
                        </Col>
                        <Col className="py-1 ">
                            <Button variant='primary' size='sm' onClick={() => handlePLDownload(inv.id, 'PL')}>Packing List</Button>
                        </Col>
                    </Row>

                    <div className="px-2 row bg-light">
                        <div className="py-1 col">
                            <h5 className="text-danger">Proforma Invoices</h5>
                            {inv.proforma_attachment.length > 0 && (
                                <ul className="list-group list-group-flush">
                                    {inv.proforma_attachment.map((pi_a, index) => (
                                        <li key={index} className="list-group-item" style={{ padding: '0.5rem 1rem' }}>
                                            <strong>Attachment {index + 1} : </strong>
                                            <Button key={index} className="text-primary p-0 me-2" variant="link" title="Download Proforma Invoices" onClick={() => handleDownload(pi_a.attachment_name, 'uploads/international-trade/proforma-invoice-attachment')} startIcon={<FontAwesomeIcon icon={faDownload} />} >
                                                {pi_a.attachment_name}
                                            </Button>
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </div>
                        <div className="py-1 col">
                            <h5 className="text-danger">FIRC & SWIFT</h5>
                            {inv.firc_attachment.length > 0 && (
                                <ul className="list-group list-group-flush">
                                    {inv.firc_attachment.map((firc, index) => (
                                        <li key={index} className="list-group-item" style={{ padding: '0.5rem 1rem' }}>
                                            <strong>Attachment {index + 1} : </strong>
                                            <Button key={index} className="text-primary p-0 me-2" variant="link" title="Download FIRC & SWIFT" onClick={() => handleDownload(firc.attachment_name, 'uploads/international-trade/firc-attachment')} startIcon={<FontAwesomeIcon icon={faDownload} />} >
                                                {firc.attachment_name}
                                            </Button>
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </div>
                        <div className="py-1 col">
                            <h5 className="text-danger">Shipping Bill & AWB</h5>
                            {inv.regulatory_psd && (
                                <ul className="list-group list-group-flush">
                                    <li className="list-group-item" style={{ padding: '0.5rem 1rem' }}>
                                        <strong>AWB : </strong>
                                        <Button className="text-primary p-0 me-2" variant="link" title="Download AWB" onClick={() => handleDownload(inv.regulatory_psd.awb, 'uploads/regulatory/awb')} startIcon={<FontAwesomeIcon icon={faDownload} />} >
                                            {inv.regulatory_psd.awb}
                                        </Button>
                                    </li>
                                    <li className="list-group-item" style={{ padding: '0.5rem 1rem' }}>
                                        <strong>Shipping Bill : </strong>
                                        <Button className="text-primary p-0 me-2" variant="link" title="Download Shipping Bill" onClick={() => handleDownload(inv.regulatory_psd.shipping_bill, 'uploads/regulatory/shippingbill')} startIcon={<FontAwesomeIcon icon={faDownload} />} >
                                            {inv.regulatory_psd.awb}
                                        </Button>
                                    </li>
                                </ul>
                            )}
                        </div>
                        <div className="py-1 col">
                            <h5 className="text-danger">Vendor Purchase Invoice</h5>
                            {inv.tax_purchase_invoices.length > 0 && (
                                <ul className="list-group list-group-flush">
                                    {inv.tax_purchase_invoices.map((vpi, index) => (
                                        <li key={index} className="list-group-item" style={{ padding: '0.5rem 1rem' }}>
                                            <strong>Attachment {index + 1} : </strong>
                                            <Button key={index} className="text-primary p-0 me-2" variant="link" title="Download Vendor Purchase Invoice" onClick={() => handleDownload(vpi.attachment_name, 'uploads/international-trade/tax-purchase-attachment')} startIcon={<FontAwesomeIcon icon={faDownload} />} >
                                                {vpi.attachment_name}
                                            </Button>
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </div>
                    </div>
                    <hr style={{ border: '1px solid red' }} />
                </React.Fragment>
            ))}
                </Card.Body>
            </Card>
            <Modal show={commercialModalShow} onHide={() => setCommercialModalShow(false)} size="lg" aria-labelledby="contained-modal-title-vcenter" centered >
                <Modal.Header closeButton>
                    <Modal.Title id="contained-modal-title-vcenter">Download {selectedInvId.type == 'TI' ? `Commercial Invoice` : `Packing List `} </Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    {selectedInvId.type == 'TI' ? (
                        <>
                            <Button title="Trade Invoice(signed)" onClick={() => handlePDFclicked(selectedInvId.invId, 'pdfInvoiceWithSign')} variant='success' className='mb-3 ms-2 me-2' >Invoice with Signature</Button>
                            <Button title="Trade Invoice" onClick={() => handlePDFclicked(selectedInvId.invId, 'pdfInvoice')} variant='success' className='mb-3 ms-2 me-2' >Invoice without Signature</Button>
                        </>
                    ) : (
                        <>
                            <Button title="Packing List(signed)" onClick={() => handlePDFclicked(selectedInvId.invId, 'pdfPackingListWithSign')} variant='info' className='mb-3 ms-2 me-2' >PL with Signature</Button>
                            <Button title="Packing List" onClick={() => handlePDFclicked(selectedInvId.invId, 'pdfPackingList')} variant='info' className='mb-3 ms-2 me-2' >PL without Signature</Button>
                        </>
                    )}
                </Modal.Body>
                <Modal.Footer>
                    <Button onClick={() => setCommercialModalShow(false)}>Close</Button>
                </Modal.Footer>
            </Modal>
        </>
    );
};

export default SbKnockOff;
