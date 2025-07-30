import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Form, Modal, Col, Row, Nav, Tab } from 'react-bootstrap';
import { faCirclePlus, faEdit } from '@fortawesome/free-solid-svg-icons';
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

interface PurchaseOrderData {
    id: number;
    purchase_order_number: string;

}

interface PaidPickup {
    id: number;
    ffd_id: number;
    ffd_name: FFDData;
    business_task_id: number;
    pick_up_location: string;
    delivery_location: string;
    opu_freight_cost: string;
    purchase_order_no: number;
    purchase_order: PurchaseOrderData;
    pickup_refrence_number: string;
    pick_up_booking_date: string;
}

interface SupplierPaidDispatch {
    id: number;
    ffd_id: number;
    ffd_name: FFDData;
    business_task_id: number;
    pod_lorry_receipt: string;
    booking_date: string;
}

interface ExWShipment{
    id: number;
    ffd_id: number;
    ffd_name: FFDData;
    business_task_id: number;
    pick_up_reference_number: string;
    pick_up_booking_date: string;
}

interface CIFShipment {
    id: number;
    ffd_id: number;
    ffd_name: FFDData;
    business_task_id: number;
}

interface FOBShipment {
    id: number;
    ffd_id: number;
    ffd_name: FFDData | null;
    business_task_id: number;
    freight_cost: number;
    po_no: number;
    purchase_order: PurchaseOrderData | null;
    pickup_refrence_number: string;
    pickup_booking_date: string;
}

