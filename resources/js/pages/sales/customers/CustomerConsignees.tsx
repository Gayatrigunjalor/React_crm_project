import { faCirclePlus, faEdit, faTrash, faCaretLeft } from '@fortawesome/free-solid-svg-icons';
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
import { CountriesData } from './Customers';
import ReactSelect from '../../../components/base/ReactSelect';
import { useNavigate } from 'react-router-dom';

interface Params {
    customerId: number;
}

interface CustomerData {
    id: number;
    name: string;
    cust_id: string;
}

export interface ConsigneeData {
    id: number;
    name: string;
    contact_person: string;
    customer_id : number;
    mobile: string;
    email: string;
    designation: string;
    address: string;
    city: string;
    pin_code: number;
    country: number;
    state: number;
}
const CustomerConsignees = () => {
    // Extract customerId from URL parameters
    const { customerId } = useParams<Params>();
    const [showModal, setShowModal] = useState<boolean>(false);
    const [refreshData, setRefreshData] = useState<boolean>(false);
    const [customerContactTableData, setCustomerContactTableData] = useState<ConsigneeData[]>([]);
    const [customerData, setCustomerData] = useState<CustomerData>({id: 0, name: '', cust_id: '' });
    const [error, setError] = useState<string | null>(null);
    const [countriesData, setCountriesData] = useState<CountriesData[]>([]);
    const [selectedContactId, setSelectedContactId] = useState<number | undefined>(undefined);
    const { userPermission } = useAuth(); //check userRole & permissions
    const navigate = useNavigate();

    const handleCustomersList = () => {
        navigate(`/sales/customers`);
    };

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
        columns: customerContactTableColumns(handleShow,handleSuccess),
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
                const response = await axiosInstance.get(`/customers/consignees/${customerId}`);
                if (response.status !== 200) {
                    throw new Error('Failed to fetch data');
                }
                const customer_data: CustomerData = await response.data.customer;
                const data: ConsigneeData[] = await response.data.consignees;
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
    useEffect(() => {
        const fetchCountries = async () => {
            try {
                const response = await axiosInstance.get('/countryListing');
                if (response.status !== 200) {
                    throw new Error('Failed to fetch data');
                }
                const data: CountriesData[] = await response.data;
                setCountriesData(data);
            } catch (err: any) {
                setError(err.message);
            } finally {
            }
        };
    fetchCountries();
    },[]);

    if (error) return <div>Error: {error}</div>;

    return (
        <>
            <AdvanceTableProvider {...table}>
                <h2 className="mb-5">Customer Consignees</h2>
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
                        {userPermission.consignee_create === 1 && !error && (
                            <Button
                                size='sm'
                                variant="primary"
                                className=""
                                startIcon={<FontAwesomeIcon icon={faCirclePlus} className="me-2" />}
                                onClick={() => handleShow()}
                            >
                                Add Consignee
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
                <CustomerConsigneesTable />
            </AdvanceTableProvider>
            {showModal && (
                <CustomerConsigneesModal contactId={selectedContactId} customerData={customerData} countriesData={countriesData} onHide={handleClose} onSuccess={handleSuccess} />
            )}
        </>
    );
};

export default CustomerConsignees;

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
            axiosInstance.delete(`/consignees/${contactId}`)
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
const customerContactTableColumns = (handleShow: (contactId?: number) => void, handleSuccess: () => void): ColumnDef<ConsigneeData>[] => [
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
        id: 'city',
        header: () => {
            return (
                <div className="d-inline-flex flex-center">
                    <span>City</span>
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
        accessorFn: ({ city }) => city
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
                className: 'ps-2 pe-2 border-end border-translucent'
            },
            cellProps: {
                className:
                'white-space-nowrap fw-semibold ps-2 border-end border-translucent'
            }
        }
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
                    {userPermission.consignee_edit == 1 && (
                        <Button variant='link' title='Edit Customer Consignee' onClick={() => handleShow(id)} startIcon={<FontAwesomeIcon icon={faEdit} />}></Button>
                    )}
                    {userPermission.consignee_delete == 1 && (
                        <Button variant="link" title='Delete Customer Consignee' className='text-danger' onClick={() => handleDelete(id, handleSuccess)}>
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
const CustomerConsigneesTable = () => {
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
interface CustomerConsigneesModalProps {
    contactId?: number;
    customerData: CustomerData;
    countriesData: CountriesData[];
    onHide: () => void;
    onSuccess: () => void;
}

interface FormData {
    id?: number;
    name: string;
    contact_person: string;
    phone: string;
    mobile: string;
    email: string;
    designation: string;
    address: string;
    city: string;
    pin_code: string;
    country: number;
    country_name: {
        id: number;
        name: string;
    } | null;
    state: number;
    state_name: {
        id: number;
        name: string;
    } | null;
}
const CustomerConsigneesModal: React.FC<CustomerConsigneesModalProps> = ({ contactId, customerData, countriesData, onHide, onSuccess}) => {
    const { customerId } = useParams<Params>();
    const [custData, setUserData] = useState<FormData>({ id: 0, name: '', contact_person: '', phone: '', mobile: '', email: '', designation: '',address: '', city: '', pin_code: '', country: 0, country_name: null, state: 0, state_name: null});
    const [isEditing, setIsEditing] = useState<boolean>(false);
    const [validated, setValidated] = useState<boolean>(false);
    const [stateData, setStateData] = useState([]);
    const [loading, setLoading] = useState(false);
    useEffect(() => {

        if (contactId) {
            setIsEditing(true);
            // Fetch contact data for editing
            axiosInstance.get(`/consignees/${contactId}`)
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

    const handleRSelect = (selectedOption: { value: number; label: string } | null, fieldName: string) => {
        if (selectedOption) {
            if(fieldName == 'state_name') {
                setUserData({ ...custData, state_name: {
                    id: selectedOption.value,
                    name: selectedOption.label
                }, state: selectedOption.value });
            }
            if(fieldName == 'country_name') {
                setUserData({ ...custData, country_name: {
                    id: selectedOption.value,
                    name: selectedOption.label
                }, country: selectedOption.value, state_name: null, state: 0 });
                axiosInstance.get(`/getStates?country_id=${selectedOption.value}`)
                .then(response => {
                    setStateData(response.data);
                });
            }

        } else {
            setUserData({ ...custData, [fieldName]: null });
        }
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
            ? axiosInstance.put(`/consignees/${custData.id}`,  {
                name: custData.name,
                contact_person: custData.contact_person,
                customer_id: customerId,
                address: custData.address,
                city: custData.city,
                pin_code: custData.pin_code,
                mobile: custData.mobile,
                email: custData.email,
                country: custData.country,
                state: custData.state,
                designation: custData.designation
            })
            : axiosInstance.post('/consignees', {
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
                    <Modal.Title>{isEditing ? 'Edit Customer Consignee' : 'Add Customer Consignee'}</Modal.Title>
                </Modal.Header>
                <Form noValidate validated={validated} onSubmit={handleSubmit}>
                    <Modal.Body>
                        <Form.Control type="hidden" name="id" value={custData.id} />
                        <h5 className="mb-3"> Customer Name : { customerData.name } ({ customerData.cust_id })</h5>
                        <Row className="g-3">
                            <Form.Group as={Col} className="mb-3" controlId="name">
                                <Form.Label>Company Name <span className="text-danger">*</span></Form.Label>
                                <Form.Control type="text" placeholder="Name" name="name" value={custData.name} onChange={handleChange} required />
                                <Form.Control.Feedback type="invalid">Please enter name.</Form.Control.Feedback>
                            </Form.Group>
                            <Form.Group as={Col} className="mb-3" controlId="contact_person">
                                <Form.Label>Contact Person <span className="text-danger">*</span></Form.Label>
                                <Form.Control type="text" placeholder="Contact Person" name="contact_person" value={custData.contact_person} onChange={handleChange} required />
                                <Form.Control.Feedback type="invalid">Please enter contact person.</Form.Control.Feedback>
                            </Form.Group>
                        </Row>
                        <Row className="g-3">
                            <Form.Group as={Col} className="mb-3" controlId="address">
                                <Form.Label>Address</Form.Label>
                                <Form.Control as="textarea" rows={3} placeholder="address" name="address" value={custData.address} onChange={handleChange} required/>
                                <Form.Control.Feedback type="invalid">Please enter address.</Form.Control.Feedback>
                            </Form.Group>
                        </Row>
                        <Row className="g-3">
                            <Form.Group as={Col} className="mb-3" controlId="city">
                                <Form.Label>City <span className="text-danger">*</span></Form.Label>
                                <Form.Control type="text" placeholder="City" name="city" value={custData.city} onChange={handleChange} required />
                                <Form.Control.Feedback type="invalid">Please enter city.</Form.Control.Feedback>
                            </Form.Group>
                            <Form.Group as={Col} className="mb-3" controlId="pin_code">
                                <Form.Label>Pincode</Form.Label>
                                <Form.Control type="text" placeholder="Pincode" name="pin_code" value={custData.pin_code} onChange={handleChange} maxLength={6} required/>
                                <Form.Control.Feedback type="invalid">Please enter pincode.</Form.Control.Feedback>
                            </Form.Group>
                        </Row>

                        <Row className="g-3">
                            <Form.Group as={Col} className="mb-3" controlId="mobile">
                                <Form.Label>Mobile <span className="text-danger">*</span></Form.Label>
                                <Form.Control type="text" placeholder="Mobile " name="mobile" value={custData.mobile} onChange={handleChange} required />
                                <Form.Control.Feedback type="invalid">Please enter mobile .</Form.Control.Feedback>
                            </Form.Group>
                            <Form.Group as={Col} className="mb-3" controlId="email">
                                <Form.Label>Email <span className="text-danger">*</span></Form.Label>
                                <Form.Control type="text" placeholder="Email" name="email" value={custData.email} onChange={handleChange} required />
                                <Form.Control.Feedback type="invalid">Please enter email.</Form.Control.Feedback>
                            </Form.Group>
                        </Row>
                        <Row className="g-3">
                            <Form.Group as={Col} className="mb-3" controlId="country_name">
                                <Form.Label>Country <span className="text-danger">*</span></Form.Label>
                                <ReactSelect
                                    options= {countriesData.map((option: CountriesData) => (
                                        { value: option.id, label: option.name }
                                    ))}
                                    placeholder="Select Country" name="country_name" value={custData.country_name ? { value: custData.country_name.id, label: custData.country_name.name } : null} onChange={(selectedOption) => handleRSelect(selectedOption, 'country_name')} required
                                />
                                <Form.Control type="hidden" name="country" value={custData.country} />
                                {validated && !custData.country && (
                                    <div className="invalid-feedback d-block">Please enter country</div>
                                )}
                            </Form.Group>
                            <Form.Group as={Col} className="mb-3" controlId="state_name">
                                <Form.Label>State <span className="text-danger">*</span></Form.Label>
                                <ReactSelect
                                    options= {stateData.map((option: CountriesData) => (
                                        { value: option.id, label: option.name }
                                    ))}
                                    placeholder="Select Country" name="state_name" value={custData.state_name ? { value: custData.state_name.id, label: custData.state_name.name } : null} onChange={(selectedOption) => handleRSelect(selectedOption, 'state_name')} required
                                />
                                <Form.Control type="hidden" name="state" value={custData.state} />
                                {validated && !custData.state && (
                                    <div className="invalid-feedback d-block">Please enter state</div>
                                )}
                            </Form.Group>
                        </Row>
                        <Form.Group className="mb-3" controlId="designation">
                            <Form.Label>Designation <span className="text-danger">*</span></Form.Label>
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
