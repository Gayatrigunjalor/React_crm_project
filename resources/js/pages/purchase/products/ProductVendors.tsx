import { faCaretLeft, faCirclePlus, faEdit, faTrash } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import Button from '../../../components/base/Button';
import React, { useEffect, useState, ChangeEvent } from 'react';
import { Form, Modal, Col, Row, Card } from 'react-bootstrap';
import axiosInstance from '../../../axios';
import useAdvanceTable from '../../../hooks/useAdvanceTable';
import AdvanceTableProvider from '../../../providers/AdvanceTableProvider';
import SearchBox from '../../../components/common/SearchBox';
import { useAuth } from '../../../AuthContext';
import { useParams, useNavigate } from 'react-router-dom';
import { ColumnDef } from '@tanstack/react-table';
import AdvanceTable from '../../../components/base/AdvanceTable';
import AdvanceTableFooter from '../../../components/base/AdvanceTableFooter';
import swal from 'sweetalert';
import ReactSelect from '../../../components/base/ReactSelect';

export interface ProductData {
    id: number;
    product_code: string;
    product_name: string;
    gst_percent_id: number;
    gst_percent: GstData | null;
}
interface GstData {
    id: number;
    percent: string;
}
export interface ProductVendorsData {
    id: number;
    purchase_price: number;
    vendor_id: number;
    gst: number;
    gst_amount: number;
    total_amount: number;
    shipping_charges: number;
    packaging_charges: number;
    other_charges: number;
    remark: string;
    vendor_name: {
        id: number;
        name: string;
    }
    gst_percent: {
        id: number;
        percent: string;
    }
}
const ProductVendors = () => {
    // Extract prodId from URL parameters
    const { prodId } = useParams();
    const [showModal, setShowModal] = useState<boolean>(false);
    const [refreshData, setRefreshData] = useState<boolean>(false);
    const [productVendorsTableData, setProductVendorsTableData] = useState<ProductVendorsData[]>([]);
    const [productData, setProductData] = useState<ProductData>({id: 0, product_code: '', product_name: '', gst_percent_id: 0, gst_percent: null});
    const [vendorsList, setVendorsList] = useState([]);
    const [error, setError] = useState<string | null>(null);

    const [prodVendorId, setProdVendorId] = useState<number | undefined>(undefined);
    const { userPermission } = useAuth(); //check userRole & permissions
    const navigate = useNavigate();

    const handleProductList = () => {
        navigate(`/products`);
    }

    const handleShow = (prvId?: number) => {
        setProdVendorId(prvId);
        setShowModal(true);
    };

    const handleClose = () => setShowModal(false);

    const handleSuccess = () => {
        // Refresh data or perform any other action after successful submission
        setRefreshData(prev => !prev); // Toggle state to trigger re-fetch
    };

    const table = useAdvanceTable({
        data: productVendorsTableData,
        columns: productVendorsTableColumns(handleShow, handleSuccess),
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
        const fetchProductVendors = async () => {
            try {
                const response = await axiosInstance.get(`/products/vendors/${prodId}`);
                if (response.status !== 200) {
                    throw new Error('Failed to fetch data');
                }
                const product_data: ProductData = await response.data.product;
                const data: ProductVendorsData[] = await response.data.vendors;
                setProductVendorsTableData(data);
                setProductData(product_data);
            } catch (err: any) {
                setError(err.data.message);
            } finally {
            }
        };
        fetchProductVendors();
    }, [refreshData]);

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
        fetchVendorList();
    }, []);
    // Use prodId as needed

    if (error) return <div>Error: {error}</div>;

    return (
        <>
            <h2 className="mb-5">Product Vendor</h2>
            <Card>
                <Card.Body>
                    <AdvanceTableProvider {...table}>
                        <Row className="g-3 justify-content-between mb-4">
                            <Col md="auto" className="p-2 fw-semibold">Product Name :-  { productData.product_name } ({ productData.product_code })</Col>
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
                                        size='sm'
                                        variant="info"
                                        className="me-2"
                                        startIcon={<FontAwesomeIcon icon={faCirclePlus} className="me-2" />}
                                        onClick={() => handleShow()}
                                    >
                                        Add Product Vendor
                                    </Button>
                                )}
                                    <Button
                                        size='sm'
                                        variant="primary"
                                        className=""
                                        startIcon={<FontAwesomeIcon icon={faCaretLeft} className="me-2" />}
                                        onClick={() => handleProductList()}
                                    >
                                        Product List
                                    </Button>
                            </Col>
                        </Row>
                        <ProductVendorsTable />
                    </AdvanceTableProvider>
                </Card.Body>
            </Card>
            {showModal && (
                <ProductVendorsModal prvId={prodVendorId} productData={productData} vendorsList={vendorsList} onHide={handleClose} onSuccess={handleSuccess} />
            )}
        </>
    );
};

