import React, { useEffect, useState, ChangeEvent } from 'react';
import { useParams } from 'react-router-dom';
import { Card, Form, Modal, Col, Row, Nav, Tab, ListGroup } from 'react-bootstrap';
import { faCirclePlus, faEdit, faTrash } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import Button from '../../../components/base/Button';
import axiosInstance from '../../../axios';
import { ColumnDef } from '@tanstack/react-table';
import SearchBox from '../../../components/common/SearchBox';
import useAdvanceTable from '../../../hooks/useAdvanceTable';
import AdvanceTableProvider from '../../../providers/AdvanceTableProvider';
import AdvanceTable from '../../../components/base/AdvanceTable';
import AdvanceTableFooter from '../../../components/base/AdvanceTableFooter';
import swal from 'sweetalert';
import { useAuth } from '../../../AuthContext';
import { useNavigate } from 'react-router-dom';
import ReactSelect from '../../../components/base/ReactSelect';



interface FFDData{
    id: number;
    ffd_name: string;
}

interface PreExportFreightData {
    id: number;
    business_task_id: number;
    ffd_id: number;
    ffd_name: FFDData | null;
    freight_agent: string;
    pick_up_location: string;
    delivery_location: string;
    quoting_price: string;
    rate_contract_price: string;
    contact_person_name: string;
    contact_person_email: string;
    contact_person_phone: string;
    budget: string;
    freight_cost_invoice: string | null;
    tender_status: string;
    vessel_airline_name: string | null;
    vessel_airline_date: string | null;
}

const PreExportFreight = ({btId}) => {
    const [refreshData, setRefreshData] = useState<boolean>(false);
    const [preOngoingData, setPreOngoingData] = useState<PreExportFreightData[]>([]);
    const [ffdData, setFfdData] = useState<FFDData[]>([]);
    const [preId, setPurchaseId] = useState<number | undefined>(undefined);
    const [showModal, setShowModal] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    useEffect(() => {
        const fetchFreightData = async () => {
            try {
                const response = await axiosInstance.get(`/getFreightcostSourcingBt/${btId}`);
                if (response.status !== 200) {
                    throw new Error('Failed to fetch data');
                }
                const quotation_data: PreExportFreightData[] = await response.data;
                setPreOngoingData(quotation_data);
            } catch (err: any) {
                setError(err.data.message);
            }
        };
        fetchFreightData();
    }, [refreshData]);
    useEffect(() => {
        const fetchPurchaseDeptData = async() => {
            try {
                const response = await axiosInstance.get(`/ffds`);
                if (response.status !== 200) {
                    throw new Error('Failed to fetch data');
                }
                const data: FFDData[] = await response.data;
                setFfdData(data);
            } catch (err: any) {
                setError(err.data.message);
            }
        };
        fetchPurchaseDeptData();
    }, []);

    const handleModal = (preId?: number) => {
        setPurchaseId(preId);
        setShowModal(true);
    };
    const freightTable = useAdvanceTable({
        data: preOngoingData,
        columns: freightTableColumns(handleModal),
        pageSize: 10,
        pagination: true,
        sortable: true,
        selection: false,
        initialState: {
            columnVisibility: {

            }
        }
    });

    const handleClose = () => {
        setShowModal(false)
    };

    const handleSuccess = () => {
        // Refresh data or perform any other action after successful submission
        setRefreshData(prev => !prev); // Toggle state to trigger re-fetch
    };

    return (
        <>
            <Button
                variant="info"
                className="btn-sm"
                startIcon={<FontAwesomeIcon icon={faCirclePlus} className="me-2" />}
                onClick={() => handleModal()}
            >
                Add Freight Details
            </Button>
            <Row className='mt-2 pb-4'>
                <AdvanceTableProvider {...freightTable}>
                    <FreightSourcingTable />
                </AdvanceTableProvider>
            </Row>
            {showModal && (
                <FreightModal btId={btId} preId={preId} ffdData={ffdData} onHide={handleClose} onSuccess={handleSuccess} />
            )}
        </>
    )
};

export default PreExportFreight;



