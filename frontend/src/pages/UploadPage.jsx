import { useState, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@clerk/clerk-react';
import axios from 'axios';
import { setGetTokenFn } from '../utils/api';

export default function UploadPage() {
    const { getToken } = useAuth();
    const navigate = useNavigate();
    const fileInputRef = useRef(null);

    const [file, setFile] = useState(null);
    const [dragging, setDragging] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [error, setError] = useState('');
    const [progress, setProgress] = useState(0);
    const [experienceLevel, setExperienceLevel] = useState('Fresher');

    setGetTokenFn(getToken);

    const handleFile = (f) => {
        if (!f) return;
        const allowed = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
        if (!allowed.includes(f.type) && !f.name.match(/\.(pdf|doc|docx)$/i)) {
            setError('Only PDF and DOCX files are allowed.');
            return;
        }
        if (f.size > 5 * 1024 * 1024) {
            setError('File size must be under 5MB.');
            return;
        }
        setError('');
        setFile(f);
    };

    const onDrop = useCallback((e) => {
        e.preventDefault();
        setDragging(false);
        const f = e.dataTransfer.files[0];
        handleFile(f);
    }, []);

    const onDragOver = (e) => { e.preventDefault(); setDragging(true); };
    const onDragLeave = () => setDragging(false);

    const handleSubmit = async () => {
        if (!file) { setError('Please select a file.'); return; }
        setUploading(true);
        setError('');
        try {
            const token = await getToken();
            const formData = new FormData();
            formData.append('resume', file);
            formData.append('experienceLevel', experienceLevel);

            await axios.post(
                `${import.meta.env.VITE_API_URL}/resume/analyze`,
                formData,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        'Content-Type': 'multipart/form-data'
                    },
                    onUploadProgress: (e) => {
                        setProgress(Math.round((e.loaded / e.total) * 100));
                    }
                }
            );
            navigate('/analysis');
        } catch (err) {
            setError(err.response?.data?.error || err.message || 'Upload failed. Please try again.');
        } finally {
            setUploading(false);
            setProgress(0);
        }
    };

    return (
        <div style={{ maxWidth: '700px', margin: '0 auto', position: 'relative', zIndex: 1 }}>
            <div className="page-header animate-fadeUp">
                <h1>Upload Your <span className="text-gradient">Resume</span></h1>
                <p>Our AI will analyze your resume and provide actionable insights in seconds.</p>
            </div>

            {/* What we analyze */}
            <div className="grid-3 animate-fadeUp-1" style={{ marginBottom: '28px' }}>
                {[
                    { icon: '🎯', title: 'Skill Matching', desc: 'Match your skills to 100+ industry roles' },
                    { icon: '📊', title: 'ATS Score', desc: 'Get your resume scored 0–100 by our ATS engine' },
                    { icon: '🤖', title: 'AI Feedback', desc: 'Receive instant AI-driven improvement tips' },
                ].map((item, i) => (
                    <div key={i} className="card" style={{ textAlign: 'center' }}>
                        <div style={{ fontSize: '2rem', marginBottom: '8px' }}>{item.icon}</div>
                        <h4 style={{ marginBottom: '4px', fontSize: '0.9rem' }}>{item.title}</h4>
                        <p style={{ color: 'var(--text-secondary)', fontSize: '0.8rem' }}>{item.desc}</p>
                    </div>
                ))}
            </div>

            {/* Experience Level Toggle */}
            <div className="card animate-fadeUp-2" style={{ marginBottom: '24px', padding: '24px', textAlign: 'center' }}>
                <h3 style={{ marginBottom: '16px', fontSize: '1.1rem' }}>Select Your Experience Level</h3>
                <div style={{ display: 'flex', justifyContent: 'center', gap: '16px' }}>
                    <button
                        className={`btn ${experienceLevel === 'Fresher' ? 'btn-primary' : 'btn-secondary'}`}
                        onClick={() => setExperienceLevel('Fresher')}
                        style={{ flex: 1, maxWidth: '200px', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px' }}
                    >
                        🌱 Fresher
                    </button>
                    <button
                        className={`btn ${experienceLevel === 'Experienced' ? 'btn-primary' : 'btn-secondary'}`}
                        onClick={() => setExperienceLevel('Experienced')}
                        style={{ flex: 1, maxWidth: '200px', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px' }}
                    >
                        🚀 Experienced
                    </button>
                </div>
            </div>

            {/* Drop Zone */}
            <div
                className={`upload-zone animate-fadeUp-2 ${dragging ? 'dragging' : ''} ${file ? 'has-file' : ''}`}
                onDrop={onDrop}
                onDragOver={onDragOver}
                onDragLeave={onDragLeave}
                onClick={() => !file && fileInputRef.current?.click()}
                style={{
                    background: dragging ? 'rgba(108, 99, 255, 0.12)' : file ? 'rgba(0, 229, 160, 0.08)' : 'var(--bg-card)',
                    border: `2px dashed ${dragging ? 'var(--accent-primary)' : file ? 'var(--accent-success)' : 'var(--bg-glass-border)'}`,
                    borderRadius: 'var(--radius-xl)',
                    padding: '60px 40px',
                    textAlign: 'center',
                    cursor: file ? 'default' : 'pointer',
                    transition: 'var(--transition)',
                    marginBottom: '20px'
                }}
            >
                <input
                    ref={fileInputRef}
                    type="file"
                    accept=".pdf,.doc,.docx"
                    style={{ display: 'none' }}
                    onChange={(e) => handleFile(e.target.files[0])}
                />

                {!file ? (
                    <>
                        <div style={{ fontSize: '4rem', marginBottom: '16px' }}>📂</div>
                        <h3 style={{ marginBottom: '8px' }}>Drag & Drop Your Resume</h3>
                        <p style={{ color: 'var(--text-secondary)', marginBottom: '20px', fontSize: '0.9rem' }}>
                            or click to browse your files
                        </p>
                        <span className="badge badge-primary">PDF / DOCX · Max 5MB</span>
                    </>
                ) : (
                    <>
                        <div style={{ fontSize: '4rem', marginBottom: '16px' }}>✅</div>
                        <h3 style={{ marginBottom: '8px', color: 'var(--accent-success)' }}>{file.name}</h3>
                        <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem' }}>
                            {(file.size / 1024).toFixed(1)} KB · Ready to analyze
                        </p>
                        <button
                            className="btn btn-secondary btn-sm"
                            style={{ marginTop: '16px' }}
                            onClick={(e) => { e.stopPropagation(); setFile(null); fileInputRef.current.value = ''; }}
                        >
                            Change File
                        </button>
                    </>
                )}
            </div>

            {error && (
                <div className="alert alert-error animate-fadeUp">
                    <span>❌</span> {error}
                </div>
            )}

            {uploading && (
                <div style={{ marginBottom: '16px' }}>
                    <div className="progress-label">
                        <span>Analyzing resume...</span>
                        <span>{progress}%</span>
                    </div>
                    <div className="progress-bar" style={{ height: '10px' }}>
                        <div className="progress-fill" style={{ width: `${progress}%` }} />
                    </div>
                </div>
            )}

            <button
                className="btn btn-primary btn-lg"
                style={{ width: '100%' }}
                onClick={handleSubmit}
                disabled={!file || uploading}
            >
                {uploading ? (
                    <><div className="spinner" style={{ width: '18px', height: '18px' }} /> Analyzing...</>
                ) : (
                    '🚀 Analyze Resume'
                )}
            </button>

            <div className="card animate-fadeUp-3" style={{ marginTop: '24px' }}>
                <h4 style={{ marginBottom: '12px', fontSize: '0.85rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                    🔒 Privacy Note
                </h4>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', lineHeight: '1.7' }}>
                    Your resume is processed securely and only used for analysis. We do not share your data with third parties.
                    The file is automatically deleted from our servers after analysis.
                </p>
            </div>
        </div>
    );
}
