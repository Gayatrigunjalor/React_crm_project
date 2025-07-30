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
      title: item.subject,  // ✅ Show subject as event title
      start: date,         // ✅ Use tat_date as start date
      id: item.id,
      tat_date : item.tat_date,
      description: item.description,
      status: item.status
    }))
  );

   const { date, setDate } = useCalendarContext();
  return (
    <ReactFullCalendar
      ref={calendarRef}
      plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]} // ✅ Ensure week view works
      initialView={view || "dayGridMonth"} // ✅ Ensure correct default view
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
      dateClick={(info) => {
        setDate(info.date); // 👈 Set clicked date in context
        console.log("Clicked date:", info.date);
      }}
      events={events} // ✅ Use transformed events
      {...rest}
    />
  );
};

export default FullCalendar;
