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
import { ColumnDef } from '@tanstack/react-table';
import AdvanceTable from '../../../components/base/AdvanceTable';
import AdvanceTableFooter from '../../../components/base/AdvanceTableFooter';
import swal from 'sweetalert';

interface CurrencyData {
    id: number;
    name: string;
    symbol: string;
}

const Currency = () => {

    const [showModal, setShowModal] = useState<boolean>(false);
    const [refreshData, setRefreshData] = useState<boolean>(false);
    const [currencyTableData, setCurrencyTableData] = useState<CurrencyData[]>([]);
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
        data: currencyTableData,
        columns: currencyDataTableColumns(handleShow,handleSuccess, handleSuccess),
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
        const fetchCurrencyData = async () => {
            try {
                const response = await axiosInstance.get(`/currency`);
                if (response.status !== 200) {
                    throw new Error('Failed to fetch data');
                }
                const data: CurrencyData[] = await response.data;
                setCurrencyTableData(data);
            } catch (err: any) {
                setError(err.data.message);
            } finally {

            }
        };

        fetchCurrencyData();
    }, [refreshData]);

    if (error) return <div>Error: {error}</div>;

    return (
        <>
            <AdvanceTableProvider {...table}>
                <h2 className="mb-5">Currency</h2>
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
                        {userPermission.currency_create === 1 && !error && (
                            <Button
                                variant="primary"
                                className=""
                                startIcon={<FontAwesomeIcon icon={faCirclePlus} className="me-2" />}
                                onClick={() => handleShow()}
                            >
                                Add Currency
                            </Button>
                        )}
                    </Col>
                </Row>
                <CurrencyTable />
            </AdvanceTableProvider>
            {showModal && (
                <CurrencyModal contactId={selectedContactId} onHide={handleClose} onSuccess={handleSuccess} />
            )}
        </>
    );
};

export default Currency;

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
            axiosInstance.delete(`/currency/${contactId}`)
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
const currencyDataTableColumns = (handleShow: (contactId?: number) => void, handleSuccess: () => void, handleContacts: (id: number) => void): ColumnDef<CurrencyData>[] => [
    {
        accessorKey: 'name',
        header: () => {
            return (
                <div className="d-inline-flex flex-center">
                    <span>Currency</span>
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
        accessorKey: 'symbol',
        header: () => {
            return (
                <div className="d-inline-flex flex-center">
                    <span>Currency Symbol</span>
                </div>
            );
        },
        cell: ({ row: { original } }) => {
            const { symbol } = original;
            return (
                <span>{symbol}</span>
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
                    {userPermission.currency_edit == 1 && (
                        <Button variant='phoenix-info' onClick={() => handleShow(id)} startIcon={<FontAwesomeIcon icon={faEdit} />}></Button>
                    )}
                    {userPermission.currency_delete == 1 && (
                        <Button variant="phoenix-danger" onClick={() => handleDelete(id, handleSuccess)}>
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
const CurrencyTable = () => {
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
interface CurrencyModalProps {
    contactId?: number;
    onHide: () => void;
    onSuccess: () => void;
}

interface FormData {
    id?: number;
    name: string;
    symbol: string;
}

const CurrencyModal: React.FC<CurrencyModalProps> = ({ contactId, onHide, onSuccess}) => {
    const [custData, setUserData] = useState<FormData>({ id: 0, name: '', symbol: ''});
    const [isEditing, setIsEditing] = useState<boolean>(false);
    const [validated, setValidated] = useState<boolean>(false);
    useEffect(() => {

        if (contactId) {
            setIsEditing(true);
            // Fetch currency data for editing
            axiosInstance.get(`/currency/${contactId}`)
            .then(response => {
                setUserData(response.data);
            })
            .catch(error => console.error('Error fetching currency data:', error));
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
        }

        setValidated(true);
        const apiCall = isEditing
            ? axiosInstance.put(`/currency/${custData.id}`,  {
                name: custData.name,
                symbol: custData.symbol
            })
            : axiosInstance.post('/currency', custData );

        apiCall
            .then((response) => {
                swal("Success!", response.data.message, "success");
            onSuccess();
            onHide();
        })
        .catch(error => swal("Error!", error.data.message, "error"));
    };
    return (
        <>
            <Modal show onHide={onHide} size="lg" backdrop="static" keyboard={false}>
                <Modal.Header closeButton>
                    <Modal.Title>{isEditing ? 'Edit Currency' : 'Add Currency'}</Modal.Title>
                </Modal.Header>
                <Form noValidate validated={validated} onSubmit={handleSubmit}>
                    <Modal.Body>
                        <Form.Control type="hidden" name="id" value={custData.id} />
                        <Row className="mb-3 g-3">
                            <Form.Group as={Col} className="mb-3" controlId="name">
                                <Form.Label>Currency Name <span className="text-danger">*</span></Form.Label>
                                <Form.Control type="text" placeholder="Currency name" name="name" value={custData.name} onChange={handleChange} required />
                                <Form.Control.Feedback type="invalid">Please enter currency name.</Form.Control.Feedback>
                            </Form.Group>
                            <Form.Group as={Col} className="mb-3" controlId="symbol">
                                <Form.Label>Currency Symbol <span className="text-danger">*</span></Form.Label>
                                <Form.Control type="text" placeholder="Currency symbol" name="symbol" value={custData.symbol} onChange={handleChange} required />
                                <Form.Control.Feedback type="invalid">Please enter currency symbol.</Form.Control.Feedback>
                            </Form.Group>

                        </Row>
                    </Modal.Body>
                    <Modal.Footer>
                        <Button variant="secondary" onClick={onHide}>
                            Close
                        </Button>
                        <Button variant="primary" type="submit">{isEditing ? 'Update' : 'Add'}</Button>
                    </Modal.Footer>
                </Form>
            </Modal>
        </>
    );
};
