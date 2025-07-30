import { faCaretLeft, faCirclePlus, faEdit, faEye, faTrash } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import Button from '../../../components/base/Button';
import React, { useEffect, useState, ChangeEvent } from 'react';
import { Form, Modal, Col, Row } from 'react-bootstrap';
import axiosInstance from '../../../axios';
import useAdvanceTable from '../../../hooks/useAdvanceTable';
import AdvanceTableProvider from '../../../providers/AdvanceTableProvider';
import SearchBox from '../../../components/common/SearchBox';
import { useAuth } from '../../../AuthContext';
import { ColumnDef } from '@tanstack/react-table';
import AdvanceTable from '../../../components/base/AdvanceTable';
import AdvanceTableFooter from '../../../components/base/AdvanceTableFooter';
import swal from 'sweetalert';
import { useNavigate, useParams } from 'react-router-dom';

interface CompanyDetailsData {
    id: number;
    name: string;
    short_code: string;
}

const CompanyDetails = () => {
    const { ffdId } = useParams();
    const [showModal, setShowModal] = useState<boolean>(false);
    const [showViewModal, setShowViewModal] = useState<boolean>(false);
    const [refreshData, setRefreshData] = useState<boolean>(false);
    const [companyTableData, setCompanyTableData] = useState<CompanyDetailsData[]>([]);
    const [error, setError] = useState<string | null>(null);

    const [selectedContactId, setSelectedContactId] = useState<number | undefined>(undefined);
    const { userPermission } = useAuth(); //check userRole & permissions

    const handleShow = (contactId?: number) => {
        setSelectedContactId(contactId);
        setShowModal(true);
    };
    const handleViewShow = (contactId?: number) => {
        setSelectedContactId(contactId);
        setShowViewModal(true);
    };

    const handleClose = () => setShowModal(false);
    const handleViewClose = () => setShowViewModal(false);

    const handleSuccess = () => {
        // Refresh data or perform any other action after successful submission
        setRefreshData(prev => !prev); // Toggle state to trigger re-fetch
    };

    const table = useAdvanceTable({
        data: companyTableData,
        columns: companyDetailsTableColumns(handleShow,handleViewShow,handleSuccess),
        pageSize: 10,
        pagination: true,
        sortable: true,
        selection: false,
        initialState: {
            columnVisibility: { }
        }
    });

    const handleSearchInputChange = (e: ChangeEvent<HTMLInputElement>) => {
        table.setGlobalFilter(e.target.value || undefined);
    };

    useEffect(() => {
        const fetchFfdData = async () => {
            try {
                const response = await axiosInstance.get(`/company-details`);
                if (response.status !== 200) {
                    throw new Error('Failed to fetch data');
                }
                const data = await response.data;
                setCompanyTableData(data);
            } catch (err: any) {
                setError(err.data.message);
            } finally {
            }
        };

        fetchFfdData();
    }, [refreshData]);

    if (error) return <div>Error: {error}</div>;

    return (
        <>
            <AdvanceTableProvider {...table}>
                <h2 className="mb-5">Company Details</h2>
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
                        {userPermission.ffd_contact_create === 1 && !error && (
                            <Button
                                variant="primary"
                                className=""
                                startIcon={<FontAwesomeIcon icon={faCirclePlus} className="me-2" />}
                                onClick={() => handleShow()}
                            >
                                Add Company Details
                            </Button>
                        )}

                    </Col>
                </Row>
                <CompanyDetailsTable />
            </AdvanceTableProvider>
            {showModal && (
                <CompanyDetailsModal contactId={selectedContactId} onHide={handleClose} onSuccess={handleSuccess} />
            )}
            {showViewModal && (
                <CompanyDetailsViewModal contactId={selectedContactId} onHide={handleViewClose} />
            )}
        </>
    );
};

export default CompanyDetails;


