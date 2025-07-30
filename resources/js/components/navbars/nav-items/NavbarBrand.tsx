import classNames from 'classnames';
import { useAppContext } from '../../../providers/AppProvider';
import { Navbar } from 'react-bootstrap';
import logo from '../../../assets/img/icons/logo.png';
import main from '../../../assets/img/icons/main.jpg';
import { useBreakpoints } from '../../../providers/BreakpointsProvider';
import NavbarToggleButton from './NavbarToggleButton';
import { Link } from 'react-router-dom';

const NavbarBrand = () => {
  const {
    config: { navbarTopShape, navbarPosition }
  } = useAppContext();
  const { breakpoints } = useBreakpoints();

  return (
    <>
      <div className="navbar-logo p-2">
        {breakpoints.down('lg') && <NavbarToggleButton />}
        <Navbar.Brand
          as={Link}
          to="/"
          className={classNames({
            'me-1 me-sm-3':
              navbarTopShape === 'slim' || navbarPosition === 'horizontal'
          })}
        >
          {navbarTopShape === 'slim' ? (
            <>
              phoenix{' '}
              <span className="text-body-highlight d-none d-sm-inline">
                slim
              </span>
            </>
          ) : (
            <div className="d-flex align-items-center">
              {/* <img src={main} alt="phoenix" width={180} height={55} /> */}
              {/* <p className="logo-text ms-2 d-none d-sm-block">phoenix</p> */}
            </div>
          )}
        </Navbar.Brand>
      </div>
      {(import.meta.env.VITE_APP_ENV != 'production') && (
        // <h3>{import.meta.env.VITE_APP_ENV ?? 'CRM-TEST'}</h3>
        <h3
          style={{
            color: '#375494',
            fontWeight: 600,
            fontSize: '32px',
            fontFamily: 'Nunito Sans',
            fontStyle: 'normal'
          }}
        >
          {import.meta.env.VITE_APP_ENV ?? 'Welcome to IDIMS Pro'}
        </h3>


      )}
    </>
  );
};

export default NavbarBrand;
