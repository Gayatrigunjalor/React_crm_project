import { ColumnDef } from '@tanstack/react-table';
import { faEdit, faUsers } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import AdvanceTable from '../../../components/base/AdvanceTable';
import AdvanceTableFooter from '../../../components/base/AdvanceTableFooter';
import Button from '../../../components/base/Button';
import { RecruitmentDataType } from './Recruitment';
import { useAuth } from '../../../AuthContext';

export const recruitmentTableColumns = (handleShow: (userId?: number) => void, handleCandidatesList: (id: number) => void): ColumnDef<RecruitmentDataType>[] => [
    {
        accessorKey: 'post_name',
        header: () => {
            return (
                <div className="d-inline-flex flex-center">
                    <span>Post Name</span>
                </div>
            );
        },
        cell: ({ row: { original } }) => {
            const { post_name } = original;
            return (
                <span>{post_name ? post_name : ''}</span>
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
        id: 'opening_date',
        header: () => {
            return (
                <div className="d-inline-flex flex-center">
                    <span>Opening Date</span>
                </div>
            );
        },
        cell: ({ row: { original } }) => {
            const { opening_date } = original;
            return (
                <span>{opening_date}</span>
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
        id: 'tat',
        header: () => {
            return (
                <div className="d-inline-flex flex-center">
                    <span>Tat</span>
                </div>
            );
        },
        cell: ({ row: { original } }) => {
            const { tat } = original;
            return (
                <span>{tat}</span>
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
        accessorKey: 'closer_date',
        header: () => {
            return (
                <div className="d-inline-flex flex-center">
                    <span>Closer Date</span>
                </div>
            );
        },
        cell: ({ row: { original } }) => {
            const { closer_date } = original;
            return (
                <span>{closer_date ? closer_date : ''}</span>
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
        id: 'deviation',
        header: () => {
            return (
                <div className="d-inline-flex flex-center">
                    <span>Deviation</span>
                </div>
            );
        },
        cell: ({ row: { original } }) => {
            const { deviation } = original;
            return (
                <span>{deviation ? deviation : ''}</span>
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
        id: 'opening_status',
        header: () => {
            return (
                <div className="d-inline-flex flex-center">
                    <span>Opening Status</span>
                </div>
            );
        },
        cell: ({ row: { original } }) => {
            const { opening_status } = original;
            return (
                <span className={opening_status == 'Done' ? 'text-success' : 'text-dark' }>{opening_status}</span>
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
        id: 'received_amount',
        header: () => {
            return (
                <div className="d-inline-flex flex-center">
                    <span>Assignee Name</span>
                </div>
            );
        },
        cell: ({ row: { original } }) => {
            const { assignee_name } = original;
            return (
                <span>{assignee_name ? assignee_name.name : '' }</span>
            );
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
        id: 'outstanding_amount',
        header: () => {
            return (
                <div className="d-inline-flex flex-center">
                    <span>Created By</span>
                </div>
            );
        },
        cell: ({ row: { original } }) => {
            const { created_name } = original;
            return (
                <span>{created_name ? created_name.name : '' }</span>
            );
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
                    {userPermission.recruitment_edit == 1 && (
                        <Button className='text-success' variant='link' title='Edit Recruitment' onClick={() => handleShow(id)} startIcon={<FontAwesomeIcon icon={faEdit} />}></Button>
                    )}
                    {userPermission.recruitment_candidate_list == 1 && (
                        <Button className='text-info' variant='link' title='Candidates' onClick={() => handleCandidatesList(id)} startIcon={<FontAwesomeIcon icon={faUsers} />}></Button>
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

const RecruitmentTable = () => {
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

export default RecruitmentTable;
