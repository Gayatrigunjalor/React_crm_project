import ReactFullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid'; // Ensure this is included
import interactionPlugin from '@fullcalendar/interaction';
import { useEffect, useRef, useState } from 'react';
import { CalendarOptions } from '@fullcalendar/core';
import { useCalendarContext } from '../../providers/CalendarProvider';
import { useAppContext } from '../../providers/AppProvider';
import { INITIALIZE_CALENDAR } from '../../reducers/CalendarReducer';
import React from 'react';

interface FullCalendarProps extends CalendarOptions {}

const FullCalendar = ({ calendarData, ...rest }: FullCalendarProps & { calendarData?: any }) => {
  console.log("*******Calendar Data********", calendarData);
  
  const calendarRef = useRef<ReactFullCalendar>(null);
  const { config: { isRTL } } = useAppContext();
  const { view, calendarDispatch } = useCalendarContext();

  // Track API calls to avoid redundant fetches
  const [fetchedWeeks, setFetchedWeeks] = useState(new Set());

  useEffect(() => {
    const api = calendarRef.current?.getApi();
    if (api) {
      calendarDispatch({ type: INITIALIZE_CALENDAR, payload: api });
    }
  }, []);

  const events = Object.entries(calendarData || {}).flatMap(([date, items]) =>
    items.map((item: any) => ({
      title: item.task,  // ✅ Show meeting_agenda instead of subject
      start: date,                // ✅ Use date_time as start date
      id: item.id,
      customer_name:item.customer_name,
      lead_stage : item.lead_stage,
      product_name : item.product_name,
      opportunity_id : item.opportunity_id,
      tat : item.tat,
      status : item.status,
    }))
  );

  const { date, setDate } = useCalendarContext();

  return (
    <ReactFullCalendar
    ref={calendarRef}
    plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
    initialView={view || "dayGridMonth"}
    headerToolbar={false}
    dayMaxEvents={3}
    stickyHeaderDates={false}
    editable
    selectable
    selectMirror
    direction={isRTL ? 'rtl' : 'ltr'}
    eventTimeFormat={{
      hour: 'numeric',
      minute: '2-digit',
      omitZeroMinute: true,
      meridiem: true
    }}
    events={events}
    dateClick={(info) => {
      setDate(info.date); 
      // console.log("Clicked date:", info.date);
    }}
    {...rest}
  />
  
  );
};

export default FullCalendar;
