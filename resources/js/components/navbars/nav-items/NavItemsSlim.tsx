import { Dropdown, Modal, Nav } from 'react-bootstrap';
import FeatherIcon from 'feather-icons-react';
import { Link } from 'react-router-dom';
import ProfileDropdownMenu from './ProfileDropdownMenu';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import ThemeToggler from '../../common/ThemeToggler';
import NotificationDropdownMenu from './NotificationDropdownMenu';
import { useState } from 'react';
import { faChevronDown } from '@fortawesome/free-solid-svg-icons';



const NavItemsSlim = () => {
    const [openSearchModal, setOpenSearchModal] = useState(false);
    return (
        <div className="navbar-nav navbar-nav-icons flex-row">
            <Nav.Item>
                <ThemeToggler slim />
            </Nav.Item>
            <Nav.Item>
                <Dropdown autoClose="outside">
                    <Dropdown.Toggle
                        as={Link}
                        to="#!"
                        className="dropdown-caret-none nav-link py-0"
                        variant=""
                    >
                        {/* <FeatherIcon icon="bell" size={12} /> */}
                        {/* <div style={{ cursor: 'pointer' }}>
                            <img
                                src={notificationIcon}
                                alt="Notifications"

                            />
                        </div>          */}
                           </Dropdown.Toggle>
                    <NotificationDropdownMenu />
                </Dropdown>
            </Nav.Item>
            <Nav.Item>
                <Dropdown autoClose="outside">
                    <Dropdown.Toggle
                        as={Link}
                        to="#!"
                        className="dropdown-caret-none nav-link pe-0 py-0"
                        variant=""
                    >
                        Olivia <FontAwesomeIcon icon={faChevronDown} className="fs-10" />
                    </Dropdown.Toggle>
                    <ProfileDropdownMenu />
                </Dropdown>
            </Nav.Item>
        </div>
    );
};

export default NavItemsSlim;
