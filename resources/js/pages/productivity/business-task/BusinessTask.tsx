import { faCirclePlus, faEdit, faTrash } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import Button from '../../../components/base/Button';
import React, { useEffect, useState, ChangeEvent } from 'react';
import { Form, Modal, Col, Row, Card } from 'react-bootstrap';
import axiosInstance from '../../../axios';
import useAdvanceTable from '../../../hooks/useAdvanceTable';
import AdvanceTableProvider from '../../../providers/AdvanceTableProvider';
import SearchBox from '../../../components/common/SearchBox';
import { useAuth } from '../../../AuthContext';
import ReactSelect from '../../../components/base/ReactSelect';
import { ColumnDef } from '@tanstack/react-table';
import AdvanceTable from '../../../components/base/AdvanceTable';
import AdvanceTableFooter from '../../../components/base/AdvanceTableFooter';
import swal from 'sweetalert';
import { useNavigate } from 'react-router-dom';

interface BusinessTaskData {
    id: number;
    date: string;
    user_details: {
        id: number;
        user_id: number;
        created_by: number;
        name: string;
    }
    customer_name: string;
    segments: {
        id: number;
        name: string;
    };
    categories: {
        id: number;
        name: string;
    };
    created_by: string;
    task_status: string;
    lead_stage: string;
    customer_type: string;
    priority: string;
    stock_position: string;
    country: string;
    shipping_liabelity: string;
    dimension_of_boxes: string;
    volume_weight: string;
    cold_chain: string;
}

interface SegmentData {
    id: number;
    name: string;
}
interface CustomersData {
    id: number;
    name: string;
}
interface SdeTeamData {
    sde: number;
    employee_sde: {
        id: number;
        user_id: number;
        name: string;
    }
}

interface CategoryData {
    id: number;
    name: string;
}

const BusinessTask = () => {

    const [showModal, setShowModal] = useState<boolean>(false);
    const [refreshData, setRefreshData] = useState<boolean>(false);
    const [businessTaskData, setBusinessTaskData] = useState<BusinessTaskData[]>([]);
    const [error, setError] = useState<string | null>(null);
    const [segmentsData, setSegmentsData] = useState<SegmentData[]>([]);
    const [customersData, setCustomersData] = useState<CustomersData[]>([]);
    const [sdeTeamData, setSdeTeamData] = useState<SdeTeamData[]>([]);

    const { userPermission } = useAuth(); //check userRole & permissions
    const navigate = useNavigate();

    const handleEdit = (btId: number) => {
        navigate(`/bt/enquiryDetails/${btId}`);
    };

    const handleShow = () => {
        setShowModal(true);
    };

    const handleClose = () => setShowModal(false);

    const handleSuccess = () => {
        // Refresh data or perform any other action after successful submission
        setRefreshData(prev => !prev); // Toggle state to trigger re-fetch
    };



    const table = useAdvanceTable({
        data: businessTaskData,
        columns: businessTaskTableColumns(handleEdit),
        pageSize: 10,
        pagination: true,
        sortable: true,
        selection: false,
        initialState: {
            columnVisibility: {
                segments: false,
                category: false,
                task_status: false,
                lead_stage: false,
                customer_type: false,
                priority: false,
                stock_position: false,
                country: false,
            }
        }
    });

    const handleSearchInputChange = (e: ChangeEvent<HTMLInputElement>) => {
        table.setGlobalFilter(e.target.value || undefined);
    };

    useEffect(() => {
        const fetchBTData = async () => {
            try {
                const response = await axiosInstance.get('/business-task');
                if (response.status !== 200) {
                    throw new Error('Failed to fetch data');
                }
                const data: BusinessTaskData[] = await response.data;
                setBusinessTaskData(data);
            } catch (err: any) {
                setError(err.data.message);
            }
        };
        fetchBTData();
    }, [refreshData]);

    useEffect(() => {
        const fetchSegment = async () => {
            try {
                const response = await axiosInstance.get('/segmentListing');
                if (response.status !== 200) {
                    throw new Error('Failed to fetch data');
                }
                const data: SegmentData[] = await response.data;
                setSegmentsData(data);
            } catch (err: any) {
                setError(err.message);
            } finally {
            }
        };
        const fetchCustomers = async () => {
            try {
                const response = await axiosInstance.get('/customerList');
                if (response.status !== 200) {
                    throw new Error('Failed to fetch data');
                }
                const data: CustomersData[] = await response.data;
                setCustomersData(data);
            } catch (err: any) {
                setError(err.message);
            } finally {
            }
        };
        const fetchSDEteam = async () => {
            try {
                const response = await axiosInstance.get('/getBTteamByName/Sde');
                if (response.status !== 200) {
                    throw new Error('Failed to fetch data');
                }
                const data: SdeTeamData[] = await response.data;
                setSdeTeamData(data);
            } catch (err: any) {
                setError(err.message);
            } finally {
            }
        };

        fetchSegment();
        fetchCustomers();
        fetchSDEteam();
    }, []);

    if (error) return <div>Error: {error}</div>;

    return (
        <>
            <h2 className="mb-5">Business Task</h2>
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
                                {/* {userPermission.business_task_create === 1 && !error && (
                                    <Button
                                        variant="primary"
                                        className=""
                                        startIcon={<FontAwesomeIcon icon={faCirclePlus} className="me-2" />}
                                        onClick={() => handleShow()}
                                    >
                                        Add Business Task
                                    </Button>
                                )} */}
                            </Col>
                        </Row>
                        <BusinessTaskTable />
                    </AdvanceTableProvider>
                </Card.Body>
            </Card>
            {showModal && (
                <BusinessTaskModal
                    segmentsData={segmentsData}
                    customersData={customersData}
                    sdeTeamData={sdeTeamData}
                    onHide={handleClose}
                    onSuccess={handleSuccess}
                />
            )}

        </>
    );
};

