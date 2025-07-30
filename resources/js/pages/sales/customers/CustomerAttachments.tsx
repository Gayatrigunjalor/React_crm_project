import { faCaretLeft, faCirclePlus, faDownload, faEdit, faTrash } from '@fortawesome/free-solid-svg-icons';
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
import { downloadFile } from '../../../helpers/utils';
import ReactSelect from '../../../components/base/ReactSelect';

interface CustomerData {
    id: number;
    name: string;
}

export interface AttachmentData {
    id: number;
    customer_id : number;
    name: string;
    attachment: { name: string };
    attachment_name: string;
    details: string;
}
const CustomerAttachments = () => {
    // Extract customerId from URL parameters
    const { customerId } = useParams();
    const [showModal, setShowModal] = useState<boolean>(false);
    const [refreshData, setRefreshData] = useState<boolean>(false);
    const [customerAttachmentTableData, setCustomerAttachmentTableData] = useState<AttachmentData[]>([]);
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
        data: customerAttachmentTableData,
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
                const response = await axiosInstance.get(`/customers/attachments/${customerId}`);
                if (response.status !== 200) {
                    throw new Error('Failed to fetch data');
                }
                const customer_data: CustomerData = await response.data.customer;
                const data: AttachmentData[] = await response.data.attachments;
                setCustomerAttachmentTableData(data);
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
                <h2 className="mb-5">Customer Attachments</h2>
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
                                Add Attachment
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
                <CustomerAttachmentsTable />
            </AdvanceTableProvider>
            {showModal && (
                <CustomerContactsModal contactId={selectedContactId} customerData={customerData} onHide={handleClose} onSuccess={handleSuccess} />
            )}
        </>
    );
};

export default CustomerAttachments;

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
            axiosInstance.delete(`/customer-attachments/${contactId}`)
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