const companyDetailsTableColumns = (handleShow: (contactId?: number) => void, handleViewShow: (contactId?: number) => void, handleSuccess: () => void): ColumnDef<CompanyDetailsData>[] => [
    {
        accessorKey: 'index',
        header: () => {
            return (
                <div className="d-inline-flex flex-center">
                    <span>Sr No.</span>
                </div>
            );
        },
        cell: ({ row }) => {
            return (
                <span>{row.index + 1}</span>
            );
        },
        meta: {
            headerProps: {
                style: { width: '5%' },
                className: 'ps-2 pe-2 border-start border-end border-translucent'
            },
            cellProps: {
                className:
                'white-space-nowrap fw-semibold ps-2 border-start border-end border-translucent'
            }
        }
    },
    {
        accessorKey: 'company_id',
        header: () => {
            return (
                <div className="d-inline-flex flex-center">
                    <span>Company ID</span>
                </div>
            );
        },
        cell: ({ row: { original } }) => {
            const { id } = original;
            return (
                <span>{id}</span>
            );
        },
        meta: {
            headerProps: {
                className: 'ps-2 pe-2 border-end border-translucent'
            },
            cellProps: {
                className:
                'white-space-nowrap fw-semibold ps-2 border-end border-translucent'
            }
        }
    },
    {
        accessorKey: 'name',
        header: () => {
            return (
                <div className="d-inline-flex flex-center">
                    <span>Name</span>
                </div>
            );
        },
        cell: ({ row: { original } }) => {
            const { name } = original;
            return (
                <span>{name}</span>
            );
        },
        meta: {
            headerProps: {
                className: 'ps-2 pe-2 border-end border-translucent'
            },
            cellProps: {
                className:
                'white-space-nowrap fw-semibold ps-2 border-end border-translucent'
            }
        }
    },
    {
        accessorKey: 'short_code',
        header: () => {
            return (
                <div className="d-inline-flex flex-center">
                    <span>Short Code</span>
                </div>
            );
        },
        cell: ({ row: { original } }) => {
            const { short_code } = original;
            return (
                <span>{short_code ? short_code : 'N/A'}</span>
            );
        },
        meta: {
            headerProps: {
                style: { width: '15%' },
                className: 'ps-2 pe-2 border-end border-translucent'
            },
            cellProps: {
                className:
                'white-space-nowrap fw-semibold ps-2 border-end border-translucent'
            }
        }
    },
    {
        id: 'actions',
        header: () => {
            return (
                <div className="d-inline-flex flex-center">
                    <span>Actions</span>
                </div>
            );
        },
        cell: ({ row: { original } }) => {
            const { id } = original;
            const { userPermission } = useAuth(); //check userRole & permissions
            return (
                <div className="d-flex align-items-center gap-2">
                    <Button className='text-info' variant='link' title='View Company Details' onClick={() => handleViewShow(id)}>
                        <FontAwesomeIcon icon={faEye} />
                    </Button>
                    {userPermission.company_details_edit == 1 && (
                        <Button className='text-success' variant='link' title='Edit Company Details' onClick={() => handleShow(id)} startIcon={<FontAwesomeIcon icon={faEdit} />}></Button>
                    )}
                </div>
            );
        },
        meta: {
            headerProps: {
                style: { width: '15%' },
                className: 'ps-2 pe-2 border-end border-translucent'
            },
            cellProps: {
                className:
                'white-space-nowrap fw-semibold ps-2 border-end border-translucent'
            }
        }
    },
];
const CompanyDetailsTable = () => {
    return (
        <div className="border-top border-translucent">
            <AdvanceTable
                tableProps={{ className: 'phoenix-table fs-9' }}
                rowClassName="hover-actions-trigger btn-reveal-trigger"
            />
            <AdvanceTableFooter pagination className="py-4" />
        </div>
    );
};
interface CompanyDetailsModalProps {
    contactId?: number;
    onHide: () => void;
    onSuccess?: () => void;
}

