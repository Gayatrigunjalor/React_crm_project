import { faCaretLeft, faCirclePlus, faEdit, faTrash } from '@fortawesome/free-solid-svg-icons';
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
import { useNavigate } from 'react-router-dom';

interface Params {
    customerId: number;
}

interface CustomerData {
    id: number;
    name: string;
}

export interface ContactData {
    id: number;
    contact_person: string;
    customer_id : number;
    phone: string;
    mobile: string;
    email: string;
    designation: string;
}
const CustomerContacts = () => {
    // Extract customerId from URL parameters
    const { customerId } = useParams();
    const [showModal, setShowModal] = useState<boolean>(false);
    const [refreshData, setRefreshData] = useState<boolean>(false);
    const [customerContactTableData, setCustomerContactTableData] = useState<ContactData[]>([]);
    const [customerData, setCustomerData] = useState<CustomerData>({id: 0, name: ''});
    const [error, setError] = useState<string | null>(null);

    const [selectedContactId, setSelectedContactId] = useState<number | undefined>(undefined);
    const { userPermission } = useAuth(); //check userRole & permissions    
    const navigate = useNavigate();

    const handleCustomersList = () => {
        navigate(`/sales/customers`);
    }


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
        data: customerContactTableData,
        columns: customerContactTableColumns(handleShow,handleSuccess, handleSuccess),
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
        const fetchCustomerContact = async () => {
            try {
                const response = await axiosInstance.get(`/customers/contacts/${customerId}`);
                if (response.status !== 200) {
                    throw new Error('Failed to fetch data');
                }
                const customer_data: CustomerData = await response.data.customer;
                const data: ContactData[] = await response.data.contacts;
                setCustomerContactTableData(data);
                setCustomerData(customer_data);
            } catch (err: any) {
                setError(err.data.message);
            } finally {

            }
        };

        fetchCustomerContact();
    }, [refreshData]);
    // Use customerId as needed

    if (error) return <div>Error: {error}</div>;

    return (
        <>
            <AdvanceTableProvider {...table}>
                <h2 className="mb-5">Customer Contact</h2>
                <Row className="g-3 justify-content-between mb-4">
                    <Col md="auto" className="p-2 fw-semibold">Customer Name :- { customerData.name }</Col>
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
                        {userPermission.contact_person_create === 1 && !error && (
                            <Button
                                size='sm'
                                variant="info"
                                className=""
                                startIcon={<FontAwesomeIcon icon={faCirclePlus} className="me-2" />}
                                onClick={() => handleShow()}
                            >
                                Add Contact Person
                            </Button>
                        )}
                        {userPermission.customer_list === 1 && !error && (
                            <Button
                                size='sm'
                                variant="primary"
                                className="ms-2"
                                startIcon={<FontAwesomeIcon icon={faCaretLeft} className="me-2" />}
                                onClick={() => handleCustomersList()}
                                >
                                    Customers List
                            </Button>
                        )}
                    </Col>
                </Row>
                <CustomerContactsTable />
            </AdvanceTableProvider>
            {showModal && (
                <CustomerContactsModal contactId={selectedContactId} customerData={customerData} onHide={handleClose} onSuccess={handleSuccess} />
            )}
        </>
    );
};

export default CustomerContacts;

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
            axiosInstance.delete(`/contact-persons/${contactId}`)
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
const customerContactTableColumns = (handleShow: (contactId?: number) => void, handleSuccess: () => void, handleContacts: (id: number) => void): ColumnDef<ContactData>[] => [
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
                    {userPermission.contact_person_edit == 1 && (
                        <Button variant='link' title='Edit Customer Contact' onClick={() => handleShow(id)} startIcon={<FontAwesomeIcon icon={faEdit} />}></Button>
                    )}
                    {userPermission.contact_person_delete == 1 && (
                        <Button variant="link" title='Delete Customer Contact' className='text-danger' onClick={() => handleDelete(id, handleSuccess)}>
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
const CustomerContactsTable = () => {
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
interface CustomerContactsModalProps {
    contactId?: number;
    customerData: CustomerData;
    onHide: () => void;
    onSuccess: () => void;
}

interface FormData {
    id?: number;
    contact_person: string;
    phone: string;
    mobile: string;
    email: string;
    designation: string;
}
const CustomerContactsModal: React.FC<CustomerContactsModalProps> = ({ contactId, customerData, onHide, onSuccess}) => {
    const { customerId } = useParams<Params>();
    const [custData, setUserData] = useState<FormData>({ id: 0, contact_person: '', phone: '', mobile: '', email: '', designation: ''});
    const [isEditing, setIsEditing] = useState<boolean>(false);
    const [validated, setValidated] = useState<boolean>(false);
    const [loading, setLoading] = useState(false);
    useEffect(() => {

        if (contactId) {
            setIsEditing(true);
            // Fetch contact data for editing
            axiosInstance.get(`/contact-persons/${contactId}`)
            .then(response => {
                setUserData(response.data);
            })
            .catch(error => console.error('Error fetching contact data:', error));
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
            ? axiosInstance.put(`/contact-persons/${custData.id}`,  {
                contact_person: custData.contact_person,
                customer_id: customerId,
                phone: custData.phone,
                mobile: custData.mobile,
                email: custData.email,
                designation: custData.designation
            })
            : axiosInstance.post('/contact-persons', {
                ...custData,
                customer_id: customerId
            });

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
                    <Modal.Title>{isEditing ? 'Edit Customer Contact' : 'Add Customer Contact'}</Modal.Title>
                </Modal.Header>
                <Form noValidate validated={validated} onSubmit={handleSubmit}>
                    <Modal.Body>
                        <Form.Control type="hidden" name="id" value={custData.id} />
                        <h5 className="mb-3"> Customer Name : { customerData.name }</h5>
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
