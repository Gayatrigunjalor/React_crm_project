import React, { useEffect, useState, useCallback } from 'react';
import { Form, Card, Row, Col, Alert, Tab, Nav } from 'react-bootstrap';
import { faPlus, faCaretLeft, faTrash } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import Button from '../../../components/base/Button';
import axiosInstance from '../../../axios';
import swal from 'sweetalert';
import { useAuth } from '../../../AuthContext';
import ReactSelect from '../../../components/base/ReactSelect';
import { useNavigate, useParams } from 'react-router-dom';
import { ToastContainer, toast } from "react-toastify";
import { downloadFile } from '../../../helpers/utils';

interface InwardListingData {
    id: number;
    inward_sys_id: string;
}
interface EmployeeData {
    id: number;
    email: string;
    show_active_employees: {
        id: number;
        user_id: number;
        name: string;
        is_click_up_on: number;
    }
}
interface GrnListingData {
    id: number;
    grn_number: string;
}
interface BoxListingData{
    id: number;
    box_sys_id: string;
}

interface ProductsData {
    product_code_id: number;
    product_quantity: number;
    hazardous_symbol: string;
    manufacture_year: string;
    hsn: number;
    box_content: string;
}

interface BoxData {
    box_id: number;
    box_sys_id: string;
    po_number: string;
    location: string;
    net_weight: number;
    gross_weight: number;
    length: number;
    width: number;
    height: number;
    pl_date: string;
    employee_names: string;
    pl_done: number;
    products: ProductsData[];
}


interface FormData {
    id: number | undefined;
    inward: InwardListingData | null;
    inward_id: number;
    grn: GrnListingData | null;
    grn_id: number;
    inward_date: string;
    box: BoxListingData | null;
    box_id: [];
    inspection_done: number;
    inspection_date: string;
    packaging_done: number;
    inspection_remark: string;
    inspection_employee: { id: number; name: string; } | null;
    inspection_employee_ids: number[];
}

