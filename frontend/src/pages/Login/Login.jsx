import React, { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Mail, Lock, Eye, EyeOff, AlertCircle, CheckCircle, BookOpen, GraduationCap, Laptop } from 'lucide-react';
import AuthContext from '../../context/AuthContext';
import './Login.css';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    const [isOn, setIsOn] = useState(false);

    const { login } = useContext(AuthContext);
    const navigate = useNavigate();

    const playSwitchSound = (turningOn) => {
        try {
            const AudioContext = window.AudioContext || window.webkitAudioContext;
            if (!AudioContext) return; // Fallback if not supported
            const audioCtx = new AudioContext();
            const osc = audioCtx.createOscillator();
            const gain = audioCtx.createGain();
            
            osc.connect(gain);
            gain.connect(audioCtx.destination);
            osc.type = turningOn ? 'sine' : 'square';
            const now = audioCtx.currentTime;
            
            if (turningOn) {
                // Bright, rising click for "On"
                osc.frequency.setValueAtTime(800, now);
                osc.frequency.exponentialRampToValueAtTime(1200, now + 0.05);
                gain.gain.setValueAtTime(1, now);
                gain.gain.exponentialRampToValueAtTime(0.01, now + 0.05);
            } else {
                // Dull, falling click for "Off"
                osc.frequency.setValueAtTime(300, now);
                osc.frequency.exponentialRampToValueAtTime(100, now + 0.05);
                gain.gain.setValueAtTime(0.5, now);
                gain.gain.exponentialRampToValueAtTime(0.01, now + 0.05);
            }

            osc.start(now);
            osc.stop(now + 0.05);
        } catch (e) {
            console.error("Audio playback failed", e);
        }
    };

    const handleToggleLamp = () => {
        const newState = !isOn;
        setIsOn(newState);
        playSwitchSound(newState);
    };

    const handleSubmit = async (e) => {
        if (!isOn) return; // Prevent submission if light is off (optional, but consistent with the visual state)
        e.preventDefault();
        setError('');
        setIsSubmitting(true);

        const res = await login(email, password);
        if (res.success) {
            setIsSuccess(true);
            let redirectPath = '/dashboard';
            if (res.user && res.user.role === 'admin') redirectPath = '/admin/dashboard';
            if (res.user && res.user.role === 'partner') redirectPath = '/partner/dashboard';
            if (res.user && res.user.role === 'lecturer') redirectPath = '/lecturer/dashboard';
            
            setTimeout(() => navigate(redirectPath), 1000);
        } else {
            setError(res.message);
            setIsSubmitting(false);
        }
    };

    return (
        <div className={`login-page ${isOn ? 'light-on' : 'light-off'}`}>
            <div className="login-container-split">

                {/* 🧩 Left Side - Interactive Lamp */}
                <div className="login-illustration-side">
                    <div className="lamp-scene">
                        <div className={`lamp-wire-container ${isOn ? 'pulled' : ''}`} onClick={handleToggleLamp}>
                            <div className="lamp-wire"></div>
                            <div className="wire-handle">
                                {!isOn && <div className="pull-hint">Pull to Login</div>}
                            </div>
                        </div>
                        <div className={`lamp-hardware ${isOn ? 'glow' : ''}`}>
                            <div className="lamp-shade">
                                <div className="lamp-light-source"></div>
                            </div>
                            <div className="lamp-pole"></div>
                            <div className="lamp-base"></div>
                        </div>
                    </div>
                </div>

                {/* 🧩 Right Side - Login Form */}
                <div 
                    className={`login-form-side ${!isOn ? 'form-hidden' : ''}`}
                    onClick={!isOn ? handleToggleLamp : undefined}
                >
                    {!isOn && (
                        <div className="dark-overlay-hint">
                            <Laptop size={48} className="hint-icon" />
                            <h3>The room is dark</h3>
                            <button className="btn-reveal-hint">Light Up to Login</button>
                        </div>
                    )}
                    <div className="login-card">
                        <div className="login-header">
                            <div className="brand-logo">
                                <GraduationCap size={32} />
                            </div>
                            <h2>Welcome Back</h2>
                            <p>Login to continue your academic journey</p>
                        </div>

                        {error && (
                            <div className="error-alert shake-animation">
                                <span className="error-icon"><AlertCircle size={18} /></span> {error}
                            </div>
                        )}

                        <form onSubmit={handleSubmit} className={`login-form ${isSuccess ? 'fade-out' : ''}`}>
                            <div className="form-group-modern">
                                <div className="input-wrapper-modern">
                                    <span className="input-icon-modern"><Mail size={20} /></span>
                                    <input
                                        type="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        required
                                        placeholder=" "
                                        id="email"
                                    />
                                    <label htmlFor="email" className="floating-label">Email Address</label>
                                </div>
                            </div>

                            <div className="form-group-modern">
                                <div className="input-wrapper-modern">
                                    <span className="input-icon-modern"><Lock size={20} /></span>
                                    <input
                                        type={showPassword ? "text" : "password"}
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        required
                                        placeholder=" "
                                        id="password"
                                    />
                                    <label htmlFor="password" className="floating-label">Password</label>
                                    <button
                                        type="button"
                                        className="toggle-password"
                                        onClick={() => setShowPassword(!showPassword)}
                                    >
                                        {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                                    </button>
                                </div>
                            </div>

                            <div className="form-actions">
                                <Link to="/forgot-password">Forgot Password?</Link>
                            </div>

                            <button
                                type="submit"
                                className={`btn-login-modern ${isSubmitting ? 'loading' : ''} ${isSuccess ? 'success' : ''}`}
                                disabled={isSubmitting || isSuccess}
                            >
                                {isSubmitting ? <span className="spinner-sm"></span> : isSuccess ? 'Redirecting...' : 'Login'}
                            </button>
                        </form>

                        <div className="login-footer">
                            <p>Don't have an account? <Link to="/register" className="register-link">Register Now</Link></p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Login;
