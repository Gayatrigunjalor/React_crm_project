import { faKey, faUser, faEye, faEyeSlash } from '@fortawesome/free-solid-svg-icons';
import { faGoogle } from '@fortawesome/free-brands-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import Button from '../../components/base/Button';
import { Form } from 'react-bootstrap';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../../axios';
import { useAuth } from '../../AuthContext';
import TwoFactorChallenge from './TwoFactorChallenge';

const SignInForm = ({ layout }: { layout: 'simple' | 'card' | 'split' }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [googleError, setGoogleError] = useState('');
    const [loading, setLoading] = useState(false);
    const [googleLoading, setGoogleLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    const [requires2FA, setRequires2FA] = useState(false);
    // const [tempToken, setTempToken] = useState('');

    const navigate = useNavigate(); // Initialize navigate
    const { login, saveUserRole, saveUserPermission, saveEmpData } = useAuth();

    useEffect(() => {
        // Async function to fetch user info and update state
        const fetchAndSaveUserInfo = async () => {
            try {
                const response = await axiosInstance.get('/user/roles-permissions');
                const data = response.data;

                saveEmpData(data.emp_data);
                saveUserRole(data.role);
                saveUserPermission(data.permissions);

                // Navigate after saving data
                navigate("/crm");
            } catch (error) {
                console.error('Failed to fetch user info:', error);
            // Optionally handle error state here
            }
        };

        // Message event handler (must be synchronous)
        const handleMessage = (event: MessageEvent) => {
            if (event.origin !== window.location.origin) return;

            const data = event.data;
            if ('statusCode' in data) {
                if (data.statusCode === 200) {
                    login(data.token);

                    // Call async function but don't await here (event handler is sync)
                    fetchAndSaveUserInfo();
                } else {
                    setGoogleError(data.message);
                }
            }
        };

        window.addEventListener('message', handleMessage);

        return () => {
            window.removeEventListener('message', handleMessage);
        };
    }, []);


    const handleGoogleLogin = async () => {
        setGoogleLoading(true)
        let url = `${import.meta.env.VITE_API_URL}/auth/google/redirect`;

        try {
            const response = await axiosInstance.get(url);

            if(response.status !== 200) {
                throw new Error('Failed to fetch data');
            }

            const data = await response.data;

            const width = 600;
            const height = 700;
            const left = window.screen.width / 2 - width / 2;
            const top = window.screen.height / 2 - height / 2;

            const popup = window.open(
                data.url,
                'SignInForm',
                `width=${width},height=${height},top=${top},left=${left}`
            );

        } catch (e) {

        } finally {
            setGoogleLoading(false)
        }

    }

    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault(); // Prevent default form submission

        setLoading(true);
        try {
            const response = await axiosInstance.post('/login', {
                email,
                password,
            });

            // Handle successful login (e.g., save token, redirect)
            console.log('Login successful:', response.data);
            if (response.data.two_factor) {
                setRequires2FA(true);
                // setTempToken(response.data.temp_token);
            } else {
                setRequires2FA(false);
                login(await response.data.token);
                const userInfo = await axiosInstance.get('/user/roles-permissions');
                saveEmpData(userInfo.data.emp_data);
                saveUserRole(userInfo.data.role);
                saveUserPermission(userInfo.data.permissions);
                //Navigate to home page
                navigate("/crm");
                // Handle normal login
            }
        } catch (err: any) {
            // Handle error (e.g., display error message)
            if (err.status === 422) {
                setError(err.data.message || 'Login failed. Please try again.');
            } else if(err.status === 419) {
                setError(err.data.message || 'You were idle too long. Please refresh the page and try logging again');
            } else {
                console.error('Unexpected error:', err);
                setError('Login failed. Please try again.');
            }
        } finally {
            setLoading(false);
        }
    };
    return (
        <>
            {requires2FA ? (
                <TwoFactorChallenge
                    // tempToken={tempToken}
                    onSuccess={async (token) => {
                        login(token);
                        const userInfo = await axiosInstance.get('/user/roles-permissions');
                        saveEmpData(userInfo.data.emp_data);
                        saveUserRole(userInfo.data.role);
                        saveUserPermission(userInfo.data.permissions);
                        navigate("/crm");
                    }}
                />
            ) : (
                <>
                    <div className="text-center mb-7">
                        <h3 className="text-body-highlight">Sign In</h3>
                        <p className="text-body-tertiary">Get access to your account</p>
                    </div>
                    <Form onSubmit={handleSubmit}>
                        <Form.Group className="mb-3 text-start">
                            <Form.Label htmlFor="email">Email address</Form.Label>
                            <div className="form-icon-container">
                            <Form.Control
                                id="email"
                                type="email"
                                className="form-icon-input"
                                placeholder="name@example.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)} // Update email state
                            />
                            <FontAwesomeIcon icon={faUser} className="text-body fs-9 form-icon" />
                            </div>
                        </Form.Group>
                        <Form.Group className="mb-3 text-start">
                            <Form.Label htmlFor="password">Password</Form.Label>
                            <div className="form-icon-container position-relative">
                                <Form.Control
                                    id="password"
                                    type={showPassword ? "text" : "password"}
                                    className="form-icon-input pe-5 ps-5"
                                    placeholder="Password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                />
                                <div className="position-absolute start-0 top-50 translate-middle-y ps-3">
                                    <FontAwesomeIcon icon={faKey} className="text-body fs-9" />
                                </div>
                                <div className="position-absolute end-0 top-50 translate-middle-y pe-3">
                                    <FontAwesomeIcon
                                        icon={showPassword ? faEyeSlash : faEye}
                                        className="text-body fs-9"
                                        style={{ cursor: 'pointer' }}
                                        onClick={() => setShowPassword(!showPassword)}
                                    />
                                </div>
                            </div>
                        </Form.Group>
                        {error && <div className="text-danger mb-3">{error}</div>} {/* Display error message */}
                        <Button variant="primary" loading={loading} type="submit" className="w-100 mb-3">
                            Sign In
                        </Button>
                    </Form>

                    {(import.meta.env.VITE_GOOGLE_LOGIN_ENABLED == 1) ? (
                        <>
                            <div className="position-relative">
                                <hr className="bg-body-secondary mt-5 mb-4" />
                                <div className="divider-content-center">or use email</div>
                            </div>
                            {googleError && <div className="text-danger mb-3">{googleError}</div>} {/* Display error message */}
                            <Button
                                variant="phoenix-secondary"
                                className="w-100 mb-3"
                                onClick={handleGoogleLogin}
                                startIcon={ <FontAwesomeIcon icon={faGoogle} className="text-danger me-2 fs-9" /> }
                                loading={googleLoading}
                            >
                                Sign in with google
                            </Button>
                        </>
                    ) : '' }
                </>
            )}
        </>

    );
};

export default SignInForm;