export default BusinessTask;

const businessTaskTableColumns = (handleEdit: (BtId: number) => void): ColumnDef<BusinessTaskData>[] => [
    {
        id: 'actions',
        header: () => {
            return (
                <div className="d-inline-flex flex-center">
                    <span>Action</span>
                </div>
            );
        },
        cell: ({ row: { original } }) => {
            const { id } = original;
            const { userPermission } = useAuth(); //check userRole & permissions
            return (
                <>
                    {userPermission.business_task_edit == 1 && (
                        <Button className='text-success' variant='link' title='Edit Business Task' onClick={() => handleEdit(id)} startIcon={<FontAwesomeIcon icon={faEdit} />}></Button>
                    )}
                </>
            );
        },
        meta: {
            headerProps: {
                className: 'ps-2 pe-2 border-start border-end border-translucent'
            },
            cellProps: {
                className:
                'white-space-nowrap fw-semibold border-start ps-2 pe-2 border-end border-translucent'
            }
        }
    },
    {
        accessorKey: 'date',
        header: () => {
            return (
                <div className="d-inline-flex flex-center">
                    <span>Enquiry Date</span>
                </div>
            );
        },
        cell: ({ row: { original } }) => {
            const { date } = original;
            return (
                <span>{date}</span>
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
        accessorKey: 'id',
        header: () => {
            return (
                <div className="d-inline-flex flex-center">
                    <span>TID</span>
                </div>
            );
        },
        cell: ({ row: { original } }) => {
            const { id } = original;
            return (
                <span>{id}</span>
            );
        },
        meta: {
            headerProps: {
                className: 'ps-2 pe-2 border-start border-end border-translucent'
            },
            cellProps: {
                className:
                'fw-semibold ps-2 border-start border-end border-translucent'
            }
        }
    },
    {
        accessorKey: 'user_details',
        header: () => {
            return (
                <div className="d-inline-flex flex-center">
                    <span>Owner Name</span>
                </div>
            );
        },
        cell: ({ row: { original } }) => {
            const { user_details } = original;
            return (
                <span>{user_details ? user_details.name : ''}</span>
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
        accessorKey: 'customer_name',
        header: () => {
            return (
                <div className="d-inline-flex flex-center">
                    <span>Customer Name</span>
                </div>
            );
        },
        cell: ({ row: { original } }) => {
            const { customer_name } = original;
            return (
                <span>{customer_name}</span>
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
        accessorKey: 'segments',
        header: () => {
            return (
                <div className="d-inline-flex flex-center">
                    <span>Segment</span>
                </div>
            );
        },
        cell: ({ row: { original } }) => {
            const { segments } = original;
            return (
                <span>{segments ? segments.name : ''}</span>
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
        accessorKey: 'category',
        header: () => {
            return (
                <div className="d-inline-flex flex-center">
                    <span>Category</span>
                </div>
            );
        },
        cell: ({ row: { original } }) => {
            const { categories } = original;
            return (
                <span>{categories ? categories.name : ''}</span>
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
        accessorKey: 'task_status',
        header: () => {
            return (
                <div className="d-inline-flex flex-center">
                    <span>Task Status</span>
                </div>
            );
        },
        cell: ({ row: { original } }) => {
            const { task_status } = original;
            return (
                <span>{task_status}</span>
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
        accessorKey: 'lead_stage',
        header: () => {
            return (
                <div className="d-inline-flex flex-center">
                    <span>Lead Stage</span>
                </div>
            );
        },
        cell: ({ row: { original } }) => {
            const { lead_stage } = original;
            return (
                <span>{lead_stage}</span>
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
        accessorKey: 'customer_type',
        header: () => {
            return (
                <div className="d-inline-flex flex-center">
                    <span>Customer Type</span>
                </div>
            );
        },
        cell: ({ row: { original } }) => {
            const { customer_type } = original;
            return (
                <span>{customer_type}</span>
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
        accessorKey: 'priority',
        header: () => {
            return (
                <div className="d-inline-flex flex-center">
                    <span>Priority</span>
                </div>
            );
        },
        cell: ({ row: { original } }) => {
            const { priority } = original;
            return (
                <span>{priority}</span>
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
        accessorKey: 'stock_position',
        header: () => {
            return (
                <div className="d-inline-flex flex-center">
                    <span>Stock Position</span>
                </div>
            );
        },
        cell: ({ row: { original } }) => {
            const { stock_position } = original;
            return (
                <span>{stock_position}</span>
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
        accessorKey: 'country',
        header: () => {
            return (
                <div className="d-inline-flex flex-center">
                    <span>Country</span>
                </div>
            );
        },
        cell: ({ row: { original } }) => {
            const { country } = original;
            return (
                <span>{country}</span>
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
        accessorKey: 'shipping_liabelity',
        header: () => {
            return (
                <div className="d-inline-flex flex-center">
                    <span>Shipping Liability</span>
                </div>
            );
        },
        cell: ({ row: { original } }) => {
            const { shipping_liabelity } = original;
            return (
                <span>{shipping_liabelity}</span>
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
        accessorKey: 'dimension_of_boxes',
        header: () => {
            return (
                <div className="d-inline-flex flex-center">
                    <span>Dim Of Boxes</span>
                </div>
            );
        },
        cell: ({ row: { original } }) => {
            const { dimension_of_boxes } = original;
            return (
                <span>{dimension_of_boxes}</span>
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
        accessorKey: 'volume_weight',
        header: () => {
            return (
                <div className="d-inline-flex flex-center">
                    <span>Volume Weight</span>
                </div>
            );
        },
        cell: ({ row: { original } }) => {
            const { volume_weight } = original;
            return (
                <span>{volume_weight}</span>
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
        accessorKey: 'cold_chain',
        header: () => {
            return (
                <div className="d-inline-flex flex-center">
                    <span>Cold Chain</span>
                </div>
            );
        },
        cell: ({ row: { original } }) => {
            const { cold_chain } = original;
            return (
                <span>{cold_chain}</span>
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
];
const BusinessTaskTable = () => {
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

interface BTModalProps {
    segmentsData: SegmentData[];
    customersData: SegmentData[];
    sdeTeamData: SdeTeamData[];
    onHide: () => void;
    onSuccess: () => void;
}

interface ListData {
    id: number;
    name: string;
}

interface FormData {
    date: Date;
    customer: ListData | null;
    customer_name: string;
    segment_id: number;
    segment: ListData | null;
    category_id: number;
    category: ListData | null;
    enquiry: string;
    task_status: string;
    lead_stage: string;
    sde_team_id: number;
    sde_team: {
        sde: number;
        employee_sde: {
            user_id: number;
            name: string;
        }
    }
}
const BusinessTaskModal: React.FC<BTModalProps> = ({ segmentsData, customersData, sdeTeamData, onHide, onSuccess}) => {

    const [custData, setUserData] = useState<FormData>({
        date: undefined,
        customer: null,
        customer_name: '',
        segment_id: 0,
        segment: null,
        category_id: 0,
        category: null,
        enquiry: '',
        task_status: '',
        lead_stage: '',
        sde_team_id: 0,
        sde_team:{ sde: 0, employee_sde: {
            user_id: 0,
            name: ''
        }}
    });
    const [isEditing, setIsEditing] = useState<boolean>(false);
    const [validated, setValidated] = useState<boolean>(false);
    const [categoryData, setCategoryData] = useState([]);
    const [loading, setLoading] = useState(false);
    const { empData } = useAuth(); //check userRole & permissions

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setUserData({ ...custData, [name]: value });
    };

    const handleRSelect = (selectedOption: { value: number; label: string } | null, fieldName: string) => {
        if (selectedOption) {
            if(fieldName == 'customer') {
                setUserData({ ...custData, customer: {
                    id: selectedOption.value,
                    name: selectedOption.label
                }, customer_name: selectedOption.label });
            }
            if(fieldName == 'category') {
                setUserData({ ...custData, category: {
                    id: selectedOption.value,
                    name: selectedOption.label
                }, category_id: selectedOption.value });
            }
            if(fieldName == 'segment') {
                setUserData({ ...custData, segment: {
                    id: selectedOption.value,
                    name: selectedOption.label
                }, segment_id: selectedOption.value });
                axiosInstance.get(`/getCategories?segment_id=${selectedOption.value}`)
                .then(response => {
                    setCategoryData(response.data);
                });
            }
            if(fieldName == 'sde_team') {
                setUserData({ ...custData, sde_team: {
                    sde: selectedOption.value,
                    employee_sde:{
                        user_id: selectedOption.value,
                        name: selectedOption.label
                    }
                }, sde_team_id: selectedOption.value });
            }
        } else {
            setUserData({ ...custData, [fieldName]: '' });
        }
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

        setLoading(true);

        setValidated(true);
        const apiCall = axiosInstance.post('/business-task', custData );

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
                    <Modal.Title>{isEditing ? 'Edit Business Task' : 'Add Business Task'}</Modal.Title>
                </Modal.Header>
                <Form noValidate validated={validated} onSubmit={handleSubmit}>
                    <Modal.Body>
                        <Row className="mb-3 g-3">
                            <Form.Group as={Col} className="mb-3" controlId="date">
                                <Form.Label>Date <span className="text-danger">*</span></Form.Label>
                                <Form.Control type="date" name="date" value={custData.date} onChange={handleChange} />
                                <Form.Control.Feedback type="invalid">Please enter date.</Form.Control.Feedback>
                            </Form.Group>
                            <Form.Group as={Col} className="mb-3" controlId='customer'>
                                <Form.Label>Customer Name <span className="text-danger">*</span></Form.Label>
                                <ReactSelect
                                    options= {customersData.map((option: CustomersData) => (
                                        { value: option.id, label: option.name }
                                    ))}
                                    placeholder="Select Customer Name" name="customer" value={custData.customer ? { value: custData.customer.id, label: custData.customer.name } : null} onChange={(selectedOption) => handleRSelect(selectedOption, 'customer')} required
                                />
                                <Form.Control type="hidden" name="customer_name" value={custData.customer_name} />
                                {validated && custData.customer_name == '' && (
                                    <div className="invalid-feedback d-block">Please enter Customer Name</div>
                                )}
                            </Form.Group>
                            <Form.Group as={Col} className="mb-3" controlId='segment'>
                                <Form.Label>Segment <span className="text-danger">*</span></Form.Label>
                                <ReactSelect
                                    options= {segmentsData.map((option: SegmentData) => (
                                        { value: option.id, label: option.name }
                                    ))}
                                    placeholder="Select segment" name="segment" value={custData.segment ? { value: custData.segment.id, label: custData.segment.name } : null} onChange={(selectedOption) => handleRSelect(selectedOption, 'segment')}
                                />
                                <Form.Control type="hidden" name="segment_id" value={custData.segment_id} />
                                {/* {validated && !custData.segment_id && (
                                    <div className="invalid-feedback d-block">Please enter segment</div>
                                )} */}
                            </Form.Group>
                        </Row>
                        <Row className="mb-3 g-3">
                            <Form.Group as={Col} className="mb-3" controlId='category'>
                                <Form.Label>Category <span className="text-danger">*</span></Form.Label>
                                <ReactSelect
                                    options= {categoryData.map((option: CategoryData) => (
                                        { value: option.id, label: option.name }
                                    ))}
                                    placeholder="Select Category" name="category" value={custData.category ? { value: custData.category.id, label: custData.category.name } : null} onChange={(selectedOption) => handleRSelect(selectedOption, 'category')}
                                />
                                <Form.Control type="hidden" name="category_id" value={custData.category_id} />
                                {/* {validated && !custData.category_id && (
                                    <div className="invalid-feedback d-block">Please enter category</div>
                                )} */}
                            </Form.Group>
                            <Form.Group as={Col} className="mb-3" controlId="enquiry">
                                <Form.Label>Enquiry</Form.Label>
                                <Form.Control as="textarea" rows={1} name="enquiry" value={custData.enquiry} onChange={handleChange}/>
                            </Form.Group>
                            <Form.Group as={Col} className="mb-3" controlId="task_status">
                                <Form.Label>Task Status</Form.Label>
                                <Form.Select name="task_status" value={custData.task_status} onChange={handleSelectChange}>
                                    <option value="">Select</option>
                                    <option value="Not started">Not started</option>
                                    <option value="In progress">In progress</option>
                                    <option value="Lost">Lost</option>
                                    <option value="On Hold">On Hold</option>
                                    <option value="Won">Won</option>
                                </Form.Select>
                            </Form.Group>
                        </Row>
                        <Row className="mb-3 g-3">
                            <Form.Group as={Col} className="mb-3" controlId="lead_stage">
                                <Form.Label>Lead Stage</Form.Label>
                                <Form.Select name="lead_stage" value={custData.lead_stage} onChange={handleSelectChange}>
                                    <option value="">Select</option>
                                    <option value="Initial Stage">Initial Stage</option>
                                    <option value="Conversion From lead validation to need analysis">Conversion From lead validation to need analysis</option>
                                    <option value="Conversion From need analysis to Proforma invoice">Conversion From need analysis to Proforma invoice</option>
                                    <option value="Conversion of proforma Invoice to deal won">Conversion of proforma Invoice to deal won</option>
                                </Form.Select>
                            </Form.Group>
                            <Form.Group as={Col} className="mb-3">
                                <Form.Label>SDE Team <span className="text-danger">*</span></Form.Label>
                                <ReactSelect
                                    options= {sdeTeamData.map((option: SdeTeamData) => (
                                        { value: option.sde, label: option.employee_sde.name }
                                    ))}
                                    placeholder="Select SDE" name="sde_team" value={custData.sde_team ? { value: custData.sde_team.employee_sde.user_id, label: custData.sde_team.employee_sde.name } : null} onChange={(selectedOption) => handleRSelect(selectedOption, 'sde_team')}
                                />
                                <Form.Control type="hidden" name="sde_team_id" value={custData.sde_team_id} />
                                {/* {validated && !custData.sde_team_id && (
                                    <div className="invalid-feedback d-block">Please enter SDE</div>
                                )} */}
                            </Form.Group>
                        </Row>
                    </Modal.Body>
                    <Modal.Footer>
                        <Button variant="secondary" onClick={onHide}>
                            Close
                        </Button>
                        <Button variant="primary" loading={loading} loadingPosition="start" type="submit">Add</Button>
                    </Modal.Footer>
                </Form>
            </Modal>
        </>
    );
};

