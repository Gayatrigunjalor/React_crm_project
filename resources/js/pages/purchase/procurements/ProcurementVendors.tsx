import { faCirclePlus, faEdit, faTrash, faDownload } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import Button from '../../../components/base/Button';
import React, { useEffect, useState, ChangeEvent } from 'react';
import { Form, Modal, Col, Row, Card } from 'react-bootstrap';
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
import ReactSelect from '../../../components/base/ReactSelect';
import { downloadFile } from '../../../helpers/utils';

const handleDownload = async (fileName: string) => {
    try {
        // Fetch the file from the server using the upload ID
        const response = await axiosInstance.get(`/getFileDownload?filepath=uploads/procurement/attachments/${fileName}`, {
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
    } catch (error) {
        if (error.status === 404) {
            swal("Error!", 'File not found', "error");
        }
        console.error('Error downloading the file:', error);
    }
};
interface Params {
    procId: string | undefined;
}

export interface ProcurementData {
    id: number;
    proc_number: string;
    product_service_name: string;
    tat: string;
    status: string;
    assignee: {
        id: number;
        name: string;
    }
    created_name: {
        id: number;
        name: string;
    }
    products?: ProcurementProducts[];
}
interface ProcurementProducts {
    id: number;
    procurement_id?: number;
    product_service_name: string;
    quantity?: string;
    procurement_product_vendors_count?: number;
}
export interface ProcurementVendorsData {
    id: number;
    warranty: string;
    vendors: {
        id: number;
        name: string;
    }
    procurement_attachments: {
        id: number;
        name: string;
        procurement_id: number;
    }
}
const ProcurementVendors = () => {
    // Extract procId from URL parameters
    const { procId } = useParams<Params>();
    const [showModal, setShowModal] = useState<boolean>(false);
    const [refreshData, setRefreshData] = useState<boolean>(false);
    const [procurementVendorsTableData, setProcurementVendorsTableData] = useState<ProcurementVendorsData[]>([]);
    const [procurementData, setProcurementData] = useState<ProcurementData>({id: 0, proc_number: '', product_service_name: '', tat: '', status: '', assignee: { id: 0, name: ''}, created_name: { id: 0, name: ''}, products:[] });

    const [error, setError] = useState<string | null>(null);

    const [procVendorId, setProcVendorId] = useState<number | undefined>(undefined);
    const { userPermission } = useAuth(); //check userRole & permissions

    const handleShow = (procId?: number) => {
        setProcVendorId(procId);
        setShowModal(true);
    };

    const handleClose = () => setShowModal(false);

    const handleSuccess = () => {
        // Refresh data or perform any other action after successful submission
        setRefreshData(prev => !prev); // Toggle state to trigger re-fetch
    };

    const table = useAdvanceTable({
        data: procurementVendorsTableData,
        columns: procurementVendorsTableColumns(handleShow, handleSuccess),
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
        const fetchProcurementVendors = async () => {
            try {
                const response = await axiosInstance.get(`/procurement/vendors/${procId}`);
                if (response.status !== 200) {
                    throw new Error('Failed to fetch data');
                }
                const procurement_data: ProcurementData = await response.data.procurement;
                const data: ProcurementVendorsData[] = await response.data.vendors;
                setProcurementVendorsTableData(data);
                setProcurementData(procurement_data);
            } catch (err: any) {
                setError(err.data.message);
            } finally {
            }
        };
        fetchProcurementVendors();
    }, [refreshData]);


    // Use procId as needed

    if (error) return <div>Error: {error}</div>;

    return (
        <>
            <h2 className="mb-5">Procurement Vendor</h2>
            <Row className="g-3 justify-content-between mb-4">

                <Col md="auto" className="p-2 fw-semibold">Procurement Number :-  { procurementData.proc_number } </Col>
                <Col md="auto" className="p-2 fw-semibold">TAT :- { procurementData.tat } </Col>
                <Col md="auto" className="p-2 fw-semibold">Status :-   { procurementData.status } </Col>
                <Col md="auto" className="p-2 fw-semibold">Assignee Name :- { procurementData.assignee?.name } </Col>
                <Col md="auto" className="p-2 fw-semibold">Created By :- { procurementData.created_name?.name } </Col>
            </Row>
            <Row className="g-3 justify-content-between px-2 mb-4">
                {procurementData.products && procurementData.products.length > 0 && (
                    <table className='w-100'>
                        <thead>
                            <tr className='p-2 border border-secondary'>
                                <th className='p-2 '>Procurement Products</th>
                                <th className='p-2 border-start border-secondary'>Quantity</th>
                                <th className='p-2 border-start border-secondary'>Mapped Vendor(s)</th>
                            </tr>
                        </thead>
                        <tbody>
                            {procurementData.products.map((prod: ProcurementProducts, prod_index) => (
                                <tr key={prod_index}>
                                    <td className='p-2 border border-secondary'>{prod.product_service_name}</td>
                                    <td className='p-2 border border-secondary'>{prod.quantity}</td>
                                    <td className='p-2 border border-secondary'>{prod.procurement_product_vendors_count}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </Row>
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
                                {userPermission.product_vendor_create === 1 && !error && (
                                    <Button
                                        variant="primary"
                                        className=""
                                        startIcon={<FontAwesomeIcon icon={faCirclePlus} className="me-2" />}
                                        onClick={() => handleShow()}
                                    >
                                        Add Procurement Vendor
                                    </Button>
                                )}
                            </Col>
                        </Row>
                        <ProductVendorsTable />
                    </AdvanceTableProvider>
                </Card.Body>
            </Card>
            {showModal && (
                <ProcurementVendorsModal procId={procVendorId} procurementData={procurementData} onHide={handleClose} onSuccess={handleSuccess} />
            )}
        </>
    );
};

export default ProcurementVendors;

const handleDelete = (procId: number, handleSuccess: () => void) => {
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
            axiosInstance.delete(`/procurement-vendors/${procId}`)
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
const procurementVendorsTableColumns = (handleShow: (procId?: number) => void, handleSuccess: () => void): ColumnDef<ProcurementVendorsData>[] => [
    {
        accessorKey: 'vendors',
        header: () => {
            return (
                <div className="d-inline-flex flex-center">
                    <span>Vendor</span>
                </div>
            );
        },
        cell: ({ row: { original } }) => {
            const { vendors } = original;
            return (
                <span>{vendors ? vendors.name : ''}</span>
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
        accessorKey: 'warranty',
        header: () => {
            return (
                <div className="d-inline-flex flex-center">
                    <span>Warranty</span>
                </div>
            );
        },
        cell: ({ row: { original } }) => {
            const { warranty } = original;
            return (
                <span>{warranty}</span>
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
        accessorKey: 'pv_attachments',
        header: () => {
            return (
                <div className="d-inline-flex flex-center">
                    <span>Attachment Name</span>
                </div>
            );
        },
        cell: ({ row: { original } }) => {
            const { procurement_attachments } = original;
            return (
                <>
                    {procurement_attachments && (
                        <Button
                            key={procurement_attachments.id}
                            className="text-primary p-0"
                            variant="link"
                            title="Download"
                            onClick={() => handleDownload(procurement_attachments.name)}
                            startIcon={<FontAwesomeIcon icon={faDownload} />}
                        >
                            {procurement_attachments.name}
                        </Button>
                    )}
                </>
            );
        },
        meta: {
            headerProps: {
                style: { width: '15%' },
                className: 'ps-2 pe-2 border-end border-translucent'
            },
            cellProps: {
                className:
                'ps-2 border-end border-translucent'
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
                    {userPermission.procurement_vendor_edit == 1 && (
                        <Button variant='phoenix-info' onClick={() => handleShow(id)} startIcon={<FontAwesomeIcon icon={faEdit} />}></Button>
                    )}
                    {userPermission.procurement_vendor_delete == 1 && (
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
const ProductVendorsTable = () => {
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
interface VendorData {
    id: number;
    name: string;
}
interface ProductVendorsModalProps {
    procId?: number;
    procurementData: ProcurementData;
    onHide: () => void;
    onSuccess: () => void;
}
interface GstData {
    id: number;
    percent: string;
}
interface CategoryData {
    id: number;
    name: string;
}

interface FormData {
    id?: number;
    procurement_product_id: number;
    procurement_product: ProcurementProducts | null;
    product_identifying_name: string;
    vendor_id: number;
    vendors: CategoryData | null;
    delivery_date: string;
    warranty: string;
    mfg_year: string;
    ready_stock_availability: string;
    lead_time: string;
    payment_term: string;
    product_cost: number;
    transportation_cost: number;
    installation_cost: number;
    grand_total: number;
    gst_percent: GstData | null;
    gst_percent_id: number;
    make: string;
    model: string;
    product_type_id: number;
    product_type: CategoryData | null;
    product_condition_id: number;
    product_condition: CategoryData | null;
    expiry_period: string;
    attachment_name: string;
    details: string;
    attachment: File | null;
    procurement_attachments: {
        name: string;
        attachment_name: string;
        details: string;
    }
}
const ProcurementVendorsModal: React.FC<ProductVendorsModalProps> = ({ procId, procurementData, onHide, onSuccess}) => {
    const [custData, setUserData] = useState<FormData>({
        id: 0,
        procurement_product_id: 0,
        procurement_product: null,
        product_identifying_name: '',
        vendor_id: 0,
        vendors: null,
        delivery_date: '',
        warranty: '',
        mfg_year: '',
        ready_stock_availability: '',
        lead_time:'',
        payment_term:'',
        product_cost: 0,
        transportation_cost: 0,
        installation_cost: 0,
        gst_percent: null,
        gst_percent_id: 0,
        grand_total: 0,
        make:'',
        model: '',
        product_type_id: 0,
        product_type: null,
        product_condition_id: 0,
        product_condition: null,
        expiry_period:'',
        attachment_name: 'Procurement',
        details:'',
        attachment: null,
        procurement_attachments: {
            name: '',
            attachment_name: '',
            details: ''
        }
    });
    const [isEditing, setIsEditing] = useState<boolean>(false);
    const [validated, setValidated] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [vendorsList, setVendorsList] = useState([]);
    const [gstPercentData, setGstPercentData] = useState<GstData[]>([]);
    const [productTypeData, setProductTypeData] = useState([]);
    const [productConditionData, setProductConditionData] = useState([]);

    useEffect(() => {
        if (procId) {
            setIsEditing(true);
            // Fetch vendors data for editing
            axiosInstance.get(`/procurement-vendors/${procId}`)
            .then(response => {
                setUserData(response.data);
            })
            .catch(error => console.error('Error fetching vendors data:', error));
        }
    }, [procId]);
    useEffect(() => {
        const fetchVendorList = async () => {
            try {
                const response = await axiosInstance.get('/vendorsList');
                if (response.status !== 200) {
                    throw new Error('Failed to fetch data');
                }
                const data = await response.data;
                setVendorsList(data);
            } catch (err: any) {
                setError(err.message);
            } finally {
            }
        };
        const fetchGstPercent = async () => {
            try {
                const response = await axiosInstance.get('/gstPercentListing');
                if (response.status !== 200) {
                    throw new Error('Failed to fetch data');
                }
                const data: GstData[] = await response.data;
                setGstPercentData(data);
            } catch (err: any) {
                setError(err.message);
            } finally {
            }
        };
        const fetchProductType = async () => {
            try {
                const response = await axiosInstance.get('/productTypeListing');
                if (response.status !== 200) {
                    throw new Error('Failed to fetch data');
                }
                const data = await response.data;
                setProductTypeData(data);
            } catch (err: any) {
                setError(err.message);
            } finally {
            }
        };
        const fetchProductCondition = async () => {
            try {
                const response = await axiosInstance.get('/productConditionListing');
                if (response.status !== 200) {
                    throw new Error('Failed to fetch data');
                }
                const data = await response.data;
                setProductConditionData(data);
            } catch (err: any) {
                setError(err.message);
            } finally {
            }
        };
        fetchVendorList();
        fetchGstPercent();
        fetchProductType();
        fetchProductCondition();
    }, []);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        if(name === 'details' && isEditing){
            setUserData({ ...custData,
                procurement_attachments: {
                    name: custData.procurement_attachments.name,
                    details: value,
                    attachment_name: custData.procurement_attachments.attachment_name
                }
            });
        }
        setUserData({ ...custData, [name]: value });
        // Calculate GST amount and grand total if applicable fields are updated
        if (["product_cost", "transportation_cost", "installation_cost"].includes(name)) {
            calculateTotal(name, Number(value));
        }
    };

    const calculateTotal = (name : string, value: number) => {
        const updatedCustData = { ...custData, [name]: value };
        // Calculate GST amount and grand total if applicable fields are updated
        if (["product_cost", "transportation_cost", "installation_cost", "gst_percent_id"].includes(name)) {
            const productCost = Number(updatedCustData.product_cost || 0);
            const transportationCost = Number(updatedCustData.transportation_cost || 0);
            const installationCost = Number(updatedCustData.installation_cost || 0);
            const gstPercent = Number(updatedCustData.gst_percent?.percent || 0);

            const gstAmount = (gstPercent !== 0) ? ((productCost * gstPercent) / 100) : 0;
            const totalAmount = productCost + transportationCost + installationCost + gstAmount;

            updatedCustData.grand_total = parseFloat(totalAmount.toFixed(2)); // Keep grand_total as a number
        }
        setUserData(updatedCustData);
    };

    useEffect(() => {
        calculateTotal('gst_percent_id', Number(custData.gst_percent_id));
    }, [custData.gst_percent_id]);

    const handleProductNameSelect = (selectedOption: any) => {
        if (selectedOption) {
            setUserData(prev => ({
                ...prev,
                procurement_product: { id: selectedOption.value, product_service_name: selectedOption.label },
                procurement_product_id: selectedOption.value
            }));
        }
    };

    const handleRSelect = (selectedOption: { value: number; label: string } | null, fieldName: string) => {
        if (selectedOption) {
            if(fieldName == 'vendors'){
                setUserData({ ...custData, vendors: {
                    id: selectedOption.value,
                    name: selectedOption.label
                }, vendor_id: selectedOption.value });
            }
            if(fieldName == 'gst_percent'){
                setUserData({ ...custData,
                gst_percent: {
                    id: selectedOption.value,
                    percent: selectedOption.label
                }, gst_percent_id: selectedOption.value });
            }
            if(fieldName == 'product_type'){
                setUserData({ ...custData, product_type: {
                    id: selectedOption.value,
                    name: selectedOption.label
                }, product_type_id: selectedOption.value });
            }
            if(fieldName == 'product_condition'){
                setUserData({ ...custData, product_condition: {
                    id: selectedOption.value,
                    name: selectedOption.label
                }, product_condition_id: selectedOption.value });
            }
        } else {
            setUserData({ ...custData, [fieldName]: null });
        }
    };

    // Handler function for the file input change event
    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files ? event.target.files[0] : null;
        setUserData({ ...custData, attachment: file });
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
            ? axiosInstance.post(`/updateProcurementVendor`,  {
                id:                         custData.id,
                vendor_id:                  custData.vendor_id,
                procurement_id:             procurementData.id,
                procurement_product_id:     custData.procurement_product_id,
                product_identifying_name:     custData.product_identifying_name,
                delivery_date:              custData.delivery_date,
                warranty:                   custData.warranty,
                mfg_year:                   custData.mfg_year,
                ready_stock_availability:   custData.ready_stock_availability,
                lead_time:                  custData.lead_time,
                payment_term:               custData.payment_term,
                product_cost:               custData.product_cost,
                gst_percent_id:             custData.gst_percent_id,
                grand_total:                custData.grand_total,
                transportation_cost:        custData.transportation_cost,
                installation_cost:          custData.installation_cost,
                make:                       custData.make,
                model:                      custData.model,
                product_type_id:            custData.product_type_id,
                product_condition_id:       custData.product_condition_id,
                expiry_period:              custData.expiry_period,
                details:                    custData.procurement_attachments.details,
                attachment_name:            'Procurement',
                attachment:                 custData.attachment,
            }, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            })
            : axiosInstance.post('/procurement-vendors', {
                ...custData,
                procurement_id: procurementData.id
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
            <Modal show onHide={onHide} size="xl" backdrop="static" keyboard={false}>
                <Modal.Header closeButton>
                    <Modal.Title>{isEditing ? 'Edit Procurement Vendor' : 'Add Procurement Vendor'} against <span className='text-danger'> Procurement Number : { procurementData.proc_number }</span></Modal.Title>
                </Modal.Header>
                <Form noValidate validated={validated} onSubmit={handleSubmit}>
                    <Modal.Body>
                        <Form.Control type="hidden" name="id" value={custData.id} />

                        <Row className='g-3 px-2'>
                            <Col><h4>Product Details</h4></Col>
                        </Row>

                        <Row className='g-3 px-2'>
                            <Form.Group as={Col} className="mb-3">
                                <Form.Label>Product Name <span className="text-danger">*</span></Form.Label>
                                <ReactSelect
                                    options= {procurementData.products && procurementData.products.map((option: ProcurementProducts) => (
                                        { value: option.id, label: option.product_service_name }
                                    ))}
                                    placeholder="Select Product Name" name="procurement_product" value={custData.procurement_product ? { value: custData.procurement_product.id, label: custData.procurement_product.product_service_name } : null}  onChange={(selectedOption) => handleProductNameSelect(selectedOption)} required
                                />
                                <Form.Control type="hidden" name="vendor_id" value={custData.procurement_product_id} />
                                {validated && !custData.procurement_product_id && (
                                    <div className="invalid-feedback d-block">Please enter Product</div>
                                )}
                            </Form.Group>
                            <Form.Group as={Col} className="mb-3" controlId="product_identifying_name">
                                <Form.Label>Product Identifying Name <span className="text-danger">*</span></Form.Label>
                                <Form.Control type="text" placeholder="Brand name" name="product_identifying_name" value={custData.product_identifying_name} onChange={handleChange} required />
                                <Form.Control.Feedback type="invalid">Please enter Product Identifying Name.</Form.Control.Feedback>
                            </Form.Group>
                        </Row>

                        <Row className='g-3 px-2'>
                            <Form.Group as={Col} className="mb-3" controlId="make">
                                <Form.Label>Make <span className="text-danger">*</span></Form.Label>
                                <Form.Control type="text" placeholder="Make" name="make" value={custData.make} onChange={handleChange} required />
                                <Form.Control.Feedback type="invalid">Please enter Make.</Form.Control.Feedback>
                            </Form.Group>
                            <Form.Group as={Col} className="mb-3" controlId="model">
                                <Form.Label>Model <span className="text-danger">*</span></Form.Label>
                                <Form.Control type="text" placeholder="Model" name="model" value={custData.model} onChange={handleChange} required />
                                <Form.Control.Feedback type="invalid">Please enter Model.</Form.Control.Feedback>
                            </Form.Group>
                            <Form.Group as={Col} className="mb-3" controlId="product_type_id">
                                <Form.Label>Product Type <span className="text-danger">*</span></Form.Label>
                                <ReactSelect
                                    options= {productTypeData.map((option: CategoryData) => (
                                        { value: option.id, label: option.name }
                                    ))}
                                    placeholder="Select Product Type" name="product_type" value={custData.product_type ? { value: custData.product_type.id, label: custData.product_type.name } : null} onChange={(selectedOption) => handleRSelect(selectedOption, 'product_type')} required
                                />
                                <Form.Control type="hidden" name="product_type_id" value={custData.product_type_id} />
                                {validated && !custData.product_type_id && (
                                    <div className="invalid-feedback d-block">Please enter product type</div>
                                )}
                            </Form.Group>
                            <Form.Group as={Col} className="mb-3" controlId="product_condition_id">
                                <Form.Label>Condition <span className="text-danger">*</span></Form.Label>
                                <ReactSelect
                                    options= {productConditionData.map((option: CategoryData) => (
                                        { value: option.id, label: option.name }
                                    ))}
                                    placeholder="Select condition" name="product_condition" value={custData.product_condition ? { value: custData.product_condition.id, label: custData.product_condition.name } : null} onChange={(selectedOption) => handleRSelect(selectedOption, 'product_condition')} required
                                />
                                <Form.Control type="hidden" name="product_condition_id" value={custData.product_condition_id} />
                                {validated && !custData.product_condition_id && (
                                    <div className="invalid-feedback d-block">Please enter product condition</div>
                                )}
                            </Form.Group>
                        </Row>

                        <Row className='g-3 px-2'>
                            <Form.Group as={Col} className="mb-3" controlId="expiry_period">
                                <Form.Label>Expiry Period <span className="text-danger">*</span></Form.Label>
                                <Form.Control type="text" placeholder="Expiry Period" name="expiry_period" value={custData.expiry_period} onChange={handleChange} required />
                                <Form.Control.Feedback type="invalid">Please enter Expiry Period.</Form.Control.Feedback>
                            </Form.Group>
                            <Form.Group as={Col} className="mb-3" controlId="attachment_name">
                                <Form.Label>Attachment Name <span className="text-danger">*</span></Form.Label>
                                <Form.Control type="text" placeholder="Attachment name" name="attachment_name" value={isEditing ? (custData.procurement_attachments?.attachment_name) : custData.attachment_name} readOnly required style={{ backgroundColor: 'whitesmoke', pointerEvents: 'none' }} />
                                <Form.Control.Feedback type="invalid">Please enter gst amount.</Form.Control.Feedback>
                            </Form.Group>
                            <Form.Group as={Col} className="mb-3" controlId="details">
                                <Form.Label>Attachment Description <span className="text-danger">*</span></Form.Label>
                                <Form.Control as="textarea" rows={1} placeholder="Attachment Details" name="details" value={isEditing ? (custData.procurement_attachments?.details) : custData.details} onChange={handleChange} required />
                                <Form.Control.Feedback type="invalid">Please enter attachment details.</Form.Control.Feedback>
                            </Form.Group>
                        </Row>

                        <Row className='g-3 px-2'>
                            <Col><h4>Vendor Details</h4></Col>
                        </Row>

                        <Row className='g-3 px-2'>
                            <Form.Group as={Col} className="mb-3">
                                <Form.Label>Vendor Name <span className="text-danger">*</span></Form.Label>
                                <ReactSelect
                                    options= {vendorsList.map((option: VendorData) => (
                                        { value: option.id, label: option.name }
                                    ))}
                                    placeholder="Select Vendor" name="vendors" value={custData.vendors ? { value: custData.vendors.id, label: custData.vendors.name } : null} onChange={(selectedOption) => handleRSelect(selectedOption, 'vendors')} required
                                />
                                <Form.Control type="hidden" name="vendor_id" value={custData.vendor_id} />
                                {validated && !custData.vendor_id && (
                                    <div className="invalid-feedback d-block">Please enter vendor</div>
                                )}
                            </Form.Group>
                            <Form.Group as={Col} className="mb-3" controlId="delivery_date">
                                <Form.Label>Delivery Date <span className="text-danger">*</span></Form.Label>
                                <Form.Control type="date" name="delivery_date" value={custData.delivery_date} onChange={handleChange} required />
                                <Form.Control.Feedback type="invalid">Please enter delivery date.</Form.Control.Feedback>
                            </Form.Group>
                        </Row>

                        <Row className='g-3 px-2'>
                            <Form.Group as={Col} className="mb-3" controlId="warranty">
                                <Form.Label>Warranty <span className="text-danger">*</span></Form.Label>
                                <Form.Control type="text" placeholder="Warranty" name="warranty" value={custData.warranty} onChange={handleChange} required />
                                <Form.Control.Feedback type="invalid">Please enter Warranty.</Form.Control.Feedback>
                            </Form.Group>
                            <Form.Group as={Col} className="mb-3" controlId="mfg_year">
                                <Form.Label>MFG Year <span className="text-danger">*</span></Form.Label>
                                <Form.Control type="text" placeholder="MFG Year" name="mfg_year" value={custData.mfg_year} onChange={handleChange} required />
                                <Form.Control.Feedback type="invalid">Please enter MFG Year.</Form.Control.Feedback>
                            </Form.Group>
                            <Form.Group as={Col} className="mb-3" controlId="ready_stock_availability">
                                <Form.Label>Ready Stock Availability <span className="text-danger">*</span></Form.Label>
                                <Form.Control type="text" placeholder="Ready Stock Availability " name="ready_stock_availability" value={custData.ready_stock_availability} onChange={handleChange} required />
                                <Form.Control.Feedback type="invalid">Please enter Ready Stock Availability.</Form.Control.Feedback>
                            </Form.Group>
                        </Row>
                        <Row className='g-3 px-2'>
                            <Form.Group as={Col} className="mb-3" controlId="lead_time">
                                <Form.Label>Lead Time <span className="text-danger">*</span></Form.Label>
                                <Form.Control type="text" placeholder="Lead Time" name="lead_time" value={custData.lead_time} onChange={handleChange} required />
                                <Form.Control.Feedback type="invalid">Please enter Lead Time.</Form.Control.Feedback>
                            </Form.Group>
                            <Form.Group as={Col} className="mb-3" controlId="payment_term">
                                <Form.Label>Payment Term <span className="text-danger">*</span></Form.Label>
                                <Form.Control type="text" placeholder="Payment Term" name="payment_term" value={custData.payment_term} onChange={handleChange} required />
                                <Form.Control.Feedback type="invalid">Please enter Payment Term.</Form.Control.Feedback>
                            </Form.Group>
                            <Form.Group as={Col} className="mb-3" controlId="product_cost">
                                <Form.Label>Product Cost <span className="text-danger">*</span></Form.Label>
                                <Form.Control type="number" placeholder="Purchase Price" name="product_cost" value={custData.product_cost} onChange={handleChange} step="0.01" min={0} onFocus={(e) => e.target.select()} required />
                                <Form.Control.Feedback type="invalid">Please enter Product Cost.</Form.Control.Feedback>
                            </Form.Group>
                            <Form.Group as={Col} className="mb-3" controlId="transportation_cost">
                                <Form.Label>Transportation Cost <span className="text-danger">*</span></Form.Label>
                                <Form.Control type="number" placeholder="Transportation Cost" name="transportation_cost" value={custData.transportation_cost} onChange={handleChange} step="0.01" min={0} onFocus={(e) => e.target.select()} required />
                                <Form.Control.Feedback type="invalid">Please enter Transportation Cost.</Form.Control.Feedback>
                            </Form.Group>
                        </Row>

                        <Row className='g-3 px-2'>
                            <Form.Group as={Col} className="mb-3" controlId="installation_cost">
                                <Form.Label>Installation Cost <span className="text-danger">*</span></Form.Label>
                                <Form.Control type="number" placeholder="Installation Cost" name="installation_cost" value={custData.installation_cost} onChange={handleChange} step="0.01" min={0} onFocus={(e) => e.target.select()} required />
                                <Form.Control.Feedback type="invalid">Please enter Installation Cost.</Form.Control.Feedback>
                            </Form.Group>
                            <Form.Group as={Col} className="mb-3" controlId="gst_percent_id">
                                <Form.Label>GST % <span className="text-danger">*</span></Form.Label>
                                <ReactSelect
                                    options= {gstPercentData.map((option: GstData) => (
                                        { value: option.id, label: option.percent }
                                    ))}
                                    placeholder="Select GST" name="gst_percent" value={custData.gst_percent ? { value: custData.gst_percent.id, label: custData.gst_percent.percent } : null} onChange={(selectedOption) => handleRSelect(selectedOption, 'gst_percent')} required
                                />
                                <Form.Control type="hidden" name="gst_percent_id" value={custData.gst_percent_id} />
                                {validated && !custData.gst_percent_id && (
                                    <div className="invalid-feedback d-block">Please enter GST percent</div>
                                )}
                            </Form.Group>
                            <Form.Group as={Col} className="mb-3" controlId="grand_total">
                                <Form.Label>Grand Total <span className="text-danger">*</span></Form.Label>
                                <Form.Control type="number" placeholder="Grand Total" name="grand_total" value={custData.grand_total} step="0.01" min={0} readOnly required style={{ backgroundColor: 'whitesmoke', pointerEvents: 'none' }}  />
                                <Form.Control.Feedback type="invalid">Please enter Grand Total.</Form.Control.Feedback>
                            </Form.Group>
                            <Form.Group as={Col} controlId="attachment" className="mb-3">
                                <Form.Label>Attachment <span className="text-danger">*</span></Form.Label>
                                <Form.Control type="file" name="attachment" onChange={handleFileChange} required={!isEditing} />
                                <Form.Control.Feedback type="invalid">Please enter attachment .</Form.Control.Feedback>
                                {isEditing && (<span className='text-danger'>Uploaded Attachment :- {custData.procurement_attachments?.name} </span>)}
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
