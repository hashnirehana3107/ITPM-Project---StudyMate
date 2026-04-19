import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { 
    GraduationCap, Mail, Building, IdCard, Send, 
    CheckCircle, AlertCircle, ArrowLeft, Loader2 
} from 'lucide-react';
import AuthContext from '../../context/AuthContext';
import './LecturerRequest.css';

const LecturerRequest = () => {
    const { user } = useContext(AuthContext);
    const navigate = useNavigate();
    
    const [formData, setFormData] = useState({
        name: user?.name || '',
        universityEmail: user?.email || '',
        department: '',
        staffId: ''
    });
    
    const [status, setStatus] = useState('idle'); // idle, loading, success, error
    const [message, setMessage] = useState('');

    const { name, universityEmail, department, staffId } = formData;

    const onChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

    const onSubmit = async (e) => {
        e.preventDefault();
        setStatus('loading');
        
        try {
            const config = {
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${localStorage.getItem('token')}`
                }
            };

            await axios.post('http://localhost:5000/api/lecturers/request', formData, config);
            setStatus('success');
            setMessage('Your request has been submitted successfully. Admin will review it soon.');
            
            setTimeout(() => {
                navigate('/dashboard');
            }, 3000);
        } catch (err) {
            setStatus('error');
            setMessage(err.response?.data?.message || 'Something went wrong. Please try again.');
        }
    };

    if (status === 'success') {
        return (
            <div className="request-container flex justify-center items-center h-screen bg-slate-950">
                <div className="success-card animate-scale-in text-center p-8 glass-panel border-emerald-500/30">
                    <div className="flex justify-center mb-6">
                        <div className="success-icon-wrap bg-emerald-500/20 p-4 rounded-full">
                            <CheckCircle size={48} className="text-emerald-400" />
                        </div>
                    </div>
                    <h2 className="text-2xl font-bold text-white mb-2">Request Submitted!</h2>
                    <p className="text-slate-400 mb-6">{message}</p>
                    <button 
                        onClick={() => navigate('/dashboard')}
                        className="btn-primary w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 transition-all font-semibold"
                    >
                        Back to Dashboard
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="request-page min-h-screen bg-slate-950 text-slate-200 py-12 px-4">
            <div className="max-w-2xl mx-auto">
                <button 
                    onClick={() => navigate(-1)}
                    className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors mb-8 group"
                >
                    <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
                    Back
                </button>

                <div className="glass-panel p-8 rounded-3xl border border-blue-500/20 relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
                        <GraduationCap size={120} />
                    </div>

                    <div className="relative z-10">
                        <h1 className="text-3xl font-bold text-white mb-2">Request Lecturer Access</h1>
                        <p className="text-slate-400 mb-8">Join the academic board to help students and maintain educational quality.</p>

                        <form onSubmit={onSubmit} className="space-y-6">
                            <div className="form-group">
                                <label className="flex items-center gap-2 text-sm font-medium text-slate-300 mb-2">
                                    <IdCard size={16} /> Full Name
                                </label>
                                <input 
                                    type="text" 
                                    name="name" 
                                    value={name} 
                                    onChange={onChange}
                                    required
                                    className="w-full bg-slate-900/50 border border-slate-700 rounded-xl px-4 py-3 focus:border-blue-500 outline-none transition-all"
                                    placeholder="Enter your full name"
                                />
                            </div>

                            <div className="form-group">
                                <label className="flex items-center gap-2 text-sm font-medium text-slate-300 mb-2">
                                    <Mail size={16} /> University Email
                                </label>
                                <input 
                                    type="email" 
                                    name="universityEmail" 
                                    value={universityEmail} 
                                    onChange={onChange}
                                    required
                                    className="w-full bg-slate-900/50 border border-slate-700 rounded-xl px-4 py-3 focus:border-blue-500 outline-none transition-all"
                                    placeholder="name@university.ac.lk"
                                />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="form-group">
                                    <label className="flex items-center gap-2 text-sm font-medium text-slate-300 mb-2">
                                        <Building size={16} /> Department
                                    </label>
                                    <input 
                                        type="text" 
                                        name="department" 
                                        value={department} 
                                        onChange={onChange}
                                        required
                                        className="w-full bg-slate-900/50 border border-slate-700 rounded-xl px-4 py-3 focus:border-blue-500 outline-none transition-all"
                                        placeholder="e.g. Computing"
                                    />
                                </div>

                                <div className="form-group">
                                    <label className="flex items-center gap-2 text-sm font-medium text-slate-300 mb-2">
                                        <IdCard size={16} /> Staff ID (Optional)
                                    </label>
                                    <input 
                                        type="text" 
                                        name="staffId" 
                                        value={staffId} 
                                        onChange={onChange}
                                        className="w-full bg-slate-900/50 border border-slate-700 rounded-xl px-4 py-3 focus:border-blue-500 outline-none transition-all"
                                        placeholder="L-XXXXX"
                                    />
                                </div>
                            </div>

                            {status === 'error' && (
                                <div className="flex items-center gap-3 bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-xl">
                                    <AlertCircle size={20} />
                                    <p className="text-sm">{message}</p>
                                </div>
                            )}

                            <button 
                                type="submit" 
                                disabled={status === 'loading'}
                                className="w-full bg-blue-600 hover:bg-blue-500 disabled:bg-blue-800 py-4 rounded-xl font-bold flex items-center justify-center gap-2 transition-all shadow-lg shadow-blue-500/20"
                            >
                                {status === 'loading' ? (
                                    <>
                                        <Loader2 className="animate-spin" size={20} />
                                        Submitting...
                                    </>
                                ) : (
                                    <>
                                        <Send size={20} />
                                        Submit Request
                                    </>
                                )}
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LecturerRequest;
