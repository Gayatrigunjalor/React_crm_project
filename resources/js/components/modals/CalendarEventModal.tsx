import {
  faAngleRight,
  faPencilAlt,
  faTimes,
  faTrash
} from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import classNames from 'classnames';
import Button from '../../components/base/Button';
import { Schedule } from '../../data/calendarEvents';
import dayjs from 'dayjs';
import { useCalendarContext } from '../../providers/CalendarProvider';
import { Modal } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { REMOVE_EVENT, SET_CALENDAR_STATE } from '../../reducers/CalendarReducer';

const CalendarEventModal = () => {
  const { selectedEvent, calendarDispatch } = useCalendarContext();

  const handleRemove = () => {
    calendarDispatch({
      type: REMOVE_EVENT
    });
  };

  const handleClose = () => {
    calendarDispatch({
      type: SET_CALENDAR_STATE,
      payload: {
        selectedEvent: null
      }
    });
  };

  return (
    <Modal
      centered
      show={!!selectedEvent}
      onHide={handleClose}
      contentClassName="border"
    >
      <Modal.Header className="ps-card border-bottom border-translucent">
        <div>
          <Modal.Title className="modal-title text-body-highlight mb-0">
            {selectedEvent?.title}
          </Modal.Title>
          {selectedEvent?.extendedProps.organizer && (
            <p className="mb-0 fs-9 mt-1">
              by <Link to="#!">{selectedEvent.extendedProps.organizer}</Link>
            </p>
          )}
        </div>
        <Button className="p-1 ms-auto" onClick={handleClose}>
          <FontAwesomeIcon icon={faTimes} className="fs-8" />
        </Button>
      </Modal.Header>
      <Modal.Body className="px-card pb-card pt-1 fs-9">

        {selectedEvent?.extendedProps.opportunity_id && (
          <div className="mt-3 border-bottom border-translucent pb-3">
            <h5 className="mb-0 text-body-secondary">Opportunity Id</h5>
            <p className="mb-1 mt-2">
              {selectedEvent.extendedProps.opportunity_id
                .split(' ')
                .slice(0, 30)
                .join(' ')}
            </p>
          </div>
        )}
        {selectedEvent?.extendedProps.customer_name && (
          <div className="mt-3 border-bottom border-translucent pb-3">
            <h5 className="mb-0 text-body-secondary">Customer Name</h5>
            <p className="mb-0 mt-2">
              {selectedEvent.extendedProps.customer_name
                .split(' ')
                .slice(0, 30)
                .join(' ')}
            </p>
          </div>
        )}
        {selectedEvent?.extendedProps.lead_stage && (
          <div className="mt-3 border-bottom border-translucent pb-3">
            <h5 className="mb-0 text-body-secondary">Lead Stage</h5>
            <p className="mb-0 mt-2">
              {selectedEvent.extendedProps.lead_stage
                .split(' ')
                .slice(0, 30)
                .join(' ')}
            </p>
          </div>
        )}

        {selectedEvent?.extendedProps.product_name && (
          <div className="mt-3 border-bottom border-translucent pb-3">
            <h5 className="mb-0 text-body-secondary">Product Name</h5>
            <p className="mb-1 mt-2">
              {selectedEvent.extendedProps.product_name
                .split(' ')
                .slice(0, 30)
                .join(' ')}
            </p>
          </div>
        )}
        {selectedEvent?.extendedProps.meeting_agenda && (
          <div className="mt-3 border-bottom border-translucent pb-3">
            <h5 className="mb-0 text-body-secondary">Meeting Agenda</h5>
            <p className="mb-0 mt-2">
              {selectedEvent.extendedProps.meeting_agenda
                .split(' ')
                .slice(0, 30)
                .join(' ')}
            </p>
          </div>
        )}
        {selectedEvent?.extendedProps.link && (
          <div className="mt-3 border-bottom border-translucent pb-3">
            <h5 className="mb-1 text-body-secondary">Meeting Link</h5>
            <a
              className="mb-1 mt-2 text-primary"
              href={selectedEvent.extendedProps.link.trim()}
              target="_blank"
              rel="noopener noreferrer"
            >
              {selectedEvent.extendedProps.link.trim()}
            </a>
          </div>
        )}

        {selectedEvent?.extendedProps.date_time && (
          <div className="mt-3 border-bottom border-translucent pb-3">
            <h5 className="mb-0 text-body-secondary">Date</h5>
            <p className="mb-1 mt-2">

              {dayjs(selectedEvent.extendedProps.date_time).format('dddd, MMMM D, YYYY')}
            </p>
          </div>
        )}
        {selectedEvent?.extendedProps.tat_date && (
          <div className="mt-3 border-bottom border-translucent pb-3">
            <h5 className="mb-0 text-body-secondary">Date</h5>
            <p className="mb-1 mt-2">
              {dayjs(selectedEvent.extendedProps.tat_date).format("dddd, MMMM D, YYYY")}
            </p>
          </div>
        )}

        {selectedEvent?.extendedProps.tat && (
          <div className="mt-3 border-bottom border-translucent pb-3">
            <h5 className="mb-0 text-body-secondary">Date</h5>
            <p className="mb-1 mt-2">

              {dayjs(selectedEvent.extendedProps.tat).format('dddd, MMMM D, YYYY')}
            </p>
          </div>
        )}





        {selectedEvent?.extendedProps.start_time && (
          <div className="mt-3 border-bottom border-translucent pb-3">
            <h5 className="mb-0 text-body-secondary">Start Time</h5>
            <p className="mb-1 mt-2">
              {selectedEvent.extendedProps.start_time
                .split(' ')
                .slice(0, 30)
                .join(' ')}
            </p>
          </div>
        )}

        {selectedEvent?.extendedProps.end_time && (
          <div className="mt-3 border-bottom border-translucent pb-3">
            <h5 className="mb-0 text-body-secondary">End Time</h5>
            <p className="mb-1 mt-2">

              {/* {selectedEvent?.extendedProps?.end_time &&
    dayjs(selectedEvent.extendedProps.end_time, "HH:mm:ss").format("h:mm A")} */}

              {selectedEvent.extendedProps.end_time
                .split(' ')
                .slice(0, 30)
                .join(' ')}

            </p>
          </div>
        )}


        {selectedEvent?.extendedProps.description && (
          <div className="mt-3 border-bottom border-translucent pb-3">
            <h5 className="mb-0 text-body-secondary">Description</h5>
            <p className="mb-0 mt-2">
              {selectedEvent.extendedProps.description
                .split(' ')
                .slice(0, 30)
                .join(' ')}
            </p>
          </div>
        )}
        {selectedEvent?.extendedProps.status && (
          <div className="mt-3 border-bottom border-translucent pb-3">
            <h5 className="mb-0 text-body-secondary">Status</h5>
            <p className="mb-0 mt-2">
              {selectedEvent.extendedProps.status
                .split(' ')
                .slice(0, 30)
                .join(' ')}
            </p>
          </div>
        )}

        {/* <div
          className={classNames('mt-4', {
            'border-bottom border-translucent pb-3':
              selectedEvent?.extendedProps.location
          })}
        >
          <h5 className="mb-0 text-body-secondary">Date and Time</h5>
          <p className="mb-1 mt-2">
            {dayjs(selectedEvent?.start).format('dddd, MMMM D, YYYY, h:mm A')}
            {selectedEvent?.end &&
              ` – ${
                dayjs &&
                dayjs(selectedEvent?.end)
                  .subtract(1, 'day')
                  .format('dddd, MMMM D, YYYY, h:mm A')
              }`}
          </p>
        </div> */}
        {/* {selectedEvent?.extendedProps.location && (
          <div className="mt-4 ">
            <h5 className="mb-0 text-body-secondary">Location</h5>
            <p
              className="mb-0 mt-2"
              dangerouslySetInnerHTML={{
                __html: selectedEvent.extendedProps.location
              }}
            />
          </div>
        )}
        {selectedEvent?.extendedProps.schedules && (
          <div className="mt-3">
            <h5 className="mb-0 text-body-secondary">Schedule</h5>
            <ul className="list-unstyled timeline mt-2 mb-0">
              {selectedEvent.extendedProps.schedules.map(
                (schedule: Schedule) => (
                  <li key={schedule.title}>{schedule.title}</li>
                )
              )}
            </ul>
          </div>
        )} */}
      </Modal.Body>
      {/* <Modal.Footer className="d-flex justify-content-end px-card pt-0 border-top-0">
        <Button
          as={Link}
          to="/apps/events/create-an-event"
          variant="phoenix-secondary"
          size="sm"
          startIcon={<FontAwesomeIcon icon={faPencilAlt} className="fs-10" />}
        >
          Edit
        </Button>
        <Button
          onClick={handleRemove}
          variant="phoenix-danger"
          size="sm"
          startIcon={<FontAwesomeIcon icon={faTrash} className="fs-9" />}
        >
          Delete
        </Button>
        <Button
          as={Link}
          to="/apps/events/event-detail"
          variant="primary"
          size="sm"
          endIcon={<FontAwesomeIcon icon={faAngleRight} className="fs-10" />}
        >
          See more details
        </Button>
      </Modal.Footer> */}
    </Modal>
  );
};

export default CalendarEventModal;
