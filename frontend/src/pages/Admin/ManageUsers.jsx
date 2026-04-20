import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
    User, Users, Trash2, Edit, AlertTriangle, Shield, CheckCircle, 
    Search, Plus, X, Eye, Mail, Calendar, Award, Hash, Clock, 
    GraduationCap, Save, Activity
} from 'lucide-react';
import './ManageUsers.css';

const ManageUsers = () => {
    const [users, setUsers] = useState([]);
    const [degrees, setDegrees] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [toast, setToast] = useState(null);

    // Modals state
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [isUserModalOpen, setIsUserModalOpen] = useState(false);
    const [isViewModalOpen, setIsViewModalOpen] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);
    
    // User operation state
    const [selectedUser, setSelectedUser] = useState(null);
    const [formData, setFormData] = useState({ id: null, name: '', email: '', password: '', role: 'Student', degree: '', year: '', status: 'active', faculty: '', universityName: '' });

    // Fetch Data from Backend
    useEffect(() => {
        fetchUsers();
        fetchDegrees();
    }, []);

    const fetchUsers = async () => {
        try {
            const userInfo = JSON.parse(localStorage.getItem('userInfo'));
            const token = userInfo?.token;
            if (!token) return;
            
            const { data } = await axios.get('/api/users', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setUsers(data.map(u => ({ ...u, id: u._id, role: u.role.charAt(0).toUpperCase() + u.role.slice(1) })));
        } catch (error) {
            console.error("Error fetching users:", error);
            if (error.response?.status === 401) {
                showToast("Session expired. Please login again.");
            } else {
                showToast("Failed to fetch users");
            }
        }
    };

    const fetchDegrees = async () => {
        try {
            const { data } = await axios.get('/api/degrees');
            setDegrees(data || []);
        } catch (error) {
            console.error("Error fetching degrees:", error);
        }
    };

    // Filter Users
    const filteredUsers = users.filter(user =>
        user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.role.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const showToast = (message) => {
        setToast(message);
        setTimeout(() => setToast(null), 3000);
    };

    // --- Action Handlers ---
    const handleViewClick = (user) => {
        setSelectedUser(user);
        setIsViewModalOpen(true);
    };

    const handleDeleteClick = (user) => {
        setSelectedUser(user);
        setIsDeleteModalOpen(true);
    };

    const confirmDelete = async () => {
        if (!selectedUser) return;
        setIsProcessing(true);
        try {
            const userInfo = JSON.parse(localStorage.getItem('userInfo'));
            const token = userInfo?.token;
            if (!token) throw new Error("No authorization token found");

            await axios.delete(`/api/users/${selectedUser.id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setUsers(users.filter(u => u.id !== selectedUser.id));
            setIsDeleteModalOpen(false);
            showToast(`User ${selectedUser.name} removed successfully.`);
        } catch (error) {
            console.error("Error deleting user:", error);
            showToast(error.message || "Failed to delete user");
        }
        setIsProcessing(false);
        setSelectedUser(null);
    };

    const handleAddClick = () => {
        setFormData({ id: null, name: '', email: '', password: '', role: 'Student', degree: '', year: '', status: 'active', faculty: '', universityName: '' });
        setIsUserModalOpen(true);
    };

    const handleEditClick = (user) => {
        setFormData({ ...user, password: '' });
        setIsUserModalOpen(true);
    };

    const handleSaveUser = async (e) => {
        e.preventDefault();
        setIsProcessing(true);

        const payload = {
            name: formData.name,
            email: formData.email,
            role: formData.role.toLowerCase(),
            status: formData.status,
            degree: formData.degree,
            year: formData.year,
            faculty: formData.faculty,
            universityName: formData.universityName,
        };

        if (formData.password) {
            payload.password = formData.password;
        }

        try {
            const userInfo = JSON.parse(localStorage.getItem('userInfo'));
            const token = userInfo?.token;
            if (!token) throw new Error("No authorization token found. Please login.");

            const config = { headers: { Authorization: `Bearer ${token}` } };

            if (formData.id) {
                const { data } = await axios.put(`/api/users/${formData.id}`, payload, config);
                const updatedUser = { ...data, id: data._id, role: data.role.charAt(0).toUpperCase() + data.role.slice(1) };
                setUsers(users.map(u => u.id === formData.id ? updatedUser : u));
                showToast(`User ${data.name} updated successfully.`);
            } else {
                const { data } = await axios.post('/api/users', payload, config);
                const newUser = { ...data, id: data._id, role: data.role.charAt(0).toUpperCase() + data.role.slice(1) };
                setUsers([...users, newUser]);
                showToast(`User ${data.name} added successfully.`);
            }
            setIsUserModalOpen(false);
        } catch (error) {
            console.error("Error saving user:", error);
            showToast(error.response?.data?.message || error.message || "Failed to save user");
        }
        setIsProcessing(false);
    };

    return (
        <div className="manage-materials-page">
            <div className="mm-container">
                {/* Header Section */}
                <div className="mm-header">
                    <div className="mm-header-left">
                        <div className="mm-header-icon">
                            <Users size={28} />
                        </div>
                        <div className="mm-title">
                            <h1>User Management</h1>
                            <p>Manage permissions, update student records, and control system access.</p>
                        </div>
                    </div>
                    <button className="btn-add-material" onClick={handleAddClick}>
                        <Plus size={18} /> Add New User
                    </button>
                </div>

                {/* Success Toast */}
                {toast && (
                    <div className="mm-toast">
                        <CheckCircle size={18} /> {toast}
                    </div>
                )}

                {/* Toolbar */}
                <div className="mm-toolbar">
                    <div className="mm-search">
                        <Search size={18} className="search-icon" />
                        <input 
                            type="text" 
                            placeholder="Search by name, email or role..." 
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <div className="mm-filters">
                        <button className="btn-toolbar-action">
                            <Activity size={18} /> User Logs
                        </button>
                    </div>
                </div>

                {/* Table Area */}
                <div className="mm-table-card">
                    <div className="mm-table-wrapper">
                        <table className="mm-table">
                            <thead>
                                <tr>
                                    <th>User Details</th>
                                    <th>Role</th>
                                    <th>Program Details</th>
                                    <th>Status</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredUsers.map((user) => (
                                    <tr key={user.id}>
                                        <td>
                                            <div className="user-cell">
                                                <div className="user-avatar-circle">
                                                    <User size={18} />
                                                </div>
                                                <div className="user-td-details">
                                                    <span className="u-name">{user.name}</span>
                                                    <span className="u-email">{user.email}</span>
                                                </div>
                                            </div>
                                        </td>
                                        <td>
                                            <span className={`role-badge ${user.role.toLowerCase()}`}>
                                                {user.role}
                                            </span>
                                        </td>
                                        <td>
                                            {user.role === 'Admin' || user.role === 'Partner' || user.role === 'Lecturer' ? (
                                                <div className="prog-details">
                                                    <span className="u-degree">{user.role === 'Admin' ? 'System Root' : user.role === 'Partner' ? (user.universityName || 'Partner Entity') : user.faculty || 'No Faculty'}</span>
                                                    <span className="p-year">{user.role === 'Lecturer' ? (user.universityName || 'Academic Staff') : (user.role === 'Partner' ? 'Corporate' : 'Core Service')}</span>
                                                </div>
                                            ) : (
                                                <div className="prog-details">
                                                    <span className="u-degree">{user.degree || 'N/A'}</span>
                                                    <span className="p-year">Year: {user.year || 'N/A'}</span>
                                                </div>
                                            )}
                                        </td>
                                        <td>
                                            <span className={`user-status-badge ${user.status || 'active'}`}>
                                                {user.status === 'deactivated' ? 'Inactive' : 'Active'}
                                            </span>
                                        </td>
                                        <td>
                                            <div className="mm-actions">
                                                <button className="btn-action-mm" title="View" onClick={() => handleViewClick(user)}><Eye size={16} /></button>
                                                <button className="btn-action-mm" title="Edit" onClick={() => handleEditClick(user)}><Edit size={16} /></button>
                                                <button className="btn-action-mm danger" title="Delete" onClick={() => { setSelectedUser(user); setIsDeleteModalOpen(true); }}><Trash2 size={16} /></button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* 👁️ View User Modal - Premium Layout */}
                {isViewModalOpen && selectedUser && (
                    <div className="modal-overlay">
                        <div className="modal-content mm-modal" style={{maxWidth: '650px', padding: '0', overflow: 'hidden'}}>
                            <div className="view-profile-hero" style={{background: 'linear-gradient(135deg, #1E293B 0%, #0B111F 100%)', padding: '3rem 2.5rem', position: 'relative'}}>
                                <button className="btn-close-modal" style={{position: 'absolute', top: '1.5rem', right: '1.5rem'}} onClick={() => setIsViewModalOpen(false)}><X size={24} style={{color: '#64748B'}}/></button>
                                <div style={{display: 'flex', alignItems: 'center', gap: '2rem'}}>
                                    <div className="view-avatar-large" style={{width: '90px', height: '90px', borderRadius: '24px', background: 'rgba(59, 130, 246, 0.1)', color: '#3182CE', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid rgba(59, 130, 246, 0.2)'}}>
                                        <User size={48} />
                                    </div>
                                    <div>
                                        <h2 style={{color: 'white', fontSize: '1.8rem', fontWeight: '800', marginBottom: '8px'}}>{selectedUser.name}</h2>
                                        <div style={{display: 'flex', gap: '0.75rem', alignItems: 'center'}}>
                                            <span className={`role-badge ${selectedUser.role.toLowerCase()}`} style={{fontSize: '0.8rem', padding: '0.3rem 1rem'}}>{selectedUser.role} Account</span>
                                            <span className={`user-status-badge ${selectedUser.status}`} style={{fontSize: '0.75rem'}}>{selectedUser.status === 'deactivated' ? 'Inactive' : 'Active'}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            
                            <div style={{padding: '2.5rem', display: 'flex', flexDirection: 'column', gap: '2rem'}}>
                                <div className="view-info-section">
                                    <h4 style={{color: '#64748B', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem'}}><Hash size={14} /> Account Details</h4>
                                    <div className="view-info-card-grid" style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem'}}>
                                        <div style={{background: 'rgba(30, 41, 59, 0.3)', padding: '1.25rem', borderRadius: '16px', border: '1px solid rgba(255, 255, 255, 0.03)'}}>
                                            <label style={{color: '#64748B', fontSize: '0.75rem', display: 'block', marginBottom: '6px'}}>Email Address</label>
                                            <span style={{color: '#CBD5E1', fontWeight: '600', fontSize: '0.95rem', wordBreak: 'break-all'}}>{selectedUser.email}</span>
                                        </div>
                                        <div style={{background: 'rgba(30, 41, 59, 0.3)', padding: '1.25rem', borderRadius: '16px', border: '1px solid rgba(255, 255, 255, 0.03)'}}>
                                            <label style={{color: '#64748B', fontSize: '0.75rem', display: 'block', marginBottom: '6px'}}>Internal ID</label>
                                            <code style={{color: '#3182CE', fontSize: '0.8rem', fontWeight: '700'}}>{selectedUser.id?.slice(-8).toUpperCase()}</code>
                                        </div>
                                    </div>
                                </div>

                                {selectedUser.role === 'Student' ? (
                                    <div className="view-info-section">
                                        <h4 style={{color: '#64748B', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem'}}><GraduationCap size={14} /> Academic Profile</h4>
                                        <div className="view-info-card-grid" style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem'}}>
                                            <div style={{background: 'rgba(30, 41, 59, 0.3)', padding: '1.25rem', borderRadius: '16px', border: '1px solid rgba(255, 255, 255, 0.03)'}}>
                                                <label style={{color: '#64748B', fontSize: '0.75rem', display: 'block', marginBottom: '6px'}}>Degree Program</label>
                                                <span style={{color: '#F8FAFC', fontWeight: '600'}}>{selectedUser.degree || 'N/A'}</span>
                                            </div>
                                            <div style={{background: 'rgba(30, 41, 59, 0.3)', padding: '1.25rem', borderRadius: '16px', border: '1px solid rgba(255, 255, 255, 0.03)'}}>
                                                <label style={{color: '#64748B', fontSize: '0.75rem', display: 'block', marginBottom: '6px'}}>Academic Year</label>
                                                <span style={{color: '#10B981', fontWeight: '700'}}>{selectedUser.year || 'N/A'}</span>
                                            </div>
                                        </div>
                                    </div>
                                ) : (selectedUser.role === 'Lecturer' && (
                                    <div className="view-info-section">
                                        <h4 style={{color: '#64748B', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem'}}><Award size={14} /> Faculty Details</h4>
                                        <div className="view-info-card-grid" style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem'}}>
                                            <div style={{background: 'rgba(30, 41, 59, 0.3)', padding: '1.25rem', borderRadius: '16px', border: '1px solid rgba(255, 255, 255, 0.03)'}}>
                                                <label style={{color: '#64748B', fontSize: '0.75rem', display: 'block', marginBottom: '6px'}}>Faculty / Dept</label>
                                                <span style={{color: '#F8FAFC', fontWeight: '600'}}>{selectedUser.faculty || 'N/A'}</span>
                                            </div>
                                            <div style={{background: 'rgba(30, 41, 59, 0.3)', padding: '1.25rem', borderRadius: '16px', border: '1px solid rgba(255, 255, 255, 0.03)'}}>
                                                <label style={{color: '#64748B', fontSize: '0.75rem', display: 'block', marginBottom: '6px'}}>University</label>
                                                <span style={{color: '#60A5FA', fontWeight: '700'}}>{selectedUser.universityName || 'Academic Staff'}</span>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div className="modal-footer-enhanced" style={{background: 'rgba(15, 23, 42, 0.6)', padding: '1.5rem 2.5rem', marginBottom: '0'}}>
                                <button className="btn-cancel-flat" onClick={() => setIsViewModalOpen(false)}>Close</button>
                                <div style={{display: 'flex', gap: '1rem'}}>
                                    <button 
                                        className={`btn-action-mm ${selectedUser.status === 'deactivated' ? 'success' : 'danger-outline'}`}
                                        onClick={async () => {
                                            const newStatus = selectedUser.status === 'deactivated' ? 'active' : 'deactivated';
                                            const userInfo = JSON.parse(localStorage.getItem('userInfo'));
                                            const token = userInfo?.token;
                                            try {
                                                await axios.put(`http://localhost:5000/api/users/${selectedUser.id}`, { status: newStatus }, {
                                                    headers: { Authorization: `Bearer ${token}` }
                                                });
                                                setUsers(users.map(u => u.id === selectedUser.id ? { ...u, status: newStatus } : u));
                                                setSelectedUser({ ...selectedUser, status: newStatus });
                                                showToast(`User marked as ${newStatus}`);
                                            } catch (err) {
                                                showToast("Status update failed");
                                            }
                                        }}
                                    >
                                        {selectedUser.status === 'deactivated' ? <CheckCircle size={16} /> : <AlertTriangle size={16} />}
                                        {selectedUser.status === 'deactivated' ? 'Activate User' : 'Deactivate User'}
                                    </button>
                                    <button className="btn-save-glow" style={{background: '#3182CE'}} onClick={() => { setIsViewModalOpen(false); handleEditClick(selectedUser); }}>
                                        <Edit size={16} /> Edit Profile
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* ⚠️ Delete Confirmation Modal */}
                {isDeleteModalOpen && selectedUser && (
                    <div className="modal-overlay">
                        <div className="modal-content mm-modal-small">
                            <div className="warning-icon-bg">
                                <AlertTriangle size={32} />
                            </div>
                            <h3>Remove Account?</h3>
                            <p>Are you sure you want to permanently delete <strong>{selectedUser.name}</strong>? This action will revoke all access instantly.</p>
                            <div className="modal-footer-enhanced" style={{border: 'none', justifyContent: 'center'}}>
                                <button className="btn-cancel-flat" onClick={() => setIsDeleteModalOpen(false)}>Cancel</button>
                                <button className="btn-danger-confirm" onClick={confirmDelete}>
                                    {isProcessing ? 'Removing...' : 'Confirm Delete'}
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* ✏️ Add/Edit User Modal */}
                {isUserModalOpen && (
                    <div className="modal-overlay">
                        <div className="modal-content mm-modal">
                            <div className="modal-header">
                                <h3>{formData.id ? 'Edit User' : 'Add New User'}</h3>
                                <button className="btn-close-modal" onClick={() => setIsUserModalOpen(false)}><X size={20}/></button>
                            </div>
                            <form onSubmit={handleSaveUser} className="mm-form-enhanced">
                                <div className="form-grid">
                                    <div className="form-group">
                                        <label><User size={16} /> {formData.role === 'Partner' ? 'Company Name' : 'Full Name'}</label>
                                        <input required type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} placeholder={formData.role === 'Partner' ? "e.g. Virtusa, IFS, WSO2" : "e.g. John Doe"} />
                                    </div>
                                    <div className="form-group">
                                        <label><Mail size={16} /> Email Address</label>
                                        <input required type="email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} placeholder="student@sliit.lk" />
                                    </div>
                                    <div className="form-group">
                                        <label><Shield size={16} /> Password</label>
                                        <input 
                                            type="password" 
                                            placeholder={formData.id ? "Leave blank to keep current" : "Set password..."} 
                                            value={formData.password} 
                                            onChange={e => setFormData({...formData, password: e.target.value})} 
                                            required={!formData.id}
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label><Award size={16} /> Role</label>
                                        <select value={formData.role} onChange={e => setFormData({...formData, role: e.target.value})}>
                                            <option value="Student">Student</option>
                                            <option value="Lecturer">Lecturer</option>
                                            <option value="Admin">Admin</option>
                                            <option value="Partner">Partner</option>
                                        </select>
                                    </div>
                                    <div className="form-group">
                                        <label><Activity size={16} /> Status</label>
                                        <select value={formData.status} onChange={e => setFormData({...formData, status: e.target.value})}>
                                            <option value="active">Active</option>
                                            <option value="deactivated">Inactive</option>
                                        </select>
                                    </div>
                                    {(formData.role === 'Student' || formData.role === 'Lecturer') && (
                                        <div className="form-group">
                                            <label><GraduationCap size={16} /> Degree Program</label>
                                            <select 
                                                required 
                                                value={formData.degree || ''} 
                                                onChange={e => setFormData({...formData, degree: e.target.value})}
                                            >
                                                <option value="">Select Degree</option>
                                                {degrees.map(deg => (
                                                    <option key={deg._id} value={deg.title || deg.name}>
                                                        {deg.title || deg.name}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>
                                    )}

                                    {formData.role === 'Student' && (
                                        <div className="form-group">
                                            <label><Calendar size={16} /> Academic Year</label>
                                            <select required value={formData.year || ''} onChange={e => setFormData({...formData, year: parseInt(e.target.value)})}>
                                                <option value="">Choose Year</option>
                                                <option value="1">1st Year</option>
                                                <option value="2">2nd Year</option>
                                                <option value="3">3rd Year</option>
                                                <option value="4">4th Year</option>
                                            </select>
                                        </div>
                                    )}

                                    {formData.role === 'Lecturer' && (
                                        <>
                                            <div className="form-group">
                                                <label><Award size={16} /> Faculty / Dept</label>
                                                <input required type="text" value={formData.faculty || ''} onChange={e => setFormData({...formData, faculty: e.target.value})} placeholder="e.g. Computing, Engineering" />
                                            </div>
                                            <div className="form-group">
                                                <label><GraduationCap size={16} /> University Name</label>
                                                <input required type="text" value={formData.universityName || ''} onChange={e => setFormData({...formData, universityName: e.target.value})} placeholder="e.g. SLIIT" />
                                            </div>
                                        </>
                                    )}
                                </div>
                                <div className="modal-footer-enhanced">
                                    <button type="button" className="btn-cancel-flat" onClick={() => setIsUserModalOpen(false)}>Cancel</button>
                                    <button type="submit" className="btn-save-glow" disabled={isProcessing}>
                                        <Save size={18} /> {isProcessing ? 'Saving...' : 'Save User'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ManageUsers;
