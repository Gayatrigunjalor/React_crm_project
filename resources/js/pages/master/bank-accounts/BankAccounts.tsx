import { faCirclePlus, faEdit, faTrash } from '@fortawesome/free-solid-svg-icons';
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

interface BankAccountsData {
    id: number;
    bank_name: string;
    account_holder_name: string;
    address: string;
    branch: string;
    branch_code: string;
    account_no: string;
    ifsc: string;
    city: string;
    pin_code: string;
    swift_code: string;
    ad_code: string;
    pi_preference: string;
}

const BankAccounts = () => {

    const [showModal, setShowModal] = useState<boolean>(false);
    const [refreshData, setRefreshData] = useState<boolean>(false);
    const [bankAccountsTableData, setBankAccountsTableData] = useState<BankAccountsData[]>([]);
    const [error, setError] = useState<string | null>(null);

    const [selectedBankId, setSelectedBankId] = useState<number | undefined>(undefined);
    const { userPermission } = useAuth(); //check userRole & permissions

    const handleShow = (bankId?: number) => {
        setSelectedBankId(bankId);
        setShowModal(true);
    };

    const handleClose = () => setShowModal(false);

    const handleSuccess = () => {
        // Refresh data or perform any other action after successful submission
        setRefreshData(prev => !prev); // Toggle state to trigger re-fetch
    };

    const table = useAdvanceTable({
        data: bankAccountsTableData,
        columns: bankAccountsDataTableColumns(handleShow,handleSuccess, handleSuccess),
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
        const fetchBankAccountsData = async () => {
            try {
                const response = await axiosInstance.get(`/bank-accounts`);
                if (response.status !== 200) {
                    throw new Error('Failed to fetch data');
                }
                const data: BankAccountsData[] = await response.data;
                setBankAccountsTableData(data);
            } catch (err: any) {
                setError(err.data.message);
            } finally {

            }
        };

        fetchBankAccountsData();
    }, [refreshData]);

    if (error) return <div>Error: {error}</div>;

    return (
        <>
            <h2 className="mb-5">Bank Accounts</h2>
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
                                {userPermission.bank_account_create === 1 && !error && (
                                    <Button
                                        variant="primary"
                                        className=""
                                        startIcon={<FontAwesomeIcon icon={faCirclePlus} className="me-2" />}
                                        onClick={() => handleShow()}
                                    >
                                        Add Bank Account
                                    </Button>
                                )}
                            </Col>
                        </Row>
                        <BankAccountsTable />
                    </AdvanceTableProvider>
                </Card.Body>
            </Card>
            {showModal && (
                <BankAccountsModal bankId={selectedBankId} onHide={handleClose} onSuccess={handleSuccess} />
            )}
        </>
    );
};

export default BankAccounts;

