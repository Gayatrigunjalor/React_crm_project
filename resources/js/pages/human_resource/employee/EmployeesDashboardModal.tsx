import React, { useEffect, useState, ChangeEvent, FormEvent } from 'react';
import { Form, Modal, Col, Row } from 'react-bootstrap';
import Button from '../../../components/base/Button';
import axiosInstance from '../../../axios';
import swal from 'sweetalert';
import { useAuth } from '../../../AuthContext';
import ReactSelect from '../../../components/base/ReactSelect';
import { EmployeeListData } from './Employees';

interface FormData {
    user_id: number;
    all?: boolean | undefined;
    cns: boolean | undefined;
    click_up: boolean | undefined;
    logistics: boolean | undefined;
    business_task: boolean | undefined;
    employee_database: boolean | undefined;
    assets_credentials: boolean | undefined;
    procurement: boolean | undefined;
    recruitment: boolean | undefined;
    bt_timeline: boolean | undefined;
    edoc_timeline: boolean | undefined;
    wms_reporting: boolean | undefined;
    wms_dashboard: boolean | undefined;
    itc_view: boolean | undefined;
    sb_knock_off: boolean | undefined;
    ffd_payment_view: boolean | undefined;
    vendor_payment_view: boolean | undefined;
}

interface EmployeesModalProps {
    userId: number;
    userName: string;
    onHide: () => void;
    onSuccess: () => void;
}

