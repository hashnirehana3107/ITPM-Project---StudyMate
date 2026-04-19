import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock, Key, Shield, Eye, EyeOff, Save, X, check, AlertCircle, CheckCircle, ArrowLeft } from 'lucide-react';
import './ChangePassword.css';

const ChangePassword = () => {
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
    });

    const [showPassword, setShowPassword] = useState({
        current: false,
        new: false,
        confirm: false
    });

    const [strength, setStrength] = useState(0);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const checkStrength = (pass) => {
        let score = 0;
        if (pass.length > 7) score++;
        if (pass.match(/[A-Z]/)) score++;
        if (pass.match(/[0-9]/)) score++;
        if (pass.match(/[^A-Za-z0-9]/)) score++;
        setStrength(score);
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));

        if (name === 'newPassword') {
            checkStrength(value);
        }
        setError('');
    };

    const toggleShow = (field) => {
        setShowPassword(prev => ({ ...prev, [field]: !prev[field] }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        setError('');

        if (!formData.currentPassword || !formData.newPassword || !formData.confirmPassword) {
            setError('All fields are required.');
            return;
        }

        if (formData.newPassword !== formData.confirmPassword) {
            setError('New passwords do not match.');
            return;
        }

        if (strength < 3) {
            setError('Password is too weak. Include numbers and symbols.');
            return;
        }

        setIsSubmitting(true);

        // Simulate API call
        setTimeout(() => {
            setIsSubmitting(false);
            setSuccess(true);
            setTimeout(() => {
                navigate('/profile');
            }, 2000);
        }, 1500);
    };

    const getStrengthLabel = () => {
        switch (strength) {
            case 0: return { label: 'Weak', color: '#EF4444', width: '25%' };
            case 1: return { label: 'Weak', color: '#EF4444', width: '25%' };
            case 2: return { label: 'Medium', color: '#F59E0B', width: '50%' };
            case 3: return { label: 'Strong', color: '#10B981', width: '75%' };
            case 4: return { label: 'Very Strong', color: '#64FFDA', width: '100%' };
            default: return { label: '', color: '#334155', width: '0%' };
        }
    };

    const strengthInfo = getStrengthLabel();

    return (
        <div className="change-password-page animate-fade-in">
            <div className="cp-container">
                {/* 🔙 Back Navigation */}
                <button onClick={() => navigate('/profile')} className="cp-back-btn">
                    <ArrowLeft size={20} /> Back to Profile
                </button>

                <div className="cp-card">
                    {/* Header */}
                    <div className="cp-header">
                        <div className="cp-icon-wrapper">
                            <Lock size={32} />
                            <div className="cp-badge"><Shield size={14} /></div>
                        </div>
                        <h1>Change Password</h1>
                        <p>Keep your account secure by updating your password</p>
                    </div>

                    {/* Messages */}
                    {error && (
                        <div className="cp-alert error animate-shake">
                            <AlertCircle size={18} /> {error}
                        </div>
                    )}
                    {success && (
                        <div className="cp-alert success animate-slide-up">
                            <CheckCircle size={18} /> Password updated successfully!
                        </div>
                    )}

                    {/* Form */}
                    <form onSubmit={handleSubmit} className="cp-form">

                        {/* Current Password */}
                        <div className="cp-form-group">
                            <label><Key size={16} className="cp-label-icon" /> Current Password</label>
                            <div className="cp-input-wrapper">
                                <input
                                    type={showPassword.current ? "text" : "password"}
                                    name="currentPassword"
                                    value={formData.currentPassword}
                                    onChange={handleChange}
                                    placeholder="Enter current password"
                                />
                                <button type="button" className="cp-toggle" onClick={() => toggleShow('current')}>
                                    {showPassword.current ? <EyeOff size={18} /> : <Eye size={18} />}
                                </button>
                            </div>
                        </div>

                        {/* New Password */}
                        <div className="cp-form-group">
                            <label><Shield size={16} className="cp-label-icon" /> New Password</label>
                            <div className="cp-input-wrapper">
                                <input
                                    type={showPassword.new ? "text" : "password"}
                                    name="newPassword"
                                    value={formData.newPassword}
                                    onChange={handleChange}
                                    placeholder="Enter new password"
                                />
                                <button type="button" className="cp-toggle" onClick={() => toggleShow('new')}>
                                    {showPassword.new ? <EyeOff size={18} /> : <Eye size={18} />}
                                </button>
                            </div>

                            {/* Strength Meter */}
                            {formData.newPassword && (
                                <div className="password-strength-meter">
                                    <div className="strength-bar-bg">
                                        <div
                                            className="strength-bar-fill"
                                            style={{ width: strengthInfo.width, backgroundColor: strengthInfo.color }}
                                        ></div>
                                    </div>
                                    <span style={{ color: strengthInfo.color }}>{strengthInfo.label}</span>
                                </div>
                            )}
                        </div>

                        {/* Confirm Password */}
                        <div className="cp-form-group">
                            <label><CheckCircle size={16} className="cp-label-icon" /> Confirm Password</label>
                            <div className={`cp-input-wrapper ${formData.confirmPassword && formData.newPassword !== formData.confirmPassword ? 'mismatch' : ''}`}>
                                <input
                                    type={showPassword.confirm ? "text" : "password"}
                                    name="confirmPassword"
                                    value={formData.confirmPassword}
                                    onChange={handleChange}
                                    placeholder="Confirm new password"
                                />
                                <button type="button" className="cp-toggle" onClick={() => toggleShow('confirm')}>
                                    {showPassword.confirm ? <EyeOff size={18} /> : <Eye size={18} />}
                                </button>
                            </div>
                            {formData.confirmPassword && formData.newPassword !== formData.confirmPassword && (
                                <span className="mismatch-text">Passwords do not match</span>
                            )}
                        </div>

                        {/* Security Info */}
                        <div className="cp-info-box">
                            <Lock size={16} className="info-icon" />
                            <p>Your password is encrypted and securely stored. We never share your credentials.</p>
                        </div>

                        {/* Actions */}
                        <div className="cp-actions">
                            <button type="button" className="btn-ghost" onClick={() => navigate('/profile')}>
                                <X size={18} /> Cancel
                            </button>
                            <button type="submit" className="btn-primary" disabled={isSubmitting || success}>
                                {isSubmitting ? <span className="spinner-sm"></span> : <><Save size={18} /> Update Password</>}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default ChangePassword;