const freightTableColumns = (handleModal: (preId?: number) => void): ColumnDef<PreExportFreightData>[] => [
    {
        accessorKey: 'ffd_id',
        header: () => {
            return (
                <div className="d-inline-flex flex-center">
                    <span>Freight Agent</span>
                </div>
            );
        },
        cell: ({ row: { original } }) => {
            const { ffd_id,ffd_name,freight_agent } = original;

            return (
                <span>{ffd_name ? ffd_name.ffd_name : freight_agent}</span>
            );
        },
        meta: {
            headerProps: {
                style: { width: '15%' },
                className: 'ps-2 pe-2 border-start border-end border-translucent'
            },
            cellProps: {
                className:
                'white-space-nowrap fw-semibold ps-2 border-start border-end border-translucent'
            }
        }
    },
    {
        accessorKey: 'pick_up_location',
        header: () => {
            return (
                <div className="d-inline-flex flex-center">
                    <span>Pickup Location</span>
                </div>
            );
        },
        cell: ({ row: { original } }) => {
            const { pick_up_location } = original;
            return (
                <span>{pick_up_location}</span>
            );
        },
        meta: {
            headerProps: {
                style: { width: '15%' },
                className: 'ps-2 pe-2 border-start border-end border-translucent'
            },
            cellProps: {
                className:
                'ps-2 border-start border-end border-translucent'
            }
        }
    },
    {
        accessorKey: 'delivery_location',
        header: () => {
            return (
                <div className="d-inline-flex flex-center">
                    <span>Delivery Location</span>
                </div>
            );
        },
        cell: ({ row: { original } }) => {
            const { delivery_location } = original;
            return (
                <span>{delivery_location}</span>
            );
        },
        meta: {
            headerProps: {
                style: { width: '15%' },
                className: 'ps-2 pe-2 border-start border-end border-translucent'
            },
            cellProps: {
                className:
                'ps-2 border-start border-end border-translucent'
            }
        }
    },
    {
        accessorKey: 'quoting_price',
        header: () => {
            return (
                <div className="d-inline-flex flex-center">
                    <span>Quoting Price</span>
                </div>
            );
        },
        cell: ({ row: { original } }) => {
            const { quoting_price } = original;
            return (
                <span>{quoting_price}</span>
            );
        },
        meta: {
            headerProps: {
                style: { width: '15%' },
                className: 'ps-2 pe-2 border-start border-end border-translucent'
            },
            cellProps: {
                className:
                'ps-2 border-start border-end border-translucent'
            }
        }
    },
    {
        accessorKey: 'contact_person_name',
        header: () => {
            return (
                <div className="d-inline-flex flex-center">
                    <span>Contact Person Name</span>
                </div>
            );
        },
        cell: ({ row: { original } }) => {
            const { contact_person_name } = original;
            return (
                <span>{contact_person_name}</span>
            );
        },
        meta: {
            headerProps: {
                style: { width: '15%' },
                className: 'ps-2 pe-2 border-start border-end border-translucent'
            },
            cellProps: {
                className:
                'ps-2 border-start border-end border-translucent'
            }
        }
    },
    {
        accessorKey: 'contact_person_email',
        header: () => {
            return (
                <div className="d-inline-flex flex-center">
                    <span>Contact Email</span>
                </div>
            );
        },
        cell: ({ row: { original } }) => {
            const { contact_person_email } = original;
            return (
                <span>{contact_person_email}</span>
            );
        },
        meta: {
            headerProps: {
                style: { width: '15%' },
                className: 'ps-2 pe-2 border-start border-end border-translucent'
            },
            cellProps: {
                className:
                'ps-2 border-start border-end border-translucent'
            }
        }
    },
    {
        accessorKey: 'contact_person_phone',
        header: () => {
            return (
                <div className="d-inline-flex flex-center">
                    <span>Phone Number</span>
                </div>
            );
        },
        cell: ({ row: { original } }) => {
            const { contact_person_phone } = original;
            return (
                <span>{contact_person_phone}</span>
            );
        },
        meta: {
            headerProps: {
                style: { width: '15%' },
                className: 'ps-2 pe-2 border-start border-end border-translucent'
            },
            cellProps: {
                className:
                'ps-2 border-start border-end border-translucent'
            }
        }
    },
    {
        accessorKey: 'tender_status',
        header: () => {
            return (
                <div className="d-inline-flex flex-center">
                    <span>FFD Tender Status</span>
                </div>
            );
        },
        cell: ({ row: { original } }) => {
            const { tender_status } = original;
            return (
                <span>{tender_status}</span>
            );
        },
        meta: {
            headerProps: {
                style: { width: '15%' },
                className: 'ps-2 pe-2 border-start border-end border-translucent'
            },
            cellProps: {
                className:
                'ps-2 border-start border-end border-translucent'
            }
        }
    },
    {
        accessorKey: 'vessel_airline_name',
        header: () => {
            return (
                <div className="d-inline-flex flex-center">
                    <span>Vessel/Airline Name</span>
                </div>
            );
        },
        cell: ({ row: { original } }) => {
            const { vessel_airline_name } = original;
            return (
                <span>{vessel_airline_name}</span>
            );
        },
        meta: {
            headerProps: {
                style: { width: '15%' },
                className: 'ps-2 pe-2 border-start border-end border-translucent'
            },
            cellProps: {
                className:
                'ps-2 border-start border-end border-translucent'
            }
        }
    },
    {
        accessorKey: 'vessel_airline_date',
        header: () => {
            return (
                <div className="d-inline-flex flex-center">
                    <span>Vessel/Airline Date</span>
                </div>
            );
        },
        cell: ({ row: { original } }) => {
            const { vessel_airline_date } = original;
            return (
                <span>{vessel_airline_date}</span>
            );
        },
        meta: {
            headerProps: {
                style: { width: '15%' },
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
                <><Button variant='link' title='Edit freight details' onClick={() => handleModal(id)} startIcon={<FontAwesomeIcon icon={faEdit} />}></Button></>
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
];
const FreightSourcingTable = () => {
    return (
        <div className="border-top border-translucent">
            <AdvanceTable
                tableProps={{ className: 'phoenix-table fs-9' }}
                rowClassName="hover-actions-trigger btn-reveal-trigger"
            />
        </div>
    );
};

interface FreightModalProps {
    btId: number;
    preId?: number;
    ffdData: FFDData[];
    onHide: () => void;
    onSuccess: () => void;
}
const FreightModal: React.FC<FreightModalProps> = ({ btId, preId, ffdData, onHide, onSuccess}) => {
    const [custData, setUserData] = useState<PreExportFreightData>({ id: 0, business_task_id: btId,
        ffd_id: 0,
        ffd_name: null,
        freight_agent: '',
        pick_up_location: '',
        delivery_location: '',
        quoting_price: '',
        rate_contract_price: '',
        contact_person_name: '',
        contact_person_email: '',
        contact_person_phone: '',
        budget: '',
        freight_cost_invoice: null,
        tender_status: 'Bidder',
        vessel_airline_name: '',
        vessel_airline_date: ''
    });
    const [isEditing, setIsEditing] = useState<boolean>(false);
    const [validated, setValidated] = useState<boolean>(false);
    const [loading, setLoading] = useState(false);
    useEffect(() => {

        if (preId) {
            setIsEditing(true);
            // Fetch freight data for editing
            axiosInstance.get(`/editFreightcostSourcingBt/${preId}`)
            .then(response => {
                setUserData(response.data);
            })
            .catch(error => console.error('Error fetching freight data:', error));
        }
    }, [preId]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;

        // Update purchase price
        const updatedCustData = { ...custData, [name]: value };

        setUserData(updatedCustData);
    };

    const handleSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const { name, value } = e.target;
        setUserData({ ...custData, [name]: value });
    };

    const handleFfdSelect = (selectedOption: any) => {
        if (selectedOption) {
            setUserData(prev => ({
                ...prev,
                ffd_name: { id: selectedOption.value, ffd_name: selectedOption.label },
                ffd_id: selectedOption.value
            }));
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
            ? axiosInstance.post(`/updateFreightcostSourcingBt/${custData.id}`,  {
                business_task_id: btId,
                ffd_id: custData.ffd_id,
                freight_agent: custData.freight_agent,
                pick_up_location: custData.pick_up_location,
                delivery_location: custData.delivery_location,
                quoting_price: custData.quoting_price,
                rate_contract_price: custData.rate_contract_price,
                contact_person_name: custData.contact_person_name,
                contact_person_email: custData.contact_person_email,
                contact_person_phone: custData.contact_person_phone,
                budget: custData.budget,
                // freight_cost_invoice: custData.freight_cost_invoice,
                tender_status: custData.tender_status,
                vessel_airline_name: custData.vessel_airline_name,
                vessel_airline_date: custData.vessel_airline_date,
            })
            : axiosInstance.post('/storeFreightcostSourcingBt', custData );

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
            <Modal show onHide={onHide} size="xl" backdrop="static" keyboard={false}>
                <Modal.Header closeButton>
                    <Modal.Title>{isEditing ? 'Edit Freight Details' : 'Add Freight Details'}</Modal.Title>
                </Modal.Header>
                <Form noValidate validated={validated} onSubmit={handleSubmit}>
                    <Modal.Body>
                        <Form.Control type="hidden" name="id" value={custData.id} />
                        <Form.Control type="hidden" name="business_task_id" value={custData.business_task_id} />
                        <Row className="g-3">
                            <Form.Group as={Col} className="mb-3" controlId="ffd_name">
                            <Form.Label>FFD Name <span className="text-danger">*</span></Form.Label>
                                <ReactSelect
                                    options= {ffdData.map((option: FFDData) => (
                                        { value: option.id, label: option.ffd_name }
                                    ))}
                                    placeholder="Select Freight" name="ffd_name" value={custData.ffd_name ? { value: custData.ffd_name.id, label: custData.ffd_name.ffd_name } : null} onChange={(selectedOption) => handleFfdSelect(selectedOption)} required
                                />
                                <Form.Control type="hidden" name="ffd_id" value={custData.ffd_id} />
                                {validated && !custData.ffd_id && (
                                    <div className="invalid-feedback d-block">Please select FFD</div>
                                )}
                            </Form.Group>
                            <Form.Group as={Col} className="mb-3" controlId="pick_up_location">
                                <Form.Label>Pick Up Location <span className="text-danger">*</span></Form.Label>
                                <Form.Control type="text" placeholder="Pick Up Location" name="pick_up_location" value={custData.pick_up_location} onChange={handleChange} required />
                                <Form.Control.Feedback type="invalid">Please enter Pick Up Location.</Form.Control.Feedback>
                            </Form.Group>
                            <Form.Group as={Col} className="mb-3" controlId="delivery_location">
                                <Form.Label>Delivery Location <span className="text-danger">*</span></Form.Label>
                                <Form.Control type="text" placeholder="Delivery Location" name="delivery_location" value={custData.delivery_location} onChange={handleChange} required />
                                <Form.Control.Feedback type="invalid">Please enter delivery Location.</Form.Control.Feedback>
                            </Form.Group>
                        </Row>
                        <Row className="g-3">
                            <Form.Group as={Col} className="mb-3" controlId="quoting_price">
                                <Form.Label>Quoting Price <span className="text-danger">*</span></Form.Label>
                                <Form.Control type="text" placeholder="Quoting price" name="quoting_price" value={custData.quoting_price} onChange={handleChange} required />
                                <Form.Control.Feedback type="invalid">Please enter quoting price.</Form.Control.Feedback>
                            </Form.Group>
                            <Form.Group as={Col} className="mb-3" controlId="contact_person_name">
                                <Form.Label>Contact Person Name <span className="text-danger">*</span></Form.Label>
                                <Form.Control type="text" placeholder="Contact Person Name" name="contact_person_name" value={custData.contact_person_name} onChange={handleChange} required />
                                <Form.Control.Feedback type="invalid">Please enter Contact Person Name.</Form.Control.Feedback>
                            </Form.Group>
                            <Form.Group as={Col} className="mb-3" controlId="contact_person_email">
                                <Form.Label>Email ID <span className="text-danger">*</span></Form.Label>
                                <Form.Control type="text" placeholder="Contact Person Email" name="contact_person_email" value={custData.contact_person_email} onChange={handleChange} required />
                                <Form.Control.Feedback type="invalid">Please enter email ID.</Form.Control.Feedback>
                            </Form.Group>
                        </Row>
                        <Row className="g-3">
                            <Form.Group as={Col} className="mb-3" controlId="contact_person_phone">
                                <Form.Label>Phone Number <span className="text-danger">*</span></Form.Label>
                                <Form.Control type="text" placeholder="Contact Phone Number" name="contact_person_phone" value={custData.contact_person_phone} onChange={handleChange} required />
                                <Form.Control.Feedback type="invalid">Please enter phone number.</Form.Control.Feedback>
                            </Form.Group>
                            <Form.Group as={Col} controlId="freight_cost_invoice" className="mb-3">
                                <Form.Label>Invoice Attachment</Form.Label>
                                <Form.Control type="file" name='freight_cost_invoice' />
                                <Form.Control.Feedback type="invalid">Please enter Lead Time.</Form.Control.Feedback>
                            </Form.Group>
                            <Form.Group as={Col} className="mb-3" controlId="tender_status">
                                <Form.Label>Tender Status <span className="text-danger">*</span></Form.Label>
                                <Form.Select name="tender_status" value={custData.tender_status} onChange={handleSelectChange}>
                                    <option value="Bidder">Bidder</option>
                                    <option value="Winner">Winner</option>
                                </Form.Select>
                            </Form.Group>
                        </Row>
                        <Row className="g-3">
                            <Form.Group as={Col} className="mb-3" controlId="vessel_airline_name">
                                <Form.Label>Vessel/Airline Name</Form.Label>
                                <Form.Control type="text" placeholder="Vessel / Airline name" name="vessel_airline_name" value={custData.vessel_airline_name ? custData.vessel_airline_name : ''} onChange={handleChange} />
                                <Form.Control.Feedback type="invalid">Please enter Vessel / Airline name.</Form.Control.Feedback>
                            </Form.Group>
                            <Form.Group as={Col} className="mb-3" controlId="vessel_airline_date">
                                <Form.Label>Vessel/Airline Date</Form.Label>
                                <Form.Control type="date" name="vessel_airline_date" value={custData.vessel_airline_date ? custData.vessel_airline_date : ''} onChange={handleChange} />
                                <Form.Control.Feedback type="invalid">Please enter Vessel / Airline name.</Form.Control.Feedback>
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
