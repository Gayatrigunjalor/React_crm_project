import React, { useEffect, useState } from 'react';
import { Form, Modal, Row, Col } from 'react-bootstrap';
import Button from '../../../components/base/Button';
import axiosInstance from '../../../axios';
import swal from 'sweetalert';
import { useAuth } from '../../../AuthContext';
import ReactSelect from '../../../components/base/ReactSelect';

interface CategoryData {
    id: number;
    name: string;
}
interface SegmentData {
    id: number;
    name: string;
}
interface CustomerBaseData {
    id: number;
    name: string;
}
interface CustomerTypeData {
    id: number;
    name: string;
}
interface CountriesData {
    id: number;
    name: string;
    sortname: string;
    phonecode: string;
}
interface TimezonesData {
    id: number;
    name: string;
    offset: string;
}
interface FormData {
    id?: number;
    name: string;
    employee_name: string;
    customer_type_id: number;
    customer_type: CustomerTypeData | null;
    segment_id: number;
    segment: SegmentData | null;
    category_id: number;
    category: SegmentData | null;
    customer_base_id: number;
    customer_base: CustomerBaseData | null;
    address: string;
    country_id: number;
    country: CountriesData | null;
    city: string;
    time_zone: number;
    timezone: TimezonesData | null;
    pin_code: string;
    website: string;
    country_code: string;
    area_code: string;
    contact_no: string;
    contact_person: string;
    designation: string;
    landline_no: string;
    email: string;
    alternate_email: string;
    mobile_number: string;
    i_am_member_since: string;
}
interface CustomerModalProps {
    cusId?: number;
    onHide: () => void;
    onSuccess: () => void;
}
const CustomersModal: React.FC<CustomerModalProps> = ({ cusId, onHide, onSuccess }) => {
    const [custData, setUserData] = useState<FormData>({
        id: 0,
        name: '',
        employee_name: '',
        customer_type_id: 0,
        customer_type: null,
        segment_id: 0,
        segment: null,
        category_id: 0,
        category: null,
        customer_base_id: 0,
        customer_base: null,
        address: '',
        country_id: 0,
        country: null,
        city: '',
        time_zone: 0,
        timezone: null,
        pin_code: '',
        website: '',
        country_code: '',
        area_code: '',
        contact_no: '',
        contact_person: '',
        designation: '',
        landline_no: '',
        email: '',
        alternate_email: '',
        mobile_number: '',
        i_am_member_since: '',

    });
    const [isEditing, setIsEditing] = useState<boolean>(false);
    const [validated, setValidated] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const [segmentsData, setSegmentsData] = useState<SegmentData[]>([]);
    const [customerBaseData, setCustomerBaseData] = useState<CustomerBaseData[]>([]);
    const [customerTypeData, setCustomerTypeData] = useState<CustomerTypeData[]>([]);
    const [countriesData, setCountriesData] = useState<CountriesData[]>([]);
    const [timezonesData, setTimezonesData] = useState<TimezonesData[]>([]);
    const [categoryData, setCategoryData] = useState([]);
    const [loading, setLoading] = useState(false);
    const { empData } = useAuth(); //check userRole & permissions

    useEffect(() => {

        if (cusId) {
            setIsEditing(true);
            // Fetch customer data for editing
            axiosInstance.get(`/customers/${cusId}`)
            .then(response => {
                setUserData(response.data);
            })
            .catch(error => console.error('Error fetching customer data:', error));
        }
    }, [cusId]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setUserData({ ...custData, [name]: value });
    };

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

        const fetchCustomerBase = async () => {
            try {
                const response = await axiosInstance.get('/customerBaseListing');
                if (response.status !== 200) {
                    throw new Error('Failed to fetch data');
                }
                const data: CustomerBaseData[] = await response.data;
                setCustomerBaseData(data);
            } catch (err: any) {
                setError(err.message);
            } finally {
            }
        };

        const fetchCustomerType = async () => {
            try {
                const response = await axiosInstance.get('/customerTypeListing');
                if (response.status !== 200) {
                    throw new Error('Failed to fetch data');
                }
                const data: CustomerTypeData[] = await response.data;
                setCustomerTypeData(data);
            } catch (err: any) {
                setError(err.message);
            } finally {
            }
        };
        const fetchCountries = async () => {
            try {
                const response = await axiosInstance.get('/countryListing');
                if (response.status !== 200) {
                    throw new Error('Failed to fetch data');
                }
                const data: CountriesData[] = await response.data;
                setCountriesData(data);
            } catch (err: any) {
                setError(err.message);
            } finally {
            }
        };

        const fetchTimezones = async () => {
            try {
                const response = await axiosInstance.get('/getTimezoneList');
                if (response.status !== 200) {
                    throw new Error('Failed to fetch data');
                }
                const data: TimezonesData[] = await response.data;
                setTimezonesData(data);
            } catch (err: any) {
                setError(err.message);
            } finally {
            }
        };

        fetchSegment();
        fetchCustomerBase();
        fetchCustomerType();
        fetchCountries();
        fetchTimezones();
    }, []);

    const handleRSelect = (selectedOption: { value: number; label: string } | null, fieldName: string) => {
        if (selectedOption) {
            if(fieldName == 'customer_type') {
                setUserData({ ...custData, customer_type: {
                    id: selectedOption.value,
                    name: selectedOption.label
                }, customer_type_id: selectedOption.value });
            }
            if(fieldName == 'customer_base') {
                setUserData({ ...custData, customer_base: {
                    id: selectedOption.value,
                    name: selectedOption.label
                }, customer_base_id: selectedOption.value });
            }
            if(fieldName == 'country') {
                setUserData({ ...custData, country: {
                    id: selectedOption.value,
                    name: selectedOption.label,
                    sortname: selectedOption.label,
                    phonecode: selectedOption.label
                }, country_id: selectedOption.value });
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
                }, segment_id: selectedOption.value,
                category_id: 0,
                category: null, });
                axiosInstance.get(`/getCategories?segment_id=${selectedOption.value}`)
                .then(response => {
                    setCategoryData(response.data);
                });
            }
            if(fieldName == 'timezone') {
                setUserData({ ...custData, timezone: {
                    id: selectedOption.value,
                    name: selectedOption.label,
                    offset: selectedOption.label
                }, time_zone: selectedOption.value });
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
            ? axiosInstance.put(`/customers/${custData.id}`,  {
                name: custData.name,
                employee_name: custData.employee_name,
                customer_type: custData.customer_type,
                customer_type_id: custData.customer_type_id,
                segment: custData.segment,
                segment_id: custData.segment_id,
                category: custData.category,
                category_id: custData.category_id,
                customer_base: custData.customer_base,
                customer_base_id: custData.customer_base_id,
                address: custData.address,
                country: custData.country,
                country_id: custData.country_id,
                city: custData.city,
                pin_code: custData.pin_code,
                timezone: custData.timezone,
                time_zone: custData.time_zone,
                website: custData.website,
                country_code: custData.country_code,
                area_code: custData.area_code,
                contact_no: custData.contact_no,
                contact_person: custData.contact_person,
                designation: custData.designation,
                landline_no: custData.landline_no,
                email: custData.email,
                alternate_email: custData.alternate_email,
                mobile_number: custData.mobile_number,
                i_am_member_since: custData.i_am_member_since,
            })
            : axiosInstance.post('/customers', {
                ...custData,
                employee_name: empData.name
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
                    <Modal.Title>{isEditing ? 'Edit Customer' : 'Add Customer'}</Modal.Title>
                </Modal.Header>
                <Form noValidate validated={validated} onSubmit={handleSubmit}>
                    <Modal.Body>
                        <Form.Control type="hidden" name="id" value={custData.id} />
                        <Row className="g-3">
                            <Form.Group as={Col} className="mb-3" controlId="name">
                                <Form.Label>Customer Name <span className="text-danger">*</span></Form.Label>
                                <Form.Control type="text" placeholder="Customer Name" name="name" value={custData.name} onChange={handleChange} required />
                                <Form.Control.Feedback type="invalid">Please enter PickUp Reference Number.</Form.Control.Feedback>
                            </Form.Group>
                            <Form.Group as={Col} className="mb-3" controlId="employee_name">
                                <Form.Label>Employee Name</Form.Label>
                                <Form.Control type="text" name="employee_name" value={custData.employee_name ? custData.employee_name : empData.name} readOnly style={{backgroundColor: 'whitesmoke', pointerEvents: 'none'}} />
                            </Form.Group>
                            <Form.Group as={Col} className="mb-3" controlId="customer_type">
                                <Form.Label>Customer Type <span className="text-danger">*</span></Form.Label>
                                <ReactSelect
                                    options= {customerTypeData.map((option: CustomerTypeData) => (
                                        { value: option.id, label: option.name }
                                    ))}
                                    placeholder="Select Customer Type" name="customer_type" value={custData.customer_type ? { value: custData.customer_type.id, label: custData.customer_type.name } : null} onChange={(selectedOption) => handleRSelect(selectedOption, 'customer_type')} required
                                />
                                <Form.Control type="hidden" name="customer_type_id" value={custData.customer_type_id} />
                                {validated && !custData.customer_type_id && (
                                    <div className="invalid-feedback d-block">Please enter customer type</div>
                                )}
                            </Form.Group>
                        </Row>
                        <Row className="g-3">
                            <Form.Group as={Col} className="mb-3" controlId='segment'>
                                <Form.Label>Segment <span className="text-danger">*</span></Form.Label>
                                <ReactSelect
                                    options= {segmentsData.map((option: SegmentData) => (
                                        { value: option.id, label: option.name }
                                    ))}
                                    placeholder="Select segment" name="segment" value={custData.segment ? { value: custData.segment.id, label: custData.segment.name } : null} onChange={(selectedOption) => handleRSelect(selectedOption, 'segment')} required
                                />
                                <Form.Control type="hidden" name="segment_id" value={custData.segment_id} />
                                {validated && !custData.segment_id && (
                                    <div className="invalid-feedback d-block">Please enter segment</div>
                                )}
                            </Form.Group>
                            <Form.Group as={Col} className="mb-3" controlId='category'>
                                <Form.Label>Category <span className="text-danger">*</span></Form.Label>
                                <ReactSelect
                                    options= {categoryData.map((option: CategoryData) => (
                                        { value: option.id, label: option.name }
                                    ))}
                                    placeholder="Select Category" name="category" value={custData.category ? { value: custData.category.id, label: custData.category.name } : null} onChange={(selectedOption) => handleRSelect(selectedOption, 'category')} required
                                />
                                <Form.Control type="hidden" name="category_id" value={custData.category_id} />
                                {validated && !custData.category_id && (
                                    <div className="invalid-feedback d-block">Please enter category</div>
                                )}
                            </Form.Group>
                            <Form.Group as={Col} className="mb-3" controlId="customer_base">
                                <Form.Label>Customer Base <span className="text-danger">*</span></Form.Label>
                                <ReactSelect
                                    options= {customerBaseData.map((option: CustomerBaseData) => (
                                        { value: option.id, label: option.name }
                                    ))}
                                    placeholder="Select Customer Base" name="customer_base" value={custData.customer_base ? { value: custData.customer_base.id, label: custData.customer_base.name } : null} onChange={(selectedOption) => handleRSelect(selectedOption, 'customer_base')} required
                                />
                                <Form.Control type="hidden" name="customer_base_id" value={custData.customer_base_id} />
                                {validated && !custData.customer_base_id && (
                                    <div className="invalid-feedback d-block">Please enter customer base</div>
                                )}
                            </Form.Group>
                        </Row>
                        <Row className="mb-3 g-3">
                            <Form.Group as={Col} className="mb-3" controlId="address">
                                <Form.Label>Address</Form.Label>
                                <Form.Control as="textarea" rows={3} placeholder="address" name="address" value={custData.address} onChange={handleChange} required/>
                                <Form.Control.Feedback type="invalid">Please enter address.</Form.Control.Feedback>
                            </Form.Group>
                        </Row>
                        <Row className="g-3">
                            <Form.Group as={Col} className="mb-3" controlId="country">
                                <Form.Label>Country <span className="text-danger">*</span></Form.Label>
                                <ReactSelect
                                    options= {countriesData.map((option: CountriesData) => (
                                        { value: option.id, label: option.name }
                                    ))}
                                    placeholder="Select Country" name="country" value={custData.country ? { value: custData.country.id, label: custData.country.name } : null} onChange={(selectedOption) => handleRSelect(selectedOption, 'country')} required
                                />
                                <Form.Control type="hidden" name="country_id" value={custData.country_id} />
                                {validated && !custData.country_id && (
                                    <div className="invalid-feedback d-block">Please enter country</div>
                                )}
                            </Form.Group>
                            <Form.Group as={Col} className="mb-3" controlId="city">
                                <Form.Label>City <span className="text-danger">*</span></Form.Label>
                                <Form.Control type="text" placeholder="City" name="city" value={custData.city} onChange={handleChange} required />
                                <Form.Control.Feedback type="invalid">Please enter city.</Form.Control.Feedback>
                            </Form.Group>
                            <Form.Group as={Col} className="mb-3" controlId="pin_code">
                                <Form.Label>Pincode</Form.Label>
                                <Form.Control type="text" placeholder="Pincode" name="pin_code" value={custData.pin_code} onChange={handleChange} />
                                <Form.Control.Feedback type="invalid">Please enter pincode.</Form.Control.Feedback>
                            </Form.Group>
                        </Row>
                        <Row className="g-3">
                            <Form.Group as={Col} className="mb-3" controlId="timezone">
                                <Form.Label>Time Zone</Form.Label>
                                <ReactSelect
                                    options= {timezonesData.map((option: TimezonesData) => (
                                        { value: option.id, label: option.name +' ('+option.offset+')' }
                                    ))}
                                    placeholder="Select Time Zone" name="timezone" value={custData.timezone ? { value: custData.timezone.id, label: custData.timezone.name } : null} onChange={(selectedOption) => handleRSelect(selectedOption, 'timezone')} />
                                <Form.Control type="hidden" name="time_zone" value={custData.time_zone} />
                                {validated && !custData.time_zone && (
                                    <div className="invalid-feedback d-block">Please enter timezone</div>
                                )}
                            </Form.Group>
                            <Form.Group as={Col} className="mb-3" controlId="website">
                                <Form.Label>Website</Form.Label>
                                <Form.Control type="text" placeholder="Website" name="website" value={custData.website} onChange={handleChange} />
                                <Form.Control.Feedback type="invalid">Please enter website.</Form.Control.Feedback>
                            </Form.Group>
                            <Form.Group as={Col} className="mb-3" controlId="country_code">
                                <Form.Label>Country Code <span className="text-danger">*</span></Form.Label>
                                <Form.Control type="text" placeholder="Country Code" name="country_code" value={custData.country_code} onChange={handleChange} required />
                                <Form.Control.Feedback type="invalid">Please enter country code.</Form.Control.Feedback>
                            </Form.Group>
                        </Row>
                        <Row className="g-3">
                            <Form.Group as={Col} className="mb-3" controlId="area_code">
                                <Form.Label>Area Code <span className="text-danger">*</span></Form.Label>
                                <Form.Control type="text" placeholder="Area Code" name="area_code" value={custData.area_code} onChange={handleChange} required />
                                <Form.Control.Feedback type="invalid">Please enter Area Code.</Form.Control.Feedback>
                            </Form.Group>
                            <Form.Group as={Col} className="mb-3" controlId="contact_no">
                                <Form.Label>Contact No <span className="text-danger">*</span></Form.Label>
                                <Form.Control type="text" placeholder="Contact No" name="contact_no" value={custData.contact_no} onChange={handleChange} maxLength={20} required />
                                <Form.Control.Feedback type="invalid">Please enter contact No.</Form.Control.Feedback>
                            </Form.Group>
                            <Form.Group as={Col} className="mb-3" controlId="contact_person">
                                <Form.Label>Contact Person <span className="text-danger">*</span></Form.Label>
                                <Form.Control type="text" placeholder="Contact Person" name="contact_person" value={custData.contact_person} onChange={handleChange} required />
                                <Form.Control.Feedback type="invalid">Please enter contact Person.</Form.Control.Feedback>
                            </Form.Group>
                        </Row>
                        <Row className="g-3">
                            <Form.Group as={Col} className="mb-3" controlId="designation">
                                <Form.Label>Designation <span className="text-danger">*</span></Form.Label>
                                <Form.Control type="text" placeholder="Designation" name="designation" value={custData.designation} onChange={handleChange} required />
                                <Form.Control.Feedback type="invalid">Please enter designation.</Form.Control.Feedback>
                            </Form.Group>
                            <Form.Group as={Col} className="mb-3" controlId="landline_no">
                                <Form.Label>Landline No</Form.Label>
                                <Form.Control type="text" placeholder="Landline No" name="landline_no" value={custData.landline_no} onChange={handleChange} maxLength={20} />
                                <Form.Control.Feedback type="invalid">Please enter landline No.</Form.Control.Feedback>
                            </Form.Group>
                            <Form.Group as={Col} className="mb-3" controlId="email">
                                <Form.Label>Email <span className="text-danger">*</span></Form.Label>
                                <Form.Control type="text" placeholder="Email" name="email" value={custData.email} onChange={handleChange} required />
                                <Form.Control.Feedback type="invalid">Please enter email.</Form.Control.Feedback>
                            </Form.Group>
                        </Row>
                        <Row className="g-3">
                            <Form.Group as={Col} className="mb-3" controlId="alternate_email">
                                <Form.Label>Alternate Email</Form.Label>
                                <Form.Control type="text" placeholder="Alternate Email" name="alternate_email" value={custData.alternate_email} onChange={handleChange} />
                                <Form.Control.Feedback type="invalid">Please enter alternate Email.</Form.Control.Feedback>
                            </Form.Group>
                            <Form.Group as={Col} className="mb-3" controlId="mobile_number">
                                <Form.Label>Mobile Number</Form.Label>
                                <Form.Control type="text" placeholder="Mobile Number" name="mobile_number" value={custData.mobile_number} onChange={handleChange} maxLength={20} />
                                <Form.Control.Feedback type="invalid">Please enter mobile Number.</Form.Control.Feedback>
                            </Form.Group>
                            <Form.Group as={Col} className="mb-3" controlId="i_am_member_since">
                                <Form.Label>I am Member Since</Form.Label>
                                <Form.Control type="text" placeholder="I am Member Since" name="i_am_member_since" value={custData.i_am_member_since} onChange={handleChange} />
                                <Form.Control.Feedback type="invalid">Please enter I am Member Since.</Form.Control.Feedback>
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

export default CustomersModal;
