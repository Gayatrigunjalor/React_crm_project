import { useEffect, useState, ChangeEvent } from 'react';
import { faCaretLeft, faDownload, faEdit, faPlus, faPlusCircle, faPrint, faTrash } from '@fortawesome/free-solid-svg-icons';
import { Col, Row, Card, Form, Tab, Nav, Modal } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import EditInwardDetailsModal from './EditInwardDetailsModal';
import AddGrnInwardModal from './AddGrnInwardModal';
import EditGrnDetailsModal from './EditGrnDetailsModal';
import BoxAddEditModal from './BoxAddEditModal';
import ProductDetailsModal from './ProductDetailsModal';
import { useAuth } from '../../../AuthContext';
import { useNavigate, useParams } from 'react-router-dom';
import Button from '../../../components/base/Button';
import axiosInstance from '../../../axios';
import { downloadFile } from '../../../helpers/utils';
import Dropzone from '../../../components/base/Dropzone';
import { handlePDFclicked as handleProformaDownload } from '../../productivity/business-task/EnquiryDetails';

interface Vendor {
    id: number;
    name: string;
}

interface ProductDetails {
    id: number;
    product_code: string;
    product_name: string;
}

interface LocationDetails {
    id: number;
    warehouse_name: string;
    rack_number: string;
    floor: string;
}

interface GrnNumber {
    id: number;
    grn_number: string;
    vendor_tax_invoice_number: string;
    vendor_tax_invoice_date: string;
    vendor_tax_invoice_attachment: string;
}

interface PurchaseOrderDetails {
    id: number;
    purchase_order_number: string;
    vendor_id: number;
    order_date: string;
    vendor: Vendor;
}

interface Product {
    id: number;
    warehouse_box_id: number;
    product_code_id: number;
    product_quantity: number;
    product_hsn: string;
    hazardous_symbol: string | null;
    manufacture_year: string;
    box_content: string;
    created_at: string;
    updated_at: string;
    product_details: ProductDetails;
}

interface BoxData {
    id: number;
    inward_id: number;
    grn_sys_id: number;
    box_sys_id: string;
    purchase_order_id: number;
    location_detail_id: number;
    product_code_id: number | null;
    product_quantity: number | null;
    product_hsn: string | null;
    hazardous_symbol: string | null;
    box_content: string | null;
    manufacture_year: string | null;
    net_weight: number;
    gross_weight: number;
    length: number;
    width: number;
    height: number;
    box_packaging_date: string;
    box_packaging_done: number;
    box_inspection_done: number;
    box_inspection_by: string;
    box_packaging_remark: string | null;
    deleted_at: string | null;
    created_at: string;
    updated_at: string;
    grn_number: GrnNumber;
    purchase_order_details: PurchaseOrderDetails;
    products: Product[];
    location_details: LocationDetails;
}
interface GrnData {
    id: number;
    inward_id: string;
    grn_number: string;
    purchase_order_id: number;
    vendor_tax_invoice_number: string;
    vendor_tax_invoice_date: string;
    vendor_tax_invoice_attachment: string;
    purchase_order: PurchaseOrderDetails;
    boxes: BoxData[];
}

  // Main interface
