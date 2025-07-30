import { faPlus, faSync } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import Button from '../../../../components/base/Button';
import dayjs from 'dayjs';
import { useCalendarContext } from '../../../../providers/CalendarProvider';
import { Col, Row } from 'react-bootstrap';
import { SET_CALENDAR_STATE } from '../../../../reducers/CalendarReducer';
import React from 'react';

const CalendarTop = () => {
  const { calendarDispatch } = useCalendarContext();
  const {date} = useCalendarContext();

  return (
    <Row className="g-0 mb-4 align-items-center justify-content-center">
    <Col xs={5} md={6} className="d-flex justify-content-center">
      <h4 className="mb-0 text-body-emphasis fw-bold fs-md-6 text-center">
        <span className="calendar-day d-block d-md-inline mb-1">
          {/* {dayjs().format('dddd')} */}
           {date ? dayjs(date).format('dddd') : dayjs().format('dddd')}
        </span>
        <span className="px-3 fw-thin text-body-quaternary d-none d-md-inline">
          |
        </span>
        {/* <span className="d-inline-block">
          {dayjs().format('D MMM, YYYY')}
        </span> */}
        <span className="d-inline-block">
  {date ? dayjs(date).format(' D MMMM, YYYY') : dayjs().format('D MMM, YYYY')}
</span>
      </h4>
    </Col>
  </Row>
  
  );
};

export default CalendarTop;
