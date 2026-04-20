import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
    Layout, Star, TrendingUp, Briefcase, Megaphone, Plus,
    Search, Edit, Trash2, CheckCircle, Clock, Eye, Save, X,
    BookOpen, AlertCircle, Sparkles, Filter, Shield, Target, Award,
    UserCircle, BarChart3, Info
} from 'lucide-react';
import './DashboardControl.css';

const DashboardControl = () => {
    const [activeSection, setActiveSection] = useState('announcements');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isViewModalOpen, setIsViewModalOpen] = useState(false);
    const [isEditing, setIsEditing] = useState(null);
    const [viewItem, setViewItem] = useState(null);
    const [toast, setToast] = useState(null);
    const [loading, setLoading] = useState(false);

    // Form States
    const [formData, setFormData] = useState({
        title: '', message: '', targetDegree: 'All', targetYear: '', priority: 'Normal',
        category: '', subject: '', trendValue: 'Hot', views: 0
    });

    const [announcements, setAnnouncements] = useState([]);
    const [featuredMaterials, setFeaturedMaterials] = useState([]);
    const [trendingIssues, setTrendingIssues] = useState([]);
    const [degrees, setDegrees] = useState([]); // New state for degrees

    const fetchDashboardData = async () => {
        setLoading(true);
        try {
            const { data } = await axios.get('/api/dashboard');
            setAnnouncements(data.filter(i => i.type === 'announcement'));
            setFeaturedMaterials(data.filter(i => i.type === 'featured'));
            setTrendingIssues(data.filter(i => i.type === 'trending'));
        } catch (error) {
            console.error("Fetch failed:", error);
        }
        setLoading(false);
    };

    const fetchDegrees = async () => {
        try {
            const { data } = await axios.get('/api/degrees');
            setDegrees(data);
        } catch (error) {
            console.error("Failed to fetch degrees:", error);
        }
    };

    useEffect(() => {
        fetchDashboardData();
        fetchDegrees(); // Fetch degrees on mount
    }, []);

    const showToast = (msg) => {
        setToast(msg);
        setTimeout(() => setToast(null), 3000);
    };

    const handleOpenModal = (editItem = null) => {
        if (editItem) {
            setIsEditing(editItem._id);
            setFormData({ ...editItem });
        } else {
            setIsEditing(null);
            setFormData({
                title: '', message: '', targetDegree: 'All', targetYear: '', priority: 'Normal',
                category: 'Material', subject: '', trendValue: 'Hot', views: 0
            });
        }
        setIsModalOpen(true);
    };

    const handleSave = async (e) => {
        e.preventDefault();
        setLoading(true);
        const userInfo = JSON.parse(localStorage.getItem('userInfo'));
        const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };

        const saveItem = {
            ...formData,
            type: activeSection.slice(0, -1), // announcement, featured, trending
        };

        try {
            if (isEditing) {
                await axios.put(`/api/dashboard/${isEditing}`, saveItem, config);
                showToast(`${activeSection.slice(0, -1)} updated successfully!`);
            } else {
                await axios.post('/api/dashboard', saveItem, config);
                showToast(`New ${activeSection.slice(0, -1)} added successfully!`);
            }
            fetchDashboardData();
            setIsModalOpen(false);
        } catch (error) {
            console.error("Save failed:", error);
        }
        setLoading(false);
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to remove this item?')) {
            setLoading(true);
            const userInfo = JSON.parse(localStorage.getItem('userInfo'));
            const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };
            try {
                await axios.delete(`/api/dashboard/${id}`, config);
                showToast('Item removed from dashboard');
                fetchDashboardData();
            } catch (error) {
                console.error("Delete failed:", error);
            }
            setLoading(false);
        }
    };

    const renderHeader = () => (
        <div className="mm-header">
            <div className="mm-header-left">
                <div className="mm-header-icon" style={{ background: 'rgba(59, 130, 246, 0.1)', color: '#3B82F6' }}><Sparkles size={28} /></div>
                <div className="mm-title">
                    <h1>Personalized Dashboard Control</h1>
                    <p>Global moderation of featured content and targeted student notifications.</p>
                </div>
            </div>
            <button className="btn-add-material" onClick={() => handleOpenModal()}>
                <Plus size={18} /> Add {activeSection.slice(0, -1)}
            </button>
        </div>
    );

    const renderTabs = () => (
        <div className="mod-tabs-mi">
            <button className={`mod-tab-btn-mi ${activeSection === 'announcements' ? 'active' : ''}`} onClick={() => setActiveSection('announcements')}>
                <Megaphone size={18} /> Announcements
            </button>
            <button className={`mod-tab-btn-mi ${activeSection === 'featured' ? 'active' : ''}`} onClick={() => setActiveSection('featured')}>
                <Star size={18} /> Featured Materials
            </button>
            <button className={`mod-tab-btn-mi ${activeSection === 'trending' ? 'active' : ''}`} onClick={() => setActiveSection('trending')}>
                <TrendingUp size={18} /> Trending Issues
            </button>
        </div>
    );

    const renderContent = () => {
        switch (activeSection) {
            case 'announcements':
                return (
                    <div className="mm-table-card">
                        <table className="mm-table">
                            <thead>
                                <tr><th>Alert Details</th><th>Target Audience</th><th>Priority</th><th>Views</th><th>Actions</th></tr>
                            </thead>
                            <tbody>
                                {announcements.map(a => (
                                    <tr key={a._id}>
                                        <td>
                                            <div style={{ display: 'flex', gap: '1rem' }}>
                                                <div className="user-avatar-circle" style={{ background: a.priority === 'High' ? 'rgba(239, 68, 68, 0.1)' : 'rgba(59, 130, 246, 0.1)', color: a.priority === 'High' ? '#EF4444' : '#3B82F6', border: 'none' }}><Megaphone size={18} /></div>
                                                <div className="user-td-details"><span className="u-name">{a.title}</span><span className="u-email" style={{ maxWidth: '250px' }}>{a.message}</span></div>
                                            </div>
                                        </td>
                                        <td>
                                            <div className="prog-details">
                                                <span className="degree-tag-mini" style={{ background: 'rgba(59, 130, 246, 0.1)', color: '#3B82F6' }}>{a.targetDegree} Students</span>
                                                <span className="p-year">{a.targetYear ? `Year ${a.targetYear}` : 'All Years'}</span>
                                            </div>
                                        </td>
                                        <td><span className={`role-badge ${a.priority.toLowerCase()}`} style={{ background: a.priority === 'High' ? 'rgba(239, 68, 68, 0.1)' : 'rgba(100, 116, 139, 0.1)', color: a.priority === 'High' ? '#EF4444' : '#94A3B8' }}>{a.priority}</span></td>
                                        <td><div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#64748B' }}><Eye size={14} /> {a.views}</div></td>
                                        <td><div className="mm-actions">
                                            <button className="btn-action-mm" title="View" onClick={() => { setViewItem(a); setIsViewModalOpen(true); }}><Eye size={16} /></button>
                                            <button className="btn-action-mm" title="Edit" onClick={() => handleOpenModal(a)}><Edit size={16} /></button>
                                            <button className="btn-action-mm danger" title="Delete" onClick={() => handleDelete(a._id)}><Trash2 size={16} /></button>
                                        </div></td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                );
            case 'featured':
                return (
                    <div className="mm-table-card">
                        <table className="mm-table">
                            <thead><tr><th>Material Item</th><th>Target Focus</th><th>Status</th><th>Added</th><th>Actions</th></tr></thead>
                            <tbody>
                                {featuredMaterials.map(m => (
                                    <tr key={m._id}>
                                        <td>
                                            <div style={{ display: 'flex', gap: '1rem' }}>
                                                <div className="user-avatar-circle" style={{ background: 'rgba(139, 92, 246, 0.1)', color: '#8B5CF6', border: 'none' }}><BookOpen size={18} /></div>
                                                <div className="user-td-details"><span className="u-name">{m.title}</span><span className="u-email">{m.subject}</span></div>
                                            </div>
                                        </td>
                                        <td><div className="prog-details"><span className="degree-tag-mini" style={{ background: 'rgba(139, 92, 246, 0.1)', color: '#8B5CF6' }}>{m.degree} Degree</span><span className="p-year">{m.year}</span></div></td>
                                        <td><span className="role-badge" style={{ color: '#EAB308', background: 'rgba(234, 179, 8, 0.1)' }}><Star size={12} style={{ marginRight: '4px' }} /> Featured</span></td>
                                        <td><span style={{ fontSize: '0.85rem', color: '#64748B' }}>{m.date}</span></td>
                                        <td><div className="mm-actions">
                                            <button className="btn-action-mm" onClick={() => handleOpenModal(m)}><Edit size={16} /></button>
                                            <button className="btn-action-mm danger" onClick={() => handleDelete(m._id)}><Trash2 size={16} /></button>
                                        </div></td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                );
            case 'trending':
                return (
                    <div className="mm-table-card">
                        <table className="mm-table">
                            <thead><tr><th>Problem / Inquiry</th><th>Performance</th><th>Trend Status</th><th>Scope</th><th>Actions</th></tr></thead>
                            <tbody>
                                {trendingIssues.map(i => (
                                    <tr key={i._id}>
                                        <td>
                                            <div style={{ display: 'flex', gap: '1rem' }}>
                                                <div className="user-avatar-circle" style={{ background: 'rgba(239, 68, 68, 0.1)', color: '#EF4444', border: 'none' }}><TrendingUp size={18} /></div>
                                                <div className="user-td-details"><span className="u-name">{i.title}</span><span className="u-email">{i.subject}</span></div>
                                            </div>
                                        </td>
                                        <td><div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#F1F5F9', fontSize: '0.9rem' }}><BarChart3 size={14} className="text-blue" /> {i.views} Reads</div></td>
                                        <td><span className="role-badge" style={{ color: '#EF4444', background: 'rgba(239, 68, 68, 0.1)' }}>🔥 {i.trendValue}</span></td>
                                        <td><span className="role-badge" style={{ color: '#94A3B8', background: 'rgba(100, 116, 139, 0.1)' }}>{i.degree} Only</span></td>
                                        <td><div className="mm-actions">
                                            <button className="btn-action-mm" onClick={() => handleOpenModal(i)}><Edit size={16} /></button>
                                            <button className="btn-action-mm danger" onClick={() => handleDelete(i._id)}><Trash2 size={16} /></button>
                                        </div></td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                );
            default: return null;
        }
    };

    return (
        <div className="manage-materials-page">
            <div className="mm-container">
                {renderHeader()}

                {toast && <div className="mm-toast"><CheckCircle size={18} /> {toast}</div>}

                <div className="mm-toolbar">
                    <div className="mm-search"><Search size={18} className="search-icon" /><input type="text" placeholder={`Filter ${activeSection}...`} /></div>
                    <div className="mm-filters"><button className="btn-toolbar-action"><Filter size={18} /> Audit History</button></div>
                </div>

                {renderTabs()}

                <div className="control-content-area" style={{ marginTop: '1.5rem' }}>{renderContent()}</div>

                {/* Add/Edit Modal */}
                {isModalOpen && (
                    <div className="modal-overlay">
                        <div className="modal-content mm-modal" style={{ maxWidth: '550px' }}>
                            <div className="modal-header">
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                    {activeSection === 'announcements' ? <Megaphone size={20} style={{ color: '#3B82F6' }} /> :
                                        activeSection === 'featured' ? <Star size={20} style={{ color: '#EAB308' }} /> :
                                            <TrendingUp size={20} style={{ color: '#EF4444' }} />}
                                    <h3>Manage {activeSection.slice(0, -1)}</h3>
                                </div>
                                <button className="btn-close-modal" onClick={() => setIsModalOpen(false)}><X size={20} /></button>
                            </div>
                            <form onSubmit={handleSave} className="mm-form-enhanced">
                                <div className="form-group" style={{ marginBottom: '1.5rem' }}><label>Item Title</label><input required type="text" value={formData.title} onChange={e => setFormData({ ...formData, title: e.target.value })} placeholder="e.g. Workshop Registration" /></div>
                                {activeSection === 'announcements' && (
                                    <div className="form-group" style={{ marginBottom: '1.5rem' }}><label>Message Content</label><textarea required value={formData.message} onChange={e => setFormData({ ...formData, message: e.target.value })} placeholder="Write details here..." style={{ minHeight: '100px', resize: 'none' }} /></div>
                                )}
                                <div className="form-grid" style={{ gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '1.5rem' }}>
                                    <div className="form-group"><label>{activeSection === 'announcements' ? 'Target Degree' : 'Category / Subject'}</label>
                                        {activeSection === 'announcements' ? (
                                            <select value={formData.targetDegree} onChange={e => setFormData({ ...formData, targetDegree: e.target.value })}>
                                                <option value="All">All Students</option>
                                                {degrees.map(d => <option key={d._id} value={d.name}>{d.name}</option>)}
                                            </select>
                                        ) : (
                                            <input required type="text" value={formData.subject} onChange={e => setFormData({ ...formData, subject: e.target.value })} placeholder="e.g. Web Dev" />
                                        )}
                                    </div>
                                    <div className="form-group"><label>{activeSection === 'announcements' ? 'Target Year' : 'Degree Scope'}</label>
                                        {activeSection === 'announcements' ? (
                                            <select value={formData.targetYear} onChange={e => setFormData({ ...formData, targetYear: e.target.value })}>
                                                <option value="">Any Year</option>
                                                <option value="1">1st Year</option>
                                                <option value="2">2nd Year</option>
                                                <option value="3">3rd Year</option>
                                                <option value="4">4th Year</option>
                                            </select>
                                        ) : (
                                            <select value={formData.degree} onChange={e => setFormData({ ...formData, degree: e.target.value })}>
                                                <option value="All">All Degrees</option>
                                                {degrees.map(d => <option key={`scope-${d._id}`} value={d.name}>{d.name}</option>)}
                                            </select>
                                        )}
                                    </div>
                                </div>
                                <div className="modal-footer-enhanced">
                                    <button type="button" className="btn-cancel-flat" onClick={() => setIsModalOpen(false)}>Cancel</button>
                                    <button type="submit" className="btn-save-glow" style={{ background: '#3B82F6' }}><Save size={18} style={{ marginRight: '8px' }} /> Save Changes</button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default DashboardControl;