const ExportOngoingShipment = ({btId}) => {
    const [refreshPickupData, setRefreshData] = useState<boolean>(false);
    const [refreshSupplierData, setrefreshSupplierData] = useState<boolean>(false);
    const [refreshExwData, setrefreshExwData] = useState<boolean>(false);
    const [refreshCIFData, setrefreshCIFData] = useState<boolean>(false);
    const [refreshFOBData, setrefreshFOBData] = useState<boolean>(false);
    const [pickupData, setPickupData] = useState<PaidPickup[]>([]);
    const [supplierData, setSupplierData] = useState<SupplierPaidDispatch[]>([]);
    const [exwShipmentData, setExwShipmentData] = useState<ExWShipment[]>([]);
    const [cifShipmentData, setCifShipmentData] = useState<CIFShipment[]>([]);
    const [fobShipmentData, setFobShipmentData] = useState<FOBShipment[]>([]);
    const [ffdData, setFfdData] = useState<FFDData[]>([]);
    const [poData, setPoData] = useState<PurchaseOrderData[]>([]);
    const [pickupId, setPurchaseId] = useState<number | undefined>(undefined);
    const [showModal, setShowModal] = useState<boolean>(false);
    const [showSupplierModal, setSupplierShowModal] = useState<boolean>(false);
    const [showExwModal, setShowExwModal] = useState<boolean>(false);
    const [showCifModal, setShowCifModal] = useState<boolean>(false);
    const [showFobModal, setShowFobModal] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchFFDListData = async() => {
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
        const fetchPOListData = async() => {
            try {
                const response = await axiosInstance.get(`/po_listing`);
                if (response.status !== 200) {
                    throw new Error('Failed to fetch data');
                }
                const data: PurchaseOrderData[] = await response.data;
                setPoData(data);
            } catch (err: any) {
                setError(err.data.message);
            }
        };
        fetchFFDListData();
        fetchPOListData();
    }, []);

    //fetch Pickup data
    useEffect(() => {
        const fetchFreightData = async () => {
            try {
                const response = await axiosInstance.get(`/getOwnpickupBt/${btId}`);
                if (response.status !== 200) {
                    throw new Error('Failed to fetch data');
                }
                const pckUp_data: PaidPickup[] = await response.data;
                setPickupData(pckUp_data);
            } catch (err: any) {
                setError(err.data.message);
            }
        };
        fetchFreightData();
    }, [refreshPickupData]);

    //fetch Supplier data
    useEffect(() => {
        const fetchFreightData = async () => {
            try {
                const response = await axiosInstance.get(`/getServeBySuppliersBt/${btId}`);
                if (response.status !== 200) {
                    throw new Error('Failed to fetch data');
                }
                const supp_data: SupplierPaidDispatch[] = await response.data;
                setSupplierData(supp_data);
            } catch (err: any) {
                setError(err.data.message);
            }
        };
        fetchFreightData();
    }, [refreshSupplierData]);

    //fetch ExW data
    useEffect(() => {
        const fetchFreightData = async () => {
            try {
                const response = await axiosInstance.get(`/getImportPickupBt/${btId}`);
                if (response.status !== 200) {
                    throw new Error('Failed to fetch data');
                }
                const exw_data: ExWShipment[] = await response.data;
                setExwShipmentData(exw_data);
            } catch (err: any) {
                setError(err.data.message);
            }
        };
        fetchFreightData();
    }, [refreshExwData]);

    //fetch CIF data
    useEffect(() => {
        const fetchFreightData = async () => {
            try {
                const response = await axiosInstance.get(`/getExportAgentBt/${btId}`);
                if (response.status !== 200) {
                    throw new Error('Failed to fetch data');
                }
                const exw_data: CIFShipment[] = await response.data;
                setCifShipmentData(exw_data);
            } catch (err: any) {
                setError(err.data.message);
            }
        };
        fetchFreightData();
    }, [refreshCIFData]);

    //fetch FOB data
    useEffect(() => {
        const fetchFreightData = async () => {
            try {
                const response = await axiosInstance.get(`/getPortOfLandingBt/${btId}`);
                if (response.status !== 200) {
                    throw new Error('Failed to fetch data');
                }
                const fob_data: FOBShipment[] = await response.data;
                setFobShipmentData(fob_data);
            } catch (err: any) {
                setError(err.data.message);
            }
        };
        fetchFreightData();
    }, [refreshFOBData]);

    const handlePickupModal = (pickupId?: number) => {
        setPurchaseId(pickupId);
        setShowModal(true);
    };

    const handleSupplierModal = (pickupId?: number) => {
        setPurchaseId(pickupId);
        setSupplierShowModal(true);
    };

    const handleExwModal = (pickupId?: number) => {
        setPurchaseId(pickupId);
        setShowExwModal(true);
    };

    const handleCifModal = (pickupId?: number) => {
        setPurchaseId(pickupId);
        setShowCifModal(true);
    };

    const handleFobModal = (pickupId?: number) => {
        setPurchaseId(pickupId);
        setShowFobModal(true);
    };

    const pickupTable = useAdvanceTable({
        data: pickupData,
        columns: pickupTableColumns(handlePickupModal),
        pageSize: 10,
        pagination: true,
        sortable: true,
        selection: false,
    });

    const supplierTable = useAdvanceTable({
        data: supplierData,
        columns: supplierTableColumns(handleSupplierModal),
        pageSize: 10,
        pagination: true,
        sortable: true,
        selection: false,
    });

    const exwTable = useAdvanceTable({
        data: exwShipmentData,
        columns: exwTableColumns(handleExwModal),
        pageSize: 10,
        pagination: true,
        sortable: true,
        selection: false,
    });

    const cifTable = useAdvanceTable({
        data: cifShipmentData,
        columns: cifTableColumns(handleCifModal),
        pageSize: 10,
        pagination: true,
        sortable: true,
        selection: false,
    });

    const fobTable = useAdvanceTable({
        data: fobShipmentData,
        columns: fobTableColumns(handleFobModal),
        pageSize: 10,
        pagination: true,
        sortable: true,
        selection: false,
    });

    const handleClose = (closeString: string) => {
        if(closeString == 'pickup') {
            setShowModal(false);
        } else if(closeString == 'supplier') {
            setSupplierShowModal(false);
        } else if (closeString == 'exw') {
            setShowExwModal(false);
        } else if (closeString == 'cif') {
            setShowCifModal(false);
        } else {
            setShowFobModal(false);
        }
    };

    const handleSuccess = (refreshString: string) => {
        // Refresh data or perform any other action after successful submission
        if(refreshString == 'pickup'){
            setRefreshData(prev => !prev); // Toggle state to trigger re-fetch
        } else if (refreshString == 'supplier') {
            setrefreshSupplierData(prev => !prev);
        } else if (refreshString == 'exw') {
            setrefreshExwData(prev => !prev);
        } else if (refreshString == 'cif') {
            setrefreshCIFData(prev => !prev);
        } else {
            setrefreshFOBData(prev => !prev);
        }
    };

    return (
        <>
            <Tab.Container id="basic-tabs-example" defaultActiveKey="inorb_paid_pickup">
                <Nav variant="underline" className="mb-3">
                    <Nav.Item>
                        <Nav.Link eventKey="inorb_paid_pickup">Inorbvict Paid Pickup</Nav.Link>
                    </Nav.Item>
                    <Nav.Item>
                        <Nav.Link eventKey="served_by_supplier">Supplier Paid Dispatch</Nav.Link>
                    </Nav.Item>
                    <Nav.Item>
                        <Nav.Link eventKey="importer_pickup_tab">ExW Shipment</Nav.Link>
                    </Nav.Item>
                    <Nav.Item>
                        <Nav.Link eventKey="in_export_agent_tab">C&F CIF Shipment</Nav.Link>
                    </Nav.Item>
                    <Nav.Item>
                        <Nav.Link eventKey="port_of_loading_tab">FOB Shipment</Nav.Link>
                    </Nav.Item>
                </Nav>
                <Tab.Content>
                    <Tab.Pane eventKey="inorb_paid_pickup">
                        <Button
                            variant="info"
                            className="btn-sm"
                            startIcon={<FontAwesomeIcon icon={faCirclePlus} className="me-2" />}
                            onClick={() => handlePickupModal()}
                        >
                            Add Inorbvict Paid Pickup
                        </Button>
                        <Row className='mt-2 pb-4'>
                            <AdvanceTableProvider {...pickupTable}>
                                <PickupTable />
                            </AdvanceTableProvider>
                        </Row>
                        {showModal && (
                            <PickupModal btId={btId} pickupId={pickupId} ffdData={ffdData} poData={poData} onHide={() => handleClose('pickup')} onSuccess={handleSuccess} />
                        )}
                    </Tab.Pane>
                    <Tab.Pane eventKey="served_by_supplier">
                        <h5>From Inorbvict Vendor to Inorbvict Premises</h5>
                        <Button
                            variant="info"
                            className="btn-sm"
                            startIcon={<FontAwesomeIcon icon={faCirclePlus} className="me-2" />}
                            onClick={() => handleSupplierModal()}
                        >
                            Add Supplier Paid Dispatch
                        </Button>
                        <Row className='mt-2 pb-4'>
                            <AdvanceTableProvider {...supplierTable}>
                                <SupplierTable />
                            </AdvanceTableProvider>
                        </Row>
                        {showSupplierModal && (
                            <SupplierModal btId={btId} pickupId={pickupId} ffdData={ffdData} onHide={() => handleClose('supplier')} onSuccess={handleSuccess} />
                        )}
                    </Tab.Pane>
                    <Tab.Pane eventKey="importer_pickup_tab">
                        <Button
                            variant="info"
                            className="btn-sm"
                            startIcon={<FontAwesomeIcon icon={faCirclePlus} className="me-2" />}
                            onClick={() => handleExwModal()}
                        >
                            Add EXW Shipment
                        </Button>
                        <Row className='mt-2 pb-4'>
                            <AdvanceTableProvider {...exwTable}>
                                <ExwTable />
                            </AdvanceTableProvider>
                        </Row>
                        {showExwModal && (
                            <ExwModal btId={btId} exwId={pickupId} ffdData={ffdData} onHide={() => handleClose('exw')} onSuccess={handleSuccess} />
                        )}
                    </Tab.Pane>
                    <Tab.Pane eventKey="in_export_agent_tab">
                        <Button
                            variant="info"
                            className="btn-sm"
                            startIcon={<FontAwesomeIcon icon={faCirclePlus} className="me-2" />}
                            onClick={() => handleCifModal()}
                        >
                            Add C&F CIF Shipment
                        </Button>
                        <Row className='mt-2 pb-4'>
                            <AdvanceTableProvider {...cifTable}>
                                <CifTable />
                            </AdvanceTableProvider>
                        </Row>
                        {showCifModal && (
                            <CifModal btId={btId} cifId={pickupId} ffdData={ffdData} onHide={() => handleClose('cif')} onSuccess={handleSuccess} />
                        )}
                    </Tab.Pane>
                    <Tab.Pane eventKey="port_of_loading_tab">
                        <Button
                            variant="info"
                            className="btn-sm"
                            startIcon={<FontAwesomeIcon icon={faCirclePlus} className="me-2" />}
                            onClick={() => handleFobModal()}
                        >
                            Add FOB Shipment
                        </Button>
                        <Row className='mt-2 pb-4'>
                            <AdvanceTableProvider {...fobTable}>
                                <FobTable />
                            </AdvanceTableProvider>
                        </Row>
                        {showFobModal && (
                            <FobModal btId={btId} exwId={pickupId} ffdData={ffdData} poData={poData} onHide={() => handleClose('fob')} onSuccess={handleSuccess} />
                        )}
                    </Tab.Pane>
                </Tab.Content>
            </Tab.Container>
        </>
    )
};

