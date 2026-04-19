import React, { useEffect } from 'react';
import { ArrowLeft, ArrowUp, Shield, Lock, Eye, Database, FileText, Share2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import './PrivacyPolicy.css';

const PrivacyPolicy = () => {
    const navigate = useNavigate();

    // Scroll to top on mount
    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    return (
        <div className="privacy-page animate-fade-in">
            <div className="privacy-container">

                {/* 🔙 Back Button */}
                <button className="btn-back-privacy" onClick={() => navigate(-1)}>
                    <ArrowLeft size={20} /> Back
                </button>

                <div className="privacy-card">
                    {/* 🖼️ Header */}
                    <header className="privacy-header">
                        <div className="icon-wrapper-large">
                            <Shield size={48} />
                        </div>
                        <h1>Privacy Policy</h1>
                        <span className="last-updated">Last Updated: February 2026</span>
                    </header>

                    {/* 📄 Content Sections */}
                    <div className="privacy-content">

                        <section className="policy-section">
                            <h2><Lock size={24} className="section-icon" /> Introduction</h2>
                            <p>
                                At <strong>StudyMate</strong>, we prioritize your privacy and are committed to protecting your personal data.
                                This policy outlines how we collect, use, and safeguard your information when you use our academic platform.
                            </p>
                            <p>
                                By accessing StudyMate, you agree to the collection and use of information in accordance with this policy.
                            </p>
                        </section>

                        <section className="policy-section">
                            <h2><Database size={24} className="section-icon" /> Information We Collect</h2>
                            <p>We collect minimal data necessary to provide our academic services:</p>
                            <ul>
                                <li><strong>Personal Identification:</strong> Name, Email address, Student ID (if applicable).</li>
                                <li><strong>Academic Data:</strong> Degree program, current year, and submitted academic issues.</li>
                                <li><strong>Usage Data:</strong> Pages visited, time spent, and interaction with study materials.</li>
                            </ul>
                        </section>

                        <section className="policy-section">
                            <h2><Eye size={24} className="section-icon" /> How We Use Your Data</h2>
                            <p>Your data is used strictly for educational and platform improvement purposes:</p>
                            <ul>
                                <li>To verify student identity and maintain academic integrity.</li>
                                <li>To personalize study material recommendations based on your degree.</li>
                                <li>To facilitate peer support through the Issue Tracking System.</li>
                                <li>To communicate important platform updates and notifications.</li>
                            </ul>
                        </section>

                        <section className="policy-section">
                            <h2><Share2 size={24} className="section-icon" /> Data Sharing & Security</h2>
                            <p>
                                We do <strong>not</strong> sell or trade your personal data. We implement industry-standard security measures
                                (such as <strong>AES-256 encryption</strong>) to protect your information from unauthorized access.
                            </p>
                            <p>
                                Information may be shared with university administration only in cases of academic misconduct or necessary compliance.
                            </p>
                        </section>

                        <section className="policy-section">
                            <h2><FileText size={24} className="section-icon" /> Your Rights</h2>
                            <p>As a user, you have the right to:</p>
                            <ul>
                                <li>Access and review the personal data we hold about you.</li>
                                <li>Request corrections to inaccurate information.</li>
                                <li>Request deletion of your account and associated data ("Right to be Forgotten").</li>
                            </ul>
                        </section>

                        <section className="policy-section contact-highlight">
                            <h2>Contact Us</h2>
                            <p>
                                If you have any questions about this Privacy Policy, please contact our support team at:
                                <br />
                                <a href="mailto:privacy@studymate.edu">privacy@studymate.edu</a>
                            </p>
                        </section>

                    </div>

                    <footer className="privacy-footer">
                        <p>&copy; 2026 StudyMate. All rights reserved.</p>
                    </footer>

                </div>
            </div>
        </div>
    );
};

export default PrivacyPolicy;
