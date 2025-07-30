import React, { useEffect, useState } from 'react';
import { Form, Modal, Row, Col, Alert } from 'react-bootstrap';
import Button from '../../../components/base/Button';
import axiosInstance from '../../../axios';
import swal from 'sweetalert';
import { useAuth } from '../../../AuthContext';
import ReactSelect from '../../../components/base/ReactSelect';
import Dropzone from '../../../components/base/Dropzone';

interface FormData {
    id: number;
    post_name: string;
    opening_date: string;
    tat: string;
    closer_date: string;
    deviation: string;
    opening_status: string;
    job_description: string;
    assignee_name: number;
    assignee: {
        id: number;
        name: string;
    };
    joined_candidate: number | undefined;
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
    recId?: number;
    onHide: () => void;
    onSuccess: () => void;
}

const RecruitmentModal: React.FC<RecruitmentModalProps> = ({ recId, onHide, onSuccess }) => {
    const [custData, setUserData] = useState<FormData>({
        id: 0,
        post_name: '',
        opening_date: '',
        tat: '',
        closer_date: '',
        deviation: '',
        opening_status: '',
        job_description: '',
        assignee_name: 0,
        assignee: { id: 0, name: '' },
        joined_candidate: undefined

    });
    const [isEditing, setIsEditing] = useState<boolean>(false);
    const [validated, setValidated] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
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

        if (recId) {
            setIsEditing(true);
            // Fetch customer data for editing
            axiosInstance.get(`/recruitment/${recId}`)
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
    }, [recId]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setUserData({ ...custData, [name]: value });
    };

    const handleSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const { name, value } = e.target;
        setUserData({ ...custData, [name]: value });
    };

    const handleIncoSelect = (selectedOption: any) => {
        if (selectedOption) {
            setUserData(prev => ({
                ...prev,
                assignee: { id: selectedOption.value, name: selectedOption.label },
                assignee_name: selectedOption.value
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
            ? axiosInstance.put(`/recruitment/${custData.id}`,  {
                ...custData,
            })
            : axiosInstance.post('/recruitment', {
                ...custData,
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
                        <Form.Control type="hidden" name="id" value={custData.id} />

                        <Row className="g-3 px-4">
                            <Form.Group as={Col} className="mb-3" controlId="post_name">
                                <Form.Label>Post <span className="text-danger">*</span></Form.Label>
                                <Form.Control type="text" placeholder="Post Name" name="post_name" value={custData.post_name} onChange={handleChange} required />
                                <Form.Control.Feedback type="invalid">Please Enter Post title</Form.Control.Feedback>
                            </Form.Group>
                        </Row>
                        <Row className="g-3 px-4">
                            <Form.Group as={Col} className="mb-3" controlId="opening_date">
                                <Form.Label>Opening Date <span className="text-danger">*</span></Form.Label>
                                <Form.Control type="date" name="opening_date" value={custData.opening_date} onChange={handleChange} required />
                                <Form.Control.Feedback type="invalid">Please enter Opening Date.</Form.Control.Feedback>
                            </Form.Group>
                        </Row>
                        <Row className="g-3 px-4">
                            <Form.Group as={Col} className="mb-3" controlId="tat">
                                <Form.Label>TAT <span className="text-danger">*</span></Form.Label>
                                <Form.Control type="date" name="tat" value={custData.tat} onChange={handleChange} required />
                                <Form.Control.Feedback type="invalid">Please enter TAT Date.</Form.Control.Feedback>
                            </Form.Group>
                        </Row>
                        <Row className="g-3 px-4">
                            <Form.Group as={Col} className="mb-3" controlId="closer_date">
                                <Form.Label>Actual Closer Date <span className="text-danger">*</span></Form.Label>
                                <Form.Control type="date" name="closer_date" value={custData.closer_date} onChange={handleChange} />
                            </Form.Group>
                        </Row>
                        <Row className="g-3 px-4">
                            <Form.Group as={Col} className="mb-3" controlId="deviation">
                                <Form.Label>Deviation <span className="text-danger">*</span></Form.Label>
                                <Form.Control type="text" name="deviation" value={custData.deviation} readOnly style={{backgroundColor: 'whitesmoke', pointerEvents: 'none'}} />
                            </Form.Group>
                        </Row>
                        <Row className="g-3 px-4">
                            <Form.Group as={Col} className="mb-3" controlId="opening_status">
                                <Form.Label>Opening Status <span className="text-danger">*</span></Form.Label>
                                <Form.Select name="opening_status" value={custData.opening_status} onChange={handleSelectChange}>
                                    <option value="">Select Opening Status</option>
                                    <option value="Ongoing">Ongoing</option>
                                    <option value="Abort">Abort</option>
                                    <option value="Done" disabled={!isEditing}>Done</option>
                                </Form.Select>
                                <Form.Control.Feedback type="invalid">Please enter Opening Status</Form.Control.Feedback>
                            </Form.Group>
                        </Row>
                        <Row className="g-3 px-4">
                            <Form.Group className="mb-3" controlId={`box_content_`}>
                                <Form.Label>Job Description <span className="text-danger">*</span></Form.Label>
                                <Form.Control as="textarea" rows={6} placeholder="Job Description" name="job_description" value={custData.job_description} onChange={handleChange} required />
                                <Form.Control.Feedback type="invalid">Please enter Job Description.</Form.Control.Feedback>
                            </Form.Group>
                        </Row>
                        <Row className="g-3 px-4">
                            <Form.Group as={Col} className="mb-3" controlId="assignee">
                                <Form.Label>Assignee Name <span className="text-danger">*</span></Form.Label>
                                <ReactSelect
                                    options= {employeeData.map((option: EmployeeData) => (
                                        { value: option.id, label: option.name }
                                    ))}
                                    placeholder="Select Assignee" name="assignee" value={custData.assignee ? { value: custData.assignee.id, label: custData.assignee.name } : null} onChange={(selectedOption) => handleIncoSelect(selectedOption)} 
                                />
                                <Form.Control type="hidden" name="assignee_name" value={custData.assignee_name} />
                                {validated && !custData.assignee_name && (
                                    <div className="invalid-feedback d-block">Please enter Assignee</div>
                                )}
                            </Form.Group>
                        </Row>
                        {isEditing && (
                            <Row className="g-3 px-4">
                                <Form.Group as={Col} className="mb-3" controlId="joined_candidate">
                                <Form.Label>Joined Candidate <span className="text-danger">*</span></Form.Label>
                                <Form.Select name="joined_candidate" value={custData.joined_candidate == undefined ? '' : custData.joined_candidate} onChange={handleSelectChange}>
                                    <option value="">Select Candidate</option>
                                    {selected_candidates.length > 0 && selected_candidates.map((candidate, index) => (
                                        <option key={index} value={candidate.id}>{candidate.name}</option>
                                    ))}
                                </Form.Select>
                                <Form.Control.Feedback type="invalid">Please enter Opening Status</Form.Control.Feedback>
                            </Form.Group>
                            </Row>
                        )}

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

export default RecruitmentModal;