const handleDelete = (bankId: number, handleSuccess: () => void) => {
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
            axiosInstance.delete(`/bank-accounts/${bankId}`)
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
const bankAccountsDataTableColumns = (handleShow: (bankId?: number) => void, handleSuccess: () => void, handleBanks: (id: number) => void): ColumnDef<BankAccountsData>[] => [
    {
        accessorKey: 'bank_name',
        header: () => {
            return (
                <div className="d-inline-flex flex-center">
                    <span>Bank Name</span>
                </div>
            );
        },
        cell: ({ row: { original } }) => {
            const { bank_name } = original;
            return (
                <span>{bank_name}</span>
            );
        },
        meta: {
            headerProps: {
                className: 'ps-2 pe-2 border-start border-end border-translucent'
            },
            cellProps: {
                className:
                'white-space-nowrap ps-2 border-start border-end border-translucent'
            }
        }
    },
    {
        accessorKey: 'branch',
        header: () => {
            return (
                <div className="d-inline-flex flex-center">
                    <span>Branch Name</span>
                </div>
            );
        },
        cell: ({ row: { original } }) => {
            const { branch } = original;
            return (
                <span>{branch}</span>
            );
        },
        meta: {
            headerProps: {
                className: 'ps-2 pe-2 border-start border-end border-translucent'
            },
            cellProps: {
                className:
                'ps-2 border-start border-end border-translucent'
            }
        }
    },
    {
        accessorKey: 'address',
        header: () => {
            return (
                <div className="d-inline-flex flex-center">
                    <span>Bank Address</span>
                </div>
            );
        },
        cell: ({ row: { original } }) => {
            const { address } = original;
            return (
                <span>{address}</span>
            );
        },
        meta: {
            headerProps: {
                className: 'ps-2 pe-2 border-start border-end border-translucent'
            },
            cellProps: {
                className:
                'ps-2 border-start border-end border-translucent'
            }
        }
    },
    {
        accessorKey: 'city',
        header: () => {
            return (
                <div className="d-inline-flex flex-center">
                    <span>City</span>
                </div>
            );
        },
        cell: ({ row: { original } }) => {
            const { city } = original;
            return (
                <span>{city}</span>
            );
        },
        meta: {
            headerProps: {
                className: 'ps-2 pe-2 border-start border-end border-translucent'
            },
            cellProps: {
                className:
                'ps-2 border-start border-end border-translucent'
            }
        }
    },
    {
        accessorKey: 'pin_code',
        header: () => {
            return (
                <div className="d-inline-flex flex-center">
                    <span>Pin Code</span>
                </div>
            );
        },
        cell: ({ row: { original } }) => {
            const { pin_code } = original;
            return (
                <span>{pin_code}</span>
            );
        },
        meta: {
            headerProps: {
                className: 'ps-2 pe-2 border-start border-end border-translucent'
            },
            cellProps: {
                className:
                'ps-2 border-start border-end border-translucent'
            }
        }
    },
    {
        accessorKey: 'account_holder_name',
        header: () => {
            return (
                <div className="d-inline-flex flex-center">
                    <span>Account Holder Name</span>
                </div>
            );
        },
        cell: ({ row: { original } }) => {
            const { account_holder_name } = original;
            return (
                <span>{account_holder_name}</span>
            );
        },
        meta: {
            headerProps: {
                className: 'ps-2 pe-2 border-start border-end border-translucent'
            },
            cellProps: {
                className:
                'ps-2 border-start border-end border-translucent'
            }
        }
    },
    {
        accessorKey: 'account_no',
        header: () => {
            return (
                <div className="d-inline-flex flex-center">
                    <span>Account Number</span>
                </div>
            );
        },
        cell: ({ row: { original } }) => {
            const { account_no } = original;
            return (
                <span>{account_no}</span>
            );
        },
        meta: {
            headerProps: {
                className: 'ps-2 pe-2 border-start border-end border-translucent'
            },
            cellProps: {
                className:
                'ps-2 border-start border-end border-translucent'
            }
        }
    },
    {
        accessorKey: 'ifsc',
        header: () => {
            return (
                <div className="d-inline-flex flex-center">
                    <span>IFSC Code</span>
                </div>
            );
        },
        cell: ({ row: { original } }) => {
            const { ifsc } = original;
            return (
                <span>{ifsc}</span>
            );
        },
        meta: {
            headerProps: {
                className: 'ps-2 pe-2 border-start border-end border-translucent'
            },
            cellProps: {
                className:
                'ps-2 border-start border-end border-translucent'
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
                    {userPermission.bank_account_edit == 1 && (
                        <Button variant='phoenix-info' onClick={() => handleShow(id)} startIcon={<FontAwesomeIcon icon={faEdit} />}></Button>
                    )}
                    {userPermission.bank_account_delete == 1 && (
                        <Button variant="phoenix-danger" onClick={() => handleDelete(id, handleSuccess)}>
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
                'white-space-nowrap fw-semibold ps-2 pe-2 border-end border-translucent'
            }
        }
    },
];
const BankAccountsTable = () => {
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
interface BankAccountsModalProps {
    bankId?: number;
    onHide: () => void;
    onSuccess: () => void;
}

interface FormData {
    id?: number;
    bank_name: string;
    account_holder_name: string;
    address: string;
    branch: string;
    branch_code: string;
    account_no: string;
    ifsc: string;
    city: string;
    pin_code: string;
    swift_code: string;
    ad_code: string;
    pi_preference: string;
}
const BankAccountsModal: React.FC<BankAccountsModalProps> = ({ bankId, onHide, onSuccess}) => {

    const [custData, setUserData] = useState<FormData>({ id: 0, bank_name: '', account_holder_name: '', address: '', branch: '', branch_code: '', account_no: '', ifsc: '', city: '', pin_code: '', swift_code: '', ad_code: '', pi_preference: ''});
    const [isEditing, setIsEditing] = useState<boolean>(false);
    const [validated, setValidated] = useState<boolean>(false);
    useEffect(() => {

        if (bankId) {
            setIsEditing(true);
            // Fetch bankAccounts data for editing
            axiosInstance.get(`/bank-accounts/${bankId}`)
            .then(response => {
                setUserData(response.data);
            })
            .catch(error => console.error('Error fetching bankAccounts data:', error));
        }
    }, [bankId]);

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
            ? axiosInstance.put(`/bank-accounts/${custData.id}`,  {
                bank_name: custData.bank_name,
                account_holder_name: custData.account_holder_name,
                address: custData.address,
                branch: custData.branch,
                branch_code: custData.branch_code,
                account_no: custData.account_no,
                ifsc: custData.ifsc,
                city: custData.city,
                pin_code: custData.pin_code,
                swift_code: custData.swift_code,
                ad_code: custData.ad_code,
                pi_preference: custData.pi_preference
            })
            : axiosInstance.post('/bank-accounts', custData );

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
                    <Modal.Title>{isEditing ? 'Edit bank account' : 'Add bank account'}</Modal.Title>
                </Modal.Header>
                <Form noValidate validated={validated} onSubmit={handleSubmit}>
                    <Modal.Body>
                        <Form.Control type="hidden" name="id" value={custData.id} />
                        <Row className="mb-3 g-3">
                            <Form.Group as={Col} className="mb-3" controlId="bank_name">
                                <Form.Label>Bank Name <span className="text-danger">*</span></Form.Label>
                                <Form.Control type="text" placeholder="Bank Name" name="bank_name" value={custData.bank_name} onChange={handleChange} required />
                                <Form.Control.Feedback type="invalid">Please enter bank name.</Form.Control.Feedback>
                            </Form.Group>
                            <Form.Group as={Col} className="mb-3" controlId="account_holder_name">
                                <Form.Label>Account Holder Name <span className="text-danger">*</span></Form.Label>
                                <Form.Control type="text" placeholder="Account Holder Name" name="account_holder_name" value={custData.account_holder_name} onChange={handleChange} required />
                                <Form.Control.Feedback type="invalid">Please enter Account Holder name.</Form.Control.Feedback>
                            </Form.Group>
                        </Row>
                        <Row className="mb-3 g-3">
                            <Form.Group as={Col} className="mb-3" controlId="branch">
                                <Form.Label>Branch <span className="text-danger">*</span></Form.Label>
                                <Form.Control type="text" placeholder="Branch" name="branch" value={custData.branch} onChange={handleChange} required />
                                <Form.Control.Feedback type="invalid">Please enter branch.</Form.Control.Feedback>
                            </Form.Group>
                            <Form.Group as={Col} className="mb-3" controlId="branch_code">
                                <Form.Label>Branch Code <span className="text-danger">*</span></Form.Label>
                                <Form.Control type="text" placeholder="Branch code" name="branch_code" value={custData.branch_code} onChange={handleChange} required />
                                <Form.Control.Feedback type="invalid">Please enter branch code.</Form.Control.Feedback>
                            </Form.Group>
                        </Row>
                        <Row className="mb-3 g-3">
                            <Form.Group as={Col} className="mb-3" controlId="address">
                                <Form.Label>Address</Form.Label>
                                <Form.Control as="textarea" rows={3} placeholder="address" name="address" value={custData.address} onChange={handleChange}/>
                            </Form.Group>
                        </Row>
                        <Row className="mb-3 g-3">
                            <Form.Group as={Col} className="mb-3" controlId="city">
                                <Form.Label>City <span className="text-danger">*</span></Form.Label>
                                <Form.Control type="text" placeholder="City" name="city" value={custData.city} onChange={handleChange} required />
                                <Form.Control.Feedback type="invalid">Please enter city.</Form.Control.Feedback>
                            </Form.Group>
                            <Form.Group as={Col} className="mb-3" controlId="pin_code">
                                <Form.Label>Pin Code <span className="text-danger">*</span></Form.Label>
                                <Form.Control type="text" placeholder="Pin Code" name="pin_code" value={custData.pin_code} onChange={handleChange} required />
                                <Form.Control.Feedback type="invalid">Please enter Pin Code.</Form.Control.Feedback>
                            </Form.Group>
                        </Row>
                        <Row className="mb-3 g-3">
                            <Form.Group as={Col} className="mb-3" controlId="account_no">
                                <Form.Label>Account Number <span className="text-danger">*</span></Form.Label>
                                <Form.Control type="text" placeholder="Account Number" name="account_no" value={custData.account_no} onChange={handleChange} required />
                                <Form.Control.Feedback type="invalid">Please enter account number.</Form.Control.Feedback>
                            </Form.Group>
                            <Form.Group as={Col} className="mb-3" controlId="ifsc">
                                <Form.Label>IFSC <span className="text-danger">*</span></Form.Label>
                                <Form.Control type="text" placeholder="IFSC" name="ifsc" value={custData.ifsc} onChange={handleChange} required />
                                <Form.Control.Feedback type="invalid">Please enter IFSC.</Form.Control.Feedback>
                            </Form.Group>
                        </Row>
                        <Row className="mb-3 g-3">
                            <Form.Group as={Col} className="mb-3" controlId="swift_code">
                                <Form.Label>Swift Code <span className="text-danger">*</span></Form.Label>
                                <Form.Control type="text" placeholder="Swift Code" name="swift_code" value={custData.swift_code} onChange={handleChange} required />
                                <Form.Control.Feedback type="invalid">Please enter swift code.</Form.Control.Feedback>
                            </Form.Group>
                            <Form.Group as={Col} className="mb-3" controlId="ad_code">
                                <Form.Label>AD Code <span className="text-danger">*</span></Form.Label>
                                <Form.Control type="text" placeholder="AD Code" name="ad_code" value={custData.ad_code} onChange={handleChange} required />
                                <Form.Control.Feedback type="invalid">Please enter AD Code.</Form.Control.Feedback>
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
