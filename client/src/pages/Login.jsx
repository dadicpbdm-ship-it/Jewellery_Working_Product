import React, { useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import FormInput, { validators } from '../components/FormInput';
import './Login.css';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const { login } = useContext(AuthContext);
    const navigate = useNavigate();
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const data = await login(email, password);
            if (data.role === 'admin') {
                navigate('/admin/dashboard');
            } else if (data.role === 'delivery') {
                navigate('/delivery/dashboard');
            } else {
                navigate('/');
            }
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="login-container">
            <form className="login-form" onSubmit={handleSubmit}>
                <h2>Welcome Back</h2>
                <p className="subtitle">Login to your account</p>

                {error && <div className="error-alert">{error}</div>}

                <FormInput
                    label="Email Address"
                    type="email"
                    name="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    validation={validators.email}
                    placeholder="your@email.com"
                    required
                />

                <FormInput
                    label="Password"
                    type="password"
                    name="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    validation={validators.required}
                    placeholder="Enter your password"
                    required
                />

                <button type="submit" disabled={loading} className="btn-submit">
                    {loading ? 'Logging in...' : 'Login'}
                </button>

                <p className="form-footer">
                    Don't have an account? <Link to="/register">Register</Link>
                </p>
            </form>
        </div>
    );
};

export default Login;
