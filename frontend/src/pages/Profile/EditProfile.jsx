import React, { useState, useContext, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, GraduationCap, Calendar, Save, X, AlertCircle, ArrowLeft, CheckCircle, Mail, Camera, Upload } from 'lucide-react';
import AuthContext from '../../context/AuthContext';
import './EditProfile.css';

const EditProfile = () => {
    const { user, updateProfile } = useContext(AuthContext);
    const navigate = useNavigate();
    const fileInputRef = useRef(null);

    const [formData, setFormData] = useState({
        name: '',
        email: '',
        degree: '',
        year: '',
        profilePhoto: ''
    });
    const [previewPhoto, setPreviewPhoto] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);

    // Pre-fill form with current user data
    useEffect(() => {
        if (user) {
            setFormData({
                name: user.name || '',
                email: user.email || '',
                degree: user.degree || '',
                year: user.year || '',
                profilePhoto: user.profilePhoto || ''
            });
            if (user.profilePhoto) {
                setPreviewPhoto(user.profilePhoto);
            }
        }
    }, [user]);

    const degrees = [
        "Information Technology",
        "Business Management",
        "Engineering",
        "Science & Humanities"
    ];

    const years = [
        { value: "1", label: "1st Year" },
        { value: "2", label: "2nd Year" },
        { value: "3", label: "3rd Year" },
        { value: "4", label: "4th Year" }
    ];

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
        setError('');
    };

    const handlePhotoChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            if (file.size > 2 * 1024 * 1024) {
                setError("Image size should be less than 2MB");
                return;
            }
            const reader = new FileReader();
            reader.onloadend = () => {
                setPreviewPhoto(reader.result);
                setFormData(prev => ({ ...prev, profilePhoto: reader.result }));
            };
            reader.readAsDataURL(file);
        }
    };

    const triggerFileInput = () => {
        fileInputRef.current.click();
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!formData.name || !formData.email || !formData.degree || !formData.year) {
            setError("Please fill in all required fields.");
            return;
        }

        setIsSubmitting(true);

        // Real API Update Call
        if (updateProfile) {
            const result = await updateProfile(formData);
            if (result && result.success) {
                setSuccess(true);
                setIsSubmitting(false);

                // Redirect after short delay
                setTimeout(() => {
                    navigate('/profile'); 
                }, 1500);
            } else {
                setError(result?.message || "Failed to update profile. Please try again.");
                setIsSubmitting(false);
            }
        } else {
            setError("Auth context not fully loaded.");
            setIsSubmitting(false);
        }
    };

    return (
        <div className="edit-profile-page animate-fade-in">
            <div className="edit-profile-container">

                {/* 🔙 Back Navigation */}
                <button onClick={() => navigate('/profile')} className="back-btn">
                    <ArrowLeft size={20} /> Back to Profile
                </button>

                <div className="edit-card">

                    {/* 🖼️ Header Section */}
                    <div className="edit-header">
                        <h1>Edit Personal Profile</h1>
                        <p>Keep your academic identity updated for a better experience.</p>
                    </div>

                    {/* ✅ Success Message */}
                    {success && (
                        <div className="success-message animate-slide-up">
                            <CheckCircle size={20} />
                            <span>Profile updated successfully! Returning...</span>
                        </div>
                    )}

                    {/* ⚠️ Error Message */}
                    {error && (
                        <div className="error-message animate-shake">
                            <AlertCircle size={20} />
                            <span>{error}</span>
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="edit-form">
                        
                        {/* 📸 Profile Photo Section */}
                        <div className="photo-upload-section">
                            <div className="photo-preview-container" onClick={triggerFileInput}>
                                {previewPhoto ? (
                                    <img src={previewPhoto} alt="Profile Preview" className="photo-preview-img" />
                                ) : (
                                    <div className="photo-placeholder">
                                        <User size={48} />
                                    </div>
                                )}
                                <div className="photo-overlay">
                                    <Camera size={20} />
                                </div>
                            </div>
                            <input 
                                type="file" 
                                ref={fileInputRef} 
                                onChange={handlePhotoChange} 
                                accept="image/*" 
                                className="hidden-file-input"
                            />
                            <div className="photo-upload-text">
                                <p>Profile Picture</p>
                                <span>JPG, PNG OR GIF • Max 2MB</span>
                            </div>
                        </div>

                        {/* 👤 Name & Email */}
                        <div className="form-row">
                            <div className="form-group">
                                <label className="form-label">
                                    <User size={18} className="label-icon" /> Full Name
                                </label>
                                <input
                                    type="text"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleChange}
                                    className="custom-input"
                                    placeholder="Enter your name"
                                    required
                                />
                            </div>

                            <div className="form-group">
                                <label className="form-label">
                                    <Mail size={18} className="label-icon" /> Email Address
                                </label>
                                <input
                                    type="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    className="custom-input"
                                    placeholder="your@email.com"
                                    required
                                />
                            </div>
                        </div>

                        {/* 🎓 Degree Program */}
                        <div className="form-group">
                            <label className="form-label">
                                <GraduationCap size={18} className="label-icon" /> Degree Program
                            </label>
                            <div className="select-wrapper">
                                <select
                                    name="degree"
                                    value={formData.degree}
                                    onChange={handleChange}
                                    className="custom-select"
                                    required
                                >
                                    <option value="" disabled>Select your degree</option>
                                    {degrees.map((deg) => (
                                        <option key={deg} value={deg}>{deg}</option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        {/* 📅 Academic Year */}
                        <div className="form-group">
                            <label className="form-label">
                                <Calendar size={18} className="label-icon" /> Academic Year
                            </label>
                            <div className="year-selector-grid">
                                {years.map((y) => (
                                    <label
                                        key={y.value}
                                        className={`year-option-card ${formData.year === y.value ? 'selected' : ''}`}
                                    >
                                        <input
                                            type="radio"
                                            name="year"
                                            value={y.value}
                                            checked={formData.year === y.value}
                                            onChange={handleChange}
                                            className="hidden-radio"
                                        />
                                        <span className="year-text">{y.label}</span>
                                    </label>
                                ))}
                            </div>
                        </div>

                        {/* 🔘 Action Buttons */}
                        <div className="form-actions">
                            <button
                                type="button"
                                onClick={() => navigate('/profile')}
                                className="btn-cancel"
                                disabled={isSubmitting || success}
                            >
                                <X size={18} /> Cancel
                            </button>
                            <button
                                type="submit"
                                className="btn-save"
                                disabled={isSubmitting || success}
                            >
                                {isSubmitting ? (
                                    <span className="spinner-sm"></span>
                                ) : (
                                    <><Save size={18} /> Save Changes</>
                                )}
                            </button>
                        </div>

                    </form>
                </div>
            </div>
        </div>
    );
};

export default EditProfile;
