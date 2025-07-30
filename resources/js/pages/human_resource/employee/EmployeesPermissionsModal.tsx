import React, { useEffect, useState } from 'react';
import { Form, Modal, Table, Button } from 'react-bootstrap';
import axiosInstance from '../../../axios';
import swal from 'sweetalert';

const EmployeesPermissionsModal = ({ userId, onHide, onSuccess }) => {
    console.log('userId:', userId);
    const [permissions, setPermissions] = useState({});
    const [updatedPermissions, setUpdatedPermissions] = useState({});

    useEffect(() => {
        const fetchPermissionsData = async () => {
            const token = localStorage.getItem('token');
            const cleanToken = token && token.split('|')[1];

            const params = { id: userId };
            try {
                const response = await axiosInstance.get(`/editPermission`, {
                    headers: {
                        Authorization: `Bearer ${cleanToken}`,
                    },
                    params: params,
                });

                if (response.status === 200) {
                    const permissionsData = response.data.row;
                    if (permissionsData === null) {
                        // If permissions data is null, set default values
                        const defaultPermissions = formNames.reduce((acc, formName) => {
                            const formKey = formName.toLowerCase().replace(/\s+/g, '_');
                            acc[`${formKey}_list`] = 0;
                            acc[`${formKey}_create`] = 0;
                            acc[`${formKey}_edit`] = 0;
                            acc[`${formKey}_delete`] = 0;
                            return acc;
                        }, {});
                        setPermissions(defaultPermissions);
                        setUpdatedPermissions(defaultPermissions);
                    } else {
                        setPermissions(permissionsData);
                        setUpdatedPermissions({ ...permissionsData });
                    }
                } else {
                    throw new Error('Failed to fetch data');
                }
            } catch (err) {
                console.error(err.message);
            }
        };

        fetchPermissionsData();
    }, [userId]);

    const handleCheckboxChange = (field) => {
        console.log('field:', field);
        setUpdatedPermissions((prevState) => ({
            ...prevState,
            [field]: prevState[field] === 1 ? 0 : 1,
        }));
    };

    const handleUpdatePermissions = async () => {
        const token = localStorage.getItem('token');
        const cleanToken = token && token.split('|')[1];
        try {
            const response = await axiosInstance.post(
                `/updatePermission?user_id=${userId}`,
                updatedPermissions,
                {
                    headers: {
                        Authorization: `Bearer ${cleanToken}`,
                    },
                }
            );

            if (response.status === 200) {
                onSuccess(); // Call the success callback
                onHide(); // Close the modal
                swal("Success!", response.data.message, "success");
            }
        } catch (err) {
            console.error(err.message);
            swal("Error!", err.data.message, "error");
        }
    };


    const formLabelMapping = {
        "Quotation": "Proforma Invoice",
        "Lead": "Sales Matrix",
        "Invoice":"International Trade"
    };

    const formNames = [
        "Customer",
        "Contact Person",
        "Consignee",
        "Customer Attachment",
        "Employee",
        "Recruitment",
        "Recruitment Attachment",
        "Recruitment Candidate",
        "Quotation",
        "Vendor",
        "Vendor Contact",
        "Vendor Attachment",
        "Product",
        "Product Vendor",
        "Product Attachment",
        "Purchase Order",
        "Procurement",
        "Procurement Vendor",
        "Procurement Attachment",
        "Directory",
        "IRM",
        "Invoice",
        "Compliance",
        "Examine",
        "Regulatory",
        "EBRC",
        "Vendor Purchase",
        "Business Task",
        "Warehouse",
        "Lead",
        "Customer View",
        "Assignee Lead",
        "Assign Lead",
        'Lead Source',
        'Prev Stage',
        "Asset Type",
        "Assets",
        "Attachment",
        "Bank Account",
        "Bank Details",
        "Business Task",
        "Business Task Team",
        "Business Task View",
        "Category",
        "Company Details",
        "Credentials",
        "Currency",
        "Customer Base",
        "Customer Type",
        "Department",
        "Designation",
        "Entity Type",
        "FFD",
        "FFD Contact",
        "GST Percent",
        "HSN Code",
        "Inco Terms",
        "KPI",
        "Location Detail",
        "Product Condition",
        "Product Type",
        "Role",
        "Segment",
        "Stages",
        "Terms and Conditions",
        "Unit of Measurement",
        "Vendor Behavior",
        "Vendor Type"

    ];

    return (
        <Modal show onHide={onHide} size="xl" centered>
            <Modal.Header closeButton>
                <Modal.Title>Edit Permissions</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
                    <Table striped bordered hover responsive style={{ width: '100%' }}>
                        <thead style={{ position: 'sticky', top: '0', zIndex: '10' }}>
                            <tr>
                                <th>Form Name</th>
                                <th>List</th>
                                <th>Create</th>
                                <th>Update</th>
                                <th>Delete</th>
                            </tr>
                        </thead>
                        <tbody>
                            {formNames.map((formName, index) => {
                                const formKey = formName.toLowerCase().replace(/\s+/g, '_');
                                const displayName = formLabelMapping[formName] || formName; // Use the mapped label
                                return (
                                    <React.Fragment key={index}>
                                        <tr>
                                            {/* <td>{formName}</td> */}
                                            <td>{displayName}</td>
                                            <td>
                                                <Form.Check
                                                    type="checkbox"
                                                    checked={updatedPermissions[`${formKey}_list`] === 1}
                                                    onChange={() => handleCheckboxChange(`${formKey}_list`)}
                                                />
                                            </td>
                                            <td>
                                                {formName !== "IRM" && (
                                                    <Form.Check
                                                        type="checkbox"
                                                        checked={updatedPermissions[`${formKey}_create`] === 1}
                                                        onChange={() => handleCheckboxChange(`${formKey}_create`)}
                                                    />
                                                )}
                                            </td>
                                            <td>
                                                {formName !== "IRM" && (
                                                    <Form.Check
                                                        type="checkbox"
                                                        checked={updatedPermissions[`${formKey}_edit`] === 1}
                                                        onChange={() => handleCheckboxChange(`${formKey}_edit`)}
                                                    />
                                                )}
                                            </td>
                                            <td>
                                                {formName !== "IRM" && (
                                                    <Form.Check
                                                        type="checkbox"
                                                        checked={updatedPermissions[`${formKey}_delete`] === 1}
                                                        onChange={() => handleCheckboxChange(`${formKey}_delete`)}
                                                    />
                                                )}
                                            </td>
                                        </tr>

                                        {formName === "Warehouse" && (
                                            <tr key="salesMarix-row">
                                                <td
                                                    colSpan={6}
                                                    style={{
                                                        backgroundColor: 'darkred',
                                                        color: 'white',
                                                        textAlign: 'center',
                                                        fontWeight: 'bold',
                                                    }}
                                                >
                                                    --------- SALES MATRIX ---------
                                                </td>
                                            </tr>
                                        )}

                                        {formName === "Prev Stage" && (
                                            <tr key="master-row">
                                                <td
                                                    colSpan={6}
                                                    style={{
                                                        backgroundColor: 'darkred',
                                                        color: 'white',
                                                        textAlign: 'center',
                                                        fontWeight: 'bold',
                                                    }}
                                                >
                                                    --------- Master ---------
                                                </td>
                                            </tr>
                                        )}
                                    </React.Fragment>
                                );
                            })}
                        </tbody>
                    </Table>
                </div>
            </Modal.Body>
            <Modal.Footer>
                <Button variant="secondary" onClick={onHide}>
                    Close
                </Button>
                <Button variant="success" onClick={handleUpdatePermissions}>
                    Update Permissions
                </Button>
            </Modal.Footer>
        </Modal>
    );
};

export default EmployeesPermissionsModal;
