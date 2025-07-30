import React, { useEffect, useState } from 'react';
import { Form, Modal, Row, Col, Alert } from 'react-bootstrap';
import Button from '../../../components/base/Button';
import axiosInstance from '../../../axios';
import swal from 'sweetalert';
import { useAuth } from '../../../AuthContext';
import ReactSelect from '../../../components/base/ReactSelect';

interface FormData {
    id: number;
    name: string;
    post_id: number;
    qualification: string;
    experience: string;
    communication_skill: string;
    address: string;
    email: string;
    mobile: string;
    english_knowledge: string;
    critical_relationship: string;
    energy_level: string;
    distance: string;
    own_vehicle: string;
    readiness_to_join: string;
    working_status: string;
    job_change_reason: string;
    current_salary: string;
    expected_salary: string;
    notice_period: string;
    interview_date: string;
    candidate_status: string;
    attachment_id: string;
    details: string;
    attachment: AttachmentList | null;
    attachment_name: number;
    fileName: File | null;
    attachment_title?: string;
}
interface SelectedCandidates {
    id: number;
    name: string;
    email: string;
}
interface EmployeeData {
    id: number;
    user_id: number;
    name: string;
}
interface RecruitmentViewModalProps {
    postId: number;
    candidateId?: number;
    onHide: () => void;
}
interface AttachmentList {
    id: number;
    name: string;
    form_name: string;
}