const handleDownload = async (url: string) => {
    try {
        // Fetch the file from the server using the upload ID
        const response = await axiosInstance.get(`${url}`, {
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

const customerContactTableColumns = (handleShow: (contactId?: number) => void, handleSuccess: () => void, handleContacts: (id: number) => void): ColumnDef<AttachmentData>[] => [
    {
        accessorKey: 'attachment_name',
        header: () => {
            return (
                <div className="d-inline-flex flex-center">
                    <span>Attachment Name</span>
                </div>
            );
        },
        cell: ({ row: { original } }) => {
            const { attachment,attachment_name } = original;
            return (
                <span>{attachment ? attachment.name : ''}</span>
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
        accessorKey: 'name',
        header: () => {
            return (
                <div className="d-inline-flex flex-center">
                    <span>Attachment</span>
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
        id: 'details',
        header: () => {
            return (
                <div className="d-inline-flex flex-center">
                    <span>Details</span>
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
        accessorFn: ({ details }) => details
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
            const { id, name } = original;
            const { userPermission } = useAuth(); //check userRole & permissions
            return (
                <div className="d-flex align-items-center gap-1">
                    {userPermission.customer_attachment_edit == 1 && (
                        <Button variant='link' title='Edit Customer Attachment' onClick={() => handleShow(id)} startIcon={<FontAwesomeIcon icon={faEdit} />}></Button>
                    )}
                    {userPermission.customer_attachment_list == 1 && (
                        <Button variant='link' title='Download Attachment' className='text-success' onClick={() => handleDownload(`/getFileDownload?filepath=uploads/customer/attachments/${name}`)} startIcon={<FontAwesomeIcon icon={faDownload} />}></Button>
                    )}
                    {userPermission.customer_attachment_delete == 1 && (
                        <Button variant="link" title='Delete Customer Attachment' className='text-danger' onClick={() => handleDelete(id, handleSuccess)}>
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
const CustomerAttachmentsTable = () => {
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

interface AttachmentList {
    id: number;
    name: string;
    form_name: string;
}
interface FormData {
    id?: number;
    customer_id : number;
    attachment: AttachmentList | null;
    attachment_name: number;
    details: string;
    name: File | null;
    name_attachments?: string;
}
const CustomerContactsModal: React.FC<CustomerContactsModalProps> = ({ contactId, customerData, onHide, onSuccess}) => {
    const { customerId } = useParams();
    const [custData, setUserData] = useState<FormData>({ id: 0, customer_id: 0, attachment: null, attachment_name: 0, details: '', name: null});
    const [attachmentListData, setAttachmentListData] = useState<AttachmentList[]>([]);
    const [isEditing, setIsEditing] = useState<boolean>(false);
    const [validated, setValidated] = useState<boolean>(false);
    const [loading, setLoading] = useState(false);
    useEffect(() => {

        if (contactId) {
            setIsEditing(true);
            // Fetch attachments data for editing
            axiosInstance.get(`/customer-attachments/${contactId}`)
            .then(response => {
                setUserData(response.data);
            })
            .catch(error => console.error('Error fetching attachments data:', error));
        }
    }, [contactId]);
    useEffect(() => {
        const fetchCustomerContact = async () => {
            try {
                const response = await axiosInstance.get(`/getAttachmentByName/customer`);
                if (response.status !== 200) {
                    throw new Error('Failed to fetch data');
                }
                const data: AttachmentList[] = await response.data;
                setAttachmentListData(data);
            } catch (err: any) {
                // setError(err.data.message);
            } finally {

            }
        };

        fetchCustomerContact();
    }, []);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setUserData({ ...custData, [name]: value });
    };

    const handleVendorSelect = (selectedOption: any) => {
        if (selectedOption) {
            setUserData(prev => ({
                ...prev,
                attachment: { id: selectedOption.value, name: selectedOption.label, form_name: '' },
                attachment_name: selectedOption.value
            }));
        }
    };
    
    // Handler function for the file input change event
    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files ? event.target.files[0] : null;
        setUserData({ ...custData, name: file });
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
            ? axiosInstance.post(`/updateCustomerAttachment`, {
                ...custData,
                customer_id: customerId
            }, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            })
            : axiosInstance.post('/customer-attachments', {
                ...custData,
                customer_id: customerId
            }, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
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
                    <Modal.Title>{isEditing ? 'Edit Customer Attachments' : 'Add Customer Attachments'}</Modal.Title>
                </Modal.Header>
                <Form noValidate validated={validated} onSubmit={handleSubmit}>
                    <Modal.Body>
                        <Form.Control type="hidden" name="id" value={custData.id} />
                        <h5 className="mb-3"> Customer Name : { customerData.name }</h5>
                        <Form.Group className="mb-3" controlId="attachment_name">
                            <Form.Label>Attachment Name <span className="text-danger">*</span></Form.Label>
                            <ReactSelect
                                options= {attachmentListData.map((option: AttachmentList) => (
                                    { value: option.id, label: option.name }
                                ))}
                                placeholder="Select Attachment Name" name="attachment" value={custData.attachment ? { value: custData.attachment.id, label: custData.attachment.name } : null} onChange={(selectedOption) => handleVendorSelect(selectedOption)} 
                            />
                            <Form.Control type="hidden" name="attachment_name" value={custData.attachment_name} />
                            {validated && !custData.attachment_name && (
                                <div className="invalid-feedback d-block">Please enter Attachment Name</div>
                            )}
                        </Form.Group>
                        <Form.Group className="mb-3" controlId="details">
                            <Form.Label>Details <span className="text-danger">*</span></Form.Label>
                            <Form.Control as="textarea" rows={3} placeholder="Details" name="details" value={custData.details} onChange={handleChange} required/>
                        </Form.Group>
                        <Form.Group as={Col} controlId="warranty_card">
                            <Form.Label>Attachment <span className="text-danger">*</span></Form.Label>
                            <Form.Control type="file" name="warranty_card" onChange={handleFileChange} required={!isEditing} />
                            <Form.Control.Feedback type="invalid">Please enter attachment.</Form.Control.Feedback>
                        </Form.Group>
                        {isEditing && (<span className='text-danger'>Uploaded Attachment :- {custData.name_attachments ? custData.name_attachments : ''} </span>)}
                    </Modal.Body>
                    <Modal.Footer>
                        <Button variant="secondary" onClick={onHide}>
                            Close
                        </Button>
                        <Button variant="primary" loading={loading} loadingPosition="start" type="submit">{isEditing ? 'Update' : 'Add Attachment'}</Button>
                    </Modal.Footer>
                </Form>
            </Modal>
        </>
    );
};