const PackagingForm = () => {
    const { inwardId } = useParams();
    const [packagingData, setPackagingData] = useState<FormData>({
        id: undefined,
        inward: null,
        inward_id: 0,
        inward_date: '',
        grn: null,
        grn_id: 0,
        box: null,
        box_id: [],
        inspection_done: 0,
        inspection_date: '',
        packaging_done: 0,
        inspection_remark: '',
        inspection_employee: null,
        inspection_employee_ids: []
    });

    const [isEditing, setIsEditing] = useState<boolean>(false);
    const [validated, setValidated] = useState<boolean>(false);
    const [loading, setLoading] = useState(false);
    const [refreshData, setRefreshData] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const [grnError, setGrnError] = useState<string | null>(null);
    const [shipmentPhotoErrors, setShipmentPhotoErrors] = useState<{ files?: string }>({});

    const [grnData, setGrnData] = useState<GrnListingData[]>([]);
    const [inwardListingData, setInwardListingData] = useState<InwardListingData[]>([]);
    const [employeeData, setEmployeeData] = useState<EmployeeData[]>([]);
    const [boxesData, setBoxesData] = useState<[]>([]);


    const { userPermission } = useAuth(); //check userRole & permissions
    const navigate = useNavigate();
    const handleRedirect = (path: string) => {
        navigate(`/${path}`);
    }

    const handlePackagingList = () => {
        navigate(`/packaging-labeling`);
    };

    const handlePDFclicked = async (quoteId: number, path: string) => {
        try {
            // Fetch the file from the server using the ID
            const response = await axiosInstance.get(`/${path}/${quoteId}`, {
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
    }

    useEffect(() => {

        const fetchPackagingDetails = async () => {
            try {

                setIsEditing(true);
                // Fetch customer data for editing
                const response = await axiosInstance.get(`/complete-packaging/${inwardId}`);
                if (response.status !== 200) {
                    throw new Error('Failed to fetch data');
                }
                const inward_data = await response.data.inward;
                const grns: GrnListingData[] = await response.data.grns;

                setPackagingData({ ...packagingData, inward_id: inward_data.id, inward: inward_data, grn: grns[0], grn_id: grns[0].id })
                setGrnData(grns);
                if(grns.length > 0){
                    axiosInstance.get(`/getBoxesByGrnId?id=${grns[0].id}`)
                    .then(response => {
                        setBoxesData(response.data);
                    });
                }
            } catch (err: any){

            }

        }
        if (inwardId) {
            fetchPackagingDetails();
        }
    }, []);

    useEffect(() => {
        const today = new Date(); // Get today's date
        const formattedDate = today.toISOString().split('T')[0]; // Format it to YYYY-MM-DD

        const fetchInwardListing = async () => {
            try {
                const response = await axiosInstance.get('/createPackaging');
                if (response.status !== 200) {
                    throw new Error('Failed to fetch data');
                }
                const data: InwardListingData[] = await response.data.inwards;
                const employees: EmployeeData[] = await response.data.inspectionEmployees;
                setInwardListingData(data);
                setEmployeeData(employees);
            } catch (err: any) {
                setError(err.message);
            } finally {
            }
        };
        fetchInwardListing();
    }, []);


    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;

        // Handle nested fields with array indices
        const fields = name.split('.');
        if (fields.length > 1) {

        } else {
            // Handle top-level fields
            setPackagingData(prev => ({ ...prev, [name]: value }));
        }
    };

    const handleInspectionChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target
        setPackagingData({
            ...packagingData,
            [name]: value === "1" ? 1 : 0
        });
    }


    const handleInwardSelect = (selectedOption: any) => {
        if (selectedOption) {
            setGrnData([]);
            setPackagingData(prev => ({
                ...prev,
                inward: { id: selectedOption.value, inward_sys_id: selectedOption.label },
                inward_id: selectedOption.value,
                grn: null,
                grn_id: 0,
            }));
            try {
                axiosInstance.get(`/getInwardGRNs?id=${selectedOption.value}`)
                .then(response => {
                    setGrnData(response.data);
                });
            } catch (err: any) {
                setGrnError(err.data.message);
            }
        }
    };

    const handleInspectionEmployee = (selectedOptions: any) => {
        if (selectedOptions) {
            const selectedIds = selectedOptions.map((option: any) => option.value);
            setPackagingData(prev => ({
                ...prev,
                inspection_employee_ids: selectedIds,
                inspection_employee: selectedOptions
            }));
        }
    };
    const handleBoxselection = (selectedOptions: any) => {
        if (selectedOptions) {
            const selectedIds = selectedOptions.map((option: any) => option.value);
            setPackagingData(prev => ({
                ...prev,
                box_id: selectedIds,
                box: selectedOptions
            }));
        }
    };
    const handleGrnChange = (selectedOption: any) => {
        if (selectedOption) {
            setBoxesData([]);
            setPackagingData(prev => ({
                ...prev,
                grn: { id: selectedOption.value, grn_number: selectedOption.label },
                grn_id: selectedOption.value,
                box_id: [],
                box: null,
            }));
            try {
                axiosInstance.get(`/getBoxesByGrnId?id=${selectedOption.value}`)
                .then(response => {
                    setBoxesData(response.data);
                });
            } catch (err: any) {
                setGrnError(err.data.message);
            }
        }
    };


    const handleSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const { name, value } = e.target;
        setPackagingData({ ...packagingData, [name]: value });
    };


    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        const form = e.currentTarget;
        if (form.checkValidity() === false) {
            e.preventDefault();
            e.stopPropagation();
            setValidated(true);
            return;
        }
        // Validate the required field
        if (packagingData.packaging_done === 0) {
            toast.error("Before marking as complete, Please select Inspection By and set Packaging Done to 'Yes' ");
            setValidated(true);
            return;
        }
        setLoading(true);
        setValidated(true);

        const apiCall = axiosInstance.post('/addPackagingDetails', {
                ...packagingData,
            });

        apiCall
            .then((response) => {
                swal("Success!", response.data.message, "success");
                handlePackagingList();
        })
        .catch(error => swal("Error!", error.data.message, "error"))
        .finally(() => { setLoading(false); });
    };

    if (error) return <div>Error: {error}</div>;
    return (
        <>
            <Row>
                <Col><h3 className='px-4 mb-2'>{isEditing ? 'Edit Packaging & Labeling' : 'Create Packaging & Labeling'}</h3></Col>
            </Row>
            <hr></hr>
            <Card style={{ width: '100%' }}>
                <Card.Title>
                    <Row className='mt-4 px-4'>
                        <Col className='d-flex align-items-center justify-content-start'><h5>Select inward to add PSD details</h5></Col>
                        <Col className='d-flex justify-content-end'><Button
                                size='sm'
                                variant="primary"
                                className=""
                                startIcon={<FontAwesomeIcon icon={faCaretLeft} className="me-2" />}
                                onClick={() => handlePackagingList()}
                                >
                                    Packaging List
                            </Button>
                        </Col>
                    </Row>
                </Card.Title>

                <Card.Body className='pt-0'>
                    <Row>
                        <Form noValidate validated={validated} onSubmit={handleSubmit}>
                            <Row className='mb-2'>
                                <Form.Group as={Col} className="mb-3">
                                    <Form.Label>Select Inward ID <span className="text-danger">*</span></Form.Label>
                                    <ReactSelect
                                        options= {inwardListingData.map((option: InwardListingData) => (
                                            { value: option.id, label: option.inward_sys_id }
                                        ))}
                                        placeholder="Select Inward ID" name="inward" value={packagingData.inward ? { value: packagingData.inward.id, label: packagingData.inward.inward_sys_id } : null} onChange={(selectedOption) => handleInwardSelect(selectedOption)} isDisabled={isEditing} />
                                    <Form.Control type="hidden" name="inward_id" value={packagingData.inward_id} />
                                    {validated && !packagingData.inward_id && (
                                        <div className="invalid-feedback d-block">Please select Proforma Invoice Number</div>
                                    )}
                                </Form.Group>
                                <Form.Group as={Col} className="mb-3">
                                    <Form.Label>Select GRN <span className="text-danger">*</span></Form.Label>
                                    <ReactSelect
                                        options= {grnData.map((option: GrnListingData) => (
                                            { value: option.id, label: `${option.grn_number}` }
                                        ))}
                                        placeholder="Select GRN" name="grn" value={packagingData.grn ? { value: packagingData.grn.id, label: packagingData.grn.grn_number } : null} onChange={(selectedOption) => handleGrnChange(selectedOption)} />
                                        <Form.Control type="hidden" name="grn_id" value={packagingData.grn_id} />
                                        {validated && !packagingData.grn_id && (
                                            <div className="invalid-feedback d-block">Please select GRN</div>
                                        )}
                                </Form.Group>
                            </Row>

                            <hr className='border border-danger border-1'/>
                            <Card.Title as="h5" className="text-danger">Selected GRN ID : { packagingData.grn ? packagingData.grn.grn_number : null}</Card.Title>

                            {packagingData.grn && (
                                <>
                                    <table className='fs-8 table striped bordered mb-4'>
                                        <thead>
                                            <tr>
                                                <th className='p-2 border border-secondary'>ID</th>
                                                <th className='p-2 border border-secondary'>Purchase Order</th>
                                                <th className='p-2 border border-secondary'>Location</th>
                                                <th className='p-2 border border-secondary'>Net Wt</th>
                                                <th className='p-2 border border-secondary'>Gross Wt</th>
                                                <th className='p-2 border border-secondary'>L</th>
                                                <th className='p-2 border border-secondary'>B</th>
                                                <th className='p-2 border border-secondary'>H</th>
                                                <th className='p-2 border border-secondary'>Packaging Date</th>
                                                <th className='p-2 border border-secondary'>Inspection By</th>
                                                <th className='p-2 border border-secondary'>Action</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {boxesData.map((box: BoxData,index) => (
                                                <>
                                                <tr key={index} className={box.pl_done == 1 ? 'bg-success' : ''}>
                                                    <td className='p-2 border border-secondary'>{box.box_sys_id}</td>
                                                    <td className='p-2 border border-secondary'>{box.po_number}</td>
                                                    <td className='p-2 border border-secondary'>{box.location}</td>
                                                    <td className='p-2 border border-secondary'>{box.net_weight}</td>
                                                    <td className='p-2 border border-secondary'>{box.gross_weight}</td>
                                                    <td className='p-2 border border-secondary'>{box.length}</td>
                                                    <td className='p-2 border border-secondary'>{box.width}</td>
                                                    <td className='p-2 border border-secondary'>{box.height}</td>
                                                    <td className='p-2 border border-secondary'>{box.pl_date}</td>
                                                    <td className='p-2 border border-secondary'>{box.employee_names}</td>
                                                    <td className='p-2 border border-secondary'>{box.pl_done}</td>
                                                </tr>
                                                <tr key={`prod_${index}`}>
                                                    <td></td>
                                                    <td className='pt-0' colSpan={9}>
                                                        <table className='phoenix-table fs-8 table'>
                                                            <thead>
                                                                <tr>
                                                                    <th className='p-2 border border-translucent'>Product ID</th>
                                                                    <th className='p-2 border border-translucent'>Qty</th>
                                                                    <th className='p-2 border border-translucent'>HAZ</th>
                                                                    <th className='p-2 border border-translucent'>Mfg</th>
                                                                    <th className='p-2 border border-translucent'>HSN</th>
                                                                    <th className='p-2 border border-translucent'>Box Content</th>
                                                                </tr>
                                                            </thead>
                                                            <tbody>
                                                                {box.products.map((prod, idx) => (
                                                                    <tr key={idx}>
                                                                        <td className='p-2 border border-translucent'>{prod.product_code_id}</td>
                                                                        <td className='p-2 border border-translucent'>{prod.product_quantity}</td>
                                                                        <td className='p-2 border border-translucent'>{prod.hazardous_symbol}</td>
                                                                        <td className='p-2 border border-translucent'>{prod.manufacture_year}</td>
                                                                        <td className='p-2 border border-translucent'>{prod.hsn}</td>
                                                                        <td className='p-2 border border-translucent'>{prod.box_content}</td>
                                                                    </tr>
                                                                ))}
                                                            </tbody>
                                                        </table>
                                                    </td>
                                                    <td></td>
                                                </tr>
                                                </>
                                            ))}
                                        </tbody>
                                    </table>

                                    <hr className='border border-danger border-1'/>
                                    <Card.Title as="h5" className="text-danger">Select a box for Inspection : { packagingData.grn ? packagingData.grn.grn_number : null}</Card.Title>

                                    <Row>
                                        <Col md={4}>
                                            <Form.Group as={Col} className="mb-3">
                                                <Form.Label>Select Box (select multiple boxes for inspection) <span className="text-danger">*</span></Form.Label>
                                                <ReactSelect
                                                    options= {boxesData.map((option: BoxData) => (
                                                        { value: option.box_id, label: option.box_sys_id }
                                                    ))}
                                                    isMulti
                                                    placeholder="Select Box" name="box" value={packagingData.box || [] } onChange={(selectedOptions) => handleBoxselection(selectedOptions)} required />
                                                <Form.Control type="hidden" name="box_id" value={packagingData.box_id.join(',')} />
                                                {validated && packagingData.box_id.length === 0 && (
                                                    <div className="invalid-feedback d-block">Please select Box</div>
                                                )}
                                            </Form.Group>
                                        </Col>
                                    </Row>
                                    <Row>
                                        <Col md={4}>
                                            <Form.Label>Inspection Done <span className="text-danger">*</span></Form.Label>
                                            <Form.Check type="radio" id="inspection-yes" label="Yes" name="inspection_done" value="1" checked={packagingData.inspection_done === 1} onChange={handleInspectionChange} />
                                            <Form.Check type="radio" id="inspection-no" label="No" name="inspection_done" value="0" checked={packagingData.inspection_done === 0} onChange={handleInspectionChange} />
                                        </Col>
                                        {packagingData.inspection_done === 1 && (
                                            <>
                                            <Col md={4}>
                                                <Form.Group as={Col} className="mb-3">
                                                    <Form.Label>Inspection By (multiple select) <span className="text-danger">*</span></Form.Label>
                                                    <ReactSelect
                                                        options= {employeeData.map((option: EmployeeData) => (
                                                            { value: option.id, label: option.show_active_employees.name }
                                                        ))}
                                                        isMulti
                                                        placeholder="Select Employees" name="inspection_employee" value={packagingData.inspection_employee || [] } onChange={(selectedOption) => handleInspectionEmployee(selectedOption)} required />
                                                    <Form.Control type="hidden" name="inspection_employee_ids" value={packagingData.inspection_employee_ids.join(',')} />

                                                    {validated && packagingData.inspection_employee_ids.length === 0 && (
                                                        <div className="invalid-feedback d-block">Please select Inspection employees</div>
                                                    )}
                                                </Form.Group>
                                            </Col>
                                            <Col md={4}>
                                                <Form.Group as={Col} className="mb-3" controlId="">
                                                    <Form.Label>Inspection Date <span className="text-danger">*</span></Form.Label>
                                                    <Form.Control type="date" placeholder="Inspection Date" name="inspection_date" value={packagingData.inspection_date} onChange={handleChange} required />
                                                    <Form.Control.Feedback type="invalid">Please enter Inspection Date.</Form.Control.Feedback>
                                                </Form.Group>
                                            </Col>
                                            <Col md={12}>
                                                <Form.Group className="mb-3" controlId={`box_content_`}>
                                                    <Form.Label>Inspection Remark <span className="text-danger">*</span></Form.Label>
                                                    <Form.Control as="textarea" rows={3} placeholder="Inspection remark" name="inspection_remark" value={packagingData.inspection_remark} onChange={handleChange} required />
                                                    <Form.Control.Feedback type="invalid">Please enter Inspection Remark.</Form.Control.Feedback>
                                                </Form.Group>
                                            </Col>
                                            </>
                                        )}
                                    </Row>

                                    <hr />

                                    <Row>
                                        <Col md={4}>
                                            <Form.Label>Packaging Done <span className="text-danger">*</span></Form.Label>
                                            <Form.Check type="radio" id="packaging-yes" label="Yes" name="packaging_done" value="1" checked={packagingData.packaging_done === 1} onChange={handleInspectionChange} />
                                            <Form.Check type="radio" id="packaging-no" label="No" name="packaging_done" value="0" checked={packagingData.packaging_done === 0} onChange={handleInspectionChange} />
                                        </Col>
                                    </Row>

                                </>
                            )}

                            <hr />

                            <Row className='mt-2'>
                                <Col className='text-center'>
                                <Button variant="primary" loading={loading} loadingPosition="start" type="submit">{isEditing ? 'Update' : 'Save'}</Button>
                                </Col>
                            </Row>

                        </Form>
                    </Row>

                </Card.Body>
            </Card>

            <ToastContainer className='py-0' />
        </>
    )
};

export default PackagingForm;