const RecruitmentCandidateViewModal: React.FC<RecruitmentViewModalProps> = ({ postId, candidateId, onHide }) => {
    const [custData, setUserData] = useState<FormData>({
        id: 0,
        name: '',
        post_id: postId,
        qualification: '',
        experience: '',
        communication_skill: '',
        address: '',
        email: '',
        mobile: '',
        english_knowledge: '',
        critical_relationship: '',
        energy_level: '',
        distance: '',
        own_vehicle: '',
        readiness_to_join: '',
        working_status: '',
        job_change_reason: '',
        current_salary: '',
        expected_salary: '',
        notice_period: '',
        interview_date: '',
        candidate_status: '',
        attachment_id: '',
        details: '',
        attachment: null,
        fileName: null,
        attachment_name: 0,
    });
    const [isEditing, setIsEditing] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    const [selected_candidates, setSelectedCandidates] = useState<SelectedCandidates[]>([]);
    const { empData } = useAuth(); //check userRole & permissions

    const [employeeData, setEmployeeData] = useState<EmployeeData[]>([]);

    useEffect(() => {

        if (candidateId) {
            setIsEditing(true);
            // Fetch customer data for editing
            axiosInstance.get(`/recruitment-candidates/${candidateId}`)
            .then(response => {
                setUserData(response.data);
                if(response.data.assignee_name != null) {
                    setUserData(prev => ({
                        ...prev,
                        assignee: { id: response.data.assignee_name.id, name: response.data.assignee_name.name },
                        assignee_name: response.data.assignee_name.id
                    }));
                }
                setSelectedCandidates(response.data.selected_candidates)
            })
            .catch(error => console.error('Error fetching customer data:', error));
        }
    }, [candidateId]);

    return (
        <>
            <Modal show onHide={onHide} size='lg' backdrop="static" keyboard={false}>
                <Modal.Header closeButton>
                    <Modal.Title>View Candidate Details</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form.Control type="hidden" name="post_id" value={custData.post_id} />
                    <Row className="g-3 px-4">
                        <Form.Group as={Col} className="mb-3" controlId="name">
                            <Form.Label>Name <span className="text-danger">*</span></Form.Label>
                            <Form.Control type="text" placeholder="Candidate Name" name="name" value={custData.name} readOnly style={{ backgroundColor: 'whitesmoke', pointerEvents: 'none' }} />
                        </Form.Group>
                        <Form.Group as={Col} className="mb-3" controlId="qualification">
                            <Form.Label>Qualification <span className="text-danger">*</span></Form.Label>
                            <Form.Control type="text" placeholder="Qualification" name="qualification" value={custData.qualification} readOnly style={{ backgroundColor: 'whitesmoke', pointerEvents: 'none' }} />
                        </Form.Group>
                    </Row>
                    <Row className="g-3 px-4">
                        <Form.Group as={Col} className="mb-3" controlId="experience">
                            <Form.Label>Experience <span className="text-danger">*</span></Form.Label>
                            <Form.Control type="text" name="experience" value={custData.experience} readOnly style={{ backgroundColor: 'whitesmoke', pointerEvents: 'none' }} />
                        </Form.Group>
                        <Form.Group as={Col} className="mb-3" controlId="communication_skill">
                            <Form.Label>Communication Skill <span className="text-danger">*</span></Form.Label>
                            <Form.Control type="text" value={custData.communication_skill} readOnly style={{ backgroundColor: 'whitesmoke', pointerEvents: 'none' }} />
                        </Form.Group>
                    </Row>
                    <Row className="g-3 px-4">
                        <Form.Group className="mb-3" controlId='address'>
                            <Form.Label>Address <span className="text-danger">*</span></Form.Label>
                            <Form.Control as="textarea" rows={6} placeholder="Address" name="address" value={custData.address} readOnly style={{ backgroundColor: 'whitesmoke', pointerEvents: 'none' }} />
                        </Form.Group>
                    </Row>
                    <Row className="g-3 px-4">
                        <Form.Group as={Col} className="mb-3" controlId="email">
                            <Form.Label>Email <span className="text-danger">*</span></Form.Label>
                            <Form.Control type="text" placeholder="Email" name="email" value={custData.email} readOnly style={{ backgroundColor: 'whitesmoke', pointerEvents: 'none' }} />
                        </Form.Group>
                        <Form.Group as={Col} className="mb-3" controlId="mobile">
                            <Form.Label>Mobile <span className="text-danger">*</span></Form.Label>
                            <Form.Control type="text" maxLength={20} placeholder="Mobile" name="mobile" value={custData.mobile} readOnly style={{ backgroundColor: 'whitesmoke', pointerEvents: 'none' }} />
                        </Form.Group>
                    </Row>
                    <Row className="g-3 px-4">
                        <Form.Group as={Col} className="mb-3" controlId="english_knowledge">
                            <Form.Label>English knowledge <span className="text-danger">*</span></Form.Label>
                            <Form.Control type="text" value={custData.english_knowledge} readOnly style={{ backgroundColor: 'whitesmoke', pointerEvents: 'none' }} />
                        </Form.Group>
                        <Form.Group as={Col} className="mb-3" controlId="critical_relationship">
                            <Form.Label>Relatives in Lawyer, Govt/ Police service <span className="text-danger">*</span></Form.Label>
                            <Form.Control type="text" value={custData.critical_relationship} readOnly style={{ backgroundColor: 'whitesmoke', pointerEvents: 'none' }} />
                        </Form.Group>
                    </Row>
                    <Row className="g-3 px-4">
                        <Form.Group as={Col} className="mb-3" controlId="energy_level">
                            <Form.Label>Energy Level <span className="text-danger">*</span></Form.Label>
                            <Form.Control type="text" value={custData.energy_level} readOnly style={{ backgroundColor: 'whitesmoke', pointerEvents: 'none' }} />
                        </Form.Group>
                        <Form.Group as={Col} className="mb-3" controlId="distance">
                            <Form.Label>Distance in KM <span className="text-danger">*</span></Form.Label>
                            <Form.Control type="text" placeholder="From office to home" value={custData.distance} readOnly style={{ backgroundColor: 'whitesmoke', pointerEvents: 'none' }} />
                        </Form.Group>
                    </Row>
                    <Row className="g-3 px-4">
                        <Form.Group as={Col} className="mb-3" controlId="own_vehicle">
                            <Form.Label>Own Vehicle <span className="text-danger">*</span></Form.Label>
                            <Form.Control type="text" value={custData.communication_skill} readOnly style={{ backgroundColor: 'whitesmoke', pointerEvents: 'none' }} />
                        </Form.Group>
                        <Form.Group as={Col} className="mb-3" controlId="readiness_to_join">
                            <Form.Label>Readiness to join <span className="text-danger">*</span></Form.Label>
                            <Form.Control type="text" name="readiness_to_join" placeholder="Immediately or how many days" value={custData.readiness_to_join} readOnly style={{ backgroundColor: 'whitesmoke', pointerEvents: 'none' }} />
                        </Form.Group>
                    </Row>
                    <Row className="g-3 px-4">
                        <Form.Group as={Col} className="mb-3" controlId="working_status">
                            <Form.Label>Currently working <span className="text-danger">*</span></Form.Label>
                            <Form.Control type="text" value={custData.working_status} readOnly style={{ backgroundColor: 'whitesmoke', pointerEvents: 'none' }} />
                        </Form.Group>
                        <Form.Group as={Col} className="mb-3" controlId="job_change_reason">
                            <Form.Label>Job Change Reason </Form.Label>
                            <Form.Control as="textarea" rows={1} name="job_change_reason" placeholder="Job Change Reason" value={custData.job_change_reason} readOnly style={{ backgroundColor: 'whitesmoke', pointerEvents: 'none' }}/>
                        </Form.Group>
                    </Row>
                    <Row className="g-3 px-4">
                        <Form.Group as={Col} className="mb-3" controlId="current_salary">
                            <Form.Label>Current Salary <span className="text-danger">*</span></Form.Label>
                            <Form.Control type="number" min={0} maxLength={10} placeholder="Current Salary" name="current_salary" value={custData.current_salary} readOnly style={{ backgroundColor: 'whitesmoke', pointerEvents: 'none' }}/>
                        </Form.Group>
                        <Form.Group as={Col} className="mb-3" controlId="expected_salary">
                            <Form.Label>Expected Salary <span className="text-danger">*</span></Form.Label>
                            <Form.Control type="number" min={0} maxLength={10} placeholder="Expected Salary" name="expected_salary" value={custData.expected_salary} readOnly style={{ backgroundColor: 'whitesmoke', pointerEvents: 'none' }}/>
                        </Form.Group>
                    </Row>
                    <Row className="g-3 px-4">
                        <Form.Group as={Col} className="mb-3" controlId="notice_period">
                            <Form.Label>Notice Period <span className="text-danger">*</span></Form.Label>
                            <Form.Control type="text" placeholder="How many days" name="notice_period" value={custData.notice_period} readOnly style={{ backgroundColor: 'whitesmoke', pointerEvents: 'none' }}/>
                        </Form.Group>
                        <Form.Group as={Col} className="mb-3" controlId="interview_date">
                            <Form.Label>F2F Interview Date <span className="text-danger">*</span></Form.Label>
                            <Form.Control type="text" value={custData.interview_date} readOnly style={{ backgroundColor: 'whitesmoke', pointerEvents: 'none' }}/>
                        </Form.Group>
                    </Row>
                    <Row className="g-3 px-4">
                        <Form.Group className="mb-3" controlId="attachment_name">
                            <Form.Label>Attachment Name <span className="text-danger">*</span></Form.Label>
                            <Form.Control type="text" value={custData.attachment_name} readOnly style={{ backgroundColor: 'whitesmoke', pointerEvents: 'none' }}/>
                        </Form.Group>
                            <Form.Group className="mb-3" controlId="details">
                            <Form.Label>Details <span className="text-danger">*</span></Form.Label>
                            <Form.Control as="textarea" rows={3} placeholder="Students name" name="details" value={custData.details} readOnly style={{ backgroundColor: 'whitesmoke', pointerEvents: 'none' }}/>
                        </Form.Group>

                    </Row>
                    <Row className="g-3 px-4">
                        <Form.Group as={Col} controlId="name">
                            <Form.Label>Attachment <span className="text-danger">*</span></Form.Label>
                            <Form.Control type="text" value={custData.attachment_title} readOnly style={{ backgroundColor: 'whitesmoke', pointerEvents: 'none' }}/>
                        </Form.Group>
                        <Form.Group as={Col} className="mb-3" controlId="candidate_status">
                            <Form.Label>Candidate status <span className="text-danger">*</span></Form.Label>
                            <Form.Control type="text" value={custData.candidate_status} readOnly style={{ backgroundColor: 'whitesmoke', pointerEvents: 'none' }} />
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

export default RecruitmentCandidateViewModal;
