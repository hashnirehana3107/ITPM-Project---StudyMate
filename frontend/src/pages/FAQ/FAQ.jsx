import React, { useState } from 'react';
import { ChevronDown, ChevronUp, HelpCircle, Mail, MessageSquare } from 'lucide-react';
import { Link } from 'react-router-dom';
import './FAQ.css';

const FAQ = () => {
    const [activeIndex, setActiveIndex] = useState(null);

    const toggleAccordion = (index) => {
        if (activeIndex === index) {
            setActiveIndex(null);
        } else {
            setActiveIndex(index);
        }
    };

    const faqData = [
        {
            question: "How do I sign up for StudyMate?",
            answer: "Click on the 'Register' button on the top right corner of the homepage. Select whether you are a Student, Lecturer, or Admin, and fill out your details to create your account instantly."
        },
        {
            question: "How can I access study materials?",
            answer: "Once logged in, navigate to the 'Study Materials' section from your dashboard or footer. Here, you can search for and download PDF resources separated by your degree and academic year."
        },
        {
            question: "How do I report an academic issue?",
            answer: "Go to the 'Academic Issues' tab inside your dashboard. Click the 'Post New Issue' button to report curriculum clashes, missing materials, or timetable concerns. Admins check this frequently."
        },
        {
            question: "Can I apply for internships through StudyMate?",
            answer: "Yes! Navigate to the 'Internships' section to view exclusive career opportunities, guest lectures, and placement programs specifically tailored for your academic degree."
        },
        {
            question: "How do I reset my forgotten password?",
            answer: "If you've forgotten your password, click the 'Forgot Password' link on the login page. An email with a secure reset link will be dispatched to your registered email address."
        },
        {
            question: "Is there a limit to how many issues I can post?",
            answer: "While there is no strict limit, we encourage students to ensure their issue isn't already reported before posting. You can freely upvote or react to similar issues reported by your peers!"
        }
    ];

    return (
        <div className="faq-page">
            {/* Header Section */}
            <header className="faq-header-wrapper">
                <div className="faq-header-content">
                    <h1>Frequently Asked Questions</h1>
                    <p>Find answers to common questions about managing your academic journey with StudyMate.</p>
                </div>
                <div className="faq-bg-graphic"></div>
            </header>

            {/* Support Boxes */}
            <div className="faq-support-grid">
                <div className="support-card">
                    <div className="support-icon"><HelpCircle size={32} /></div>
                    <h3>Knowledge Base</h3>
                    <p>Read detailed guides on using our platform.</p>
                </div>
                <div className="support-card">
                    <div className="support-icon"><MessageSquare size={32} /></div>
                    <h3>Community Forums</h3>
                    <p>Discuss problems with your peers.</p>
                </div>
                <div className="support-card">
                    <div className="support-icon"><Mail size={32} /></div>
                    <h3>Contact Admin</h3>
                    <p>Can't find your answer? Reach out.</p>
                    <Link to="/contact" className="support-link">Contact Us →</Link>
                </div>
            </div>

            {/* Accordion Section */}
            <div className="faq-accordion-container">
                <h2 className="faq-section-title">General Questions</h2>
                
                <div className="accordion">
                    {faqData.map((item, index) => (
                        <div 
                            className={`accordion-item ${activeIndex === index ? 'active' : ''}`} 
                            key={index}
                        >
                            <button 
                                className="accordion-title"
                                onClick={() => toggleAccordion(index)}
                            >
                                <span>{item.question}</span>
                                {activeIndex === index ? (
                                    <ChevronUp className="accordion-icon" />
                                ) : (
                                    <ChevronDown className="accordion-icon" />
                                )}
                            </button>
                            
                            <div className="accordion-content">
                                <p>{item.answer}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Direct Contact Banner */}
            <div className="faq-contact-banner">
                <h3>Still have questions?</h3>
                <p>If you cannot find answer to your question in our FAQ, you can always contact our administration directly.</p>
                <Link to="/contact" className="btn-contact-primary">Get In Touch</Link>
            </div>
        </div>
    );
};

export default FAQ;
