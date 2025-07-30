import { CalendarApi } from '@fullcalendar/core';
import { EventImpl } from '@fullcalendar/core/internal';
import {
  PropsWithChildren,
  useContext,
  Dispatch,
  createContext,
  useReducer,
  useState
} from 'react';
import {
  CALENDAR_ACTION_TYPE,
  calendarReducer
} from '../reducers/CalendarReducer';

export type CalendarView = 'dayGridMonth' | 'timeGridWeek';

export interface CalendarState {
  calendarApi: CalendarApi | null;
  title: string;
  view: CalendarView;
  selectedEvent: EventImpl | null;
  openNewEventModal: boolean;
  selectedStartDate: Date | string;
  selectedEndDate: Date | string;
}

// interface CalendarContextInterface extends CalendarState {
//   calendarDispatch: Dispatch<CALENDAR_ACTION_TYPE>;
// }
interface CalendarContextInterface extends CalendarState {
  calendarDispatch: Dispatch<CALENDAR_ACTION_TYPE>;
  date: Date | null;
  setDate: React.Dispatch<React.SetStateAction<Date | null>>;
}


export const CalendarContext = createContext({} as CalendarContextInterface);

const CalendarProvider = ({ children }: PropsWithChildren) => {
  const initialState: CalendarState = {
    calendarApi: null,
    title: '',
    view: 'dayGridMonth',
    selectedEvent: null,
    openNewEventModal: false,
    selectedStartDate: '',
    selectedEndDate: ''
  };

  const [calendarState, calendarDispatch] = useReducer(
    calendarReducer,
    initialState
  );

  const [date, setDate] = useState<Date | null>(null);

  return (
    <CalendarContext.Provider
      value={{
        ...calendarState,
        calendarDispatch,
        date,        
        setDate      
      }}
    >
      {children}
    </CalendarContext.Provider>
  );
};

export const useCalendarContext = () => useContext(CalendarContext);

export default CalendarProvider;
