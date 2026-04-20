import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { 
    GraduationCap, Plus, Edit3, Trash2, Search, Filter, 
    CheckCircle, AlertTriangle, X, Save, ArrowLeft, 
    Settings, Layers, BookOpen, Activity, ChevronRight,
    ClipboardList, Database, Calendar, Clock
} from 'lucide-react';
import './ManageDegrees.css';

const ManageDegrees = () => {
    const navigate = useNavigate();

    const [degrees, setDegrees] = useState([]);
    const [loading, setLoading] = useState(false);
    const [search, setSearch] = useState('');
    const [activeTab, setActiveTab] = useState('degrees'); 
    const [selectedDegree, setSelectedDegree] = useState(null);
    const [filterYear, setFilterYear] = useState('all');

    // Modal State
    const [isDegreeModalOpen, setIsDegreeModalOpen] = useState(false);
    const [isSubjectModalOpen, setIsSubjectModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    
    // Forms
    const [degreeForm, setDegreeForm] = useState({ id: null, name: '', code: '', years: 4 });
    const [subjectForm, setSubjectForm] = useState({ id: null, name: '', code: '', year: '1st Year' });
    const [itemToDelete, setItemToDelete] = useState(null);
    const [successMessage, setSuccessMessage] = useState('');

    // Backend Fetching
    useEffect(() => {
        fetchDegrees();
    }, []);

    const fetchDegrees = async () => {
        setLoading(true);
        try {
            const { data } = await axios.get('http://localhost:5000/api/degrees');
            setDegrees(data.map(d => ({ ...d, id: d._id, subjectCount: d.subjects?.length || 0, status: 'Active' })));
        } catch (error) {
            console.error("Error fetching degrees:", error);
        }
        setLoading(false);
    };

    // Filtering
    const filteredDegrees = (degrees || []).filter(d => 
        d.name?.toLowerCase().includes(search.toLowerCase()) || 
        d.code?.toLowerCase().includes(search.toLowerCase())
    );

    const filteredSubjects = selectedDegree?.subjects?.filter(s => 
        (filterYear === 'all' || s.year.toString() === filterYear.replace(/\D/g,'')) &&
        (s.name.toLowerCase().includes(search.toLowerCase()) || s.code.toLowerCase().includes(search.toLowerCase()))
    ) || [];

    // Handlers
    const showSuccess = (msg) => {
        setSuccessMessage(msg);
        setTimeout(() => setSuccessMessage(''), 3000);
    };

    const handleAddDegree = () => {
        setDegreeForm({ id: null, name: '', code: '', years: 4 });
        setIsDegreeModalOpen(true);
    };

    const handleEditDegree = (degree) => {
        setDegreeForm(degree);
        setIsDegreeModalOpen(true);
    };

    const handleAddSubject = () => {
        setSubjectForm({ id: null, name: '', code: '', year: '1st Year' });
        setIsSubjectModalOpen(true);
    };

    const handleEditSubject = (subject) => {
        setSubjectForm({ ...subject, id: subject._id });
        setIsSubjectModalOpen(true);
    };

    const confirmDelete = async () => {
        setLoading(true);
        const userInfo = JSON.parse(localStorage.getItem('userInfo'));
        const token = userInfo?.token;
        const config = { headers: { Authorization: `Bearer ${token}` } };

        try {
            if (itemToDelete.type === 'degree') {
                await axios.delete(`http://localhost:5000/api/degrees/${itemToDelete.id}`, config);
                showSuccess('Degree program removed');
                setSelectedDegree(null);
            } else {
                const updatedSubjects = selectedDegree.subjects.filter(s => s._id !== itemToDelete.id);
                await axios.put(`http://localhost:5000/api/degrees/${selectedDegree.id}`, { subjects: updatedSubjects }, config);
                showSuccess('Subject removed from curriculum');
            }
            
            // Re-fetch all degrees to get latest data
            const { data } = await axios.get('http://localhost:5000/api/degrees');
            const mapped = data.map(d => ({ ...d, id: d._id, subjectCount: d.subjects?.length || 0, status: 'Active' }));
            setDegrees(mapped);
            
            // If we were in subject view, update the selected degree reference
            if (itemToDelete.type === 'subject') {
                const updatedDegree = mapped.find(d => d.id === selectedDegree.id);
                if (updatedDegree) setSelectedDegree(updatedDegree);
            }
        } catch (error) {
            console.error("Delete failed:", error);
        }
        setIsDeleteModalOpen(false);
        setLoading(false);
    };

    const handleDegreeSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        const userInfo = JSON.parse(localStorage.getItem('userInfo'));
        const token = userInfo?.token;
        const config = { headers: { Authorization: `Bearer ${token}` } };

        try {
            if (degreeForm.id) {
                await axios.put(`http://localhost:5000/api/degrees/${degreeForm.id}`, degreeForm, config);
                showSuccess('Degree details updated');
            } else {
                await axios.post('http://localhost:5000/api/degrees', degreeForm, config);
                showSuccess('New degree program added');
            }
            fetchDegrees();
            setIsDegreeModalOpen(false);
        } catch (error) {
            console.error("Save failed:", error);
        }
        setLoading(false);
    };

    const handleSubjectSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        const userInfo = JSON.parse(localStorage.getItem('userInfo'));
        const token = userInfo?.token;
        const config = { headers: { Authorization: `Bearer ${token}` } };

        try {
            const yearNum = parseInt(subjectForm.year.replace(/\D/g,''));
            const subjectData = { ...subjectForm, year: yearNum, semester: 1 };

            let updatedSubjects;
            if (subjectForm.id) {
                updatedSubjects = selectedDegree.subjects.map(s => s._id === subjectForm.id ? subjectData : s);
            } else {
                updatedSubjects = [...(selectedDegree.subjects || []), subjectData];
            }

            await axios.put(`http://localhost:5000/api/degrees/${selectedDegree.id}`, { subjects: updatedSubjects }, config);
            showSuccess('Curriculum updated successfully');
            
            // Re-fetch and maintain selection
            const { data } = await axios.get('http://localhost:5000/api/degrees');
            setDegrees(data.map(d => ({ ...d, id: d._id, subjectCount: d.subjects?.length || 0, status: 'Active' })));
            const updatedDegree = data.find(d => d._id === selectedDegree.id);
            setSelectedDegree({ ...updatedDegree, id: updatedDegree._id });
            
            setIsSubjectModalOpen(false);
        } catch (error) {
            console.error("Subject save failed:", error);
        }
        setLoading(false);
    };

    const getOrdinal = (n) => {
        const s = ["th", "st", "nd", "rd"];
        const v = n % 100;
        return n + (s[(v - 20) % 10] || s[v] || s[0]);
    };

    return (
        <div className="manage-materials-page">
            <div className="mm-container">
                <div className="mm-header">
                    <div className="mm-header-left">
                        <div className="mm-header-icon" style={{background: 'rgba(139, 92, 246, 0.1)', color: '#8B5CF6', borderColor: 'rgba(139, 92, 246, 0.2)'}}>
                            <Settings size={28} />
                        </div>
                        <div className="mm-title">
                            <h1>System Configuration</h1>
                            <p>Configure academic degrees, curriculum structure, and global metadata.</p>
                        </div>
                    </div>
                    <div className="header-actions-mi">
                         <button className="btn-add-material" style={{background: '#8B5CF6'}} onClick={activeTab === 'degrees' ? handleAddDegree : handleAddSubject}>
                            <Plus size={18} /> {activeTab === 'degrees' ? 'Add New Degree' : 'Add Subject'}
                        </button>
                    </div>
                </div>

                {successMessage && (
                    <div className="mm-toast">
                        <CheckCircle size={18} /> {successMessage}
                    </div>
                )}

                <div className="mod-tabs-mi">
                    <button 
                        className={`mod-tab-btn-mi ${activeTab === 'degrees' ? 'active' : ''}`}
                        onClick={() => setActiveTab('degrees')}
                        style={activeTab === 'degrees' ? {background: '#8B5CF6'} : {}}
                    >
                        <GraduationCap size={18} /> Manage Degrees
                    </button>
                    <button 
                        className={`mod-tab-btn-mi ${activeTab === 'subjects' ? 'active' : ''}`}
                        onClick={() => {
                            if (!selectedDegree && degrees.length > 0) {
                                setSelectedDegree(degrees[0]);
                            }
                            setActiveTab('subjects');
                        }}
                        style={activeTab === 'subjects' ? {background: '#8B5CF6'} : {}}
                    >
                        <BookOpen size={18} /> Academic Structure {selectedDegree?.code && `(${selectedDegree.code})`}
                    </button>
                </div>

                <div className="mm-toolbar">
                    <div className="mm-search">
                        <Search size={18} className="search-icon" />
                        <input 
                            type="text" 
                            placeholder={activeTab === 'degrees' ? "Search degrees..." : "Search subjects..."}
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>
                    <div className="mm-filters">
                        {activeTab === 'subjects' && (
                            <>
                                <select value={selectedDegree?.id} onChange={(e) => {
                                    const d = degrees.find(d => d.id === e.target.value);
                                    setSelectedDegree(d);
                                }}>
                                    {degrees.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                                </select>
                                <select value={filterYear} onChange={(e) => setFilterYear(e.target.value)}>
                                    <option value="all">All Years</option>
                                    <option value="1">1st Year</option>
                                    <option value="2">2nd Year</option>
                                    <option value="3">3rd Year</option>
                                    <option value="4">4th Year</option>
                                </select>
                            </>
                        )}
                    </div>
                </div>

                <div className="mm-table-card">
                    <div className="mm-table-wrapper">
                        <table className="mm-table">
                            <thead>
                                {activeTab === 'degrees' ? (
                                    <tr>
                                        <th>Degree & Code</th>
                                        <th>Duration</th>
                                        <th>Stats</th>
                                        <th>Actions</th>
                                    </tr>
                                ) : (
                                    <tr>
                                        <th>Subject</th>
                                        <th>Code</th>
                                        <th>Year</th>
                                        <th>Actions</th>
                                    </tr>
                                )}
                            </thead>
                            <tbody>
                                {activeTab === 'degrees' ? (
                                    filteredDegrees.map(degree => (
                                        <tr key={degree.id} className={selectedDegree?.id === degree.id ? 'row-selected-mi' : ''}>
                                            <td>
                                                <div className="material-cell">
                                                    <div className="file-icon-box" style={{background: 'rgba(139, 92, 246, 0.1)', color: '#A78BFA'}}>
                                                        <GraduationCap size={20} />
                                                    </div>
                                                    <div className="material-info">
                                                        <span className="m-title">{degree.name}</span>
                                                        <span className="tag-degree-mod" style={{background: 'rgba(139, 92, 246, 0.1)', color: '#A78BFA'}}>{degree.code}</span>
                                                    </div>
                                                </div>
                                            </td>
                                            <td>{degree.years} Years</td>
                                            <td>{degree.subjectCount} Subjects</td>
                                            <td>
                                                <div className="mm-actions">
                                                    <button className="btn-action-mm" onClick={() => { setSelectedDegree(degree); setActiveTab('subjects'); }}><ChevronRight size={16} /></button>
                                                    <button className="btn-action-mm" onClick={() => handleEditDegree(degree)}><Edit3 size={16} /></button>
                                                    <button className="btn-action-mm danger" onClick={() => { setItemToDelete({type: 'degree', id: degree.id, name: degree.name}); setIsDeleteModalOpen(true); }}><Trash2 size={16} /></button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    filteredSubjects.map(subject => (
                                        <tr key={subject._id || subject.id}>
                                            <td>{subject.name}</td>
                                            <td>{subject.code}</td>
                                            <td>{getOrdinal(subject.year)} Year</td>
                                            <td>
                                                <div className="mm-actions">
                                                    <button className="btn-action-mm" onClick={() => handleEditSubject(subject)}><Edit3 size={16} /></button>
                                                    <button className="btn-action-mm danger" onClick={() => { setItemToDelete({type: 'subject', id: subject._id || subject.id, name: subject.name}); setIsDeleteModalOpen(true); }}><Trash2 size={16} /></button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Degree Modal */}
                {isDegreeModalOpen && (
                    <div className="modal-overlay">
                        <div className="modal-content mm-modal">
                            <div className="modal-header">
                                <h3>{degreeForm.id ? 'Edit Degree' : 'New Degree'}</h3>
                                <button className="btn-close-modal" onClick={() => setIsDegreeModalOpen(false)}><X size={20} /></button>
                            </div>
                            <form className="mm-form-enhanced" onSubmit={handleDegreeSubmit}>
                                <div className="form-group-full">
                                    <label>Degree Title</label>
                                    <input type="text" required value={degreeForm.name} onChange={(e) => setDegreeForm({...degreeForm, name: e.target.value})} />
                                </div>
                                <div className="form-group">
                                    <label>Code</label>
                                    <input type="text" required value={degreeForm.code} onChange={(e) => setDegreeForm({...degreeForm, code: e.target.value})} />
                                </div>
                                <div className="form-group">
                                    <label>Years</label>
                                    <input type="number" required value={degreeForm.years} onChange={(e) => setDegreeForm({...degreeForm, years: parseInt(e.target.value)})} />
                                </div>
                                <div className="modal-footer-enhanced">
                                    <button type="button" className="btn-cancel-flat" onClick={() => setIsDegreeModalOpen(false)}>Cancel</button>
                                    <button type="submit" className="btn-save-glow">Save</button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}

                {/* Subject Modal */}
                {isSubjectModalOpen && (
                    <div className="modal-overlay">
                        <div className="modal-content mm-modal">
                            <div className="modal-header">
                                <h3>Manage Subject</h3>
                                <button className="btn-close-modal" onClick={() => setIsSubjectModalOpen(false)}><X size={20} /></button>
                            </div>
                            <form className="mm-form-enhanced" onSubmit={handleSubjectSubmit}>
                                <div className="form-group-full">
                                    <label>Associated Degree</label>
                                    <select 
                                        value={selectedDegree?.id || ''} 
                                        onChange={(e) => {
                                            const d = degrees.find(deg => deg.id === e.target.value);
                                            if(d) setSelectedDegree(d);
                                        }}
                                        required
                                        disabled={!!subjectForm.id} // Cannot change degree when editing
                                        style={{ width: '100%', padding: '10px', borderRadius: '5px', border: '1px solid var(--border-color)', background: 'var(--bg-glass)', color: 'var(--text-primary, #fff)' }}
                                    >
                                        <option value="" disabled style={{color: '#1e293b'}}>Select a Degree</option>
                                        {degrees.map(d => <option key={d.id} value={d.id} style={{color: '#1e293b'}}>{d.name} {d.code ? `(${d.code})` : ''}</option>)}
                                    </select>
                                </div>
                                <div className="form-group-full">
                                    <label>Title</label>
                                    <input type="text" required value={subjectForm.name} onChange={(e) => setSubjectForm({...subjectForm, name: e.target.value})} />
                                </div>
                                <div className="form-group">
                                    <label>Code</label>
                                    <input type="text" required value={subjectForm.code} onChange={(e) => setSubjectForm({...subjectForm, code: e.target.value})} />
                                </div>
                                <div className="form-group">
                                    <label>Year</label>
                                    <select value={subjectForm.year} onChange={(e) => setSubjectForm({...subjectForm, year: e.target.value})}>
                                        <option>1st Year</option>
                                        <option>2nd Year</option>
                                        <option>3rd Year</option>
                                        <option>4th Year</option>
                                    </select>
                                </div>
                                <div className="modal-footer-enhanced">
                                    <button type="button" className="btn-cancel-flat" onClick={() => setIsSubjectModalOpen(false)}>Cancel</button>
                                    <button type="submit" className="btn-save-glow">Save</button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}

                {/* Delete Modal */}
                {isDeleteModalOpen && (
                    <div className="modal-overlay">
                        <div className="modal-content mm-modal-small">
                            <h3>Remove {itemToDelete?.type}?</h3>
                            <p>Are you sure you want to delete <strong>{itemToDelete?.name}</strong>?</p>
                            <div className="modal-footer">
                                <button className="btn-cancel-flat" onClick={() => setIsDeleteModalOpen(false)}>Cancel</button>
                                <button className="btn-danger-confirm" onClick={confirmDelete}>Delete</button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ManageDegrees;
