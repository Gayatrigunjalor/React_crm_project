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
    reference_no: string;
    remittance_date: string;
    currency_id: number;
    currency: CustomersData | null;
    received_amount: number;
    buyer_id: number;
    buyer: CustomersData | null;
    consignee_ids: number;
    consignee: ConsigneeData | null;
    bank_id: number;
    bank: BankAccountsData | null;
    business_task_id: number;
    business_task: {
        id: number;
        customer_name: string;
    } | null;
    shipment_type: string;
}
interface CustomersData {
    id: number;
    name: string;
}
interface BankAccountsData {
    id: number;
    bank_name: string;
}
interface ConsigneeData{
    id: number;
    name?: string;
    contact_person?: string;
}
interface BTData {
    id: number;
    customer_name: string;
}

interface IrmsModalProps {
    irmId?: number;
    onHide: () => void;
    onSuccess: () => void;
}

const IrmsModal: React.FC<IrmsModalProps> = ({ irmId,   onHide, onSuccess }) => {
    const [custData, setUserData] = useState<FormData>({
        id: 0,
        reference_no: '',
        remittance_date: '',
        currency_id: 0,
        currency: null,
        received_amount: 0,
        buyer_id: 0,
        buyer: null,
        consignee_ids: 0,
        consignee: null,
        bank_id: 0,
        bank: null,
        business_task_id: 0,
        business_task: null,
        shipment_type: '',

    });
    const [isEditing, setIsEditing] = useState<boolean>(false);
    const [validated, setValidated] = useState<boolean>(false);
    const [BTdata, setBTData] = useState<BTData[]>([]);
    const [error, setError] = useState<string | null>(null);
    const [irmSysId, setIrmSysId] = useState<string>('');
    const [loading, setLoading] = useState(false);
    const [fircAttachments, setFircAttachments] = useState({
        files: [] as File[],
    });
    const [swiftAttachments, setSwiftAttachments] = useState({
        files: [] as File[],
    });
    const [errors, setErrors] = useState<{ files?: string }>({});
    const { empData } = useAuth(); //check userRole & permissions
    const [currencies, setCurrencies] = useState<CustomersData[]>([]);
    const [customersData, setCustomersData] = useState<CustomersData[]>([]);
    const [consigneeData, setConsigneeData] = useState<ConsigneeData[]>([]);

    const [bankAccountsData, setBankAccountsData] = useState<BankAccountsData[]>([]);
    useEffect(() => {
        const fetchCustomers = async () => {
            try {
                const response = await axiosInstance.get('/customerList');
                if (response.status !== 200) {
                    throw new Error('Failed to fetch data');
                }
                const data: CustomersData[] = await response.data;
                setCustomersData(data);
            } catch (err: any) {
                setError(err.message);
            } finally {
            }
        };
        const fetchBankAccounts = async () => {
            try {
                const response = await axiosInstance.get('/bankAccountList');
                if (response.status !== 200) {
                    throw new Error('Failed to fetch data');
                }
                const data: BankAccountsData[] = response.data;
                setBankAccountsData(data);
            } catch (err: any) {
                setError(err.message);
            } finally {
            }
        };
        const fetchCurrencies = async () => {
            try {
                const response = await axiosInstance.get('/currencyListing');
                if (response.status !== 200) {
                    throw new Error('Failed to fetch data');
                }
                const data = await response.data;
                setCurrencies(data);
            } catch (err: any) {
                setError(err.message);
            } finally {
            }
        };
        const fetchBTlisting = async () => {
            try {
                const response = await axiosInstance.get('/btDropdownListing');
                if (response.status !== 200) {
                    throw new Error('Failed to fetch data');
                }
                const data: BTData[] = await response.data;
                setBTData(data);
            } catch (err: any) {
                setError(err.message);
            } finally {
            }
        };
        fetchBTlisting();
        fetchCustomers();
        fetchBankAccounts();
        fetchCurrencies();
    }, []);
    useEffect(() => {

        if (irmId) {
            setIsEditing(true);
            // Fetch customer data for editing
            axiosInstance.get(`/editIrm/${irmId}`)
            .then(response => {
                setUserData(response.data);
                setIrmSysId(response.data.irm_sys_id)
            })
            .catch(error => console.error('Error fetching customer data:', error));
        }
    }, [irmId]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setUserData({ ...custData, [name]: value });
    };

    const handleSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const { name, value } = e.target;
        setUserData({ ...custData, [name]: value });
    };

    const handleRSelect = (selectedOption: { value: number; label: string } | null, fieldName: string) => {
        if (selectedOption) {

            if(fieldName == 'buyer') {
                setUserData({ ...custData, buyer: {
                    id: selectedOption.value,
                    name: selectedOption.label
                }, buyer_id: selectedOption.value,
                consignee: null,
                consignee_ids: 0 });
                axiosInstance.get(`/getConsignees/${selectedOption.value}`)
                .then(response => {
                    setConsigneeData(response.data);
                });
            }
            if(fieldName == 'consignee') {
                setUserData({ ...custData, consignee: {
                    id: selectedOption.value,
                    name: selectedOption.label
                }, consignee_ids: selectedOption.value });
            }
            if(fieldName == 'bank') {
                setUserData({ ...custData, bank: {
                    id: selectedOption.value,
                    bank_name: selectedOption.label
                }, bank_id: selectedOption.value });
            }
            if(fieldName == 'currency') {
                setUserData({ ...custData, currency: {
                    id: selectedOption.value,
                    name: selectedOption.label
                }, currency_id: selectedOption.value });
            }
            if(fieldName == 'business_task') {
                setUserData({ ...custData, business_task: {
                    id: selectedOption.value,
                    customer_name: selectedOption.label,
                }, business_task_id: selectedOption.value });
            }
        } else {
            setUserData({ ...custData, [fieldName]: null });
        }
    };

    const handleFircDrop = (acceptedFiles: File[]) => {
        // Instead of creating a FileList, just update the files array
        setFircAttachments((prevState) => ({
            ...prevState,
            files: acceptedFiles, // acceptedFiles is already an array of File objects
        }));

        setErrors((prevErrors) => ({ ...prevErrors, files: undefined }));
    };

    const handleRemoveFirc = (index: number) => {
        const updatedFiles = fircAttachments.files.filter((_, i) => i !== index);

        setFircAttachments((prevState) => ({
            ...prevState,
            files: updatedFiles, // Update the files with the new array
        }));
    };

    const handleSwiftDrop = (acceptedSwiftFiles: File[]) => {
        // Instead of creating a FileList, just update the files array
        setSwiftAttachments((prevState) => ({
            ...prevState,
            files: acceptedSwiftFiles, // acceptedFiles is already an array of File objects
        }));

        setErrors((prevErrors) => ({ ...prevErrors, files: undefined }));
    };

    const handleRemoveSwift = (index: number) => {
        const updatedFiles = swiftAttachments.files.filter((_, i) => i !== index);

        setSwiftAttachments((prevState) => ({
            ...prevState,
            files: updatedFiles, // Update the files with the new array
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
        // Validate the required field
        if (!isEditing && (!fircAttachments.files || fircAttachments.files.length === 0)) {
            setErrors({ files: 'Please upload at least one file.' });
            setValidated(true);
            return;
        }
        setLoading(true);
        setValidated(true);

        const apiCall = isEditing
            ? axiosInstance.post(`/updateIrm`,  {
                ...custData,
                firc_attachments: fircAttachments,
                swift_attachments: swiftAttachments
            }, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            })
            : axiosInstance.post('/addIrm', {
                ...custData,
                firc_attachments: fircAttachments,
                swift_attachments: swiftAttachments
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
            <Modal show onHide={onHide} size='xl' backdrop="static" keyboard={false}>
                <Modal.Header closeButton>
                    <Modal.Title>{isEditing ? `Edit IRM : ${irmSysId}` : `Add Irm`} </Modal.Title>
                </Modal.Header>
                <Form noValidate validated={validated} onSubmit={handleSubmit}>
                    <Modal.Body>
                        <Form.Control type="hidden" name="id" value={custData.id} />

                        <Row className="g-3 px-4">
                            <Form.Group as={Col} className="mb-3" controlId="reference_no">
                                <Form.Label>Reference No <span className="text-danger">*</span></Form.Label>
                                <Form.Control type="text" placeholder="Reference No" name="reference_no" value={custData.reference_no} onChange={handleChange} required />
                                <Form.Control.Feedback type="invalid">Please Enter Reference No</Form.Control.Feedback>
                            </Form.Group>
                            <Form.Group as={Col} className="mb-3" controlId="remittance_date">
                                <Form.Label>Remittance Date <span className="text-danger">*</span></Form.Label>
                                <Form.Control type="date" name="remittance_date" value={custData.remittance_date} onChange={handleChange} required />
                                <Form.Control.Feedback type="invalid">Please enter Remittance Date.</Form.Control.Feedback>
                            </Form.Group>
                            <Form.Group as={Col} className="mb-3" controlId="currency_id">
                                <Form.Label>Currency <span className="text-danger">*</span></Form.Label>
                                <ReactSelect
                                    options= {currencies.map((option: CustomersData) => (
                                        { value: option.id, label: option.name }
                                    ))}
                                    placeholder="Select Currency" name="currency" value={custData.currency ? { value: custData.currency.id, label: custData.currency.name } : null} onChange={(selectedOption) => handleRSelect(selectedOption, 'currency')} required
                                />
                                <Form.Control type="hidden" name="currency_id" value={custData.currency_id} />
                                {validated && !custData.currency_id && (
                                    <div className="invalid-feedback d-block">Please enter currency</div>
                                )}
                            </Form.Group>
                        </Row>
                        <Row className="g-3 px-4">
                            <Form.Group as={Col} className="mb-3" controlId="received_amount">
                                <Form.Label>Received Amount <span className="text-danger">*</span></Form.Label>
                                <Form.Control type="number" step={0.1} placeholder="Received Amount" name="received_amount" value={custData.received_amount} onChange={handleChange} min={0} onFocus={(e) => e.target.select()}/>
                                <Form.Control.Feedback type="invalid">Please enter Received Amount.</Form.Control.Feedback>
                            </Form.Group>
                            <Form.Group as={Col} className="mb-3" controlId="buyer_id">
                                <Form.Label>Buyer Name <span className="text-danger">*</span></Form.Label>
                                <ReactSelect
                                    options= {customersData.map((option: CustomersData) => (
                                        { value: option.id, label: option.name }
                                    ))}
                                    placeholder="Select Buyer " name="buyer" value={custData.buyer ? { value: custData.buyer.id, label: custData.buyer.name } : null} onChange={(selectedOption) => handleRSelect(selectedOption, 'buyer')} required
                                />
                                <Form.Control type="hidden" name="buyer_id" value={custData.buyer_id} />
                                {validated && !custData.buyer_id && (
                                    <div className="invalid-feedback d-block">Please enter buyer name</div>
                                )}
                            </Form.Group>
                            <Form.Group as={Col} className="mb-3" controlId='consignee_ids'>
                                <Form.Label>Consignee Name <span className="text-danger">*</span></Form.Label>
                                <ReactSelect
                                    options= {consigneeData.map((option: ConsigneeData) => (
                                        { value: option.id, label: option.name }
                                    ))}
                                    placeholder={"Select Consignee"} name="consignee" value={custData.consignee ? { value: custData.consignee.id, label: custData.consignee.name } : null} onChange={(selectedOption) => handleRSelect(selectedOption, 'consignee')} required
                                />
                                <Form.Control type="hidden" name="consignee_ids" value={custData.consignee_ids} />
                                {validated && !custData.consignee_ids && (
                                    <div className="invalid-feedback d-block">Please enter consignee</div>
                                )}
                            </Form.Group>
                        </Row>
                        <Row className="g-3 px-4">
                            <Col md={4} className="mb-3">
                                <Form.Label>Bank <span className="text-danger">*</span></Form.Label>
                                <ReactSelect
                                    options= {bankAccountsData.map((option: BankAccountsData) => (
                                        { value: option.id, label: option.bank_name }
                                    ))}
                                    placeholder="Select bank" name="bank" value={custData.bank ? { value: custData.bank.id, label: custData.bank.bank_name } : null} onChange={(selectedOption) => handleRSelect(selectedOption, 'bank')} required
                                />
                                <Form.Control type="hidden" name="bank_id" value={custData.bank_id} />
                                {validated && !custData.bank_id && (
                                    <div className="invalid-feedback d-block">Please enter bank</div>
                                )}
                            </Col>
                            <Form.Group as={Col} className="mb-3" controlId="business_task_id">
                                <Form.Label>Business Task Id <span className="text-danger">*</span></Form.Label>
                                <ReactSelect
                                    options= {BTdata.map((option: BTData) => (
                                        { value: option.id, label: `${option.id} - ${option.customer_name}` }
                                    ))}
                                    placeholder="Select " name="business_task" value={custData.business_task ? { value: custData.business_task.id, label: custData.business_task.customer_name } : null} onChange={(selectedOption) => handleRSelect(selectedOption, 'business_task')}
                                />
                                <Form.Control type="hidden" name="business_task_id" value={custData.business_task_id} />
                                {validated && !custData.business_task_id && (
                                    <div className="invalid-feedback d-block">Please enter Business Task</div>
                                )}
                            </Form.Group>
                            <Form.Group as={Col} className="mb-3" controlId="shipment_type">
                                <Form.Label>Shipment Type</Form.Label>
                                <Form.Select name="shipment_type" value={custData.shipment_type} onChange={handleSelectChange}>
                                    <option value="">Select Shipment Type</option>
                                    <option value="Partial">Partial</option>
                                    <option value="Full">Full</option>
                                </Form.Select>
                                <Form.Control.Feedback type="invalid">Please enter </Form.Control.Feedback>
                            </Form.Group>
                        </Row>

                        <Row className='g-3 px-4'>
                            <Col md={6}>
                                <Form.Label>FIRC Attachment <span className="text-danger">*</span></Form.Label>
                                <Dropzone onDrop={acceptedFiles => handleFircDrop(acceptedFiles)} onRemove={index => handleRemoveFirc(index)} />
                                {errors.files && <div className="text-danger mt-1">{errors.files}</div>}
                            </Col>
                            <Col md={6}>
                                <Form.Label>Swift Copy Attachment </Form.Label>
                                <Dropzone onDrop={acceptedSwiftFiles => handleSwiftDrop(acceptedSwiftFiles)} onRemove={index => handleRemoveSwift(index)} />
                            </Col>
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

export default IrmsModal;
