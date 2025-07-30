import Button, { ButtonProps } from '../base/Button';
import { useAppContext } from '../../providers/AppProvider';
import { OverlayTrigger, Tooltip } from 'react-bootstrap';
import classNames from 'classnames';
import modeIcon from '../../assets/img/newIcons/mode.svg';
import notificationIcon from '../../assets/img/newIcons/notification.svg';

interface ThemeTogglerProps extends ButtonProps {
  slim?: boolean;
  className?: string;
}

const ThemeToggler = ({ slim, className, ...rest }: ThemeTogglerProps) => {
  const {
    config: { theme, isRTL },
    toggleTheme
  } = useAppContext();

  return (
    <Button
      className={classNames(className, 'border-0 p-0', {
        'lh-1': slim
      })}
      onClick={() => toggleTheme()}
      {...rest}
    >
      <div
        className={classNames('theme-control-toggle', {
          'theme-control-toggle-slim pe-2': slim
        })}
      >
        <OverlayTrigger
          placement={slim ? 'bottom' : isRTL ? 'right' : 'left'}
          overlay={
            <Tooltip id="ThemeColor" style={{ position: 'fixed' }}>
              {slim
                ? 'Switch theme'
                : theme === 'dark'
                  ? 'Switch to light theme'
                  : 'Switch to dark theme'}
            </Tooltip>
          }
        >
          <div className="theme-control-toggle-label d-flex align-items-center">
            <div
              style={{
                width: '30px',
                height: '30px',
                borderRadius: '50%',
                backgroundColor: '#f0f0f0',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginRight: slim ? '0.25rem' : undefined
              }}
              className={classNames({ 'd-none d-sm-flex': slim })}
            >
              <img
                src={modeIcon}
                alt="theme toggle"
                style={{
                  width: slim ? 10 : 16,
                  height: slim ? 10 : 16,
                  objectFit: 'contain'
                }}
              />
            </div>
            {slim && (
              <span className="fs-9 fw-bold">
                {theme === 'dark' ? 'Dark' : 'Light'}
              </span>
            )}
          </div>

        </OverlayTrigger>
        {/* <div style={{ cursor: 'pointer' }}>
                            <img
                                src={notificationIcon}
                                alt="Notifications"

                            />
                        </div>      */}
      </div>
    </Button>
  );
};

export default ThemeToggler;