const EmployeesDashboardModal: React.FC<EmployeesModalProps> = ({ userId, userName, onHide, onSuccess }) => {
    const [custData, setUserData] = useState<FormData>({
        user_id: 0,
        cns: undefined,
        click_up: undefined,
        logistics: undefined,
        business_task: undefined,
        employee_database: undefined,
        assets_credentials: undefined,
        procurement: undefined,
        recruitment: undefined,
        bt_timeline: undefined,
        edoc_timeline: undefined,
        wms_reporting: undefined,
        wms_dashboard: undefined,
        itc_view: undefined,
        sb_knock_off: undefined,
        ffd_payment_view: undefined,
        vendor_payment_view: undefined,
    });
    const [isEditing, setIsEditing] = useState<boolean>(false);
    const [validated, setValidated] = useState<boolean>(false);
    const [loading, setLoading] = useState(false);
    const { empData } = useAuth(); //check userRole & permissions


    useEffect(() => {
        setIsEditing(true);

        // Fetch employees data for editing
        axiosInstance.get(`/editDashboardPermission`,{
            params: { id: userId }
        })
        .then(response => {
            const data = response.data;

            Object.keys(data).forEach(key => {
                data[key] = Boolean(data[key]);
            });
            data.user_id = userId;
            setUserData(data);
        })
        .catch(error => swal("Error!", error.data.message, "error"));

    }, []);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, checked } = e.target;
        if (name === "all") {
            setUserData({
                ...custData,
                all: checked,
                cns: checked,
                click_up: checked,
                logistics: checked,
                business_task: checked,
                employee_database: checked,
                assets_credentials: checked,
                procurement: checked,
                recruitment: checked,
                bt_timeline: checked,
                edoc_timeline: checked,
                wms_reporting: checked,
                wms_dashboard: checked,
                itc_view: checked,
                sb_knock_off: checked,
            });
        } else {
            setUserData({ ...custData, [name]: checked });
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
        const apiCall = axiosInstance.post('/updateDashboardPermission', custData );

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
            <Modal show onHide={onHide} size="sm" backdrop="static" keyboard={false}>
                <Modal.Header closeButton>
                    <Modal.Title> Dashboard Permissions for {userName}</Modal.Title>
                </Modal.Header>
                <Form noValidate validated={validated} onSubmit={handleSubmit}>
                    <Form.Control type="hidden" name="user_id" value={custData.user_id} />
                    <Modal.Body>
                        <table>
                            <thead>
                                <th>Dashboard Name</th>
                                <th>Show/Hide</th>
                            </thead>
                            <tbody>
                                <tr>
                                    <td className="ps-2 pe-2 border border-translucent">
                                        <Form.Label>ALL</Form.Label>
                                    </td>
                                    <td className="ps-2 pe-2 border border-translucent">
                                        <Form.Check type='checkbox' name="all" checked={custData.all} onChange={handleChange} />
                                    </td>
                                </tr>
                                <tr>
                                    <td className="ps-2 pe-2 border border-translucent">
                                        <Form.Label>CNS</Form.Label>
                                    </td>
                                    <td className="ps-2 pe-2 border border-translucent">
                                        <Form.Check type='checkbox' name="cns" checked={custData.cns} onChange={handleChange} />
                                    </td>
                                </tr>
                                <tr>
                                    <td className="ps-2 pe-2 border border-translucent">
                                        <Form.Label>Click Up</Form.Label>
                                    </td>
                                    <td className="ps-2 pe-2 border border-translucent">
                                        <Form.Check type='checkbox' name="click_up" checked={custData.click_up} onChange={handleChange} />
                                    </td>
                                </tr>
                                <tr>
                                    <td className="ps-2 pe-2 border border-translucent">
                                        <Form.Label>Logistics</Form.Label>
                                    </td>
                                    <td className="ps-2 pe-2 border border-translucent">
                                        <Form.Check type='checkbox' name="logistics" checked={custData.logistics} onChange={handleChange} />
                                    </td>
                                </tr>
                                <tr>
                                    <td className="ps-2 pe-2 border border-translucent">
                                        <Form.Label>Business Task</Form.Label>
                                    </td>
                                    <td className="ps-2 pe-2 border border-translucent">
                                        <Form.Check type='checkbox' name="business_task" checked={custData.business_task} onChange={handleChange} />
                                    </td>
                                </tr>
                                <tr>
                                    <td className="ps-2 pe-2 border border-translucent">
                                        <Form.Label>Employee Database</Form.Label>
                                    </td>
                                    <td className="ps-2 pe-2 border border-translucent">
                                        <Form.Check type='checkbox' name="employee_database" checked={custData.employee_database} onChange={handleChange} />
                                    </td>
                                </tr>
                                <tr>
                                    <td className="ps-2 pe-2 border border-translucent">
                                        <Form.Label>Assets & Credentials</Form.Label>
                                    </td>
                                    <td className="ps-2 pe-2 border border-translucent">
                                        <Form.Check type='checkbox' name="assets_credentials" checked={custData.assets_credentials} onChange={handleChange} />
                                    </td>
                                </tr>
                                <tr>
                                    <td className="ps-2 pe-2 border border-translucent">
                                        <Form.Label>Procurement</Form.Label>
                                    </td>
                                    <td className="ps-2 pe-2 border border-translucent">
                                        <Form.Check type='checkbox' name="procurement" checked={custData.procurement} onChange={handleChange} />
                                    </td>
                                </tr>
                                <tr>
                                    <td className="ps-2 pe-2 border border-translucent">
                                        <Form.Label>Recruitment</Form.Label>
                                    </td>
                                    <td className="ps-2 pe-2 border border-translucent">
                                        <Form.Check type='checkbox' name="recruitment" checked={custData.recruitment} onChange={handleChange} />
                                    </td>
                                </tr>
                                <tr>
                                    <td className="ps-2 pe-2 border border-translucent">
                                        <Form.Label>Business Task Timeline</Form.Label>
                                    </td>
                                    <td className="ps-2 pe-2 border border-translucent">
                                        <Form.Check type='checkbox' name="bt_timeline" checked={custData.bt_timeline} onChange={handleChange} />
                                    </td>
                                </tr>
                                <tr>
                                    <td className="ps-2 pe-2 border border-translucent">
                                        <Form.Label>Edocs Timeline</Form.Label>
                                    </td>
                                    <td className="ps-2 pe-2 border border-translucent">
                                        <Form.Check type='checkbox' name="edoc_timeline" checked={custData.edoc_timeline} onChange={handleChange} />
                                    </td>
                                </tr>
                                <tr>
                                    <td className="ps-2 pe-2 border border-translucent">
                                        <Form.Label>WMS Reporting</Form.Label>
                                    </td>
                                    <td className="ps-2 pe-2 border border-translucent">
                                        <Form.Check type='checkbox' name="wms_reporting" checked={custData.wms_reporting} onChange={handleChange} />
                                    </td>
                                </tr>
                                <tr>
                                    <td className="ps-2 pe-2 border border-translucent">
                                        <Form.Label>WMS Dashboard</Form.Label>
                                    </td>
                                    <td className="ps-2 pe-2 border border-translucent">
                                        <Form.Check type='checkbox' name="wms_dashboard" checked={custData.wms_dashboard} onChange={handleChange} />
                                    </td>
                                </tr>
                                <tr>
                                    <td className="ps-2 pe-2 border border-translucent">
                                        <Form.Label>ITC</Form.Label>
                                    </td>
                                    <td className="ps-2 pe-2 border border-translucent">
                                        <Form.Check type='checkbox' name="itc_view" checked={custData.itc_view} onChange={handleChange} />
                                    </td>
                                </tr>
                                <tr>
                                    <td className="ps-2 pe-2 border border-translucent">
                                        <Form.Label>SB Knock Off</Form.Label>
                                    </td>
                                    <td className="ps-2 pe-2 border border-translucent">
                                        <Form.Check type='checkbox' name="sb_knock_off" checked={custData.sb_knock_off} onChange={handleChange} />
                                    </td>
                                </tr>
                                <tr>
                                    <td className="ps-2 pe-2 border border-translucent">
                                        <Form.Label>FFD Payment View</Form.Label>
                                    </td>
                                    <td className="ps-2 pe-2 border border-translucent">
                                        <Form.Check type='checkbox' name="ffd_payment_view" checked={custData.ffd_payment_view} onChange={handleChange} />
                                    </td>
                                </tr>
                                <tr>
                                    <td className="ps-2 pe-2 border border-translucent">
                                        <Form.Label>Vendor Payment View</Form.Label>
                                    </td>
                                    <td className="ps-2 pe-2 border border-translucent">
                                        <Form.Check type='checkbox' name="vendor_payment_view" checked={custData.vendor_payment_view} onChange={handleChange} />
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </Modal.Body>
                    <Modal.Footer>
                        <Button variant="secondary" onClick={onHide}>
                            Close
                        </Button>
                        <Button variant="primary" loading={loading} loadingPosition="start" type="submit">{isEditing ? 'Update Permission' : 'Add'}</Button>
                    </Modal.Footer>
                </Form>
            </Modal>
        </>
    );
};

export default EmployeesDashboardModal;
