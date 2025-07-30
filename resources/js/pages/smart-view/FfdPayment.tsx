import { faCaretLeft, faCirclePlus, faDownload, faPlus } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import Button from '../../components/base/Button';
import React, { useEffect, useState, ChangeEvent } from 'react';
import { Card, Col, Row, Nav, Tab } from 'react-bootstrap';
import axiosInstance from '../../axios';
import useAdvanceTable from '../../hooks/useAdvanceTable';
import AdvanceTableProvider from '../../providers/AdvanceTableProvider';
import SearchBox from '../../components/common/SearchBox';
import { useAuth } from '../../AuthContext';
import { ColumnDef } from '@tanstack/react-table';
import AdvanceTable from '../../components/base/AdvanceTable';
import AdvanceTableFooter from '../../components/base/AdvanceTableFooter';
import swal from 'sweetalert';
import { useNavigate, useParams } from 'react-router-dom';
import { downloadFile } from '../../helpers/utils';

interface FfdPaymentData {
    id: number;
    ffd_id: number;
    freight_agent: string;
    business_task_id: number;
    ffd_name: { ffd_name?: string }
    pick_up_location: string;
    delivery_location: string;
    quoting_price: string;
    contact_person_name: string;
    contact_person_email: string;
    contact_person_phone: string;
    tender_status: string;
    vessel_airline_name: string;
    vessel_airline_date: string;
}

interface FfdPurchaseOrderData {
    id: number;
    business_task_id: number;
    ffd_name: { ffd_name?: string }
    purchase_order_number: string;
    order_date: string;
    vendor: string;
    expected_delivery_date: string;
    grand_total: string;
    quotation_attach: [{ id: number; po_id: number; name: string; }];
}

