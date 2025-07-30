import { faCirclePlus, faEdit, faTrash } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import Button from '../../../components/base/Button';
import React, { useEffect, useState, ChangeEvent } from 'react';
import { Form, Modal, Col, Row } from 'react-bootstrap';
import axiosInstance from '../../../axios';
import useAdvanceTable from '../../../hooks/useAdvanceTable';
import AdvanceTableProvider from '../../../providers/AdvanceTableProvider';
import SearchBox from '../../../components/common/SearchBox';
import { useAuth } from '../../../AuthContext';
import { useParams } from 'react-router-dom';
import { ColumnDef } from '@tanstack/react-table';
import AdvanceTable from '../../../components/base/AdvanceTable';
import AdvanceTableFooter from '../../../components/base/AdvanceTableFooter';
import swal from 'sweetalert';

interface Params {
    vendorId: number;
}

interface VendorData {
    id: number;
    name: string;
}

export interface ContactData {
    id: number;
    contact_person: string;
    vendor_id : number;
    phone: string;
    mobile: string;
    email: string;
    designation: string;
}
const VendorContacts = () => {
    // Extract vendorId from URL parameters
    const { vendorId } = useParams<Params>();
    const [showModal, setShowModal] = useState<boolean>(false);
    const [refreshData, setRefreshData] = useState<boolean>(false);
    const [vendorContactTableData, setVendorContactTableData] = useState<ContactData[]>([]);
    const [vendorData, setVendorData] = useState<VendorData>({id: 0, name: ''});
    const [error, setError] = useState<string | null>(null);

    const [selectedContactId, setSelectedContactId] = useState<number | undefined>(undefined);
    const { userPermission } = useAuth(); //check userRole & permissions

    const handleShow = (contactId?: number) => {
        setSelectedContactId(contactId);
        setShowModal(true);
    };

    const handleClose = () => setShowModal(false);

    const handleSuccess = () => {
        // Refresh data or perform any other action after successful submission
        setRefreshData(prev => !prev); // Toggle state to trigger re-fetch
    };

    const table = useAdvanceTable({
        data: vendorContactTableData,
        columns: vendorContactTableColumns(handleShow,handleSuccess, handleSuccess),
        pageSize: 10,
        pagination: true,
        sortable: true,
        selection: false,
        initialState: {
            columnVisibility: {

            }
        }
    });

    const handleSearchInputChange = (e: ChangeEvent<HTMLInputElement>) => {
        table.setGlobalFilter(e.target.value || undefined);
    };

    useEffect(() => {
        const fetchVendorContact = async () => {
            try {
                const response = await axiosInstance.get(`/vendors/contacts/${vendorId}`);
                if (response.status !== 200) {
                    throw new Error('Failed to fetch data');
                }
                const vendor_data: VendorData = await response.data.vendor;
                const data: ContactData[] = await response.data.contacts;
                setVendorContactTableData(data);
                setVendorData(vendor_data);
            } catch (err: any) {
                setError(err.data.message);
            } finally {

            }
        };

        fetchVendorContact();
    }, [refreshData]);
    // Use vendorId as needed

    if (error) return <div>Error: {error}</div>;

    return (
        <>
            <AdvanceTableProvider {...table}>
                <h2 className="mb-5">Vendor Contact</h2>
                <Row className="g-3 justify-content-between mb-4">
                    <Col md="auto" className="p-2 fw-semibold">Vendor Name :- { vendorData.name }</Col>
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
                        {userPermission.vendor_contact_create === 1 && !error && (
                            <Button
                                variant="primary"
                                className=""
                                startIcon={<FontAwesomeIcon icon={faCirclePlus} className="me-2" />}
                                onClick={() => handleShow()}
                            >
                                Add Contact
                            </Button>
                        )}
                    </Col>
                </Row>
                <VendorContactsTable />
            </AdvanceTableProvider>
            {showModal && (
                <VendorContactsModal contactId={selectedContactId} vendorData={vendorData} onHide={handleClose} onSuccess={handleSuccess} />
            )}
        </>
    );
};

export default VendorContacts;

