import { useState, useEffect } from 'react';
import { useUser } from '@clerk/clerk-react';
import { useMongoUser } from '../context/UserContext';
import api from '../utils/api';

export default function Profile() {
    const { user: clerkUser } = useUser();
    const { mongoUser, refreshUser } = useMongoUser();
    const [editing, setEditing] = useState(false);
    const [form, setForm] = useState({ fullName: '', bio: '', github: '', linkedin: '', profilePicture: '' });
    const [saving, setSaving] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [msg, setMsg] = useState({ text: '', type: '' });

    useEffect(() => {
        if (mongoUser) {
            setForm({
                fullName: mongoUser.fullName || '',
                bio: mongoUser.bio || '',
                github: mongoUser.github || '',
                linkedin: mongoUser.linkedin || '',
                profilePicture: mongoUser.profilePicture || ''
            });
        }
    }, [mongoUser]);

    const showMsg = (text, type = 'success') => {
        setMsg({ text, type });
        setTimeout(() => setMsg({ text: '', type: '' }), 3000);
    };

    const handleAvatarChange = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const formData = new FormData();
        formData.append('avatar', file);

        setUploading(true);
        try {
            const res = await api.post('/user/upload-avatar', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            setForm(p => ({ ...p, profilePicture: res.url })); // res is response.data
            showMsg('Avatar uploaded! Save profile to persist.', 'success');
        } catch (err) {
            showMsg(err.message, 'error');
        } finally {
            setUploading(false);
        }
    };

    const handleSave = async (e) => {
        e.preventDefault();
        setSaving(true);
        try {
            await api.post('/user/profile', form);
            await refreshUser();
            setEditing(false);
            showMsg('Profile updated successfully!');
        } catch (err) {
            showMsg(err.message, 'error');
        } finally {
            setSaving(false);
        }
    };

    if (!clerkUser || !mongoUser) return null;

    const displayAvatar = form.profilePicture || mongoUser.profilePicture || clerkUser.imageUrl;
    const displayName = mongoUser.fullName || clerkUser.fullName;

    return (
        <div className="profile-page animate-fadeUp">
            <div className="page-header">
                <h1>User <span className="text-gradient">Profile</span></h1>
                <p>Manage your professional identity and links.</p>
            </div>

            {msg.text && <div className={`alert alert-${msg.type === 'error' ? 'error' : 'success'}`} style={{ marginBottom: '20px' }}>{msg.text}</div>}

            <div className="grid-2">
                {/* Profile Card */}
                <div className="card" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', padding: '40px 20px' }}>
                    <div style={{ position: 'relative', marginBottom: '20px' }}>
                        <img
                            src={displayAvatar}
                            alt="Avatar"
                            style={{ width: '120px', height: '120px', borderRadius: '50%', border: '4px solid var(--accent-primary)', objectFit: 'cover' }}
                        />
                        {editing && (
                            <label className="avatar-upload-btn" style={{
                                position: 'absolute',
                                bottom: '0',
                                right: '0',
                                background: 'var(--accent-primary)',
                                color: 'white',
                                width: '32px',
                                height: '32px',
                                borderRadius: '50%',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                cursor: 'pointer',
                                border: '3px solid var(--bg-card)',
                                fontSize: '1rem'
                            }}>
                                📷
                                <input type="file" hidden accept="image/*" onChange={handleAvatarChange} disabled={uploading} />
                            </label>
                        )}
                        {!editing && <div style={{ position: 'absolute', bottom: '5px', right: '5px', background: 'var(--accent-success)', width: '20px', height: '20px', borderRadius: '50%', border: '3px solid var(--bg-card)' }} title="Online" />}
                    </div>
                    {uploading && <p style={{ fontSize: '0.7rem', color: 'var(--accent-primary)', marginBottom: '10px' }}>Uploading Image...</p>}

                    <h2 style={{ marginBottom: '4px' }}>{displayName}</h2>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '20px' }}>{clerkUser.primaryEmailAddress.emailAddress}</p>

                    <div className="skill-tags" style={{ justifyContent: 'center', marginBottom: '24px' }}>
                        <span className="skill-tag" style={{ background: 'rgba(108,99,255,0.1)', color: 'var(--accent-primary)' }}>{mongoUser.role}</span>
                        <span className="skill-tag" style={{ background: 'rgba(0,212,255,0.1)', color: 'var(--accent-secondary)' }}>Verified</span>
                    </div>

                    <div style={{ display: 'flex', gap: '15px', width: '100%', maxWidth: '300px' }}>
                        <div className="stat-card" style={{ flex: 1, padding: '15px' }}>
                            <div style={{ fontSize: '1.2rem', fontWeight: 700 }}>{mongoUser.resumeScore || '--'}</div>
                            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Score</div>
                        </div>
                        <div className="stat-card" style={{ flex: 1, padding: '15px' }}>
                            <div style={{ fontSize: '1.2rem', fontWeight: 700 }}>#{mongoUser.rank || 'N/A'}</div>
                            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Rank</div>
                        </div>
                    </div>
                </div>

                {/* Edit Section */}
                <div className="card">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '25px' }}>
                        <h3 style={{ textTransform: 'uppercase', letterSpacing: '0.05em', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Professional Details</h3>
                        {!editing && <button className="btn btn-sm btn-secondary" onClick={() => setEditing(true)}>Edit Details</button>}
                    </div>

                    {editing ? (
                        <form onSubmit={handleSave}>
                            <div className="form-group">
                                <label className="form-label">Full Name</label>
                                <input
                                    className="form-input"
                                    type="text"
                                    value={form.fullName}
                                    onChange={e => setForm(p => ({ ...p, fullName: e.target.value }))}
                                    placeholder="Your Name"
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Professional Bio</label>
                                <textarea
                                    className="form-textarea"
                                    rows="3"
                                    value={form.bio}
                                    onChange={e => setForm(p => ({ ...p, bio: e.target.value }))}
                                    placeholder="Briefly describe your professional background..."
                                />
                            </div>
                            <div className="grid-2">
                                <div className="form-group">
                                    <label className="form-label">GitHub URL</label>
                                    <input
                                        className="form-input"
                                        type="url"
                                        value={form.github}
                                        onChange={e => setForm(p => ({ ...p, github: e.target.value }))}
                                        placeholder="https://github.com/username"
                                    />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">LinkedIn URL</label>
                                    <input
                                        className="form-input"
                                        type="url"
                                        value={form.linkedin}
                                        onChange={e => setForm(p => ({ ...p, linkedin: e.target.value }))}
                                        placeholder="https://linkedin.com/in/username"
                                    />
                                </div>
                            </div>
                            <div style={{ display: 'flex', gap: '10px', marginTop: '30px' }}>
                                <button type="submit" className="btn btn-primary" disabled={saving || uploading}>
                                    {saving ? 'Saving...' : 'Save Changes'}
                                </button>
                                <button type="button" className="btn btn-secondary" onClick={() => setEditing(false)}>Cancel</button>
                            </div>
                        </form>
                    ) : (
                        <div className="profile-details">
                            <div style={{ marginBottom: '25px' }}>
                                <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '8px', textTransform: 'uppercase' }}>Bio</label>
                                <p style={{ fontSize: '0.95rem', lineHeight: '1.6', color: 'var(--text-primary)' }}>
                                    {mongoUser.bio || "No bio added yet. Click 'Edit' to add one!"}
                                </p>
                            </div>
                            <div className="grid-2">
                                <div>
                                    <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '8px', textTransform: 'uppercase' }}>Social Presence</label>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                        {mongoUser.github && (
                                            <a href={mongoUser.github} target="_blank" rel="noopener noreferrer" className="nav-item" style={{ padding: '8px 12px', background: 'var(--bg-glass)', textDecoration: 'none' }}>
                                                <span className="nav-icon">🐙</span> GitHub Profile
                                            </a>
                                        )}
                                        {mongoUser.linkedin && (
                                            <a href={mongoUser.linkedin} target="_blank" rel="noopener noreferrer" className="nav-item" style={{ padding: '8px 12px', background: 'var(--bg-glass)', textDecoration: 'none' }}>
                                                <span className="nav-icon">🔗</span> LinkedIn Profile
                                            </a>
                                        )}
                                        {!mongoUser.github && !mongoUser.linkedin && <p style={{ fontSize: '0.8rem', fontStyle: 'italic', color: 'var(--text-muted)' }}>No links added.</p>}
                                    </div>
                                </div>
                                <div style={{ textAlign: 'right', alignSelf: 'flex-end' }}>
                                    <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Member since {new Date(mongoUser.createdAt).getFullYear()}</p>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