const FfdPayment = () => {
    const [winnerFfdTableData, setWinnerFfdTableData] = useState<FfdPaymentData[]>([]);
    const [bidderFfdTableData, setBidderFfdTableData] = useState<FfdPaymentData[]>([]);
    const [ffdPoTableData, setFfdPoTableData] = useState<FfdPurchaseOrderData[]>([]);
    const [error, setError] = useState<string | null>(null);

    const navigate = useNavigate();

    const handleShow = (contactId?: number) => {
        // setSelectedContactId(contactId);
    };

    const handleFfdList = () => {
        navigate(`/master/ffds`)
    };



    const winner_table = useAdvanceTable({
        data: winnerFfdTableData,
        columns: ffdDataTableColumns(handleShow),
        pageSize: 10,
        pagination: true,
        sortable: true,
        selection: false,
        initialState: {
            columnVisibility: {

            }
        }
    });

    const bidder_table = useAdvanceTable({
        data: bidderFfdTableData,
        columns: ffdDataTableColumns(handleShow),
        pageSize: 10,
        pagination: true,
        sortable: true,
        selection: false,
        initialState: {
            columnVisibility: {

            }
        }
    });

    const po_table = useAdvanceTable({
        data: ffdPoTableData,
        columns: ffdPoDataTableColumns(handleShow),
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
        winner_table.setGlobalFilter(e.target.value || undefined);
    };

    const handleBidderSearchInputChange = (e: ChangeEvent<HTMLInputElement>) => {
        bidder_table.setGlobalFilter(e.target.value || undefined);
    };

    const handlePOSearchInputChange = (e: ChangeEvent<HTMLInputElement>) => {
        po_table.setGlobalFilter(e.target.value || undefined);
    };

    useEffect(() => {
        const fetchFfdData = async () => {
            try {
                const response = await axiosInstance.get(`/ffd-payment`);
                if (response.status !== 200) {
                    throw new Error('Failed to fetch data');
                }
                const data = await response.data;
                const winner_ffd_data: FfdPaymentData[] = data.ffd_winners; //winner table data
                const bidder_ffd_data: FfdPaymentData[] = data.ffd_bidders; //bidder or disqualified table data
                const ffd_po_data: FfdPurchaseOrderData[] = data.ffd_purch_orders; //po table data
                setWinnerFfdTableData(winner_ffd_data);
                setBidderFfdTableData(bidder_ffd_data);
                setFfdPoTableData(ffd_po_data);
            } catch (err: any) {
                setError(err.data.message);
            } finally {

            }
        };

        fetchFfdData();
    }, []);

    if (error) return <div>Error: {error}</div>;

    return (
        <>
            <h2 className="mt-2 mb-5">FFD Payment</h2>
            <Card className="mb-4">
                <Card.Body>
                    <Tab.Container id="basic-tabs-example" defaultActiveKey="enabled">
                        <Row>
                            <Col>
                                <Nav variant="underline">
                                    <Nav.Item>
                                        <Nav.Link eventKey="enabled" className='fs-8'>Winner FFD</Nav.Link>
                                    </Nav.Item>
                                    <Nav.Item>
                                        <Nav.Link eventKey="disabled" className='fs-8'>Bidder FFD</Nav.Link>
                                    </Nav.Item>
                                </Nav>
                            </Col>
                        </Row>

                        <Tab.Content>
                            <Tab.Pane eventKey="enabled">
                                <AdvanceTableProvider {...winner_table}>
                                    <Row className="g-3 justify-content-between my-2">
                                        <Col xs="auto">
                                            <div className="d-flex">
                                                <SearchBox
                                                    placeholder="Search ffd"
                                                    className="me-2"
                                                    onChange={handleSearchInputChange}
                                                />
                                            </div>
                                        </Col>
                                    </Row>
                                    <DataTable />
                                </AdvanceTableProvider>
                            </Tab.Pane>
                            <Tab.Pane eventKey="disabled">
                                <AdvanceTableProvider {...bidder_table}>
                                    <Row className="g-3 justify-content-between my-2">
                                        <Col xs="auto">
                                            <div className="d-flex">
                                                <SearchBox
                                                    placeholder="Search ffd"
                                                    className="me-2"
                                                    onChange={handleBidderSearchInputChange}
                                                />
                                            </div>
                                        </Col>
                                    </Row>
                                    <DataTable />
                                </AdvanceTableProvider>
                            </Tab.Pane>
                        </Tab.Content>
                    </Tab.Container>
                </Card.Body>
            </Card>

            <Card>
                <Card.Body>
                    <Row>
                        <Col><h4 className='px-4 my-2'>FFD Purchase Orders</h4></Col>
                    </Row>
                    <AdvanceTableProvider {...po_table}>
                        <Row className="g-3 justify-content-between my-2">
                            <Col xs="auto">
                                <div className="d-flex">
                                    <SearchBox
                                        placeholder="Search ffd"
                                        className="me-2"
                                        onChange={handlePOSearchInputChange}
                                    />
                                </div>
                            </Col>
                        </Row>
                        <DataTable />
                    </AdvanceTableProvider>
                </Card.Body>
            </Card>

        </>
    );
};

export default FfdPayment;

const handleDownload = async (url: string) => {
    try {
        // Fetch the file from the server using the upload ID
        const response = await axiosInstance.get(`${url}`, {
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
    } catch (error: any) {
        if (error.status === 404) {
            swal("Error!", 'File not found', "error");
        }
        console.error('Error downloading the file:', error);
    }
};

//FFD table columns
const ffdDataTableColumns = (handleShow: (contactId?: number) => void): ColumnDef<FfdPaymentData>[] => [
    {
        accessorKey: 'business_task_id',
        header: () => {
            return (
                <div className="d-inline-flex flex-center">
                    <span>BT ID</span>
                </div>
            );
        },
        cell: ({ row: { original } }) => {
            const { business_task_id } = original;
            return (
                <span>{business_task_id}</span>
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
        accessorKey: 'ffd_id',
        header: () => {
            return (
                <div className="d-inline-flex flex-center">
                    <span>Freight Agent</span>
                </div>
            );
        },
        cell: ({ row: { original } }) => {
            const { ffd_id, ffd_name, freight_agent } = original;
            return (
                <span>{ffd_id != null ? (ffd_name.ffd_name != null ? ffd_name.ffd_name : '') : freight_agent}</span>
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
                <span>{pick_up_location ? pick_up_location : '' }</span>
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
                <span>{delivery_location ? delivery_location : '' }</span>
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
                <span>{quoting_price ? quoting_price : '' }</span>
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
        accessorKey: 'contact_person_name',
        header: () => {
            return (
                <div className="d-inline-flex flex-center">
                    <span>Contact Person</span>
                </div>
            );
        },
        cell: ({ row: { original } }) => {
            const { contact_person_name } = original;
            return (
                <span>{contact_person_name ? contact_person_name : '' }</span>
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
        accessorKey: 'contact_person_email',
        header: () => {
            return (
                <div className="d-inline-flex flex-center">
                    <span>Email ID</span>
                </div>
            );
        },
        cell: ({ row: { original } }) => {
            const { contact_person_email } = original;
            return (
                <span>{contact_person_email ? contact_person_email : '' }</span>
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
                <span>{contact_person_phone ? contact_person_phone : '' }</span>
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
        accessorKey: 'tender_status',
        header: () => {
            return (
                <div className="d-inline-flex flex-center">
                    <span>Status</span>
                </div>
            );
        },
        cell: ({ row: { original } }) => {
            const { tender_status } = original;
            return (
                <span>{tender_status ? tender_status : '' }</span>
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
                <span>{vessel_airline_name ? vessel_airline_name : '' }</span>
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
                <span>{vessel_airline_date ? vessel_airline_date : '' }</span>
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
//PO table columns
const ffdPoDataTableColumns = (handleShow: (contactId?: number) => void): ColumnDef<FfdPurchaseOrderData>[] => [
    {
        accessorKey: 'purchase_order_number',
        header: () => {
            return (
                <div className="d-inline-flex flex-center">
                    <span>Po No</span>
                </div>
            );
        },
        cell: ({ row: { original } }) => {
            const { purchase_order_number } = original;
            return (
                <span>{purchase_order_number}</span>
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
        accessorKey: 'order_date',
        header: () => {
            return (
                <div className="d-inline-flex flex-center">
                    <span>Order Date</span>
                </div>
            );
        },
        cell: ({ row: { original } }) => {
            const { order_date } = original;
            return (
                <span>{order_date != null ? order_date : ''}</span>
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
        accessorKey: 'business_task_id',
        header: () => {
            return (
                <div className="d-inline-flex flex-center">
                    <span>BT ID</span>
                </div>
            );
        },
        cell: ({ row: { original } }) => {
            const { business_task_id } = original;
            return (
                <span>{business_task_id ? business_task_id : '' }</span>
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
        accessorKey: 'vendor',
        header: () => {
            return (
                <div className="d-inline-flex flex-center">
                    <span>Supplier Name</span>
                </div>
            );
        },
        cell: ({ row: { original } }) => {
            const { vendor } = original;
            return (
                <span>{vendor ? vendor : '' }</span>
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
        accessorKey: 'expected_delivery_date',
        header: () => {
            return (
                <div className="d-inline-flex flex-center">
                    <span>Expexted Delivery Date</span>
                </div>
            );
        },
        cell: ({ row: { original } }) => {
            const { expected_delivery_date } = original;
            return (
                <span>{expected_delivery_date ? expected_delivery_date : '' }</span>
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
        accessorKey: 'grand_total',
        header: () => {
            return (
                <div className="d-inline-flex flex-center">
                    <span>Grand Total</span>
                </div>
            );
        },
        cell: ({ row: { original } }) => {
            const { grand_total } = original;
            return (
                <span>{grand_total ? grand_total : '' }</span>
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
        id: 'attachments',
        header: () => {
            return (
                <div className="d-inline-flex flex-center">
                    <span>PO Attachments</span>
                </div>
            );
        },
        cell: ({ row: { original } }) => {
            const { id, quotation_attach } = original;
            const { userPermission } = useAuth();
            return (
                <>
                    <span>
                    {quotation_attach.length > 0 ? (
                        quotation_attach.map((upload) => (
                            <span className="d-flex">
                            <Button
                                key={upload.id}
                                className="text-primary p-0 d-flex"
                                variant="link"
                                title="Download"
                                onClick={() => handleDownload(`/getFileDownload?filepath=uploads/purchase-order/quotations/${upload.name}`)}
                                startIcon={<FontAwesomeIcon icon={faDownload} />}
                            >
                                {upload.name}
                            </Button>
                            </span>

                            ))
                    ) : 'N/A'}
                    </span>
                </>
            );
        },
        meta: {
            headerProps: {
                className: 'ps-2 pe-2 border-end border-translucent'
            },
            cellProps: {
                className: 'ps-2 border-end border-translucent'
            }
        },
    },
];
const DataTable = () => {
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
