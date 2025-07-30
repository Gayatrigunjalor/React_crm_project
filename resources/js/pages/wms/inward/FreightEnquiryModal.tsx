import React, { useEffect, useState } from 'react';
import { Form, Modal, Row, Col, Alert } from 'react-bootstrap';
import Button from '../../../components/base/Button';
import axiosInstance from '../../../axios';
import swal from 'sweetalert';
import { useAuth } from '../../../AuthContext';
import { downloadFile } from '../../../helpers/utils';

interface FormData {
    id: number;
    volume_range: number;
    cc_requirement: string;
    temprature: string;
    ins_requirement: string;
    insurance: string;
}

interface DirectoryModalProps {
    inwardId: number;
    onHide: () => void;
}

const FreightEnquiryModal: React.FC<DirectoryModalProps> = ({ inwardId, onHide }) => {
    const [custData, setUserData] = useState<FormData>({
        id: 0,
        volume_range: 5000,
        cc_requirement: 'No',
        temprature: '',
        ins_requirement: 'No',
        insurance: ''
    });
    const [isEditing, setIsEditing] = useState<boolean>(false);
    const [validated, setValidated] = useState<boolean>(false);

    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState<{ files?: string }>({});
    const { empData } = useAuth(); //check userRole & permissions

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setUserData({ ...custData, [name]: value });
    };

    const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target
        setUserData({
            ...custData,
            [name]: value === "5000" ? 5000 : 6000
        });
    }

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

        const apiCall = axiosInstance.post('/getFreightEnquiryPDF', {
            id: inwardId,
            volume_range: custData.volume_range,
            cc: custData.cc_requirement,
            temp: custData.temprature,
            ins: custData.ins_requirement,
            ins_val: custData.insurance,

        },{
            responseType: 'blob',
        });

        apiCall
            .then((response) => {
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
            onHide();
        })
        .catch(error => swal("Error!", error.data.message, "error"))
        .finally(() => { setLoading(false); });
    };

    return (
        <>
            <Modal show onHide={onHide} size='lg' backdrop="static" keyboard={false}>
                <Modal.Header closeButton>
                    <Modal.Title>Freight Enquiry form </Modal.Title>
                </Modal.Header>
                <Form noValidate validated={validated} onSubmit={handleSubmit}>
                    <Modal.Body>
                        <h4 className='mb-2'>Select volume range for total volume weight</h4>
                        <Row className="g-3 px-4">
                            <Col md={4}>
                                <Form.Label>Volume Range <span className="text-danger">*</span></Form.Label>
                                <Form.Check type="radio" id="inspection-yes" label="5000" name="volume_range" value="5000" checked={custData.volume_range === 5000} onChange={handleVolumeChange} />
                                <Form.Check type="radio" id="inspection-no" label="6000" name="volume_range" value="6000" checked={custData.volume_range === 6000} onChange={handleVolumeChange} />
                            </Col>
                        </Row>
                        <Row  className="g-3 px-4">
                            <Form.Group as={Col} className="mb-3 col-md-6" controlId="cc_requirement">
                                <Form.Label>Cold Chain requirement <span className="text-danger">*</span></Form.Label>
                                <Form.Select name="cc_requirement" value={custData.cc_requirement} onChange={handleSelectChange} required>
                                    <option value="Yes">Yes</option>
                                    <option value="No">No</option>
                                </Form.Select>
                            </Form.Group>
                        </Row>
                        {custData.cc_requirement == 'Yes' && (
                            <Row className="g-3 px-4">
                                <Form.Group as={Col} className="mb-3" controlId="temprature">
                                    <Form.Label>Enter temprature <span className="text-danger">*</span></Form.Label>
                                    <Form.Control type="text" placeholder="Please mention temprature range" name="temprature" value={custData.temprature} onChange={handleChange} required />
                                    <Form.Control.Feedback type="invalid">Please enter temperature.</Form.Control.Feedback>
                                </Form.Group>
                            </Row>
                        )}
                        <Row  className="g-3 px-4">
                            <Form.Group as={Col} className="mb-3 col-md-6" controlId="ins_requirement">
                                <Form.Label>Insurance requirement <span className="text-danger">*</span></Form.Label>
                                <Form.Select name="ins_requirement" value={custData.ins_requirement} onChange={handleSelectChange} required>
                                    <option value="Yes">Yes</option>
                                    <option value="No">No</option>
                                </Form.Select>
                            </Form.Group>
                        </Row>
                        {custData.ins_requirement == 'Yes' && (
                            <Row className="g-3 px-4">
                                <Form.Group as={Col} className="mb-3" controlId="insurance">
                                    <Form.Label>Insurance Amount <span className="text-danger">*</span></Form.Label>
                                    <Form.Control type="text" placeholder="Please mention Insurance Amount" name="insurance" value={custData.insurance} onChange={handleChange} required />
                                    <Form.Control.Feedback type="invalid">Please enter insurance amount.</Form.Control.Feedback>
                                </Form.Group>
                            </Row>
                        )}

                    </Modal.Body>
                    <Modal.Footer>
                        <Button variant="secondary" onClick={onHide}>
                            Close
                        </Button>
                        <Button variant="primary" loading={loading} loadingPosition="start" type="submit">Generate</Button>
                    </Modal.Footer>
                </Form>
            </Modal>
        </>
    );
};

export default FreightEnquiryModal;