const handleDelete = (contactId: number, handleSuccess: () => void) => {
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
            axiosInstance.delete(`/vendors-contacts/${contactId}`)
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
const vendorContactTableColumns = (handleShow: (contactId?: number) => void, handleSuccess: () => void, handleContacts: (id: number) => void): ColumnDef<ContactData>[] => [
    {
        accessorKey: 'contact_person',
        header: () => {
            return (
                <div className="d-inline-flex flex-center">
                    <span>Contact Person</span>
                </div>
            );
        },
        cell: ({ row: { original } }) => {
            const { contact_person } = original;
            return (
                <span>{contact_person}</span>
            );
        },
        meta: {
            headerProps: {
                className: 'ps-2 pe-2 border-start border-end border-translucent'
            },
            cellProps: {
                className:
                'white-space-nowrap fw-semibold ps-2 border-start border-end border-translucent'
            }
        }
    },

    {
        accessorKey: 'mobile',
        header: () => {
            return (
                <div className="d-inline-flex flex-center">
                    <span>Mobile</span>
                </div>
            );
        },
        cell: ({ row: { original } }) => {
            const { mobile } = original;
            return (
                <span>{mobile}</span>
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
        id: 'phone',
        header: () => {
            return (
                <div className="d-inline-flex flex-center">
                    <span>Phone</span>
                </div>
            );
        },
        meta: {
            headerProps: {
                className: 'ps-2 pe-2 border-end border-translucent'
            },
            cellProps: {
                className:
                'ps-2 border-end border-translucent'
            }
        },
        accessorFn: ({ phone }) => phone
    },
    {
        id: 'email',
        header: () => {
            return (
                <div className="d-inline-flex flex-center">
                    <span>Email</span>
                </div>
            );
        },
        meta: {
            headerProps: {
                className: 'ps-2 pe-2 border-end border-translucent'
            },
            cellProps: {
                className:
                'ps-2 border-end border-translucent'
            }
        },
        accessorFn: ({ email }) => email
    },
    {
        id: 'designation',
        header: () => {
            return (
                <div className="d-inline-flex flex-center">
                    <span>Designation</span>
                </div>
            );
        },
        meta: {
            headerProps: {
                className: 'ps-2 pe-2 border-end border-translucent'
            },
            cellProps: {
                className:
                'ps-2 border-end border-translucent'
            }
        },
        accessorFn: ({ designation }) => designation
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
                <div className="d-flex align-items-center gap-1">
                    {userPermission.vendor_contact_edit == 1 && (
                        <Button variant='link' title='Edit Vendor Contact' onClick={() => handleShow(id)} startIcon={<FontAwesomeIcon icon={faEdit} />}></Button>
                    )}
                    {userPermission.vendor_contact_delete == 1 && (
                        <Button variant="link" title='Delete Vendor Contact' className='text-danger' onClick={() => handleDelete(id, handleSuccess)}>
                            <FontAwesomeIcon icon={faTrash} />
                        </Button>
                    )}
                </div>
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
];
const VendorContactsTable = () => {
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
interface VendorContactsModalProps {
    contactId?: number;
    vendorData: VendorData;
    onHide: () => void;
    onSuccess: () => void;
}

interface FormData {
    id?: number;
    contact_person: string;
    vendor_id : number;
    phone: string;
    mobile: string;
    email: string;
    designation: string;
}
const VendorContactsModal: React.FC<VendorContactsModalProps> = ({ contactId, vendorData, onHide, onSuccess}) => {
    const { vendorId } = useParams<Params>();
    const [custData, setUserData] = useState<FormData>({ id: 0, contact_person: '', vendor_id: vendorId, phone: '', mobile: '', email: '', designation: ''});
    const [isEditing, setIsEditing] = useState<boolean>(false);
    const [validated, setValidated] = useState<boolean>(false);
    const [loading, setLoading] = useState(false);
    useEffect(() => {

        if (contactId) {
            setIsEditing(true);
            // Fetch vendors data for editing
            axiosInstance.get(`/vendors-contacts/${contactId}`)
            .then(response => {
                setUserData(response.data);
            })
            .catch(error => console.error('Error fetching vendors data:', error));
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
        setLoading(true);
        setValidated(true);
        const apiCall = isEditing
            ? axiosInstance.put(`/vendors-contacts/${custData.id}`,  {
                contact_person: custData.contact_person,
                vendor_id: custData.vendor_id,
                phone: custData.phone,
                mobile: custData.mobile,
                email: custData.email,
                designation: custData.designation
            })
            : axiosInstance.post('/vendors-contacts', custData );

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
                    <Modal.Title>{isEditing ? 'Edit Vendor Contact' : 'Add Vendor Contact'}</Modal.Title>
                </Modal.Header>
                <Form noValidate validated={validated} onSubmit={handleSubmit}>
                    <Modal.Body>
                        <Form.Control type="hidden" name="id" value={custData.id} />
                        <Form.Control type="hidden" name="vendor_id" value={custData.vendor_id} />
                        <h5 className="mb-3"> Vendor Name : { vendorData.name }</h5>
                        <Form.Group className="mb-3" controlId="contact_person">
                            <Form.Label>Contact Person <span className="danger">*</span></Form.Label>
                            <Form.Control type="text" placeholder="Contact Person" name="contact_person" value={custData.contact_person} onChange={handleChange} required />
                            <Form.Control.Feedback type="invalid">Please enter contact person.</Form.Control.Feedback>
                        </Form.Group>
                        <Form.Group className="mb-3" controlId="phone">
                            <Form.Label>Phone <span className="danger">*</span></Form.Label>
                            <Form.Control type="text" placeholder="Phone" name="phone" value={custData.phone} onChange={handleChange} required />
                            <Form.Control.Feedback type="invalid">Please enter phone.</Form.Control.Feedback>
                        </Form.Group>
                        <Form.Group className="mb-3" controlId="mobile">
                            <Form.Label>Mobile <span className="danger">*</span></Form.Label>
                            <Form.Control type="text" placeholder="Mobile " name="mobile" value={custData.mobile} onChange={handleChange} required />
                            <Form.Control.Feedback type="invalid">Please enter mobile .</Form.Control.Feedback>
                        </Form.Group>
                        <Form.Group className="mb-3" controlId="email">
                            <Form.Label>Email <span className="danger">*</span></Form.Label>
                            <Form.Control type="text" placeholder="Email" name="email" value={custData.email} onChange={handleChange} required />
                            <Form.Control.Feedback type="invalid">Please enter email.</Form.Control.Feedback>
                        </Form.Group>
                        <Form.Group className="mb-3" controlId="designation">
                            <Form.Label>Designation <span className="danger">*</span></Form.Label>
                            <Form.Control type="text" placeholder="Designation" name="designation" value={custData.designation} onChange={handleChange} required />
                            <Form.Control.Feedback type="invalid">Please enter designation.</Form.Control.Feedback>
                        </Form.Group>
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
