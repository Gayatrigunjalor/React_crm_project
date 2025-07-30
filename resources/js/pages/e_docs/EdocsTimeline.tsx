import { useEffect, useState, ChangeEvent } from 'react';
import { Col, Row, Nav, Form, Card } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useAuth } from '../../AuthContext';
import { useNavigate } from 'react-router-dom';
import Button from '../../components/base/Button';
import { faCaretSquareLeft, faCaretSquareRight } from '@fortawesome/free-solid-svg-icons';
import { IconProp } from '@fortawesome/fontawesome-svg-core';
import axiosInstance from '../../axios';
import img from '../../assets/img/spot-illustrations/timeline.png';
import imgDark from '../../assets/img/spot-illustrations/timeline-dark.png';
import BasicTimeline from '../../components/base/BasicTimeline';
import ReactSelect from '../../components/base/ReactSelect';
import swal from 'sweetalert';

export interface TimelineItem {
    id: number;
    time: string;
    icon: IconProp;
    iconColor: string;
    title: string;
    content: string;
    tasker: string;
    file?: string;
}

export interface Timeline {
    id: number;
    date: string;
    items: TimelineItem[];
}

interface FormData {
    business_task: BTListingData | null;
    business_task_id: number;
}

interface BTListingData {
    id: number;
    customer_name: string;
}

const EdocsTimeline = () => {
    const navigate = useNavigate();
    const handleRedirect = (path: string) => {
        navigate(`/${path}`);
    }

    const { userPermission, empData } = useAuth(); //check userRole & permissions
    const [btListingData, setBtListingData] = useState<BTListingData[]>([]);
    const [timelineData, setTimelineData] = useState<Timeline[]>([]);
    const [error, setError] = useState<string | null>(null);
    const [timelineForm, setTimelineForm] = useState<FormData>({ business_task: null, business_task_id: 0 });
    const [validated, setValidated] = useState<boolean>(false);
    const [loading, setLoading] = useState(false);


    useEffect(() => {
        const fetchBusinessTaskListing = async () => {
            try {
                const response = await axiosInstance.get(`/btDropdownListing`);
                if (response.status !== 200) {
                    throw new Error('Failed to fetch data');
                }
                const data: BTListingData[] = response.data;
                setBtListingData(data);
            } catch (err: any) {
                setError(err.data.message);
            }
        };
        fetchBusinessTaskListing();
    }, []);

    const handleBTselection = (selectedOption: any) => {
        if (selectedOption) {
            setTimelineForm(prev => ({
                ...prev,
                business_task: { id: selectedOption.value, customer_name: selectedOption.label },
                business_task_id: selectedOption.value
            }));
        }
    };
    const handleReset = () => {
        setTimelineForm({
            business_task: null,
            business_task_id: 0
        });
    };
    //Form Submission
    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const form = e.currentTarget;
        if (form.checkValidity() === false) {
            e.preventDefault();
            e.stopPropagation();
            setValidated(true);
            return;
        }

        setLoading(true);
        setValidated(true);
        const apiCall =  axiosInstance.get('/getEDocsTimelineByBtId',{
            params : { businessTaskId: timelineForm.business_task_id }
        });

        apiCall
            .then((response ) => {
                const data: Timeline[] = response.data;
                setTimelineData(data);
                console.log(response.data);

        })
        .catch(error => {

            console.log(error);
            swal("Error!", error.data.message, "error");
        })
        .finally(() => { setLoading(false); });
    };
    if (error) return <div>Error: {error}</div>;
    return (
        <>
            <h2 className="mb-5">E-Docs Timeline</h2>
            <Card>
                <Card.Body>
                    <Row className="g-3 justify-content-center my-2">
                        <Form noValidate validated={validated} onSubmit={handleSubmit}>
                            <Row className='align-items-center'>
                                <Col md={6}>
                                    <Form.Group as={Col} className="mb-3">
                                        <Form.Label>Select Business Task Id <span className="text-danger">*</span></Form.Label>
                                        <ReactSelect
                                            options= {btListingData.map((option: BTListingData) => (
                                                { value: option.id, label: `${option.id} (${option.customer_name})` }
                                            ))}
                                            placeholder="Select Business Task" name="business_task" value={timelineForm.business_task ? { value: timelineForm.business_task.id, label: timelineForm.business_task.customer_name } : null} onChange={(selectedOption) => handleBTselection(selectedOption)} required/>
                                            <Form.Control type="hidden" name="business_task_id" value={timelineForm.business_task_id} />
                                            {validated && !timelineForm.business_task_id && (
                                                <div className="invalid-feedback d-block">Please select Business Task Id</div>
                                            )}
                                    </Form.Group>
                                </Col>
                                <Col md={2} className='d-flex'>
                                    <Button variant="primary" className='mx-2' loading={loading} loadingPosition="start" type="submit">Submit</Button>
                                    <Button variant="secondary" className='mx-2' onClick={handleReset} type="button">Reset</Button>
                                </Col>
                            </Row>
                        </Form>
                    </Row>
                </Card.Body>
            </Card>
            <div className='mt-4'></div>
            {timelineData.length > 0 && (
                <>
                    <Row className="gx-xl-8 gx-xxl-11">
                        <Col xl={5} className="p-xxl-7">
                        <div
                            className="ms-xxl-3 d-none d-xl-block position-sticky"
                            style={{ top: '30%' }}
                        >
                            <img src={img} alt="" className="d-dark-none img-fluid" />
                            <img src={imgDark} alt="" className="d-light-none img-fluid" />
                        </div>
                        </Col>
                        <Col xl={7} className="scrollbar">
                        {timelineData.map(timeline => (
                            <div key={timeline.id}>
                            <h4 className="py-3 border-y mb-5 ms-8">{timeline.date}</h4>
                            <BasicTimeline data={timeline.items} />
                            </div>
                        ))}
                        </Col>
                    </Row>
                </>
            )}
        </>
    )
};

export default EdocsTimeline;
