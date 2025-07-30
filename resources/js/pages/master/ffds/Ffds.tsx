import { faBook, faCirclePlus, faEdit, faTrash } from '@fortawesome/free-solid-svg-icons';
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
import { useNavigate } from 'react-router-dom';

interface FfdData {
    id: number;
    ffd_name: string;
    ffd_type: string;
}

const Ffds = () => {

    const [showModal, setShowModal] = useState<boolean>(false);
    const [refreshData, setRefreshData] = useState<boolean>(false);
    const [ffdTableData, setFfdTableData] = useState<FfdData[]>([]);
    const [error, setError] = useState<string | null>(null);

    const [selectedContactId, setSelectedContactId] = useState<number | undefined>(undefined);
    const { userPermission } = useAuth(); //check userRole & permissions

    const [countriesData, setCountriesData] = useState([]);
    const navigate = useNavigate();

    const handleShow = (contactId?: number) => {
        setSelectedContactId(contactId);
        setShowModal(true);
    };

    const handleContacts = (ffdId: number) => {
        navigate(`/master/ffds/contacts/${ffdId}`)
    };

    const handleClose = () => setShowModal(false);

    const handleSuccess = () => {
        // Refresh data or perform any other action after successful submission
        setRefreshData(prev => !prev); // Toggle state to trigger re-fetch
    };

    const table = useAdvanceTable({
        data: ffdTableData,
        columns: ffdDataTableColumns(handleShow,handleSuccess, handleContacts),
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
                const response = await axiosInstance.get(`/ffds`);
                if (response.status !== 200) {
                    throw new Error('Failed to fetch data');
                }
                const data: FfdData[] = await response.data;
                setFfdTableData(data);
            } catch (err: any) {
                setError(err.data.message);
            } finally {

            }
        };

        fetchFfdData();
    }, [refreshData]);
    useEffect(() => {
        const fetchCountries = async () => {
            try {
                const response = await axiosInstance.get('/countryListing');
                if (response.status !== 200) {
                    throw new Error('Failed to fetch data');
                }
                const data = await response.data;
                setCountriesData(data);
            } catch (err: any) {
                setError(err.message);
            } finally {
            }
        };
        fetchCountries();
    }, []);

    if (error) return <div>Error: {error}</div>;

    return (
        <>
            <AdvanceTableProvider {...table}>
                <h2 className="mb-5">FFDs</h2>
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
                                Add FFD
                            </Button>
                        )}
                    </Col>
                </Row>
                <FfdsTable />
            </AdvanceTableProvider>
            {showModal && (
                <FfdsModal contactId={selectedContactId} countriesData={countriesData} onHide={handleClose} onSuccess={handleSuccess} />
            )}
        </>
    );
};

