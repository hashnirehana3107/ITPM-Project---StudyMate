import React, { useEffect, useState, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import AuthContext from '../../context/AuthContext';
import {
    GraduationCap,
    Shield,
    Brain,
    PenTool,
    UserCog,
    MessageCircleQuestion,
    Library,
    Briefcase,
    Layers,
    Users,
    CheckCircle,
    UserPlus,
    Compass,
    MessageCircle,
    Trophy,
    ArrowRight,
    Play,
    Star,
    Quote,
    Mail,
    Globe,
    Zap
} from 'lucide-react';
import './Home.css';
import home1 from '../../assets/home1.png';
import home2 from '../../assets/home2.png';
import home3 from '../../assets/home3.png';
import newsletterTips from '../../assets/newsletter_tips.png';
import { studentReviews } from '../../utils/reviewData';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const Home = () => {
    const { user } = useContext(AuthContext);
    const navigate = useNavigate();
    const [isVisible, setIsVisible] = useState({});

    useEffect(() => {
        if (user && user.role === 'admin') {
            navigate('/admin/dashboard');
        }
    }, [user, navigate]);

    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        setIsVisible((prev) => ({ ...prev, [entry.target.id]: true }));
                        observer.unobserve(entry.target);
                    }
                });
            },
            { threshold: 0.1 }
        );

        document.querySelectorAll('.animate-on-scroll').forEach((el) => {
            observer.observe(el);
        });

        return () => observer.disconnect();
    }, []);

    // Review Carousel Logic
    const [reviews, setReviews] = useState(studentReviews);
    const [currentReview, setCurrentReview] = useState(0);

    useEffect(() => {
        const storedReviews = JSON.parse(localStorage.getItem('studyMate_student_reviews_v1') || '[]');
        if (storedReviews.length > 0) {
            // Combine mock data with stored data, latest first
            setReviews([...storedReviews, ...studentReviews]);
        }
    }, []);

    const nextReview = () => setCurrentReview((prev) => (prev + 1) % reviews.length);
    const prevReview = () => setCurrentReview((prev) => (prev - 1 + reviews.length) % reviews.length);

    return (
        <div className="home-container">

            {/* 2️⃣ Hero Section */}
            <section className="hero">
                <div className="hero-container-inner">
                    <div className="hero-content-main">
                        <div className="floating-icons">
                            <div className="float-icon icon-1">
                                <GraduationCap size={40} strokeWidth={1.5} />
                            </div>
                            <div className="float-icon icon-2">
                                <Shield size={40} strokeWidth={1.5} />
                            </div>
                            <div className="float-icon icon-3">
                                <Brain size={50} strokeWidth={1.5} />
                            </div>
                            <div className="float-icon icon-4">
                                <PenTool size={30} strokeWidth={1.5} />
                            </div>
                        </div>

                        <h1 className="hero-title">
                            Master new skills to unlock <br />
                            your <span className="highlight">career potential.</span>
                        </h1>

                        <div className="hero-mid-row">
                            <p className="hero-description">
                                Whether you're just beginning your journey or looking to upskill for the
                                next big opportunity, we're here to support your growth every step of the way.
                            </p>

                            <div className="hero-avatar-group">
                                <div className="avatars">
                                    <div className="avatar-circle"><img src="https://i.pravatar.cc/100?u=1" alt="s1" style={{ width: '100%', height: '100%', borderRadius: '50%' }} /></div>
                                    <div className="avatar-circle"><img src="https://i.pravatar.cc/100?u=2" alt="s2" style={{ width: '100%', height: '100%', borderRadius: '50%' }} /></div>
                                    <div className="avatar-circle"><img src="https://i.pravatar.cc/100?u=3" alt="s3" style={{ width: '100%', height: '100%', borderRadius: '50%' }} /></div>
                                    <div className="avatar-circle"><img src="https://i.pravatar.cc/100?u=4" alt="s4" style={{ width: '100%', height: '100%', borderRadius: '50%' }} /></div>
                                    <div className="avatar-circle plus-circle">10+</div>
                                </div>
                                <span className="avatar-text">528+ Educated Students</span>
                            </div>
                        </div>

                        <div className="cta-buttons-row">
                            <button
                                className="btn-primary-hero"
                                onClick={() => document.getElementById('features-section')?.scrollIntoView({ behavior: 'smooth' })}
                            >
                                Get Started Now
                            </button>
                            <button
                                className="btn-video-hero"
                                onClick={() => navigate('/issues')}
                            >
                                <div className="play-icon"><MessageCircleQuestion size={18} /></div>
                                Resolve Issues
                                <ArrowRight size={16} className="ml-2" />
                            </button>
                        </div>
                    </div>

                    <div className="hero-student-cards">
                        <div className="student-card card-orange">
                            <div className="card-bg"></div>
                            <img src={home1} alt="Student 1" className="student-image" />
                        </div>

                        <div className="student-card card-green">
                            <div className="card-bg"></div>
                            <img src={home2} alt="Student 2" className="student-image" />
                        </div>

                        <div className="student-card card-blue">
                            <div className="card-bg"></div>
                            <img src={home3} alt="Student 3" className="student-image" />
                        </div>
                    </div>
                </div>

                <div className="scroll-down-indicator">
                    <div className="mouse">
                        <div className="wheel"></div>
                    </div>
                </div>
            </section>

            {/* 3️⃣ Key Features Section */}
            <section className="features-section" id="features-section">
                <div className={`home-section-header animate-on-scroll ${isVisible['features-header'] ? 'visible' : ''}`} id="features-header">
                    <h2 className="home-section-title">Everything You Need to <span className="highlight">Succeed</span></h2>
                    <p className="home-section-subtitle">
                        StudyMate brings all your academic necessities into one intuitive platform.
                    </p>
                </div>

                <div className="features-grid">
                    <div className={`feature-card animate-on-scroll ${isVisible['feature-1'] ? 'visible' : ''}`} id="feature-1">
                        <div className="card-icon">
                            <UserCog size={32} />
                        </div>
                        <h3>Degree Personalization</h3>
                        <p>Customize your profile based on your degree and year to receive relevant content and updates.</p>
                        <div className="card-decoration"></div>
                    </div>

                    <div className={`feature-card animate-on-scroll ${isVisible['feature-2'] ? 'visible' : ''}`} id="feature-2">
                        <div className="card-icon">
                            <MessageCircleQuestion size={32} />
                        </div>
                        <h3>Issue Resolution</h3>
                        <p>Post your academic problems and get solutions from peers and lecturers efficiently.</p>
                        <div className="card-decoration"></div>
                    </div>

                    <div className={`feature-card animate-on-scroll ${isVisible['feature-3'] ? 'visible' : ''}`} id="feature-3">
                        <div className="card-icon">
                            <Library size={32} />
                        </div>
                        <h3>Study Materials</h3>
                        <p>Access a vast library of lecture notes, past papers, and study resources curated for you.</p>
                        <div className="card-decoration"></div>
                    </div>

                    <div className={`feature-card animate-on-scroll ${isVisible['feature-4'] ? 'visible' : ''}`} id="feature-4">
                        <div className="card-icon">
                            <Briefcase size={32} />
                        </div>
                        <h3>Career Guidance</h3>
                        <p>Find internship opportunities and career advice specifically tailored to your field of study.</p>
                        <div className="card-decoration"></div>
                    </div>
                </div>
            </section>

            {/* 4️⃣ Why Choose Section */}
            <section className="why-choose-section">
                <div className={`home-section-header animate-on-scroll ${isVisible['why-header'] ? 'visible' : ''}`} id="why-header">
                    <h2 className="home-section-title">Why <span className="highlight">Students</span> Choose Us</h2>
                </div>
                <div className="benefits-grid">
                    <div className={`benefit-item animate-on-scroll ${isVisible['benefit-1'] ? 'visible' : ''}`} id="benefit-1">
                        <div className="benefit-icon">
                            <Layers size={24} />
                        </div>
                        <div className="benefit-text">
                            <h4>Centralized Resources</h4>
                            <p>Everything related to your academics in one place.</p>
                        </div>
                    </div>
                    <div className={`benefit-item animate-on-scroll ${isVisible['benefit-2'] ? 'visible' : ''}`} id="benefit-2">
                        <div className="benefit-icon">
                            <Users size={24} />
                        </div>
                        <div className="benefit-text">
                            <h4>Community Support</h4>
                            <p>Connect with peers facing similar challenges.</p>
                        </div>
                    </div>
                    <div className={`benefit-item animate-on-scroll ${isVisible['benefit-3'] ? 'visible' : ''}`} id="benefit-3">
                        <div className="benefit-icon">
                            <CheckCircle size={24} />
                        </div>
                        <div className="benefit-text">
                            <h4>Quality Content</h4>
                            <p>Curated and verified study materials for your success.</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* 5️⃣ How It Works Section */}
            <section className="how-it-works-section">
                <div className={`home-section-header animate-on-scroll ${isVisible['how-header'] ? 'visible' : ''}`} id="how-header">
                    <h2 className="home-section-title">How It <span className="highlight">Works</span></h2>
                </div>
                <div className="steps-container">
                    <div className={`step-card animate-on-scroll ${isVisible['step-1'] ? 'visible' : ''}`} id="step-1">
                        <div className="step-circle">1</div>
                        <div className="step-icon">
                            <UserPlus size={40} />
                        </div>
                        <h4>Register</h4>
                        <p>Create your profile and select your degree program.</p>
                    </div>
                    <div className={`step-card animate-on-scroll ${isVisible['step-2'] ? 'visible' : ''}`} id="step-2">
                        <div className="step-circle">2</div>
                        <div className="step-icon">
                            <Compass size={40} />
                        </div>
                        <h4>Explore</h4>
                        <p>Access personalized study materials and guidance.</p>
                    </div>
                    <div className={`step-card animate-on-scroll ${isVisible['step-3'] ? 'visible' : ''}`} id="step-3">
                        <div className="step-circle">3</div>
                        <div className="step-icon">
                            <MessageCircle size={40} />
                        </div>
                        <h4>Collaborate</h4>
                        <p>Post issues and help others in the community.</p>
                    </div>
                    <div className={`step-card animate-on-scroll ${isVisible['step-4'] ? 'visible' : ''}`} id="step-4">
                        <div className="step-circle">4</div>
                        <div className="step-icon">
                            <Trophy size={40} />
                        </div>
                        <h4>Succeed</h4>
                        <p>Achieve your academic and career goals.</p>
                    </div>
                </div>
            </section>

            {/* 6️⃣ Stats Strip Section */}
            <section className="stats-strip">
                <div className="stats-grid">
                    <div className={`stat-card animate-on-scroll ${isVisible['stat-1'] ? 'visible' : ''}`} id="stat-1">
                        <div className="stat-icon-bg"><Users size={28} /></div>
                        <div className="stat-info">
                            <span className="stat-number">1,200+</span>
                            <span className="stat-label">Active Students</span>
                        </div>
                    </div>
                    <div className={`stat-card animate-on-scroll ${isVisible['stat-2'] ? 'visible' : ''}`} id="stat-2">
                        <div className="stat-icon-bg"><Library size={28} /></div>
                        <div className="stat-info">
                            <span className="stat-number">850+</span>
                            <span className="stat-label">Study Resources</span>
                        </div>
                    </div>
                    <div className={`stat-card animate-on-scroll ${isVisible['stat-3'] ? 'visible' : ''}`} id="stat-3">
                        <div className="stat-icon-bg"><Zap size={28} /></div>
                        <div className="stat-info">
                            <span className="stat-number">98%</span>
                            <span className="stat-label">Success Rate</span>
                        </div>
                    </div>
                    <div className={`stat-card animate-on-scroll ${isVisible['stat-4'] ? 'visible' : ''}`} id="stat-4">
                        <div className="stat-icon-bg"><Globe size={28} /></div>
                        <div className="stat-info">
                            <span className="stat-number">24/7</span>
                            <span className="stat-label">Peer Support</span>
                        </div>
                    </div>
                </div>
            </section>

            {/* 7️⃣ Partner Logos Section */}
            <section className="partners-section">
                <p className="partners-title">Trusted by Industry Leaders & Top Academic Partners</p>
                <div className="logo-belt-wrapper">
                    <div className="logo-belt">
                        <div className="logo-item">VIRTUSA</div>
                        <div className="logo-item">SYSCO LABS</div>
                        <div className="logo-item">JOHN KEELLS</div>
                        <div className="logo-item">MAS HOLDINGS</div>
                        <div className="logo-item">WSO2</div>
                        <div className="logo-item">MAGA</div>
                        <div className="logo-item">ACCESS ENG</div>
                        <div className="logo-item">BRANDIX</div>
                        <div className="logo-item">DIALOG</div>
                        <div className="logo-item">SANKEN</div>
                        {/* Repeat for infinite effect */}
                        <div className="logo-item">VIRTUSA</div>
                        <div className="logo-item">SYSCO LABS</div>
                        <div className="logo-item">JOHN KEELLS</div>
                        <div className="logo-item">MAS HOLDINGS</div>
                        <div className="logo-item">WSO2</div>
                    </div>
                </div>
            </section>

            {/* 8️⃣ Testimonials Carousel Section */}
            <section className="testimonials-section-compact">
                <div className={`home-section-header animate-on-scroll ${isVisible['testimonials-header'] ? 'visible' : ''}`} id="testimonials-header">
                    <h2 className="home-section-title">Success Stories from <span className="highlight">StudyMate</span> Students</h2>
                </div>
                
                <div className="carousel-wrapper">
                    <button className="carousel-nav prev" onClick={prevReview} aria-label="Previous Review">
                        <ChevronLeft size={24} />
                    </button>
                    
                    <div className="testimonial-card-hurubuhuti animate-fade-in" key={currentReview}>
                        <div className="quote-icon-compact"><Quote size={32} fill="currentColor" opacity="0.1" /></div>
                        {reviews[currentReview] && (
                            <>
                                <p className="testimonial-text-compact">"{reviews[currentReview].comment}"</p>
                                
                                <div className="testimonial-footer-compact">
                                    <div className="testimonial-user-compact">
                                        <div className="user-avatar-compact"><img src={reviews[currentReview].avatar} alt={reviews[currentReview].name} /></div>
                                        <div className="user-info-compact">
                                            <h6>{reviews[currentReview].name}</h6>
                                            <span>{reviews[currentReview].degree} • {reviews[currentReview].year}</span>
                                        </div>
                                    </div>
                                    <div className="rating-compact">
                                        {[...Array(5)].map((_, i) => (
                                            <Star key={i} size={14} fill={i < reviews[currentReview].rating ? "#FFD700" : "none"} color={i < reviews[currentReview].rating ? "#FFD700" : "#cbd5e1"} />
                                        ))}
                                    </div>
                                </div>
                            </>
                        )}
                    </div>

                    <button className="carousel-nav next" onClick={nextReview} aria-label="Next Review">
                        <ChevronRight size={24} />
                    </button>
                </div>
                
                <div className="view-all-reviews">
                    <Link to="/reviews" className="btn-view-all">
                        View All Stories <ArrowRight size={16} />
                    </Link>
                </div>
            </section>

            {/* 10️⃣ Newsletter Section */}
            <section className="newsletter-section">
                <div className="newsletter-content-alt">
                    <div className="newsletter-image-side">
                        <img src={newsletterTips} alt="Newsletter Tips" className="newsletter-img-full" />
                        <div className="newsletter-overlay-gradient"></div>
                    </div>
                    
                    <div className="newsletter-text-side">
                        <div className="newsletter-text-content">
                            <h3 className="newsletter-title-alt">Stay updated with <span className="highlight-alt">Academic Tips</span></h3>
                            <p className="newsletter-desc-alt">Subscribe to our newsletter for the latest study materials and internship news.</p>
                        </div>
                        <form className="newsletter-form-alt" onSubmit={(e) => e.preventDefault()}>
                            <div className="input-with-icon-alt">
                                <Mail size={20} className="mail-icon-alt" />
                                <input type="email" placeholder="Enter your email address" required />
                            </div>
                            <button type="submit" className="btn-subscribe-alt">Subscribe Now</button>
                        </form>
                    </div>
                </div>
            </section>

            {/* 11️⃣ Call to Action - Only visible to guest users */}
            {!user && (
                <section className="cta-section">
                    <div className={`cta-content animate-on-scroll ${isVisible['cta-content'] ? 'visible' : ''}`} id="cta-content">
                        <div className="cta-icon-wrapper">
                            <GraduationCap size={60} strokeWidth={1} />
                        </div>
                        <h2>Start your academic journey with smart support.</h2>
                        <p>Join thousands of students who are already learning smarter.</p>
                        <Link to="/register" className="btn-cta-large">
                            Register Now
                            <ArrowRight size={20} className="ml-2" />
                        </Link>
                    </div>
                </section>
            )}
        </div>
    );
};

export default Home;
