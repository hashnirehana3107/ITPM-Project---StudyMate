import React, { useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { GraduationCap, Calendar, Info, ArrowRight, CheckCircle, User, BookOpen, Target } from 'lucide-react';
import AuthContext from '../../context/AuthContext';
import './ProfileSetup.css';

const ProfileSetup = () => {
    const { user, updateProfile } = useContext(AuthContext);
    const navigate = useNavigate();

    const [degree, setDegree] = useState(user?.degree || '');
    const [year, setYear] = useState(user?.year || '');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showTooltip, setShowTooltip] = useState(false);

    // If user already has degree/year set, maybe pre-fill or redirect? 
    // For this setup page, we assume they might want to edit or it's first run.

    const handleSubmit = (e) => {
        e.preventDefault();

        if (!degree || !year) {
            alert("Please select both your degree and academic year.");
            return;
        }

        setIsSubmitting(true);

        // Simulate API call
        setTimeout(() => {
            // Update Auth Context with new degree and year
            if (updateProfile) {
                updateProfile({ degree, year });
            }
            setIsSubmitting(false);
            navigate('/dashboard');
        }, 1500);
    };

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

    return (
        <div className="profile-setup-page">
            <div className="profile-setup-container">

                {/* 🎨 Left Side - Visual Section */}
                <div className="profile-visual-side">
                    <div className="visual-content">
                        <div className="visual-icon-wrapper">
                            <Target size={48} className="visual-main-icon" />
                        </div>
                        <h1>Let’s personalize your <br /> <span className="highlight-text">Academic Journey</span></h1>
                        <p>We curate learning materials, internships, and support based on your profile.</p>

                        <div className="visual-graphic">
                            <div className="floating-card card-1">
                                <BookOpen size={24} />
                                <span>Study Materials</span>
                            </div>
                            <div className="floating-card card-2">
                                <User size={24} />
                                <span>Peer Support</span>
                            </div>
                        </div>
                    </div>
                    <div className="visual-bg-shapes">
                        <div className="shape shape-1"></div>
                        <div className="shape shape-2"></div>
                    </div>
                </div>

                {/* 📋 Right Side - Form Section */}
                <div className="profile-form-side">

                    {/* Progress Indicator */}
                    <div className="progress-indicator">
                        <div className="step completed">
                            <div className="step-icon"><CheckCircle size={14} /></div>
                            <span>Account</span>
                        </div>
                        <div className="step-line active"></div>
                        <div className="step active">
                            <div className="step-icon">2</div>
                            <span>Profile</span>
                        </div>
                        <div className="step-line"></div>
                        <div className="step">
                            <div className="step-icon">3</div>
                            <span>Dashboard</span>
                        </div>
                    </div>

                    <div className="form-header">
                        <h2>Set Up Your Academic Profile</h2>
                        <p>This helps us show you the most relevant content</p>
                    </div>

                    <form onSubmit={handleSubmit} className="setup-form">

                        {/* 1️⃣ Degree Selection */}
                        <div className="form-section">
                            <label className="section-label">
                                <GraduationCap size={20} className="label-icon" />
                                Select Degree Program
                            </label>
                            <div className="custom-select-wrapper">
                                <select
                                    value={degree}
                                    onChange={(e) => setDegree(e.target.value)}
                                    className="custom-select"
                                    required
                                >
                                    <option value="" disabled>Choose your degree...</option>
                                    {degrees.map((d) => (
                                        <option key={d} value={d}>{d}</option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        {/* 2️⃣ Academic Year Selection (Cards) */}
                        <div className="form-section">
                            <div className="label-with-tooltip">
                                <label className="section-label">
                                    <Calendar size={20} className="label-icon" />
                                    Academic Year
                                </label>
                                <div
                                    className="info-tooltip-wrapper"
                                    onMouseEnter={() => setShowTooltip(true)}
                                    onMouseLeave={() => setShowTooltip(false)}
                                >
                                    <Info size={16} className="info-icon" />
                                    {showTooltip && (
                                        <div className="custom-tooltip">
                                            Your degree and year will be used to personalize content
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="year-selection-grid">
                                {years.map((y) => (
                                    <label
                                        key={y.value}
                                        className={`year-card ${year === y.value ? 'selected' : ''}`}
                                    >
                                        <input
                                            type="radio"
                                            name="year"
                                            value={y.value}
                                            checked={year === y.value}
                                            onChange={(e) => setYear(e.target.value)}
                                            className="hidden-radio"
                                        />
                                        <span className="year-label">{y.label}</span>
                                    </label>
                                ))}
                            </div>
                        </div>

                        {/* 4️⃣ Save & Continue */}
                        <button
                            type="submit"
                            className={`btn-continue ${isSubmitting ? 'loading' : ''}`}
                            disabled={isSubmitting}
                        >
                            {isSubmitting ? (
                                <span className="spinner-sm"></span>
                            ) : (
                                <>
                                    Continue to Dashboard
                                    <ArrowRight size={20} />
                                </>
                            )}
                        </button>

                    </form>
                </div>
            </div>
        </div>
    );
};

export default ProfileSetup;
