import { useEffect, useState } from 'react';
import { useUser } from '@clerk/clerk-react';
import { Link } from 'react-router-dom';
import api from '../utils/api';
import { useAuth } from '@clerk/clerk-react';
import { setGetTokenFn } from '../utils/api';

export default function Dashboard() {
    const { user } = useUser();
    const { getToken } = useAuth();
    const [analysis, setAnalysis] = useState(null);
    const [testResult, setTestResult] = useState(null);
    const [rankInfo, setRankInfo] = useState(null);
    const [loading, setLoading] = useState(true);
    const [authToken, setAuthToken] = useState('');

    useEffect(() => {
        setGetTokenFn(getToken);
        getToken().then(t => setAuthToken(t));
    }, [getToken]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [analysisData, testsData, rankData] = await Promise.allSettled([
                    api.get('/resume/latest'),
                    api.get('/test/'),
                    api.get('/user/rankings')
                ]);
                if (analysisData.status === 'fulfilled') {
                    setAnalysis(analysisData.value.analysis);
                    setRankInfo(analysisData.value.rankInfo);
                }
                if (testsData.status === 'fulfilled' && testsData.value.results?.length) {
                    setTestResult(testsData.value.results[0]);
                }
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    const timeGreeting = () => {
        const h = new Date().getHours();
        if (h < 12) return 'Good Morning';
        if (h < 17) return 'Good Afternoon';
        return 'Good Evening';
    };

    const ScoreRing = ({ score, label, color = 'var(--accent-primary)' }) => {
        const r = 54;
        const circ = 2 * Math.PI * r;
        const offset = circ - (score / 100) * circ;
        return (
            <div className="score-ring-container">
                <div className="score-ring">
                    <svg viewBox="0 0 120 120" width="120" height="120">
                        <defs>
                            <linearGradient id="sg" x1="0%" y1="0%" x2="100%" y2="100%">
                                <stop offset="0%" stopColor="#6c63ff" />
                                <stop offset="100%" stopColor="#00d4ff" />
                            </linearGradient>
                        </defs>
                        <circle className="bg-circle" cx="60" cy="60" r={r} strokeLinecap="round" />
                        <circle
                            className="fg-circle"
                            cx="60" cy="60" r={r}
                            stroke="url(#sg)"
                            strokeDasharray={circ}
                            strokeDashoffset={offset}
                            strokeLinecap="round"
                        />
                    </svg>
                    <div className="score-ring-label">
                        <div className="score-ring-value">{score}</div>
                        <div className="score-ring-subtitle">/ 100</div>
                    </div>
                </div>
                <div style={{ marginTop: '8px', fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 600 }}>{label}</div>
            </div>
        );
    };

    if (loading) return (
        <div className="loading-overlay">
            <div className="spinner" />
            <p style={{ color: 'var(--text-secondary)' }}>Loading your dashboard...</p>
        </div>
    );

    return (
        <div style={{ position: 'relative', zIndex: 1 }}>
            {/* Header */}
            <div className="page-header animate-fadeUp">
                <h1>{timeGreeting()}, <span className="text-gradient">{user?.firstName || 'there'}</span> 👋</h1>
                <p>Here's your career intelligence overview for today.</p>
            </div>

            {/* Stats Grid */}
            <div className="grid-4 animate-fadeUp-1" style={{ marginBottom: '28px' }}>
                <div className="stat-card">
                    <div className="stat-icon">📄</div>
                    <div className="stat-value">{analysis ? analysis.resumeScore : '—'}</div>
                    <div className="stat-label">Resume Score</div>
                </div>
                <div className="stat-card">
                    <div className="stat-icon">🎯</div>
                    <div className="stat-value">{testResult ? `${testResult.testPercent}%` : '—'}</div>
                    <div className="stat-label">Test Score</div>
                </div>
                <div className="stat-card">
                    <div className="stat-icon">⚡</div>
                    <div className="stat-value">{testResult ? testResult.careerReadinessScore : '—'}</div>
                    <div className="stat-label">Career Readiness</div>
                </div>
                <div className="stat-card">
                    <div className="stat-icon">🏆</div>
                    <div className="stat-value">{rankInfo?.rank ? `#${rankInfo.rank}` : '—'}</div>
                    <div className="stat-label">Your Rank</div>
                </div>
            </div>

            {!analysis && (
                <div className="card animate-fadeUp-2" style={{ textAlign: 'center', padding: '60px 24px', marginBottom: '24px' }}>
                    <div style={{ fontSize: '4rem', marginBottom: '16px' }}>📄</div>
                    <h3 style={{ marginBottom: '10px' }}>Start with Your Resume</h3>
                    <p style={{ color: 'var(--text-secondary)', marginBottom: '24px', maxWidth: '400px', margin: '0 auto 24px' }}>
                        Upload your resume to get an AI-powered score, skill gap analysis, role recommendations, and a personalized 30-day improvement plan.
                    </p>
                    <Link to="/upload" className="btn btn-primary btn-lg">Upload Resume →</Link>
                </div>
            )}

            {analysis && (
                <div className="grid-2 animate-fadeUp-2" style={{ marginBottom: '28px' }}>
                    {/* Score Rings */}
                    <div className="card">
                        <h4 style={{ marginBottom: '20px', color: 'var(--text-secondary)', fontSize: '0.8rem', letterSpacing: '0.08em', textTransform: 'uppercase', fontWeight: 700 }}>
                            Score Overview
                        </h4>
                        <div style={{ display: 'flex', justifyContent: 'space-around', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
                            <ScoreRing score={analysis.resumeScore} label="Resume Score" />
                            <ScoreRing score={analysis.industryMatchPercent} label="Industry Match" />
                            {testResult && <ScoreRing score={testResult.careerReadinessScore} label="Readiness Score" />}
                        </div>
                    </div>

                    {/* Role Recommendations */}
                    <div className="card">
                        <h4 style={{ marginBottom: '16px', color: 'var(--text-secondary)', fontSize: '0.8rem', letterSpacing: '0.08em', textTransform: 'uppercase', fontWeight: 700 }}>
                            🎯 Recommended Roles
                        </h4>
                        {analysis.recommendedRoles?.length > 0 ? (
                            analysis.recommendedRoles.map((r, i) => (
                                <div key={i} className="progress-container">
                                    <div className="progress-label">
                                        <span>{r.role}</span>
                                        <span>{r.matchPercent}% match</span>
                                    </div>
                                    <div className="progress-bar">
                                        <div
                                            className={`progress-fill ${r.matchPercent >= 70 ? 'success' : r.matchPercent >= 40 ? '' : 'warning'}`}
                                            style={{ width: `${r.matchPercent}%` }}
                                        />
                                    </div>
                                </div>
                            ))
                        ) : <p style={{ color: 'var(--text-muted)' }}>No recommendations yet</p>}

                        <div style={{ marginTop: '20px' }}>
                            <Link to="/roles" className="btn btn-secondary btn-sm">Take Skill Assessment →</Link>
                        </div>
                    </div>
                </div>
            )}

            {analysis && (
                <div className="grid-3 animate-fadeUp-3">
                    {/* Skills */}
                    <div className="card">
                        <h4 style={{ marginBottom: '14px', fontSize: '0.8rem', letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--text-secondary)', fontWeight: 700 }}>
                            ✅ Detected Skills
                        </h4>
                        <div className="skill-tags">
                            {analysis.extractedSkills.slice(0, 12).map((s, i) => (
                                <span key={i} className="skill-tag matched">{s}</span>
                            ))}
                        </div>
                    </div>

                    {/* Missing Skills */}
                    <div className="card">
                        <h4 style={{ marginBottom: '14px', fontSize: '0.8rem', letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--text-secondary)', fontWeight: 700 }}>
                            ⚠️ Skill Gaps
                        </h4>
                        <div className="skill-tags">
                            {analysis.missingSkills?.slice(0, 10).map((s, i) => (
                                <span key={i} className="skill-tag missing">{s}</span>
                            ))}
                        </div>
                    </div>

                    {/* Quick Actions */}
                    <div className="card">
                        <h4 style={{ marginBottom: '14px', fontSize: '0.8rem', letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--text-secondary)', fontWeight: 700 }}>
                            ⚡ Quick Actions
                        </h4>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                            <Link to="/upload" className="btn btn-secondary">Re-analyze Resume</Link>
                            <Link to="/analysis" className="btn btn-secondary">View Full Analysis</Link>
                            <Link to="/roles" className="btn btn-primary">Take Skill Test</Link>
                            <a
                                href={`${import.meta.env.VITE_API_URL}/pdf/report?token=${authToken}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="btn btn-secondary"
                            >
                                📥 Download PDF Report
                            </a>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
