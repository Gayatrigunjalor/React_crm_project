import React, { useEffect, useState } from 'react';
import { Modal, Col, Row } from 'react-bootstrap';
import Button from '../../../components/base/Button';
import axiosInstance from '../../../axios';

interface FormData {
    id?: number;
    asset: { asset_id: string; asset_name: string; asset_desc: string; }
    employee: { name: string; }
    employee_id: string;
    assigned_on: string;
    handover_date: string;
    remarks: string;

}
// Define the component props, ensuring assetTypeData is typed as AssetTypeDataType[]
interface AssetsModalProps {
    userId?: number;
    onHide: () => void;
}
export interface AssetTypeDataType {
    id: number;
    name: string;
};
export interface VendorsDataInterface {
    id: number;
    name: string;
};
const AssetHistoryModal: React.FC<AssetsModalProps> = ({ userId, onHide }) => {
    const [assetsData, setAssetsData] = useState<FormData[]>([]);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchData = async () => {
            if (userId) {
                try {
                    const response = await axiosInstance.post(`/fetchAssetHistory`,{
                        id: userId
                    });
                    if (response.status !== 200) {
                        throw new Error('Failed to fetch data');
                    }
                    const data: FormData[] = response.data;
                    setAssetsData(data);
                } catch (err: any) {
                    setError(err.data.message);
                }
            }
        };
        fetchData();
    }, [userId]);


    return (
        <>
            <Modal show onHide={onHide} size="xl" backdrop="static" keyboard={false}>
                <Modal.Header closeButton>
                    <Modal.Title>Assets History</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Row className='border-bottom border-gray-200 mb-3'>
                        <Col md={12}>
                            <table className='fs-8 table striped bordered mb-4'>
                                <thead>
                                    <tr>
                                        <th className='p-2 border border-secondary'>Sr No.</th>
                                        <th className='p-2 border border-secondary'>Asset ID</th>
                                        <th className='p-2 border border-secondary'>Asset Name</th>
                                        <th className='p-2 border border-secondary'>Asset Desc</th>
                                        <th className='p-2 border border-secondary'>Assigned To</th>
                                        <th className='p-2 border border-secondary'>Assigned On</th>
                                        <th className='p-2 border border-secondary'>Handover Date</th>
                                        <th className='p-2 border border-secondary'>Remarks</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {assetsData.length > 0 ? assetsData.map((data, index) => (
                                        <tr key={index}>
                                            <td className='p-2 border border-secondary'>{index + 1}</td>
                                            <td className='p-2 border border-secondary'>{data.asset.asset_id}</td>
                                            <td className='p-2 border border-secondary'>{data.asset.asset_name}</td>
                                            <td className='p-2 border border-secondary'>{data.asset.asset_desc}</td>
                                            <td className='p-2 border border-secondary'>{data.employee.name}</td>
                                            <td className='p-2 border border-secondary'>{data.assigned_on}</td>
                                            <td className='p-2 border border-secondary'>{data.handover_date ? data.handover_date : ''}</td>
                                            <td className='p-2 border border-secondary'>{data.remarks}</td>
                                        </tr>
                                    )) : (
                                        <tr>
                                            <td className='p-2 border border-secondary text-center' colSpan={8}> No record found</td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </Col>
                    </Row>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={onHide}>
                        Close
                    </Button>
                </Modal.Footer>
            </Modal>
        </>
    );
};

export default AssetHistoryModal;
