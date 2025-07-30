import React, { useEffect, useState } from 'react';
import { Form, Modal, Row, Col, Alert } from 'react-bootstrap';
import Button from '../../../components/base/Button';
import axiosInstance from '../../../axios';
import swal from 'sweetalert';
import { useAuth } from '../../../AuthContext';
import Dropzone from '../../../components/base/Dropzone';

interface DirectoryModalProps {
    poId: number;
    onHide: () => void;
    onSuccess: () => void;
}

const POAttachQuoteModal: React.FC<DirectoryModalProps> = ({ poId, onHide, onSuccess }) => {
    const [validated, setValidated] = useState<boolean>(false);
    type FileAttachmentKeys = 'quotations_attachment';
    const [fileAttachments, setFileAttachments] = useState<Record<FileAttachmentKeys, File[]>>({
        quotations_attachment: [],
    });
    const [shipmentPhotoErrors, setShipmentPhotoErrors] = useState<{ files?: string }>({});
    const [fileValidations, setFileValidations] = useState<{ quotations_attachment?: string }>({});
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    //File uploads functions
    const handleDrop = (acceptedFiles: File[], fileName: FileAttachmentKeys) => {
        // Instead of creating a FileList, just update the files array
        setFileAttachments((prevState) => ({
            ...prevState,
            [fileName]: acceptedFiles, // acceptedFiles is already an array of File objects
        }));

        setFileValidations((prevErrors) => ({ ...prevErrors, [fileName]: undefined }));
        setShipmentPhotoErrors({ files: '' });
    };

    const handleFileRemove = (index: number, fileName: FileAttachmentKeys) => {
        const updatedFiles = fileAttachments[fileName].filter((_, i) => i !== index);

        setFileAttachments((prevState) => ({
            ...prevState,
            [fileName]: updatedFiles, // Update the files with the new array
        }));
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

        if(fileAttachments.quotations_attachment.length < 1){
            setShipmentPhotoErrors({ files: 'Please upload at least one file.' });
            setValidated(true);
            return;
        }
        setLoading(true);
        setValidated(true);

        const apiCall = axiosInstance.post('/addQuotationAttachmentPO', {
                purch_id: poId,
                quotations_attachment: fileAttachments.quotations_attachment
            }, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            }
        );

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
                    <Modal.Title>Attach Quotations</Modal.Title>
                </Modal.Header>
                <Form noValidate validated={validated} onSubmit={handleSubmit}>
                    <Modal.Body>
                        <Row className="g-3 px-4">
                            <Col>
                                <Form.Label>Add quotations </Form.Label>
                                <Dropzone onDrop={acceptedFiles => handleDrop(acceptedFiles, 'quotations_attachment')} onRemove={index => handleFileRemove(index, 'quotations_attachment')} />
                                {shipmentPhotoErrors.files && <div className="text-danger mt-1">{shipmentPhotoErrors.files}</div>}
                            </Col>
                        </Row>

                    </Modal.Body>
                    <Modal.Footer>
                        <Button variant="secondary" onClick={onHide}>
                            Close
                        </Button>
                        <Button variant="primary" loading={loading} loadingPosition="start" type="submit">Add</Button>
                    </Modal.Footer>
                </Form>
            </Modal>
        </>
    );
};

export default POAttachQuoteModal;