interface InwardShipment {
    id: number;
    inward_sys_id: string;
    inward_date: string;
    mode_of_shipment: 'by_air' | 'by_sea' | 'by_road';
    terms_of_shipment: string;
    proforma_invoice_id: number;
    business_task_id: number;
    port_of_loading: string;
    port_of_discharge: string;
    inco_term_id: number;
    pickup_location: string;
    grns: GrnData[];
    outward_date: string | null;
    mark_as_outward: number;
    invoice_id: number;
    eway_bill_number: string | null;
    packaging_date: string;
    packaging_done: number;
    packaging_remark: string;
    psd_id: number;
    psd_date: string | null;
    psd_done: number;
    created_at: string;
    updated_at: string;
    deleted_at: string | null;
    business_task: {
        id: number;
        customer_name: string;
    };
    proforma_invoice: {
        id: number;
        pi_number: string;
    };
    inco_term: {
        id: number;
        inco_term: string;
    };
    inward_attachments: [{ id: number, inward_id: number, name: string, attachment_type: string}];
}
const InwardEdit = () => {
    const { inwardId } = useParams();
    const [inwardData, setInwardData] = useState<InwardShipment>();
    const [refreshData, setRefreshData] = useState<boolean>(false);
    const [selectedInwardId, setSelectedInwardId] = useState<number>(0);
    const [selectedGrnId, setSelectedGrnId] = useState<number>(0);
    const [selectedPurchaseId, setSelectedPurchaseId] = useState<number>(0);
    const [editInwardDetailsModal, setEditInwardDetailsModal] = useState<boolean>(false);
    const [showAddGrnModal, setShowAddGrnModal] = useState<boolean>(false);
    const [boxAddEditModal, setBoxAddEditModal] = useState<boolean>(false);
    const [productModal, setProductModal] = useState<boolean>(false);
    const [selectedProductId, setSelectedProductId] = useState<number>(0);
    const [selectedBoxId, setSelectedBoxId] = useState<number>(0);
    const [shipmentPhotosModal, setShipmentPhotosModal] = useState<boolean>(false);
    const [grnPoModal, setGrnPoModal] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const [tabKey, setTabKey] = useState<string>('');
    const [validated, setValidated] = useState<boolean>(false);
    const [loading, setLoading] = useState(false);
    type FileAttachmentKeys = 'shipment_file';
    const [fileAttachments, setFileAttachments] = useState<Record<FileAttachmentKeys, File[]>>({
        shipment_file: [],
    });
    const [shipmentPhotoErrors, setShipmentPhotoErrors] = useState<{ files?: string }>({});
    // const [fileValidations, setFileValidations] = useState<{ shipment_file?: string }>({});


    const { userPermission } = useAuth(); //check userRole & permissions
    const navigate = useNavigate();
    const handleRedirect = (path: string) => {
        navigate(`/${path}`);
    }

    const handleInwardList = () => {
        navigate(`/warehouse-inward`);
    };
    const handleGoToBt = (btId: number) => {
        navigate(`/bt/enquiryDetails/${btId}`);
    };

    const handleSuccess = () => {
        // Refresh data or perform any other action after successful submission
        setRefreshData(prev => !prev); // Toggle state to trigger re-fetch
    };

    useEffect(() => {
        const fetchInwardEditData = async () => {
            try {
                const response = await axiosInstance.get(`/edit-inward/${inwardId}`); // Replace with your API URL
                if (response.status !== 200) {
                    throw new Error('Failed to fetch data');
                }
                const data: InwardShipment = await response.data;
                setInwardData(data);
                setTabKey(`grn_${data.grns[0]?.id}`);

            } catch (err: any) {
                setError(err.message);
            } finally {
            }
        };
        fetchInwardEditData();
    }, [refreshData]); // Empty array ensures this runs once on mount

    const handleAddGrn = (inwardId: number) => {
        setSelectedInwardId(inwardId);
        setShowAddGrnModal(true);
    };

    const handleEditInwardDetails = (inwardId: number) => {
        setSelectedInwardId(inwardId);
        setEditInwardDetailsModal(true);
    };

    const handleShipmentPhotos = (inwardId: number) => {
        setSelectedInwardId(inwardId);
        setShipmentPhotosModal(true);
        setFileAttachments({shipment_file: []});
    };

    const handleGrnPoEdit = (inwardId: number, grnId: number) => {
        setSelectedInwardId(inwardId);
        setSelectedGrnId(grnId);
        setGrnPoModal(true);
    };

    const handleBoxAddition = (grnId: number, purchId: number, boxId?: number) => {
        setSelectedGrnId(grnId);
        setSelectedPurchaseId(purchId);
        if(boxId !== undefined){
            setSelectedBoxId(boxId);
        } else {
            setSelectedBoxId(0);
        }

        setBoxAddEditModal(true);
    };

    const handleProductDetails = (boxId: number, prodId?: number) => {
        setSelectedBoxId(boxId);
        setSelectedProductId(prodId);
        setProductModal(true);
    };

    const handleDownload = async (fileName: string, path: string) => {
        try {
            // Fetch the file from the server using the ID
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
    }

    //remove product from box
    const handleDelete = async ( deleteId: number, pathName: string) => {
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
                axiosInstance.delete(`/${pathName}`, {
                    params: { id: deleteId }
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
    const handleClose = () => setShowAddGrnModal(false);
    const handleEditInwardDetailsClose = () => setEditInwardDetailsModal(false);
    const handleProductModalClose = () => setProductModal(false);
    const handleBoxModalClose = () => setBoxAddEditModal(false);
    const handleShipmentPhotosModalClose = () => setShipmentPhotosModal(false);
    const handleGrnPoModalClose = () => setGrnPoModal(false);

    const handlePDFclicked = async (fileName: string, path: string, boxId?: number) => {
        try {
            let url = '';
            if(boxId !== undefined){
                url = `${path}/${fileName}/${boxId}`;
            } else {
                url = `${path}/${fileName}`;
            }
            // Fetch the file from the server using the ID
            const response = await axiosInstance.get(`/${url}`, {
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

    const handleDrop = (acceptedFiles: File[], fileName: FileAttachmentKeys) => {
        // Instead of creating a FileList, just update the files array
        setFileAttachments((prevState) => ({
            ...prevState,
            [fileName]: acceptedFiles, // acceptedFiles is already an array of File objects
        }));

        // setFileValidations((prevErrors) => ({ ...prevErrors, [fileName]: undefined }));
    };

    const handleFileRemove = (index: number, fileName: FileAttachmentKeys) => {
        const updatedFiles = fileAttachments[fileName].filter((_, i) => i !== index);

        setFileAttachments((prevState) => ({
            ...prevState,
            [fileName]: updatedFiles, // Update the files with the new array
        }));
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
        if(fileAttachments.shipment_file.length < 1){
            setShipmentPhotoErrors({ files: 'Please upload at least one file.' });
            setValidated(true);
            return;
        }
        setLoading(true);
        setValidated(true);

        const apiCall = axiosInstance.post('/addShipmentAttachments', {
            inward_id: selectedInwardId,
            shipment_file: fileAttachments.shipment_file
            }, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            }
        );

        apiCall
            .then((response) => {
                swal("Success!", response.data.message, "success");
                handleSuccess();
                handleShipmentPhotosModalClose();
        })
        .catch(error => swal("Error!", error.data.message, "error"))
        .finally(() => { setLoading(false); });
    };

    if (error) return <div>Error: {error}</div>;
    return (
        <>
            <h2 className="mb-5">Inward Record Repository</h2>
            <Card className='border border-translucent'>
                <Card.Title className='d-flex justify-content-end px-4 mt-3 mb-0'>
                    {userPermission.warehouse_list == 1 && (
                        <Button
                        variant="primary"
                        size="sm"
                        startIcon={<FontAwesomeIcon icon={faCaretLeft} className="me-2" />}
                        onClick={() => handleInwardList()}
                        >
                            Inward List
                        </Button>
                    )}
                </Card.Title>
                <hr />
                <Card.Body>
                    <Row>
                        <Col className='col-md-4'>
                            <Form.Group className="mb-3">
                                <Form.Label>Proforma Invoice Id <span className="text-danger">*</span></Form.Label>
                                <Form.Control type="text" value={inwardData?.proforma_invoice.pi_number} readOnly style={{backgroundColor: '#eff2f6b3', pointerEvents: 'none'}} />
                            </Form.Group>
                            <Button variant='primary' size='sm' onClick={() => handleProformaDownload(inwardData?.proforma_invoice_id, 'pdfWithSignatureQuotation')}>{inwardData?.proforma_invoice.pi_number}</Button>
                        </Col>
                        <Col className='col-md-4'>
                            <Form.Group className="mb-3">
                                <Form.Label>Business Task Id <span className="text-danger">*</span></Form.Label>
                                <Form.Control type="text" value={`${inwardData?.business_task.id} (${inwardData?.business_task.customer_name})`} readOnly style={{backgroundColor: '#eff2f6b3', pointerEvents: 'none'}} />
                            </Form.Group>
                            {userPermission.business_task_edit == 1 && (
                                <Button variant='primary' size='sm' onClick={() => handleGoToBt(inwardData.business_task?.id)}>Go to BT</Button>
                            )}
                        </Col>
                        <Col className='col-md-4 d-flex align-items-center justify-content-end'>
                            <Button variant="primary" className="" startIcon={<FontAwesomeIcon icon={faPlus} className="me-2" />} onClick={() => handleEditInwardDetails(inwardData.id)}>
                                Edit Inward Details
                            </Button>
                        </Col>
                    </Row>
                    <hr />
                    <Card.Title as="h5" className="text-danger">Route for the shipment</Card.Title>
                    <Row>
                        <Col className='col-md-4'>
                            <Form.Group as={Col} className="mb-3">
                                <Form.Label>Port of Loading <span className="text-danger">*</span></Form.Label>
                                <Form.Control type="text" value={inwardData?.port_of_loading} readOnly style={{backgroundColor: '#eff2f6b3', pointerEvents: 'none'}} />
                            </Form.Group>
                        </Col>
                        <Col className='col-md-4'>
                            <Form.Group as={Col} className="mb-3">
                                <Form.Label>Port of Discharge <span className="text-danger">*</span></Form.Label>
                                <Form.Control type="text" value={inwardData?.port_of_discharge} readOnly style={{backgroundColor: '#eff2f6b3', pointerEvents: 'none'}} />
                            </Form.Group>
                        </Col>
                        <Col className='col-md-4'>
                            <Form.Group as={Col} className="mb-3">
                                <Form.Label>INCO Terms <span className="text-danger">*</span></Form.Label>
                                <Form.Control type="text" value={inwardData?.inco_term.inco_term} readOnly style={{backgroundColor: '#eff2f6b3', pointerEvents: 'none'}} />
                            </Form.Group>
                        </Col>
                        <Col className='col-md-4'>
                            <Form.Group as={Col} className="mb-3">
                                <Form.Label>Pickup Location <span className="text-danger">*</span></Form.Label>
                                <Form.Control type="text" value={inwardData?.pickup_location} readOnly style={{backgroundColor: '#eff2f6b3', pointerEvents: 'none'}} />
                            </Form.Group>
                        </Col>
                        <Col className='col-md-4'>
                            <Form.Group as={Col} className="mb-3">
                                <Form.Label>Mode Of Shipment <span className="text-danger">*</span></Form.Label>
                                <Form.Select name="mode_of_shipment" value={inwardData?.mode_of_shipment} readOnly disabled>
                                    <option value="">Please select</option>
                                    <option value="by_air">By Air</option>
                                    <option value="by_sea">By Sea</option>
                                    <option value="by_road">By Road</option>
                                </Form.Select>
                            </Form.Group>
                        </Col>
                        <Col className='col-md-4'>
                            <Form.Group as={Col} className="mb-3">
                                <Form.Label>Terms Of Shipment <span className="text-danger">*</span></Form.Label>
                                <Form.Select name="terms_of_shipment" value={inwardData?.terms_of_shipment} readOnly disabled>
                                    <option value="">Please select</option>
                                    <option value="door_to_port">Door To Port</option>
                                    <option value="port_to_port">Port To Port</option>
                                    <option value="door_to_door">Door To Door</option>
                                </Form.Select>
                            </Form.Group>
                        </Col>
                    </Row>

                    <hr />
                    <Card.Title as="h5" className="text-danger">Shipment Photographs</Card.Title>
                    <Row className='px-3'>
                        {inwardData?.inward_attachments.map((upload) => (
                            <>
                            <Col className='col-md-3 py-1 px-3 border'>
                                <Button
                                    key={upload.id}
                                    className="text-primary p-0"
                                    variant="link"
                                    title="Download"
                                    onClick={() => handleDownload(upload.name, 'uploads/wms/inward/shipment_images/')}
                                    startIcon={<FontAwesomeIcon icon={faDownload} />}
                                >
                                    {upload.name}
                                </Button>
                                {userPermission.warehouse_delete == 1 && (
                                    <Button className='text-danger' variant='link' title='Delete Shipment Attachment' onClick={() => handleDelete(upload.id, 'deleteInwardAttachment')} startIcon={<FontAwesomeIcon icon={faTrash} />}></Button>
                                )}
                            </Col>
                            </>
                        ))}
                        <Col className='d-flex justify-content-end'>
                            <Button variant='primary' size='sm' onClick={() => handleShipmentPhotos(inwardId)}>Add Shipment Photos</Button>
                        </Col>
                    </Row>

                    <hr className='border border-danger border-1'/>
                    <Card.Title as="h4" className="text-dark">{inwardData?.inward_sys_id} ({inwardData?.inward_date})</Card.Title>

                    <Card.Title as="h5" className="fw-semibold text-dark">Box Details</Card.Title>
                    <p>To add/edit or delete the box details select the edit/delete button of respective row.</p>
                    <Row>
                        <Tab.Container id="grn-tabs" activeKey={tabKey} onSelect={(k) => { setTabKey(k)}}>
                            <Row>
                                <Col>
                                    <Nav variant="underline" className='ps-2 g-2'>
                                        {inwardData?.grns.map((grn) => (
                                            <Nav.Item key={grn.id}>
                                                <Nav.Link eventKey={`grn_${grn.id}`} className='fs-8'>
                                                    {grn.grn_number}
                                                </Nav.Link>
                                            </Nav.Item>
                                        ))}
                                    </Nav>
                                </Col>
                                <Col className='d-flex justify-content-end'>
                                    {userPermission.warehouse_edit == 1 && (
                                        <Button className='white-space-nowrap' variant="info" size='sm' title='Add New GRN' onClick={() => handleAddGrn(inwardId)} startIcon={<FontAwesomeIcon icon={faPlus} />}>Add Grn</Button>
                                    )}
                                </Col>
                            </Row>
                            <Tab.Content className='mt-3 px-5'>
                                {inwardData?.grns.map((grn) => (
                                    <>
                                        <Tab.Pane key={grn.id} eventKey={`grn_${grn.id}`}>
                                            <Row className="mb-3">
                                                <Col className='col-md-10 border border-secondary'>
                                                    <div className='p-1 d-inline-flex align-items-center'>
                                                        <h5 className="mb-0 text-danger">GRN : G-{grn.id}<strong></strong></h5> &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                                                        <h5 className="mb-0 text-dark">PO : <strong>{ grn.purchase_order.purchase_order_number} </strong> </h5> &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                                                        <h5 className="mb-0 text-dark">Vendor : <strong>{ grn.purchase_order.vendor?.name}</strong> </h5> &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                                                        <h5 className="mb-0 text-dark">Tax Invoice No : <strong className="">{grn.vendor_tax_invoice_number}</strong> &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; Date : <strong>{grn.vendor_tax_invoice_date ?? ''}</strong> </h5>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                                                        <h5 className="mb-0 text-dark">Tax Invoice Attachment : </h5>&nbsp;&nbsp; {grn.vendor_tax_invoice_attachment != null ? (
                                                            <>
                                                                <Button className="text-primary p-0 d-flex" variant="link" title="Download" onClick={() => handleDownload(`${grn.vendor_tax_invoice_attachment}`, 'uploads/wms/vendor_tax_invoice/')} startIcon={<FontAwesomeIcon icon={faDownload} />}> </Button>

                                                            </>
                                                            ) : (<>N/A</>)
                                                        }
                                                        {userPermission.warehouse_edit == 1 && (
                                                            <Button className='text-success' variant='link' title='Edit GRN Details' onClick={() => handleGrnPoEdit(inwardId, grn.id)} startIcon={<FontAwesomeIcon icon={faEdit} />}></Button>
                                                        )}
                                                    </div>
                                                </Col>
                                                <Col className='col-md-2'>

                                                    {userPermission.warehouse_edit == 1 && (
                                                        <Button className='white-space-nowrap' size='sm' variant="warning" title='Add Box to GRN' onClick={() => handleBoxAddition(grn.id, grn.purchase_order_id)} startIcon={<FontAwesomeIcon icon={faPlus} />}> Add box to G-{grn.id}</Button>
                                                    )}
                                                </Col>
                                            </Row>
                                            <Row className='mb-3'>
                                                {grn.boxes.length > 0 ? (
                                                    <>
                                                        <table className='fs-8 table striped bordered mb-4'>
                                                            <thead className='bg-dark'>
                                                                <tr className='border-secondary border-bottom-0'>
                                                                    <th className='p-2 border border-bottom-0 text-white'>Box ID</th>
                                                                    <th className='p-2 border border-bottom-0 text-white'>Location</th>
                                                                    <th className='p-2 border border-bottom-0 text-white'>Net Wt</th>
                                                                    <th className='p-2 border border-bottom-0 text-white'>Gross Wt</th>
                                                                    <th className='p-2 border border-bottom-0 text-white'>L(cm)</th>
                                                                    <th className='p-2 border border-bottom-0 text-white'>B(cm)</th>
                                                                    <th className='p-2 border border-bottom-0 text-white'>H(cm)</th>
                                                                    <th className='p-2 border border-bottom-0 text-white'>Action</th>
                                                                </tr>
                                                            </thead>
                                                            <tbody>
                                                                {grn.boxes.map((box: BoxData, bx_index) => (
                                                                    <>
                                                                    <tr key={bx_index} className='border-0'>
                                                                        <td className='p-2 border border-bottom-0 border-secondary'>{box.box_sys_id}</td>
                                                                        <td className='p-2 border border-bottom-0 border-secondary'>{box.location_details.warehouse_name} - {box.location_details.rack_number} - {box.location_details.floor}</td>
                                                                        <td className='p-2 border border-bottom-0 border-secondary'>{box.net_weight}</td>
                                                                        <td className='p-2 border border-bottom-0 border-secondary'>{box.gross_weight}</td>
                                                                        <td className='p-2 border border-bottom-0 border-secondary'>{box.length}</td>
                                                                        <td className='p-2 border border-bottom-0 border-secondary'>{box.width}</td>
                                                                        <td className='p-2 border border-bottom-0 border-secondary'>{box.height}</td>
                                                                        <td className='p-2 border border-bottom-0 border-secondary'>
                                                                            {userPermission.warehouse_edit == 1 && (
                                                                                <Button className='text-success' variant='link' title='Add Product Details' onClick={() => handleProductDetails(box.id)} startIcon={<FontAwesomeIcon icon={faPlusCircle} />}></Button>
                                                                            )}
                                                                            {userPermission.warehouse_edit == 1 && (
                                                                                <Button className='text-primary' variant='link' title='Edit Box Details' onClick={() => handleBoxAddition(grn.id, grn.purchase_order_id, box.id)} startIcon={<FontAwesomeIcon icon={faEdit} />}></Button>
                                                                            )}
                                                                            {userPermission.warehouse_delete == 1 && (
                                                                                <Button className='text-danger' variant='link' title='Delete Box' onClick={() => handleDelete(box.id, 'deleteBoxDetails')} startIcon={<FontAwesomeIcon icon={faTrash} />}></Button>
                                                                            )}
                                                                            {userPermission.warehouse_list == 1 && (
                                                                                <Button className='text-info' variant='link' title='Print Sticker' onClick={() => handlePDFclicked(inwardId, 'pdfInward', box.id)} startIcon={<FontAwesomeIcon icon={faPrint} />}></Button>
                                                                            )}
                                                                        </td>
                                                                    </tr>
                                                                    <tr key={`prod_${bx_index}`}>
                                                                        <td className='pt-0 px-0' colSpan={8}>
                                                                            <table className='phoenix-table fs-8 table'>
                                                                                <thead className='bg-body-quaternary'>
                                                                                    <tr>
                                                                                        <th className='p-2 text-white border border-bottom-0 border-translucent'>Product ID</th>
                                                                                        <th className='p-2 text-white border border-bottom-0 border-translucent'>Qty</th>
                                                                                        <th className='p-2 text-white border border-bottom-0 border-translucent'>HAZ</th>
                                                                                        <th className='p-2 text-white border border-bottom-0 border-translucent'>Mfg</th>
                                                                                        <th className='p-2 text-white border border-bottom-0 border-translucent'>HSN</th>
                                                                                        <th className='p-2 text-white border border-bottom-0 border-translucent'>Box Content</th>
                                                                                        <th className='p-2 text-white border border-bottom-0 border-translucent'>Action</th>
                                                                                    </tr>
                                                                                </thead>
                                                                                <tbody>
                                                                                    {box.products.map((prod, idx) => (
                                                                                        <tr key={idx}>
                                                                                            <td className='p-2 border-start border-end border-dark'>{prod.product_details.product_code} - {prod.product_details.product_name}</td>
                                                                                            <td className='p-2 border-start border-end border-dark'>{prod.product_quantity}</td>
                                                                                            <td className='p-2 border-start border-end border-dark'>{prod.hazardous_symbol}</td>
                                                                                            <td className='p-2 border-start border-end border-dark'>{prod.manufacture_year}</td>
                                                                                            <td className='p-2 border-start border-end border-dark'>{prod.product_hsn}</td>
                                                                                            <td className='p-2 border-start border-end border-dark'>{prod.box_content}</td>
                                                                                            <td className='p-2 border-start border-end border-dark'>
                                                                                                {userPermission.warehouse_edit == 1 && (
                                                                                                    <>
                                                                                                    <Button className='text-success' variant='link' title='Edit Product Details' onClick={() => handleProductDetails(prod.warehouse_box_id, prod.id)} startIcon={<FontAwesomeIcon icon={faEdit} />}></Button>
                                                                                                    <Button className='text-danger' variant='link' title='Delete Product from Box' onClick={() => handleDelete(prod.id, 'deleteBoxProduct')} startIcon={<FontAwesomeIcon icon={faTrash} />}></Button>
                                                                                                    </>
                                                                                                )}
                                                                                            </td>
                                                                                        </tr>
                                                                                    ))}
                                                                                </tbody>
                                                                            </table>
                                                                        </td>

                                                                    </tr>
                                                                    </>
                                                                ))}
                                                            </tbody>
                                                        </table>
                                                    </>
                                                ): (<> </>)}
                                            </Row>
                                        </Tab.Pane>
                                    </>
                                ))}
                            </Tab.Content>
                        </Tab.Container>


                    </Row>

                </Card.Body>
            </Card>

            {showAddGrnModal && (
                <AddGrnInwardModal inwardId={selectedInwardId} onSuccess={handleSuccess} onHide={handleClose} />
            )}

            {editInwardDetailsModal && (
                <EditInwardDetailsModal inwardId={selectedInwardId}
                    quotation_id={inwardData?.proforma_invoice.id}
                    quotation={inwardData?.proforma_invoice}
                    business_task_id={inwardData?.business_task_id}
                    business_task={inwardData?.business_task}
                    inco_term_id={inwardData?.inco_term_id}
                    inco_term={inwardData?.inco_term}
                    port_of_loading={inwardData?.port_of_loading}
                    port_of_discharge={inwardData?.port_of_discharge}
                    pickup_location={inwardData?.pickup_location}
                    mode_of_shipment={inwardData?.mode_of_shipment}
                    terms_of_shipment={inwardData?.terms_of_shipment}
                    onSuccess={handleSuccess}
                    onHide={handleEditInwardDetailsClose}
                />
            )}

            {productModal && (
                <ProductDetailsModal prodId={selectedProductId}
                    box_id={selectedBoxId}
                    onSuccess={handleSuccess}
                    onHide={handleProductModalClose}
                />
            )}

            {boxAddEditModal && (
                <BoxAddEditModal grnId={selectedGrnId}
                    purchId={selectedPurchaseId}
                    boxId={selectedBoxId}
                    handleDownload={handleDownload}
                    onSuccess={handleSuccess}
                    onHide={handleBoxModalClose}
                />
            )}

            {shipmentPhotosModal && (
                <Modal show onHide={handleShipmentPhotosModalClose} size='lg' backdrop="static" keyboard={false}>
                    <Modal.Header closeButton>
                        <Modal.Title>Freight Enquiry form </Modal.Title>
                    </Modal.Header>
                    <Form noValidate validated={validated} onSubmit={handleSubmit}>
                        <Modal.Body>
                            <Form.Label>Shipment Photograph <span className="text-danger">*</span></Form.Label>
                            <Dropzone onDrop={acceptedFiles => handleDrop(acceptedFiles, 'shipment_file')} onRemove={index => handleFileRemove(index, 'shipment_file')} />
                            {shipmentPhotoErrors.files && <div className="text-danger mt-1">{shipmentPhotoErrors.files}</div>}
                        </Modal.Body>
                        <Modal.Footer>
                            <Button variant="secondary" onClick={handleShipmentPhotosModalClose}>
                                Close
                            </Button>
                            <Button variant="primary" loading={loading} loadingPosition="start" type="submit">Update</Button>
                        </Modal.Footer>
                    </Form>
                </Modal>
            )}

            {grnPoModal && (
                <EditGrnDetailsModal inwardId={selectedInwardId}
                    grnId={selectedGrnId}
                    handleDownload={handleDownload}
                    onSuccess={handleSuccess}
                    onHide={handleGrnPoModalClose}
                />
            )}

        </>
    )
};

export default InwardEdit;

