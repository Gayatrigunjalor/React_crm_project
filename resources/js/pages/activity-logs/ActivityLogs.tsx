import { useEffect, useState, ChangeEvent } from 'react';
import { Col, Row } from 'react-bootstrap';
import ActivityTable, { activityTableColumns } from './ActivityTable';
import useAdvanceTable from '../../hooks/useAdvanceTable';
import AdvanceTableProvider from '../../providers/AdvanceTableProvider';
import SearchBox from '../../components/common/SearchBox';
import axiosInstance from '../../axios';

export interface ActivityDataType {
    id: number;
    ip_address: string;
    user_agent: string;
    login_at: string;
    login_successful: string;
    logout_at: string;
    employee_details: { id: number; user_id: number; name: string; }
}

const ActivityLogs = () => {
    const [activityData, setActivityData] = useState<ActivityDataType[]>([]);
    const [error, setError] = useState<string | null>(null);

    const handleSearchInputChange = (e: ChangeEvent<HTMLInputElement>) => {
        table.setGlobalFilter(e.target.value || undefined);
    };

    const table = useAdvanceTable({
        data: activityData,
        columns: activityTableColumns(),
        pageSize: 10,
        pagination: true,
        sortable: true,
        selection: false,
    });

    //fetch Activity table data on component load and update data on edit
    useEffect(() => {
        const fetchActivityData = async () => {
            try {
                const response = await axiosInstance.get('/activityLogs'); // Replace with your API URL
                if (response.status !== 200) {
                    throw new Error('Failed to fetch data');
                }
                const data: ActivityDataType[] = await response.data;
                setActivityData(data);
            } catch (err: any) {
                setError(err.message);
            } finally {
            }
        };
        fetchActivityData();
    }, []); // Empty array ensures this runs once on mount

    if (error) return <div>Error: {error}</div>;

    return (
        <>
            <h2 className="mb-5">Activity Logs</h2>

            <AdvanceTableProvider {...table}>
                <Row className="g-3 justify-content-between my-2">
                    <Col xs="auto">
                        <div className="d-flex">
                            <SearchBox
                                placeholder="Search Activity"
                                className="me-2"
                                onChange={handleSearchInputChange}
                            />
                        </div>
                    </Col>

                </Row>
                <ActivityTable />
            </AdvanceTableProvider>
        </>
    )
};

export default ActivityLogs;