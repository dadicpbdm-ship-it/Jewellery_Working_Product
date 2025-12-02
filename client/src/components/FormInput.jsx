import React, { useState } from 'react';
import './FormInput.css';

const FormInput = ({
    label,
    type = 'text',
    name,
    value,
    onChange,
    onBlur,
    placeholder,
    required = false,
    validation,
    errorMessage,
    ...props
}) => {
    const [touched, setTouched] = useState(false);
    const [error, setError] = useState('');

    const handleBlur = (e) => {
        setTouched(true);

        if (validation) {
            const validationError = validation(e.target.value);
            setError(validationError || '');
        }

        if (onBlur) {
            onBlur(e);
        }
    };

    const handleChange = (e) => {
        // Clear error on change if field was touched
        if (touched && validation) {
            const validationError = validation(e.target.value);
            setError(validationError || '');
        }

        onChange(e);
    };

    const showError = touched && (error || errorMessage);

    return (
        <div className="form-input-group">
            {label && (
                <label htmlFor={name} className="form-label">
                    {label}
                    {required && <span className="required">*</span>}
                </label>
            )}

            <input
                type={type}
                id={name}
                name={name}
                value={value}
                onChange={handleChange}
                onBlur={handleBlur}
                placeholder={placeholder}
                required={required}
                className={`form-input ${showError ? 'error' : ''} ${touched && !error ? 'valid' : ''}`}
                aria-invalid={showError ? 'true' : 'false'}
                aria-describedby={showError ? `${name}-error` : undefined}
                {...props}
            />

            {showError && (
                <span id={`${name}-error`} className="error-message" role="alert">
                    {error || errorMessage}
                </span>
            )}

            {touched && !error && value && (
                <span className="success-indicator" aria-label="Valid input">✓</span>
            )}
        </div>
    );
};

// Common validation functions
export const validators = {
    email: (value) => {
        if (!value) return 'Email is required';
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(value) ? '' : 'Please enter a valid email address';
    },

    password: (value) => {
        if (!value) return 'Password is required';
        if (value.length < 8) return 'Password must be at least 8 characters';
        if (!/(?=.*[a-z])/.test(value)) return 'Password must contain a lowercase letter';
        if (!/(?=.*[A-Z])/.test(value)) return 'Password must contain an uppercase letter';
        if (!/(?=.*\d)/.test(value)) return 'Password must contain a number';
        return '';
    },

    phone: (value) => {
        if (!value) return '';
        const phoneRegex = /^[6-9]\d{9}$/;
        return phoneRegex.test(value) ? '' : 'Please enter a valid 10-digit phone number';
    },

    required: (value) => {
        return value && value.trim() ? '' : 'This field is required';
    },

    minLength: (min) => (value) => {
        return value && value.length >= min ? '' : `Minimum ${min} characters required`;
    },

    maxLength: (max) => (value) => {
        return value && value.length <= max ? '' : `Maximum ${max} characters allowed`;
    }
};

export default FormInput;
