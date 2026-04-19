import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, ShieldCheck, Scale, FileText, Globe, Bell, Mail } from 'lucide-react';
import './TermsAndConditions.css';

const TermsAndConditions = () => {
    const navigate = useNavigate();

    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    return (
        <div className="terms-page">
            <div className="terms-container">
                <button onClick={() => navigate(-1)} className="btn-back-terms">
                    <ArrowLeft size={20} />
                    Back
                </button>

                <div className="terms-card animate-fade-in">
                    <div className="terms-header">
                        <div className="icon-wrapper-large">
                            <Scale size={40} className="glow-icon" />
                        </div>
                        <h1>Terms & Conditions</h1>
                        <span className="effective-date">Effective Date: February 14, 2026</span>
                    </div>

                    <div className="terms-content">
                        <section className="terms-section">
                            <h2>
                                <FileText className="section-icon" size={24} />
                                1. Introduction
                            </h2>
                            <p>
                                Welcome to StudyMate. These Terms and Conditions govern your use of our website and services.
                                By accessing or using StudyMate, you agree to be bound by these terms. If you disagree with any part
                                of these terms, you may not access the service.
                            </p>
                        </section>

                        <section className="terms-section">
                            <h2>
                                <ShieldCheck className="section-icon" size={24} />
                                2. User Accounts & Security
                            </h2>
                            <p>
                                When you create an account with us, you must provide accurate and complete information. You are solely
                                responsible for maintaining the confidentiality of your account and password.
                            </p>
                            <ul>
                                <li>You must not share your account credentials with anyone else.</li>
                                <li>You are responsible for all activities that occur under your account.</li>
                                <li>Notify us immediately of any unauthorized use of your account.</li>
                            </ul>
                        </section>

                        <section className="terms-section">
                            <h2>
                                <Globe className="section-icon" size={24} />
                                3. Acceptable Use
                            </h2>
                            <p>
                                You agree not to use the service for any unlawful purpose or in any way that interrupts, damages,
                                or impairs the service. Prohibited activities include:
                            </p>
                            <ul>
                                <li>Postings that are abusive, defamatory, or obscene.</li>
                                <li>Attempting to interfere with the proper working of the website.</li>
                                <li>Violating any applicable local, state, national, or international law.</li>
                            </ul>
                        </section>

                        <section className="terms-section">
                            <h2>
                                <Bell className="section-icon" size={24} />
                                4. Changes to Terms
                            </h2>
                            <p>
                                We reserve the right to modify or replace these Terms at any time. If a revision is material,
                                we will try to provide at least 30 days' notice prior to any new terms taking effect.
                            </p>
                        </section>

                        <section className="terms-section">
                            <h2>
                                <Mail className="section-icon" size={24} />
                                5. Contact Us
                            </h2>
                            <p>
                                If you have any questions about these Terms, please contact us.
                            </p>
                            <div className="support-link">
                                <a href="mailto:support@studymate.com">support@studymate.com</a>
                            </div>
                        </section>
                    </div>

                    <div className="terms-footer">
                        &copy; {new Date().getFullYear()} StudyMate. All rights reserved.
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TermsAndConditions;
