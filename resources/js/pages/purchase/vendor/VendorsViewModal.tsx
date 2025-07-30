import React, { useEffect, useState } from 'react';
import { Form, Modal, Row, Col } from 'react-bootstrap';
import Button from '../../../components/base/Button';
import axiosInstance from '../../../axios';
import swal from 'sweetalert';

interface FormData {
    id?: number;
    name: string;
    vender_type_id: string;
    employee_name: string;
    entity_type_id: string;
    segment_id: string;
    address: string;
    phone: string;
    vendor_behavior_id: string;
    contact_person: string;
    contact_person_number: string;
    designation: string;
    email: string;
    country_id: string;
    state_id: string;
    city: string;
    pin_code: string;
    website: string;
    rating: number;
    collaboration_interest: string;
}

interface VendorModalProps {
    cusId?: number;
    onHide: () => void;
}
const VendorsViewModal: React.FC<VendorModalProps> = ({ cusId, onHide }) => {
    const [custData, setUserData] = useState<FormData>({ id: 0, name: '', vender_type_id: '', employee_name: '', entity_type_id: '', segment_id: '', address: '', phone: '', vendor_behavior_id: '', contact_person: '', contact_person_number: '', designation: '', email: '', country_id: '', state_id: '', city: '', pin_code: '', website: '', rating: 0,
        collaboration_interest: '1' });
    const [isEditing, setIsEditing] = useState<boolean>(false);

    useEffect(() => {

        if (cusId) {
            setIsEditing(true);
            // Fetch vendor data for editing
            axiosInstance.get(`/vendors/${cusId}`)
            .then(response => {
                setUserData(response.data);
            })
            .catch(error => console.error('Error fetching vendor data:', error));
        }
    }, [cusId]);

    return (
        <>
            <Modal show onHide={onHide} size="xl" backdrop="static" keyboard={false}>
                <Modal.Header closeButton>
                    <Modal.Title>View Vendor</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form.Control type="hidden" name="id" value={custData.id} />
                    <Row className="mb-3 g-3">
                        <Form.Group className="mb-3" controlId="name">
                            <Form.Label>Vendor Name <span className="text-danger">*</span></Form.Label>
                            <Form.Control type="text" name="name" value={custData.name}  readOnly style={{ backgroundColor: 'whitesmoke', pointerEvents: 'none' }} />
                        </Form.Group>
                        <Form.Group as={Col} className="mb-3" controlId="vender_type_id">
                            <Form.Label>Vendor Type <span className="text-danger">*</span></Form.Label>
                            <Form.Control type="text" name="name" value={custData.vender_type_id}  readOnly style={{ backgroundColor: 'whitesmoke', pointerEvents: 'none' }} />
                        </Form.Group>
                        <Form.Group as={Col} className="mb-3" controlId="employee_name">
                            <Form.Label>PVV Head</Form.Label>
                            <Form.Control type="text" name="employee_name" value={custData.employee_name} readOnly style={{backgroundColor: 'whitesmoke'}} />
                        </Form.Group>
                    </Row>
                    <Row className="mb-3 g-3">
                        <Form.Group as={Col} className="mb-3" controlId="entity_type_id">
                            <Form.Label>Entity Type <span className="text-danger">*</span></Form.Label>
                            <Form.Control type="text" name="entity_type_id" value={custData.entity_type_id} readOnly style={{backgroundColor: 'whitesmoke'}} />
                        </Form.Group>
                        <Form.Group as={Col} className="mb-3">
                            <Form.Label>Segment <span className="text-danger">*</span></Form.Label>
                            <Form.Control type="text" name="segment_id" value={custData.segment_id} readOnly style={{backgroundColor: 'whitesmoke'}} />
                            </Form.Group>

                    </Row>
                    <Row className="mb-3 g-3">
                        <Form.Group as={Col} className="mb-3" controlId="address">
                            <Form.Label>Address</Form.Label>
                            <Form.Control as="textarea" rows={3} placeholder="address" name="address" value={custData.address} readOnly style={{ backgroundColor: 'whitesmoke', pointerEvents: 'none' }} />
                        </Form.Group>
                    </Row>
                    <Row className="mb-3 g-3">
                        <Form.Group as={Col} className="mb-3" controlId="country_id">
                            <Form.Label>Country </Form.Label>
                            <Form.Control type="text" name="country_id" value={custData.country_id} readOnly style={{backgroundColor: 'whitesmoke'}} />
                        </Form.Group>
                        <Form.Group as={Col} className="mb-3" controlId="state_id">
                            <Form.Label>State </Form.Label>
                            <Form.Control type="text" name="state_id" value={custData.state_id} readOnly style={{backgroundColor: 'whitesmoke'}} />
                        </Form.Group>
                        <Form.Group as={Col} className="mb-3" controlId="city">
                            <Form.Label>City</Form.Label>
                            <Form.Control type="text" name="city" value={custData.city}  readOnly style={{ backgroundColor: 'whitesmoke', pointerEvents: 'none' }} />
                        </Form.Group>
                    </Row>
                    <Row className="mb-3 g-3">
                        <Form.Group as={Col} className="mb-3" controlId="pin_code">
                            <Form.Label>Pin Code</Form.Label>
                            <Form.Control type="text" placeholder="Pincode" name="pin_code" value={custData.pin_code}  readOnly style={{ backgroundColor: 'whitesmoke', pointerEvents: 'none' }} />
                        </Form.Group>
                        <Form.Group as={Col} className="mb-3" controlId="phone">
                            <Form.Label>Phone  <span className="text-danger">*</span></Form.Label>
                            <Form.Control type="text" placeholder="Phone" name="phone" value={custData.phone}  readOnly style={{ backgroundColor: 'whitesmoke', pointerEvents: 'none' }} />
                        </Form.Group>
                        <Form.Group as={Col} className="mb-3" controlId="website">
                            <Form.Label>Website</Form.Label>
                            <Form.Control type="text" placeholder="Website" name="website" value={custData.website}  readOnly style={{ backgroundColor: 'whitesmoke', pointerEvents: 'none' }} />
                        </Form.Group>
                    </Row>
                    <Row className="mb-3 g-3">
                        <Form.Group as={Col} className="mb-3" controlId="vendor_behavior_id">
                            <Form.Label>Vendor Behaviour </Form.Label>
                            <Form.Control type="text" name="vendor_behavior_id" value={custData.vendor_behavior_id} readOnly style={{backgroundColor: 'whitesmoke'}} />
                        </Form.Group>
                        <Form.Group as={Col} className="mb-3" controlId="rating">
                            <Form.Label>Rating </Form.Label>
                            <Form.Control type="text" name="rating" value={custData.rating} readOnly style={{backgroundColor: 'whitesmoke'}} />
                        </Form.Group>
                        <Form.Group as={Col} className="mb-3" controlId="contact_person">
                            <Form.Label>Contact Person <span className="text-danger">*</span></Form.Label>
                            <Form.Control type="text" placeholder="Contact Person" name="contact_person" value={custData.contact_person}  readOnly style={{ backgroundColor: 'whitesmoke', pointerEvents: 'none' }} />
                        </Form.Group>
                    </Row>
                    <Row className="mb-3 g-3">
                        <Form.Group as={Col} className="mb-3" controlId="contact_person_number">
                            <Form.Label>Contact Person Number<span className="text-danger">*</span></Form.Label>
                            <Form.Control type="text" placeholder="Contact Person Number" name="contact_person_number" value={custData.contact_person_number}  readOnly style={{ backgroundColor: 'whitesmoke', pointerEvents: 'none' }} />
                        </Form.Group>
                        <Form.Group as={Col} className="mb-3" controlId="designation">
                            <Form.Label>Designation <span className="text-danger">*</span></Form.Label>
                            <Form.Control type="text" placeholder="Designation" name="designation" value={custData.designation}  readOnly style={{ backgroundColor: 'whitesmoke', pointerEvents: 'none' }} />
                        </Form.Group>
                        <Form.Group as={Col} className="mb-3" controlId="email">
                            <Form.Label>Email <span className="text-danger">*</span></Form.Label>
                            <Form.Control type="text" placeholder="Email" name="email" value={custData.email}  readOnly style={{ backgroundColor: 'whitesmoke', pointerEvents: 'none' }} />
                        </Form.Group>
                    </Row>
                    <Row className="mb-3 g-3">
                        <Form.Group as={Col} sm={4} className="mb-3">
                            <Form.Label>Collabration Interest</Form.Label>
                            <Form.Control type="text" name="collaboration_interest" value={custData.collaboration_interest} readOnly style={{backgroundColor: 'whitesmoke'}} />
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

export default VendorsViewModal;
