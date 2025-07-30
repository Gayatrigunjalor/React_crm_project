import { ColumnDef } from '@tanstack/react-table';
import { faEdit, faUsers, faDownload, faEye, faTrash } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import AdvanceTable from '../../../components/base/AdvanceTable';
import AdvanceTableFooter from '../../../components/base/AdvanceTableFooter';
import Button from '../../../components/base/Button';
import { CandidatesDataType } from './RecruitmentCandidates';
import { useAuth } from '../../../AuthContext';

export const recruitmentCandidatesTableColumns = (handleShow: (userId?: number) => void, handleDeleteCandidate: (userId: number) => void, handleDeleteAttachment: (userId: number) => void, handleCandidateView: (userId: number) => void, handleDownload: (fileName: string) => void): ColumnDef<CandidatesDataType>[] => [
    {
        accessorKey: 'index',
        header: () => {
            return (
                <div className="d-inline-flex flex-center">
                    <span>Sr. No.</span>
                </div>
            );
        },
        cell: ({ row: { original } }) => {
            const { id } = original;
            return (
                <span>{id}</span>
            );
        },

        meta: {
            headerProps: {
                className: 'ps-2 pe-2 border-start border-end border-translucent'
            },
            cellProps: {
                className: 'white-space-nowrap fw-semibold ps-2 border-start border-end border-translucent'
            }
        }
    },
    {
        id: 'name',
        header: () => {
            return (
                <div className="d-inline-flex flex-center">
                    <span>Name of candidate</span>
                </div>
            );
        },
        cell: ({ row: { original } }) => {
            const { name } = original;
            return (
                <span>{name}</span>
            );
        },
        meta: {
            headerProps: {
                className: 'ps-2 pe-2 border-end border-translucent'
            },
            cellProps: {
                className: 'white-space-nowrap fw-semibold ps-2 border-end border-translucent'
            }
        }
    },
    {
        id: 'qualification',
        header: () => {
            return (
                <div className="d-inline-flex flex-center">
                    <span>Qualification</span>
                </div>
            );
        },
        cell: ({ row: { original } }) => {
            const { qualification } = original;
            return (
                <span>{qualification}</span>
            );
        },
        meta: {
            headerProps: {
                className: 'ps-2 pe-2 border-end border-translucent'
            },
            cellProps: {
                className: 'white-space-nowrap ps-2 border-end border-translucent'
            }
        },
    },
    {
        id: 'experience',
        header: () => {
            return (
                <div className="d-inline-flex flex-center">
                    <span>Experience</span>
                </div>
            );
        },
        cell: ({ row: { original } }) => {
            const { experience } = original;
            return (
                <span>{experience}</span>
            );
        },
        meta: {
            headerProps: {
                className: 'ps-2 pe-2 border-end border-translucent'
            },
            cellProps: {
                className: 'white-space-nowrap ps-2 border-end border-translucent'
            }
        },
    },
    {
        id: 'distance',
        header: () => {
            return (
                <div className="d-inline-flex flex-center">
                    <span>Distance</span>
                </div>
            );
        },
        cell: ({ row: { original } }) => {
            const { distance } = original;
            return (
                <span>{distance}</span>
            );
        },
        meta: {
            headerProps: {
                className: 'ps-2 pe-2 border-end border-translucent'
            },
            cellProps: {
                className: 'white-space-nowrap ps-2 border-end border-translucent'
            }
        },
    },
    {
        accessorKey: 'current_salary',
        header: () => {
            return (
                <div className="d-inline-flex flex-center">
                    <span>Current Salary</span>
                </div>
            );
        },
        cell: ({ row: { original } }) => {
            const { current_salary } = original;
            return (
                <span>{current_salary ? current_salary : ''}</span>
            );
        },
        meta: {
            headerProps: {

                className: 'ps-2 pe-2 border-end border-translucent'
            },
            cellProps: {
                className: 'white-space-nowrap fw-semibold ps-2 border-end border-translucent'
            }
        }
    },
    {
        id: 'expected_salary',
        header: () => {
            return (
                <div className="d-inline-flex flex-center">
                    <span>Expected Salary</span>
                </div>
            );
        },
        cell: ({ row: { original } }) => {
            const { expected_salary } = original;
            return (
                <span>{expected_salary ? expected_salary : ''}</span>
            );
        },
        meta: {
            headerProps: {
                className: 'ps-2 pe-2 border-end border-translucent'
            },
            cellProps: {
                className: 'white-space-nowrap ps-2 border-end border-translucent'
            }
        },
    },
    {
        id: 'notice_period',
        header: () => {
            return (
                <div className="d-inline-flex flex-center">
                    <span>Notice Period</span>
                </div>
            );
        },
        cell: ({ row: { original } }) => {
            const { notice_period } = original;
            return (
                <span>{notice_period}</span>
            );
        },
        meta: {
            headerProps: {
                className: 'ps-2 pe-2 border-end border-translucent'
            },
            cellProps: {
                className: 'ps-2 fw-semibold border-end border-translucent'
            }
        }
    },
    {
        id: 'attachment_title',
        header: () => {
            return (
                <div className="d-inline-flex flex-center">
                    <span>Attachment (CV)</span>
                </div>
            );
        },
        cell: ({ row: { original } }) => {
            const { attachment_id, attachment_title } = original;
            if(attachment_id != null){
                return (

                    <Button
                        className="text-primary p-0"
                        variant="link"
                        title="Download"
                        onClick={() => handleDownload(attachment_title)}
                        startIcon={<FontAwesomeIcon icon={faDownload} />}
                    >
                        {attachment_title}
                    </Button>
                );
            }
        },
        meta: {
            headerProps: {
                className: 'ps-2 pe-2 border-end border-translucent'
            },
            cellProps: {
                className: 'ps-2 border-end border-translucent'
            }
        }
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
            const { userPermission, empData  } = useAuth(); //check userRole & permissions
            return (
                <>
                    {userPermission.recruitment_candidate_edit == 1 && (
                        <Button className='text-success' variant='link' title='Edit Candidate' onClick={() => handleShow(id)} startIcon={<FontAwesomeIcon icon={faEdit} />}></Button>
                    )}
                    {userPermission.recruitment_candidate_delete == 1 && (
                        <Button className='text-danger' variant='link' title='Delete Candidate' onClick={() => handleDeleteCandidate(id)} startIcon={<FontAwesomeIcon icon={faTrash} />}></Button>
                    )}
                    {userPermission.recruitment_candidate_list == 1 && (
                        <Button className='text-info' variant='link' title='View Details' onClick={() => handleCandidateView(id)} startIcon={<FontAwesomeIcon icon={faEye} />}></Button>
                    )}
                </>
            );
        },
        meta: {
            headerProps: {
                className: 'ps-2 pe-2 border-start border-end border-translucent'
            },
            cellProps: {
                className: 'white-space-nowrap fw-semibold border-start ps-2 pe-2 border-end border-translucent'
            }
        }
    },
];

const RecruitmentCandidatesTable = () => {
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

export default RecruitmentCandidatesTable;