export default ProductVendors;

const handleDelete = (prvId: number, handleSuccess: () => void) => {
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
            axiosInstance.delete(`/products-vendors/${prvId}`)
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
const productVendorsTableColumns = (handleShow: (prvId?: number) => void, handleSuccess: () => void): ColumnDef<ProductVendorsData>[] => [
    {
        accessorKey: 'vendor_id',
        header: () => {
            return (
                <div className="d-inline-flex flex-center">
                    <span>Vendor</span>
                </div>
            );
        },
        cell: ({ row: { original } }) => {
            const { vendor_name } = original;
            return (
                <span>{vendor_name.name}</span>
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
        accessorKey: 'purchase_price',
        header: () => {
            return (
                <div className="d-inline-flex flex-center">
                    <span>Purchase Price</span>
                </div>
            );
        },
        cell: ({ row: { original } }) => {
            const { purchase_price } = original;
            return (
                <span>{purchase_price}</span>
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
        accessorKey: 'gst',
        header: () => {
            return (
                <div className="d-inline-flex flex-center">
                    <span>GST</span>
                </div>
            );
        },
        cell: ({ row: { original } }) => {
            const { gst, gst_percent } = original;
            return (
                <span>{gst ? gst_percent.percent : ''}</span>
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
        accessorKey: 'gst_amount',
        header: () => {
            return (
                <div className="d-inline-flex flex-center">
                    <span>Gst Amount</span>
                </div>
            );
        },
        cell: ({ row: { original } }) => {
            const { gst_amount } = original;
            return (
                <span>{gst_amount}</span>
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
        accessorKey: 'total_amount',
        header: () => {
            return (
                <div className="d-inline-flex flex-center">
                    <span>Total Amount</span>
                </div>
            );
        },
        cell: ({ row: { original } }) => {
            const { total_amount } = original;
            return (
                <span>{total_amount}</span>
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
        accessorKey: 'shipping_charges',
        header: () => {
            return (
                <div className="d-inline-flex flex-center">
                    <span>Shipping Charges</span>
                </div>
            );
        },
        cell: ({ row: { original } }) => {
            const { shipping_charges } = original;
            return (
                <span>{shipping_charges}</span>
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
        accessorKey: 'packaging_charges',
        header: () => {
            return (
                <div className="d-inline-flex flex-center">
                    <span>Packaging Charges</span>
                </div>
            );
        },
        cell: ({ row: { original } }) => {
            const { packaging_charges } = original;
            return (
                <span>{packaging_charges}</span>
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
        accessorKey: 'other_charges',
        header: () => {
            return (
                <div className="d-inline-flex flex-center">
                    <span>Other Charges</span>
                </div>
            );
        },
        cell: ({ row: { original } }) => {
            const { other_charges } = original;
            return (
                <span>{other_charges}</span>
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
        accessorKey: 'remark',
        header: () => {
            return (
                <div className="d-inline-flex flex-center">
                    <span>Remark</span>
                </div>
            );
        },
        cell: ({ row: { original } }) => {
            const { remark } = original;
            return (
                <span>{remark}</span>
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
                    {userPermission.vendor_contact_edit == 1 && (
                        <Button variant='phoenix-info' onClick={() => handleShow(id)} startIcon={<FontAwesomeIcon icon={faEdit} />}></Button>
                    )}
                    {userPermission.vendor_contact_delete == 1 && (
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
                'white-space-nowrap fw-semibold ps-2 pe-2 border-end border-translucent'
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
    prvId?: number;
    productData: ProductData;
    vendorsList: VendorData[];
    onHide: () => void;
    onSuccess: () => void;
}

interface FormData {
    id?: number;
    vendor_id: number;
    vendor_name: {
        id: number;
        name: string;
    };
    purchase_price: number;
    product_id: string;
    gst: number;
    gst_amount: string;
    total_amount: string;
    shipping_charges: number;
    packaging_charges: number;
    other_charges: number;
    remark: string;
}
const ProductVendorsModal: React.FC<ProductVendorsModalProps> = ({ prvId, productData, vendorsList, onHide, onSuccess}) => {
    const [custData, setUserData] = useState<FormData>({ id: 0, purchase_price: 0, vendor_id:0, vendor_name: { id: 0, name: '' }, product_id: productData.product_code, gst: productData.gst_percent_id, gst_amount: '', total_amount: '', shipping_charges:0, packaging_charges:0, other_charges:0, remark:''});
    const [isEditing, setIsEditing] = useState<boolean>(false);
    const [validated, setValidated] = useState<boolean>(false);
    useEffect(() => {

        if (prvId) {
            setIsEditing(true);
            // Fetch vendors data for editing
            axiosInstance.get(`/products-vendors/${prvId}`)
            .then(response => {
                setUserData(response.data);
            })
            .catch(error => console.error('Error fetching vendors data:', error));
        }
    }, [prvId]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;

        // Update purchase price
        const updatedCustData = { ...custData, [name]: value };

        // Calculate GST amount and total amount
        if (name === 'purchase_price') {
            const purchasePrice = parseFloat(value);
            const gstPercent = productData.gst_percent?.percent;

            // Calculate GST amount and total amount
            const gstAmount = (purchasePrice * gstPercent) / 100;
            const totalAmount = purchasePrice + gstAmount;

            updatedCustData.gst_amount = gstAmount.toFixed(2);
            updatedCustData.total_amount = totalAmount.toFixed(2);
        }

        setUserData(updatedCustData);
    };

    const handleRSelect = (selectedOption: { value: number; label: string } | null, fieldName: string) => {
        if (selectedOption) {
            setUserData({ ...custData, vendor_name: {
                id: selectedOption.value,
                name: selectedOption.label
            }, vendor_id: selectedOption.value });
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
        }

        setValidated(true);
        const apiCall = isEditing
            ? axiosInstance.put(`/products-vendors/${custData.id}`,  {
                vendor_id: custData.vendor_id,
                purchase_price: custData.purchase_price,
                product_id: productData.product_code,
                gst: custData.gst,
                gst_amount: custData.gst_amount,
                total_amount: custData.total_amount,
                shipping_charges: custData.shipping_charges,
                packaging_charges: custData.packaging_charges,
                other_charges: custData.other_charges,
                remark: custData.remark,
            })
            : axiosInstance.post('/products-vendors', custData );

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
                    <Modal.Title>{isEditing ? 'Edit Vendor Contact' : 'Add Vendor Contact'}</Modal.Title>
                </Modal.Header>
                <Form noValidate validated={validated} onSubmit={handleSubmit}>
                    <Modal.Body>
                        <Form.Control type="hidden" name="id" value={custData.id} />
                        <Form.Control type="hidden" name="product_id" value={productData.product_code} />
                        <h5 className="mb-3"> Product Name : { productData.product_name } ({ productData.product_code })</h5>
                        <Form.Group as={Col} className="mb-3">
                            <Form.Label>Vendor <span className="text-danger">*</span></Form.Label>
                            <ReactSelect
                                options= {vendorsList.map((option: VendorData) => (
                                    { value: option.id, label: option.name }
                                ))}
                                placeholder="Select Vendor" name="vendor_name" value={custData.vendor_name ? { value: custData.vendor_name.id, label: custData.vendor_name.name } : null} onChange={(selectedOption) => handleRSelect(selectedOption, 'vendor_name')} required
                            />
                            <Form.Control type="hidden" name="vendor_id" value={custData.vendor_id} />
                            <Form.Control.Feedback type="invalid">Please enter vendor</Form.Control.Feedback>
                        </Form.Group>
                        <Form.Group className="mb-3" controlId="purchase_price">
                            <Form.Label>Purchase Price <span className="text-danger">*</span></Form.Label>
                            <Form.Control type="number" placeholder="Purchase Price" name="purchase_price" value={custData.purchase_price} onChange={handleChange} step="0.01" min={0} onFocus={(e) => e.target.select()} required />
                            <Form.Control.Feedback type="invalid">Please enter purchase price.</Form.Control.Feedback>
                        </Form.Group>
                        <Form.Group className="mb-3" controlId="gst">
                            <Form.Label>Gst % <span className="text-danger">*</span></Form.Label>
                            <Form.Control type="text" placeholder="Gst % " name="gst" value={productData.gst_percent?.percent} readOnly required style={{ backgroundColor: 'whitesmoke', pointerEvents: 'none' }} />
                            <Form.Control.Feedback type="invalid">Please enter gst % .</Form.Control.Feedback>
                        </Form.Group>
                        <Form.Group className="mb-3" controlId="gst_amount">
                            <Form.Label>Gst Amount <span className="text-danger">*</span></Form.Label>
                            <Form.Control type="number" placeholder="Gst amount" name="gst_amount" value={custData.gst_amount} readOnly required style={{ backgroundColor: 'whitesmoke', pointerEvents: 'none' }} />
                            <Form.Control.Feedback type="invalid">Please enter gst amount.</Form.Control.Feedback>
                        </Form.Group>
                        <Form.Group className="mb-3" controlId="total_amount">
                            <Form.Label>Total Amount <span className="text-danger">*</span></Form.Label>
                            <Form.Control type="text" placeholder="Total Amount" name="total_amount" value={custData.total_amount} readOnly required style={{ backgroundColor: 'whitesmoke', pointerEvents: 'none' }} />
                            <Form.Control.Feedback type="invalid">Please enter gst amount.</Form.Control.Feedback>
                        </Form.Group>
                        <Form.Group className="mb-3" controlId="shipping_charges">
                            <Form.Label>Shipping Charges <span className="text-danger">*</span></Form.Label>
                            <Form.Control type="number" placeholder="Shipping Charges" name="shipping_charges" value={custData.shipping_charges} onChange={handleChange} min={0} onFocus={(e) => e.target.select()} required />
                            <Form.Control.Feedback type="invalid">Please enter shipping charges.</Form.Control.Feedback>
                        </Form.Group>
                        <Form.Group className="mb-3" controlId="packaging_charges">
                            <Form.Label>Packaging Charges <span className="text-danger">*</span></Form.Label>
                            <Form.Control type="number" placeholder="Shipping Charges" name="packaging_charges" value={custData.packaging_charges} onChange={handleChange} min={0} onFocus={(e) => e.target.select()} required />
                            <Form.Control.Feedback type="invalid">Please enter packaging charges.</Form.Control.Feedback>
                        </Form.Group>
                        <Form.Group className="mb-3" controlId="other_charges">
                            <Form.Label>Other Charges <span className="text-danger">*</span></Form.Label>
                            <Form.Control type="number" placeholder="Other Charges" name="other_charges" value={custData.other_charges} onChange={handleChange} min={0} onFocus={(e) => e.target.select()} required />
                            <Form.Control.Feedback type="invalid">Please enter other charges.</Form.Control.Feedback>
                        </Form.Group>
                        <Form.Group as={Col} className="mb-3" controlId="remark">
                            <Form.Label>Remark</Form.Label>
                            <Form.Control as="textarea" rows={1} placeholder="Remark" name="remark" value={custData.remark} onChange={handleChange}/>
                        </Form.Group>
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
