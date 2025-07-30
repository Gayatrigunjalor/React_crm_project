import { faBook, faCirclePlus, faEdit, faTrash } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import Button from '../../../components/base/Button';
import React, { useEffect, useState, ChangeEvent } from 'react';
import { Card, Form, Modal, Col, Row } from 'react-bootstrap';
import axiosInstance from '../../../axios';
import useAdvanceTable from '../../../hooks/useAdvanceTable';
import AdvanceTableProvider from '../../../providers/AdvanceTableProvider';
import SearchBox from '../../../components/common/SearchBox';
import { useAuth } from '../../../AuthContext';
import { ColumnDef } from '@tanstack/react-table';
import AdvanceTable from '../../../components/base/AdvanceTable';
import AdvanceTableFooter from '../../../components/base/AdvanceTableFooter';
import swal from 'sweetalert';
import { ToastContainer, toast } from "react-toastify";

interface AttachData {
    id: number;
    name: string;
    form_name: string;
}

const Attachments= () => {

    const [showModal, setShowModal] = useState<boolean>(false);
    const [refreshData, setRefreshData] = useState<boolean>(false);
    const [attachmentTableData, setAttachmentTableData] = useState<AttachData[]>([]);
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
        data: attachmentTableData,
        columns: attachDataTableColumns(handleShow,handleSuccess),
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
        const fetchAttachmentData = async () => {
            try {
                const response = await axiosInstance.get(`/attachments`);
                if (response.status !== 200) {
                    throw new Error('Failed to fetch data');
                }
                const data: AttachData[] = await response.data;
                setAttachmentTableData(data);
            } catch (err: any) {
                setError(err.data.message);
            } finally {

            }
        };

        fetchAttachmentData();
    }, [refreshData]);

    if (error) return <div>Error: {error}</div>;

    return (
        <>
            <h2 className="mb-5">Attachments</h2>
            <Card>
                <Card.Body>
                    <AdvanceTableProvider {...table}>
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
                                {userPermission.ffd_create === 1 && !error && (
                                    <Button
                                        variant="primary"
                                        className=""
                                        startIcon={<FontAwesomeIcon icon={faCirclePlus} className="me-2" />}
                                        onClick={() => handleShow()}
                                    >
                                        Add New Attachment
                                    </Button>
                                )}
                            </Col>
                        </Row>
                        <AttachmentsTable />
                    </AdvanceTableProvider>
                </Card.Body>
            </Card>
            {showModal && (
                <AttachmentModal contactId={selectedContactId} onHide={handleClose} onSuccess={handleSuccess} />
            )}
        </>
    );
};

export default Attachments

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
            axiosInstance.delete(`/attachments/${contactId}`)
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
const attachDataTableColumns = (handleShow: (contactId?: number) => void, handleSuccess: () => void): ColumnDef<AttachData>[] => [
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
                className: 'ps-2 pe-2 border-start border-end border-translucent'
            },
            cellProps: {
                className:
                'white-space-nowrap fw-semibold ps-2 border-start border-end border-translucent'
            }
        }
    },

    {
        accessorKey: 'form_name',
        header: () => {
            return (
                <div className="d-inline-flex flex-center">
                    <span>Form Name</span>
                </div>
            );
        },
        cell: ({ row: { original } }) => {
            const { form_name } = original;
            return (
                <span>{form_name}</span>
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
                    {userPermission.ffd_edit == 1 && (
                        <Button className='text-success' variant='link' onClick={() => handleShow(id)} startIcon={<FontAwesomeIcon icon={faEdit} />}></Button>
                    )}
                    {userPermission.ffd_delete == 1 && (
                        <Button className='text-danger' variant='link' onClick={() => handleDelete(id, handleSuccess)}>
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
const AttachmentsTable = () => {
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
    onHide: () => void;
    onSuccess: () => void;
}

interface FormData {
    id?: number;
    name: string;
    form_name: string;
}

const AttachmentModal: React.FC<FfdsModalProps> = ({ contactId, onHide, onSuccess}) => {

    const [custData, setUserData] = useState<FormData>({ id: 0, name: '', form_name: '0' });
    const [loading, setLoading] = useState(false);
    const [isEditing, setIsEditing] = useState<boolean>(false);
    const [validated, setValidated] = useState<boolean>(false);
    useEffect(() => {

        if (contactId) {
            setIsEditing(true);
            // Fetch ffd data for editing
            axiosInstance.get(`/attachments/${contactId}`)
            .then(response => {
                setUserData(response.data);
            })
            .catch(error => console.error('Error fetching ffd data:', error));
        }
    }, [contactId]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setUserData({ ...custData, [name]: value });
    };

    const handleSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
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
        if(custData.form_name == '0') {
            setValidated(false);
            toast('Select form name');
            return;
        }
        setValidated(true);
        setLoading(true);
        const apiCall = isEditing
            ? axiosInstance.put(`/attachments/${custData.id}`,  {
                name: custData.name,
                form_name: custData.form_name
            })
            : axiosInstance.post('/attachments', custData );

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
                    <Modal.Title>{isEditing ? 'Edit FFD' : 'Add FFD'}</Modal.Title>
                </Modal.Header>
                <Form noValidate validated={validated} onSubmit={handleSubmit}>
                    <Modal.Body>
                        <Form.Control type="hidden" name="id" value={custData.id} />
                        <Row className="mb-3 g-3">
                            <Form.Group as={Col} className="mb-3" controlId="ffd_name">
                                <Form.Label>Name <span className="text-danger">*</span></Form.Label>
                                <Form.Control type="text" placeholder="Name" name="name" value={custData.name} onChange={handleChange} required />
                                <Form.Control.Feedback type="invalid">Please enter name.</Form.Control.Feedback>
                            </Form.Group>
                        </Row>
                        <Row className="mb-3 g-3">
                            <Form.Group as={Col} className="mb-3" controlId="form_name">
                                <Form.Label>Form Name </Form.Label>
                                <Form.Select name="form_name" value={custData.form_name} onChange={handleSelectChange} required>
                                    <option value="0">Select Form Name</option>
                                    <option value="Employee">Employee</option>
                                    <option value="Customer">Customer</option>
                                    <option value="Vendor">Vendor</option>
                                    <option value="Product">Product</option>
                                    <option value="Recruitment">Recruitment</option>
                                    <option value="Procurement">Procurement</option>
                                </Form.Select>
                                <Form.Control.Feedback type="invalid">Please enter form name.</Form.Control.Feedback>
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
            <ToastContainer className='py-0' />
        </>
    );
};
