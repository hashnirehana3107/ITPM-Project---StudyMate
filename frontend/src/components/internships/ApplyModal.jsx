import React, { useState } from 'react';
import { X, Upload, CheckCircle, FileText, ArrowRight, Phone, Mail, User } from 'lucide-react';
import axios from 'axios';

const ApplyModal = ({ internship, onClose }) => {
    const [formData, setFormData] = useState({
        email: '',
        phoneNumber: '',
        cv: null
    });
    const [loading, setLoading] = useState(false);
    const [applied, setApplied] = useState(false);
    const [error, setError] = useState('');

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file && file.type === 'application/pdf') {
            if (file.size <= 5 * 1024 * 1024) { // 5MB
                setFormData({ ...formData, cv: file });
                setError('');
            } else {
                setError('File size must be less than 5MB');
            }
        } else {
            setError('Please upload a PDF file only');
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        if (!formData.cv) {
            setError('Please upload your CV');
            setLoading(false);
            return;
        }

        try {
            const userInfo = JSON.parse(localStorage.getItem('userInfo'));
            const config = {
                headers: {
                    'Content-Type': 'multipart/form-data',
                    Authorization: `Bearer ${userInfo?.token}`
                }
            };

            const data = new FormData();
            data.append('internshipId', internship.id);
            data.append('email', formData.email);
            data.append('phoneNumber', formData.phoneNumber);
            data.append('cv', formData.cv);

            await axios.post('http://localhost:5000/api/applications/apply', data, config);
            
            setApplied(true);
            setLoading(false);
        } catch (err) {
            setError(err.response?.data?.message || 'Something went wrong. Please try again.');
            setLoading(false);
        }
    };

    const modalStyles = (
        <style>{`
            .modal-overlay-p {
                position: fixed !important;
                top: 0 !important;
                left: 0 !important;
                width: 100vw !important;
                height: 100vh !important;
                background: rgba(2, 6, 23, 0.95) !important;
                backdrop-filter: blur(15px) !important;
                display: flex !important;
                align-items: center !important;
                justify-content: center !important;
                z-index: 10001 !important;
                padding: 15px !important;
            }
            .apply-modal-p {
                background: linear-gradient(165deg, #0f172a 0%, #020617 100%) !important;
                border: 2px solid rgba(59, 130, 246, 0.4) !important;
                border-radius: 30px !important;
                width: 550px !important;
                max-width: 95% !important;
                max-height: 90vh !important;
                overflow-y: auto !important;
                padding: 2.5rem !important;
                position: relative !important;
                box-shadow: 0 40px 100px -20px rgba(0, 0, 0, 0.9), 0 0 50px rgba(59, 130, 246, 0.2) !important;
                animation: modalInP 0.6s cubic-bezier(0.34, 1.56, 0.64, 1) !important;
                color: white !important;
                font-family: 'Inter', sans-serif !important;
            }
            @keyframes modalInP {
                0% { transform: scale(0.8) translateY(100px); opacity: 0; }
                100% { transform: scale(1) translateY(0); opacity: 1; }
            }
            .header-info-p {
                text-align: center !important;
                margin-bottom: 2rem !important;
            }
            .apply-label-p {
                color: #3b82f6 !important;
                font-size: 0.8rem !important;
                text-transform: uppercase !important;
                font-weight: 900 !important;
                letter-spacing: 4px !important;
                display: block !important;
                margin-bottom: 0.5rem !important;
            }
            .header-info-p h3 {
                font-size: 1.8rem !important;
                font-weight: 800 !important;
                margin: 0.5rem 0 !important;
                background: linear-gradient(to right, #fff, #94a3b8) !important;
                -webkit-background-clip: text !important;
                -webkit-text-fill-color: transparent !important;
                line-height: 1.2 !important;
            }
            .apply-company-p {
                color: #64748b !important;
                font-size: 1rem !important;
                font-weight: 600 !important;
            }
            .apply-form-p {
                display: flex !important;
                flex-direction: column !important;
                gap: 2rem !important;
            }
            .form-group-p {
                display: flex !important;
                flex-direction: column !important;
                gap: 1rem !important;
            }
            .form-group-p label {
                font-weight: 800 !important;
                color: #f1f5f9 !important;
                display: flex !important;
                align-items: center !important;
                gap: 0.8rem !important;
                font-size: 1.1rem !important;
            }
            .form-group-p input {
                background: rgba(15, 23, 42, 0.6) !important;
                border: 2px solid rgba(255, 255, 255, 0.05) !important;
                border-radius: 16px !important;
                padding: 1rem !important;
                color: white !important;
                font-size: 1rem !important;
                transition: 0.3s !important;
            }
            .form-group-p input:focus {
                border-color: #3b82f6 !important;
                outline: none !important;
                box-shadow: 0 0 0 5px rgba(59, 130, 246, 0.2) !important;
            }
            .file-upload-box-p {
                border: 2px dashed rgba(59, 130, 246, 0.4) !important;
                border-radius: 20px !important;
                padding: 2rem !important;
                text-align: center !important;
                background: rgba(59, 130, 246, 0.02) !important;
                cursor: pointer !important;
                transition: 0.3s !important;
            }
            .file-upload-box-p:hover {
                border-color: #3b82f6 !important;
                background: rgba(59, 130, 246, 0.05) !important;
            }
            .btn-close-p {
                position: absolute !important;
                top: 2rem !important;
                right: 2rem !important;
                background: rgba(255, 255, 255, 0.05) !important;
                border: none !important;
                color: #64748b !important;
                border-radius: 50% !important;
                cursor: pointer !important;
                padding: 8px !important;
            }
            .modal-footer-p {
                display: flex !important;
                gap: 2rem !important;
                margin-top: 1rem !important;
            }
            .btn-cancel-p {
                flex: 1 !important;
                background: rgba(255, 255, 255, 0.03) !important;
                border: 1px solid rgba(255, 255, 255, 0.1) !important;
                color: #cbd5e1 !important;
                padding: 1.3rem !important;
                border-radius: 20px !important;
                font-weight: 800 !important;
                cursor: pointer !important;
            }
            .btn-submit-p {
                flex: 2 !important;
                background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%) !important;
                color: white !important;
                padding: 1.3rem !important;
                border-radius: 20px !important;
                font-weight: 950 !important;
                font-size: 1.25rem !important;
                border: none !important;
                box-shadow: 0 10px 30px rgba(37, 99, 235, 0.4) !important;
                cursor: pointer !important;
            }
        `}</style>
    );

    if (applied) {
        return (
            <div className="modal-overlay-p">
                {modalStyles}
                <div className="apply-modal-p" style={{ textAlign: 'center' }}>
                    <div className="success-icon-box" style={{ color: '#10B981', marginBottom: '2rem' }}>
                        <CheckCircle size={80} />
                    </div>
                    <h2>Application Submitted!</h2>
                    <p style={{ color: '#94A3B8', fontSize: '1.2rem', marginBottom: '2.5rem' }}>
                        Your details and CV have been recorded for <strong>{internship.company}</strong>.
                    </p>
                    
                    {internship.applicationLink && internship.applicationLink !== '#' && (
                        <div className="next-step-box" style={{ background: 'rgba(59, 130, 246, 0.05)', padding: '2.5rem', borderRadius: '30px', border: '2px solid #3B82F6', marginBottom: '2.5rem' }}>
                            <p style={{ color: '#3B82F6', fontWeight: 900, textTransform: 'uppercase', marginBottom: '0.5rem' }}>Next Step (Required)</p>
                            <p style={{ marginBottom: '1.5rem' }}>Please complete the application on the company's portal.</p>
                            <button 
                                className="btn-submit-p"
                                onClick={() => window.open(internship.applicationLink, '_blank')}
                                style={{ width: '100%' }}
                            >
                                Continue to Company Portal <ArrowRight size={20} />
                            </button>
                        </div>
                    )}
                    <button className="btn-cancel-p" style={{ width: '100%' }} onClick={onClose}>Close</button>
                </div>
            </div>
        );
    }

    return (
        <div className="modal-overlay-p">
            {modalStyles}
            <div className="apply-modal-p">
                <button className="btn-close-p" onClick={onClose}><X size={24} /></button>
                <div className="header-info-p">
                    <span className="apply-label-p">Applying for Placement</span>
                    <h3>{internship.title}</h3>
                    <span className="apply-company-p">Official Partner: {internship.company}</span>
                </div>

                <form onSubmit={handleSubmit} className="apply-form-p">
                    {error && <div style={{ background: 'rgba(239,68,68,0.1)', color: '#ef4444', padding: '1rem', borderRadius: '12px', borderLeft: '4px solid #ef4444' }}>{error}</div>}

                    <div className="form-group-p">
                        <label><Mail size={20} /> Preferred Email</label>
                        <input 
                            type="email" 
                            required 
                            placeholder="Enter your email address"
                            value={formData.email}
                            onChange={(e) => setFormData({...formData, email: e.target.value})}
                        />
                    </div>

                    <div className="form-group-p">
                        <label><Phone size={20} /> Contact Number</label>
                        <input 
                            type="tel" 
                            required 
                            placeholder="+94 XX XXX XXXX"
                            value={formData.phoneNumber}
                            onChange={(e) => setFormData({...formData, phoneNumber: e.target.value})}
                        />
                    </div>

                    <div className="form-group-p">
                        <label><FileText size={20} /> Professional Resume (PDF)</label>
                        <div className={`file-upload-box-p ${formData.cv ? 'has-file' : ''}`} onClick={() => document.getElementById('cv-upload-p').click()}>
                            <input 
                                type="file" 
                                id="cv-upload-p" 
                                accept=".pdf"
                                onChange={handleFileChange}
                                hidden
                            />
                            <div className="upload-label">
                                {formData.cv ? (
                                    <>
                                        <CheckCircle size={40} style={{ color: '#10B981' }} />
                                        <span>{formData.cv.name} Selected</span>
                                    </>
                                ) : (
                                    <>
                                        <Upload size={40} />
                                        <span>Click or Drag to Upload CV</span>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="modal-footer-p">
                        <button type="button" className="btn-cancel-p" onClick={onClose}>Discard</button>
                        <button type="submit" className="btn-submit-p" disabled={loading}>
                            {loading ? <div className="mini-spinner" style={{ width: '25px', height: '25px', border: '4px solid rgba(255,255,255,0.3)', borderTopColor: 'white', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }}></div> : 'Submit My Application'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ApplyModal;
