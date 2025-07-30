import { faPlus } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import Button from '../../components/base/Button';
import { useEffect, useState, ChangeEvent } from 'react';
import { Col, Row, Nav, Tab } from 'react-bootstrap';
import DirectoriesTable, { directoriesTableColumns } from './DirectoriesTable';
import useAdvanceTable from '../../hooks/useAdvanceTable';
import AdvanceTableProvider from '../../providers/AdvanceTableProvider';
import SearchBox from '../../components/common/SearchBox';
import axiosInstance from '../../axios';
import DirectoryModal  from './DirectoryModal';
import { useAuth } from '../../AuthContext';
import { useNavigate } from 'react-router-dom';

export interface DirectoryData {
    id: number;
    company_name: string;
    services: string;
    address: string;
    company_email: string;
    website: string;
    current_status: string;
    business_card: string;
    any_disputes: string;
    contact_person: string;
    designation: string;
    contact_number: string;
    email: string;
    alternate_contact_number: string;
    brand_name: string;
    collaboration_interest: string;
    created_name: { id: number, name: string; }
    created_at: string;
}

const Directories = () => {
    const [directoryData, setDirectoryData] = useState<DirectoryData[]>([]);
    const [showModal, setShowModal] = useState<boolean>(false); //modal
    const [showViewModal, setShowViewModal] = useState<boolean>(false); //View modal
    const [refreshData, setRefreshData] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const [selectedIrmId, setSelectedIrmId] = useState<number | undefined>(undefined);
    const { userPermission } = useAuth(); //check userRole & permissions
    const navigate = useNavigate();

    const handleShow = (dirId?: number) => {
        setSelectedIrmId(dirId);
        setShowModal(true);
    };

    const handleClose = () => setShowModal(false); //close modal function

    const handleViewDirectory = (dirId?: number) => {
        setSelectedIrmId(dirId);
        setShowViewModal(true);
    };

    const handleHistoryClose = () => setShowViewModal(false); //close modal function

    const handleTaskCheckbox = (empId: number) => {
        console.log(empId);
    };

    const handleSuccess = () => {
        // Refresh data or perform any other action after successful submission
        setRefreshData(prev => !prev); // Toggle state to trigger re-fetch
    };

    // const handleDeleteAttachment = async ( attachment_id: number,  irm_id: number) => {
    //     swal({
    //         title: "Are you sure?",
    //         text: "Once deleted, you will not be able to recover this record!",
    //         icon: "warning",
    //         buttons: {
    //             confirm: {
    //                 text: "Delete",
    //                 value: true,
    //                 visible: true,
    //                 className: "",
    //                 closeModal: true
    //             },
    //             cancel: {
    //                 text: "Cancel",
    //                 value: null,
    //                 visible: true,
    //                 className: "",
    //                 closeModal: true,
    //             }
    //         },
    //         dangerMode: true,
    //     })
    //     .then((willDelete) => {
    //         if (willDelete) {
    //             axiosInstance.delete(`/deleteIrmAttachment`, {
    //                 data: {
    //                     id: attachment_id,
    //                     irm_id: irm_id
    //                 }
    //             })
    //             .then(response => {
    //                 swal("Success!", response.data.message, "success");
    //                 handleSuccess();
    //             })
    //             .catch(error => {
    //                 swal("Error!", error.data.message, "error");
    //             });
    //         } else {
    //             swal("Your record is safe!");
    //         }
    //     });
    // };


    const handleSearchInputChange = (e: ChangeEvent<HTMLInputElement>) => {
        table.setGlobalFilter(e.target.value || undefined);
    };

    const table = useAdvanceTable({
        data: directoryData,
        columns: directoriesTableColumns(handleShow,handleViewDirectory),
        pageSize: 10,
        pagination: true,
        sortable: true,
        selection: false,
    });


    //fetch employees table data on component load and update data on edit
    useEffect(() => {
        const fetchDirectoriesData = async () => {
            try {
                const response = await axiosInstance.get('/directories'); // Replace with your API URL
                if (response.status !== 200) {
                    throw new Error('Failed to fetch data');
                }
                const data: DirectoryData[] = await response.data;
                setDirectoryData(data);
            } catch (err: any) {
                setError(err.message);
            } finally {
            }
        };
        fetchDirectoriesData();
    }, [refreshData]); // Empty array ensures this runs once on mount

    if (error) return <div>Error: {error}</div>;

    return (
        <>
            <h2 className="mb-5">Directories</h2>

            <AdvanceTableProvider {...table}>
                <Row className="g-3 justify-content-between my-2">
                    <Col xs="auto">
                        <div className="d-flex">
                            <SearchBox
                                placeholder="Search Directory"
                                className="me-2"
                                onChange={handleSearchInputChange}
                            />
                        </div>
                    </Col>

                    <Col className="d-flex justify-content-end">
                        <Button
                            variant="primary"
                            className=""
                            startIcon={<FontAwesomeIcon icon={faPlus} className="me-2" />}
                            onClick={() => handleShow()}
                        >
                            Add New Directory
                        </Button>
                    </Col>
                </Row>
                <DirectoriesTable />
            </AdvanceTableProvider>

            {showModal && (
                <DirectoryModal dirId={selectedIrmId} viewPurpose={false} onHide={handleClose} onSuccess={handleSuccess} />
            )}

            {showViewModal && (
                <DirectoryModal dirId={selectedIrmId} viewPurpose={true} onHide={handleHistoryClose} onSuccess={handleSuccess} />
            )}
        </>
    )
};

export default Directories;
