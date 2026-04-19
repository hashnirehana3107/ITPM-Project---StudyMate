import React, { useEffect, useState } from 'react';
import { XCircle, HelpCircle, Compass, TrendingDown, Target, Brain, Folder, Briefcase, User, BookOpen, Rocket, Sprout } from 'lucide-react';
import './About.css';

const About = () => {
    const [isVisible, setIsVisible] = useState({});

    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        setIsVisible((prev) => ({ ...prev, [entry.target.id]: true }));
                    }
                });
            },
            { threshold: 0.1 }
        );

        document.querySelectorAll('.animate-section').forEach((el) => {
            observer.observe(el);
        });

        return () => observer.disconnect();
    }, []);

    return (
        <div className="about-page">
            <div className="about-bg-glow"></div>

            {/* 1️⃣ Page Header Section */}
            <header className="about-header animate-fade-in">
                <span className="about-badge">WHO WE ARE</span>
                <h1 className="about-title">About <span className="highlight-text">StudyMate</span></h1>
                <p className="about-subtitle">
                    A smart academic support platform designed to empower university students through
                    centralized resources, personalized guidance, and seamless collaboration.
                </p>
                <div className="header-divider"></div>
            </header>

            {/* 2️⃣ The Problem Students Face */}
            <section className="problem-section animate-section" id="problem-sec">
                <h2 className="section-heading">The Challenges You Face</h2>
                <div className="problem-grid">
                    <div className={`problem-card ${isVisible['problem-sec'] ? 'slide-in-left' : ''}`}>
                        <div className="icon-box-problem"><XCircle size={48} /></div>
                        <h3>Scattered Resources</h3>
                        <p>Study materials are often disorganized across various platforms, making it hard to find what you need.</p>
                    </div>
                    <div className={`problem-card ${isVisible['problem-sec'] ? 'slide-in-left delay-1' : ''}`}>
                        <div className="icon-box-problem"><HelpCircle size={48} /></div>
                        <h3>Unresolved Issues</h3>
                        <p>Academic queries often go unanswered due to a lack of a structured issue resolution system.</p>
                    </div>
                    <div className={`problem-card ${isVisible['problem-sec'] ? 'slide-in-left delay-2' : ''}`}>
                        <div className="icon-box-problem"><Compass size={48} /></div>
                        <h3>Guidance Gaps</h3>
                        <p>Finding centralized internship opportunities and career guidance is a constant struggle.</p>
                    </div>
                    <div className={`problem-card ${isVisible['problem-sec'] ? 'slide-in-left delay-3' : ''}`}>
                        <div className="icon-box-problem"><TrendingDown size={48} /></div>
                        <h3>Limited Interaction</h3>
                        <p>Connecting with seniors and peers for academic support is often difficult and unstructured.</p>
                    </div>
                </div>
            </section>

            {/* 3️⃣ Our Solution */}
            <section className="solution-section animate-section" id="solution-sec">
                <div className={`solution-content ${isVisible['solution-sec'] ? 'fade-up' : ''}`}>
                    <h2 className="section-heading">Our Smart Solution</h2>
                    <p className="section-desc">We bridge the gap between students and academic success through innovation.</p>

                    <div className="solution-grid">
                        <div className="solution-card">
                            <div className="icon-circle solution-theme"><Target size={32} /></div>
                            <h3>Personalized Learning</h3>
                            <p>Content curated specifically for your degree, year, and academic interests.</p>
                        </div>
                        <div className="solution-card">
                            <div className="icon-circle solution-theme"><Brain size={32} /></div>
                            <h3>Smart Resolution</h3>
                            <p>A structured system to raise issues and get them resolved by academic staff.</p>
                        </div>
                        <div className="solution-card">
                            <div className="icon-circle solution-theme"><Folder size={32} /></div>
                            <h3>Centralized Hub</h3>
                            <p>One platform for all your lecture notes, past papers, and study resources.</p>
                        </div>
                        <div className="solution-card">
                            <div className="icon-circle solution-theme"><Briefcase size={32} /></div>
                            <h3>Career Launchpad</h3>
                            <p>Direct access to internship opportunities and professional career guidance.</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* 4️⃣ Key Features Overview */}
            <section className="features-overview animate-section" id="features-sec">
                <h2 className="section-heading">Key Features</h2>
                <div className="features-row">
                    <div className={`feature-box ${isVisible['features-sec'] ? 'reveal' : ''}`}>
                        <div className="feature-icon"><User size={40} /></div>
                        <h3>User & Degree Management</h3>
                        <p>Manage your profile and academic preferences effortlessly.</p>
                    </div>
                    <div className={`feature-box ${isVisible['features-sec'] ? 'reveal delay-1' : ''}`}>
                        <div className="feature-icon"><HelpCircle size={40} /></div>
                        <h3>Issue Resolution System</h3>
                        <p>Effective tracking and solving of academic problems.</p>
                    </div>
                    <div className={`feature-box ${isVisible['features-sec'] ? 'reveal delay-2' : ''}`}>
                        <div className="feature-icon"><BookOpen size={40} /></div>
                        <h3>Material Management</h3>
                        <p>Share, organize, and access study materials securely.</p>
                    </div>
                    <div className={`feature-box ${isVisible['features-sec'] ? 'reveal delay-3' : ''}`}>
                        <div className="feature-icon"><Rocket size={40} /></div>
                        <h3>Internship Portal</h3>
                        <p>Connect with industry opportunities and secure your future.</p>
                    </div>
                </div>
            </section>

            {/* 5️⃣ Vision Statement */}
            <section className="vision-section animate-section" id="vision-sec">
                <div className={`vision-container ${isVisible['vision-sec'] ? 'pulse-slow' : ''}`}>
                    <div className="vision-icon"><Sprout size={64} /></div>
                    <h2>Our Vision</h2>
                    <p>“To support students throughout their academic journey with smart, structured, and human-centered learning support.”</p>
                </div>
            </section>
        </div>
    );
};

export default About;
