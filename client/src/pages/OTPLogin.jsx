import React, { useState, useRef, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { API_URL } from '../config';
import './OTPLogin.css';

const OTPLogin = () => {
    const [phone, setPhone] = useState('');
    const [otp, setOTP] = useState(['', '', '', '', '', '']);
    const [step, setStep] = useState('phone'); // 'phone' or 'otp'
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [resendTimer, setResendTimer] = useState(0);
    const { setUser } = useContext(AuthContext);
    const navigate = useNavigate();
    const otpInputs = useRef([]);

    // Countdown timer for resend OTP
    useEffect(() => {
        if (resendTimer > 0) {
            const timer = setTimeout(() => setResendTimer(resendTimer - 1), 1000);
            return () => clearTimeout(timer);
        }
    }, [resendTimer]);

    const handlePhoneSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        // Validate phone number
        const phoneRegex = /^[+]?[0-9]{10,15}$/;
        if (!phoneRegex.test(phone)) {
            setError('Please enter a valid phone number');
            setLoading(false);
            return;
        }

        try {
            const response = await fetch(`${API_URL}/api/auth/send-otp`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ phone })
            });

            const data = await response.json();

            if (response.ok) {
                setStep('otp');
                setResendTimer(60); // 60 seconds countdown
                // Focus first OTP input
                setTimeout(() => otpInputs.current[0]?.focus(), 100);
            } else {
                setError(data.message || 'Failed to send OTP');
            }
        } catch (err) {
            setError('Network error. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleOTPChange = (index, value) => {
        // Only allow numbers
        if (value && !/^[0-9]$/.test(value)) return;

        const newOTP = [...otp];
        newOTP[index] = value;
        setOTP(newOTP);

        // Auto-focus next input
        if (value && index < 5) {
            otpInputs.current[index + 1]?.focus();
        }

        // Auto-submit when all 6 digits are entered
        if (index === 5 && value) {
            const fullOTP = newOTP.join('');
            if (fullOTP.length === 6) {
                handleOTPSubmit(fullOTP);
            }
        }
    };

    const handleKeyDown = (index, e) => {
        // Handle backspace
        if (e.key === 'Backspace' && !otp[index] && index > 0) {
            otpInputs.current[index - 1]?.focus();
        }
    };

    const handleOTPSubmit = async (otpValue = null) => {
        const fullOTP = otpValue || otp.join('');

        if (fullOTP.length !== 6) {
            setError('Please enter complete OTP');
            return;
        }

        setError('');
        setLoading(true);

        try {
            const response = await fetch(`${API_URL}/api/auth/verify-otp`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ phone, otp: fullOTP })
            });

            const data = await response.json();

            if (response.ok) {
                // Create user object with token (matching AuthContext structure)
                const userData = { ...data.user, token: data.token };

                // Update state and localStorage
                setUser(userData);
                localStorage.setItem('user', JSON.stringify(userData));

                // Legacy support (optional, can be removed if not used elsewhere)
                localStorage.setItem('userInfo', JSON.stringify(data.user));
                localStorage.setItem('token', data.token);

                // Navigate based on role
                if (data.user.role === 'admin') {
                    navigate('/admin/dashboard');
                } else if (data.user.role === 'delivery') {
                    navigate('/delivery/dashboard');
                } else {
                    navigate('/');
                }
            } else {
                setError(data.message || 'Invalid OTP');
                setOTP(['', '', '', '', '', '']);
                otpInputs.current[0]?.focus();
            }
        } catch (err) {
            setError('Network error. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleResendOTP = async () => {
        if (resendTimer > 0) return;

        setError('');
        setLoading(true);

        try {
            const response = await fetch(`${API_URL}/api/auth/resend-otp`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ phone })
            });

            const data = await response.json();

            if (response.ok) {
                setResendTimer(60);
                setOTP(['', '', '', '', '', '']);
                otpInputs.current[0]?.focus();
            } else {
                setError(data.message || 'Failed to resend OTP');
            }
        } catch (err) {
            setError('Network error. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleChangePhone = () => {
        setStep('phone');
        setOTP(['', '', '', '', '', '']);
        setError('');
    };

    return (
        <div className="otp-login-container">
            <div className="otp-login-card">
                <div className="otp-login-header">
                    <h2>📱 Login with OTP</h2>
                    <p className="subtitle">
                        {step === 'phone'
                            ? 'Enter your phone number to receive OTP'
                            : `OTP sent to ${phone}`}
                    </p>
                </div>

                {error && <div className="error-alert">{error}</div>}

                {step === 'phone' ? (
                    <form onSubmit={handlePhoneSubmit} className="phone-form">
                        <div className="form-group">
                            <label>Phone Number</label>
                            <input
                                type="tel"
                                value={phone}
                                onChange={(e) => setPhone(e.target.value)}
                                placeholder="+91XXXXXXXXXX"
                                className="phone-input"
                                required
                                disabled={loading}
                            />
                            <small className="input-hint">
                                Include country code (e.g., +91 for India)
                            </small>
                        </div>

                        <button
                            type="submit"
                            className="btn-submit"
                            disabled={loading}
                        >
                            {loading ? 'Sending OTP...' : 'Send OTP'}
                        </button>

                        <p className="form-footer">
                            Prefer email? <Link to="/login">Login with Email</Link>
                        </p>
                    </form>
                ) : (
                    <div className="otp-form">
                        <div className="otp-inputs">
                            {otp.map((digit, index) => (
                                <input
                                    key={index}
                                    ref={(el) => (otpInputs.current[index] = el)}
                                    type="text"
                                    maxLength="1"
                                    value={digit}
                                    onChange={(e) => handleOTPChange(index, e.target.value)}
                                    onKeyDown={(e) => handleKeyDown(index, e)}
                                    className="otp-input"
                                    disabled={loading}
                                />
                            ))}
                        </div>

                        <div className="otp-actions">
                            <button
                                type="button"
                                onClick={handleChangePhone}
                                className="btn-change-phone"
                                disabled={loading}
                            >
                                Change Phone Number
                            </button>

                            {resendTimer > 0 ? (
                                <p className="resend-timer">
                                    Resend OTP in {resendTimer}s
                                </p>
                            ) : (
                                <button
                                    type="button"
                                    onClick={handleResendOTP}
                                    className="btn-resend"
                                    disabled={loading}
                                >
                                    Resend OTP
                                </button>
                            )}
                        </div>

                        <p className="form-footer">
                            Didn't receive OTP? Check your phone or try again
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default OTPLogin;
