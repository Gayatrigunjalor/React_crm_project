import { faCirclePlus, faEdit, faTrash } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import Button from '../../../components/base/Button';
import React, { useEffect, useState, ChangeEvent } from 'react';
import { Card, Form, Modal, Col, Row } from 'react-bootstrap';
import axiosInstance from '../../../axios';
import useAdvanceTable from '../../../hooks/useAdvanceTable';
import AdvanceTableProvider from '../../../providers/AdvanceTableProvider';
import SearchBox from '../../../components/common/SearchBox';
import { useAuth } from '../../../AuthContext';
import { ColumnDef } from '@tanstack/react-table';
import AdvanceTable from '../../../components/base/AdvanceTable';
import AdvanceTableFooter from '../../../components/base/AdvanceTableFooter';
import swal from 'sweetalert';

interface BankAccountsData {
    id: number;
    bank_name: string;
    account_holder_name: string;
    address: string;
    branch: string;
    branch_code: string;
    account_no: string;
    ifsc: string;
}

const BankDetails = () => {

    const [refreshData, setRefreshData] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const [custData, setUserData] = useState<BankAccountsData>({
        id: 0,
        bank_name: '',
        account_holder_name: '',
        address: '', branch: '',
        branch_code: '',
        account_no: '',
        ifsc: ''
    });

    const [loading, setLoading] = useState<boolean>(false);
    const [validated, setValidated] = useState<boolean>(false);


    const handleSuccess = () => {
        // Refresh data or perform any other action after successful submission
        setRefreshData(prev => !prev); // Toggle state to trigger re-fetch
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

        setValidated(true);
        setLoading(true);
        const apiCall = axiosInstance.post(`/updateBankDetails`,  {
                bank_name: custData.bank_name,
                account_holder_name: custData.account_holder_name,
                address: custData.address,
                branch: custData.branch,
                branch_code: custData.branch_code,
                account_no: custData.account_no,
                ifsc: custData.ifsc,
            });

        apiCall
            .then((response) => {
                swal("Success!", response.data.message, "success");
                handleSuccess();
        })
        .catch(error => swal("Error!", error.data.message, "error"))
        .finally(() => { setLoading(false); });
    };
    useEffect(() => {
        const fetchBankAccountsData = async () => {
            try {
                const response = await axiosInstance.get(`/bank-details`);
                if (response.status !== 200) {
                    throw new Error('Failed to fetch data');
                }
                const data: BankAccountsData = await response.data;
                setUserData(data);
            } catch (err: any) {
                setError(err.data.message);
            } finally {

            }
        };
        fetchBankAccountsData();
    }, [refreshData]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setUserData({ ...custData, [name]: value });
    };

    if (error) return <div>Error: {error}</div>;

    return (
        <>
            <h2 className="mb-5">Bank Details</h2>
            <Card>
                <Card.Body>
                    <Form noValidate validated={validated} onSubmit={handleSubmit}>
                        <Modal.Body>
                            <Form.Control type="hidden" name="id" value={custData.id} />
                            <Row className="mb-3 g-3">
                                <Form.Group as={Col} className="mb-3" controlId="bank_name">
                                    <Form.Label>Bank Name <span className="text-danger">*</span></Form.Label>
                                    <Form.Control type="text" placeholder="Bank Name" name="bank_name" value={custData.bank_name} onChange={handleChange} required />
                                    <Form.Control.Feedback type="invalid">Please enter bank name.</Form.Control.Feedback>
                                </Form.Group>
                                <Form.Group as={Col} className="mb-3" controlId="account_holder_name">
                                    <Form.Label>Account Holder Name <span className="text-danger">*</span></Form.Label>
                                    <Form.Control type="text" placeholder="Account Holder Name" name="account_holder_name" value={custData.account_holder_name} onChange={handleChange} required />
                                    <Form.Control.Feedback type="invalid">Please enter Account Holder name.</Form.Control.Feedback>
                                </Form.Group>
                            </Row>
                            <Row className="mb-3 g-3">
                                <Form.Group as={Col} className="mb-3" controlId="branch">
                                    <Form.Label>Branch <span className="text-danger">*</span></Form.Label>
                                    <Form.Control type="text" placeholder="Branch" name="branch" value={custData.branch} onChange={handleChange} required />
                                    <Form.Control.Feedback type="invalid">Please enter branch.</Form.Control.Feedback>
                                </Form.Group>
                                <Form.Group as={Col} className="mb-3" controlId="branch_code">
                                    <Form.Label>Branch Code <span className="text-danger">*</span></Form.Label>
                                    <Form.Control type="text" placeholder="Branch code" name="branch_code" value={custData.branch_code} onChange={handleChange} required />
                                    <Form.Control.Feedback type="invalid">Please enter branch code.</Form.Control.Feedback>
                                </Form.Group>
                            </Row>
                            <Row className="mb-3 g-3">
                                <Form.Group as={Col} className="mb-3" controlId="address">
                                    <Form.Label>Address</Form.Label>
                                    <Form.Control as="textarea" rows={3} placeholder="address" name="address" value={custData.address} onChange={handleChange}/>
                                </Form.Group>
                            </Row>

                            <Row className="mb-3 g-3">
                                <Form.Group as={Col} className="mb-3" controlId="account_no">
                                    <Form.Label>Account Number <span className="text-danger">*</span></Form.Label>
                                    <Form.Control type="text" placeholder="Account Number" name="account_no" value={custData.account_no} onChange={handleChange} required />
                                    <Form.Control.Feedback type="invalid">Please enter account number.</Form.Control.Feedback>
                                </Form.Group>
                                <Form.Group as={Col} className="mb-3" controlId="ifsc">
                                    <Form.Label>IFSC <span className="text-danger">*</span></Form.Label>
                                    <Form.Control type="text" placeholder="IFSC" name="ifsc" value={custData.ifsc} onChange={handleChange} required />
                                    <Form.Control.Feedback type="invalid">Please enter IFSC.</Form.Control.Feedback>
                                </Form.Group>
                            </Row>

                        </Modal.Body>
                        <Modal.Footer className='justify-content-center'>
                            <Button variant="primary" loading={loading} loadingPosition="start" type="submit" className='mb-3'>Update</Button>
                        </Modal.Footer>
                    </Form>
                </Card.Body>
            </Card>
        </>
    );
};

export default BankDetails;
