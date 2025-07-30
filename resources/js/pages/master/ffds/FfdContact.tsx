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
import { ColumnDef } from '@tanstack/react-table';
import AdvanceTable from '../../../components/base/AdvanceTable';
import AdvanceTableFooter from '../../../components/base/AdvanceTableFooter';
import swal from 'sweetalert';
import { useNavigate, useParams } from 'react-router-dom';

interface FfdContactData {
    id: number;
    ffd_id: number;
    phone: string;
    contact_person: string;
    designation: string;
    email: string;
}

const FfdContact = () => {
    const { ffdId } = useParams();
    const [showModal, setShowModal] = useState<boolean>(false);
    const [refreshData, setRefreshData] = useState<boolean>(false);
    const [ffdTableData, setFfdTableData] = useState<FfdContactData[]>([]);
    const [ffdName, setFfdName] = useState<string>('');
    const [error, setError] = useState<string | null>(null);

    const [selectedContactId, setSelectedContactId] = useState<number | undefined>(undefined);
    const { userPermission } = useAuth(); //check userRole & permissions

    const [countriesData, setCountriesData] = useState([]);
    const navigate = useNavigate();

    const handleShow = (contactId?: number) => {
        setSelectedContactId(contactId);
        setShowModal(true);
    };

    const handleFfdList = () => {
        navigate(`/master/ffds`)
    };

    const handleClose = () => setShowModal(false);

    const handleSuccess = () => {
        // Refresh data or perform any other action after successful submission
        setRefreshData(prev => !prev); // Toggle state to trigger re-fetch
    };

    const table = useAdvanceTable({
        data: ffdTableData,
        columns: ffdDataTableColumns(handleShow,handleSuccess),
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
        const fetchFfdData = async () => {
            try {
                const response = await axiosInstance.get(`/ffds/contacts/${ffdId}`);
                if (response.status !== 200) {
                    throw new Error('Failed to fetch data');
                }
                const data = await response.data;
                const ffdContactData: FfdContactData[] = data.ffdContact;
                setFfdTableData(ffdContactData);
                setFfdName(data.ffd.ffd_name);
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
                <h2 className="mb-5">FFD Contact</h2>
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
                        {userPermission.ffd_list === 1 && !error && (
                            <Button
                                variant="primary"
                                className="me-2"
                                startIcon={<FontAwesomeIcon icon={faCaretLeft} className="me-2" />}
                                onClick={() => handleFfdList()}
                            >
                                FFD list
                            </Button>
                        )}
                        {userPermission.ffd_contact_create === 1 && !error && (
                            <Button
                                variant="primary"
                                className=""
                                startIcon={<FontAwesomeIcon icon={faCirclePlus} className="me-2" />}
                                onClick={() => handleShow()}
                            >
                                Add FFD Contact
                            </Button>
                        )}

                    </Col>
                </Row>
                <FfdsTable />
            </AdvanceTableProvider>
            {showModal && (
                <FfdsModal contactId={selectedContactId} ffdId={ffdId} ffd_name={ffdName} onHide={handleClose} onSuccess={handleSuccess} />
            )}
        </>
    );
};

export default FfdContact;

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
            axiosInstance.delete(`/ffd-contacts/${contactId}`)
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
const ffdDataTableColumns = (handleShow: (contactId?: number) => void, handleSuccess: () => void): ColumnDef<FfdContactData>[] => [
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
        accessorKey: 'designation',
        header: () => {
            return (
                <div className="d-inline-flex flex-center">
                    <span>Designation</span>
                </div>
            );
        },
        cell: ({ row: { original } }) => {
            const { designation } = original;
            return (
                <span>{designation}</span>
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
        accessorKey: 'phone',
        header: () => {
            return (
                <div className="d-inline-flex flex-center">
                    <span>Phone</span>
                </div>
            );
        },
        cell: ({ row: { original } }) => {
            const { phone } = original;
            return (
                <span>{phone}</span>
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
        accessorKey: 'email',
        header: () => {
            return (
                <div className="d-inline-flex flex-center">
                    <span>Email</span>
                </div>
            );
        },
        cell: ({ row: { original } }) => {
            const { email } = original;
            return (
                <span>{email}</span>
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
                    {userPermission.ffd_contact_edit == 1 && (
                        <Button className='text-success' variant='link' title='Edit Contact' onClick={() => handleShow(id)} startIcon={<FontAwesomeIcon icon={faEdit} />}></Button>
                    )}
                    {userPermission.ffd_contact_delete == 1 && (
                        <Button className='text-danger' variant='link' title='Delete Contact' onClick={() => handleDelete(id, handleSuccess)}>
                            <FontAwesomeIcon icon={faTrash} />
                        </Button>
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
const FfdsTable = () => {
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
interface FfdsModalProps {
    contactId?: number;
    ffdId: number;
    ffd_name: string;
    onHide: () => void;
    onSuccess: () => void;
}

interface FormData {
    id?: number;
    ffd_id: number;
    contact_person: string;
    designation: string;
    phone: string;
    email: string;
}

const FfdsModal: React.FC<FfdsModalProps> = ({ contactId, ffdId, ffd_name, onHide, onSuccess}) => {

    const [custData, setUserData] = useState<FormData>({ id: 0, ffd_id: ffdId, contact_person: '', designation: '', phone: '', email: '' });
    const [loading, setLoading] = useState(false);
    const [isEditing, setIsEditing] = useState<boolean>(false);
    const [validated, setValidated] = useState<boolean>(false);
    useEffect(() => {

        if (contactId) {
            setIsEditing(true);
            // Fetch ffd data for editing
            axiosInstance.get(`/ffd-contacts/${contactId}`)
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
        const apiCall = isEditing
            ? axiosInstance.put(`/ffd-contacts/${custData.id}`,  {
                ffd_id: ffdId,
                contact_person: custData.contact_person,
                designation: custData.designation,
                phone: custData.phone,
                email: custData.email,
            })
            : axiosInstance.post('/ffd-contacts', custData );

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
                    <Modal.Title>{isEditing ? 'Edit FFD Contact' : 'Add FFD Contact'}</Modal.Title>
                </Modal.Header>
                <Form noValidate validated={validated} onSubmit={handleSubmit}>
                    <Modal.Body>
                        <Form.Control type="hidden" name="id" value={custData.id} />
                        <Row>
                            <Col> FFD Name : {ffd_name}</Col>
                        </Row>
                        <Row className="mb-3 g-3">
                            <Form.Group as={Col} className="mb-3" controlId="contact_person">
                                <Form.Label>Contact Person <span className="text-danger">*</span></Form.Label>
                                <Form.Control type="text" placeholder="Contact Person" name="contact_person" value={custData.contact_person} onChange={handleChange} required />
                                <Form.Control.Feedback type="invalid">Please enter contact person.</Form.Control.Feedback>
                            </Form.Group>
                            <Form.Group as={Col} className="mb-3" controlId="designation">
                                <Form.Label>Designation <span className="text-danger">*</span></Form.Label>
                                <Form.Control type="text" placeholder="Designation" name="designation" value={custData.designation} onChange={handleChange} required />
                                <Form.Control.Feedback type="invalid">Please enter designation.</Form.Control.Feedback>
                            </Form.Group>
                        </Row>
                        <Row className="mb-3 g-3">
                            <Form.Group as={Col} className="mb-3" controlId="phone">
                                <Form.Label>Phone <span className="text-danger">*</span></Form.Label>
                                <Form.Control type="text" placeholder="Phone" name="phone" value={custData.phone} onChange={handleChange} required />
                                <Form.Control.Feedback type="invalid">Please enter phone.</Form.Control.Feedback>
                            </Form.Group>
                            <Form.Group as={Col} className="mb-3" controlId="email">
                                <Form.Label>Email <span className="text-danger">*</span></Form.Label>
                                <Form.Control type="text" placeholder="Email" name="email" value={custData.email} onChange={handleChange} required />
                                <Form.Control.Feedback type="invalid">Please enter email.</Form.Control.Feedback>
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
