import { useLocation, Link } from 'react-router-dom';
import { useAuth } from '@clerk/clerk-react';
import { useState, useEffect } from 'react';

export default function TestResult() {
    const { state } = useLocation();
    const { getToken } = useAuth();
    const [token, setToken] = useState('');

    useEffect(() => {
        getToken().then(t => setToken(t));
    }, [getToken]);

    if (!state) {
        return (
            <div style={{ textAlign: 'center', padding: '80px' }}>
                <h3>No Test Result Found</h3>
                <p style={{ color: 'var(--text-secondary)', margin: '12px 0 24px' }}>Take a skill assessment first.</p>
                <Link to="/roles" className="btn btn-primary">Take Assessment</Link>
            </div>
        );
    }

    const {
        testScore, testPercent, knowledgeLevel, weakAreas,
        resumeScore, careerReadinessScore, correct, total
    } = state;

    const levelColor = {
        Beginner: 'var(--accent-danger)',
        Intermediate: 'var(--accent-warning)',
        Advanced: 'var(--accent-success)'
    }[knowledgeLevel] || 'var(--accent-primary)';

    const levelEmoji = { Beginner: '🌱', Intermediate: '⚡', Advanced: '🚀' }[knowledgeLevel] || '📊';

    return (
        <div style={{ maxWidth: '700px', margin: '0 auto', position: 'relative', zIndex: 1 }}>
            <div className="page-header animate-fadeUp">
                <h1>Test <span className="text-gradient">Completed!</span></h1>
                <p>Here's your detailed skill assessment result and career readiness score.</p>
            </div>

            {/* Knowledge Level Banner */}
            <div className="card animate-fadeUp-1" style={{
                marginBottom: '24px',
                background: `rgba(${knowledgeLevel === 'Advanced' ? '0,229,160' : knowledgeLevel === 'Intermediate' ? '255,184,54' : '255,71,87'}, 0.08)`,
                border: `1px solid ${levelColor}40`,
                textAlign: 'center',
                padding: '40px'
            }}>
                <div style={{ fontSize: '4rem', marginBottom: '12px' }}>{levelEmoji}</div>
                <h2 style={{ color: levelColor, marginBottom: '6px' }}>{knowledgeLevel}</h2>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Knowledge Level</p>
            </div>

            {/* Score Grid */}
            <div className="grid-3 animate-fadeUp-2" style={{ marginBottom: '24px' }}>
                <div className="stat-card">
                    <div className="stat-icon">🎯</div>
                    <div className="stat-value">{correct}/{total}</div>
                    <div className="stat-label">Correct Answers</div>
                </div>
                <div className="stat-card">
                    <div className="stat-icon">📊</div>
                    <div className="stat-value">{testPercent}%</div>
                    <div className="stat-label">Test Percentage</div>
                </div>
                <div className="stat-card">
                    <div className="stat-icon">⚡</div>
                    <div className="stat-value">{careerReadinessScore}</div>
                    <div className="stat-label">Career Readiness</div>
                </div>
            </div>

            {/* Career Readiness Breakdown */}
            <div className="card animate-fadeUp-2" style={{ marginBottom: '24px' }}>
                <h4 style={{ marginBottom: '20px', color: 'var(--text-secondary)', fontSize: '0.8rem', textTransform: 'uppercase', fontWeight: 700 }}>
                    ⚡ Career Readiness Score Breakdown
                </h4>
                <div className="progress-container">
                    <div className="progress-label"><span>Resume Score × 0.7</span><span>{Math.round(resumeScore * 0.7)} pts</span></div>
                    <div className="progress-bar"><div className="progress-fill" style={{ width: `${resumeScore}%` }} /></div>
                </div>
                <div className="progress-container">
                    <div className="progress-label"><span>Test Score × 0.3</span><span>{Math.round(testPercent * 0.3)} pts</span></div>
                    <div className="progress-bar"><div className="progress-fill success" style={{ width: `${testPercent}%` }} /></div>
                </div>
                <div style={{ marginTop: '16px', padding: '14px', background: 'rgba(108,99,255,0.1)', borderRadius: 'var(--radius-md)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontWeight: 600 }}>Final Career Readiness Score</span>
                    <span style={{ fontSize: '1.5rem', fontWeight: 800, background: 'var(--gradient-primary)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                        {careerReadinessScore} / 100
                    </span>
                </div>
                <p style={{ marginTop: '10px', color: 'var(--text-muted)', fontSize: '0.78rem' }}>
                    Formula: (Resume Score × 0.7) + (Test Percentage × 0.3)
                </p>
            </div>

            {/* Weak Areas */}
            {weakAreas?.length > 0 && (
                <div className="card animate-fadeUp-2" style={{ marginBottom: '24px' }}>
                    <h4 style={{ marginBottom: '14px', color: 'var(--accent-danger)', fontSize: '0.85rem', fontWeight: 700 }}>
                        ⚠️ Weak Areas to Improve
                    </h4>
                    <div className="skill-tags">
                        {weakAreas.map((area, i) => (
                            <span key={i} className="skill-tag missing">{area}</span>
                        ))}
                    </div>
                </div>
            )}

            {/* Actions */}
            <div className="grid-2 animate-fadeUp-3">
                <Link to="/roles" className="btn btn-secondary btn-lg" style={{ width: '100%', justifyContent: 'center' }}>
                    Retake Another Test
                </Link>
                <a href={`${import.meta.env.VITE_API_URL}/pdf/report?token=${token}`} className="btn btn-primary btn-lg" style={{ width: '100%', justifyContent: 'center' }}>
                    📥 Download PDF Report
                </a>
            </div>
        </div>
    );
}
