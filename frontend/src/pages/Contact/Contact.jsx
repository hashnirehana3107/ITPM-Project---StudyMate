import React, { useState } from 'react';
import axios from 'axios';
import { BookOpen, Shield, GraduationCap, User, Mail, Folder, Send, MessageSquare, Clock, MapPin, Lightbulb, AlertCircle } from 'lucide-react';
import './Contact.css';

const Contact = () => {
    const [formData, setFormData] = useState({
        fullName: '',
        email: '',
        subject: '',
        message: ''
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitted, setSubmitted] = useState(false);
    const [error, setError] = useState('');

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        setError('');

        try {
            const response = await axios.post('/api/contact', {
                name: formData.fullName,
                email: formData.email,
                subject: formData.subject || 'General Inquiry',
                message: formData.message
            });

            if (response.status === 201) {
                setIsSubmitting(false);
                setSubmitted(true);
                setFormData({ fullName: '', email: '', subject: '', message: '' });
                setTimeout(() => setSubmitted(false), 8000);
            }
        } catch (err) {
            console.error('Contact Submission Error:', err);
            setError(err.response?.data?.message || 'Failed to send message. Please try again.');
            setIsSubmitting(false);
        }
    };

    return (
        <div className="contact-page">
            {/* Background Decorations for "WOW" Factor */}
            <div className="contact-bg-glow"></div>
            <div className="contact-orbit orbit-1"></div>
            <div className="contact-orbit orbit-2"></div>

            <div className="contact-floating-icons">
                <div className="contact-float-icon c-icon-1"><BookOpen size={48} /></div>
                <div className="contact-float-icon c-icon-2"><Shield size={48} /></div>
                <div className="contact-float-icon c-icon-3"><GraduationCap size={48} /></div>
            </div>

            {/* 1️⃣ Page Header Section */}
            <header className="contact-header-section animate-fade-in">
                <span className="contact-badge">GET IN TOUCH</span>
                <h1 className="contact-page-title">How can we <span className="highlight-text">help you?</span></h1>
                <p className="contact-page-subtitle">
                    Have a question or need academic support? Our specialized team is here
                    to ensure your university journey is seamless and successful.
                </p>
                <div className="title-divider"></div>
            </header>

            <main className="contact-main-container">
                <div className="contact-split-layout">

                    {/* 🧾 LEFT SIDE – Contact Form */}
                    <div className="contact-form-side animate-slide-up">
                        <div className="form-card-premium">
                            <div className="card-glass-effect"></div>
                            <div className="form-header-meta">
                                <h2>Send a Message</h2>
                                <p>We typically respond within 2-4 hours.</p>
                            </div>

                            <form onSubmit={handleSubmit} className="contact-form-inner">
                                <div className="form-row">
                                    <div className="input-group">
                                        <label htmlFor="fullName">Full Name</label>
                                        <div className="input-wrapper-premium">
                                            <span className="input-icon"><User size={20} /></span>
                                            <input
                                                type="text"
                                                id="fullName"
                                                name="fullName"
                                                value={formData.fullName}
                                                onChange={handleChange}
                                                placeholder="John Doe"
                                                required
                                            />
                                        </div>
                                    </div>

                                    <div className="input-group">
                                        <label htmlFor="email">Email Address</label>
                                        <div className="input-wrapper-premium">
                                            <span className="input-icon"><Mail size={20} /></span>
                                            <input
                                                type="email"
                                                id="email"
                                                name="email"
                                                value={formData.email}
                                                onChange={handleChange}
                                                placeholder="john@university.edu"
                                                required
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="input-group">
                                    <label htmlFor="subject">Inquiry Type</label>
                                    <div className="input-wrapper-premium">
                                        <span className="input-icon"><Folder size={20} /></span>
                                        <select
                                            id="subject"
                                            name="subject"
                                            value={formData.subject}
                                            onChange={handleChange}
                                        >
                                            <option value="">Select a Category</option>
                                            <option value="academic">Academic Support</option>
                                            <option value="technical">Technical Assistance</option>
                                            <option value="feedback">General Feedback</option>
                                            <option value="career">Career Guidance</option>
                                        </select>
                                    </div>
                                </div>

                                <div className="input-group">
                                    <label htmlFor="message">Your Message</label>
                                    <div className="textarea-wrapper-premium">
                                        <textarea
                                            id="message"
                                            name="message"
                                            value={formData.message}
                                            onChange={handleChange}
                                            placeholder="Tell us more about your inquiry..."
                                            maxLength="500"
                                            required
                                        ></textarea>
                                        <div className="char-counter-premium">
                                            {formData.message.length}/500
                                        </div>
                                    </div>
                                </div>

                                {error && (
                                    <div className="error-message-premium animate-shake" style={{ color: '#F87171', background: 'rgba(248, 113, 113, 0.1)', padding: '12px', borderRadius: '12px', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.85rem', border: '1px solid rgba(248, 113, 113, 0.2)'}}>
                                        <AlertCircle size={18} /> {error}
                                    </div>
                                )}

                                <button type="submit" className={`btn-submit-premium ${isSubmitting ? 'loading' : ''}`}>
                                    {isSubmitting ? (
                                        <span className="spinner-premium"></span>
                                    ) : (
                                        <>Send Message <span className="arrow"><Send size={18} /></span></>
                                    )}
                                </button>

                                {submitted && (
                                    <div className="success-message-premium">
                                        <span className="success-icon"><MessageSquare size={18} /></span> Thank you! Your message has been safely delivered.
                                    </div>
                                )}
                            </form>
                        </div>
                    </div>

                    {/* 📍 RIGHT SIDE – Info Blocks */}
                    <div className="contact-info-side animate-fade-in-right">
                        <div className="info-modern-stack">
                            <div className="info-card-modern">
                                <div className="info-icon-circle email-glow"><Mail size={24} /></div>
                                <div className="info-content-modern">
                                    <h4>Primary Support</h4>
                                    <a href="mailto:support@studymate.lk">support@studymate.lk</a>
                                    <p className="info-hint">24/7 Knowledge Base available</p>
                                </div>
                            </div>

                            <div className="info-card-modern">
                                <div className="info-icon-circle clock-glow"><Clock size={24} /></div>
                                <div className="info-content-modern">
                                    <h4>Office Hours</h4>
                                    <p>Mon - Fri: 8:00 AM - 6:00 PM</p>
                                    <p>Weekend Support: 9:00 AM - 1:00 PM</p>
                                </div>
                            </div>

                            <div className="info-card-modern">
                                <div className="info-icon-circle loc-glow"><MapPin size={24} /></div>
                                <div className="info-content-modern">
                                    <h4>University Hub</h4>
                                    <p>Center for Excellence, Ground Floor</p>
                                    <p>University Dr, Campus West</p>
                                </div>
                            </div>
                        </div>

                        {/* CTA Feedback Box */}
                        <div className="contact-cta-card pulse-effect">
                            <div className="cta-icon"><Lightbulb size={32} /></div>
                            <p>"Your feedback is the catalyst for our academic innovation."</p>
                        </div>
                    </div>
                </div>
            </main>

        </div>
    );
};

export default Contact;
