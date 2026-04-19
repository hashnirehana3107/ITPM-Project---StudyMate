import React, { useState, useEffect, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { User, Mail, Lock, BookOpen, Calendar, GraduationCap, AlertCircle, CheckCircle, ArrowRight, Eye, EyeOff, Shield } from 'lucide-react';
import AuthContext from '../../context/AuthContext';
import axios from 'axios';
import './Register.css';

const Register = () => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        role: '',
        degree: '',
        year: '',
        universityName: '',
        department: ''
    });
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);

    const { register } = useContext(AuthContext);
    const navigate = useNavigate();
    const [degrees, setDegrees] = useState([]);

    useEffect(() => {
        const fetchDegrees = async () => {
            try {
                const { data } = await axios.get('http://localhost:5000/api/degrees');
                setDegrees(data);
            } catch (err) {
                console.error("Failed to fetch degrees");
            }
        };
        fetchDegrees();
    }, []);

    const { name, email, password, role, degree, year } = formData;

    const onChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const togglePasswordVisibility = () => {
        setShowPassword(!showPassword);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setIsSubmitting(true);

        // Basic validation for students
        if (role === 'student' && (!degree || !year)) {
            setError('Please select both your degree and year.');
            setIsSubmitting(false);
            return;
        }

        if (password.length < 6) {
            setError('Password must be at least 6 characters long.');
            setIsSubmitting(false);
            return;
        }

        if (role === 'lecturer' && (!formData.universityName || !formData.department)) {
            setError('Please enter your University Name and Department.');
            setIsSubmitting(false);
            return;
        }

        const res = await register(
            formData.name,
            formData.email,
            formData.password,
            formData.role,
            formData.degree,
            formData.year,
            { universityName: formData.universityName, department: formData.department }
        );
        if (res.success) {
            setIsSuccess(true);
            const redirectPath = role === 'partner' ? '/partner/dashboard' : '/dashboard';
            setTimeout(() => navigate(redirectPath), 1500);
        } else {
            setError(res.message);
            setIsSubmitting(false);
        }
    };

    return (
        <div className="register-page">
            <div className="register-container-split">

                {/* 🎨 Left Side - Illustration */}
                <div className="register-illustration-side">
                    <div className="illustration-content">
                        <div className="illustration-brand">
                            <Shield size={32} className="brand-logo" />
                            <span>StudyMate</span>
                        </div>
                        <h1>Join the <br /> <span className="highlight-text">Academic Hub</span></h1>
                        <p>Unlock your full potential with organized notes, peer support, and career guidance.</p>

                        <div className="illustration-graphic">
                            <div className="circle-orbit orbit-1"></div>
                            <div className="circle-orbit orbit-2"></div>
                            <div className="floating-icon icon-user"><User size={40} /></div>
                            <div className="floating-icon icon-grad"><GraduationCap size={56} /></div>
                            <div className="floating-icon icon-book"><BookOpen size={40} /></div>
                        </div>
                    </div>
                </div>

                {/* 📝 Right Side - Register Form */}
                <div className="register-form-side">
                    <div className="register-card">
                        <div className="register-header">
                            <div className="brand-logo">
                                <GraduationCap size={32} />
                            </div>
                            <h2>Create Your Account</h2>
                            <p>Join the smart academic support platform</p>
                        </div>

                        {error && (
                            <div className="error-alert shake-animation">
                                <span className="error-icon"><AlertCircle size={18} /></span> {error}
                            </div>
                        )}

                        <form onSubmit={handleSubmit} className={`register-form-inner ${isSuccess ? 'fade-out' : ''}`}>

                            {/* Account Role first so Name label can change */}
                            <div className="form-group-modern">
                                <div className="input-wrapper-modern">
                                    <span className="input-icon-modern"><Shield size={20} /></span>

                                    <select name="role" id="role" value={role} onChange={onChange} required className="form-select">
                                        <option value="" disabled hidden></option>
                                        <option value="student">Student</option>
                                        <option value="lecturer">Lecturer / Academic</option>
                                        <option value="partner">Partner (Company)</option>
                                    </select>
                                    <label htmlFor="role" className={`floating-label ${role ? 'active' : ''}`}>Account Role</label>
                                </div>
                            </div>

                            <div className="form-group-modern">
                                <div className="input-wrapper-modern">
                                    <span className="input-icon-modern"><User size={20} /></span>
                                    <input
                                        type="text"
                                        name="name"
                                        id="name"
                                        value={name}
                                        onChange={onChange}
                                        required
                                        placeholder=" "
                                        className="form-input"
                                        autoComplete="name"
                                    />
                                    <label htmlFor="name" className="floating-label">
                                        {role === 'partner' ? 'Company Name' : 'Full Name'}
                                    </label>
                                </div>
                            </div>

                            <div className="form-group-modern">
                                <div className="input-wrapper-modern">
                                    <span className="input-icon-modern"><Mail size={20} /></span>
                                    <input
                                        type="email"
                                        name="email"
                                        id="email"
                                        value={email}
                                        onChange={onChange}
                                        required
                                        placeholder=" "
                                        className="form-input"
                                        autoComplete="email"
                                    />
                                    <label htmlFor="email" className="floating-label">Email Address</label>
                                </div>
                            </div>

                            <div className="form-group-modern">
                                <div className="input-wrapper-modern">
                                    <span className="input-icon-modern"><Lock size={20} /></span>
                                    <input
                                        type={showPassword ? "text" : "password"}
                                        name="password"
                                        id="password"
                                        value={password}
                                        onChange={onChange}
                                        required
                                        placeholder=" "
                                        className="form-input"
                                        autoComplete="new-password"
                                    />
                                    <label htmlFor="password" className="floating-label">Password</label>
                                    <button
                                        type="button"
                                        className="password-toggle-btn"
                                        onClick={togglePasswordVisibility}
                                        tabIndex="-1"
                                    >
                                        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                    </button>
                                </div>
                            </div>

                            {role === 'student' && (
                                <div className="animate-fade-in-slide">
                                    <div className="form-group-modern">
                                        <div className="input-wrapper-modern">
                                            <span className="input-icon-modern"><GraduationCap size={20} /></span>
                                            <select name="degree" id="degree" value={degree} onChange={onChange} required className="form-select">
                                                <option value="" disabled hidden></option>
                                                {degrees.map(d => (
                                                    <option key={d._id} value={d.name}>{d.name} {d.code ? `(${d.code})` : ''}</option>
                                                ))}
                                            </select>
                                            <label htmlFor="degree" className={`floating-label ${degree ? 'active' : ''}`}>Degree</label>
                                        </div>
                                    </div>
                                    <div className="form-group-modern">
                                        <div className="input-wrapper-modern">
                                            <span className="input-icon-modern"><Calendar size={20} /></span>
                                            <select name="year" id="year" value={year} onChange={onChange} required className="form-select">
                                                <option value="" disabled hidden></option>
                                                <option value="1">1st Year</option>
                                                <option value="2">2nd Year</option>
                                                <option value="3">3rd Year</option>
                                                <option value="4">4th Year</option>
                                            </select>
                                            <label htmlFor="year" className={`floating-label ${year ? 'active' : ''}`}>Year</label>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {role === 'lecturer' && (
                                <div className="animate-fade-in-slide">
                                    <div className="lecturer-info-notice">
                                        <Shield size={16} />
                                        <span>Your account will be reviewed by an admin before activation.</span>
                                    </div>
                                    <div className="form-group-modern">
                                        <div className="input-wrapper-modern">
                                            <span className="input-icon-modern"><GraduationCap size={20} /></span>
                                            <input
                                                type="text"
                                                name="universityName"
                                                id="universityName"
                                                value={formData.universityName}
                                                onChange={onChange}
                                                required
                                                placeholder=" "
                                                className="form-input"
                                            />
                                            <label htmlFor="universityName" className="floating-label">University / Institution Name</label>
                                        </div>
                                    </div>
                                    <div className="form-group-modern">
                                        <div className="input-wrapper-modern">
                                            <span className="input-icon-modern"><BookOpen size={20} /></span>
                                            <input
                                                type="text"
                                                name="department"
                                                id="department"
                                                value={formData.department}
                                                onChange={onChange}
                                                required
                                                placeholder=" "
                                                className="form-input"
                                            />
                                            <label htmlFor="department" className="floating-label">Department / Faculty</label>
                                        </div>
                                    </div>
                                    <div className="form-group-modern">
                                        <div className="input-wrapper-modern">
                                            <span className="input-icon-modern"><GraduationCap size={20} /></span>
                                            <select name="degree" id="degree-lec" value={degree} onChange={onChange} required className="form-select">
                                                <option value="" disabled hidden></option>
                                                {degrees.map(d => (
                                                    <option key={d._id} value={d.name}>{d.name} {d.code ? `(${d.code})` : ''}</option>
                                                ))}
                                            </select>
                                            <label htmlFor="degree-lec" className={`floating-label ${degree ? 'active' : ''}`}>Specialization / Relevant Degree</label>
                                        </div>
                                    </div>
                                </div>
                            )}

                            <button
                                type="submit"
                                className={`btn-register-modern ${isSubmitting ? 'loading' : ''} ${isSuccess ? 'success' : ''}`}
                                disabled={isSubmitting || isSuccess}
                            >
                                {isSubmitting ? <span className="spinner-sm"></span> : isSuccess ? (
                                    <> <CheckCircle size={20} /> Success! </>
                                ) : (
                                    <> Register <ArrowRight size={18} /> </>
                                )}
                            </button>
                        </form>

                        <div className="register-footer">
                            <p>Already have an account? <Link to="/login" className="login-link">Login Here</Link></p>
                        </div>
                    </div>
                </div>
            </div>

        </div>
    );
};

export default Register;
