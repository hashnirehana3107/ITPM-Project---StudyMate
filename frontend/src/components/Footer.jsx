import React from 'react';
import { Link } from 'react-router-dom';
import {
    GraduationCap, Globe, Mail, Linkedin, Twitter,
    Home, Info, Phone, LogIn, UserPlus,
    FileText, Star, Briefcase, LayoutDashboard,
    HelpCircle, ShieldCheck, FileCheck, Lock
} from 'lucide-react';
import './Footer.css';

const Footer = () => {
    return (
        <footer className="smart-footer">
            <div className="footer-container">

                {/* 🎓 Column 1: Brand & Social */}
                <div className="footer-column brand-col">
                    <Link to="/" className="footer-logo">
                        <div className="logo-icon-bg">
                            <GraduationCap size={24} />
                        </div>
                        <span>StudyMate</span>
                    </Link>
                    <p className="footer-description">
                        An advanced academic support platform dedicated to empowering university students with smart learning resources and career guidance.
                    </p>
                    <div className="social-links">
                        <a href="#" className="social-icon" aria-label="Website"><Globe size={18} /></a>
                        <a href="mailto:support@unismart.edu" className="social-icon" aria-label="Email"><Mail size={18} /></a>
                        <a href="#" className="social-icon" aria-label="LinkedIn"><Linkedin size={18} /></a>
                        <a href="#" className="social-icon" aria-label="Twitter"><Twitter size={18} /></a>
                    </div>
                </div>

                {/* 🔗 Column 2: Quick Links */}
                <div className="footer-column">
                    <h3>Quick Links</h3>
                    <ul className="footer-link-list">
                        <li><Link to="/"><Home size={14} /> Home</Link></li>
                        <li><Link to="/about"><Info size={14} /> About Us</Link></li>
                        <li><Link to="/reviews"><Star size={14} /> Student Reviews</Link></li>
                        <li><Link to="/contact"><Phone size={14} /> Contact Us</Link></li>
                        <li><Link to="/login"><LogIn size={14} /> Login</Link></li>
                        <li><Link to="/register"><UserPlus size={14} /> Register</Link></li>
                    </ul>
                </div>

                {/* 📚 Column 3: Features */}
                <div className="footer-column">
                    <h3>Academic Features</h3>
                    <ul className="footer-link-list">
                        <li><Link to="/issues"><FileText size={14} /> Academic Issues</Link></li>
                        <li><Link to="/materials"><Star size={14} /> Study Materials</Link></li>
                        <li><Link to="/internships"><Briefcase size={14} /> Internships</Link></li>
                        <li><Link to="/dashboard"><LayoutDashboard size={14} /> My Dashboard</Link></li>
                    </ul>
                </div>

                {/* 🛡️ Column 4: Support & Legal */}
                <div className="footer-column">
                    <h3>Help & Support</h3>
                    <ul className="footer-link-list">
                        <li><Link to="/contact"><HelpCircle size={14} /> Help Center</Link></li>
                        <li><Link to="/faq"><Info size={14} /> FAQ</Link></li>
                        <li><Link to="/privacy"><ShieldCheck size={14} /> Privacy Policy</Link></li>
                        <li><Link to="/terms"><FileCheck size={14} /> Terms & Conditions</Link></li>
                        <li><Link to="/request-lecturer"><GraduationCap size={14} /> Lecturer Access</Link></li>
                        <li><Link to="/access-denied"><Lock size={14} /> Access Control</Link></li>
                    </ul>
                </div>

            </div>

            <div className="footer-bottom">
                <div className="bottom-content">
                    <p>&copy; 2026 University Smart Study Platform. All rights reserved.</p>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