export default ExportOngoingShipment;


//PICKUP CONTENTS
const pickupTableColumns = (handlePickupModal: (pickupId?: number) => void): ColumnDef<PaidPickup>[] => [
    {
        accessorKey: 'pick_up_location',
        header: () => {
            return (
                <div className="d-inline-flex flex-center">
                    <span>Pick Up Location</span>
                </div>
            );
        },
        cell: ({ row: { original } }) => {
            const { pick_up_location } = original;

            return (
                <span>{ pick_up_location }</span>
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
                <span>{ffd_name ? ffd_name.ffd_name : ''}</span>
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
        accessorKey: 'opu_freight_cost',
        header: () => {
            return (
                <div className="d-inline-flex flex-center">
                    <span>Freight Cost</span>
                </div>
            );
        },
        cell: ({ row: { original } }) => {
            const { opu_freight_cost } = original;
            return (
                <span>{opu_freight_cost}</span>
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
        accessorKey: 'purchase_order_no',
        header: () => {
            return (
                <div className="d-inline-flex flex-center">
                    <span>PO NO</span>
                </div>
            );
        },
        cell: ({ row: { original } }) => {
            const { purchase_order_no, purchase_order } = original;
            return (
                <span>{purchase_order ? purchase_order.purchase_order_number : ''}</span>
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
        accessorKey: 'pickup_refrence_number',
        header: () => {
            return (
                <div className="d-inline-flex flex-center">
                    <span>Pick Up Ref No</span>
                </div>
            );
        },
        cell: ({ row: { original } }) => {
            const { pickup_refrence_number } = original;
            return (
                <span>{pickup_refrence_number}</span>
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
        accessorKey: 'pick_up_booking_date',
        header: () => {
            return (
                <div className="d-inline-flex flex-center">
                    <span>Pick Up Booking Dt</span>
                </div>
            );
        },
        cell: ({ row: { original } }) => {
            const { pick_up_booking_date } = original;
            return (
                <span>{pick_up_booking_date}</span>
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
                <><Button variant='link' title='Edit Paid Pickup details' onClick={() => handlePickupModal(id)} startIcon={<FontAwesomeIcon icon={faEdit} />}></Button></>
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
const PickupTable = () => {
    return (
        <div className="border-top border-translucent">
            <AdvanceTable
                tableProps={{ className: 'phoenix-table fs-9' }}
                rowClassName="hover-actions-trigger btn-reveal-trigger"
            />
        </div>
    );
};

interface PickupModalProps {
    btId: number;
    pickupId?: number;
    ffdData: FFDData[];
    poData: PurchaseOrderData[];
    onHide: () => void;
    onSuccess: (refreshString: string) => void;
}
const PickupModal: React.FC<PickupModalProps> = ({ btId, pickupId, ffdData, poData, onHide, onSuccess}) => {
    const [custData, setUserData] = useState<PaidPickup>({
        id: 0,
        business_task_id: btId,
        ffd_id: 0,
        ffd_name: { id: 0, ffd_name: '' },
        pick_up_location: '',
        delivery_location: '',
        opu_freight_cost: '',
        purchase_order_no: 0,
        purchase_order: { id: 0, purchase_order_number:'' },
        pickup_refrence_number: '',
        pick_up_booking_date: ''
    });
    const [isEditing, setIsEditing] = useState<boolean>(false);
    const [validated, setValidated] = useState<boolean>(false);
    const [loading, setLoading] = useState(false);
    useEffect(() => {

        if (pickupId) {
            setIsEditing(true);
            // Fetch freight data for editing
            axiosInstance.get(`/editOwnpickupBt/${pickupId}`)
            .then(response => {
                setUserData(response.data);
            })
            .catch(error => console.error('Error fetching freight data:', error));
        }
    }, [pickupId]);

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
    const handlePurchaseSelect = (selectedOption: any) => {
        if (selectedOption) {
            setUserData(prev => ({
                ...prev,
                purchase_order: { id: selectedOption.value, purchase_order_number: selectedOption.label },
                purchase_order_no: selectedOption.value
            }));
        }
    };
    const handleRSelect = (selectedOption: { value: number; label: string } | null, fieldName: string) => {
        if (selectedOption) {
            if(fieldName == 'ffd_name') {
                setUserData({ ...custData, ffd_name: {
                    id: selectedOption.value,
                    ffd_name: selectedOption.label
                }, ffd_id: selectedOption.value });
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
            ? axiosInstance.put(`/updateOwnpickupBt/${custData.id}`,  {
                business_task_id: btId,
                ffd_id: custData.ffd_id,
                pick_up_location: custData.pick_up_location,
                delivery_location: custData.delivery_location,
                opu_freight_cost: custData.opu_freight_cost,
                purchase_order_no: custData.purchase_order_no,
                pickup_refrence_number: custData.pickup_refrence_number,
                pick_up_booking_date: custData.pick_up_booking_date,
            })
            : axiosInstance.post('/storeOwnpickupBt', custData );

        apiCall
            .then((response) => {
                swal("Success!", response.data.message, "success");
            onSuccess('pickup');
            onHide();
        })
        .catch(error => swal("Error!", error.data.message, "error"))
        .finally(() => { setLoading(false); });
    };
    return (
        <>
            <Modal show onHide={onHide} size="xl" backdrop="static" keyboard={false}>
                <Modal.Header closeButton>
                    <Modal.Title>{isEditing ? 'Edit Inorbvict Paid Pickup Details' : 'Add Inorbvict Paid Pickup Details'}</Modal.Title>
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
                                    placeholder="Select Freight" name="ffd_name" value={custData.ffd_name ? { value: custData.ffd_name.id, label: custData.ffd_name.ffd_name } : null} onChange={(selectedOption) => handleRSelect(selectedOption, 'ffd_name')} required
                                />
                                <Form.Control type="hidden" name="ffd_id" value={custData.ffd_id} />
                            </Form.Group>
                        </Row>

                        <Row className="g-3">
                        <Form.Group as={Col} className="mb-3" controlId="pick_up_location">
                                <Form.Label>Pick Up Location <span className="text-danger">*</span></Form.Label>
                                <Form.Control type="text" placeholder="Inorbvict Vendor Location" name="pick_up_location" value={custData.pick_up_location} onChange={handleChange} required />
                                <Form.Control.Feedback type="invalid">Please enter Pick Up Location.</Form.Control.Feedback>
                            </Form.Group>
                            <Form.Group as={Col} className="mb-3" controlId="delivery_location">
                                <Form.Label>Delivery Location <span className="text-danger">*</span></Form.Label>
                                <Form.Control type="text" placeholder="Our Place" name="delivery_location" value={custData.delivery_location} onChange={handleChange} required />
                                <Form.Control.Feedback type="invalid">Please enter delivery Location.</Form.Control.Feedback>
                            </Form.Group>
                            <Form.Group as={Col} className="mb-3" controlId="opu_freight_cost">
                                <Form.Label>OPU Freight cost <span className="text-danger">*</span></Form.Label>
                                <Form.Control type="text" placeholder="OPC To Inorbvict" name="opu_freight_cost" value={custData.opu_freight_cost} onChange={handleChange} required />
                                <Form.Control.Feedback type="invalid">Please enter Freight cost.</Form.Control.Feedback>
                            </Form.Group>
                        </Row>
                        <Row className="g-3">
                            <Form.Group as={Col} className="mb-3" controlId="purchase_order">
                                <Form.Label>Purchase Order No <span className="text-danger">*</span></Form.Label>
                                <ReactSelect
                                    options= {poData.map((option: PurchaseOrderData) => (
                                        { value: option.id, label: option.purchase_order_number }
                                    ))}
                                    placeholder="Select Freight" name="purchase_order" value={custData.purchase_order ? { value: custData.purchase_order.id, label: custData.purchase_order.purchase_order_number } : null} onChange={(selectedOption) => handlePurchaseSelect(selectedOption)} required
                                />
                                <Form.Control type="hidden" name="purchase_order_no" value={custData.purchase_order_no} />
                                {validated && !custData.purchase_order_no && (
                                    <div className="invalid-feedback d-block">Please enter purchase order number</div>
                                )}
                            </Form.Group>
                            <Form.Group as={Col} className="mb-3" controlId="pickup_refrence_number">
                                <Form.Label>PickUp Refrence Number <span className="text-danger">*</span></Form.Label>
                                <Form.Control type="text" placeholder="Provided by FFW" name="pickup_refrence_number" value={custData.pickup_refrence_number} onChange={handleChange} required />
                                <Form.Control.Feedback type="invalid">Please enter PickUp Refrence Number.</Form.Control.Feedback>
                            </Form.Group>
                            <Form.Group as={Col} className="mb-3" controlId="pick_up_booking_date">
                                <Form.Label>PickUp Booking Date <span className="text-danger">*</span></Form.Label>
                                <Form.Control type="date" placeholder="Contact Person Email" name="pick_up_booking_date" value={custData.pick_up_booking_date} onChange={handleChange} required />
                                <Form.Control.Feedback type="invalid">Please enter PickUp Booking Date.</Form.Control.Feedback>
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

//SUPPLIER CONTENTS
const supplierTableColumns = (handleSupplierModal: (pickupId?: number) => void): ColumnDef<SupplierPaidDispatch>[] => [
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
                <span>{ffd_name ? ffd_name.ffd_name : ''}</span>
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
        accessorKey: 'pod_lorry_receipt',
        header: () => {
            return (
                <div className="d-inline-flex flex-center">
                    <span>POD/LR No</span>
                </div>
            );
        },
        cell: ({ row: { original } }) => {
            const { pod_lorry_receipt } = original;
            return (
                <span>{pod_lorry_receipt}</span>
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
        accessorKey: 'booking_date',
        header: () => {
            return (
                <div className="d-inline-flex flex-center">
                    <span>Booking Date</span>
                </div>
            );
        },
        cell: ({ row: { original } }) => {
            const { booking_date } = original;
            return (
                <span>{booking_date}</span>
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
                <><Button variant='link' title='Edit Supplier Paid Dispatch details' onClick={() => handleSupplierModal(id)} startIcon={<FontAwesomeIcon icon={faEdit} />}></Button></>
            );
        },
        meta: {
            headerProps: {
                style: { width: '5%' },
                className: 'ps-2 pe-2 border-start border-end border-translucent'
            },
            cellProps: {
                className:
                'white-space-nowrap fw-semibold ps-2 border-start border-end border-translucent'
            }
        }
    },
];
const SupplierTable = () => {
    return (
        <div className="border-top border-translucent">
            <AdvanceTable
                tableProps={{ className: 'phoenix-table fs-9' }}
                rowClassName="hover-actions-trigger btn-reveal-trigger"
            />
        </div>
    );
};

interface SupplierModalProps {
    btId: number;
    pickupId?: number;
    ffdData: FFDData[];
    onHide: () => void;
    onSuccess: (refreshString: string) => void;
}
const SupplierModal: React.FC<SupplierModalProps> = ({ btId, pickupId, ffdData, onHide, onSuccess}) => {
    const [supplyData, setSupplyData] = useState<SupplierPaidDispatch>({
        id: 0,
        business_task_id: btId,
        ffd_id: 0,
        ffd_name: { id: 0, ffd_name: '' },
        pod_lorry_receipt: '',
        booking_date: ''
    });
    const [isEditing, setIsEditing] = useState<boolean>(false);
    const [validated, setValidated] = useState<boolean>(false);
    const [loading, setLoading] = useState(false);
    useEffect(() => {

        if (pickupId) {
            setIsEditing(true);
            // Fetch freight data for editing
            axiosInstance.get(`/editServeBySuppliersBt/${pickupId}`)
            .then(response => {
                setSupplyData(response.data);
            })
            .catch(error => console.error('Error fetching freight data:', error));
        }
    }, [pickupId]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;

        // Update purchase price
        const updatedCustData = { ...supplyData, [name]: value };

        setSupplyData(updatedCustData);
    };

    const handleRSelect = (selectedOption: { value: number; label: string } | null, fieldName: string) => {
        if (selectedOption) {
            if(fieldName == 'ffd_name') {
                setSupplyData({ ...supplyData, ffd_name: {
                    id: selectedOption.value,
                    ffd_name: selectedOption.label
                }, ffd_id: selectedOption.value });
            }
        } else {
            setSupplyData({ ...supplyData, [fieldName]: null });
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
            ? axiosInstance.put(`/updateServeBySuppliersBt/${supplyData.id}`,  {
                business_task_id: btId,
                ffd_id: supplyData.ffd_id,
                pod_lorry_receipt: supplyData.pod_lorry_receipt,
                booking_date: supplyData.booking_date,
            })
            : axiosInstance.post('/storeServeBySuppliersBt', supplyData );

        apiCall
            .then((response) => {
                swal("Success!", response.data.message, "success");
            onSuccess('supplier');
            onHide();
        })
        .catch(error => swal("Error!", error.data.message, "error"))
        .finally(() => { setLoading(false); });
    };
    return (
        <>
            <Modal show onHide={onHide} size="xl" backdrop="static" keyboard={false}>
                <Modal.Header closeButton>
                    <Modal.Title>{isEditing ? 'Edit Inorbvict Paid Pickup Details' : 'Add Inorbvict Paid Pickup Details'}</Modal.Title>
                </Modal.Header>
                <Form noValidate validated={validated} onSubmit={handleSubmit}>
                    <Modal.Body>
                        <Form.Control type="hidden" name="id" value={supplyData.id} />
                        <Form.Control type="hidden" name="business_task_id" value={supplyData.business_task_id} />
                        <Row className="g-3">
                            <Form.Group as={Col} className="mb-3" controlId="ffd_name">
                                <Form.Label>FFD Name <span className="text-danger">*</span></Form.Label>
                                <ReactSelect
                                    options= {ffdData.map((option: FFDData) => (
                                        { value: option.id, label: option.ffd_name }
                                    ))}
                                    placeholder="Select Freight" name="ffd_name" value={supplyData.ffd_name ? { value: supplyData.ffd_name.id, label: supplyData.ffd_name.ffd_name } : null} onChange={(selectedOption) => handleRSelect(selectedOption, 'ffd_name')} required
                                />
                                <Form.Control type="hidden" name="ffd_id" value={supplyData.ffd_id} />
                            </Form.Group>
                        </Row>
                        <Row className="g-3">
                            <Form.Group as={Col} className="mb-3" controlId="pod_lorry_receipt">
                                <Form.Label>POD/Lorry Receipt/Bilti/ LR Number <span className="text-danger">*</span></Form.Label>
                                <Form.Control type="text" placeholder="Tracking Number/Courier POD NO " name="pod_lorry_receipt" value={supplyData.pod_lorry_receipt} onChange={handleChange} required />
                                <Form.Control.Feedback type="invalid">Please enter POD/Lorry Receipt/Bilti/ LR Number.</Form.Control.Feedback>
                            </Form.Group>
                            <Form.Group as={Col} className="mb-3" controlId="booking_date">
                                <Form.Label>Date <span className="text-danger">*</span></Form.Label>
                                <Form.Control type="date" name="booking_date" value={supplyData.booking_date} onChange={handleChange} required />
                                <Form.Control.Feedback type="invalid">Please enter date.</Form.Control.Feedback>
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

//EXW CONTENTS
const exwTableColumns = (handleExwModal: (pickupId?: number) => void): ColumnDef<ExWShipment>[] => [
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
                <span>{ffd_name ? ffd_name.ffd_name : ''}</span>
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
        accessorKey: 'pick_up_reference_number',
        header: () => {
            return (
                <div className="d-inline-flex flex-center">
                    <span>PickUp Refrence Number</span>
                </div>
            );
        },
        cell: ({ row: { original } }) => {
            const { pick_up_reference_number } = original;
            return (
                <span>{pick_up_reference_number}</span>
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
        accessorKey: 'pick_up_booking_date',
        header: () => {
            return (
                <div className="d-inline-flex flex-center">
                    <span>PickUp Booking Date</span>
                </div>
            );
        },
        cell: ({ row: { original } }) => {
            const { pick_up_booking_date } = original;
            return (
                <span>{pick_up_booking_date}</span>
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
                <><Button variant='link' title='Edit EXW Shipment details' onClick={() => handleExwModal(id)} startIcon={<FontAwesomeIcon icon={faEdit} />}></Button></>
            );
        },
        meta: {
            headerProps: {
                style: { width: '5%' },
                className: 'ps-2 pe-2 border-start border-end border-translucent'
            },
            cellProps: {
                className:
                'white-space-nowrap fw-semibold ps-2 border-start border-end border-translucent'
            }
        }
    },
];
const ExwTable = () => {
    return (
        <div className="border-top border-translucent">
            <AdvanceTable
                tableProps={{ className: 'phoenix-table fs-9' }}
                rowClassName="hover-actions-trigger btn-reveal-trigger"
            />
        </div>
    );
};

interface ExwModalProps {
    btId: number;
    exwId?: number;
    ffdData: FFDData[];
    onHide: () => void;
    onSuccess: (refreshString: string) => void;
}
const ExwModal: React.FC<ExwModalProps> = ({ btId, exwId, ffdData, onHide, onSuccess}) => {
    const [ExwData, setExwData] = useState<ExWShipment>({
        id: 0,
        business_task_id: btId,
        ffd_id: 0,
        ffd_name: { id: 0, ffd_name: '' },
        pick_up_reference_number: '',
        pick_up_booking_date: ''
    });
    const [isEditing, setIsEditing] = useState<boolean>(false);
    const [validated, setValidated] = useState<boolean>(false);
    const [loading, setLoading] = useState(false);
    useEffect(() => {

        if (exwId) {
            setIsEditing(true);
            // Fetch freight data for editing
            axiosInstance.get(`/editImportPickupBt/${exwId}`)
            .then(response => {
                setExwData(response.data);
            })
            .catch(error => console.error('Error fetching freight data:', error));
        }
    }, [exwId]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;

        // Update purchase price
        const updatedCustData = { ...ExwData, [name]: value };

        setExwData(updatedCustData);
    };

    const handleRSelect = (selectedOption: { value: number; label: string } | null, fieldName: string) => {
        if (selectedOption) {
            if(fieldName == 'ffd_name') {
                setExwData({ ...ExwData, ffd_name: {
                    id: selectedOption.value,
                    ffd_name: selectedOption.label
                }, ffd_id: selectedOption.value });
            }
        } else {
            setExwData({ ...ExwData, [fieldName]: null });
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
            ? axiosInstance.put(`/updateImportPickupBt/${ExwData.id}`,  {
                business_task_id: btId,
                ffd_id: ExwData.ffd_id,
                pick_up_reference_number: ExwData.pick_up_reference_number,
                pick_up_booking_date: ExwData.pick_up_booking_date,
            })
            : axiosInstance.post('/storeImportPickupBt', ExwData );

        apiCall
            .then((response) => {
                swal("Success!", response.data.message, "success");
            onSuccess('exw');
            onHide();
        })
        .catch(error => swal("Error!", error.data.message, "error"))
        .finally(() => { setLoading(false); });
    };
    return (
        <>
            <Modal show onHide={onHide} size="xl" backdrop="static" keyboard={false}>
                <Modal.Header closeButton>
                    <Modal.Title>{isEditing ? 'Edit Inorbvict Paid Pickup Details' : 'Add Inorbvict Paid Pickup Details'}</Modal.Title>
                </Modal.Header>
                <Form noValidate validated={validated} onSubmit={handleSubmit}>
                    <Modal.Body>
                        <Form.Control type="hidden" name="id" value={ExwData.id} />
                        <Form.Control type="hidden" name="business_task_id" value={ExwData.business_task_id} />
                        <Row className="g-3">
                            <Form.Group as={Col} className="mb-3" controlId="ffd_name">
                                <Form.Label>FFD Name <span className="text-danger">*</span></Form.Label>
                                <ReactSelect
                                    options= {ffdData.map((option: FFDData) => (
                                        { value: option.id, label: option.ffd_name }
                                    ))}
                                    placeholder="Select Freight" name="ffd_name" value={ExwData.ffd_name ? { value: ExwData.ffd_name.id, label: ExwData.ffd_name.ffd_name } : null} onChange={(selectedOption) => handleRSelect(selectedOption, 'ffd_name')} required
                                />
                                <Form.Control type="hidden" name="ffd_id" value={ExwData.ffd_id} />
                            </Form.Group>
                        </Row>
                        <Row className="g-3">
                            <Form.Group as={Col} className="mb-3" controlId="pick_up_reference_number">
                                <Form.Label>PickUp Refrence Number <span className="text-danger">*</span></Form.Label>
                                <Form.Control type="text" placeholder="Provided By Importer FFW" name="pick_up_reference_number" value={ExwData.pick_up_reference_number} onChange={handleChange} required />
                                <Form.Control.Feedback type="invalid">Please enter pickUp Refrence Number.</Form.Control.Feedback>
                            </Form.Group>
                            <Form.Group as={Col} className="mb-3" controlId="pick_up_booking_date">
                                <Form.Label>PickUp Booking Date <span className="text-danger">*</span></Form.Label>
                                <Form.Control type="date" name="pick_up_booking_date" value={ExwData.pick_up_booking_date} onChange={handleChange} required />
                                <Form.Control.Feedback type="invalid">Please enter date.</Form.Control.Feedback>
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

//CIF CONTENTS
const cifTableColumns = (handleCifModal: (pickupId?: number) => void): ColumnDef<CIFShipment>[] => [
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
                <span>{ffd_name ? ffd_name.ffd_name : ''}</span>
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
                <><Button variant='link' title='Edit C&F CIF Shipment details' onClick={() => handleCifModal(id)} startIcon={<FontAwesomeIcon icon={faEdit} />}></Button></>
            );
        },
        meta: {
            headerProps: {
                style: { width: '5%' },
                className: 'ps-2 pe-2 border-start border-end border-translucent'
            },
            cellProps: {
                className:
                'white-space-nowrap fw-semibold ps-2 border-start border-end border-translucent'
            }
        }
    },
];
const CifTable = () => {
    return (
        <div className="border-top border-translucent">
            <AdvanceTable
                tableProps={{ className: 'phoenix-table fs-9' }}
                rowClassName="hover-actions-trigger btn-reveal-trigger"
            />
        </div>
    );
};

interface CifModalProps {
    btId: number;
    cifId?: number;
    ffdData: FFDData[];
    onHide: () => void;
    onSuccess: (refreshString: string) => void;
}
const CifModal: React.FC<CifModalProps> = ({ btId, cifId, ffdData, onHide, onSuccess}) => {
    const [cifData, setCifData] = useState<CIFShipment>({
        id: 0,
        business_task_id: btId,
        ffd_id: 0,
        ffd_name: { id: 0, ffd_name: '' }
    });
    const [isEditing, setIsEditing] = useState<boolean>(false);
    const [validated, setValidated] = useState<boolean>(false);
    const [loading, setLoading] = useState(false);
    useEffect(() => {

        if (cifId) {
            setIsEditing(true);
            // Fetch freight data for editing
            axiosInstance.get(`/editExportAgentBt/${cifId}`)
            .then(response => {
                setCifData(response.data);
            })
            .catch(error => console.error('Error fetching C&F CIF shipment data:', error));
        }
    }, [cifId]);

    const handleRSelect = (selectedOption: { value: number; label: string } | null, fieldName: string) => {
        if (selectedOption) {
            if(fieldName == 'ffd_name') {
                setCifData({ ...cifData, ffd_name: {
                    id: selectedOption.value,
                    ffd_name: selectedOption.label
                }, ffd_id: selectedOption.value });
            }
        } else {
            setCifData({ ...cifData, [fieldName]: null });
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
            ? axiosInstance.put(`/updateExportAgentBt/${cifData.id}`,  {
                business_task_id: btId,
                ffd_id: cifData.ffd_id
            })
            : axiosInstance.post('/storeExportAgentBt', cifData );

        apiCall
            .then((response) => {
                swal("Success!", response.data.message, "success");
            onSuccess('cif');
            onHide();
        })
        .catch(error => swal("Error!", error.data.message, "error"))
        .finally(() => { setLoading(false); });
    };
    return (
        <>
            <Modal show onHide={onHide} size="xl" backdrop="static" keyboard={false}>
                <Modal.Header closeButton>
                    <Modal.Title>{isEditing ? 'Edit C&F CIF Shipment Details' : 'Add C&F CIF Shipment Details'}</Modal.Title>
                </Modal.Header>
                <Form noValidate validated={validated} onSubmit={handleSubmit}>
                    <Modal.Body>
                        <Form.Control type="hidden" name="id" value={cifData.id} />
                        <Form.Control type="hidden" name="business_task_id" value={cifData.business_task_id} />
                        <Row className="g-3">
                            <Form.Group as={Col} className="mb-3" controlId="ffd_name">
                                <Form.Label>FFD Name <span className="text-danger">*</span></Form.Label>
                                <ReactSelect
                                    options= {ffdData.map((option: FFDData) => (
                                        { value: option.id, label: option.ffd_name }
                                    ))}
                                    placeholder="Select Freight" name="ffd_name" value={cifData.ffd_name ? { value: cifData.ffd_name.id, label: cifData.ffd_name.ffd_name } : null} onChange={(selectedOption) => handleRSelect(selectedOption, 'ffd_name')} required
                                />
                                <Form.Control type="hidden" name="ffd_id" value={cifData.ffd_id} />
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

//FOB CONTENTS
const fobTableColumns = (handleFobModal: (pickupId?: number) => void): ColumnDef<FOBShipment>[] => [
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
                <span>{ffd_name ? ffd_name.ffd_name : ""}</span>
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
        accessorKey: 'freight_cost',
        header: () => {
            return (
                <div className="d-inline-flex flex-center">
                    <span>Freight Cost</span>
                </div>
            );
        },
        cell: ({ row: { original } }) => {
            const { freight_cost } = original;
            return (
                <span>{freight_cost}</span>
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
        accessorKey: 'po_no',
        header: () => {
            return (
                <div className="d-inline-flex flex-center">
                    <span>PO NO</span>
                </div>
            );
        },
        cell: ({ row: { original } }) => {
            const { purchase_order } = original;
            return (
                <span>{purchase_order ? purchase_order.purchase_order_number : ''}</span>
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
        accessorKey: 'pickup_refrence_number',
        header: () => {
            return (
                <div className="d-inline-flex flex-center">
                    <span>PickUp Refrence Number</span>
                </div>
            );
        },
        cell: ({ row: { original } }) => {
            const { pickup_refrence_number } = original;
            return (
                <span>{pickup_refrence_number}</span>
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
        accessorKey: 'pickup_booking_date',
        header: () => {
            return (
                <div className="d-inline-flex flex-center">
                    <span>PickUp Booking Date</span>
                </div>
            );
        },
        cell: ({ row: { original } }) => {
            const { pickup_booking_date } = original;
            return (
                <span>{pickup_booking_date}</span>
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
                <><Button variant='link' title='Edit C&F CIF Shipment details' onClick={() => handleFobModal(id)} startIcon={<FontAwesomeIcon icon={faEdit} />}></Button></>
            );
        },
        meta: {
            headerProps: {
                style: { width: '5%' },
                className: 'ps-2 pe-2 border-start border-end border-translucent'
            },
            cellProps: {
                className:
                'white-space-nowrap fw-semibold ps-2 border-start border-end border-translucent'
            }
        }
    },
];
const FobTable = () => {
    return (
        <div className="border-top border-translucent">
            <AdvanceTable
                tableProps={{ className: 'phoenix-table fs-9' }}
                rowClassName="hover-actions-trigger btn-reveal-trigger"
            />
        </div>
    );
};

interface FobModalProps {
    btId: number;
    exwId?: number;
    ffdData: FFDData[];
    poData: PurchaseOrderData[];
    onHide: () => void;
    onSuccess: (refreshString: string) => void;
}
const FobModal: React.FC<FobModalProps> = ({ btId, exwId, ffdData, poData, onHide, onSuccess}) => {
    const [fobData, setfobData] = useState<FOBShipment>({
        id: 0,
        business_task_id: btId,
        ffd_id: 0,
        ffd_name: null,
        freight_cost: 0,
        po_no: 0,
        purchase_order: null,
        pickup_refrence_number: '',
        pickup_booking_date: ''
    });
    const [isEditing, setIsEditing] = useState<boolean>(false);
    const [validated, setValidated] = useState<boolean>(false);
    const [loading, setLoading] = useState(false);
    useEffect(() => {

        if (exwId) {
            setIsEditing(true);
            // Fetch freight data for editing
            axiosInstance.get(`/editPortOfLandingBt/${exwId}`)
            .then(response => {
                setfobData(response.data);
            })
            .catch(error => console.error('Error fetching Fob shipment data:', error));
        }
    }, [exwId]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;

        // Update purchase price
        const updatedCustData = { ...fobData, [name]: value };

        setfobData(updatedCustData);
    };
    const handlePurchaseSelect = (selectedOption: any) => {
        if (selectedOption) {
            setfobData(prev => ({
                ...prev,
                purchase_order: { id: selectedOption.value, purchase_order_number: selectedOption.label },
                po_no: selectedOption.value
            }));
        }
    };
    const handleRSelect = (selectedOption: { value: number; label: string } | null, fieldName: string) => {
        if (selectedOption) {
            if(fieldName == 'ffd_name') {
                setfobData({ ...fobData, ffd_name: {
                    id: selectedOption.value,
                    ffd_name: selectedOption.label
                }, ffd_id: selectedOption.value });
            }
        } else {
            setfobData({ ...fobData, [fieldName]: null });
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
            ? axiosInstance.put(`/updatePortOfLandingBt/${fobData.id}`,  {
                business_task_id: btId,
                ffd_id: fobData.ffd_id,
                freight_cost: fobData.freight_cost,
                po_no: fobData.po_no,
                pickup_refrence_number: fobData.pickup_refrence_number,
                pickup_booking_date: fobData.pickup_booking_date
            })
            : axiosInstance.post('/storePortOfLandingBt', fobData );

        apiCall
            .then((response) => {
                swal("Success!", response.data.message, "success");
            onSuccess('fob');
            onHide();
        })
        .catch(error => swal("Error!", error.data.message, "error"))
        .finally(() => { setLoading(false); });
    };
    return (
        <>
            <Modal show onHide={onHide} size="xl" backdrop="static" keyboard={false}>
                <Modal.Header closeButton>
                    <Modal.Title>{isEditing ? 'Edit C&F CIF Shipment Details' : 'Add C&F CIF Shipment Details'}</Modal.Title>
                </Modal.Header>
                <Form noValidate validated={validated} onSubmit={handleSubmit}>
                    <Modal.Body>
                        <Form.Control type="hidden" name="id" value={fobData.id} />
                        <Form.Control type="hidden" name="business_task_id" value={fobData.business_task_id} />
                        <Row className="g-3">
                            <Form.Group as={Col} className="mb-3" controlId="ffd_name">
                                <Form.Label>FFD Name <span className="text-danger">*</span></Form.Label>
                                <ReactSelect
                                    options= {ffdData.map((option: FFDData) => (
                                        { value: option.id, label: option.ffd_name }
                                    ))}
                                    placeholder="Select Freight" name="ffd_name" value={fobData.ffd_name ? { value: fobData.ffd_name.id, label: fobData.ffd_name.ffd_name } : null} onChange={(selectedOption) => handleRSelect(selectedOption, 'ffd_name')} required
                                />
                                <Form.Control type="hidden" name="ffd_id" value={fobData.ffd_id} />
                                {validated && !fobData.ffd_id && (
                                    <div className="invalid-feedback d-block">Please enter freight </div>
                                )}
                            </Form.Group>
                            <Form.Group as={Col} className="mb-3" controlId="freight_cost">
                                <Form.Label>Freight cost <span className="text-danger">*</span></Form.Label>
                                <Form.Control type="number" min={0} onFocus={(e) => e.target.select()} placeholder="Domestic freight Cost" name="freight_cost" value={fobData.freight_cost} onChange={handleChange} required />
                                <Form.Control.Feedback type="invalid">Please enter Freight cost.</Form.Control.Feedback>
                            </Form.Group>
                            <Form.Group as={Col} className="mb-3" controlId="purchase_order">
                                <Form.Label>Purchase Order No <span className="text-danger">*</span></Form.Label>
                                <ReactSelect
                                    options= {poData.map((option: PurchaseOrderData) => (
                                        { value: option.id, label: option.purchase_order_number }
                                    ))}
                                    placeholder="Select Purchase Order" name="purchase_order" value={fobData.purchase_order ? { value: fobData.purchase_order.id, label: fobData.purchase_order.purchase_order_number } : null} onChange={(selectedOption) => handlePurchaseSelect(selectedOption)} required
                                />
                                <Form.Control type="hidden" name="po_no" value={fobData.po_no} />
                                {validated && !fobData.po_no && (
                                    <div className="invalid-feedback d-block">Please enter purchase order number</div>
                                )}
                            </Form.Group>
                        </Row>
                        <Row className="g-3">
                            <Form.Group as={Col} className="mb-3" controlId="pickup_refrence_number">
                                <Form.Label>PickUp Reference Number <span className="text-danger">*</span></Form.Label>
                                <Form.Control type="text" placeholder="Provided by FFW" name="pickup_refrence_number" value={fobData.pickup_refrence_number} onChange={handleChange} required />
                                <Form.Control.Feedback type="invalid">Please enter PickUp Reference Number.</Form.Control.Feedback>
                            </Form.Group>
                            <Form.Group as={Col} className="mb-3" controlId="pickup_booking_date">
                                <Form.Label>PickUp Booking Date <span className="text-danger">*</span></Form.Label>
                                <Form.Control type="date" placeholder="Pickup booking date" name="pickup_booking_date" value={fobData.pickup_booking_date} onChange={handleChange} required />
                                <Form.Control.Feedback type="invalid">Please enter PickUp Booking Date.</Form.Control.Feedback>
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
