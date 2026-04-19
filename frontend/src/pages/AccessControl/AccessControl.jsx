import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldAlert, Lock, UserCheck, Key, ArrowLeft, Home, LogIn, Mail } from 'lucide-react';
import './AccessControl.css';

const AccessControl = () => {
    const navigate = useNavigate();

    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    return (
        <div className="access-page">
            <div className="access-container">
                {/* 🔙 Navigation */}
                <div className="access-nav animate-fade-in">
                    <button onClick={() => navigate(-1)} className="btn-back-access">
                        <ArrowLeft size={20} />
                        Go Back
                    </button>
                </div>

                <div className="access-card animate-bounce-in">
                    <div className="access-header">
                        <div className="shield-wrapper">
                            <ShieldAlert size={60} className="shield-icon" />
                            <div className="radar-ping"></div>
                        </div>
                        <h1 className="glow-text">Access Control</h1>
                        <p className="subtitle">Security & Permissions Management</p>
                    </div>

                    <div className="access-body">
                        <div className="restriction-notice">
                            <Lock className="lock-icon" size={20} />
                            <span>This area is restricted to authorized personnel only.</span>
                        </div>

                        <div className="info-grid">
                            <div className="info-item">
                                <div className="info-icon-bg shadow-blue">
                                    <UserCheck size={24} />
                                </div>
                                <h3>User Roles</h3>
                                <p>Access levels are determined by your assigned role: Student, Moderator, or Admin.</p>
                            </div>

                            <div className="info-item">
                                <div className="info-icon-bg shadow-green">
                                    <Key size={24} />
                                </div>
                                <h3>Permissions</h3>
                                <p>Each action in StudyMate requires specific encryption keys and verified session tokens.</p>
                            </div>
                        </div>

                        <div className="action-guide">
                            <h4>Why am I seeing this?</h4>
                            <ul>
                                <li>You are not logged in to an authorized account.</li>
                                <li>Your account does not have the required administrative privileges.</li>
                                <li>The requested resource is currently under maintenance or locked.</li>
                            </ul>
                        </div>
                    </div>

                    <div className="access-footer">
                        <div className="action-buttons">
                            <button onClick={() => navigate('/')} className="btn-access-primary">
                                <Home size={20} />
                                Home Dashboard
                            </button>
                            <button onClick={() => navigate('/login')} className="btn-access-secondary">
                                <LogIn size={20} />
                                Switch Account
                            </button>
                        </div>

                        <div className="support-box">
                            <p>Believe this is an error?</p>
                            <a href="mailto:security@studymate.edu" className="support-link">
                                <Mail size={16} />
                                Contact Security Team
                            </a>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AccessControl;
