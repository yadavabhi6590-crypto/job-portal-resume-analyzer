import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@clerk/clerk-react';
import api from '../utils/api';
import { setGetTokenFn } from '../utils/api';

export default function RoleSelection() {
    const { getToken } = useAuth();
    const navigate = useNavigate();
    const [roles, setRoles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [analysis, setAnalysis] = useState(null);

    useEffect(() => {
        setGetTokenFn(getToken);
        Promise.allSettled([api.get('/user/roles'), api.get('/resume/latest')])
            .then(([rolesRes, analysisRes]) => {
                if (rolesRes.status === 'fulfilled') setRoles(rolesRes.value.roles || []);
                if (analysisRes.status === 'fulfilled') setAnalysis(analysisRes.value.analysis);
            })
            .finally(() => setLoading(false));
    }, [getToken]);

    const getMatchPercent = (role) => {
        if (!analysis) return null;
        const rec = analysis.recommendedRoles?.find(r => r.role === role.title);
        return rec?.matchPercent ?? null;
    };

    const handleSelect = (roleId) => navigate(`/test/${roleId}`);

    if (loading) return <div className="loading-overlay"><div className="spinner" /></div>;

    return (
        <div style={{ position: 'relative', zIndex: 1 }}>
            <div className="page-header animate-fadeUp">
                <h1>Select a <span className="text-gradient">Role</span> to Test</h1>
                <p>Choose a job role to take a 10-question skill assessment. Your score contributes to your Career Readiness Score.</p>
            </div>

            <div className="grid-3 animate-fadeUp-1">
                {roles.map((role, i) => {
                    const match = getMatchPercent(role);
                    return (
                        <div
                            key={role._id}
                            className="card"
                            style={{ cursor: 'pointer', animationDelay: `${i * 0.05}s` }}
                            onClick={() => handleSelect(role._id)}
                        >
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                                <span className="badge badge-primary">{role.category}</span>
                                {match !== null && (
                                    <span className={`badge ${match >= 70 ? 'badge-success' : match >= 40 ? 'badge-warning' : 'badge-danger'}`}>
                                        {match}% match
                                    </span>
                                )}
                            </div>
                            <h3 style={{ marginBottom: '8px', fontSize: '1.1rem' }}>{role.title}</h3>
                            <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: '16px', lineHeight: 1.6 }}>
                                {role.description}
                            </p>
                            <div className="skill-tags">
                                {role.requiredSkills.slice(0, 4).map((s, j) => (
                                    <span key={j} className="skill-tag">{s}</span>
                                ))}
                                {role.requiredSkills.length > 4 && (
                                    <span className="skill-tag">+{role.requiredSkills.length - 4} more</span>
                                )}
                            </div>
                            <div style={{ marginTop: '20px' }}>
                                <div style={{
                                    width: '100%',
                                    padding: '10px',
                                    background: 'var(--gradient-primary)',
                                    borderRadius: 'var(--radius-md)',
                                    textAlign: 'center',
                                    fontSize: '0.85rem',
                                    fontWeight: 700,
                                    color: 'white',
                                    letterSpacing: '0.03em'
                                }}>
                                    Take 10-Question Assessment →
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
