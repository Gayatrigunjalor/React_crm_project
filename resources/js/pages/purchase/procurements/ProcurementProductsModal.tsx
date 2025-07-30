import React, { useEffect, useState, useCallback } from 'react';
import { Form, Modal, Row, Col, Alert } from 'react-bootstrap';
import Button from '../../../components/base/Button';
import axiosInstance from '../../../axios';
import swal from 'sweetalert';
import { useAuth } from '../../../AuthContext';
import ReactSelect from '../../../components/base/ReactSelect';
import Dropzone from '../../../components/base/Dropzone';
import { faPlus, faCaretLeft, faTrash } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

interface ProductsData {
    id: number;
    procurement_id: number;
    product_service_name: string;
    description: string;
    target_cost: string;
    quantity: string;
}

interface ProcurementsModalProps {
    quoteId: number;
    onHide: () => void;
    onSuccess: () => void;
}

const ProcurementProductsModal: React.FC<ProcurementsModalProps> = ({ quoteId, onHide, onSuccess }) => {


    const [productsData, setProductsData] = useState<ProductsData[]>([]);
    const [error, setError] = useState<string | null>(null);

    const { empData } = useAuth(); //check userRole & permissions

    useEffect(() => {

        if (quoteId) {

            // Fetch customer data for editing
            axiosInstance.get(`/fetchProcurementProducts/${quoteId}`)
            .then(response => {
                const responseData = response.data;
                // Map products to proc_products
                if(responseData.products.length > 0){
                    const procProducts = responseData.products.map((product: ProductsData) => ({
                        proc_prod_id: product.id,
                        procurement_id: product.procurement_id,
                        product_service_name: product.product_service_name,
                        description: product.description,
                        target_cost: product.target_cost,
                        quantity: product.quantity
                    }));
                    setProductsData(procProducts);
                } else {
                    setProductsData([]);
                }

                // Update the state with the mapped proc_products
            })
            .catch(error => console.error('Error fetching procurement products data:', error));
        }
    }, [quoteId]);

    return (
        <>
            <Modal show onHide={onHide} size='xl' backdrop="static" keyboard={false}>
                <Modal.Header closeButton>
                    <Modal.Title>Procurement Product List</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Row className="g-3 justify-content-between px-2 mb-4">
                        {productsData && productsData.length > 0 && (
                            <table className='w-100'>
                                <thead>
                                    <tr className='p-2 border border-secondary'>
                                        <th className='p-2 '>Procurement Products</th>
                                        <th className='p-2 border-start border-secondary'>Description</th>
                                        <th className='p-2 border-start border-secondary'>Quantity</th>
                                        <th className='p-2 border-start border-secondary'>Target Cost</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {productsData.map((prod: ProductsData, prod_index) => (
                                        <tr key={prod_index}>
                                            <td className='p-2 border border-secondary'>{prod.product_service_name}</td>
                                            <td className='p-2 border border-secondary'>{prod.description}</td>
                                            <td className='p-2 border border-secondary'>{prod.quantity}</td>
                                            <td className='p-2 border border-secondary'>{prod.target_cost}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}
                    </Row>
                </Modal.Body>
            </Modal>
        </>
    );
};

export default ProcurementProductsModal;
