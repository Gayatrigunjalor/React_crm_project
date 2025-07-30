import { faCaretLeft, faCirclePlus, faDownload, faEdit, faTrash } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import Button from '../../../components/base/Button';
import React, { useEffect, useState, ChangeEvent } from 'react';
import { Card, Form, Modal, Col, Row } from 'react-bootstrap';
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

interface ProductData {
    id: number;
    product_name: string;
    product_code: string;
}

export interface AttachmentData {
    id: number;
    product_id : number;
    name: string;
    attachment: { name: string };
    attachment_name: string;
    details: string;
}
const ProductAttachments = () => {
    // Extract productId from URL parameters
    const { productId } = useParams();
    const [showModal, setShowModal] = useState<boolean>(false);
    const [refreshData, setRefreshData] = useState<boolean>(false);
    const [productAttachmentTableData, setProductAttachmentTableData] = useState<AttachmentData[]>([]);
    const [productData, setProductData] = useState<ProductData>({id: 0, product_name: '', product_code: ''});
    const [error, setError] = useState<string | null>(null);

    const [selectedContactId, setSelectedContactId] = useState<number | undefined>(undefined);
    const { userPermission } = useAuth(); //check userRole & permissions
    const navigate = useNavigate();

    const handleProductsList = () => {
        navigate(`/products`);
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
        data: productAttachmentTableData,
        columns: productContactTableColumns(handleShow,handleSuccess, handleSuccess),
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
        const fetchProductAttachments = async () => {
            try {
                const response = await axiosInstance.get(`/products/attachments/${productId}`);
                if (response.status !== 200) {
                    throw new Error('Failed to fetch data');
                }
                const product_data: ProductData = await response.data.product;
                const data: AttachmentData[] = await response.data.attachments;
                setProductAttachmentTableData(data);
                setProductData(product_data);
            } catch (err: any) {
                setError(err.data.message);
            } finally {

            }
        };

        fetchProductAttachments();
    }, [refreshData]);
    // Use productId as needed

    if (error) return <div>Error: {error}</div>;

    return (
        <>
            <h2 className="mb-5">Product Attachments</h2>
            <Card>
                <Card.Body>
                    <AdvanceTableProvider {...table}>
                        <Row className="g-3 justify-content-between mb-4">
                            <Col md="auto" className="p-2 fw-semibold">Product Name :- { productData.product_name } ({ productData.product_code })</Col>
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
                                {userPermission.product_attachment_create === 1 && !error && (
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
                                {userPermission.product_list === 1 && !error && (
                                    <Button
                                        size='sm'
                                        variant="primary"
                                        className="ms-2"
                                        startIcon={<FontAwesomeIcon icon={faCaretLeft} className="me-2" />}
                                        onClick={() => handleProductsList()}
                                        >
                                            Product List
                                    </Button>
                                )}
                            </Col>
                        </Row>
                        <ProductAttachmentsTable />
                    </AdvanceTableProvider>
                </Card.Body>
            </Card>
            {showModal && (
                <ProductContactsModal contactId={selectedContactId} productData={productData} onHide={handleClose} onSuccess={handleSuccess} />
            )}
        </>
    );
};

export default ProductAttachments;

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
            axiosInstance.delete(`/products-attachments/${contactId}`)
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

const productContactTableColumns = (handleShow: (contactId?: number) => void, handleSuccess: () => void, handleContacts: (id: number) => void): ColumnDef<AttachmentData>[] => [
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
                    {userPermission.product_attachment_edit == 1 && (
                        <Button variant='link' title='Edit Product Attachment' onClick={() => handleShow(id)} startIcon={<FontAwesomeIcon icon={faEdit} />}></Button>
                    )}
                    {userPermission.product_attachment_list == 1 && (
                        <Button variant='link' title='Download Attachment' className='text-success' onClick={() => handleDownload(`/getFileDownload?filepath=uploads/product/attachments/${name}`)} startIcon={<FontAwesomeIcon icon={faDownload} />}></Button>
                    )}
                    {userPermission.product_attachment_delete == 1 && (
                        <Button variant="link" title='Delete Product Attachment' className='text-danger' onClick={() => handleDelete(id, handleSuccess)}>
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
const ProductAttachmentsTable = () => {
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
interface ProductContactsModalProps {
    contactId?: number;
    productData: ProductData;
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
    product_id : number;
    attachment: AttachmentList | null;
    attachment_name: number;
    details: string;
    name: File | null;
    name_attachments?: string;
}
const ProductContactsModal: React.FC<ProductContactsModalProps> = ({ contactId, productData, onHide, onSuccess}) => {
    const { productId } = useParams();
    const [custData, setUserData] = useState<FormData>({ id: 0, product_id: 0, attachment: null, attachment_name: 0, details: '', name: null});
    const [attachmentListData, setAttachmentListData] = useState<AttachmentList[]>([]);
    const [isEditing, setIsEditing] = useState<boolean>(false);
    const [validated, setValidated] = useState<boolean>(false);
    const [loading, setLoading] = useState(false);
    useEffect(() => {

        if (contactId) {
            setIsEditing(true);
            // Fetch attachments data for editing
            axiosInstance.get(`/products-attachments/${contactId}`)
            .then(response => {
                setUserData(response.data);
            })
            .catch(error => console.error('Error fetching attachments data:', error));
        }
    }, [contactId]);
    useEffect(() => {
        const fetchAttachmentListing = async () => {
            try {
                const response = await axiosInstance.get(`/getAttachmentByName/Product`);
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

        fetchAttachmentListing();
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
            ? axiosInstance.post(`/updateProductAttachment`, {
                ...custData,
                product_id: productId
            }, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            })
            : axiosInstance.post('/products-attachments', {
                ...custData,
                product_id: productId
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
                    <Modal.Title>{isEditing ? 'Edit Product Attachments' : 'Add Product Attachments'}</Modal.Title>
                </Modal.Header>
                <Form noValidate validated={validated} onSubmit={handleSubmit}>
                    <Modal.Body>
                        <Form.Control type="hidden" name="id" value={custData.id} />
                        <h5 className="mb-3"> Product Name : { productData.product_name } ({ productData.product_code })</h5>
                        <Form.Group className="mb-3" controlId="attachment_name">
                            <Form.Label>Attachment Name <span className="text-danger">*</span></Form.Label>
                            <ReactSelect
                                options= {attachmentListData.map((option: AttachmentList) => (
                                    { value: option.id, label: option.name }
                                ))}
                                placeholder="Select Attachment Name" name="attachment" value={custData.attachment ? { value: custData.attachment.id, label: custData.attachment.name } : null} required onChange={(selectedOption) => handleVendorSelect(selectedOption)}
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
                        <Form.Group as={Col} controlId="name">
                            <Form.Label>Attachment <span className="text-danger">*</span></Form.Label>
                            <Form.Control type="file" name="name" onChange={handleFileChange} required={!isEditing} />
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
