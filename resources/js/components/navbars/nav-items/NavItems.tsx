import Avatar from '../../base/Avatar';
import { Dropdown, Modal, Nav } from 'react-bootstrap';
import avatar57 from '../../../assets/img/team/1.webp';
import ProfileDropdownMenu from './ProfileDropdownMenu';
import { useAppContext } from '../../../providers/AppProvider';
import FeatherIcon from 'feather-icons-react';
import { Link } from 'react-router-dom';
import NotificationDropdownMenu from './NotificationDropdownMenu';
import ThemeToggler from '../../common/ThemeToggler';
import { useState } from 'react';
import notification from '../../../assets/img/newIcons/notification.svg';
import classNames from 'classnames';

const NavItems = () => {
  const {
    config: { navbarPosition }
  } = useAppContext();
  const [openSearchModal, setOpenSearchModal] = useState(false);

  return (
    <div className="navbar-nav navbar-nav-icons flex-row">
      <Nav.Item>
        <ThemeToggler className="px-2" />
      </Nav.Item>
      <Nav.Item
        className={classNames({
          'd-lg-none':
            navbarPosition === 'vertical' || navbarPosition === 'dual'
        })}
      >
        <Nav.Link onClick={() => setOpenSearchModal(!openSearchModal)}>
          <FeatherIcon icon="search" size={19} style={{ marginBottom: 2 }} />
        </Nav.Link>
      </Nav.Item>
       <Nav.Item>
       <Dropdown autoClose="outside" className="h-100">
  <Dropdown.Toggle
    as={Link}
    to="#!"
    className="dropdown-caret-none nav-link h-100"
    variant=""
  >
    <div
      style={{
        width: '30px',
        height: '30px',
        borderRadius: '50%',
        backgroundColor: '#f0f0f0', // Change to desired color
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <img
        src={notification}
        alt="notification"
        style={{ width: '16px', height: '16px' }} // Adjust image size as needed
      />
    </div>
  </Dropdown.Toggle>
  <NotificationDropdownMenu />
</Dropdown>

      </Nav.Item>
      <Nav.Item>
        <Dropdown autoClose="outside" className="h-100">
          <Dropdown.Toggle
            as={Link}
            to="#!"
            className="dropdown-caret-none nav-link pe-0 py-0 lh-1 h-100 d-flex align-items-center"
            variant=""
          >
            <Avatar src={avatar57} size="l" />
          </Dropdown.Toggle>
          <ProfileDropdownMenu />
        </Dropdown>
      </Nav.Item>

    </div>
  );
};

export default NavItems;
