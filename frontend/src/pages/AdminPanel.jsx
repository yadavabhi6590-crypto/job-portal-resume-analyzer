import { useEffect, useState } from 'react';
import { useAuth } from '@clerk/clerk-react';
import api from '../utils/api';
import { setGetTokenFn } from '../utils/api';
import {
    Chart as ChartJS, CategoryScale, LinearScale, BarElement, Tooltip, Legend, ArcElement
} from 'chart.js';
import { Bar, Doughnut } from 'react-chartjs-2';

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend, ArcElement);

const EMPTY_ROLE = { title: '', description: '', category: 'Software Engineering', requiredSkills: '' };
const EMPTY_TREND = { category: 'Tech Industry 2025', trendingSkills: '', highDemandRoles: '' };

export default function AdminPanel() {
    const { getToken } = useAuth();
    const [activeTab, setActiveTab] = useState('analytics');
    const [analytics, setAnalytics] = useState(null);
    const [roles, setRoles] = useState([]);
    const [trends, setTrends] = useState([]);

    const handleViewResume = async (analysisId) => {
        try {
            const token = await getToken();
            window.open(`${import.meta.env.VITE_API_URL}/admin/resume/${analysisId}?token=${token}`, '_blank');
        } catch (err) {
            console.error('Error getting token:', err);
        }
    };
    const [loading, setLoading] = useState(true);
    const [msg, setMsg] = useState({ text: '', type: '' });
    const [roleForm, setRoleForm] = useState(EMPTY_ROLE);
    const [editRoleId, setEditRoleId] = useState(null);
    const [trendForm, setTrendForm] = useState(EMPTY_TREND);

    useEffect(() => {
        setGetTokenFn(getToken);
        fetchAll();
    }, [getToken]);

    const fetchAll = async () => {
        setLoading(true);
        try {
            const [analyticsRes, rolesRes, trendsRes] = await Promise.all([
                api.get('/admin/analytics'),
                api.get('/admin/roles'),
                api.get('/admin/trends')
            ]);
            setAnalytics(analyticsRes);
            setRoles(rolesRes.roles || []);
            setTrends(trendsRes.trends || []);
        } catch (err) {
            showMsg(err.message, 'error');
        } finally {
            setLoading(false);
        }
    };

    const showMsg = (text, type = 'success') => {
        setMsg({ text, type });
        setTimeout(() => setMsg({ text: '', type: '' }), 3500);
    };

    // Roles CRUD
    const handleRoleSubmit = async (e) => {
        e.preventDefault();
        const payload = {
            ...roleForm,
            requiredSkills: roleForm.requiredSkills.split(',').map(s => s.trim()).filter(Boolean)
        };
        try {
            if (editRoleId) {
                await api.put(`/admin/roles/${editRoleId}`, payload);
                showMsg('Role updated successfully!');
            } else {
                await api.post('/admin/roles', payload);
                showMsg('Role created successfully!');
            }
            setRoleForm(EMPTY_ROLE);
            setEditRoleId(null);
            fetchAll();
        } catch (err) {
            showMsg(err.message, 'error');
        }
    };

    const handleDeleteRole = async (id) => {
        if (!window.confirm('Delete this role?')) return;
        try {
            await api.delete(`/admin/roles/${id}`);
            showMsg('Role deleted.');
            fetchAll();
        } catch (err) {
            showMsg(err.message, 'error');
        }
    };

    const handleEditRole = (role) => {
        setEditRoleId(role._id);
        setRoleForm({ ...role, requiredSkills: role.requiredSkills.join(', ') });
        setActiveTab('roles');
    };

    // Trends CRUD
    const handleTrendSubmit = async (e) => {
        e.preventDefault();
        const payload = {
            ...trendForm,
            trendingSkills: trendForm.trendingSkills.split(',').map(s => s.trim()).filter(Boolean),
            highDemandRoles: trendForm.highDemandRoles.split(',').map(s => s.trim()).filter(Boolean)
        };
        try {
            await api.post('/admin/trends', payload);
            showMsg('Trend data updated!');
            setTrendForm(EMPTY_TREND);
            fetchAll();
        } catch (err) {
            showMsg(err.message, 'error');
        }
    };

    const tabs = [
        { id: 'analytics', label: '📈 Analytics' },
        { id: 'roles', label: '💼 Job Roles' },
        { id: 'trends', label: '🔥 Trends' },
        { id: 'rankings', label: '🏆 Rankings' }
    ];

    if (loading) return <div className="loading-overlay"><div className="spinner" /></div>;

    const chartColors = { bg: '#0a0a1a', text: '#a0a0c0', grid: 'rgba(255,255,255,0.04)' };
    const barOpts = {
        responsive: true,
        plugins: { legend: { labels: { color: chartColors.text } } },
        scales: {
            x: { ticks: { color: chartColors.text }, grid: { color: chartColors.grid } },
            y: { ticks: { color: chartColors.text }, grid: { color: chartColors.grid } }
        }
    };

    const topRankings = analytics?.rankingList?.slice(0, 8) || [];
    const rankChartData = {
        labels: topRankings.map((_, i) => `#${i + 1}`),
        datasets: [{ label: 'Resume Score', data: topRankings.map(r => r.resumeScore), backgroundColor: 'rgba(108,99,255,0.6)', borderColor: '#6c63ff', borderRadius: 6, borderWidth: 1 }]
    };

    const donutData = {
        labels: ['Total Users', 'Analyses Done', 'Tests Taken'],
        datasets: [{ data: [analytics?.totalUsers || 0, analytics?.totalAnalyses || 0, analytics?.totalTests || 0], backgroundColor: ['rgba(108,99,255,0.7)', 'rgba(0,212,255,0.7)', 'rgba(0,229,160,0.7)'], borderColor: ['#6c63ff', '#00d4ff', '#00e5a0'], borderWidth: 1 }]
    };

    return (
        <div style={{ position: 'relative', zIndex: 1 }}>
            <div className="page-header animate-fadeUp">
                <h1>Admin <span className="text-gradient">Panel</span></h1>
                <p>Manage job roles, industry trends, and view platform analytics.</p>
            </div>

            {msg.text && <div className={`alert alert-${msg.type === 'error' ? 'error' : 'success'}`}>{msg.text}</div>}

            {/* Tabs */}
            <div style={{ display: 'flex', gap: '4px', marginBottom: '28px', background: 'var(--bg-card)', padding: '6px', borderRadius: 'var(--radius-md)', width: 'fit-content', flexWrap: 'wrap' }}>
                {tabs.map(tab => (
                    <button key={tab.id} onClick={() => setActiveTab(tab.id)} className="btn btn-sm" style={{
                        background: activeTab === tab.id ? 'var(--gradient-primary)' : 'transparent',
                        color: activeTab === tab.id ? 'white' : 'var(--text-secondary)'
                    }}>
                        {tab.label}
                    </button>
                ))}
            </div>

            {/* Analytics */}
            {activeTab === 'analytics' && (
                <div className="animate-fadeUp">
                    <div className="grid-4" style={{ marginBottom: '24px' }}>
                        {[
                            { icon: '👥', label: 'Total Users', value: analytics?.totalUsers },
                            { icon: '📄', label: 'Total Analyses', value: analytics?.totalAnalyses },
                            { icon: '🎯', label: 'Tests Taken', value: analytics?.totalTests },
                            { icon: '📊', label: 'Avg Resume Score', value: analytics?.averageResumeScore },
                        ].map((item, i) => (
                            <div key={i} className="stat-card">
                                <div className="stat-icon">{item.icon}</div>
                                <div className="stat-value">{item.value ?? '—'}</div>
                                <div className="stat-label">{item.label}</div>
                            </div>
                        ))}
                    </div>
                    <div className="grid-2">
                        <div className="card"><Bar data={rankChartData} options={barOpts} /></div>
                        <div className="card" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <div style={{ maxWidth: '280px', width: '100%' }}>
                                <Doughnut data={donutData} options={{ plugins: { legend: { labels: { color: '#a0a0c0' } } } }} />
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Roles Management */}
            {activeTab === 'roles' && (
                <div className="grid-2 animate-fadeUp">
                    <div className="card">
                        <h4 style={{ marginBottom: '20px', fontWeight: 700, fontSize: '0.85rem', textTransform: 'uppercase', color: 'var(--text-secondary)', letterSpacing: '0.06em' }}>
                            {editRoleId ? '✏️ Edit Role' : '➕ Add New Role'}
                        </h4>
                        <form onSubmit={handleRoleSubmit}>
                            <div className="form-group">
                                <label className="form-label">Job Title</label>
                                <input className="form-input" required value={roleForm.title} onChange={e => setRoleForm(p => ({ ...p, title: e.target.value }))} placeholder="e.g. Full Stack Developer" />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Description</label>
                                <textarea className="form-textarea" required value={roleForm.description} onChange={e => setRoleForm(p => ({ ...p, description: e.target.value }))} placeholder="Describe the role..." />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Category</label>
                                <select className="form-select" value={roleForm.category} onChange={e => setRoleForm(p => ({ ...p, category: e.target.value }))}>
                                    {['Software Engineering', 'Data Science', 'DevOps', 'AI/ML', 'Design', 'Management'].map(c => <option key={c}>{c}</option>)}
                                </select>
                            </div>
                            <div className="form-group">
                                <label className="form-label">Required Skills (comma-separated)</label>
                                <textarea className="form-textarea" required value={roleForm.requiredSkills} onChange={e => setRoleForm(p => ({ ...p, requiredSkills: e.target.value }))} placeholder="React, Node.js, MongoDB, Docker..." style={{ minHeight: '80px' }} />
                            </div>
                            <div style={{ display: 'flex', gap: '10px' }}>
                                <button type="submit" className="btn btn-primary">{editRoleId ? 'Update Role' : 'Create Role'}</button>
                                {editRoleId && <button type="button" className="btn btn-secondary" onClick={() => { setEditRoleId(null); setRoleForm(EMPTY_ROLE); }}>Cancel</button>}
                            </div>
                        </form>
                    </div>

                    <div className="card">
                        <h4 style={{ marginBottom: '16px', fontWeight: 700, fontSize: '0.85rem', textTransform: 'uppercase', color: 'var(--text-secondary)', letterSpacing: '0.06em' }}>
                            Existing Roles ({roles.length})
                        </h4>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', maxHeight: '500px', overflowY: 'auto' }}>
                            {roles.map(role => (
                                <div key={role._id} style={{ padding: '12px 16px', background: 'var(--bg-glass)', borderRadius: 'var(--radius-md)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '12px' }}>
                                    <div>
                                        <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>{role.title}</div>
                                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '2px' }}>{role.category} · {role.requiredSkills.length} skills</div>
                                    </div>
                                    <div style={{ display: 'flex', gap: '6px', flexShrink: 0 }}>
                                        <button className="btn btn-secondary btn-sm" onClick={() => handleEditRole(role)}>Edit</button>
                                        <button className="btn btn-sm" style={{ background: 'rgba(255,71,87,0.15)', color: 'var(--accent-danger)', border: '1px solid rgba(255,71,87,0.3)' }} onClick={() => handleDeleteRole(role._id)}>Delete</button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {/* Trends */}
            {activeTab === 'trends' && (
                <div className="grid-2 animate-fadeUp">
                    <div className="card">
                        <h4 style={{ marginBottom: '20px', fontWeight: 700, fontSize: '0.85rem', textTransform: 'uppercase', color: 'var(--text-secondary)', letterSpacing: '0.06em' }}>
                            🔥 Update Industry Trends
                        </h4>
                        <form onSubmit={handleTrendSubmit}>
                            <div className="form-group">
                                <label className="form-label">Category</label>
                                <input className="form-input" value={trendForm.category} onChange={e => setTrendForm(p => ({ ...p, category: e.target.value }))} />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Trending Skills (comma-separated)</label>
                                <textarea className="form-textarea" required value={trendForm.trendingSkills} onChange={e => setTrendForm(p => ({ ...p, trendingSkills: e.target.value }))} placeholder="React, TypeScript, Docker, AWS..." />
                            </div>
                            <div className="form-group">
                                <label className="form-label">High-Demand Roles (comma-separated)</label>
                                <textarea className="form-textarea" value={trendForm.highDemandRoles} onChange={e => setTrendForm(p => ({ ...p, highDemandRoles: e.target.value }))} placeholder="Full Stack Developer, ML Engineer..." style={{ minHeight: '70px' }} />
                            </div>
                            <button type="submit" className="btn btn-primary">Publish Trend Update</button>
                        </form>
                    </div>

                    <div className="card">
                        <h4 style={{ marginBottom: '16px', fontWeight: 700, fontSize: '0.85rem', textTransform: 'uppercase', color: 'var(--text-secondary)', letterSpacing: '0.06em' }}>Current Trends</h4>
                        {trends.map((t, i) => (
                            <div key={i} style={{ marginBottom: '20px' }}>
                                <div style={{ fontWeight: 700, marginBottom: '8px' }}>{t.category}</div>
                                <div className="skill-tags">
                                    {t.trendingSkills.slice(0, 8).map((s, j) => <span key={j} className="skill-tag" style={{ borderColor: 'rgba(0,212,255,0.3)', color: 'var(--accent-secondary)', background: 'rgba(0,212,255,0.08)' }}>{s}</span>)}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Rankings */}
            {activeTab === 'rankings' && (
                <div className="card animate-fadeUp">
                    <h4 style={{ marginBottom: '20px', fontWeight: 700, fontSize: '0.85rem', textTransform: 'uppercase', color: 'var(--text-secondary)', letterSpacing: '0.06em' }}>
                        Full Ranking List ({analytics?.rankingList?.length || 0} users)
                    </h4>
                    <table className="data-table">
                        <thead>
                            <tr>
                                <th>Rank</th>
                                <th>Name</th>
                                <th>Resume Score</th>
                                <th>Last Analysis</th>
                                <th>Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {analytics?.rankingList?.map((r) => (
                                <tr key={r.userId}>
                                    <td style={{ fontWeight: 700 }}>#{r.rank}</td>
                                    <td>
                                        <div style={{ fontWeight: 600 }}>{r.fullName}</div>
                                        <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{r.userId.slice(0, 12)}...</div>
                                    </td>
                                    <td>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                            <div style={{ flex: 1, maxWidth: '80px' }}>
                                                <div className="progress-bar">
                                                    <div className="progress-fill" style={{ width: `${r.resumeScore}%` }} />
                                                </div>
                                            </div>
                                            {r.resumeScore}
                                        </div>
                                    </td>
                                    <td style={{ fontSize: '0.8rem' }}>{new Date(r.analysedAt).toLocaleDateString('en-IN')}</td>
                                    <td>
                                        {r.analysisId ? (
                                            <button
                                                className="btn btn-sm btn-secondary"
                                                onClick={() => handleViewResume(r.analysisId)}
                                            >
                                                📄 View Resume
                                            </button>
                                        ) : (
                                            <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>No File</span>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}
