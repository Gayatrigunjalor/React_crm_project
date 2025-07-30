import { Navbar } from 'react-bootstrap';
import NavbarBrand from '../nav-items/NavbarBrand';
import NavItems from '../nav-items/NavItems';
import NavbarTopNav from '../navbar-horizontal/NavbarTopNav';
import { useAppContext } from '../../../providers/AppProvider';

const NavbarDual = () => {
    const {
        config: { navbarTopAppearance }
    } = useAppContext();

    return (
        <Navbar className="navbar-top fixed-top" expand="lg" variant="" data-navbar-appearance={navbarTopAppearance === 'darker' ? 'darker' : ''} >
            <div className="w-100">
                <div className="d-flex flex-between-center dual-nav-first-layer">
                    <NavbarBrand />
                    <NavItems />
                </div>
                <Navbar.Collapse className="navbar-top-collapse justify-content-center" id="basic-navbar-nav" >
                <NavbarTopNav />
                </Navbar.Collapse>
            </div>
        </Navbar>
    );
};

export default NavbarDual;
