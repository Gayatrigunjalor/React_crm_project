import SignInForm from './SignInForm';
import AuthCardLayout from '../../layouts/AuthCardLayout';
import { Outlet } from 'react-router-dom';

const SignIn = () => {
    return (
        <AuthCardLayout className="pb-md-7">
            <Outlet />
            <SignInForm layout="card" />
        </AuthCardLayout>
    );
};

export default SignIn;
