import { faCaretLeft, faPlus } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import Button from '../../../components/base/Button';
import { useEffect, useState, ChangeEvent } from 'react';
import { Card, Col, Row, Nav, Tab } from 'react-bootstrap';
import RecruitmentCandidatesTable, { recruitmentCandidatesTableColumns } from './RecruitmentCandidatesTable';
import useAdvanceTable from '../../../hooks/useAdvanceTable';
import AdvanceTableProvider from '../../../providers/AdvanceTableProvider';
import SearchBox from '../../../components/common/SearchBox';
import axiosInstance from '../../../axios';
import RecruitmentCandidateModal  from './RecruitmentCandidateModal';
import RecruitmentCandidateViewModal  from './RecruitmentCandidateViewModal';
import { useAuth } from '../../../AuthContext';
import { useNavigate, useParams } from 'react-router-dom';
import { downloadFile } from '../../../helpers/utils';

export interface CandidatesDataType {
    id: number;
    name: string;
    qualification: string;
    experience: string;
    distance: string;
    current_salary: string;
    expected_salary: string;
    notice_period: string;
    attachment_title: string;
    attachment_id: number;
}

const RecruitmentCandidates = () => {
    const { recId } = useParams();
    const [postData, setPostData] = useState({ id: 0, post_name: '', opening_date: '', tat: '' })
    const [recruitmentCandidatesData, setRecruitmentCandidatesData] = useState<CandidatesDataType[]>([]);
    const [showModal, setShowModal] = useState<boolean>(false); //modal
    const [showViewModal, setShowViewModal] = useState<boolean>(false); //History modal
    const [refreshData, setRefreshData] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const [selectedCandidateId, setSelectedCandidateId] = useState<number | undefined>(undefined);
    const { userPermission } = useAuth(); //check userRole & permissions
    const navigate = useNavigate();

    const handleShow = (candidateId?: number) => {
        setSelectedCandidateId(candidateId);
        setShowModal(true);
    };

    const handleClose = () => setShowModal(false); //close modal function

    const handleCandidateView = (irmId?: number) => {
        setSelectedCandidateId(irmId);
        setShowViewModal(true);
    };

    const handleViewClose = () => setShowViewModal(false); //close modal function


    const handleDeleteCandidate = async (cand_id: number) => {
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
                axiosInstance.delete(`/recruitment-candidates/${cand_id}`)
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

    const handleDeleteAttachment = async ( attachment_id: number) => {
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
                axiosInstance.delete(`/deleteIrmAttachment`, {
                    data: {
                        id: attachment_id
                    }
                })
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

    const handleDownloadAttachment = async (fileName: string) => {
        try {
            // Fetch the file from the server using the upload ID
            const response = await axiosInstance.get(`/getFileDownload?filepath=uploads/recruitment/attachments/${fileName}`, {
                method: 'GET',
                responseType: 'blob',
            });
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
        } catch (error: any) {
            if (error.status === 404) {
                swal("Error!", 'File not found', "error");
            }
            console.error('Error downloading the file:', error);
        }
    };

    const handleSuccess = () => {
        // Refresh data or perform any other action after successful submission
        setRefreshData(prev => !prev); // Toggle state to trigger re-fetch
    };

    const handleSearchInputChange = (e: ChangeEvent<HTMLInputElement>) => {
        table.setGlobalFilter(e.target.value || undefined);
    };

    const handleRecruitmentList = () => {
        navigate(`/recruitment`);
    }

    const table = useAdvanceTable({
        data: recruitmentCandidatesData,
        columns: recruitmentCandidatesTableColumns(handleShow, handleDeleteCandidate, handleDeleteAttachment, handleCandidateView, handleDownloadAttachment),
        pageSize: 10,
        pagination: true,
        sortable: true,
        selection: false,
    });


    //fetch employees table data on component load and update data on edit
    useEffect(() => {
        const fetchRecruitmentData = async () => {
            try {
                const response = await axiosInstance.get(`/recruitmentCandidates/${recId}`); // Replace with your API URL
                if (response.status !== 200) {
                    throw new Error('Failed to fetch data');
                }
                const candidate_response = await response.data;
                const data: CandidatesDataType[] = candidate_response.rows;
                const post_data = candidate_response.postDetails;
                setRecruitmentCandidatesData(data);
                setPostData(post_data);
            } catch (err: any) {
                setError(err.message);
            } finally {
            }
        };
        fetchRecruitmentData();
    }, [refreshData]); // Empty array ensures this runs once on mount

    if (error) return <div>Error: {error}</div>;

    return (
        <>
            <h2 className="mb-5">Candidates</h2>
            <Card>
                <Card.Title className='p-4 pb-0 d-flex'>
                    <Col>
                        <h4>Post Name : {postData.post_name}</h4>
                    </Col>
                    <Col>
                        <h4>Opening Date : {postData.opening_date}</h4>
                    </Col>
                    <Col>
                        <h4>TAT : {postData.tat}</h4>
                    </Col>
                </Card.Title>
                <Card.Body>
                    <AdvanceTableProvider {...table}>
                        <Row className="g-3 justify-content-between my-2">
                            <Col xs="auto">
                                <div className="d-flex">
                                    <SearchBox
                                        placeholder="Search Recruitment"
                                        className="me-2"
                                        onChange={handleSearchInputChange}
                                    />
                                </div>
                            </Col>

                            <Col className="d-flex gap-2 justify-content-end">
                            {/* recruitment_candidate_create */}
                                <Button
                                    variant="info"
                                    className=""
                                    startIcon={<FontAwesomeIcon icon={faPlus} className="me-2" />}
                                    onClick={() => handleShow()}
                                >
                                    Add Candidate
                                </Button>
                                <Button
                                    variant="primary"
                                    className=""
                                    startIcon={<FontAwesomeIcon icon={faCaretLeft} className="me-2" />}
                                    onClick={() => handleRecruitmentList()}
                                >
                                    Recruitment List
                                </Button>
                            </Col>
                        </Row>
                        <RecruitmentCandidatesTable />
                    </AdvanceTableProvider>
                </Card.Body>
            </Card>

            {showModal && (
                <RecruitmentCandidateModal postId={Number(recId)} candidateId={selectedCandidateId} onHide={handleClose} onSuccess={handleSuccess} />
            )}

            {showViewModal && (
                <RecruitmentCandidateViewModal postId={Number(recId)} candidateId={selectedCandidateId} onHide={handleViewClose} />
            )}
        </>
    )
};

export default RecruitmentCandidates;
