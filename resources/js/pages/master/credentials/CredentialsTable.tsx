import React, {useState} from 'react';
import { ColumnDef } from '@tanstack/react-table';
import { Modal } from 'react-bootstrap';
import Button from '../../../components/base/Button';
import AdvanceTable from '../../../components/base/AdvanceTable';
import AdvanceTableFooter from '../../../components/base/AdvanceTableFooter';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { CredentialsDataType } from './Credentials';
import { faEdit, faTrash, faAddressBook } from '@fortawesome/free-solid-svg-icons';
import swal from 'sweetalert';
import axiosInstance from '../../../axios';

const handleDelete = (userId: number, handleSuccess: () => void) => {
    swal({
        title: "Are you sure?",
        text: "Once deleted, you will not be able to recover this record!",
        icon: "warning",
        buttons: {
            confirm: {
                text: "Delete",
                value: true,
                visible: true,
                className: "",
                closeModal: true
            },
            cancel: {
                text: "Cancel",
                value: null,
                visible: true,
                className: "",
                closeModal: true,
            }
        },
        dangerMode: true,
    })
    .then((willDelete) => {
        if (willDelete) {
            axiosInstance.delete(`/credentials/${userId}`)
            .then(response => {
                swal("Success!", response.data.message, "success");
                handleSuccess();
            })
            .catch(error => {
                swal("Error!", error.data.message, "error");
            });
        } else {
            swal("Your record is safe!");
        }
    });
};

const handleCredentialHistory = (credentialID: number, handleSuccess: () => void) => {
    axiosInstance.post(`/fetchCredentialHistory`, {
        id: credentialID
    })
    .then(response => {
        if(response.data.length > 0){
            const data = response.data;

            // Step 2: Create HTML table from the data
            let htmlTable = '<div style="width: auto; overflow-x: auto;"><table style="width:100%; border-collapse: collapse;">';
            htmlTable += '<thead><tr>';

            // Assuming data is an array of objects, create headers
            htmlTable += `<th style="border: 1px solid black; padding: 4px;">Credential ID</th>
            <th style="border: 1px solid black; padding: 4px;">Website Name</th>
            <th style="border: 1px solid black; padding: 4px;">Website Functioning</th>
            <th style="border: 1px solid black; padding: 4px;">Assigned To</th>
            <th style="border: 1px solid black; padding: 4px;">Assigned On</th>
            <th style="border: 1px solid black; padding: 4px;">Handover Date</th>
            <th style="border: 1px solid black; padding: 4px;">Remarks</th>`;
            htmlTable += '</tr></thead><tbody>';

            // Populate rows
            data.forEach(item => {
                htmlTable += '<tr>';
                htmlTable += `<td style="border: 1px solid black; padding: 8px;">${item.credential.cred_id}</td>
                <td style="border: 1px solid black; padding: 8px;">${item.credential.website_name}</td>
                <td style="border: 1px solid black; padding: 8px;">${item.credential.website_fxn}</td>
                <td style="border: 1px solid black; padding: 8px;">${item.employee.name}</td>
                <td style="border: 1px solid black; padding: 8px;">${item.assigned_on}</td>
                <td style="border: 1px solid black; padding: 8px;">${item.handover_date != null ? item.handover_date : ''}</td>
                <td style="border: 1px solid black; padding: 8px;">${item.remarks}</td>`;

                htmlTable += '</tr>';
            });

            htmlTable += '</tbody></table></div>';
            // Step 3: Display the table in SweetAlert
            swal({
                title: "API Data",
                className: "w-70",
                content: {
                    element: "div",
                    attributes: {
                        innerHTML: htmlTable,
                    },
                },
            });
        } else {
            swal("No history!", 'Credential not assigned to anyone yet.', "warning");
        }
    })
    .catch(error => {
        swal("Error!", error.data.message, "error");
    });
};



