import React, { useEffect, useState } from 'react';
import { Form, Modal, Row, Col, Card } from 'react-bootstrap';
import Button from '../../../components/base/Button';
import axiosInstance from '../../../axios';
import swal from 'sweetalert';
import { useAuth } from '../../../AuthContext';
import ReactSelect from '../../../components/base/ReactSelect';
import { downloadFile } from '../../../helpers/utils';

interface BTListingData {
    id: number;
    customer_name: string;
}
interface PiListingData {
    id: number;
    pi_number: string;
    pi_date: string;
}
interface IncoTermData{
    id: number;
    inco_term: string;
}
interface FormData {
    inward_id: number;
    business_task: BTListingData | null;
    business_task_id: number;
    quotation_id: number;
    quotation: { id: number; pi_number: string; } | null;
    inco_term_id: number;
    inco_term: IncoTermData | null;
    port_of_loading: string;
    port_of_discharge: string;
    pickup_location: string;
    mode_of_shipment: string;
    terms_of_shipment: string;
}

interface EditInwardModalProps {
    inwardId: number;
    quotation_id: number;
    quotation: { id: number; pi_number: string; } | null;
    business_task_id: number;
    business_task: BTListingData | null;
    inco_term_id: number;
    inco_term: IncoTermData | null;
    port_of_loading: string;
    port_of_discharge: string;
    pickup_location: string;
    mode_of_shipment: string;
    terms_of_shipment: string;
    onSuccess: () => void;
    onHide: () => void;
}

