import { faClock } from '@fortawesome/free-regular-svg-icons';
import { faFilePdf,faClipboard } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import classNames from 'classnames';
import Timeline from './Timeline';
import { Col, Row } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { IconProp } from '@fortawesome/fontawesome-svg-core';
import {
    faCheck,
    faEnvelope,
    faPaperclip,
    faRocket,
    faScrewdriverWrench,
    faSkullCrossbones,
    faStethoscope,
    faSwatchbook,
    faTruck,
    faTruckFast,
    faTruckRampBox,
    faUtensils,
    faVideo
} from '@fortawesome/free-solid-svg-icons';
import { TimelineItem } from '../../pages/productivity/business-task/BusinessTaskTimeline';
import Button from './Button';
import { handlePDFclicked as handleProformaDownload } from '../../pages/productivity/business-task/EnquiryDetails';

const BasicTimeline = ({ data }: { data: TimelineItem[] }) => {
    return (
        <Timeline variant="basic" className="mb-9">
        {data.map((item, index) => (
            <Timeline.Item key={item.id}>
            <Row className="g-3">
                <Col xs="auto">
                <Timeline.Separator className="position-relative">
                    <Timeline.Dot className="icon-item-md border border-translucent bg-body">
                    <FontAwesomeIcon
                        icon={faClipboard}
                        className={`fs-9 text-${item.iconColor}`}
                    />
                    </Timeline.Dot>
                    {index !== data.length - 1 && (
                    <Timeline.Bar className="h-100 border-dashed" />
                    )}
                </Timeline.Separator>
                </Col>
                <Col>
                <Timeline.Content>
                    <div className="d-flex justify-content-between">
                    <div className="d-flex mb-2">
                        <h5
                        className="lh-sm mb-0 me-2 text-body-secondary timeline-item-title"
                        dangerouslySetInnerHTML={{ __html: item.title }}
                        ></h5>
                        {item.file && (
                        <h6 className="mb-0 fs-9">
                            <FontAwesomeIcon
                            icon={faFilePdf}
                            className="me-1 text-body-tertiary"
                            />
                            <Link to="#!">{item.file}</Link>
                        </h6>
                        )}
                    </div>
                    <div className="text-body-quaternary fs-9 text-nowrap timeline-time">
                        <FontAwesomeIcon icon={faClock} className="me-1" />
                        {item.time}
                    </div>
                    </div>
                    {item.tasker != '' && (

                        <h6
                        className={classNames('fs-10 fw-normal', {
                            'mb-3': index !== data.length - 1
                        })}
                        >
                        by{' '}
                        <Link to="#!" className="fw-semibold">
                            {item.tasker}
                        </Link>
                        </h6>
                    ) }
                    <p
                    className={classNames(
                        'fs-8 text-body-secondary w-sm-60 mb-0',
                        {
                        'mb-5': index !== data.length - 1
                        }
                    )}
                    dangerouslySetInnerHTML={{ __html: item.content }}
                    ></p>
                </Timeline.Content>
                </Col>
            </Row>
            </Timeline.Item>
        ))}
        </Timeline>
    );
};

export default BasicTimeline;
