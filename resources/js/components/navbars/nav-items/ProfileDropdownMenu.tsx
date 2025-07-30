import Avatar from '../../base/Avatar';
import { useState } from 'react';
import { Card, Dropdown, Form, Nav } from 'react-bootstrap';
import avatar from '../../../assets/img/team/72x72/1.webp';
import FeatherIcon from 'feather-icons-react';
import { Link, useNavigate } from 'react-router-dom';
import Scrollbar from '../../base/Scrollbar';
import classNames from 'classnames';
import { useAuth } from '../../../AuthContext';
import swal from 'sweetalert';
import axiosInstance from '../../../axios';

const ProfileDropdownMenu = ({ className }: { className?: string }) => {
    const [navItems] = useState([
        {
            label: 'Profile',
            icon: 'user'
        },
        {
            label: 'Dashboard',
            icon: 'pie-chart'
        },
    ]);

    const { empData, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = async () => {
        try {
            const response = await axiosInstance.post('/logout'); // Replace with your API URL
            if (response.status !== 204) {
                throw new Error('Failed to fetch data');
            }

            swal({
                title: "Logout successful!",
                text: "  ",
                icon: "success",
                buttons: {visible: false},
                closeOnClickOutside: true,
                closeOnEsc: true,
                timer: 3000
            });
        } catch (err: any) {
            swal("Error!", "Unable to logout properly", "error");
            console.log(err.message);
        } finally {
            logout();
            navigate('/login', { replace: true });
        }
    };

    return (
        <Dropdown.Menu
            align="end"
            className={classNames(
                className,
                'navbar-top-dropdown-menu navbar-dropdown-caret py-0 dropdown-profile shadow border'
            )}
        >
        <Card className="position-relative border-0">
            <Card.Body className="p-0">
            <div className="d-flex flex-column align-items-center justify-content-center gap-2 pt-4 pb-3">
                <Avatar src={avatar} size="xl" />
                <h6 className="text-body-emphasis">{empData.name}</h6>
                <h6 className="text-body-emphasis px-3">{empData.emp_user.email}</h6>
            </div>
            <div style={{ height: '5rem' }}>
                <Scrollbar>
                <Nav className="nav flex-column mb-2 pb-1">
                    {navItems.map(item => (
                    <Nav.Item key={item.label}>
                        <Nav.Link href="#!" className="px-3">
                        <FeatherIcon
                            icon={item.icon}
                            size={16}
                            className="me-2 text-body"
                        />
                        <span className="text-body-highlight">{item.label}</span>
                        </Nav.Link>
                    </Nav.Item>
                    ))}
                </Nav>
                </Scrollbar>
            </div>
            </Card.Body>
            <Card.Footer className="p-0 border-top border-translucent">
            <div className="px-3 pt-2">
                <Link
                to="/login"
                className="btn btn-phoenix-secondary d-flex flex-center w-100"
                onClick={handleLogout}
                >
                <FeatherIcon icon="log-out" className="me-2" size={16} />
                Sign out
                </Link>
            </div>
            <div className="my-2 text-center fw-bold fs-10 text-body-quaternary">
                <Link className="text-body-quaternary me-1" to="#!">
                Privacy policy
                </Link>
                •
                <Link className="text-body-quaternary mx-1" to="#!">
                Terms
                </Link>
                •
                <Link className="text-body-quaternary ms-1" to="#!">
                Cookies
                </Link>
            </div>
            </Card.Footer>
        </Card>
        </Dropdown.Menu>
    );
};

export default ProfileDropdownMenu;
