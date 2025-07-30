import React, { useEffect, useState, ChangeEvent, FormEvent } from 'react';
import { Form, Modal, Col, Row } from 'react-bootstrap';
import Button from '../../../components/base/Button';
import axiosInstance from '../../../axios';
import swal from 'sweetalert';
import ReactSelect from '../../../components/base/ReactSelect';

interface FormData {
    id?: number;
    asset_name: string;
    asset_id: string;
    asset_desc: string;
    asset_type: { id: number; name: string; } | null;
    asset_type_id: number;
    vendors: { id: number; name: string; } | null;
    vendor_id: number;
    purchase_date: string;
    warranty_exp_date: string;
    warranty_card: File | null;
    invoice_file: File | null;
    warranty_attachments?: string
    invoice_attachments?: string
}
// Define the component props, ensuring assetTypeData is typed as AssetTypeDataType[]
interface AssetsModalProps {
    userId?: number;
    onHide: () => void;
    onSuccess: () => void;
}
export interface AssetTypeDataType {
    id: number;
    name: string;
};
export interface VendorsDataInterface {
    id: number;
    name: string;
};
const AssetsModal: React.FC<AssetsModalProps> = ({ userId, onHide, onSuccess }) => {
    const [assetsData, setAssetsData] = useState<FormData>({
        id: 0,
        asset_name: '',
        asset_id: '',
        asset_desc: '',
        asset_type: null,
        asset_type_id: 0,
        vendors: null,
        vendor_id: 0,
        purchase_date: '',
        warranty_exp_date: '',
        warranty_card: null,
        invoice_file: null
    });
    const [isEditing, setIsEditing] = useState<boolean>(false);
    const [validated, setValidated] = useState<boolean>(false);
    const [loading, setLoading] = useState(false);
    const [assetTypeData, setAssetTypeData] = useState<AssetTypeDataType[]>([]);
    const [vendorsData, setVendorsData] = useState<VendorsDataInterface[]>([]);

    useEffect(() => {

        if (userId) {
            setIsEditing(true);
            // Fetch assets data for editing
            axiosInstance.get(`/assets/${userId}`)
            .then(response => {
                setAssetsData(response.data);
            })
            .catch(error => console.error('Error fetching assets data:', error));
        } else{
            const fetchAssetId = async () => {
                try {
                    const response = await axiosInstance.get(`/getAssetID`);
                    if (response.status !== 200) {
                        throw new Error('Failed to fetch data');
                    }
                    const asset_id_data = await response.data;
                    setAssetsData({...assetsData, asset_id: asset_id_data });
                } catch (err: any) {
                    // setError(err.message);
                } finally {

                }
            };
            fetchAssetId();
        }
    }, []);

    useEffect(() => {
        const fetchAssetType = async () => {
            try {
                const response = await axiosInstance.get('/asset-type');
                if (response.status !== 200) {
                    throw new Error('Failed to fetch data');
                }
                const assetTypeDt: AssetTypeDataType[] = await response.data;
                setAssetTypeData(assetTypeDt);
            } catch (err: any) {
                // setError(err.message);
            } finally {

            }
        };
        
        const fetchVendorsData = async () => {
            try {
                const response = await axiosInstance.get(`/vendorsList/${'asc'}`);
                if (response.status !== 200) {
                    throw new Error('Failed to fetch data');
                }
                const vendors_data: VendorsDataInterface[] = await response.data;
                setVendorsData(vendors_data);
            } catch (err: any) {
                // setError(err.message);
            } finally {

            }
        };

        fetchAssetType();
        fetchVendorsData();
    }, []);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement|HTMLSelectElement|HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setAssetsData({ ...assetsData, [name]: value });
    };

    const handleAssetTypeSelect = (selectedOption: any) => {
        if (selectedOption) {
            setAssetsData(prev => ({
                ...prev,
                asset_type: { id: selectedOption.value, name: selectedOption.label },
                asset_type_id: selectedOption.value
            }));
        }
    };
    

    const handleVendorSelect = (selectedOption: any) => {
        if (selectedOption) {
            setAssetsData(prev => ({
                ...prev,
                vendors: { id: selectedOption.value, name: selectedOption.label },
                vendor_id: selectedOption.value
            }));
        }
    };
    
    // Handler function for the file input change event
    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files ? event.target.files[0] : null;
        setAssetsData({ ...assetsData, warranty_card: file });
    };
    
    // Handler function for the file input change event
    const handleInvoiceChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files ? event.target.files[0] : null;
        setAssetsData({ ...assetsData, invoice_file: file });
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

        setValidated(true);
        setLoading(true);
        const apiCall = isEditing
            ? axiosInstance.post(`/updateAssets`,  {
                ...assetsData
            }, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            })
            : axiosInstance.post('/assets', assetsData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });

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
            <Modal show onHide={onHide} size="lg" backdrop="static" keyboard={false}>
                <Modal.Header closeButton>
                    <Modal.Title>{isEditing ? 'Edit Assets' : 'Add Assets'}</Modal.Title>
                </Modal.Header>
                <Form noValidate validated={validated} onSubmit={handleSubmit}>
                    <Modal.Body>
                        <Row>
                            <Form.Group as={Col} className="mb-3" controlId="asset_name">
                                <Form.Label>Assets Name <span className="text-danger">*</span></Form.Label>
                                <Form.Control type="text" placeholder="Enter assets" name="asset_name" value={assetsData.asset_name} onChange={handleChange} required />
                                <Form.Control.Feedback type="invalid">Please enter assets name.</Form.Control.Feedback>
                            </Form.Group>
                            <Form.Group as={Col} className="mb-3" controlId="asset_id">
                                <Form.Label>Asset ID <span className="text-danger">*</span></Form.Label>
                                <Form.Control type="text" placeholder="Enter assets" name="asset_id" value={assetsData.asset_id} readOnly style={{backgroundColor: 'whitesmoke', pointerEvents: 'none'}} required />
                                <Form.Control.Feedback type="invalid">Please enter assets name.</Form.Control.Feedback>
                            </Form.Group>
                        </Row>
                        <Row className="g-3">
                            <Form.Group as={Col} className="mb-3" controlId="asset_desc">
                                <Form.Label>Asset Description <span className="text-danger">*</span></Form.Label>
                                <Form.Control type="text" placeholder="Serial Number / IMEI" name="asset_desc" value={assetsData.asset_desc} onChange={handleChange} />
                            </Form.Group>
                            <Form.Group as={Col} className="mb-3" controlId="asset_type_id">
                                <Form.Label>Asset Type <span className="text-danger">*</span></Form.Label>
                                <ReactSelect
                                    options= {assetTypeData.map((option: AssetTypeDataType) => (
                                        { value: option.id, label: option.name }
                                    ))}
                                    placeholder="Select Asset Type" name="asset_type" value={assetsData.asset_type ? { value: assetsData.asset_type.id, label: assetsData.asset_type.name } : null} onChange={(selectedOption) => handleAssetTypeSelect(selectedOption)} 
                                />
                                <Form.Control type="hidden" name="asset_type_id" value={assetsData.asset_type_id} />
                                {validated && !assetsData.asset_type_id && (
                                    <div className="invalid-feedback d-block">Please enter assets type</div>
                                )}
                            </Form.Group>
                        </Row>
                        <Row>
                            <Form.Group className="mb-3" controlId="vendor_id">
                                <Form.Label>Vendor <span className="text-danger">*</span></Form.Label>
                                <ReactSelect
                                    options= {vendorsData.map((option: VendorsDataInterface) => (
                                        { value: option.id, label: option.name }
                                    ))}
                                    placeholder="Select Vendor" name="vendors" value={assetsData.vendors ? { value: assetsData.vendors.id, label: assetsData.vendors.name } : null} onChange={(selectedOption) => handleVendorSelect(selectedOption)} 
                                />
                                <Form.Control type="hidden" name="vendor_id" value={assetsData.vendor_id} />
                                {validated && !assetsData.vendor_id && (
                                    <div className="invalid-feedback d-block">Please enter Vendor</div>
                                )}
                            </Form.Group>
                        </Row>
                        <Row className="g-3">
                            <Form.Group as={Col} className="mb-3" controlId="purchase_date">
                                <Form.Label>Purchase Date <span className="text-danger">*</span></Form.Label>
                                <Form.Control type="date" name="purchase_date" value={assetsData.purchase_date} onChange={handleChange} required />
                                <Form.Control.Feedback type="invalid">Please enter Purchase Date.</Form.Control.Feedback>
                            </Form.Group>
                            <Form.Group as={Col} className="mb-3" controlId="warranty_exp_date">
                                <Form.Label>Warranty Expiry Date </Form.Label>
                                <Form.Control type="date" name="warranty_exp_date" value={assetsData.warranty_exp_date} onChange={handleChange} />
                                <Form.Control.Feedback type="invalid">Please enter Warranty Expiry Date.</Form.Control.Feedback>
                            </Form.Group>
                        </Row>
                        <Row className="g-3">
                            <Form.Group as={Col} controlId="warranty_card">
                                <Form.Label>Warranty card <span className="text-danger">*</span></Form.Label>
                                <Form.Control type="file" name="warranty_card" onChange={handleFileChange} required={!isEditing} />
                                <Form.Control.Feedback type="invalid">Please enter Warranty card .</Form.Control.Feedback>
                            </Form.Group>
                            {isEditing && (<span className='text-danger'>Uploaded Attachment :- {assetsData.warranty_attachments ? assetsData.warranty_attachments : ''} </span>)}
                            <Form.Group as={Col} controlId="invoice_file">
                                <Form.Label>Invoice Copy <span className="text-danger">*</span></Form.Label>
                                <Form.Control type="file" name="invoice_file" onChange={handleInvoiceChange} required={!isEditing} />
                                <Form.Control.Feedback type="invalid">Please enter Invoice Copy .</Form.Control.Feedback>
                            </Form.Group>
                            {isEditing && (<span className='text-danger'>Uploaded Attachment :- {assetsData.invoice_attachments ? assetsData.invoice_attachments : ''} </span>)}
                        </Row>


                    </Modal.Body>
                    <Modal.Footer>
                        <Button variant="secondary" onClick={onHide}>
                            Close
                        </Button>
                        <Button variant="primary" loading={loading} loadingPosition="start" type="submit">{isEditing ? 'Update' : 'Add'}</Button>
                    </Modal.Footer>
                </Form>
            </Modal>
        </>
    );
};

export default AssetsModal;
