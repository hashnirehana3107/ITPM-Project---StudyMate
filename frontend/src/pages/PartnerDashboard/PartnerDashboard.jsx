import React, { useState, useEffect, useContext } from 'react';
import { 
    Briefcase, Plus, Edit3, Trash2, Eye, Search, Filter, 
    CheckCircle, AlertCircle, X, Save, Clock, MapPin, 
    Building, GraduationCap, Target, BookOpen, UserPlus, 
    LayoutDashboard, LogOut, ChevronRight, PieChart, Users, Zap, Mail,
    Calendar, Laptop, Info, Layers, UserCheck, Link, AlertTriangle,
    User, FileText
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import AuthContext from '../../context/AuthContext';
import './PartnerDashboard.css';

const PartnerDashboard = () => {
    const { user, logout, updateProfile } = useContext(AuthContext);
    const navigate = useNavigate();
    const [internships, setInternships] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [successMessage, setSuccessMessage] = useState('');
    const [errorMessage, setErrorMessage] = useState('');
    const [degrees, setDegrees] = useState([]);

    // Modal States
    const [isFormModalOpen, setIsFormModalOpen] = useState(false);
    const [isViewModalOpen, setIsViewModalOpen] = useState(false);
    const [isProfileEditModalOpen, setIsProfileEditModalOpen] = useState(false);
    const [selectedInternship, setSelectedInternship] = useState(null);

    // Profile Edit State
    const [profileForm, setProfileForm] = useState({
        name: user?.name || '',
        email: user?.email || '',
    });

    // Form State - Matches Admin
    const [formData, setFormData] = useState({
        title: '', 
        company: user?.name || '', 
        location: '', 
        type: 'Full-time', 
        degree: '', 
        eligibleYears: [],
        deadline: '',
        duration: '',
        description: '',
        requirements: '',
        skills: '',
        softSkills: '',
        guidancePath: '',
        guidanceTips: '',
        applicationLink: ''
    });

    useEffect(() => {
        if (user?.token) {
            fetchMyInternships();
            fetchApplicants();
        }
        const fetchDegrees = async () => {
            try {
                const { data } = await axios.get('http://localhost:5000/api/degrees');
                setDegrees(data);
            } catch (e) { console.warn('Failed to fetch degrees'); }
        };
        fetchDegrees();
    }, [user]);

    const fetchMyInternships = async () => {
        try {
            setLoading(true);
            const token = user?.token; // Consistently use token from context
            if (!token) return; // Wait for auth load

            const config = {
                headers: { Authorization: `Bearer ${token}` }
            };
            const { data } = await axios.get('http://localhost:5000/api/internships/employer', config);
            
            // Modern, high-fidelity mock entries
            const mockEntries = [
                {
                    _id: 'mock1',
                    title: 'Senior Technical Lead',
                    company: user?.name,
                    location: 'Colombo / Remote',
                    type: 'Full-time',
                    degree: 'IT/SE',
                    eligibleYears: ['3rd Year', '4th Year'],
                    deadline: '2024-05-20',
                    duration: '6 Months',
                    status: 'approved',
                    createdAt: new Date(Date.now() - 86400000).toISOString(),
                    views: 256,
                    description: 'We are looking for a Senior Technical Lead to handle architecture and team growth.',
                    requirements: ['React Mastery', 'System Design', 'Cloud Architecture'],
                    skills: 'React, Node, AWS, Docker',
                    guidanceTips: 'Brush up on System Design Patterns.\nPrepare case studies of previous projects.',
                    guidancePath: 'Senior Dev -> Architect -> CTO'
                },
                {
                    _id: 'mock2',
                    title: 'Product Design Intern',
                    company: user?.name,
                    location: 'Kandy / On-site',
                    type: 'Internship',
                    degree: 'Design',
                    eligibleYears: ['2nd Year', '3rd Year'],
                    deadline: '2024-06-15',
                    duration: '3 Months',
                    status: 'pending',
                    createdAt: new Date(Date.now() - 172800000).toISOString(),
                    views: 92,
                    description: 'Creative design internship focusing on UX and prototyping.',
                    requirements: ['Figma Expert', 'Design Thinking', 'Prototyping'],
                    skills: 'Figma, Adobe Suite, Interaction Design',
                    guidanceTips: 'Showcase your portfolio clearly.\nExplain your design process during interview.',
                    guidancePath: 'Intern -> Junior Designer -> UX Lead'
                }
            ];

            if (data) {
                setInternships(data);
            }
            setLoading(false);
        } catch (error) {
            console.error('Error fetching internships:', error);
            setLoading(false);
        }
    };

    const fetchApplicants = async () => {
        try {
            const token = user?.token;
            if (!token) return;

            const config = {
                headers: { Authorization: `Bearer ${token}` }
            };
            const { data } = await axios.get('http://localhost:5000/api/applications/partner', config);
            setApplicants(data);
        } catch (error) {
            console.error('Error fetching applicants:', error);
        }
    };

    const handleFormSubmit = async (e) => {
        e.preventDefault();
        try {
            const token = user?.token; // Get token directly from context
            if (!token) {
                setErrorMessage('Your session has expired. Please login again.');
                return;
            }
            const config = { headers: { Authorization: `Bearer ${token}` } };
            
            // Map frontend fields to backend schema
            const submissionData = {
                ...formData,
                company: user?.name, // Force current partner name
                requirements: formData.requirements.toString().split(',').map(r => r.trim()).filter(r => r !== ''),
                // Keep the combined guidance for legacy student Details page view
                guidance: `Career Path:\n${formData.guidancePath}\n\nPreparation:\n${formData.guidanceTips}\n\nTech Skills: ${formData.skills}`
            };

            if (selectedInternship && selectedInternship._id && !selectedInternship._id.startsWith('mock')) {
                // Update existing
                await axios.put(`http://localhost:5000/api/internships/${selectedInternship._id}/status`, { ...submissionData, status: 'pending' }, config);
                showSuccess('Internship updated successfully! Re-sent for admin approval.');
            } else {
                // Create new
                await axios.post('http://localhost:5000/api/internships', submissionData, config);
                showSuccess('Internship posted successfully! Waiting for admin approval.');
            }
            
            setIsFormModalOpen(false);
            fetchMyInternships();
            setFormData({
                title: '', company: user?.name || '', location: '', type: 'Full-time', degree: '', eligibleYears: [], 
                deadline: '', duration: '', description: '', requirements: '', 
                skills: '', softSkills: '', guidancePath: '', guidanceTips: '', applicationLink: ''
            });
        } catch (error) {
            setErrorMessage(error.response?.data?.message || 'Error processing internship');
        }
    };

    const handleEditClick = (intern) => {
        setSelectedInternship(intern);
        setFormData({
            title: intern.title || '',
            company: intern.company || user?.name || '',
            location: intern.location || '',
            type: intern.type || 'Full-time',
            degree: intern.degree || '',
            eligibleYears: intern.eligibleYears || [],
            deadline: intern.deadline || '',
            duration: intern.duration || '',
            description: intern.description || '',
            // Ensure requirements is joined back into a string for the form
            requirements: Array.isArray(intern.requirements) ? intern.requirements.join(', ') : (intern.requirements || ''),
            skills: intern.skills || '',
            softSkills: intern.softSkills || '',
            guidancePath: intern.guidancePath || '',
            guidanceTips: intern.guidanceTips || '',
            applicationLink: intern.applicationLink || ''
        });
        setIsFormModalOpen(true);
    };

    const confirmDelete = async (id) => {
        if (!window.confirm('Are you sure you want to remove this internship listing? This action cannot be undone.')) return;
        
        try {
            const token = user?.token;
            if (!token) return;
            const config = { headers: { Authorization: `Bearer ${token}` } };
            
            if (id.startsWith('mock')) {
                setInternships(internships.filter(i => i._id !== id));
                showSuccess('Mock internship removed locally.');
            } else {
                await axios.delete(`http://localhost:5000/api/internships/${id}`, config);
                showSuccess('Internship removed successfully.');
                fetchMyInternships();
            }
        } catch (error) {
            setErrorMessage('Error removing internship');
        }
    };

    const handleYearToggle = (year) => {
        if (formData.eligibleYears.includes(year)) {
            setFormData({ ...formData, eligibleYears: formData.eligibleYears.filter(y => y !== year) });
        } else {
            setFormData({ ...formData, eligibleYears: [...formData.eligibleYears, year] });
        }
    };

    const handleProfileUpdate = async (e) => {
        e.preventDefault();
        try {
            const token = user?.token;
            if (!token) return;
            const config = { headers: { Authorization: `Bearer ${token}` } };
            
            const { data } = await axios.put(`http://localhost:5000/api/users/${user._id}`, profileForm, config);
            
            updateProfile(data);
            showSuccess('Profile updated successfully!');
            setIsProfileEditModalOpen(false);
        } catch (error) {
            setErrorMessage(error.response?.data?.message || 'Error updating profile');
        }
    };

    const showSuccess = (msg) => {
        setSuccessMessage(msg);
        setTimeout(() => setSuccessMessage(''), 4000);
    };

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    // Tab Management
    const [activeTab, setActiveTab] = useState('dashboard');

    // Applicants State - Connected to Backend
    const [applicants, setApplicants] = useState([]);

    const handleApplicantStatusChange = async (appId, newStatus, studentName) => {
        try {
            const token = user?.token;
            if (!token) return;

            const config = {
                headers: { Authorization: `Bearer ${token}` }
            };

            await axios.put(`http://localhost:5000/api/applications/${appId}/status`, { status: newStatus }, config);
            
            setApplicants(applicants.map(app => 
                app._id === appId ? { ...app, status: newStatus } : app
            ));
            
            showSuccess(`Status Updated! In-App Notification Sent to ${studentName}`);
        } catch (error) {
            setErrorMessage('Error updating application status');
        }
    };

    const generateMailtoLink = (app) => {
        const companyName = user?.name || 'StudyMate Partner';
        const studentName = app.student?.name || 'Student';
        const jobTitle = app.internship?.title || 'the position';
        const subject = encodeURIComponent(`Update on your Application via StudyMate: ${jobTitle}`);
        const body = encodeURIComponent(
`Dear ${studentName},

Thank you for your interest in the "${jobTitle}" position at ${companyName}, applied via the StudyMate platform.

We are writing to provide you with an update regarding your application. Your current status is: ${app.status}.

[ Please type any additional feedback, interview details, or instructions here ]

We appreciate the time and effort you put into your application. If you have any questions or require further clarification, please feel free to reply directly to this email.

Best Regards,
The Hiring Team
${companyName}`
        );
        return `mailto:${app.email}?subject=${subject}&body=${body}`;
    };

    const stats = [
        { label: 'Total Jobs', value: internships.length, icon: <Briefcase />, color: '#3B82F6' },
        { label: 'Active Talent', value: applicants.length, icon: <Users />, color: '#10B981' },
        { label: 'Interviews', value: 2, icon: <Zap />, color: '#F59E0B' },
        { label: 'Engagement', value: '94%', icon: <CheckCircle />, color: '#8B5CF6' }
    ];

    return (
        <div className="partner-dashboard">
            {/* Sidebar */}
            <aside className="pd-sidebar">
                <div className="pd-logo">
                    <Zap size={28} className="logo-icon" />
                    <span>StudyMate <span>Partner</span></span>
                </div>
                
                <nav className="pd-nav">
                    <div className="nav-group">
                        <small>Main Menu</small>
                        <button 
                            className={`nav-item ${activeTab === 'dashboard' ? 'active' : ''}`}
                            onClick={() => setActiveTab('dashboard')}
                        >
                            <LayoutDashboard size={18} /> Dashboard
                        </button>
                        <button 
                            className={`nav-item ${activeTab === 'internships' ? 'active' : ''}`}
                            onClick={() => setActiveTab('internships')}
                        >
                            <Briefcase size={18} /> My Internships
                        </button>
                        <button 
                            className={`nav-item ${activeTab === 'applicants' ? 'active' : ''}`}
                            onClick={() => setActiveTab('applicants')}
                        >
                            <Users size={18} /> Applicants
                        </button>
                    </div>
                    <div className="nav-group">
                        <small>Settings</small>
                        <button 
                            className={`nav-item ${activeTab === 'profile' ? 'active' : ''}`}
                            onClick={() => setActiveTab('profile')}
                        >
                            <Building size={18} /> Company Profile
                        </button>
                        <button className="nav-item logout-btn" onClick={handleLogout}><LogOut size={18} /> Logout</button>
                    </div>
                </nav>
            </aside>

            {/* Main Content */}
            <main className="pd-main">
                {/* Dashboard Tab */}
                {activeTab === 'dashboard' && (
                    <>
                        <header className="pd-header">
                            <div className="header-titles">
                                <h1>Corporate Overview</h1>
                                <p>Quick insights into your organization's recruitment performance.</p>
                            </div>
                            <button className="btn-post-internship" onClick={() => {
                                setFormData({
                                    title: '', company: user?.name || '', location: '', type: 'Full-time', degree: '', eligibleYears: [], 
                                    deadline: '', duration: '', description: '', requirements: '', 
                                    skills: '', softSkills: '', guidancePath: '', guidanceTips: '', applicationLink: ''
                                });
                                setIsFormModalOpen(true);
                            }}>
                                <Plus size={18} /> Post New Opportunity
                            </button>
                        </header>

                        {successMessage && <div className="pd-alert success shake-animation"><CheckCircle size={18} /> {successMessage}</div>}
                        {errorMessage && <div className="pd-alert error shake-animation"><AlertCircle size={18} /> {errorMessage}</div>}

                        <div className="pd-stats-grid">
                            {stats.map((stat, idx) => (
                                <div key={idx} className="stat-card-pd" style={{ borderBottom: `3px solid ${stat.color}` }}>
                                    <div className="stat-icon-pd" style={{ color: stat.color, background: `${stat.color}15` }}>{stat.icon}</div>
                                    <div className="stat-info-pd">
                                        <span className="stat-value">{stat.value}</span>
                                        <span className="stat-label">{stat.label}</span>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="pd-dashboard-split" style={{display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '2rem', marginTop: '2.5rem'}}>
                            <div className="pd-table-section">
                                <div className="table-header-pd">
                                    <h2>Latest Listings</h2>
                                    <button onClick={() => setActiveTab('internships')} style={{background: 'transparent', border: 'none', color: '#3B82F6', fontWeight: '700', fontSize: '0.8rem', cursor: 'pointer', padding: '4px 8px', borderRadius: '6px', transition: 'all 0.3s'}}>View All</button>
                                </div>
                                <div className="pd-table-wrapper mini">
                                    <table className="pd-table">
                                        <tbody>
                                            {internships.slice(0, 3).map(item => (
                                                <tr key={item._id}>
                                                    <td>
                                                        <div className="pos-cell">
                                                            <span className="pos-title">{item.title}</span>
                                                            <span className="pos-loc">{item.location} • {item.type}</span>
                                                        </div>
                                                    </td>
                                                    <td><span className={`status-pill-pd ${item.status}`}>{item.status}</span></td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                            <div className="pd-table-section">
                                <div className="table-header-pd">
                                    <h2>Recent Applicants</h2>
                                    <button onClick={() => setActiveTab('applicants')} style={{background: 'transparent', border: 'none', color: '#3B82F6', fontWeight: '700', fontSize: '0.8rem', cursor: 'pointer', padding: '4px 8px', borderRadius: '6px', transition: 'all 0.3s'}}>View All</button>
                                </div>
                                <div className="pd-table-wrapper mini">
                                    <table className="pd-table">
                                        <tbody>
                                            {applicants.slice(0, 3).map(app => (
                                                <tr key={app._id}>
                                                    <td>
                                                        <div className="pos-cell">
                                                            <span className="pos-title">{app.name}</span>
                                                            <span className="pos-loc">{app.degree} • {app.institution || 'StudyMate Partner University'}</span>
                                                        </div>
                                                    </td>
                                                    <td><span style={{fontSize: '0.75rem', color: '#64748B'}}>{app.status}</span></td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    </>
                )}

                {/* My Internships Tab */}
                {activeTab === 'internships' && (
                    <>
                        <header className="pd-header">
                            <div className="header-titles">
                                <h1>Manage Internships</h1>
                                <p>Full control over your job postings and recruitment lifecycle.</p>
                            </div>
                            <button className="btn-post-internship" onClick={() => setIsFormModalOpen(true)}>
                                <Plus size={18} /> Post New Opportunity
                            </button>
                        </header>

                        <div className="pd-table-section">
                            <div className="table-header-pd">
                                <h2>All Active Opportunities</h2>
                                <div className="pd-search-bar">
                                    <Search size={18} />
                                    <input type="text" placeholder="Search internships..." value={search} onChange={(e) => setSearch(e.target.value)} />
                                </div>
                            </div>

                            <div className="pd-table-wrapper">
                                {loading ? (
                                    <div className="pd-loader">Loading...</div>
                                ) : (
                                    <table className="pd-table">
                                        <thead>
                                            <tr>
                                                <th>Position Details</th>
                                                <th>Degree</th>
                                                <th>Status</th>
                                                <th>Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {internships.filter(i => i.title.toLowerCase().includes(search.toLowerCase())).map(item => (
                                                <tr key={item._id}>
                                                    <td>
                                                        <div className="pos-cell">
                                                            <span className="pos-title">{item.title}</span>
                                                            <span className="pos-loc"><MapPin size={12} /> {item.location} • {item.type}</span>
                                                        </div>
                                                    </td>
                                                    <td><span className="degree-tag-pd">{item.degree}</span></td>
                                                    <td><span className={`status-pill-pd ${item.status}`}>{item.status}</span></td>
                                                    <td>
                                                        <div className="pd-actions">
                                                            <button className="btn-pd-icon" onClick={() => { setSelectedInternship(item); setIsViewModalOpen(true); }}><Eye size={16} /></button>
                                                            <button className="btn-pd-icon" onClick={() => handleEditClick(item)}><Edit3 size={16} /></button>
                                                            <button className="btn-pd-icon danger" onClick={() => confirmDelete(item._id)}><Trash2 size={16} /></button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                )}
                            </div>
                        </div>
                    </>
                )}

                {/* Applicants Tab */}
                {activeTab === 'applicants' && (
                    <>
                        <header className="pd-header">
                            <div className="header-titles">
                                <h1>Talent Pool</h1>
                                <p>Track and manage student applications for your listings.</p>
                            </div>
                        </header>

                        <div className="pd-table-section">
                            <div className="pd-table-wrapper">
                                <table className="pd-table">
                                    <thead>
                                        <tr>
                                            <th>Applicant</th>
                                            <th>Job Role</th>
                                            <th>Academic Status</th>
                                            <th>Status</th>
                                            <th>Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {applicants.map(app => (
                                            <tr key={app._id}>
                                                <td>
                                                    <div className="pos-cell">
                                                        <span className="pos-title">{app.student?.name}</span>
                                                        <span className="pos-loc">{app.email} | {app.phoneNumber}</span>
                                                    </div>
                                                </td>
                                                <td><span style={{color: '#94A3B8', fontSize: '0.9rem'}}>{app.internship?.title}</span></td>
                                                <td>
                                                    <div className="pos-cell">
                                                        <span className="pos-title">{app.student?.degree}</span>
                                                        <span className="pos-loc">{app.student?.year}</span>
                                                    </div>
                                                </td>
                                                <td>
                                                    <select 
                                                        value={app.status}
                                                        onChange={(e) => handleApplicantStatusChange(app._id, e.target.value, app.student?.name)}
                                                        style={{
                                                            padding: '4px 8px', borderRadius: '8px', 
                                                            border: 'none', background: 'rgba(59, 130, 246, 0.1)', 
                                                            color: '#3B82F6', outline: 'none', cursor: 'pointer',
                                                            fontWeight: '600', fontSize: '0.75rem'
                                                        }}
                                                    >
                                                        <option value="Pending">Pending</option>
                                                        <option value="Under Review">Under Review</option>
                                                        <option value="Shortlisted">Shortlisted</option>
                                                        <option value="Interviewing">Interviewing</option>
                                                        <option value="Rejected">Rejected</option>
                                                        <option value="Hired">Hired</option>
                                                    </select>
                                                </td>
                                                <td>
                                                    <div className="pd-actions">
                                                    <a 
                                                        href={app.email ? generateMailtoLink(app) : '#'} 
                                                        target="_blank" 
                                                        rel="noopener noreferrer" 
                                                        className={`btn-pd-icon ${!app.email ? 'disabled-link' : ''}`} 
                                                        title={app.email ? "Send Instant Email" : "Email Address Missing"}
                                                        onClick={(e) => { if(!app.email) e.preventDefault(); }}
                                                    >
                                                        <Mail size={16} />
                                                    </a>
                                                        {app.cvPath && (
                                                            <a 
                                                                href={`http://localhost:5000/${app.cvPath}`} 
                                                                target="_blank" 
                                                                rel="noopener noreferrer" 
                                                                className="btn-pd-icon" 
                                                                title="Download CV"
                                                                style={{ color: '#10B981' }}
                                                            >
                                                                <FileText size={16} />
                                                            </a>
                                                        )}
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </>
                )}

                {/* Profile Tab */}
                {activeTab === 'profile' && (
                    <div className="pd-profile-view">
                        <header className="pd-header" style={{marginBottom: '0'}}>
                            <div className="header-titles">
                                <h1>Company Branding</h1>
                                <p>Manage your corporate identity and public profile.</p>
                            </div>
                            <button className="btn-post-internship" onClick={() => {
                                setSelectedInternship(null);
                                setProfileForm({ name: user?.name || '', email: user?.email || '' });
                                setIsProfileEditModalOpen(true);
                            }}>
                                <Edit3 size={18} /> Update Profile
                            </button>
                        </header>

                        <div className="pd-profile-grid">
                            <div className="pd-profile-card main-info">
                                <div className="profile-banner-pd"></div>
                                <div className="profile-details-pd">
                                    <div className="profile-brand-pd">
                                        <div className="brand-logo-pd">{user?.name?.charAt(0) || 'C'}</div>
                                        <div className="brand-text-pd">
                                            <h3>{user?.name}</h3>
                                            <span className="badge-verified-pd"><CheckCircle size={14} /> Verified Partner</span>
                                        </div>
                                    </div>
                                    <div className="info-list-pd">
                                        <div className="info-item-pd"><Mail size={18} /> <div><label>Email</label><p>{user?.email}</p></div></div>
                                        <div className="info-item-pd"><Building size={18} /> <div><label>Type</label><p>Corporate Partner</p></div></div>
                                        <div className="info-item-pd"><MapPin size={18} /> <div><label>HQ</label><p>Colombo, SL</p></div></div>
                                    </div>
                                </div>
                            </div>

                            <div className="pd-profile-card stats-overview">
                                <h3>Recruitment Impact</h3>
                                <div className="impact-stats-pd">
                                    <div className="impact-box"><span className="val">{internships.length}</span><span className="lbl">Jobs Posted</span></div>
                                    <div className="impact-box"><span className="val">{applicants.length}</span><span className="lbl">Total Applicants</span></div>
                                </div>
                                <div className="recruitment-status-pd">
                                    <div className="status-progress-pd"><div className="progress-label">Response</div><div className="progress-bar-pd"><div className="fill" style={{width: '85%'}}></div></div></div>
                                    <div className="status-progress-pd"><div className="progress-label">Engagement</div><div className="progress-bar-pd"><div className="fill" style={{width: '92%'}}></div></div></div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </main>

            {/* Post Modal - Matches Admin Form Fields */}
            {isFormModalOpen && (
                <div className="pd-modal-overlay">
                    <div className="pd-modal-content" style={{maxWidth: '850px', maxHeight: '90vh', overflowY: 'auto'}}>
                        <div className="pd-modal-header" style={{position: 'sticky', top: 0, background: '#1E293B', zIndex: 10, borderBottom: '1px solid rgba(148, 163, 184, 0.1)'}}>
                            <h3>{selectedInternship ? 'Edit Internship Opportunity' : 'Post New Internship Opportunity'}</h3>
                            <button onClick={() => setIsFormModalOpen(false)}><X size={20} /></button>
                        </div>
                        <form className="pd-form" onSubmit={handleFormSubmit} style={{padding: '2rem'}}>
                            <div className="pd-form-grid">
                                <div className="pd-form-group">
                                    <label><Briefcase size={14} style={{verticalAlign: 'middle', marginRight: '6px'}}/> Job Role Title</label>
                                    <input type="text" required value={formData.title} onChange={(e) => setFormData({...formData, title: e.target.value})} placeholder="e.g. Frontend Intern" />
                                </div>
                                <div className="pd-form-group">
                                    <label><Building size={14} style={{verticalAlign: 'middle', marginRight: '6px'}}/> Company</label>
                                    <input type="text" disabled value={user?.name || ''} className="disabled-input-pd" style={{background: 'rgba(148, 163, 184, 0.05)', color: '#60A5FA', cursor: 'not-allowed'}} />
                                </div>
                                <div className="pd-form-group">
                                    <label><MapPin size={14} style={{verticalAlign: 'middle', marginRight: '6px'}}/> Location</label>
                                    <input type="text" required value={formData.location} onChange={(e) => setFormData({...formData, location: e.target.value})} placeholder="e.g. Colombo / Remote" />
                                </div>
                                <div className="pd-form-group">
                                    <label><Layers size={14} style={{verticalAlign: 'middle', marginRight: '6px'}}/> Job Type</label>
                                    <select value={formData.type} onChange={(e) => setFormData({...formData, type: e.target.value})}>
                                        <option value="Full-time">Full-time</option>
                                        <option value="Part-time">Part-time</option>
                                        <option value="Remote">Remote</option>
                                    </select>
                                </div>
                                <div className="pd-form-group">
                                    <label><GraduationCap size={14} style={{verticalAlign: 'middle', marginRight: '6px'}}/> Target Degree</label>
                                    <select required value={formData.degree} onChange={(e) => setFormData({...formData, degree: e.target.value})}>
                                        <option value="">Select Degree</option>
                                        {degrees.map(d => (
                                            <option key={d._id} value={d.name}>{d.name}</option>
                                        ))}
                                    </select>
                                </div>
                                <div className="pd-form-group">
                                    <label><Clock size={14} style={{verticalAlign: 'middle', marginRight: '6px'}}/> Duration</label>
                                    <input type="text" value={formData.duration} onChange={(e) => setFormData({...formData, duration: e.target.value})} placeholder="e.g. 6 Months" />
                                </div>
                                <div className="pd-form-group">
                                    <label><Calendar size={14} style={{verticalAlign: 'middle', marginRight: '6px'}}/> Application Deadline</label>
                                    <input type="date" required value={formData.deadline} onChange={(e) => setFormData({...formData, deadline: e.target.value})} />
                                </div>

                                <div className="pd-form-group-full">
                                    <label><Target size={14} style={{verticalAlign: 'middle', marginRight: '6px'}}/> Target Audiences (Eligible Years)</label>
                                    <div style={{display: 'flex', flexWrap: 'wrap', gap: '1.5rem', marginTop: '0.5rem'}}>
                                        {['1st Year', '2nd Year', '3rd Year', '4th Year'].map(year => (
                                            <label key={year} style={{display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', color: '#CBD5E1', fontSize: '0.9rem'}}>
                                                <input type="checkbox" checked={formData.eligibleYears.includes(year)} onChange={() => handleYearToggle(year)} style={{width: '18px', height: '18px'}} />
                                                <span>{year}</span>
                                            </label>
                                        ))}
                                    </div>
                                </div>

                                <div className="pd-form-group-full">
                                    <label><Info size={14} style={{verticalAlign: 'middle', marginRight: '6px'}}/> Role Overview (Description)</label>
                                    <textarea required rows="2" value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})} placeholder="Brief overview of the role..."></textarea>
                                </div>
                                <div className="pd-form-group-full">
                                    <label><CheckCircle size={14} style={{verticalAlign: 'middle', marginRight: '6px'}}/> Key Requirements (One per line)</label>
                                    <textarea required rows="2" value={formData.requirements} onChange={(e) => setFormData({...formData, requirements: e.target.value})} placeholder="Requirement 1&#10;Requirement 2"></textarea>
                                </div>
                                
                                <div className="pd-form-group">
                                    <label><Laptop size={14} style={{verticalAlign: 'middle', marginRight: '6px'}}/> Tech Skills (Comma separated)</label>
                                    <input type="text" value={formData.skills} onChange={(e) => setFormData({...formData, skills: e.target.value})} placeholder="React, Node.js, Git" />
                                </div>
                                <div className="pd-form-group">
                                    <label><UserCheck size={14} style={{verticalAlign: 'middle', marginRight: '6px'}}/> Soft Skills (Comma separated)</label>
                                    <input type="text" value={formData.softSkills} onChange={(e) => setFormData({...formData, softSkills: e.target.value})} placeholder="Communication, Teamwork" />
                                </div>

                                <div className="pd-form-group-full">
                                    <label><Target size={14} style={{verticalAlign: 'middle', marginRight: '6px'}}/> Career Guidance Path</label>
                                    <input type="text" value={formData.guidancePath} onChange={(e) => setFormData({...formData, guidancePath: e.target.value})} placeholder="e.g. Stepping stone for becoming a SE" />
                                </div>
                                <div className="pd-form-group-full">
                                    <label><BookOpen size={14} style={{verticalAlign: 'middle', marginRight: '6px'}}/> Preparation Tips (One per line)</label>
                                    <textarea rows="2" value={formData.guidanceTips} onChange={(e) => setFormData({...formData, guidanceTips: e.target.value})} placeholder="Tip 1&#10;Tip 2"></textarea>
                                </div>
                                <div className="pd-form-group-full">
                                    <label><Link size={14} style={{verticalAlign: 'middle', marginRight: '6px'}}/> Application Link (External Link)</label>
                                    <input type="url" required value={formData.applicationLink} onChange={(e) => setFormData({...formData, applicationLink: e.target.value})} placeholder="https://example.com/apply" />
                                </div>
                            </div>
                            <div className="pd-modal-footer">
                                <button type="button" className="btn-pd-cancel" onClick={() => setIsFormModalOpen(false)}>Cancel</button>
                                <button type="submit" className="btn-pd-submit"><Save size={18} /> Submit & Sync</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* View Modal */}
            {isViewModalOpen && selectedInternship && (
                <div className="pd-modal-overlay">
                    <div className="pd-modal-content view-modal">
                        <div className="pd-modal-header" style={{borderBottom: '1px solid rgba(59, 130, 246, 0.1)', paddingBottom: '1.25rem'}}>
                            <div>
                                <h3 style={{fontSize: '1.25rem', fontWeight: '800', color: '#F8FAFC', marginBottom: '4px'}}>Internship Details</h3>
                                <span style={{fontSize: '0.7rem', color: '#3B82F6', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.05em'}}>Recruitment Insights & Data Sync</span>
                            </div>
                            <button onClick={() => setIsViewModalOpen(false)} style={{background: 'rgba(15, 23, 42, 0.5)', border: 'none', color: '#64748B', cursor: 'pointer', padding: '6px', borderRadius: '8px'}}><X size={20} /></button>
                        </div>
                        <div className="pd-view-body" style={{overflowY: 'auto', overflowX: 'hidden', maxHeight: '78vh', padding: '0 1rem 1.5rem'}}>
                            <div className="view-header-pd" style={{
                                display: 'flex', gap: '1.5rem', alignItems: 'center', 
                                marginBottom: '2rem', background: 'linear-gradient(90deg, rgba(59, 130, 246, 0.08) 0%, rgba(30, 41, 59, 0) 100%)', 
                                padding: '2rem', borderRadius: '24px', borderLeft: '4px solid #3B82F6'
                            }}>
                                <div style={{width: '72px', height: '72px', background: '#3B82F6', borderRadius: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#FFFFFF', boxShadow: '0 8px 16px -4px rgba(59, 130, 246, 0.4)'}}>
                                    <Building size={36} />
                                </div>
                                <div style={{flex: 1, minWidth: 0}}>
                                    <h4 style={{fontSize: '1.75rem', fontWeight: '900', color: '#F8FAFC', marginBottom: '0.4rem', letterSpacing: '-0.02em', overflowWrap: 'anywhere'}}>{selectedInternship.title}</h4>
                                    <div style={{display: 'flex', gap: '1rem', alignItems: 'center', flexWrap: 'wrap'}}>
                                        <span style={{color: '#94A3B8', fontWeight: '700', fontSize: '1rem', overflowWrap: 'anywhere'}}>{selectedInternship.company}</span>
                                        <span style={{
                                            padding: '4px 12px', 
                                            background: selectedInternship.status === 'approved' ? 'rgba(34, 197, 94, 0.15)' : 'rgba(234, 179, 8, 0.15)', 
                                            color: selectedInternship.status === 'approved' ? '#4ADE80' : '#FBBF24', 
                                            borderRadius: '8px', fontSize: '0.75rem', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.05em'
                                        }}>{selectedInternship.status}</span>
                                    </div>
                                </div>
                            </div>

                            <div className="view-details-grid-pd" style={{
                                display: 'grid', 
                                gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', 
                                gap: '1.25rem', 
                                marginBottom: '3rem',
                                width: '100%'
                            }}>
                                {[
                                    { label: 'Location', value: selectedInternship.location, icon: MapPin },
                                    { label: 'Type', value: selectedInternship.type, icon: Briefcase },
                                    { label: 'Degree', value: selectedInternship.degree, icon: GraduationCap },
                                    { label: 'Duration', value: selectedInternship.duration || 'N/A', icon: Clock },
                                    { label: 'Deadline', value: selectedInternship.deadline || 'N/A', icon: Calendar },
                                    { label: 'Eligibility', value: Array.isArray(selectedInternship.eligibleYears) ? selectedInternship.eligibleYears.join(', ') : (selectedInternship.eligibleYears || 'N/A'), icon: UserPlus }
                                ].map((item, idx) => (
                                    <div key={idx} style={{
                                        background: 'rgba(30, 41, 59, 0.4)', 
                                        padding: '1.25rem', 
                                        borderRadius: '18px', 
                                        border: '1px solid rgba(148, 163, 184, 0.1)', 
                                        transition: 'transform 0.2s',
                                        overflow: 'hidden',
                                        minWidth: 0
                                    }}>
                                        <div style={{display: 'flex', alignItems: 'center', gap: '10px', color: '#64748B', marginBottom: '0.75rem'}}>
                                            <div style={{color: '#3B82F6'}}><item.icon size={16} /></div>
                                            <span style={{fontSize: '0.7rem', textTransform: 'uppercase', fontWeight: '800', letterSpacing: '0.08em'}}>{item.label}</span>
                                        </div>
                                        <span style={{
                                            color: '#F1F5F9', 
                                            fontWeight: '700', 
                                            fontSize: '0.95rem', 
                                            display: 'block',
                                            overflowWrap: 'anywhere',
                                            wordBreak: 'break-all'
                                        }}>{item.value}</span>
                                    </div>
                                ))}
                            </div>

                            <div className="view-content-split-pd" style={{
                                display: 'grid', 
                                gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', 
                                gap: '2.5rem', 
                                marginBottom: '3rem'
                            }}>
                                <div className="v-text-block" style={{minWidth: 0}}>
                                    <h5 style={{color: '#3B82F6', fontSize: '0.9rem', fontWeight: '900', textTransform: 'uppercase', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '10px', letterSpacing: '0.05em'}}>
                                        <FileText size={18} /> Description
                                    </h5>
                                    <div style={{
                                        color: '#CBD5E1', lineHeight: '1.8', background: 'rgba(30, 41, 59, 0.3)', 
                                        padding: '1.75rem', borderRadius: '20px', border: '1px solid rgba(148, 163, 184, 0.05)', 
                                        fontSize: '1.05rem', whiteSpace: 'pre-line',
                                        overflowWrap: 'anywhere',
                                        wordBreak: 'break-all'
                                    }}>
                                        {selectedInternship.description}
                                    </div>
                                </div>
                                <div className="v-text-block" style={{minWidth: 0}}>
                                    <h5 style={{color: '#3B82F6', fontSize: '0.9rem', fontWeight: '900', textTransform: 'uppercase', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '10px', letterSpacing: '0.05em'}}>
                                        <CheckCircle size={18} /> Essential Requirements
                                    </h5>
                                    <div style={{
                                        background: 'rgba(30, 41, 59, 0.3)', padding: '1.75rem', 
                                        borderRadius: '20px', border: '1px solid rgba(148, 163, 184, 0.05)',
                                        overflowWrap: 'anywhere',
                                        wordBreak: 'break-all'
                                    }}>
                                        {Array.isArray(selectedInternship.requirements) ? (
                                            <ul style={{listStyle: 'none', padding: 0, margin: 0}}>
                                                {selectedInternship.requirements.map((req, i) => (
                                                    <li key={i} style={{color: '#CBD5E1', marginBottom: '14px', display: 'flex', gap: '12px', fontSize: '1rem', alignItems: 'flex-start'}}>
                                                        <span style={{color: '#3B82F6', marginTop: '4px'}}>•</span> 
                                                        <span style={{overflowWrap: 'anywhere', wordBreak: 'break-all'}}>{req}</span>
                                                    </li>
                                                ))}
                                            </ul>
                                        ) : (
                                            <p style={{color: '#CBD5E1', fontSize: '1rem', lineHeight: '1.6', overflowWrap: 'anywhere', wordBreak: 'break-all'}}>{selectedInternship.requirements}</p>
                                        )}
                                    </div>
                                </div>
                            </div>

                            <div style={{
                                background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.12) 0%, rgba(15, 23, 42, 0.4) 100%)', 
                                padding: '2.5rem', borderRadius: '24px', border: '1px solid rgba(59, 130, 246, 0.25)',
                                boxShadow: '0 20px 50px -20px rgba(0,0,0,0.5)', marginBottom: '1rem'
                            }}>
                                <h5 style={{color: '#F8FAFC', fontSize: '1.2rem', fontWeight: '900', marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '14px'}}>
                                    <Laptop size={24} style={{color: '#3B82F6'}} /> Career Guidance & Skills
                                </h5>
                                <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '2rem'}}>
                                    <div style={{background: 'rgba(15, 23, 42, 0.3)', padding: '1.5rem', borderRadius: '16px', overflowWrap: 'anywhere', wordBreak: 'break-all', minWidth: 0}}>
                                        <span style={{display: 'block', color: '#3B82F6', fontSize: '0.75rem', fontWeight: '900', textTransform: 'uppercase', marginBottom: '0.75rem', letterSpacing: '0.1em'}}>Core Skills</span>
                                        <p style={{color: '#F8FAFC', fontSize: '1rem', fontWeight: '600', lineHeight: '1.6'}}>{selectedInternship.skills || 'N/A'}</p>
                                    </div>
                                    <div style={{background: 'rgba(15, 23, 42, 0.3)', padding: '1.5rem', borderRadius: '16px', overflowWrap: 'anywhere', wordBreak: 'break-all', minWidth: 0}}>
                                        <span style={{display: 'block', color: '#3B82F6', fontSize: '0.75rem', fontWeight: '900', textTransform: 'uppercase', marginBottom: '0.75rem', letterSpacing: '0.1em'}}>Interview Prep</span>
                                        <p style={{color: '#F8FAFC', fontSize: '1rem', fontWeight: '600', lineHeight: '1.6', whiteSpace: 'pre-line'}}>{selectedInternship.guidanceTips || 'N/A'}</p>
                                    </div>
                                    <div style={{background: 'rgba(15, 23, 42, 0.3)', padding: '1.5rem', borderRadius: '16px', overflowWrap: 'anywhere', wordBreak: 'break-all', minWidth: 0}}>
                                        <span style={{display: 'block', color: '#3B82F6', fontSize: '0.75rem', fontWeight: '900', textTransform: 'uppercase', marginBottom: '0.75rem', letterSpacing: '0.1em'}}>Career Pathway</span>
                                        <p style={{color: '#F8FAFC', fontSize: '1rem', fontWeight: '600', lineHeight: '1.6'}}>{selectedInternship.guidancePath || 'N/A'}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Profile Edit Modal */}
            {isProfileEditModalOpen && (
                <div className="pd-modal-overlay">
                    <div className="pd-modal-content">
                        <div className="pd-modal-header">
                            <h3>Update Company Profile</h3>
                            <button onClick={() => setIsProfileEditModalOpen(false)}><X size={20} /></button>
                        </div>
                        <form className="pd-form" onSubmit={handleProfileUpdate}>
                            <div className="pd-form-grid">
                                <div className="pd-form-group-full">
                                    <label>Company Name</label>
                                    <input 
                                        type="text" 
                                        required 
                                        value={profileForm.name} 
                                        onChange={(e) => setProfileForm({...profileForm, name: e.target.value})} 
                                        placeholder="e.g. Acme Corporation" 
                                    />
                                </div>
                                <div className="pd-form-group-full">
                                    <label>Company Email (BRN Email)</label>
                                    <input 
                                        type="email" 
                                        required 
                                        value={profileForm.email} 
                                        onChange={(e) => setProfileForm({...profileForm, email: e.target.value})} 
                                        placeholder="corporate@company.com" 
                                    />
                                </div>
                            </div>
                            <div className="pd-modal-footer">
                                <button type="button" className="btn-pd-cancel" onClick={() => setIsProfileEditModalOpen(false)}>Cancel</button>
                                <button type="submit" className="btn-pd-submit"><Save size={18} /> Save Changes</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Alerts */}
            {successMessage && <div className="pd-alert success" style={{position: 'fixed', bottom: '2rem', right: '2rem', zIndex: 2000}}><CheckCircle size={20} /> {successMessage}</div>}
            {errorMessage && <div className="pd-alert error" style={{position: 'fixed', bottom: '2rem', right: '2rem', zIndex: 2000}}><AlertCircle size={20} /> {errorMessage}</div>}
        </div>
    );
};

export default PartnerDashboard;
