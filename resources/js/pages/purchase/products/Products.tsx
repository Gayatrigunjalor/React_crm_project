import { faCirclePlus, faEdit, faTrash } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import Button from '../../../components/base/Button';
import React, { useEffect, useState, ChangeEvent } from 'react';
import { Card, Form, Modal, Col, Row, Dropdown } from 'react-bootstrap';
import axiosInstance from '../../../axios';
import useAdvanceTable from '../../../hooks/useAdvanceTable';
import AdvanceTableProvider from '../../../providers/AdvanceTableProvider';
import SearchBox from '../../../components/common/SearchBox';
import { useAuth } from '../../../AuthContext';
import ReactSelect from '../../../components/base/ReactSelect';
import { ColumnDef } from '@tanstack/react-table';
import AdvanceTable from '../../../components/base/AdvanceTable';
import AdvanceTableFooter from '../../../components/base/AdvanceTableFooter';
import RevealDropdown, { RevealDropdownTrigger } from '../../../components/base/RevealDropdown';
import swal from 'sweetalert';
import { useNavigate } from 'react-router-dom';

interface ProductsData {
    id: number;
    product_code: string;
    created_at: string;
    employee_name: string;
    product_name: string;
    functional_name: string;
    model_name: string;
    make: string;
    product_type_id: string;
    vendor_count_count: number;
    attachment_count_count: number;
}

interface ProductViewData {
    id?: number;
    product_code: string;
    model_name: string;
    make: string;
    functional_name: string;
    segment_id: string;
    category_id: string;
    employee_name: string;
    hsn_code_id: number;
    unit_of_measurement_id: string;
    product_type_id: string;
    product_condition_id: string;
    printable_description: string;
    pack_size: string;
    box_size: string;
    lbh: string;
    volume_weight: string;
    confidential_info: string;
    optional_accessories: string;
    expiry: string;
    product_base_price: number;
    gst_percent_id: number;
    gst_percent: GstData | null;
    selling_cost: number;
    bottom_price: string;
}

