import { faCaretLeft, faCirclePlus, faEdit, faTrash } from '@fortawesome/free-solid-svg-icons';
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
import { useNavigate, useParams } from 'react-router-dom';
import ReactSelect from '../../../components/base/ReactSelect';

interface BTTeamData {
    id: number;
    employee_sde: { name: string; }
    employee_bpe: { name: string; }
    employee_deo: { name: string; }
    employee_pm: { name: string; }
    employee_lm: { name: string; }
    employee_cm: { name: string; }
}

const BusinessTaskTeam = () => {
    const [showModal, setShowModal] = useState<boolean>(false);
    const [refreshData, setRefreshData] = useState<boolean>(false);
    const [btTeamTableData, setbtTeamTableData] = useState<BTTeamData[]>([]);
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
        data: btTeamTableData,
        columns: btTeamDataTableColumns(handleShow,handleSuccess),
        pageSize: 10,
        pagination: true,
        sortable: true,
        selection: false,
        initialState: {
            columnVisibility: { }
        }
    });

    const handleSearchInputChange = (e: ChangeEvent<HTMLInputElement>) => {
        table.setGlobalFilter(e.target.value || undefined);
    };

    useEffect(() => {
        const fetchBtTeamData = async () => {
            try {
                const response = await axiosInstance.get(`/business-task-team`);
                if (response.status !== 200) {
                    throw new Error('Failed to fetch data');
                }
                const data: BTTeamData[] = await response.data;
                setbtTeamTableData(data);
            } catch (err: any) {
                setError(err.data.message);
            } finally {

            }
        };

        fetchBtTeamData();
    }, [refreshData]);

    if (error) return <div>Error: {error}</div>;

    return (
        <>
            <h2 className="mb-5">Business Task Team Selection</h2>
            <Card>
                <Card.Body>
                    <AdvanceTableProvider {...table}>
                        <Row className="g-3 justify-content-between mb-4">
                            <Col xs="auto">
                                <div className="d-flex">
                                    <SearchBox
                                        placeholder="Search"
                                        className="me-2"
                                        onChange={handleSearchInputChange}
                                    />
                                </div>
                            </Col>
                            <Col xs="auto">
                                {userPermission.business_task_team_create === 1 && !error && (
                                    <Button
                                        variant="primary"
                                        className=""
                                        startIcon={<FontAwesomeIcon icon={faCirclePlus} className="me-2" />}
                                        onClick={() => handleShow()}
                                    >
                                        Add Business Task Team
                                    </Button>
                                )}

                            </Col>
                        </Row>
                        <BTTeamTable />
                    </AdvanceTableProvider>
                </Card.Body>
            </Card>
            {showModal && (
                <BtTeamModal contactId={selectedContactId} onHide={handleClose} onSuccess={handleSuccess} />
            )}
        </>
    );
};

export default BusinessTaskTeam;

