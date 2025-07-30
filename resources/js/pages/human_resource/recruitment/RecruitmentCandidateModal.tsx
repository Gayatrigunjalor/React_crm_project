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
interface RecruitmentModalProps {
    postId: number;
    candidateId?: number;
    onHide: () => void;
    onSuccess: () => void;
}
interface AttachmentList {
    id: number;
    name: string;
    form_name: string;
}
interface Props {
    id: number;
    attachmentList: AttachmentList[];
}

const RecruitmentCandidateModal: React.FC<RecruitmentModalProps> = ({ postId, candidateId, onHide, onSuccess }) => {
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
    const [validated, setValidated] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const [attachmentListData, setAttachmentListData] = useState<AttachmentList[]>([]);
    const [irmSysId, setIrmSysId] = useState<string>('');
    const [loading, setLoading] = useState(false);

    const [selected_candidates, setSelectedCandidates] = useState<SelectedCandidates[]>([]);
    const { empData } = useAuth(); //check userRole & permissions

    const [employeeData, setEmployeeData] = useState<EmployeeData[]>([]);
    useEffect(() => {

        const fetchEmployeeList = async () => {
            try {
                const response = await axiosInstance.get('/employees_list');
                if (response.status !== 200) {
                    throw new Error('Failed to fetch data');
                }
                const data: EmployeeData[] = response.data;
                setEmployeeData(data);
            } catch (err: any) {
                setError(err.message);
            } finally {
            }
        };
        fetchEmployeeList();
    }, []);
    useEffect(() => {
        const fetchAttachmentListing = async () => {
            try {
                const response = await axiosInstance.get(`/getAttachmentByName/Recruitment`);
                if (response.status !== 200) {
                    throw new Error('Failed to fetch data');
                }
                const data: AttachmentList[] = await response.data;
                setAttachmentListData(data);
            } catch (err: any) {
                // setError(err.data.message);
            } finally {

            }
        };

        fetchAttachmentListing();
    }, []);
    useEffect(() => {

        if (candidateId) {
            setIsEditing(true);
            // Fetch customer data for editing
            axiosInstance.get(`/recruitment-candidates/${candidateId}`)
            .then(response => {
                setUserData(response.data);
                if(response.data.attachment_name != null) {
                    const formName = getAttachmentNameById({ attachmentList: attachmentListData, id: response.data.attachment_name });
                    // setUserData({...custData, attachment: { id: response.data.attachment_name, name: formName, form_name: '' } });
                }
            })
            .catch(error => console.error('Error fetching customer data:', error));
        }
    }, [candidateId]);


    function getAttachmentNameById({ attachmentList, id }: Props): string {
        const attachmentName = attachmentList.find((attachmentName) => {
            return attachmentName.id === id
        });
        return attachmentName ? attachmentName.form_name : '';
    }

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setUserData({ ...custData, [name]: value });
    };

    const handleSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const { name, value } = e.target;
        setUserData({ ...custData, [name]: value });
    };

    // Handler function for the file input change event
    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files ? event.target.files[0] : null;
        setUserData({ ...custData, fileName: file });
    };

    const handleVendorSelect = (selectedOption: any) => {
        if (selectedOption) {
            setUserData(prev => ({
                ...prev,
                attachment: { id: selectedOption.value, name: selectedOption.label, form_name: '' },
                attachment_name: selectedOption.value
            }));
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
        // Validate the required field
        // if (!isEditing) {
        //     setErrors({ files: 'Please upload at least one file.' });
        //     setValidated(true);
        //     return;
        // }
        setLoading(true);
        setValidated(true);

        const apiCall = isEditing
            ? axiosInstance.post(`/updateCandidate`, {
                ...custData
            }, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            })
            : axiosInstance.post('/recruitment-candidates', {
                ...custData,
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
            <Modal show onHide={onHide} size='lg' backdrop="static" keyboard={false}>
                <Modal.Header closeButton>
                    <Modal.Title>{isEditing ? `Edit Recruitment : ${irmSysId}` : `Add Recruitment`} </Modal.Title>
                </Modal.Header>
                <Form noValidate validated={validated} onSubmit={handleSubmit}>
                    <Modal.Body>
                        <Form.Control type="hidden" name="post_id" value={custData.post_id} />

                        <Row className="g-3 px-4">
                            <Form.Group as={Col} className="mb-3" controlId="name">
                                <Form.Label>Name <span className="text-danger">*</span></Form.Label>
                                <Form.Control type="text" placeholder="Candidate Name" name="name" value={custData.name} onChange={handleChange} required />
                                <Form.Control.Feedback type="invalid">Please enter Candidate Name</Form.Control.Feedback>
                            </Form.Group>
                            <Form.Group as={Col} className="mb-3" controlId="qualification">
                                <Form.Label>Qualification <span className="text-danger">*</span></Form.Label>
                                <Form.Control type="text" placeholder="Qualification" name="qualification" value={custData.qualification} onChange={handleChange} required />
                                <Form.Control.Feedback type="invalid">Please enter qualification</Form.Control.Feedback>
                            </Form.Group>
                        </Row>
                        <Row className="g-3 px-4">
                            <Form.Group as={Col} className="mb-3" controlId="experience">
                                <Form.Label>Experience <span className="text-danger">*</span></Form.Label>
                                <Form.Control type="text" name="experience" value={custData.experience} onChange={handleChange} required />
                                <Form.Control.Feedback type="invalid">Please enter experience.</Form.Control.Feedback>
                            </Form.Group>
                            <Form.Group as={Col} className="mb-3" controlId="communication_skill">
                                <Form.Label>Communication Skill <span className="text-danger">*</span></Form.Label>
                                <Form.Select name="communication_skill" value={custData.communication_skill} onChange={handleSelectChange} required>
                                    <option value="">Select Communication Skill</option>
                                    <option value="Poor">Poor</option>
                                    <option value="Average">Average</option>
                                    <option value="Good">Good</option>
                                    <option value="Best">Best</option>
                                </Form.Select>
                                <Form.Control.Feedback type="invalid">Please enter Communication Skill</Form.Control.Feedback>
                            </Form.Group>
                        </Row>
                        <Row className="g-3 px-4">
                            <Form.Group className="mb-3" controlId='address'>
                                <Form.Label>Address <span className="text-danger">*</span></Form.Label>
                                <Form.Control as="textarea" rows={6} placeholder="Address" name="address" value={custData.address} onChange={handleChange} required />
                                <Form.Control.Feedback type="invalid">Please enter address.</Form.Control.Feedback>
                            </Form.Group>
                        </Row>
                        <Row className="g-3 px-4">
                            <Form.Group as={Col} className="mb-3" controlId="email">
                                <Form.Label>Email <span className="text-danger">*</span></Form.Label>
                                <Form.Control type="text" placeholder="Email" name="email" value={custData.email} onChange={handleChange} required />
                                <Form.Control.Feedback type="invalid">Please enter email</Form.Control.Feedback>
                            </Form.Group>
                            <Form.Group as={Col} className="mb-3" controlId="mobile">
                                <Form.Label>Mobile <span className="text-danger">*</span></Form.Label>
                                <Form.Control type="text" maxLength={20} placeholder="Mobile" name="mobile" value={custData.mobile} onChange={handleChange} required />
                                <Form.Control.Feedback type="invalid">Please enter mobile</Form.Control.Feedback>
                            </Form.Group>
                        </Row>
                        <Row className="g-3 px-4">
                            <Form.Group as={Col} className="mb-3" controlId="english_knowledge">
                                <Form.Label>English knowledge <span className="text-danger">*</span></Form.Label>
                                <Form.Select name="english_knowledge" value={custData.english_knowledge} onChange={handleSelectChange} required>
                                    <option value="">Select English knowledge</option>
                                    <option value="Poor">Poor</option>
                                    <option value="Average">Average</option>
                                    <option value="Fluent">Fluent</option>
                                </Form.Select>
                                <Form.Control.Feedback type="invalid">Please enter English knowledge</Form.Control.Feedback>
                            </Form.Group>
                            <Form.Group as={Col} className="mb-3" controlId="critical_relationship">
                                <Form.Label>Relatives in Lawyer, Govt/ Police service <span className="text-danger">*</span></Form.Label>
                                <Form.Select name="critical_relationship" value={custData.critical_relationship} onChange={handleSelectChange} required>
                                    <option value="">Select Relatives in Lawyer, Govt/ Police service</option>
                                    <option value="Yes">Yes</option>
                                    <option value="No">No</option>
                                </Form.Select>
                                <Form.Control.Feedback type="invalid">Please enter Relatives</Form.Control.Feedback>
                            </Form.Group>
                        </Row>
                        <Row className="g-3 px-4">
                            <Form.Group as={Col} className="mb-3" controlId="energy_level">
                                <Form.Label>Energy Level <span className="text-danger">*</span></Form.Label>
                                <Form.Select name="energy_level" value={custData.energy_level} onChange={handleSelectChange} required>
                                    <option value="">Select Energy Level</option>
                                    <option value="Poor">Poor</option>
                                    <option value="Average">Average</option>
                                    <option value="Good">Good</option>
                                    <option value="Best">Best</option>
                                </Form.Select>
                                <Form.Control.Feedback type="invalid">Please enter Energy Level</Form.Control.Feedback>
                            </Form.Group>
                            <Form.Group as={Col} className="mb-3" controlId="distance">
                                <Form.Label>Distance in KM <span className="text-danger">*</span></Form.Label>
                                <Form.Control type="text" name="distance" placeholder="From office to home" value={custData.distance} onChange={handleChange} required />
                            </Form.Group>
                        </Row>
                        <Row className="g-3 px-4">
                            <Form.Group as={Col} className="mb-3" controlId="own_vehicle">
                                <Form.Label>Own Vehicle <span className="text-danger">*</span></Form.Label>
                                <Form.Select name="own_vehicle" value={custData.own_vehicle} onChange={handleSelectChange} required>
                                    <option value="">Select Own Vehicle</option>
                                    <option value="Yes">Yes</option>
                                    <option value="No">No</option>
                                </Form.Select>
                                <Form.Control.Feedback type="invalid">Please enter Own Vehicle</Form.Control.Feedback>
                            </Form.Group>
                            <Form.Group as={Col} className="mb-3" controlId="readiness_to_join">
                                <Form.Label>Readiness to join <span className="text-danger">*</span></Form.Label>
                                <Form.Control type="text" name="readiness_to_join" placeholder="Immediately or how many days" maxLength={10} value={custData.readiness_to_join} onChange={handleChange} required />
                            </Form.Group>
                        </Row>
                        <Row className="g-3 px-4">
                            <Form.Group as={Col} className="mb-3" controlId="working_status">
                                <Form.Label>Currently working <span className="text-danger">*</span></Form.Label>
                                <Form.Select name="working_status" value={custData.working_status} onChange={handleSelectChange} required>
                                    <option value="">Select Currently working</option>
                                    <option value="Yes">Yes</option>
                                    <option value="No">No</option>
                                </Form.Select>
                                <Form.Control.Feedback type="invalid">Please enter Currently working</Form.Control.Feedback>
                            </Form.Group>
                            <Form.Group as={Col} className="mb-3" controlId="job_change_reason">
                                <Form.Label>Job Change Reason </Form.Label>
                                <Form.Control  as="textarea" rows={1} name="job_change_reason" placeholder="Job Change Reason" maxLength={250} value={custData.job_change_reason} onChange={handleChange} />
                            </Form.Group>
                        </Row>
                        <Row className="g-3 px-4">
                            <Form.Group as={Col} className="mb-3" controlId="current_salary">
                                <Form.Label>Current Salary <span className="text-danger">*</span></Form.Label>
                                <Form.Control type="number" min={0} maxLength={10} placeholder="Current Salary" name="current_salary" value={custData.current_salary} onChange={handleChange} required />
                                <Form.Control.Feedback type="invalid">Please enter Current Salary</Form.Control.Feedback>
                            </Form.Group>
                            <Form.Group as={Col} className="mb-3" controlId="expected_salary">
                                <Form.Label>Expected Salary <span className="text-danger">*</span></Form.Label>
                                <Form.Control type="number" min={0} maxLength={10} placeholder="Expected Salary" name="expected_salary" value={custData.expected_salary} onChange={handleChange} required />
                                <Form.Control.Feedback type="invalid">Please enter Expected Salary</Form.Control.Feedback>
                            </Form.Group>
                        </Row>
                        <Row className="g-3 px-4">
                            <Form.Group as={Col} className="mb-3" controlId="notice_period">
                                <Form.Label>Notice Period <span className="text-danger">*</span></Form.Label>
                                <Form.Control type="text" placeholder="How many days" name="notice_period" value={custData.notice_period} maxLength={10} onChange={handleChange} required />
                                <Form.Control.Feedback type="invalid">Please enter Notice Period</Form.Control.Feedback>
                            </Form.Group>
                            <Form.Group as={Col} className="mb-3" controlId="interview_date">
                                <Form.Label>F2F Interview Date <span className="text-danger">*</span></Form.Label>
                                <Form.Control type="date" name="interview_date" value={custData.interview_date} onChange={handleChange} required />
                                <Form.Control.Feedback type="invalid">Please enter F2F Interview Date</Form.Control.Feedback>
                            </Form.Group>
                        </Row>
                        <Row className="g-3 px-4">
                            <Form.Group className="mb-3" controlId="attachment_name">
                                <Form.Label>Attachment Name <span className="text-danger">*</span></Form.Label>
                                <ReactSelect
                                    options={attachmentListData.map((option: AttachmentList) => (
                                        { value: option.id, label: option.name }
                                    ))}
                                    placeholder="Select Attachment Name" name="attachment" value={custData.attachment ? { value: custData.attachment.id, label: custData.attachment.name } : null} onChange={(selectedOption) => handleVendorSelect(selectedOption)}
                                />
                                <Form.Control type="hidden" name="attachment_name" value={custData.attachment_name} />
                                {validated && !custData.attachment_name && (
                                    <div className="invalid-feedback d-block">Please enter Attachment Name</div>
                                )}
                            </Form.Group>
                                <Form.Group className="mb-3" controlId="details">
                                <Form.Label>Details <span className="text-danger">*</span></Form.Label>
                                <Form.Control as="textarea" rows={3} placeholder="Students name" name="details" value={custData.details} onChange={handleChange} required/>
                            </Form.Group>

                        </Row>
                        <Row className="g-3 px-4">
                            <Form.Group as={Col} controlId="name">
                                <Form.Label>Attachment <span className="text-danger">*</span></Form.Label>
                                <Form.Control type="file" name="filename" onChange={handleFileChange} required={!isEditing} />
                                <Form.Control.Feedback type="invalid">Please enter attachment.</Form.Control.Feedback>
                            </Form.Group>
                            {isEditing && (<span className='text-danger'>Uploaded Attachment :- {custData.attachment_title ? custData.attachment_title : ''} </span>)}
                            <Form.Group as={Col} className="mb-3" controlId="candidate_status">
                                <Form.Label>Candidate status <span className="text-danger">*</span></Form.Label>
                                <Form.Select name="candidate_status" value={custData.candidate_status} onChange={handleSelectChange} required>
                                    <option value="">Select Candidate status</option>
                                    <option value="Not selected" selected>Not selected</option>
                                    <option value="Selected">Selected</option>
                                </Form.Select>
                                <Form.Control.Feedback type="invalid">Please enter Candidate status</Form.Control.Feedback>
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

export default RecruitmentCandidateModal;