export default Ffds;

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
            axiosInstance.delete(`/ffds/${contactId}`)
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
const ffdDataTableColumns = (handleShow: (contactId?: number) => void, handleSuccess: () => void, handleContacts: (id: number) => void): ColumnDef<FfdData>[] => [
    {
        accessorKey: 'ffd_name',
        header: () => {
            return (
                <div className="d-inline-flex flex-center">
                    <span>FFD Name</span>
                </div>
            );
        },
        cell: ({ row: { original } }) => {
            const { ffd_name } = original;
            return (
                <span>{ffd_name}</span>
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
        accessorKey: 'ffd_type',
        header: () => {
            return (
                <div className="d-inline-flex flex-center">
                    <span>FFD Type</span>
                </div>
            );
        },
        cell: ({ row: { original } }) => {
            const { ffd_type } = original;
            return (
                <span>{ffd_type}</span>
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
                    {userPermission.ffd_contact_list == 1 && (
                        <Button className='text-info' variant='link' title="Contacts" onClick={() => handleContacts(id)} startIcon={<FontAwesomeIcon icon={faBook} />}></Button>
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
    countriesData: CountryData[];
    onHide: () => void;
    onSuccess: () => void;
}

interface FormData {
    id?: number;
    ffd_name: string;
    ffd_type: string;
    ffd_relation: string;
    address: string;
    country_id: number | null;
    state_id: number | null;
    city: string;
    pin_code: string;
    website: string;
}
export interface CountryData {
    id: number;
    name: string;
    sortname: string;
    phonecode: number;
}

export interface StateData {
    id: number;
    name: string;
    country_id: number;
}
const FfdsModal: React.FC<FfdsModalProps> = ({ contactId, countriesData, onHide, onSuccess}) => {

    const [custData, setUserData] = useState<FormData>({ id: 0, ffd_name: '', ffd_type: 'Domestic', ffd_relation: 'Good', address: '', country_id: null, state_id: null, city: '', pin_code: '', website: ''});
    const [stateData, setStateData] = useState([]);
    const [isEditing, setIsEditing] = useState<boolean>(false);
    const [validated, setValidated] = useState<boolean>(false);
    useEffect(() => {

        if (contactId) {
            setIsEditing(true);
            // Fetch ffd data for editing
            axiosInstance.get(`/ffds/${contactId}`)
            .then(response => {
                setUserData(response.data);
                if(response.data.country_id !== null && response.data.state_id !== null ) {
                    axiosInstance.get(`/getStates?country_id=${response.data.country_id}`)
                    .then(state_resp => {
                        setStateData(state_resp.data);
                    });
                }
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
        if(name == 'country_id' && value != ""){
            axiosInstance.get(`/getStates?country_id=${value}`)
            .then(response => {
                setStateData(response.data);
            });
        }
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
            ? axiosInstance.put(`/ffds/${custData.id}`,  {
                ffd_name: custData.ffd_name,
                ffd_type: custData.ffd_type,
                ffd_relation: custData.ffd_relation,
                address: custData.address,
                country_id: custData.country_id,
                state_id: custData.state_id,
                city: custData.city,
                pin_code: custData.pin_code,
                website: custData.website,
            })
            : axiosInstance.post('/ffds', custData );

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
                    <Modal.Title>{isEditing ? 'Edit FFD' : 'Add FFD'}</Modal.Title>
                </Modal.Header>
                <Form noValidate validated={validated} onSubmit={handleSubmit}>
                    <Modal.Body>
                        <Form.Control type="hidden" name="id" value={custData.id} />
                        <Row className="mb-3 g-3">
                            <Form.Group as={Col} className="mb-3" controlId="ffd_name">
                                <Form.Label>FFD Name <span className="text-danger">*</span></Form.Label>
                                <Form.Control type="text" placeholder="FFD Name" name="ffd_name" value={custData.ffd_name} onChange={handleChange} required />
                                <Form.Control.Feedback type="invalid">Please enter FFD name.</Form.Control.Feedback>
                            </Form.Group>
                            <Form.Group as={Col} className="mb-3" controlId="ffd_type">
                                <Form.Label>FFD Type </Form.Label>
                                <Form.Select name="ffd_type" value={custData.ffd_type} onChange={handleSelectChange}>
                                    <option value="Domestic">Domestic</option>
                                    <option value="International">International</option>
                                    <option value="Both">Both</option>
                                </Form.Select>
                                <Form.Control.Feedback type="invalid">Please enter FFD Type</Form.Control.Feedback>
                            </Form.Group>
                            <Form.Group as={Col} className="mb-3" controlId="ffd_relation">
                                <Form.Label>FFD Relation </Form.Label>
                                <Form.Select name="ffd_relation" value={custData.ffd_relation} onChange={handleSelectChange}>
                                    <option value="Good">Good</option>
                                    <option value="Black Listed">Black Listed</option>
                                </Form.Select>
                                <Form.Control.Feedback type="invalid">Please enter FFD Relation</Form.Control.Feedback>
                            </Form.Group>
                        </Row>
                        <Row className="mb-3 g-3">
                            <Form.Group as={Col} className="mb-3" controlId="address">
                                <Form.Label>Address</Form.Label>
                                <Form.Control as="textarea" rows={3} placeholder="address" name="address" value={custData.address} onChange={handleChange}/>
                            </Form.Group>
                        </Row>
                        <Row className="mb-3 g-3">
                            <Form.Group as={Col} className="mb-3" controlId="country_id">
                                <Form.Label>Country </Form.Label>
                                <Form.Select name="country_id" value={custData.country_id ? custData.country_id : null} onChange={handleSelectChange}>
                                    <option>Select Country</option>
                                    {countriesData.map((option: CountryData) => (
                                        <option key={option.id} value={option.id}>
                                            {option.name}
                                        </option>))}
                                </Form.Select>
                                <Form.Control.Feedback type="invalid">Please enter country</Form.Control.Feedback>
                            </Form.Group>
                            <Form.Group as={Col} className="mb-3" controlId="state_id">
                                <Form.Label>State </Form.Label>
                                <Form.Select name="state_id" value={custData.state_id ? custData.state_id : null} onChange={handleSelectChange}>
                                    <option>Select State</option>
                                    {stateData.map((option: StateData) => (
                                        <option key={option.id} value={option.id}>
                                            {option.name}
                                        </option>))}
                                </Form.Select>
                                <Form.Control.Feedback type="invalid">Please enter state</Form.Control.Feedback>
                            </Form.Group>
                            <Form.Group as={Col} className="mb-3" controlId="city">
                                <Form.Label>City</Form.Label>
                                <Form.Control type="text" placeholder="City" name="city" value={custData.city ? custData.city : ''} onChange={handleChange} />
                                <Form.Control.Feedback type="invalid">Please enter city</Form.Control.Feedback>
                            </Form.Group>
                        </Row>
                        <Row className="mb-3 g-3">
                            <Form.Group as={Col} className="mb-3" controlId="pin_code">
                                <Form.Label>Pin Code</Form.Label>
                                <Form.Control type="text" placeholder="Pincode" name="pin_code" value={custData.pin_code} onChange={handleChange} />
                                <Form.Control.Feedback type="invalid">Please enter pincode.</Form.Control.Feedback>
                            </Form.Group>
                            <Form.Group as={Col} className="mb-3" controlId="website">
                                <Form.Label>Website</Form.Label>
                                <Form.Control type="text" placeholder="Website" name="website" value={custData.website ? custData.website : ''} onChange={handleChange} />
                                <Form.Control.Feedback type="invalid">Please enter website.</Form.Control.Feedback>
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