interface FormData {
    id?: number;
    name: string;
    short_code: string;
    address: string;
    city: string;
    state: string;
    country: string;
    pin_code: string;
    gst_no: string;
    pan_no: string;
    pcpndt_no: string;
    drug_lic_no: string;
    iec: string;
    cin: string;
    tds: string;
    iso: string;
    arn: string;
    website: string;
    optional_website: string;
    mobile: string;
    optional_mobile: string;
}

const CompanyDetailsModal: React.FC<CompanyDetailsModalProps> = ({ contactId, onHide, onSuccess}) => {

    const [custData, setUserData] = useState<FormData>({
        id: 0,
        name: '',
        short_code: '',
        address: '',
        city: '',
        state: '',
        country: '',
        pin_code: '',
        gst_no: '',
        pan_no: '',
        pcpndt_no: '',
        drug_lic_no: '',
        iec: '',
        cin: '',
        tds: '',
        iso: '',
        arn: '',
        website: '',
        optional_website: '',
        mobile: '',
        optional_mobile: '',
    });
    const [loading, setLoading] = useState(false);
    const [isEditing, setIsEditing] = useState<boolean>(false);
    const [validated, setValidated] = useState<boolean>(false);
    useEffect(() => {

        if (contactId) {
            setIsEditing(true);
            // Fetch ffd data for editing
            axiosInstance.post(`/fetchCompanyDetails`,{
                id: contactId
            })
            .then(response => {
                setUserData(response.data);
            })
            .catch(error => console.error('Error fetching ffd contact data:', error));
        }
    }, [contactId]);

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
        const apiCall = axiosInstance.post('/updateCompanyDetails', custData );

        apiCall
            .then((response) => {
                swal("Success!", response.data.message, "success");
            onSuccess();
            onHide();
        })
        .catch(error => swal("Error!", error.data.message, "error"))
        .finally(() => { setLoading(false); });
    };
    return (
        <>
            <Modal show onHide={onHide} size="lg" backdrop="static" keyboard={false}>
                <Modal.Header closeButton>
                    <Modal.Title>{isEditing ? 'Edit Company Details' : 'Add Company Details'}</Modal.Title>
                </Modal.Header>
                <Form noValidate validated={validated} onSubmit={handleSubmit}>
                    <Modal.Body>
                        <Row className="g-3">
                            <Form.Control type="hidden" name="id" value={custData.id}/>
                            <Form.Group as={Col} className="col-md-8 mb-3" controlId="name">
                                <Form.Label>Name <span className="text-danger">*</span></Form.Label>
                                <Form.Control type="text" placeholder="Contact Person" name="name" value={custData.name} onChange={handleChange} required />
                                <Form.Control.Feedback type="invalid">Please enter contact person.</Form.Control.Feedback>
                            </Form.Group>
                            <Form.Group as={Col} className="col-md-4 mb-3" controlId="short_code">
                                <Form.Label>Short Code <span className="text-danger">*</span></Form.Label>
                                <Form.Control type="text" placeholder="Short Code" name="short_code" value={custData.short_code} onChange={handleChange} required />
                                <Form.Control.Feedback type="invalid">Please enter short code.</Form.Control.Feedback>
                            </Form.Group>
                        </Row>
                        <Row className="g-3">
                            <Form.Group as={Col} className="mb-3" controlId="address">
                                <Form.Label>Address <span className="text-danger">*</span></Form.Label>
                                <Form.Control as="textarea" rows={3} placeholder="address" name="address" value={custData.address} onChange={handleChange} required/>
                            </Form.Group>
                        </Row>
                        <Row className="g-3">
                            <Form.Group as={Col} className="mb-3" controlId="city">
                                <Form.Label>City <span className="text-danger">*</span></Form.Label>
                                <Form.Control type="text" placeholder="city" name="city" value={custData.city} onChange={handleChange} required />
                                <Form.Control.Feedback type="invalid">Please enter city.</Form.Control.Feedback>
                            </Form.Group>
                            <Form.Group as={Col} className="mb-3" controlId="state">
                                <Form.Label>State <span className="text-danger">*</span></Form.Label>
                                <Form.Control type="text" placeholder="state" name="state" value={custData.state} onChange={handleChange} required />
                                <Form.Control.Feedback type="invalid">Please enter state.</Form.Control.Feedback>
                            </Form.Group>
                            <Form.Group as={Col} className="mb-3" controlId="country">
                                <Form.Label>Country <span className="text-danger">*</span></Form.Label>
                                <Form.Control type="text" placeholder="country" name="country" value={custData.country} onChange={handleChange} required />
                                <Form.Control.Feedback type="invalid">Please enter country.</Form.Control.Feedback>
                            </Form.Group>
                            <Form.Group as={Col} className="mb-3" controlId="pin_code">
                                <Form.Label>Pin Code <span className="text-danger">*</span></Form.Label>
                                <Form.Control type="text" placeholder="pin code" name="pin_code" value={custData.pin_code} onChange={handleChange} required />
                                <Form.Control.Feedback type="invalid">Please enter pin code.</Form.Control.Feedback>
                            </Form.Group>
                        </Row>
                        <Row className="g-3">
                            <Form.Group as={Col} className="mb-3" controlId="gst_no">
                                <Form.Label>GST Number <span className="text-danger">*</span></Form.Label>
                                <Form.Control type="text" placeholder="GST Number" name="gst_no" value={custData.gst_no} onChange={handleChange}  minLength={15} maxLength={15} required />
                                <Form.Control.Feedback type="invalid">Please enter GST number. (min length : 15)</Form.Control.Feedback>
                            </Form.Group>
                            <Form.Group as={Col} className="mb-3" controlId="pan_no">
                                <Form.Label>PAN Number <span className="text-danger">*</span></Form.Label>
                                <Form.Control type="text" placeholder="PAN Number" name="pan_no" value={custData.pan_no} onChange={handleChange} required />
                                <Form.Control.Feedback type="invalid">Please enter PAN Number.</Form.Control.Feedback>
                            </Form.Group>
                            <Form.Group as={Col} className="mb-3" controlId="pcpndt_no">
                                <Form.Label>PCPNDT Number</Form.Label>
                                <Form.Control type="text" placeholder="PCPNDT Number" name="pcpndt_no" value={custData.pcpndt_no} onChange={handleChange} />
                                <Form.Control.Feedback type="invalid">Please enter PCPNDT Number.</Form.Control.Feedback>
                            </Form.Group>
                        </Row>
                        <Row className="g-3">
                            <Form.Group as={Col} className="mb-3" controlId="drug_lic_no">
                                <Form.Label>Drug Lic Number</Form.Label>
                                <Form.Control type="text" placeholder="Drug Lic Number" name="drug_lic_no" value={custData.drug_lic_no} onChange={handleChange} />
                                <Form.Control.Feedback type="invalid">Please enter drug lic number</Form.Control.Feedback>
                            </Form.Group>
                            <Form.Group as={Col} className="mb-3" controlId="iec">
                                <Form.Label>IEC <span className="text-danger">*</span></Form.Label>
                                <Form.Control type="text" placeholder="IEC" name="iec" value={custData.iec} onChange={handleChange} />
                                <Form.Control.Feedback type="invalid">Please enter IEC.</Form.Control.Feedback>
                            </Form.Group>
                            <Form.Group as={Col} className="mb-3" controlId="cin">
                                <Form.Label>CIN</Form.Label>
                                <Form.Control type="text" placeholder="CIN" name="cin" value={custData.cin} onChange={handleChange} />
                                <Form.Control.Feedback type="invalid">Please enter CIN.</Form.Control.Feedback>
                            </Form.Group>
                        </Row>
                        <Row className="g-3">
                            <Form.Group as={Col} className="mb-3" controlId="tds">
                                <Form.Label>TDS</Form.Label>
                                <Form.Control type="text" placeholder="TDS" name="tds" value={custData.tds} onChange={handleChange} />
                                <Form.Control.Feedback type="invalid">Please enter TDS</Form.Control.Feedback>
                            </Form.Group>
                            <Form.Group as={Col} className="mb-3" controlId="iso">
                                <Form.Label>ISO</Form.Label>
                                <Form.Control type="text" placeholder="ISO" name="iso" value={custData.iso} onChange={handleChange} />
                                <Form.Control.Feedback type="invalid">Please enter ISO.</Form.Control.Feedback>
                            </Form.Group>
                            <Form.Group as={Col} className="mb-3" controlId="arn">
                                <Form.Label>Application Ref Number(ARN)</Form.Label>
                                <Form.Control type="text" placeholder="ARN" name="arn" value={custData.arn} onChange={handleChange} />
                                <Form.Control.Feedback type="invalid">Please enter Application Ref Number(ARN).</Form.Control.Feedback>
                            </Form.Group>
                        </Row>
                        <Row className="g-3">
                            <Form.Group as={Col} className="mb-3" controlId="website">
                                <Form.Label>Website <span className="text-danger">*</span></Form.Label>
                                <Form.Control type="text" placeholder="Website" name="website" value={custData.website} onChange={handleChange} required />
                                <Form.Control.Feedback type="invalid">Please enter website.</Form.Control.Feedback>
                            </Form.Group>
                            <Form.Group as={Col} className="mb-3" controlId="optional_website">
                                <Form.Label>Email <span className="text-danger">*</span></Form.Label>
                                <Form.Control type="text" placeholder="Email" name="optional_website" value={custData.optional_website} onChange={handleChange} required />
                                <Form.Control.Feedback type="invalid">Please enter email.</Form.Control.Feedback>
                            </Form.Group>
                            <Form.Group as={Col} className="mb-3" controlId="mobile">
                                <Form.Label>Mobile <span className="text-danger">*</span></Form.Label>
                                <Form.Control type="text" placeholder="Mobile" name="mobile" value={custData.mobile} onChange={handleChange} required />
                                <Form.Control.Feedback type="invalid">Please enter mobile.</Form.Control.Feedback>
                            </Form.Group>
                            <Form.Group as={Col} className="mb-3" controlId="optional_mobile">
                                <Form.Label>Optional Mobile</Form.Label>
                                <Form.Control type="text" placeholder="Optional Mobile" name="optional_mobile" value={custData.optional_mobile} onChange={handleChange} />
                                <Form.Control.Feedback type="invalid">Please enter optional mobile.</Form.Control.Feedback>
                            </Form.Group>
                        </Row>
                    </Modal.Body>
                    <Modal.Footer>
                        <Button variant="secondary" onClick={onHide}>
                            Close
                        </Button>
                        <Button variant="primary" loading={loading} loadingPosition="start" type="submit">{isEditing ? 'Update' : 'Add'}</Button>
                    </Modal.Footer>
                </Form>
            </Modal>
        </>
    );
};
const CompanyDetailsViewModal: React.FC<CompanyDetailsModalProps> = ({ contactId, onHide}) => {

    const [custData, setUserViewData] = useState<FormData>({
        id: 0,
        name: '',
        short_code: '',
        address: '',
        city: '',
        state: '',
        country: '',
        pin_code: '',
        gst_no: '',
        pan_no: '',
        pcpndt_no: '',
        drug_lic_no: '',
        iec: '',
        cin: '',
        tds: '',
        iso: '',
        arn: '',
        website: '',
        optional_website: '',
        mobile: '',
        optional_mobile: '',
    });
    useEffect(() => {

        if (contactId) {
            // Fetch for view
            axiosInstance.post(`/fetchCompanyDetails`,{
                id: contactId
            })
            .then(response => {
                setUserViewData(response.data);
            })
            .catch(error => console.error('Error fetching data:', error));
        }
    }, [contactId]);

    return (
        <>
            <Modal show onHide={onHide} size="lg" backdrop="static" keyboard={false}>
                <Modal.Header closeButton>
                    <Modal.Title>View Company Details</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Row className="g-3">
                        <Form.Control type="hidden" name="id" value={custData.id}/>
                        <Form.Group as={Col} className="col-md-8 mb-3" controlId="name">
                            <Form.Label>Name <span className="text-danger">*</span></Form.Label>
                            <Form.Control type="text" placeholder="Contact Person" name="name" value={custData.name}  readOnly style={{ backgroundColor: 'whitesmoke', pointerEvents: 'none' }} />

                        </Form.Group>
                        <Form.Group as={Col} className="col-md-4 mb-3" controlId="short_code">
                            <Form.Label>Short Code <span className="text-danger">*</span></Form.Label>
                            <Form.Control type="text" placeholder="Short Code" name="short_code" value={custData.short_code}  readOnly style={{ backgroundColor: 'whitesmoke', pointerEvents: 'none' }} />

                        </Form.Group>
                    </Row>
                    <Row className="g-3">
                        <Form.Group as={Col} className="mb-3" controlId="address">
                            <Form.Label>Address <span className="text-danger">*</span></Form.Label>
                            <Form.Control as="textarea" rows={3} placeholder="address" name="address" value={custData.address}  readOnly style={{ backgroundColor: 'whitesmoke', pointerEvents: 'none' }}/>
                        </Form.Group>
                    </Row>
                    <Row className="g-3">
                        <Form.Group as={Col} className="mb-3" controlId="city">
                            <Form.Label>City <span className="text-danger">*</span></Form.Label>
                            <Form.Control type="text" placeholder="city" name="city" value={custData.city}  readOnly style={{ backgroundColor: 'whitesmoke', pointerEvents: 'none' }} />

                        </Form.Group>
                        <Form.Group as={Col} className="mb-3" controlId="state">
                            <Form.Label>State <span className="text-danger">*</span></Form.Label>
                            <Form.Control type="text" placeholder="state" name="state" value={custData.state}  readOnly style={{ backgroundColor: 'whitesmoke', pointerEvents: 'none' }} />

                        </Form.Group>
                        <Form.Group as={Col} className="mb-3" controlId="country">
                            <Form.Label>Country <span className="text-danger">*</span></Form.Label>
                            <Form.Control type="text" placeholder="country" name="country" value={custData.country}  readOnly style={{ backgroundColor: 'whitesmoke', pointerEvents: 'none' }} />
                        </Form.Group>
                        <Form.Group as={Col} className="mb-3" controlId="pin_code">
                            <Form.Label>Pin Code <span className="text-danger">*</span></Form.Label>
                            <Form.Control type="text" placeholder="pin code" name="pin_code" value={custData.pin_code}  readOnly style={{ backgroundColor: 'whitesmoke', pointerEvents: 'none' }} />

                        </Form.Group>
                    </Row>
                    <Row className="g-3">
                        <Form.Group as={Col} className="mb-3" controlId="gst_no">
                            <Form.Label>GST Number <span className="text-danger">*</span></Form.Label>
                            <Form.Control type="text" placeholder="GST Number" name="gst_no" value={custData.gst_no}  readOnly style={{ backgroundColor: 'whitesmoke', pointerEvents: 'none' }} />
                        </Form.Group>
                        <Form.Group as={Col} className="mb-3" controlId="pan_no">
                            <Form.Label>PAN Number <span className="text-danger">*</span></Form.Label>
                            <Form.Control type="text" placeholder="PAN Number" name="pan_no" value={custData.pan_no}  readOnly style={{ backgroundColor: 'whitesmoke', pointerEvents: 'none' }} />
                        </Form.Group>
                        <Form.Group as={Col} className="mb-3" controlId="pcpndt_no">
                            <Form.Label>PCPNDT Number</Form.Label>
                            <Form.Control type="text" placeholder="PCPNDT Number" name="pcpndt_no" value={custData.pcpndt_no}  readOnly style={{ backgroundColor: 'whitesmoke', pointerEvents: 'none' }} />
                        </Form.Group>
                    </Row>
                    <Row className="g-3">
                        <Form.Group as={Col} className="mb-3" controlId="drug_lic_no">
                            <Form.Label>Drug Lic Number</Form.Label>
                            <Form.Control type="text" placeholder="Drug Lic Number" name="drug_lic_no" value={custData.drug_lic_no}  readOnly style={{ backgroundColor: 'whitesmoke', pointerEvents: 'none' }} />
                        </Form.Group>
                        <Form.Group as={Col} className="mb-3" controlId="iec">
                            <Form.Label>IEC <span className="text-danger">*</span></Form.Label>
                            <Form.Control type="text" placeholder="IEC" name="iec" value={custData.iec}  readOnly style={{ backgroundColor: 'whitesmoke', pointerEvents: 'none' }} />
                        </Form.Group>
                        <Form.Group as={Col} className="mb-3" controlId="cin">
                            <Form.Label>CIN</Form.Label>
                            <Form.Control type="text" placeholder="CIN" name="cin" value={custData.cin}  readOnly style={{ backgroundColor: 'whitesmoke', pointerEvents: 'none' }} />
                        </Form.Group>
                    </Row>
                    <Row className="g-3">
                        <Form.Group as={Col} className="mb-3" controlId="tds">
                            <Form.Label>TDS</Form.Label>
                            <Form.Control type="text" placeholder="TDS" name="tds" value={custData.tds}  readOnly style={{ backgroundColor: 'whitesmoke', pointerEvents: 'none' }} />
                        </Form.Group>
                        <Form.Group as={Col} className="mb-3" controlId="iso">
                            <Form.Label>ISO</Form.Label>
                            <Form.Control type="text" placeholder="ISO" name="iso" value={custData.iso}  readOnly style={{ backgroundColor: 'whitesmoke', pointerEvents: 'none' }} />
                        </Form.Group>
                        <Form.Group as={Col} className="mb-3" controlId="arn">
                            <Form.Label>Application Ref Number(ARN)</Form.Label>
                            <Form.Control type="text" placeholder="ARN" name="arn" value={custData.arn}  readOnly style={{ backgroundColor: 'whitesmoke', pointerEvents: 'none' }} />
                        </Form.Group>
                    </Row>
                    <Row className="g-3">
                        <Form.Group as={Col} className="mb-3" controlId="website">
                            <Form.Label>Website <span className="text-danger">*</span></Form.Label>
                            <Form.Control type="text" placeholder="Website" name="website" value={custData.website}  readOnly style={{ backgroundColor: 'whitesmoke', pointerEvents: 'none' }} />
                        </Form.Group>
                        <Form.Group as={Col} className="mb-3" controlId="optional_website">
                            <Form.Label>Email <span className="text-danger">*</span></Form.Label>
                            <Form.Control type="text" placeholder="Email" name="optional_website" value={custData.optional_website}  readOnly style={{ backgroundColor: 'whitesmoke', pointerEvents: 'none' }} />
                        </Form.Group>
                        <Form.Group as={Col} className="mb-3" controlId="mobile">
                            <Form.Label>Mobile <span className="text-danger">*</span></Form.Label>
                            <Form.Control type="text" placeholder="Mobile" name="mobile" value={custData.mobile}  readOnly style={{ backgroundColor: 'whitesmoke', pointerEvents: 'none' }} />
                        </Form.Group>
                        <Form.Group as={Col} className="mb-3" controlId="optional_mobile">
                            <Form.Label>Optional Mobile</Form.Label>
                            <Form.Control type="text" placeholder="Optional Mobile" name="optional_mobile" value={custData.optional_mobile}  readOnly style={{ backgroundColor: 'whitesmoke', pointerEvents: 'none' }} />
                        </Form.Group>
                    </Row>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={onHide}>
                        Close
                    </Button>
                </Modal.Footer>
            </Modal>
        </>
    );
};
