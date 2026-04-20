import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
    Users, CheckCircle, XCircle, Clock, Search,
    Filter, ArrowUpDown, Mail, Building, IdCard,
    Check, X, Eye, Loader2, GraduationCap, Trash2, ShieldAlert
} from 'lucide-react';
import './LecturerRequests.css';

const LecturerRequests = () => {
    const [requests, setRequests] = useState([]);
    const [degrees, setDegrees] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState('all');
    const [filterDept, setFilterDept] = useState('all');
    const [actionLoading, setActionLoading] = useState(null);

    useEffect(() => {
        fetchRequests();
        fetchSystemDegrees();
    }, []);

    const fetchSystemDegrees = async () => {
        try {
            const { data } = await axios.get('http://localhost:5000/api/degrees');
            setDegrees(data);
        } catch (error) {
            console.error('Error fetching degrees:', error);
        }
    };

    const fetchRequests = async () => {
        setLoading(true);
        try {
            const userInfo = JSON.parse(localStorage.getItem('userInfo'));
            const config = {
                headers: {
                    Authorization: `Bearer ${userInfo?.token}`
                }
            };
            const { data } = await axios.get('http://localhost:5000/api/lecturers/admin/requests', config);
            setRequests(data);
        } catch (error) {
            console.error('Error fetching requests:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleAction = async (id, status) => {
        setActionLoading(id);
        try {
            const userInfo = JSON.parse(localStorage.getItem('userInfo'));
            const config = {
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${userInfo?.token}`
                }
            };
            await axios.put(`http://localhost:5000/api/lecturers/admin/requests/${id}`, { status }, config);
            // Update local state
            setRequests(requests.map(req => req._id === id ? { ...req, status } : req));
        } catch (error) {
            console.error('Error updating status:', error);
        } finally {
            setActionLoading(null);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to permanently delete this request?')) return;

        setActionLoading(id);
        try {
            const userInfo = JSON.parse(localStorage.getItem('userInfo'));
            const config = {
                headers: {
                    Authorization: `Bearer ${userInfo?.token}`
                }
            };
            await axios.delete(`http://localhost:5000/api/lecturers/admin/requests/${id}`, config);
            setRequests(requests.filter(req => req._id !== id));
        } catch (error) {
            console.error('Error deleting request:', error);
        } finally {
            setActionLoading(null);
        }
    };

    const handleReset = () => {
        setSearchTerm('');
        setFilterStatus('all');
        setFilterDept('all');
    };

    // Get all system degrees for filter
    const degreeOptions = ['all', ...degrees.map(d => d.name)];

    const filteredRequests = requests.filter(req => {
        const matchesSearch = req.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            req.universityName.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = filterStatus === 'all' || req.status === filterStatus;
        
        const reqDegree = (req.user?.degree || req.department || 'Not Specified').trim().toLowerCase();
        const matchesDept = filterDept === 'all' || reqDegree === filterDept.trim().toLowerCase();
        
        return matchesSearch && matchesStatus && matchesDept;
    });

    return (
        <div className="lecturer-admin-page premium-theme animate-fade-in">
            <div className="admin-header">
                <div className="header-left">
                    <div className="icon-badge">
                        <Users size={28} />
                    </div>
                    <div>
                        <h1>Lecturer Access Requests</h1>
                        <p>Review and verify academic credentials for new accounts.</p>
                    </div>
                </div>
                <div className="header-right-stats">
                    <div className="mini-stat-badge">
                        <span className="count">{requests.filter(r => r.status === 'pending').length}</span>
                        <span className="label">Requests Pending</span>
                    </div>
                </div>
            </div>

            <div className="admin-controls glass-panel">
                <div className="search-box">
                    <Search size={18} className="lr-search-icon" />
                    <input
                        type="text"
                        placeholder="Search by name or university..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>

                <div className="filters-row">
                    <div className="filter-group">
                        <Filter size={18} className="filter-icon" />
                        <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
                            <option value="all">All Status</option>
                            <option value="pending">Pending Approval</option>
                            <option value="approved">Approved</option>
                            <option value="rejected">Rejected</option>
                        </select>
                    </div>

                    <div className="filter-group">
                        <GraduationCap size={18} className="filter-icon" />
                        <select value={filterDept} onChange={(e) => setFilterDept(e.target.value)}>
                            <option value="all">All Degree Programs</option>
                            {degrees.map(d => (
                                <option key={d._id} value={d.name}>{d.name}</option>
                            ))}
                        </select>
                    </div>

                    <button className="btn-reset-filters" onClick={handleReset} title="Reset All Filters">
                        <ArrowUpDown size={16} /> Reset
                    </button>
                </div>
            </div>

            <div className="requests-table-container glass-panel">
                {loading ? (
                    <div className="flex flex-col items-center justify-center py-20 gap-4">
                        <Loader2 className="animate-spin text-blue-400" size={40} />
                        <p className="text-slate-400 font-medium">Fetching academic records...</p>
                    </div>
                ) : filteredRequests.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20 text-slate-500">
                        <Users size={64} className="opacity-10 mb-4" />
                        <p className="text-lg">No lecturer requests found for this filter</p>
                    </div>
                ) : (
                    <table className="requests-table">
                        <thead>
                            <tr>
                                <th>Name & University</th>
                                <th>Degree Program</th>
                                <th>Applied Date</th>
                                <th>Status</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredRequests.map(req => (
                                <tr key={req._id}>
                                    <td>
                                        <div className="req-user-info">
                                            <div className="req-avatar">
                                                {req.name.charAt(0)}
                                            </div>
                                            <div>
                                                <div className="req-name">{req.name}</div>
                                                <div className="req-email"><Building size={12} /> {req.universityName}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td>
                                        <div className="req-dept">
                                            <GraduationCap size={14} className="mr-1" /> {req.user?.degree || req.department || 'Not Specified'}
                                        </div>
                                    </td>
                                    <td>
                                        <div className="req-date">
                                            <Clock size={14} className="mr-1" /> {new Date(req.createdAt).toLocaleDateString()}
                                        </div>
                                    </td>
                                    <td>
                                        <span className={`status-pill ${req.status}`}>
                                            {req.status.charAt(0).toUpperCase() + req.status.slice(1)}
                                        </span>
                                    </td>
                                    <td>
                                        <div className="action-buttons">
                                            {req.status !== 'approved' && (
                                                <button
                                                    className="btn-approve"
                                                    onClick={() => handleAction(req._id, 'approved')}
                                                    disabled={actionLoading === req._id}
                                                    title="Approve & Grant Access"
                                                >
                                                    {actionLoading === req._id ? <Loader2 className="animate-spin" size={16} /> : <Check size={18} />}
                                                </button>
                                            )}

                                            {req.status !== 'rejected' && (
                                                <button
                                                    className="btn-reject"
                                                    onClick={() => handleAction(req._id, 'rejected')}
                                                    disabled={actionLoading === req._id}
                                                    title={req.status === 'approved' ? "Block Lecturer" : "Reject Request"}
                                                >
                                                    {actionLoading === req._id ? <Loader2 className="animate-spin" size={16} /> : <ShieldAlert size={18} />}
                                                </button>
                                            )}

                                            <button
                                                className="btn-delete-row"
                                                onClick={() => handleDelete(req._id)}
                                                disabled={actionLoading === req._id}
                                                style={{
                                                    background: 'rgba(239, 68, 68, 0.1)',
                                                    color: '#EF4444',
                                                    border: '1px solid rgba(239, 68, 68, 0.2)',
                                                    padding: '0.6rem',
                                                    borderRadius: '0.75rem',
                                                    cursor: 'pointer'
                                                }}
                                                title="Delete Request Permanently"
                                            >
                                                {actionLoading === req._id ? <Loader2 className="animate-spin" size={16} /> : <Trash2 size={18} />}
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    );
};

export default LecturerRequests;
