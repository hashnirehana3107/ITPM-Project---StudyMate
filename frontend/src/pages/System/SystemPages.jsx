import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Compass, AlertTriangle, AlertCircle, RefreshCw, Home, ArrowLeft } from 'lucide-react';
import './SystemPages.css';

// 27️⃣ 404 – Page Not Found
export const NotFound = () => {
    const navigate = useNavigate();

    return (
        <div className="system-page animate-fade-in">
            <div className="system-card">
                <div className="icon-box-lg text-blue">
                    <Compass size={64} className="glow-icon" />
                    <div className="floating-question">?</div>
                </div>
                <h1>404 – Page Not Found</h1>
                <p className="system-msg">
                    Oops! The page you’re looking for doesn’t exist or has been moved.
                </p>
                <div className="system-actions">
                    <button onClick={() => navigate('/')} className="btn-primary-sys">
                        <Home size={18} /> Go to Home
                    </button>
                    <button onClick={() => navigate(-1)} className="btn-secondary-sys">
                        <ArrowLeft size={18} /> Go Back
                    </button>
                </div>
            </div>
        </div>
    );
};

// 28️⃣ Access Denied Page
export const AccessDenied = () => {
    const navigate = useNavigate();

    return (
        <div className="system-page animate-fade-in">
            <div className="system-card warning-border">
                <div className="icon-box-lg text-red shake-animation">
                    <AlertTriangle size={64} className="glow-icon" />
                </div>
                <h1 className="text-red-title">Access Denied</h1>
                <p className="system-msg">
                    You do not have permission to access this page. Please contact an administrator if you believe this is an error.
                </p>
                <div className="system-actions">
                    <button onClick={() => navigate('/dashboard')} className="btn-primary-sys red-theme">
                        <Home size={18} /> Go to Dashboard
                    </button>
                    <button onClick={() => navigate(-1)} className="btn-secondary-sys">
                        <ArrowLeft size={18} /> Go Back
                    </button>
                </div>
            </div>
        </div>
    );
};

// 29️⃣ Loading / Error Component (Reusable)
export const SystemState = ({ type = 'loading', message, onRetry }) => {
    // type: 'loading' | 'error'

    return (
        <div className="system-page-embedded animate-fade-in">
            {type === 'loading' ? (
                <div className="loading-container">
                    <div className="spinner-lg"></div>
                    <p className="loading-text">{message || 'Please wait...'}</p>
                </div>
            ) : (
                <div className="error-container">
                    <div className="icon-box-md text-orange">
                        <AlertCircle size={40} className="glow-icon" />
                    </div>
                    <h3>Something went wrong</h3>
                    <p>{message || 'An unexpected error occurred.'}</p>
                    <div className="system-actions">
                        {onRetry && (
                            <button onClick={onRetry} className="btn-primary-sys orange-theme">
                                <RefreshCw size={18} /> Retry
                            </button>
                        )}
                        <button onClick={() => window.location.href = '/'} className="btn-secondary-sys">
                            <Home size={18} /> Go Home
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};
