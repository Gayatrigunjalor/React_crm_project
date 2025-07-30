import React, { useEffect, useState } from 'react';
import { Form, Modal, Row, Col } from 'react-bootstrap';
import Button from '../../../components/base/Button';
import axiosInstance from '../../../axios';
import swal from 'sweetalert';
import { useAuth } from '../../../AuthContext';

interface SegmentData {
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
    customer_type: SegmentData;
    segment_id: number;
    segment: SegmentData;
    category_id: number;
    category: SegmentData;
    customer_base_id: number;
    customer_base: SegmentData;
    address: string;
    country_id: number;
    country: CountriesData;
    city: string;
    time_zone: TimezonesData;
    timezone: TimezonesData;
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
}
const CustomersViewModal: React.FC<CustomerModalProps> = ({ cusId, onHide }) => {
    const [custData, setUserData] = useState<FormData>({
        id: 0,
        name: '',
        employee_name: '',
        customer_type_id: 0,
        customer_type: { id: 0, name: '' },
        segment_id: 0,
        segment: { id: 0, name: '' },
        category_id: 0,
        category: { id: 0, name: '' },
        customer_base_id: 0,
        customer_base: { id: 0, name: '' },
        address: '',
        country_id: 0,
        country: { id: 0, name: '', sortname: '', phonecode: '' },
        city: '',
        time_zone: { id: 0, name: '', offset: '' },
        timezone: { id: 0, name: '', offset: '' },
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

    return (
        <>
            <Modal show onHide={onHide} size="xl" backdrop="static" keyboard={false}>
                <Modal.Header closeButton>
                    <Modal.Title>View Customer</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form.Control type="hidden" name="id" value={custData.id} />
                    <Row className="g-3">
                        <Form.Group as={Col} className="mb-3" controlId="name">
                            <Form.Label>Customer Name</Form.Label>
                            <Form.Control type="text" name="name" value={custData.name} readOnly style={{ backgroundColor: 'whitesmoke', pointerEvents: 'none' }} />
                        </Form.Group>

                        <Form.Group as={Col} className="mb-3" controlId="employee_name">
                            <Form.Label>Employee Name</Form.Label>
                            <Form.Control type="text" name="employee_name" value={custData.employee_name} readOnly style={{backgroundColor: 'whitesmoke', pointerEvents: 'none'}} />
                        </Form.Group>
                        <Form.Group as={Col} className="mb-3" controlId="customer_type">
                            <Form.Label>Customer Type</Form.Label>
                            <Form.Control type="text" name="customer_type" value={custData.customer_type.name} readOnly style={{backgroundColor: 'whitesmoke', pointerEvents: 'none'}} />
                        </Form.Group>
                    </Row>
                    <Row className="g-3">
                        <Form.Group as={Col} className="mb-3" controlId='segment'>
                            <Form.Label>Segment</Form.Label>
                            <Form.Control type="text" name="segment" value={custData.segment.name} readOnly style={{backgroundColor: 'whitesmoke', pointerEvents: 'none'}} />
                        </Form.Group>
                        <Form.Group as={Col} className="mb-3" controlId='category'>
                            <Form.Label>Category</Form.Label>
                            <Form.Control type="text" name="category" value={custData.category.name} readOnly style={{backgroundColor: 'whitesmoke', pointerEvents: 'none'}} />
                        </Form.Group>
                        <Form.Group as={Col} className="mb-3" controlId="customer_base">
                            <Form.Label>Customer Base</Form.Label>
                            <Form.Control type="text" name="customer_base" value={custData.customer_base.name} readOnly style={{backgroundColor: 'whitesmoke', pointerEvents: 'none'}} />
                        </Form.Group>
                    </Row>
                    <Row className="mb-3 g-3">
                        <Form.Group as={Col} className="mb-3" controlId="address">
                            <Form.Label>Address</Form.Label>
                            <Form.Control as="textarea" rows={3} name="address" value={custData.address}  readOnly style={{ backgroundColor: 'whitesmoke', pointerEvents: 'none' }} />
                        </Form.Group>
                    </Row>
                    <Row className="g-3">
                        <Form.Group as={Col} className="mb-3" controlId="country">
                            <Form.Label>Country</Form.Label>
                            <Form.Control type="text" name="customer_base" value={custData.country.name} readOnly style={{backgroundColor: 'whitesmoke', pointerEvents: 'none'}} />
                        </Form.Group>
                        <Form.Group as={Col} className="mb-3" controlId="city">
                            <Form.Label>City</Form.Label>
                            <Form.Control type="text" placeholder="City" name="city" value={custData.city}  readOnly style={{ backgroundColor: 'whitesmoke', pointerEvents: 'none' }} />
                        </Form.Group>
                        <Form.Group as={Col} className="mb-3" controlId="pin_code">
                            <Form.Label>Pincode</Form.Label>
                            <Form.Control type="text" placeholder="Pincode" name="pin_code" value={custData.pin_code}  readOnly style={{ backgroundColor: 'whitesmoke', pointerEvents: 'none' }} />
                        </Form.Group>
                    </Row>
                    <Row className="g-3">
                        <Form.Group as={Col} className="mb-3" controlId="timezone">
                            <Form.Label>Time Zone</Form.Label>
                            <Form.Control type="text" placeholder="timezone" name="timezone" value={custData.time_zone ? custData.time_zone.name : ''}  readOnly style={{ backgroundColor: 'whitesmoke', pointerEvents: 'none' }} />
                        </Form.Group>
                        <Form.Group as={Col} className="mb-3" controlId="website">
                            <Form.Label>Website</Form.Label>
                            <Form.Control type="text" placeholder="Website" name="website" value={custData.website}  readOnly style={{ backgroundColor: 'whitesmoke', pointerEvents: 'none' }} />
                        </Form.Group>
                        <Form.Group as={Col} className="mb-3" controlId="country_code">
                            <Form.Label>Country Code</Form.Label>
                            <Form.Control type="text" placeholder="Country Code" name="country_code" value={custData.country_code}  readOnly style={{ backgroundColor: 'whitesmoke', pointerEvents: 'none' }} />
                        </Form.Group>
                    </Row>
                    <Row className="g-3">
                        <Form.Group as={Col} className="mb-3" controlId="area_code">
                            <Form.Label>Area Code</Form.Label>
                            <Form.Control type="text" placeholder="Area Code" name="area_code" value={custData.area_code}  readOnly style={{ backgroundColor: 'whitesmoke', pointerEvents: 'none' }} />
                        </Form.Group>
                        <Form.Group as={Col} className="mb-3" controlId="contact_no">
                            <Form.Label>Contact No</Form.Label>
                            <Form.Control type="text" placeholder="Contact No" name="contact_no" value={custData.contact_no}  readOnly style={{ backgroundColor: 'whitesmoke', pointerEvents: 'none' }} />
                        </Form.Group>
                        <Form.Group as={Col} className="mb-3" controlId="contact_person">
                            <Form.Label>Contact Person</Form.Label>
                            <Form.Control type="text" placeholder="Contact Person" name="contact_person" value={custData.contact_person}  readOnly style={{ backgroundColor: 'whitesmoke', pointerEvents: 'none' }} />
                        </Form.Group>
                    </Row>
                    <Row className="g-3">
                        <Form.Group as={Col} className="mb-3" controlId="designation">
                            <Form.Label>Designation</Form.Label>
                            <Form.Control type="text" placeholder="Designation" name="designation" value={custData.designation}  readOnly style={{ backgroundColor: 'whitesmoke', pointerEvents: 'none' }} />
                        </Form.Group>
                        <Form.Group as={Col} className="mb-3" controlId="landline_no">
                            <Form.Label>Landline No</Form.Label>
                            <Form.Control type="text" placeholder="Landline No" name="landline_no" value={custData.landline_no}  readOnly style={{ backgroundColor: 'whitesmoke', pointerEvents: 'none' }} />
                        </Form.Group>
                        <Form.Group as={Col} className="mb-3" controlId="email">
                            <Form.Label>Email</Form.Label>
                            <Form.Control type="text" placeholder="Email" name="email" value={custData.email}  readOnly style={{ backgroundColor: 'whitesmoke', pointerEvents: 'none' }} />
                        </Form.Group>
                    </Row>
                    <Row className="g-3">
                        <Form.Group as={Col} className="mb-3" controlId="alternate_email">
                            <Form.Label>Alternate Email</Form.Label>
                            <Form.Control type="text" placeholder="Alternate Email" name="alternate_email" value={custData.alternate_email}  readOnly style={{ backgroundColor: 'whitesmoke', pointerEvents: 'none' }} />
                        </Form.Group>
                        <Form.Group as={Col} className="mb-3" controlId="mobile_number">
                            <Form.Label>Mobile Number</Form.Label>
                            <Form.Control type="text" placeholder="Mobile Number" name="mobile_number" value={custData.mobile_number}  readOnly style={{ backgroundColor: 'whitesmoke', pointerEvents: 'none' }} />
                        </Form.Group>
                        <Form.Group as={Col} className="mb-3" controlId="i_am_member_since">
                            <Form.Label>I am Member Since</Form.Label>
                            <Form.Control type="text" placeholder="I am Member Since" name="i_am_member_since" value={custData.i_am_member_since}  readOnly style={{ backgroundColor: 'whitesmoke', pointerEvents: 'none' }} />
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

export default CustomersViewModal;