const EditInwardDetailsModal: React.FC<EditInwardModalProps> = ({ inwardId,
    quotation_id,
    quotation,
    business_task_id,
    business_task,
    inco_term_id,
    inco_term,
    port_of_loading,
    port_of_discharge,
    pickup_location,
    mode_of_shipment,
    terms_of_shipment,
    onSuccess,
    onHide
}) => {
    const [inwardData, setInwardData] = useState<FormData>({
        inward_id: inwardId,
        inco_term_id: inco_term_id,
        inco_term: inco_term,
        business_task_id: business_task_id,
        business_task: business_task,
        quotation_id: quotation_id,
        quotation: quotation,
        port_of_loading: port_of_loading,
        port_of_discharge: port_of_discharge,
        pickup_location: pickup_location,
        mode_of_shipment: mode_of_shipment,
        terms_of_shipment: terms_of_shipment,
    });

    const [validated, setValidated] = useState<boolean>(false);
    const [incoTermData, setIncoTermData] = useState<IncoTermData[]>([]);
    const [btListingData, setBtListingData] = useState<BTListingData[]>([]);
    const [piListingData, setPiListingData] = useState<PiListingData[]>([]);
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const fetchBusinessTaskListing = async () => {
            try {
                const response = await axiosInstance.get(`/btDropdownListing`);
                if (response.status !== 200) {
                    throw new Error('Failed to fetch data');
                }
                const data: BTListingData[] = response.data;
                setBtListingData(data);
            } catch (err: any) {
                setError(err.data.message);
            }
        };
        const fetchPiListing = async () => {
            try {
                const response = await axiosInstance.get(`/piListing`);
                if (response.status !== 200) {
                    throw new Error('Failed to fetch data');
                }
                const data: PiListingData[] = response.data;
                setPiListingData(data);
            } catch (err: any) {
                setError(err.data.message);
            }
        };
                const fetchIncoTerms = async () => {
            try {
                const response = await axiosInstance.get(`/incoTermsListing`);
                if (response.status !== 200) {
                    throw new Error('Failed to fetch data');
                }
                const data: IncoTermData[] = response.data;
                setIncoTermData(data);
            } catch (err: any) {
                setError(err.data.message);
            }
        };
        fetchBusinessTaskListing();
        fetchPiListing();
        fetchIncoTerms();
    }, []);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setInwardData({ ...inwardData, [name]: value });
    };

    const handleSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const { name, value } = e.target;
        setInwardData({ ...inwardData, [name]: value });
    };

    const handlePISelect = (selectedOption: any) => {
        if (selectedOption) {
            setInwardData(prev => ({
                ...prev,
                quotation: { id: selectedOption.value, pi_number: selectedOption.label },
                quotation_id: selectedOption.value
            }));
        }
    };
    const handleIncoSelect = (selectedOption: any) => {
        if (selectedOption) {
            setInwardData(prev => ({
                ...prev,
                inco_term: { id: selectedOption.value, inco_term: selectedOption.label },
                inco_term_id: selectedOption.value
            }));
        }
    };
    const handleBTselection = (selectedOption: any) => {
        if (selectedOption) {
            setInwardData(prev => ({
                ...prev,
                business_task: { id: selectedOption.value, customer_name: selectedOption.label },
                business_task_id: selectedOption.value
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

        setLoading(true);
        setValidated(true);

        const apiCall = axiosInstance.post('/updateInwardDetails', {
            ...inwardData
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
                    <Modal.Title>Freight Enquiry form </Modal.Title>
                </Modal.Header>
                <Form noValidate validated={validated} onSubmit={handleSubmit}>
                    <Modal.Body>
                        <Row className='mb-2'>
                            <Form.Group as={Col} className="mb-3">
                                <Form.Label>Proforma Invoice Number <span className="text-danger">*</span></Form.Label>
                                <ReactSelect
                                    options= {piListingData.map((option: PiListingData) => (
                                        { value: option.id, label: option.pi_number }
                                    ))}
                                    placeholder="Select PI Number" name="quotation" value={inwardData.quotation ? { value: inwardData.quotation.id, label: inwardData.quotation.pi_number } : null} onChange={(selectedOption) => handlePISelect(selectedOption)} required />
                                <Form.Control type="hidden" name="quotation_id" value={inwardData.quotation_id} />
                                {validated && !inwardData.quotation_id && (
                                    <div className="invalid-feedback d-block">Please select Proforma Invoice Number</div>
                                )}
                            </Form.Group>
                            <Form.Group as={Col} className="mb-3">
                                <Form.Label>Business Task Id <span className="text-danger">*</span></Form.Label>
                                <ReactSelect
                                    options= {btListingData.map((option: BTListingData) => (
                                        { value: option.id, label: `${option.id} (${option.customer_name})` }
                                    ))}
                                    placeholder="Select Business Task" name="business_task" value={inwardData.business_task ? { value: inwardData.business_task.id, label: inwardData.business_task.customer_name } : null} onChange={(selectedOption) => handleBTselection(selectedOption)} required />
                                    <Form.Control type="hidden" name="business_task_id" value={inwardData.business_task_id} />
                                    {validated && !inwardData.business_task_id && (
                                        <div className="invalid-feedback d-block">Please select Business Task Id</div>
                                    )}
                            </Form.Group>
                        </Row>

                        <hr className='border border-danger border-1'/>
                        <Card.Title as="h5" className="text-danger">Route for the shipment</Card.Title>

                        <Row className='g-2'>
                            <Form.Group as={Col} className="mb-3" controlId="port_of_loading">
                                <Form.Label>Port Of Loading <span className="text-danger">*</span></Form.Label>
                                <Form.Control type="text" placeholder="Enter location" name="port_of_loading" value={inwardData.port_of_loading} onChange={handleChange} required />
                                <Form.Control.Feedback type="invalid">Please enter port Of Loading.</Form.Control.Feedback>
                            </Form.Group>
                            <Form.Group as={Col} className="mb-3" controlId="port_of_discharge">
                                <Form.Label>Port Of Discharge <span className="text-danger">*</span></Form.Label>
                                <Form.Control type="text" placeholder="Enter destination" name="port_of_discharge" value={inwardData.port_of_discharge} onChange={handleChange} required />
                                <Form.Control.Feedback type="invalid">Please enter Port Of Discharge.</Form.Control.Feedback>
                            </Form.Group>
                            <Form.Group as={Col} className="mb-3">
                                <Form.Label>INCO Term <span className="text-danger">*</span></Form.Label>
                                <ReactSelect
                                    options= {incoTermData.map((option: IncoTermData) => (
                                        { value: option.id, label: option.inco_term }
                                    ))}
                                    placeholder="Select Inco Term" name="inco_term" value={inwardData.inco_term ? { value: inwardData.inco_term.id, label: inwardData.inco_term.inco_term } : null} onChange={(selectedOption) => handleIncoSelect(selectedOption)} required/>
                                <Form.Control type="hidden" name="inco_term_id" value={inwardData.inco_term_id} />
                                {validated && !inwardData.inco_term_id && (
                                    <div className="invalid-feedback d-block">Please select INCO Term</div>
                                )}
                            </Form.Group>
                        </Row>

                        <Row className="g-3">
                            <Form.Group as={Col} className="mb-3" controlId="pickup_location">
                                <Form.Label>Pickup Location <span className="text-danger">*</span></Form.Label>
                                <Form.Control type="text" placeholder="x-rates.com" name="pickup_location" value={inwardData.pickup_location} onChange={handleChange} required />
                                <Form.Control.Feedback type="invalid">Please enter exchange rate.</Form.Control.Feedback>
                            </Form.Group>
                            <Form.Group as={Col} className="mb-3" controlId="mode_of_shipment">
                                <Form.Label>Mode Of Shipment <span className="text-danger">*</span></Form.Label>
                                <Form.Select name="mode_of_shipment" value={inwardData.mode_of_shipment} onChange={handleSelectChange}>
                                    <option value="">Please select</option>
                                    <option value="by_air">By Air</option>
                                    <option value="by_sea">By Sea</option>
                                </Form.Select>
                                <Form.Control.Feedback type="invalid">Please enter Mode Of shipment type.</Form.Control.Feedback>
                            </Form.Group>
                            <Form.Group as={Col} className="mb-3" controlId="terms_of_shipment">
                                <Form.Label>Terms Of Shipment<span className="text-danger">*</span></Form.Label>
                                <Form.Select name="terms_of_shipment" value={inwardData.terms_of_shipment} onChange={handleSelectChange}>
                                    <option value="">Please select</option>
                                    <option value="door_to_port">Door To Port</option>
                                    <option value="port_to_port">Port To Port</option>
                                    <option value="door_to_door">Door To Door</option>
                                </Form.Select>
                                <Form.Control.Feedback type="invalid">Please enter Terms Of shipment type.</Form.Control.Feedback>
                            </Form.Group>
                        </Row>

                    </Modal.Body>
                    <Modal.Footer>
                        <Button variant="secondary" onClick={onHide}>
                            Close
                        </Button>
                        <Button variant="primary" loading={loading} loadingPosition="start" type="submit">Update</Button>
                    </Modal.Footer>
                </Form>
            </Modal>
        </>
    );
};

export default EditInwardDetailsModal;