const btTeamDataTableColumns = (handleShow: (contactId?: number) => void, handleSuccess: () => void): ColumnDef<BTTeamData>[] => [
    {
        accessorKey: 'SDE',
        header: () => {
            return (
                <div className="d-inline-flex flex-center">
                    <span>SDE</span>
                </div>
            );
        },
        cell: ({ row: { original } }) => {
            const { employee_sde } = original;
            return (
                <span>{employee_sde ? employee_sde.name : ''}</span>
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
        accessorKey: 'BPE',
        header: () => {
            return (
                <div className="d-inline-flex flex-center">
                    <span>BPE</span>
                </div>
            );
        },
        cell: ({ row: { original } }) => {
            const { employee_bpe } = original;
            return (
                <span>{employee_bpe ? employee_bpe.name : ''}</span>
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
        accessorKey: 'DEO',
        header: () => {
            return (
                <div className="d-inline-flex flex-center">
                    <span>DEO</span>
                </div>
            );
        },
        cell: ({ row: { original } }) => {
            const { employee_deo } = original;
            return (
                <span>{employee_deo ? employee_deo.name : ''}</span>
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
        accessorKey: 'PM',
        header: () => {
            return (
                <div className="d-inline-flex flex-center">
                    <span>PM</span>
                </div>
            );
        },
        cell: ({ row: { original } }) => {
            const { employee_pm } = original;
            return (
                <span>{employee_pm ? employee_pm.name : ''}</span>
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
        accessorKey: 'LM',
        header: () => {
            return (
                <div className="d-inline-flex flex-center">
                    <span>LM</span>
                </div>
            );
        },
        cell: ({ row: { original } }) => {
            const { employee_lm } = original;
            return (
                <span>{employee_lm ? employee_lm.name : ''}</span>
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
        accessorKey: 'CM',
        header: () => {
            return (
                <div className="d-inline-flex flex-center">
                    <span>CM</span>
                </div>
            );
        },
        cell: ({ row: { original } }) => {
            const { employee_cm } = original;
            return (
                <span>{employee_cm ? employee_cm.name : ''}</span>
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
                    {userPermission.business_task_team_edit == 1 && (
                        <Button className='text-success' variant='link' title='Edit Team' onClick={() => handleShow(id)} startIcon={<FontAwesomeIcon icon={faEdit} />}></Button>
                    )}
                </div>
            );
        },
        meta: {
            headerProps: {
                style: { width: '5%' },
                className: 'ps-2 pe-2 border-end border-translucent'
            },
            cellProps: {
                className:
                'white-space-nowrap fw-semibold ps-2 border-end border-translucent'
            }
        }
    },
];
const BTTeamTable = () => {
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
interface BtTeamModalProps {
    contactId?: number;
    onHide: () => void;
    onSuccess: () => void;
}

interface FormData {
    id?: number;
    sde_data: { user_id: number; name: string; } | null;
    sde: number;
    bpe_data: { user_id: number; name: string; } | null;
    bpe: number;
    deo_data: { user_id: number; name: string; } | null;
    deo: number;
    pm_data: { user_id: number; name: string; } | null;
    pm: number;
    lm_data: { user_id: number; name: string; } | null;
    lm: number;
    cm_data: { user_id: number; name: string; } | null;
    cm: number;
}

interface employeeData {
    id: number;
    user_id: number;
    name: string;
    role_id: number;
}

interface BtEmployeeData {
    sdeteams: employeeData[];
    bpeteams: employeeData[];
    deoteams: employeeData[];
    pmteams: employeeData[];
    lmteams: employeeData[];
    cmteams: employeeData[];
}

const BtTeamModal: React.FC<BtTeamModalProps> = ({ contactId, onHide, onSuccess}) => {

    const [custData, setUserData] = useState<FormData>({ id: 0, sde_data: null, sde: 0, bpe_data: null, bpe: 0, deo_data: null, deo: 0, pm_data: null, pm: 0, lm_data: null, lm: 0, cm_data: null, cm: 0, });

    const [btEmployeeData, setBtEmployeeData] = useState<BtEmployeeData>({
        sdeteams: [],
        bpeteams: [],
        deoteams: [],
        pmteams: [],
        lmteams: [],
        cmteams: []
    });
    const [loading, setLoading] = useState(false);
    const [isEditing, setIsEditing] = useState<boolean>(false);
    const [validated, setValidated] = useState<boolean>(false);
    useEffect(() => {

        if (contactId) {
            setIsEditing(true);
            // Fetch business task team data for editing
            axiosInstance.get(`/business-task-team/${contactId}`)
            .then(response => {
                setUserData(response.data);
            })
            .catch(error => console.error('Error fetching business task team contact data:', error));
        }
    }, [contactId]);

    useEffect(() => {
        const fetchEmployeeListing = async () => {
            try {
                const response = await axiosInstance.get('/bTteamcreate');
                if (response.status !== 200) {
                    throw new Error('Failed to fetch data');
                }
                const data: BtEmployeeData = response.data;
                setBtEmployeeData(data);
            } catch (err: any) {

            } finally {
            }
        };
        fetchEmployeeListing();
    }, []);


    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setUserData({ ...custData, [name]: value });
    };

    const handleEmployeeSelect = (selectedOption: any, fieldName: string, field: string) => {
        if (selectedOption) {
            setUserData(prev => ({
                ...prev,
                [fieldName]: { id: selectedOption.value, name: selectedOption.label },
                [field]: selectedOption.value
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

        setValidated(true);
        setLoading(true);
        const apiCall = isEditing
            ? axiosInstance.put(`/business-task-team/${custData.id}`,  {
                ...custData
            })
            : axiosInstance.post('/business-task-team', custData );

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
                    <Modal.Title>{isEditing ? 'Edit Business Task Team Selection' : 'Create Business Task Team Selection'}</Modal.Title>
                </Modal.Header>
                <Form noValidate validated={validated} onSubmit={handleSubmit}>
                    <Modal.Body>
                        <Row>
                            <Form.Group as={Col} className="mb-3" controlId="sde_data">
                                <Form.Label>SDE <span className="text-danger">*</span></Form.Label>
                                <ReactSelect
                                    options={btEmployeeData.sdeteams.map((option: employeeData) => (
                                        { value: option.user_id, label: option.name }
                                    ))}
                                    placeholder="Select SDE" name="sde_data" value={custData.sde_data ? { value: custData.sde_data.user_id, label: custData.sde_data.name } : null} onChange={(selectedOption) => handleEmployeeSelect(selectedOption, 'sde_data', 'sde')} required
                                />
                                <Form.Control type="hidden" name="sde" value={custData.sde} />
                                {validated && !custData.sde && (
                                    <div className="invalid-feedback d-block">Please enter SDE</div>
                                )}
                            </Form.Group>
                        </Row>
                        <Row>
                            <Form.Group as={Col} className="mb-3" controlId="bpe_data">
                                <Form.Label>BPE <span className="text-danger">*</span></Form.Label>
                                <ReactSelect
                                    options={btEmployeeData.bpeteams.map((option: employeeData) => (
                                        { value: option.user_id, label: option.name }
                                    ))}
                                    placeholder="Select BPE" name="bpe_data" value={custData.bpe_data ? { value: custData.bpe_data.user_id, label: custData.bpe_data.name } : null} onChange={(selectedOption) => handleEmployeeSelect(selectedOption, 'bpe_data', 'bpe')} required
                                />
                                <Form.Control type="hidden" name="bpe" value={custData.bpe} />
                                {validated && !custData.bpe && (
                                    <div className="invalid-feedback d-block">Please enter BPE</div>
                                )}
                            </Form.Group>
                        </Row>
                        <Row>
                            <Form.Group as={Col} className="mb-3" controlId="deo_data">
                                <Form.Label>DEO <span className="text-danger">*</span></Form.Label>
                                <ReactSelect
                                    options={btEmployeeData.deoteams.map((option: employeeData) => (
                                        { value: option.user_id, label: option.name }
                                    ))}
                                    placeholder="Select DEO" name="deo_data" value={custData.deo_data ? { value: custData.deo_data.user_id, label: custData.deo_data.name } : null} onChange={(selectedOption) => handleEmployeeSelect(selectedOption, 'deo_data', 'deo')} required
                                />
                                <Form.Control type="hidden" name="deo" value={custData.deo} />
                                {validated && !custData.deo && (
                                    <div className="invalid-feedback d-block">Please enter DEO</div>
                                )}
                            </Form.Group>
                        </Row>
                        <Row>
                            <Form.Group as={Col} className="mb-3" controlId="pm_data">
                                <Form.Label>PM <span className="text-danger">*</span></Form.Label>
                                <ReactSelect
                                    options={btEmployeeData.pmteams.map((option: employeeData) => (
                                        { value: option.user_id, label: option.name }
                                    ))}
                                    placeholder="Select PM" name="pm_data" value={custData.pm_data ? { value: custData.pm_data.user_id, label: custData.pm_data.name } : null} onChange={(selectedOption) => handleEmployeeSelect(selectedOption, 'pm_data', 'pm')} required
                                />
                                <Form.Control type="hidden" name="pm" value={custData.pm} />
                                {validated && !custData.pm && (
                                    <div className="invalid-feedback d-block">Please enter PM</div>
                                )}
                            </Form.Group>
                        </Row>
                        <Row>
                            <Form.Group as={Col} className="mb-3" controlId="lm_data">
                                <Form.Label>LM <span className="text-danger">*</span></Form.Label>
                                <ReactSelect
                                    options={btEmployeeData.lmteams.map((option: employeeData) => (
                                        { value: option.user_id, label: option.name }
                                    ))}
                                    placeholder="Select LM" name="lm_data" value={custData.lm_data ? { value: custData.lm_data.user_id, label: custData.lm_data.name } : null} onChange={(selectedOption) => handleEmployeeSelect(selectedOption, 'lm_data', 'lm')} required
                                />
                                <Form.Control type="hidden" name="lm" value={custData.lm} />
                                {validated && !custData.lm && (
                                    <div className="invalid-feedback d-block">Please enter LM</div>
                                )}
                            </Form.Group>
                        </Row>
                        <Row>
                            <Form.Group as={Col} className="mb-3" controlId="cm_data">
                                <Form.Label>CM <span className="text-danger">*</span></Form.Label>
                                <ReactSelect
                                    options={btEmployeeData.cmteams.map((option: employeeData) => (
                                        { value: option.user_id, label: option.name }
                                    ))}
                                    placeholder="Select CM" name="cm_data" value={custData.cm_data ? { value: custData.cm_data.user_id, label: custData.cm_data.name } : null} onChange={(selectedOption) => handleEmployeeSelect(selectedOption, 'cm_data', 'cm')} required
                                />
                                <Form.Control type="hidden" name="cm" value={custData.cm} />
                                {validated && !custData.cm && (
                                    <div className="invalid-feedback d-block">Please enter CM</div>
                                )}
                            </Form.Group>
                        </Row>
                    </Modal.Body>
                    <Modal.Footer>
                        <Button variant="secondary" onClick={onHide}>
                            Close
                        </Button>
                        <Button variant="primary" loading={loading} loadingPosition="start" type="submit">{isEditing ? 'Update' : 'Create'}</Button>
                    </Modal.Footer>
                </Form>
            </Modal>
        </>
    );
};
