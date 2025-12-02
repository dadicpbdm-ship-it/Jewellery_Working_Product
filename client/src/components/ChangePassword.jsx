import React, { useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { API_URL } from '../config';

const ChangePassword = ({ onSuccess }) => {
    const { user } = useContext(AuthContext);
    const { success, error } = useToast();
    const [formData, setFormData] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
    });
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Validation
        if (formData.newPassword !== formData.confirmPassword) {
            error('New passwords do not match');
            return;
        }

        if (formData.newPassword.length < 8) {
            error('Password must be at least 8 characters long');
            return;
        }

        setLoading(true);

        try {
            const response = await fetch(`${API_URL}/api/users/profile/password`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${user.token}`
                },
                body: JSON.stringify({
                    currentPassword: formData.currentPassword,
                    newPassword: formData.newPassword
                })
            });

            const data = await response.json();

            if (response.ok) {
                success('Password updated successfully!');
                setFormData({ currentPassword: '', newPassword: '', confirmPassword: '' });
                if (onSuccess) {
                    setTimeout(() => onSuccess(), 1000); // Close modal after showing success message
                }
            } else {
                error(data.message || 'Failed to update password');
            }
        } catch (err) {
            error('Error updating password');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="change-password-section">
            <h2>Change Password</h2>
            <form onSubmit={handleSubmit} className="password-form">
                <div className="form-group">
                    <label>Current Password</label>
                    <input
                        type="password"
                        name="currentPassword"
                        value={formData.currentPassword}
                        onChange={handleChange}
                        required
                        placeholder="Enter current password"
                    />
                </div>

                <div className="form-group">
                    <label>New Password</label>
                    <input
                        type="password"
                        name="newPassword"
                        value={formData.newPassword}
                        onChange={handleChange}
                        required
                        placeholder="Enter new password (min 8 characters)"
                    />
                </div>

                <div className="form-group">
                    <label>Confirm New Password</label>
                    <input
                        type="password"
                        name="confirmPassword"
                        value={formData.confirmPassword}
                        onChange={handleChange}
                        required
                        placeholder="Confirm new password"
                    />
                </div>

                <button type="submit" disabled={loading} className="btn-primary">
                    {loading ? 'Updating...' : 'Update Password'}
                </button>
            </form>
        </div>
    );
};

export default ChangePassword;
