import { useEffect, useState, ChangeEvent } from 'react';
import { Col, Row, Nav, Tab } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useAuth } from '../../AuthContext';
import { useNavigate } from 'react-router-dom';
import Button from '../../components/base/Button';
import { faCaretSquareLeft, faCaretSquareRight } from '@fortawesome/free-solid-svg-icons';

const Edocs = () => {
    const navigate = useNavigate();
    const handleRedirect = (path: string) => {
        navigate(`/${path}`);
    }
    return (
        <>
            <h2 className="mb-5">E-Docs</h2>
            <Row className="g-3 justify-content-center my-2">
                <Col className="d-flex justify-content-end">
                    <Button
                        variant="primary"
                        className=""
                        size='lg'
                        startIcon={<FontAwesomeIcon icon={faCaretSquareLeft} className="me-2" />}
                        onClick={() => handleRedirect('irms')}
                    >
                        IRM
                    </Button>
                </Col>

                <Col className="">
                    <Button
                        variant="primary"
                        className=""
                        size='lg'
                        endIcon={<FontAwesomeIcon icon={faCaretSquareRight} className="ms-2" />}
                        onClick={() => handleRedirect('invoices')}
                    >
                        International Trade
                    </Button>
                </Col>
            </Row>
        </>
    )
};

export default Edocs;
