import React, { useState } from 'react';
import axiosInstance from '../../axios';
import { Form } from 'react-bootstrap';
import Button from '../../components/base/Button';
import { faGoogle } from '@fortawesome/free-brands-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

interface State {
    useRecovery: boolean;
    code: string;
    recoveryCode: string;
    errors: any; // Use a more specific type if possible
}

interface TwoFactorChallengeProps {
    // tempToken: string;
    onSuccess: (token: string) => void;
}

const TwoFactorChallenge = ({ onSuccess }: TwoFactorChallengeProps) => {
    const [code, setCode] = useState('');
    const [recoveryCode, setRecoveryCode] = useState('');
    const [useRecovery, setUseRecovery] = useState(false);
    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);


    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        setLoading(true);
        try {
            const response = await axiosInstance.post('/two-factor-challenge-submit',
                useRecovery ? { recovery_code: recoveryCode } : { code },
            );

            onSuccess(response.data.token);
        } catch (error) {
            setErrors([error.response?.data?.message || 'Verification failed']);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="guest-layout">
            <div className="auth-card">
                <h4 className="logo">Welcome To IDIMS</h4>

                <div className="challenge-container">
                    <div className={`mb-4 mt-1 hint`}>
                        { useRecovery ? 'Please enter an emergency recovery code' : 'Please confirm access using your authenticator code' }
                    </div>

                    {errors.code && <div className="validation-errors">{errors.code[0]}</div>}

                    <form onSubmit={handleSubmit}>
                        {!useRecovery ? (
                            <Form.Group className="mb-3 text-start">
                                <Form.Label htmlFor="authentication_code">Authentication Code</Form.Label>
                                <Form.Control
                                    id="authentication_code"
                                    type="text"
                                    value={code}
                                    onChange={(e) => setCode(e.target.value)}
                                    autoFocus
                                    inputMode="numeric"
                                    className="form-icon-input"
                                />
                            </Form.Group>

                        ) : (
                            <Form.Group className="mb-3 text-start">
                                <Form.Label htmlFor="authentication_code">Recovery Code</Form.Label>
                                <Form.Control
                                    type="text"
                                    value={recoveryCode}
                                    onChange={(e) => setRecoveryCode(e.target.value)}
                                    className="form-icon-input"
                                    autoFocus
                                />
                            </Form.Group>
                        )}

                        <div className="flex justify-between items-center mt-4">
                            <Button
                                variant="phoenix-secondary"
                                className="w-100 mb-3"
                                onClick={() => {
                                    setUseRecovery(!useRecovery);
                                    setErrors({});
                                }}
                            >
                                { useRecovery ? 'Use authentication code' : 'Use recovery code' }
                            </Button>
                            <Button
                                type="submit"
                                variant="primary"
                                className="w-100 mb-3"
                                loading={loading}
                            >
                                Sign in
                            </Button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default TwoFactorChallenge;
