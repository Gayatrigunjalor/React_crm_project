import { useEffect, useState, ChangeEvent } from 'react';
import { faPlus } from '@fortawesome/free-solid-svg-icons';
import { Col, Row, Card, Tab } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import useAdvanceTable from '../../../hooks/useAdvanceTable';
import AdvanceTableProvider from '../../../providers/AdvanceTableProvider';
import SearchBox from '../../../components/common/SearchBox';
import EbrcTable, { ebrcTableColumns } from './EbrcTable';
import { useAuth } from '../../../AuthContext';
import { useNavigate } from 'react-router-dom';
import Button from '../../../components/base/Button';
import axiosInstance from '../../../axios';
import { downloadFile } from '../../../helpers/utils';

export interface EbrcDataType {
    id: number;
    invoice_id: string;
    e_brc_no: string;
    e_brc_date: string;
    invoice_details: { id: number; invoice_number: string; } | null;
}
const Ebrc = () => {
    const [ebrcData, setEbrcData] = useState<EbrcDataType[]>([]);
    const [refreshData, setRefreshData] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const { userPermission } = useAuth(); //check userRole & permissions
    const navigate = useNavigate();

    const handleCreateEbrc = () => {
        navigate(`/ebrc/create`);
    };

    const handleEbrcEdit = (ebrcId: number) => {
        navigate(`/ebrc/create/${ebrcId}`);
    };

    const handleSearchInputChange = (e: ChangeEvent<HTMLInputElement>) => {
        table.setGlobalFilter(e.target.value || undefined);
    };

    const table = useAdvanceTable({
        data: ebrcData,
        columns: ebrcTableColumns(handleEbrcEdit),
        pageSize: 10,
        pagination: true,
        sortable: true,
        selection: false,
    });
    useEffect(() => {
        const fetchOutwardData = async () => {
            try {
                const response = await axiosInstance.get('/ebrc'); // Replace with your API URL
                if (response.status !== 200) {
                    throw new Error('Failed to fetch data');
                }
                const data: EbrcDataType[] = await response.data;
                setEbrcData(data);
            } catch (err: any) {
                setError(err.message);
            } finally {
            }
        };
        fetchOutwardData();
    }, [refreshData]); // Empty array ensures this runs once on mount

    if (error) return <div>Error: {error}</div>;
    return (
        <>
            <h2 className="mb-5">E-Brc</h2>
            <Card className='border border-translucent'>
                <Row className='p-4'>
                    <Col>
                        <AdvanceTableProvider {...table}>
                            <Row className="g-3 justify-content-between my-2">
                                <Col xs="auto">
                                    <div className="d-flex">
                                        <SearchBox
                                            placeholder="Search ebrc"
                                            className="me-2"
                                            onChange={handleSearchInputChange}
                                        />
                                    </div>
                                </Col>
                                <Col className="d-flex justify-content-end">
                                    {userPermission.warehouse_create == 1 && (
                                        <Button
                                        variant="primary"
                                        className=""
                                        startIcon={<FontAwesomeIcon icon={faPlus} className="me-2" />}
                                        onClick={() => handleCreateEbrc()}
                                        >
                                            Create Ebrc
                                        </Button>
                                    )}
                                </Col>
                            </Row>
                            <EbrcTable />
                        </AdvanceTableProvider>
                    </Col>
                </Row>
            </Card>
        </>
    )
};

export default Ebrc;
