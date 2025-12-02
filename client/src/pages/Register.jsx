import React, { useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import FormInput, { validators } from '../components/FormInput';
import './Login.css';

const Register = () => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const { register } = useContext(AuthContext);
    const navigate = useNavigate();
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            await register(name, email, password);
            navigate('/');
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="login-container">
            <form className="login-form" onSubmit={handleSubmit}>
                <h2>Create Account</h2>
                <p className="subtitle">Join us today</p>

                {error && <div className="error-alert">{error}</div>}

                <FormInput
                    label="Full Name"
                    type="text"
                    name="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    validation={validators.required}
                    placeholder="Enter your full name"
                    required
                />

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
                    validation={validators.password}
                    placeholder="Min 8 chars, uppercase, lowercase, number"
                    required
                />

                <button type="submit" disabled={loading} className="btn-submit">
                    {loading ? 'Creating Account...' : 'Register'}
                </button>

                <p className="form-footer">
                    Already have an account? <Link to="/login">Login</Link>
                </p>
            </form>
        </div>
    );
};

export default Register;
