import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Radar, Bar } from 'react-chartjs-2';
import {
    Chart as ChartJS, RadialLinearScale, PointElement, LineElement,
    Filler, Tooltip, Legend, CategoryScale, LinearScale, BarElement
} from 'chart.js';
import api from '../utils/api';
import { useAuth } from '@clerk/clerk-react';
import { setGetTokenFn } from '../utils/api';

ChartJS.register(RadialLinearScale, PointElement, LineElement, Filler, Tooltip, Legend, CategoryScale, LinearScale, BarElement);

export default function AnalysisResult() {
    const { getToken } = useAuth();
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [activeTab, setActiveTab] = useState('overview');

    const [authToken, setAuthToken] = useState('');

    useEffect(() => {
        setGetTokenFn(getToken);
        getToken().then(t => setAuthToken(t));
        api.get('/resume/latest')
            .then(res => setData(res))
            .catch(err => setError(err.message))
            .finally(() => setLoading(false));
    }, [getToken]);

    if (loading) return <div className="loading-overlay"><div className="spinner" /></div>;

    if (error || !data?.analysis) return (
        <div style={{ textAlign: 'center', padding: '80px' }}>
            <div style={{ fontSize: '4rem', marginBottom: '16px' }}>📄</div>
            <h3>No Analysis Found</h3>
            <p style={{ color: 'var(--text-secondary)', margin: '12px 0 24px' }}>Upload your resume to get started.</p>
            <Link to="/upload" className="btn btn-primary">Upload Resume</Link>
        </div>
    );

    const { analysis, rankInfo } = data;

    const scoreColor = (s) => s >= 70 ? 'var(--accent-success)' : s >= 40 ? 'var(--accent-warning)' : 'var(--accent-danger)';

    const radarData = {
        labels: ['Resume Score', 'Industry Match', 'Skills Count', 'Role Match', 'ATS Optimized'],
        datasets: [{
            label: 'Your Profile',
            data: [
                analysis.resumeScore,
                analysis.industryMatchPercent,
                Math.min(100, analysis.extractedSkills.length * 5),
                analysis.recommendedRoles[0]?.matchPercent || 0,
                analysis.resumeScore * 0.9
            ],
            backgroundColor: 'rgba(108, 99, 255, 0.2)',
            borderColor: '#6c63ff',
            pointBackgroundColor: '#6c63ff',
            pointBorderColor: '#fff',
            borderWidth: 2
        }]
    };

    const barData = {
        labels: analysis.highDemandMissingSkills.length > 0 ? analysis.highDemandMissingSkills.slice(0, 6) : ['No gaps found'],
        datasets: [{
            label: 'Industry Demand Score',
            data: analysis.highDemandMissingSkills.length > 0
                ? analysis.highDemandMissingSkills.slice(0, 6).map((_, i) => 90 - i * 8)
                : [0],
            backgroundColor: 'rgba(255, 71, 87, 0.6)',
            borderColor: '#ff4757',
            borderWidth: 1,
            borderRadius: 6
        }]
    };

    const chartOptions = {
        responsive: true,
        plugins: { legend: { labels: { color: '#a0a0c0', font: { size: 12 } } } },
        scales: {
            r: {
                ticks: { color: '#606080', backdropColor: 'transparent' },
                grid: { color: 'rgba(255,255,255,0.05)' },
                pointLabels: { color: '#a0a0c0', font: { size: 11 } }
            }
        }
    };

    const barOptions = {
        responsive: true,
        plugins: { legend: { display: false } },
        scales: {
            x: { ticks: { color: '#a0a0c0' }, grid: { color: 'rgba(255,255,255,0.04)' } },
            y: { ticks: { color: '#a0a0c0' }, grid: { color: 'rgba(255,255,255,0.04)' }, max: 100 }
        }
    };

    const tabs = ['overview', 'skills', 'feedback', 'plan'];

    return (
        <div style={{ position: 'relative', zIndex: 1 }}>
            <div className="page-header animate-fadeUp" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                    <h1>Analysis <span className="text-gradient">Results</span></h1>
                    <p>AI-powered resume evaluation powered by our ATS engine.</p>
                    {analysis.experienceLevel && (
                        <span className="badge badge-primary" style={{ marginTop: '12px', display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                            {analysis.experienceLevel === 'Experienced' ? '🚀 Experienced Profile' : '🌱 Fresher Profile'}
                        </span>
                    )}
                </div>
                <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                    <Link to="/upload" className="btn btn-secondary btn-sm">Re-upload</Link>
                    <a href={`${import.meta.env.VITE_API_URL}/pdf/report?token=${authToken}`} className="btn btn-primary btn-sm">📥 Download PDF</a>
                </div>
            </div>

            {/* Top Score Cards */}
            <div className="grid-4 animate-fadeUp-1" style={{ marginBottom: '24px' }}>
                <div className="stat-card">
                    <div className="stat-icon">📊</div>
                    <div className="stat-value" style={{ color: scoreColor(analysis.resumeScore) }}>{analysis.resumeScore}</div>
                    <div className="stat-label">Resume Score / 100</div>
                </div>
                <div className="stat-card">
                    <div className="stat-icon">🏭</div>
                    <div className="stat-value">{analysis.industryMatchPercent}%</div>
                    <div className="stat-label">Industry Match</div>
                </div>
                <div className="stat-card">
                    <div className="stat-icon">🛠️</div>
                    <div className="stat-value">{analysis.extractedSkills.length}</div>
                    <div className="stat-label">Skills Detected</div>
                </div>
                <div className="stat-card">
                    <div className="stat-icon">🏆</div>
                    <div className="stat-value">{rankInfo?.rank ? `#${rankInfo.rank}` : '—'}</div>
                    <div className="stat-label">Your Rank of {rankInfo?.totalUsers || '?'}</div>
                </div>
            </div>

            {/* Tabs */}
            <div style={{ display: 'flex', gap: '4px', marginBottom: '24px', background: 'var(--bg-card)', padding: '6px', borderRadius: 'var(--radius-md)', width: 'fit-content' }}>
                {tabs.map(tab => (
                    <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        className="btn btn-sm"
                        style={{
                            background: activeTab === tab ? 'var(--gradient-primary)' : 'transparent',
                            color: activeTab === tab ? 'white' : 'var(--text-secondary)',
                            textTransform: 'capitalize'
                        }}
                    >
                        {tab === 'overview' ? '📈' : tab === 'skills' ? '🛠️' : tab === 'feedback' ? '🤖' : '📅'} {tab}
                    </button>
                ))}
            </div>

            {activeTab === 'overview' && (
                <div className="grid-2 animate-fadeUp">
                    <div className="card"><Radar data={radarData} options={chartOptions} /></div>
                    <div className="card">
                        <h4 style={{ marginBottom: '16px', color: 'var(--text-secondary)', fontSize: '0.8rem', textTransform: 'uppercase', fontWeight: 700 }}>🎯 Role Recommendations</h4>
                        {analysis.recommendedRoles.map((r, i) => (
                            <div key={i} className="progress-container">
                                <div className="progress-label"><span>{r.role}</span><span>{r.matchPercent}%</span></div>
                                <div className="progress-bar"><div className="progress-fill" style={{ width: `${r.matchPercent}%` }} /></div>
                            </div>
                        ))}
                        <div style={{ marginTop: '16px' }}>
                            <h4 style={{ marginBottom: '10px', color: 'var(--text-secondary)', fontSize: '0.8rem', textTransform: 'uppercase', fontWeight: 700 }}>📊 High-Demand Skill Gaps</h4>
                            <Bar data={barData} options={barOptions} height={180} />
                        </div>
                    </div>
                </div>
            )}

            {activeTab === 'skills' && (
                <div className="grid-2 animate-fadeUp">
                    <div className="card">
                        <h4 style={{ marginBottom: '14px', color: 'var(--accent-success)', fontSize: '0.85rem', fontWeight: 700 }}>✅ Matched Skills ({analysis.extractedSkills.length})</h4>
                        <div className="skill-tags">
                            {analysis.extractedSkills.map((s, i) => <span key={i} className="skill-tag matched">{s}</span>)}
                        </div>
                    </div>
                    <div className="card">
                        <h4 style={{ marginBottom: '14px', color: 'var(--accent-danger)', fontSize: '0.85rem', fontWeight: 700 }}>⚠️ Missing Skills ({analysis.missingSkills?.length || 0})</h4>
                        <div className="skill-tags">
                            {analysis.missingSkills?.map((s, i) => <span key={i} className="skill-tag missing">{s}</span>)}
                        </div>
                        {analysis.highDemandMissingSkills?.length > 0 && (
                            <>
                                <h4 style={{ marginTop: '20px', marginBottom: '10px', color: 'var(--accent-warning)', fontSize: '0.85rem', fontWeight: 700 }}>🔥 High-Demand Missing</h4>
                                <div className="skill-tags">
                                    {analysis.highDemandMissingSkills.map((s, i) => <span key={i} className="skill-tag" style={{ borderColor: 'rgba(255,184,54,0.4)', color: 'var(--accent-warning)', background: 'rgba(255,184,54,0.1)' }}>{s}</span>)}
                                </div>
                            </>
                        )}
                    </div>
                </div>
            )}

            {activeTab === 'feedback' && (
                <div className="card animate-fadeUp" style={{ maxWidth: '800px' }}>
                    <h4 style={{ marginBottom: '20px', color: 'var(--text-secondary)', fontSize: '0.8rem', textTransform: 'uppercase', fontWeight: 700 }}>🤖 AI Resume Feedback</h4>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                        {analysis.aiFeedback?.map((fb, i) => (
                            <div key={i} style={{ padding: '14px 18px', background: 'var(--bg-glass)', borderRadius: 'var(--radius-md)', borderLeft: '3px solid var(--accent-primary)', fontSize: '0.9rem', lineHeight: 1.7 }}>
                                {fb}
                            </div>
                        ))}
                    </div>
                    <div style={{ marginTop: '24px', padding: '16px', background: 'rgba(108, 99, 255, 0.08)', borderRadius: 'var(--radius-md)' }}>
                        <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                            💡 Pro Tip: Address all AI feedback points and re-upload your resume to improve your score.
                        </p>
                    </div>
                </div>
            )}

            {activeTab === 'plan' && (
                <div className="animate-fadeUp" style={{ maxWidth: '800px' }}>
                    <div className="card" style={{ marginBottom: '16px', background: 'rgba(108, 99, 255, 0.08)', border: '1px solid rgba(108,99,255,0.2)' }}>
                        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>📅 Your personalized 30-day plan to bridge skill gaps and increase career readiness.</p>
                    </div>
                    {analysis.improvementPlan?.map((week, i) => (
                        <div key={i} className="card" style={{ marginBottom: '16px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
                                <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'var(--gradient-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '0.9rem', color: 'white', flexShrink: 0 }}>
                                    W{week.week}
                                </div>
                                <div>
                                    <h4>{week.title}</h4>
                                    <span className="badge badge-primary" style={{ fontSize: '0.7rem', marginTop: '4px' }}>Week {week.week} of 4</span>
                                </div>
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                {week.tasks.map((task, j) => (
                                    <div key={j} style={{ padding: '12px 16px', background: 'var(--bg-glass)', borderRadius: 'var(--radius-sm)', fontSize: '0.88rem', color: 'var(--text-secondary)' }}>
                                        {task}
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