const Products = () => {

    const [showModal, setShowModal] = useState<boolean>(false);
    const [showViewModal, setShowViewModal] = useState<boolean>(false);
    const [refreshData, setRefreshData] = useState<boolean>(false);
    const [productsTableData, setProductsTableData] = useState<ProductsData[]>([]);
    const [error, setError] = useState<string | null>(null);

    const [segmentsData, setSegmentsData] = useState([]);
    const [hsnCodeData, setHsnCodeData] = useState([]);
    const [uOMData, setUOMData] = useState([]);
    const [productTypeData, setProductTypeData] = useState([]);
    const [productConditionData, setProductConditionData] = useState([]);
    const [gstPercentData, setGstPercentData] = useState([]);
    const [prodViewData, setProdViewData] = useState<ProductViewData>({ id: 0,
        product_code: '',
        model_name: '',
        make: '',
        functional_name: '',
        segment_id: '',
        category_id: '',
        employee_name: '',
        hsn_code_id: 0,
        unit_of_measurement_id: '',
        product_type_id: '',
        product_condition_id: '',
        printable_description: '',
        pack_size: '',
        box_size: '',
        lbh: '',
        volume_weight: '',
        confidential_info: '',
        optional_accessories: '',
        expiry: '',
        product_base_price: 0,
        gst_percent_id: 0,
        gst_percent: null,
        selling_cost: 0,
        bottom_price: ''});

    const [selectedProdId, setSelectedProdId] = useState<number | undefined>(undefined);
    const { userPermission } = useAuth(); //check userRole & permissions
    const navigate = useNavigate();

    const handleShow = (prodId?: number) => {
        setSelectedProdId(prodId);
        setShowModal(true);
    };

    const handleClose = () => setShowModal(false);
    const handleViewClose = () => setShowViewModal(false);

    const handleSuccess = () => {
        // Refresh data or perform any other action after successful submission
        setRefreshData(prev => !prev); // Toggle state to trigger re-fetch
    };
    const handleProdVendors = (id: number) => {
        navigate(`/products/vendors/${id}`);
    }
    const handleAttachments = (id: number) => {
        navigate(`/products/attachments/${id}`);
    }
    const handleProductView = (id: number) => {
        const fetchProductView = async () => {
            try {
                const response = await axiosInstance.get(`/viewProduct?id=${id}`);
                if (response.status !== 200) {
                    throw new Error('Failed to fetch data');
                }
                const data: ProductViewData = await response.data;
                setProdViewData(data);
            } catch (err: any) {
                setError(err.data.message);
            } finally {

            }
        };
        fetchProductView();
        setShowViewModal(true);
    }

    const table = useAdvanceTable({
        data: productsTableData,
        columns: productsDataTableColumns(handleProductView, handleShow, handleProdVendors, handleAttachments),
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
        const fetchProductsData = async () => {
            try {
                const response = await axiosInstance.get(`/products`);
                if (response.status !== 200) {
                    throw new Error('Failed to fetch data');
                }
                const data: ProductsData[] = await response.data;
                setProductsTableData(data);
            } catch (err: any) {
                setError(err.data.message);
            } finally {

            }
        };

        fetchProductsData();
    }, [refreshData]);

    useEffect(() => {
        const fetchSegment = async () => {
            try {
                const response = await axiosInstance.get('/segmentListing');
                if (response.status !== 200) {
                    throw new Error('Failed to fetch data');
                }
                const data = await response.data;
                setSegmentsData(data);
            } catch (err: any) {
                setError(err.message);
            } finally {
            }
        };

        const fetchHsnCode = async () => {
            try {
                const response = await axiosInstance.get('/hsnCodeTypeListing');
                if (response.status !== 200) {
                    throw new Error('Failed to fetch data');
                }
                const data = await response.data;
                setHsnCodeData(data);
            } catch (err: any) {
                setError(err.message);
            } finally {
            }
        };
        const fetchUOM = async () => {
            try {
                const response = await axiosInstance.get('/unitOfMeasurementListing');
                if (response.status !== 200) {
                    throw new Error('Failed to fetch data');
                }
                const data = await response.data;
                setUOMData(data);
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
        const fetchGstPercent = async () => {
            try {
                const response = await axiosInstance.get('/gstPercentListing');
                if (response.status !== 200) {
                    throw new Error('Failed to fetch data');
                }
                const data = await response.data;
                setGstPercentData(data);
            } catch (err: any) {
                setError(err.message);
            } finally {
            }
        };

        fetchSegment();
        fetchHsnCode();
        fetchUOM();
        fetchProductType();
        fetchProductCondition();
        fetchGstPercent();
    }, []);

    if (error) return <div>Error: {error}</div>;

    return (
        <>
            <h2 className="mb-5">Products</h2>
            <Card className='border border-translucent'>
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
                            {userPermission.product_create === 1 && !error && (
                                <Button
                                    variant="primary"
                                    className=""
                                    startIcon={<FontAwesomeIcon icon={faCirclePlus} className="me-2" />}
                                    onClick={() => handleShow()}
                                >
                                    Add New Product
                                </Button>
                            )}
                        </Col>
                    </Row>
                    <ProductsTable />
                </AdvanceTableProvider>
                {showModal && (
                    <ProductsModal
                        prodId={selectedProdId}
                        segmentsData={segmentsData}
                        hsnCodeData={hsnCodeData}
                        uOMData={uOMData}
                        productTypeData={productTypeData}
                        productConditionData={productConditionData}
                        gstPercentData={gstPercentData}
                        onHide={handleClose}
                        onSuccess={handleSuccess}
                    />
                )}
                {showViewModal && (
                    <ProductViewModal
                        prodViewData={prodViewData}
                        onHide={handleViewClose}
                    />
                )}
                </Card.Body>
            </Card>
        </>
    );
};

export default Products;

const productsDataTableColumns = (handleProductView: (id: number) => void, handleShow: (prodId?: number) => void, handleProdVendors: (id: number) => void, handleAttachments: (id: number) => void): ColumnDef<ProductsData>[] => [
    {
        accessorKey: 'product_code',
        header: () => {
            return (
                <div className="d-inline-flex flex-center">
                    <span>Prod Code</span>
                </div>
            );
        },
        cell: ({ row: { original } }) => {
            const { product_code } = original;
            return (
                <span>{product_code}</span>
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
        accessorKey: 'created_at',
        header: () => {
            return (
                <div className="d-inline-flex flex-center">
                    <span>Created At</span>
                </div>
            );
        },
        cell: ({ row: { original } }) => {
            const { created_at } = original;
            return (
                <span>{created_at}</span>
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
        accessorKey: 'created_by',
        header: () => {
            return (
                <div className="d-inline-flex flex-center">
                    <span>Created By</span>
                </div>
            );
        },
        cell: ({ row: { original } }) => {
            const { employee_name } = original;
            return (
                <span>{employee_name}</span>
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
        accessorKey: 'product_name',
        header: () => {
            return (
                <div className="d-inline-flex flex-center">
                    <span>Product Name</span>
                </div>
            );
        },
        cell: ({ row: { original } }) => {
            const { product_name } = original;
            return (
                <span>{product_name}</span>
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
        accessorKey: 'functional_name',
        header: () => {
            return (
                <div className="d-inline-flex flex-center">
                    <span>Functional Name</span>
                </div>
            );
        },
        cell: ({ row: { original } }) => {
            const { functional_name } = original;
            return (
                <span>{functional_name}</span>
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
        accessorKey: 'model_name',
        header: () => {
            return (
                <div className="d-inline-flex flex-center">
                    <span>Model Name</span>
                </div>
            );
        },
        cell: ({ row: { original } }) => {
            const { model_name } = original;
            return (
                <span>{model_name}</span>
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
        accessorKey: 'make',
        header: () => {
            return (
                <div className="d-inline-flex flex-center">
                    <span>Make</span>
                </div>
            );
        },
        cell: ({ row: { original } }) => {
            const { make } = original;
            return (
                <span>{make}</span>
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
        accessorKey: 'product_type_id',
        header: () => {
            return (
                <div className="d-inline-flex flex-center">
                    <span>Product Type</span>
                </div>
            );
        },
        cell: ({ row: { original } }) => {
            const { product_type_id } = original;
            return (
                <span>{product_type_id}</span>
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
        accessorKey: 'vendor_count_count',
        header: () => {
            return (
                <div className="d-inline-flex flex-center">
                    <span>PV</span>
                </div>
            );
        },
        cell: ({ row: { original } }) => {
            const { vendor_count_count } = original;
            return (
                <span>{vendor_count_count}</span>
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
        accessorKey: 'attachment_count_count',
        header: () => {
            return (
                <div className="d-inline-flex flex-center">
                    <span>PA</span>
                </div>
            );
        },
        cell: ({ row: { original } }) => {
            const { attachment_count_count } = original;
            return (
                <span>{attachment_count_count}</span>
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
                <RevealDropdownTrigger>
                    <RevealDropdown>
                        <Dropdown.Item eventKey="1" onClick={() => handleProductView(id)}>View</Dropdown.Item>
                        {userPermission.product_edit == 1 && (
                            <Dropdown.Item eventKey="2" onClick={() => handleShow(id)}>Edit</Dropdown.Item>
                        )}
                        {userPermission.product_vendor_list == 1 && (
                            <Dropdown.Item eventKey="3" onClick={() => handleProdVendors(id)}>Product Vendors</Dropdown.Item>
                        )}
                        {userPermission.product_attachment_list == 1 && (
                            <Dropdown.Item eventKey="4" onClick={() => handleAttachments(id)}>Product Attachments</Dropdown.Item>
                        )}
                    </RevealDropdown>
                </RevealDropdownTrigger>
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
const ProductsTable = () => {
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

interface SegmentData {
    id: number;
    name: string;
}
interface CategoryData {
    id: number;
    name: string;
}
interface HsnData {
    id: number;
    hsn_code: string;
}
interface GstData {
    id: number;
    percent: string;
}
interface ProductsModalProps {
    prodId?: number;
    segmentsData: SegmentData[];
    hsnCodeData: HsnData[];
    uOMData: SegmentData[];
    productTypeData: SegmentData[];
    productConditionData: SegmentData[];
    gstPercentData: GstData[];
    onHide: () => void;
    onSuccess: () => void;
}
interface ProductViewModalProps {
    prodViewData: ProductViewData;
    onHide: () => void;
}

interface FormData {
    id?: number;
    product_name: string;
    model_name: string;
    make: string;
    functional_name: string;
    segment_id: string;
    category: { id: number; name: string; } | null;
    category_id: number;
    employee_name: string;
    hsn_code_id: number;
    unit_of_measurement_id: string;
    product_type_id: string;
    product_condition_id: string;
    printable_description: string;
    pack_size: string;
    box_size: string;
    lbh: string;
    volume_weight: string;
    confidential_info: string;
    optional_accessories: string;
    expiry: string;
    product_base_price: number;
    gst_percent: GstData | null;
    gst_percent_id: number;
    selling_cost: number;
    bottom_price: string;
}
const ProductsModal: React.FC<ProductsModalProps> = ({ prodId, segmentsData, hsnCodeData, uOMData, productTypeData, productConditionData, gstPercentData, onHide, onSuccess}) => {

    const { empData } = useAuth(); //check userRole & permissions
    const [custData, setUserData] = useState<FormData>({ id: 0,
        product_name: '',
        model_name: '',
        make: '',
        functional_name: '',
        segment_id: '',
        category: null,
        category_id: 0,
        employee_name: empData.name,
        hsn_code_id: 0,
        unit_of_measurement_id: '',
        product_type_id: '',
        product_condition_id: '',
        printable_description: '',
        pack_size: '',
        box_size: '',
        lbh: '',
        volume_weight: '',
        confidential_info: '',
        optional_accessories: '',
        expiry: '',
        product_base_price: 0,
        gst_percent: null,
        gst_percent_id: 0,
        selling_cost: 0,
        bottom_price: ''});
    const [isEditing, setIsEditing] = useState<boolean>(false);
    const [validated, setValidated] = useState<boolean>(false);
    const [categoryData, setCategoryData] = useState([]);
    const [loading, setLoading] = useState(false);
    useEffect(() => {

        if (prodId) {
            setIsEditing(true);
            // Fetch products data for editing
            axiosInstance.get(`/products/${prodId}`)
            .then(response => {
                setUserData(response.data);
            })
            .catch(error => console.error('Error fetching products data:', error));
        }
    }, [prodId]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setUserData({ ...custData, [name]: value });
                // Calculate GST amount and grand total if applicable fields are updated
        if (["product_base_price"].includes(name)) {
            calculateTotal(name, Number(value));
        }
    };

        const calculateTotal = (name : string, value: number) => {
        const updatedCustData = { ...custData, [name]: value };
        // Calculate GST amount and grand total if applicable fields are updated
        if (["product_base_price", "gst_percent_id"].includes(name)) {
            const productCost = Number(updatedCustData.product_base_price || 0);
            const gstPercent = Number(updatedCustData.gst_percent?.percent || 0);

            const gstAmount = (gstPercent !== 0) ? ((productCost * gstPercent) / 100) : 0;
            const totalAmount = productCost + gstAmount;

            updatedCustData.selling_cost = parseFloat(totalAmount.toFixed(2)); // Keep grand_total as a number
        }
        setUserData(updatedCustData);
    };

    useEffect(() => {
        calculateTotal('gst_percent_id', Number(custData.gst_percent_id));
    }, [custData.gst_percent_id]);

    const handleCategorySelection = (selectedOption: any) => {
        if (selectedOption) {
            setUserData(prev => ({
                ...prev,
                category: { id: selectedOption.value, name: selectedOption.label },
                category_id: selectedOption.value
            }));
        }
    };

    const handleGSTSelect = (selectedOption: any) => {
        if (selectedOption) {
            setUserData(prev => ({
                ...prev,
                gst_percent: { id: selectedOption.value, percent: selectedOption.label },
                gst_percent_id: selectedOption.value
            }));
        }
    };

    const handleRSelect = (selectedOption: { value: string; label: string } | null, name: string) => {
        if (selectedOption) {
            setUserData({ ...custData, [name]: selectedOption.label });
            if(name == 'segment_id' && selectedOption.value != ""){
                setCategoryData([]);
                setUserData(prev => ({
                    ...prev,
                    category: null,
                    category_id: 0
                }));
                axiosInstance.get(`/getCategories?segment_id=${selectedOption.value}`)
                .then(response => {
                    setCategoryData(response.data);
                });
            }
        } else {
            setUserData({ ...custData, [name]: null });
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
        const apiCall = isEditing
            ? axiosInstance.put(`/products/${custData.id}`,  {
                product_name: custData.product_name,
                model_name: custData.model_name,
                make: custData.make,
                functional_name: custData.functional_name,
                segment_id: custData.segment_id,
                category_id: custData.category_id,
                employee_name: custData.employee_name,
                hsn_code_id: custData.hsn_code_id,
                unit_of_measurement_id: custData.unit_of_measurement_id,
                product_type_id: custData.product_type_id,
                product_condition_id: custData.product_condition_id,
                printable_description: custData.printable_description,
                pack_size: custData.pack_size,
                box_size: custData.box_size,
                lbh: custData.lbh,
                volume_weight: custData.volume_weight,
                confidential_info: custData.confidential_info,
                optional_accessories: custData.optional_accessories,
                expiry: custData.expiry,
                product_base_price: custData.product_base_price,
                gst_percent_id: custData.gst_percent_id,
                selling_cost: custData.selling_cost,
                bottom_price: custData.bottom_price
            })
            : axiosInstance.post('/products', custData );

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
            <Modal show onHide={onHide} size="xl" backdrop="static" keyboard={false}>
                <Modal.Header closeButton>
                    <Modal.Title>{isEditing ? 'Edit product' : 'Add product'}</Modal.Title>
                </Modal.Header>
                <Form noValidate validated={validated} onSubmit={handleSubmit}>
                    <Modal.Body>
                        <Form.Control type="hidden" name="id" value={custData.id} />
                        <Row className="mb-3 g-3">
                            <Form.Group as={Col} className="mb-3" controlId="product_name">
                                <Form.Label>Product Name <span className="text-danger">*</span></Form.Label>
                                <Form.Control type="text" placeholder="Product Name & Printable" name="product_name" value={custData.product_name} onChange={handleChange} required />
                                <Form.Control.Feedback type="invalid">Please enter product name.</Form.Control.Feedback>
                            </Form.Group>
                            <Form.Group as={Col} className="mb-3" controlId="model_name">
                                <Form.Label>Model Name <span className="text-danger">*</span></Form.Label>
                                <Form.Control type="text" placeholder="Model No & Printable" name="model_name" value={custData.model_name} onChange={handleChange} required />
                                <Form.Control.Feedback type="invalid">Please enter model name.</Form.Control.Feedback>
                            </Form.Group>
                            <Form.Group as={Col} className="mb-3" controlId="make">
                                <Form.Label>Make <span className="text-danger">*</span></Form.Label>
                                <Form.Control type="text" placeholder="Mfg Name" name="make" value={custData.make} onChange={handleChange} required />
                                <Form.Control.Feedback type="invalid">Please enter make.</Form.Control.Feedback>
                            </Form.Group>
                        </Row>
                        <Row className="mb-3 g-3">
                            <Form.Group as={Col} className="mb-3" controlId="functional_name">
                                <Form.Label>Functional Name <span className="text-danger">*</span></Form.Label>
                                <Form.Control type="text" placeholder="eg. Mobile,PC,Laptops" name="functional_name" value={custData.functional_name} onChange={handleChange} required />
                                <Form.Control.Feedback type="invalid">Please enter functional name.</Form.Control.Feedback>
                            </Form.Group>
                            <Form.Group as={Col} className="mb-3">
                                <Form.Label>Segment <span className="text-danger">*</span></Form.Label>
                                <ReactSelect
                                    options= {segmentsData.map((option: SegmentData) => (
                                        { value: option.id, label: option.name }
                                    ))}
                                    placeholder="Select segment" name="segment_id" value={custData.segment_id ? { value: custData.segment_id, label: custData.segment_id } : null} onChange={(selectedOption) => handleRSelect(selectedOption, 'segment_id')} required
                                />
                                {validated && custData.segment_id == '' && (
                                    <div className="invalid-feedback d-block">Please select segment</div>
                                )}
                            </Form.Group>
                            <Form.Group as={Col} className="mb-3">
                                <Form.Label>Category <span className="text-danger">*</span></Form.Label>
                                <ReactSelect
                                    options= {categoryData.map((option: CategoryData) => (
                                        { value: option.id, label: option.name }
                                    ))}
                                    placeholder="Select Category" name="category" value={custData.category ? { value: custData.category.id, label: custData.category.name } : null} onChange={(selectedOption) => handleCategorySelection(selectedOption)} required
                                />
                                <Form.Control type="hidden" name="category_id" value={custData.category_id} />
                                {validated && !custData.category_id && (
                                    <div className="invalid-feedback d-block">Please select category</div>
                                )}
                            </Form.Group>
                        </Row>

                        <Row className="mb-3 g-3">
                            <Form.Group as={Col} className="mb-3" controlId="employee_name">
                                <Form.Label>Employee Id</Form.Label>
                                <Form.Control type="text" name="employee_name" value={custData.employee_name} readOnly style={{backgroundColor: 'whitesmoke'}} />
                            </Form.Group>
                            <Form.Group as={Col} className="mb-3">
                                <Form.Label>Hsn Code <span className="text-danger">*</span></Form.Label>
                                <ReactSelect
                                    options= {hsnCodeData.map((option: HsnData) => (
                                        { value: option.hsn_code, label: option.hsn_code }
                                    ))}
                                    placeholder="Select Hsn Code" name="hsn_code_id" value={custData.hsn_code_id ? { value: custData.hsn_code_id, label: custData.hsn_code_id } : null} onChange={(selectedOption) => handleRSelect(selectedOption, 'hsn_code_id')} required
                                />
                                {validated && !custData.hsn_code_id && (
                                    <div className="invalid-feedback d-block">Please select Hsn Code</div>
                                )}
                            </Form.Group>
                            <Form.Group as={Col} className="mb-3">
                                <Form.Label>Unit Of Measurement for Sale <span className="text-danger">*</span></Form.Label>
                                <ReactSelect
                                    options= {uOMData.map((option: CategoryData) => (
                                        { value: option.name, label: option.name }
                                    ))}
                                    placeholder="Select Unit Of Measurement" name="unit_of_measurement_id" value={custData.unit_of_measurement_id ? { value: custData.unit_of_measurement_id, label: custData.unit_of_measurement_id } : null} onChange={(selectedOption) => handleRSelect(selectedOption, 'unit_of_measurement_id')} required
                                />
                                {validated && custData.unit_of_measurement_id  == '' && (
                                    <div className="invalid-feedback d-block">Please enter Unit Of Measurement</div>
                                )}
                            </Form.Group>
                        </Row>

                        <Row className="mb-3 g-3">
                            <Form.Group as={Col} className="mb-3" controlId="product_type_id">
                                <Form.Label>Product Type</Form.Label>
                                <Form.Select name="product_type_id" value={custData.product_type_id} onChange={handleSelectChange}>
                                    <option value="">Choose product type</option>
                                    {productTypeData.map((option: CategoryData) => (
                                        <option key={option.id} value={option.name}>
                                            {option.name}
                                        </option>))}
                                </Form.Select>
                                <Form.Control.Feedback type="invalid">Please enter Product Type</Form.Control.Feedback>
                            </Form.Group>
                            <Form.Group as={Col} className="mb-3" controlId="product_condition_id">
                                <Form.Label>Product Condition</Form.Label>
                                <Form.Select name="product_condition_id" value={custData.product_condition_id} onChange={handleSelectChange}>
                                    <option value="">Choose product condition</option>
                                    {productConditionData.map((option: CategoryData) => (
                                        <option key={option.id} value={option.name}>
                                            {option.name}
                                        </option>))}
                                </Form.Select>
                                <Form.Control.Feedback type="invalid">Please enter Product Condition</Form.Control.Feedback>
                            </Form.Group>
                            <Form.Group as={Col} className="mb-3" controlId="printable_description">
                                <Form.Label>Printable Description <span className="text-danger">*</span></Form.Label>
                                <Form.Control as="textarea" rows={1} placeholder="Printable Column mention included Accessories" name="printable_description" value={custData.printable_description} onChange={handleChange} required />
                                <Form.Control.Feedback type="invalid">Please enter Printable Description</Form.Control.Feedback>
                            </Form.Group>
                        </Row>

                        <Row className="mb-3 g-3">
                            <Form.Group as={Col} className="mb-3" controlId="confidential_info">
                                <Form.Label>Confidential Info</Form.Label>
                                <Form.Control as="textarea" rows={1} placeholder="For Internal Use" name="confidential_info" value={custData.confidential_info} onChange={handleChange}/>
                            </Form.Group>
                            <Form.Group as={Col} className="mb-3" controlId="optional_accessories">
                                <Form.Label>Optional Accessories</Form.Label>
                                <Form.Control as="textarea" rows={1} placeholder="Extra charges applicable" name="optional_accessories" value={custData.optional_accessories} onChange={handleChange}/>
                            </Form.Group>
                            <Form.Group as={Col} className="mb-3" controlId="expiry">
                                <Form.Label>Expiry</Form.Label>
                                <Form.Control type="text" placeholder="If Applicable" name="expiry" value={custData.expiry} onChange={handleChange} />
                            </Form.Group>
                        </Row>
                        <Row className="mb-3 g-3">
                            <Form.Group as={Col} className="mb-3" controlId="pack_size">
                                <Form.Label>No of Boxes</Form.Label>
                                <Form.Control type="text" placeholder="No of Boxes" name="pack_size" value={custData.pack_size} onChange={handleChange} />
                            </Form.Group>
                            <Form.Group as={Col} className="mb-3" controlId="box_size">
                                <Form.Label>Box Size</Form.Label>
                                <Form.Control type="text" placeholder="Box Size" name="box_size" value={custData.box_size} onChange={handleChange} />
                            </Form.Group>
                            <Form.Group as={Col} className="mb-3" controlId="lbh">
                                <Form.Label>Gross Weight</Form.Label>
                                <Form.Control type="text" placeholder="Gross Weight" name="lbh" value={custData.lbh} onChange={handleChange} />
                            </Form.Group>
                            <Form.Group as={Col} className="mb-3" controlId="volume_weight">
                                <Form.Label>Volume Weight</Form.Label>
                                <Form.Control type="text" placeholder="Volume Weight" name="volume_weight" value={custData.volume_weight} onChange={handleChange} />
                            </Form.Group>
                        </Row>
                        <Row className="mb-3 g-3">
                            <Form.Group as={Col} className="mb-3" controlId="product_base_price">
                                <Form.Label>Product selling price without GST <span className="text-danger">*</span></Form.Label>
                                <Form.Control type="number" placeholder="Product selling price without GST" name="product_base_price" value={custData.product_base_price} onChange={handleChange} min={0} onFocus={(e) => e.target.select()} required />
                                <Form.Control.Feedback type="invalid">Please enter product selling price (enter 0 if unknown)</Form.Control.Feedback>
                            </Form.Group>
                            <Form.Group as={Col} className="mb-3">
                                <Form.Label>GST % <span className="text-danger">*</span></Form.Label>
                                <ReactSelect
                                    options= {gstPercentData.map((option: GstData) => (
                                        { value: option.id, label: option.percent }
                                    ))}
                                    placeholder="Select GST" name="gst_percent" value={custData.gst_percent ? { value: custData.gst_percent.id, label: custData.gst_percent.percent } : null} required onChange={(selectedOption) => handleGSTSelect(selectedOption)}/>
                                <Form.Control type="hidden" name="gst_percent_id" value={custData.gst_percent_id} />
                                {validated && !custData.gst_percent_id && (
                                    <div className="invalid-feedback d-block">Please select GST percent</div>
                                )}
                            </Form.Group>
                            <Form.Group as={Col} className="mb-3" controlId="selling_cost">
                                <Form.Label>MRP</Form.Label>
                                <Form.Control type="text" placeholder="Selling cost" name="selling_cost" value={custData.selling_cost} readOnly style={{backgroundColor: 'whitesmoke'}} />
                            </Form.Group>
                            <Form.Group as={Col} className="mb-3" controlId="bottom_price">
                                <Form.Label>Bottom Or Non Bottom Rate <span className="text-danger">*</span></Form.Label>
                                <Form.Select name="bottom_price" value={custData.bottom_price} onChange={handleSelectChange}>
                                    <option value="">Select option</option>
                                    <option value="Bottom">Bottom</option>
                                    <option value="Non Bottom">Non Bottom</option>
                                </Form.Select>
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

const ProductViewModal: React.FC<ProductViewModalProps> = ({ prodViewData, onHide}) => {
    return (
        <>
            <Modal show onHide={onHide} size="xl" backdrop="static" keyboard={false}>
                <Modal.Header closeButton>
                    <Modal.Title>Product</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Row className="mb-3 g-3">
                        <Form.Group as={Col} className="mb-3" controlId="product_code">
                            <Form.Label>Product Name <span className="text-danger">*</span></Form.Label>
                            <Form.Control type="text" name="product_code" value={prodViewData.product_code} readOnly style={{ backgroundColor: 'whitesmoke', pointerEvents: 'none' }} />
                        </Form.Group>
                        <Form.Group as={Col} className="mb-3" controlId="model_name">
                            <Form.Label>Model Name <span className="text-danger">*</span></Form.Label>
                            <Form.Control type="text" name="model_name" value={prodViewData.model_name} readOnly style={{ backgroundColor: 'whitesmoke', pointerEvents: 'none' }} />
                        </Form.Group>
                        <Form.Group as={Col} className="mb-3" controlId="make">
                            <Form.Label>Make <span className="text-danger">*</span></Form.Label>
                            <Form.Control type="text" name="make" value={prodViewData.make} readOnly style={{ backgroundColor: 'whitesmoke', pointerEvents: 'none' }} />
                        </Form.Group>
                    </Row>
                    <Row className="mb-3 g-3">
                        <Form.Group as={Col} className="mb-3" controlId="functional_name">
                            <Form.Label>Functional Name <span className="text-danger">*</span></Form.Label>
                            <Form.Control type="text" name="functional_name" value={prodViewData.functional_name} readOnly style={{ backgroundColor: 'whitesmoke', pointerEvents: 'none' }} />
                        </Form.Group>
                        <Form.Group as={Col} className="mb-3">
                            <Form.Label>Segment <span className="text-danger">*</span></Form.Label>
                            <Form.Control type="text" name="segment_id" value={prodViewData.segment_id} readOnly style={{ backgroundColor: 'whitesmoke', pointerEvents: 'none' }} />
                        </Form.Group>
                        <Form.Group as={Col} className="mb-3">
                            <Form.Label>Category <span className="text-danger">*</span></Form.Label>
                            <Form.Control type="text" name="category_id" value={prodViewData.category_id} readOnly style={{ backgroundColor: 'whitesmoke', pointerEvents: 'none' }} />
                        </Form.Group>
                    </Row>

                    <Row className="mb-3 g-3">
                        <Form.Group as={Col} className="mb-3" controlId="employee_name">
                            <Form.Label>Employee Id</Form.Label>
                            <Form.Control type="text" name="employee_name" value={prodViewData.employee_name} readOnly style={{backgroundColor: 'whitesmoke', pointerEvents: 'none'}} />
                        </Form.Group>
                        <Form.Group as={Col} className="mb-3">
                            <Form.Label>Hsn Code <span className="text-danger">*</span></Form.Label>
                            <Form.Control type="text" name="hsn_code_id" value={prodViewData.hsn_code_id} readOnly style={{ backgroundColor: 'whitesmoke', pointerEvents: 'none' }} />
                        </Form.Group>
                        <Form.Group as={Col} className="mb-3">
                            <Form.Label>Unit Of Measurement for Sale <span className="text-danger">*</span></Form.Label>
                            <Form.Control type="text" name="unit_of_measurement_id" value={prodViewData.unit_of_measurement_id} readOnly style={{ backgroundColor: 'whitesmoke', pointerEvents: 'none' }} />
                        </Form.Group>
                    </Row>

                    <Row className="mb-3 g-3">
                        <Form.Group as={Col} className="mb-3" controlId="product_type_id">
                            <Form.Label>Product Type</Form.Label>
                            <Form.Control type="text" name="product_type_id" value={prodViewData.product_type_id} readOnly style={{ backgroundColor: 'whitesmoke', pointerEvents: 'none' }} />
                        </Form.Group>
                        <Form.Group as={Col} className="mb-3" controlId="product_condition_id">
                            <Form.Label>Product Condition</Form.Label>
                            <Form.Control type="text" name="product_condition_id" value={prodViewData.product_condition_id} readOnly style={{ backgroundColor: 'whitesmoke', pointerEvents: 'none' }} />
                        </Form.Group>
                        <Form.Group as={Col} className="mb-3" controlId="printable_description">
                            <Form.Label>Printable Description <span className="text-danger">*</span></Form.Label>
                            <Form.Control as="textarea" rows={1} value={prodViewData.printable_description} readOnly style={{ backgroundColor: 'whitesmoke' }} />
                        </Form.Group>
                    </Row>

                    <Row className="mb-3 g-3">
                        <Form.Group as={Col} className="mb-3" controlId="confidential_info">
                            <Form.Label>Confidential Info</Form.Label>
                            <Form.Control as="textarea" rows={1} name="confidential_info" value={prodViewData.confidential_info ? prodViewData.confidential_info : ''} readOnly style={{ backgroundColor: 'whitesmoke' }}/>
                        </Form.Group>
                        <Form.Group as={Col} className="mb-3" controlId="optional_accessories">
                            <Form.Label>Optional Accessories</Form.Label>
                            <Form.Control as="textarea" rows={1} name="optional_accessories" value={prodViewData.optional_accessories ? prodViewData.optional_accessories : ''} readOnly style={{ backgroundColor: 'whitesmoke' }}/>
                        </Form.Group>
                        <Form.Group as={Col} className="mb-3" controlId="expiry">
                            <Form.Label>Expiry</Form.Label>
                            <Form.Control type="text" name="expiry" value={prodViewData.expiry} readOnly style={{ backgroundColor: 'whitesmoke', pointerEvents: 'none' }} />
                        </Form.Group>
                    </Row>
                    <Row className="mb-3 g-3">
                        <Form.Group as={Col} className="mb-3" controlId="pack_size">
                            <Form.Label>No of Boxes</Form.Label>
                            <Form.Control type="text" name="pack_size" value={prodViewData.pack_size} readOnly style={{ backgroundColor: 'whitesmoke', pointerEvents: 'none' }} />
                        </Form.Group>
                        <Form.Group as={Col} className="mb-3" controlId="box_size">
                            <Form.Label>Box Size</Form.Label>
                            <Form.Control type="text" name="box_size" value={prodViewData.box_size} readOnly style={{ backgroundColor: 'whitesmoke', pointerEvents: 'none' }} />
                        </Form.Group>
                        <Form.Group as={Col} className="mb-3" controlId="lbh">
                            <Form.Label>Gross Weight</Form.Label>
                            <Form.Control type="text" name="lbh" value={prodViewData.lbh} readOnly style={{ backgroundColor: 'whitesmoke', pointerEvents: 'none' }} />
                        </Form.Group>
                        <Form.Group as={Col} className="mb-3" controlId="volume_weight">
                            <Form.Label>Volume Weight</Form.Label>
                            <Form.Control type="text" name="volume_weight" value={prodViewData.volume_weight} readOnly style={{ backgroundColor: 'whitesmoke', pointerEvents: 'none' }} />
                        </Form.Group>
                    </Row>
                    <Row className="mb-3 g-3">
                        <Form.Group as={Col} className="mb-3" controlId="product_base_price">
                            <Form.Label>Product selling price without GST <span className="text-danger">*</span></Form.Label>
                            <Form.Control type="text" name="product_base_price" value={prodViewData.product_base_price} readOnly style={{ backgroundColor: 'whitesmoke', pointerEvents: 'none' }} />
                        </Form.Group>
                        <Form.Group as={Col} className="mb-3">
                            <Form.Label>GST % <span className="text-danger">*</span></Form.Label>
                            <Form.Control type="text" name="product_base_price" value={prodViewData.gst_percent?.percent} readOnly style={{ backgroundColor: 'whitesmoke', pointerEvents: 'none' }} />
                        </Form.Group>
                        <Form.Group as={Col} className="mb-3" controlId="selling_cost">
                            <Form.Label>MRP</Form.Label>
                            <Form.Control type="text" name="selling_cost" value={prodViewData.selling_cost} readOnly style={{backgroundColor: 'whitesmoke', pointerEvents: 'none' }} />
                        </Form.Group>
                        <Form.Group as={Col} className="mb-3" controlId="bottom_price">
                            <Form.Label>Bottom Or Non Bottom Rate <span className="text-danger">*</span></Form.Label>
                            <Form.Control type="text" name="bottom_price" value={prodViewData.bottom_price} readOnly style={{ backgroundColor: 'whitesmoke', pointerEvents: 'none' }} />
                        </Form.Group>
                    </Row>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={onHide}>
                        Close
                    </Button>
                </Modal.Footer>
            </Modal>
        </>
    );
};
