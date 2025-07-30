import { EventClickArg } from '@fullcalendar/core';
import CalendarAddNewEventModal from '../../../../components/modals/CalendarAddNewEventModal';
import CalendarProvider, {
  useCalendarContext
} from '../../../../providers/CalendarProvider';
import CalendarEventModal from '../../../../components/modals/CalendarEventModal';
import { HANDLE_SELECT, SET_CALENDAR_STATE } from '../../../../reducers/CalendarReducer';
import FullCalendar from '../../../../components/base/FullCalendar';
// import events from '../../../../data/calendarEvents';
import CalendarTop from './CalendarTop';
import { faChevronLeft, faChevronRight } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import classNames from 'classnames';
import Button from '../../../../components/base/Button';
import { CalendarView } from '../../../../providers/CalendarProvider';
import { ButtonGroup, Col, Row } from 'react-bootstrap';

import axiosInstance from '../../../../axios';
import { useEffect, useState } from 'react';

const CalendarDashboard = () => {
  return (
    <CalendarProvider>
      <Calendar />
    </CalendarProvider>
  );
};

const Calendar = () => {
  const { calendarDispatch, calendarApi, title, view } = useCalendarContext();
  const [calendarData, setCalendarData] = useState<Record<string, any> | null>(null);

  const handleEventClick = (info: EventClickArg) => {
    if (info.event.url) {
      window.open(info.event.url);
      info.jsEvent.preventDefault();
    } else {
      calendarDispatch({
        type: SET_CALENDAR_STATE,
        payload: { selectedEvent: info.event }
      });
    }
  };

  // const getWeekOfMonth = (date: Date) => {
  //   const firstDayOfYear = new Date(date.getFullYear(), 0, 1);
  //   const pastDaysOfYear = (date.getTime() - firstDayOfYear.getTime()) / 86400000;
  //   return Math.ceil((pastDaysOfYear + firstDayOfYear.getDay() + 1) / 7);
  // };
  const getWeekOfMonth = (date: Date) => {
    const firstDayOfMonth = new Date(date.getFullYear(), date.getMonth(), 1);
    const firstDayWeekday = firstDayOfMonth.getDay(); // 0 for Sunday, 1 for Monday...
    return Math.ceil((date.getDate() + firstDayWeekday) / 8);
  };
  
  const fetchCalendarData = async (viewType: CalendarView) => {
    if (!calendarApi) return;
    const token = localStorage.getItem('token');
    const cleanToken = token && token.split('|')[1];
  
    const currentDate = calendarApi.getDate();
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth() + 1;
    const week = getWeekOfMonth(currentDate);
  
    let endpoint = '';
    let params: any = { year, month };
  
    if (viewType === 'dayGridMonth') {
      endpoint = '/todays_tasks_monthly';
    } else if (viewType === 'timeGridWeek') {
      endpoint = '/todays_tasks_weekly';
      params.week = week;
    }
  
    try {
      const response = await axiosInstance.get(endpoint, {
        params,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${cleanToken}`
        }
      });
  
      setCalendarData(response.data);
      calendarDispatch({
        type: SET_CALENDAR_STATE,
        payload: { view: viewType, title: calendarApi.view.title }
      });
    } catch (error) {
      console.error(`Failed to fetch data from ${endpoint}:`, error);
    }
  };
  
  useEffect(() => {
    if (calendarApi) {
      fetchCalendarData('dayGridMonth');
    }
  }, [calendarApi]); // Runs when calendarApi is set
  
  

  const handleCalendarView = (viewType: CalendarView) => {
    if (calendarApi) {
      calendarApi.changeView(viewType);
      fetchCalendarData(viewType);
    }
  };

 
  const handleCalendarUpdate = (actionType: string) => {
    if (calendarApi) {
      if (actionType === 'next') calendarApi.next();
      else if (actionType === 'prev') calendarApi.prev();
      else calendarApi.today();
  
      // Recalculate the week number for week-based views
      if (view === 'timeGridWeek') {
        fetchCalendarData('timeGridWeek');
      } else {
        fetchCalendarData(view);
      }
    }
  };
  
  useEffect(() => {
    fetchCalendarData(view);
  }, [view]);

  return (
    <div>
      <CalendarTop />
      <div className="mx-n4 px-4 mx-lg-n6 px-lg-6 border-y border-translucent">
        <Row className="py-3 gy-3 gx-0 justify-content-between">
          <Col xs={6} md="auto" className="order-1 d-flex align-items-center">
            <Button onClick={() => handleCalendarUpdate('today')} variant="phoenix-primary" size="sm" className="px-4">Today</Button>
          </Col>
          <Col xs={12} md="auto" className="order-md-1 d-flex align-items-center justify-content-center">
            <Button onClick={() => handleCalendarUpdate('prev')} className="icon-item icon-item-sm shadow-none text-body-emphasis p-0">
              <FontAwesomeIcon icon={faChevronLeft} />
            </Button>
            {calendarApi && <h3 className="px-3 text-body-emphasis fw-semibold mb-0">{title || calendarApi.view.title}</h3>}
            <Button onClick={() => handleCalendarUpdate('next')} className="icon-item icon-item-sm shadow-none text-body-emphasis p-0">
              <FontAwesomeIcon icon={faChevronRight} />
            </Button>
          </Col>
          <Col xs={6} md="auto" className="order-1 d-flex justify-content-end">
            <ButtonGroup size="sm">
              <Button onClick={() => handleCalendarView('dayGridMonth')} variant="phoenix-secondary" className={classNames({ active: view === 'dayGridMonth' })}>Month</Button>
              <Button onClick={() => handleCalendarView('timeGridWeek')} variant="phoenix-secondary" className={classNames({ active: view === 'timeGridWeek' })}>Week</Button>
            </ButtonGroup>
          </Col>
        </Row>
      </div>
      <div className="mt-6 mb-9">
        <FullCalendar calendarData={calendarData} height={800} select={info => calendarDispatch({ type: HANDLE_SELECT, payload: info })} eventClick={handleEventClick} />
      </div>
      <CalendarEventModal />
      {/* <CalendarAddNewEventModal /> */}
    </div>
  );
};



export default CalendarDashboard;