export const credentialsTableColumns = ( handleShow: (userId?: number) => void, handleSuccess: () => void): ColumnDef<CredentialsDataType>[] => [
    {
        accessorKey: 'index',
        header: () => {
            return (
                <div className="d-inline-flex flex-center">
                    <span>#</span>
                </div>
            );
        },
        cell: ({ row }) => {
            return (
                <span>{row.index + 1}</span> // Adding 1 to start the index from 1 instead of 0
            );
        },
        meta: {
            headerProps: {
                style: { width: '5%' },
                className: 'ps-2 pe-2 border-start border-end border-translucent'
            },
            cellProps: {
                className:
                'ps-2 border-start border-end border-translucent'
            }
        }
    },
    {
        id: 'cred_id',
        header: () => {
            return (
                <div className="d-inline-flex flex-center">
                    <span>Cred ID</span>
                </div>
            );
        },
        meta: {
            headerProps: {
                className: 'ps-2 pe-2 border-end border-translucent'
            },
            cellProps: {
                className:
                'ps-2 border-end border-translucent'
            }
        },
        accessorFn: ({ cred_id }) => cred_id
    },
    {
        accessorKey: 'website_name',
        header: () => {
            return (
                <div className="d-inline-flex flex-center">
                    <span>Website Name</span>
                </div>
            );
        },
        cell: ({ row: { original } }) => {
            const { website_name } = original;
            return (
                <span>{website_name}</span>
            );
        },
        meta: {
            headerProps: {
                style: { width: '15%' },
                className: 'ps-2 pe-2 border-end border-translucent'
            },
            cellProps: {
                className:
                'white-space-nowrap ps-2 border-end border-translucent'
            }
        }
    },
    {
        id: 'website_fxn',
        header: () => {
            return (
                <div className="d-inline-flex flex-center">
                    <span>Website Functioning</span>
                </div>
            );
        },
        meta: {
            headerProps: {
                className: 'ps-2 pe-2 border-end border-translucent'
            },
            cellProps: {
                className:
                'ps-2 border-end border-translucent'
            }
        },
        accessorFn: ({ website_fxn }) => website_fxn
    },
    {
        id: 'username',
        header: () => {
            return (
                <div className="d-inline-flex flex-center">
                    <span>Username</span>
                </div>
            );
        },
        meta: {
            headerProps: {
                className: 'ps-2 pe-2 border-end border-translucent'
            },
            cellProps: {
                className:
                'ps-2 border-end border-translucent'
            }
        },
        accessorFn: ({ username }) => username
    },
    {
        id: 'email_regd',
        header: () => {
            return (
                <div className="d-inline-flex flex-center">
                    <span>Email Regd</span>
                </div>
            );
        },
        meta: {
            headerProps: {
                className: 'ps-2 pe-2 border-end border-translucent'
            },
            cellProps: {
                className:
                'ps-2 border-end border-translucent'
            }
        },
        accessorFn: ({ email_regd }) => email_regd
    },
    {
        id: 'phone_regd',
        header: () => {
            return (
                <div className="d-inline-flex flex-center">
                    <span>Phone Regd</span>
                </div>
            );
        },
        meta: {
            headerProps: {
                className: 'ps-2 pe-2 border-end border-translucent'
            },
            cellProps: {
                className:
                'ps-2 border-end border-translucent'
            }
        },
        accessorFn: ({ phone_regd }) => phone_regd
    },
    {
        id: 'mfa_by',
        header: () => {
            return (
                <div className="d-inline-flex flex-center">
                    <span>MFA By</span>
                </div>
            );
        },
        meta: {
            headerProps: {
                className: 'ps-2 pe-2 border-end border-translucent'
            },
            cellProps: {
                className:
                'ps-2 border-end border-translucent'
            }
        },
        accessorFn: ({ mfa_by }) => mfa_by
    },
    {
        id: 'subscription_type',
        header: () => {
            return (
                <div className="d-inline-flex flex-center">
                    <span>Subscription Type</span>
                </div>
            );
        },
        meta: {
            headerProps: {
                className: 'ps-2 pe-2 border-end border-translucent'
            },
            cellProps: {
                className:
                'ps-2 border-end border-translucent'
            }
        },
        accessorFn: ({ subscription_type }) => subscription_type
    },
    {
        id: 'purchase_date',
        header: () => {
            return (
                <div className="d-inline-flex flex-center">
                    <span>Purchase Date</span>
                </div>
            );
        },
        meta: {
            headerProps: {
                className: 'ps-2 pe-2 border-end border-translucent'
            },
            cellProps: {
                className:
                'ps-2 border-end border-translucent'
            }
        },
        accessorFn: ({ purchase_date }) => purchase_date
    },
    {
        id: 'renew_date',
        header: () => {
            return (
                <div className="d-inline-flex flex-center">
                    <span>Renewal Date</span>
                </div>
            );
        },
        meta: {
            headerProps: {
                className: 'ps-2 pe-2 border-end border-translucent'
            },
            cellProps: {
                className:
                'ps-2 border-end border-translucent'
            }
        },
        accessorFn: ({ renew_date }) => renew_date
    },
    {
        id: 'actions',
        header: () => {
            return (
                <div className="d-inline-flex flex-center">
                    <span>Actions</span>
                </div>
            );
        },
        cell: ({ row: { original } }) => {
            const { id } = original;
            return (
                <div className="d-flex align-items-center gap-2">
                    <Button variant='phoenix-info' onClick={() => handleShow(id)} startIcon={<FontAwesomeIcon icon={faEdit} />}></Button>
                    <Button variant="phoenix-danger" onClick={() => handleDelete(id, handleSuccess)}>
                        <FontAwesomeIcon icon={faTrash} />
                    </Button>
                    <Button variant="phoenix-success" onClick={() => handleCredentialHistory(id, handleSuccess)}>
                        <FontAwesomeIcon icon={faAddressBook} />
                    </Button>
                </div>
            );
        },
        meta: {
            headerProps: {
                style: { width: '15%' },
                className: 'ps-2 pe-2 border-end border-translucent'
            },
            cellProps: {
                className:
                'white-space-nowrap fw-semibold ps-2 border-end border-translucent'
            }
        }
    }
];
const CredentialsTable = () => {

    return (
        <div className="border-top border-translucent">
            <AdvanceTable
                tableProps={{ className: 'phoenix-table fs-9' }}
                rowClassName="hover-actions-trigger btn-reveal-trigger"
            />
            <AdvanceTableFooter pagination className="py-4" />
        </div>
    );
};

export default CredentialsTable;
