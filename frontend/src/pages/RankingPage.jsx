import { useEffect, useState } from 'react';
import { useAuth } from '@clerk/clerk-react';
import { useUser } from '@clerk/clerk-react';
import api from '../utils/api';
import { setGetTokenFn } from '../utils/api';

export default function RankingPage() {
    const { getToken } = useAuth();
    const { user } = useUser();
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        setGetTokenFn(getToken);
        api.get('/user/rankings').then(setData).finally(() => setLoading(false));
    }, [getToken]);

    if (loading) return <div className="loading-overlay"><div className="spinner" /></div>;

    const myClerkId = user?.id;
    const myRank = data?.rankings?.find(r => r.userId === myClerkId);

    const medalColors = ['#ffd700', '#c0c0c0', '#cd7f32'];
    const medalEmoji = ['🥇', '🥈', '🥉'];

    return (
        <div style={{ position: 'relative', zIndex: 1 }}>
            <div className="page-header animate-fadeUp">
                <h1>Global <span className="text-gradient">Rankings</span></h1>
                <p>See how your resume score stacks up against all users on the platform.</p>
            </div>

            {/* Stats */}
            <div className="grid-3 animate-fadeUp-1" style={{ marginBottom: '28px' }}>
                <div className="stat-card">
                    <div className="stat-icon">👥</div>
                    <div className="stat-value">{data?.totalUsers || 0}</div>
                    <div className="stat-label">Total Users</div>
                </div>
                <div className="stat-card">
                    <div className="stat-icon">📊</div>
                    <div className="stat-value">{data?.averageScore || 0}</div>
                    <div className="stat-label">Average Score</div>
                </div>
                <div className="stat-card">
                    <div className="stat-icon">🏆</div>
                    <div className="stat-value">{data?.topScore || 0}</div>
                    <div className="stat-label">Top Score</div>
                </div>
            </div>

            {/* My Rank Banner */}
            {myRank && (
                <div className="card animate-fadeUp-1" style={{ marginBottom: '24px', background: 'rgba(108,99,255,0.08)', border: '1px solid rgba(108,99,255,0.25)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
                        <div style={{ fontSize: '2.5rem' }}>🏅</div>
                        <div>
                            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Your Ranking</div>
                            <div style={{ fontSize: '1.5rem', fontWeight: 800, background: 'var(--gradient-primary)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                                #{myRank.rank} of {data.totalUsers}
                            </div>
                        </div>
                        <div style={{ marginLeft: 'auto', textAlign: 'right' }}>
                            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Resume Score</div>
                            <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--accent-success)' }}>{myRank.resumeScore}</div>
                        </div>
                    </div>
                </div>
            )}

            {/* Ranking Table */}
            <div className="card animate-fadeUp-2">
                <h4 style={{ marginBottom: '20px', color: 'var(--text-secondary)', fontSize: '0.8rem', textTransform: 'uppercase', fontWeight: 700 }}>
                    🏆 Leaderboard
                </h4>
                <table className="data-table">
                    <thead>
                        <tr>
                            <th>Rank</th>
                            <th>User ID</th>
                            <th>Resume Score</th>
                            <th>Analysed</th>
                            <th>Status</th>
                        </tr>
                    </thead>
                    <tbody>
                        {data?.rankings?.map((r, i) => {
                            const isMe = r.userId === myClerkId;
                            return (
                                <tr key={r.userId} style={{ background: isMe ? 'rgba(108,99,255,0.06)' : undefined }}>
                                    <td>
                                        <span style={{ fontWeight: 700, color: i < 3 ? medalColors[i] : 'var(--text-secondary)', fontSize: i < 3 ? '1.1rem' : '0.9rem' }}>
                                            {i < 3 ? medalEmoji[i] : `#${r.rank}`}
                                        </span>
                                    </td>
                                    <td>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                            <div style={{
                                                width: '28px', height: '28px', borderRadius: '50%',
                                                background: 'var(--gradient-purple)',
                                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                fontSize: '0.7rem', fontWeight: 700, color: 'white', flexShrink: 0
                                            }}>
                                                {r.userId.slice(-2).toUpperCase()}
                                            </div>
                                            <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.78rem' }}>
                                                {r.userId.slice(0, 8)}...
                                            </span>
                                            {isMe && <span className="badge badge-primary" style={{ fontSize: '0.65rem' }}>You</span>}
                                        </div>
                                    </td>
                                    <td>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                            <div style={{ flex: 1, maxWidth: '100px' }}>
                                                <div className="progress-bar">
                                                    <div className="progress-fill" style={{ width: `${r.resumeScore}%`, background: r.resumeScore >= 70 ? 'var(--accent-success)' : r.resumeScore >= 40 ? 'var(--accent-warning)' : 'var(--accent-danger)' }} />
                                                </div>
                                            </div>
                                            <span style={{ fontWeight: 700, minWidth: '30px' }}>{r.resumeScore}</span>
                                        </div>
                                    </td>
                                    <td>{new Date(r.analysedAt).toLocaleDateString('en-IN', { dateStyle: 'medium' })}</td>
                                    <td>
                                        <span className={`badge ${r.resumeScore >= 70 ? 'badge-success' : r.resumeScore >= 40 ? 'badge-warning' : 'badge-danger'}`}>
                                            {r.resumeScore >= 70 ? 'Excellent' : r.resumeScore >= 40 ? 'Good' : 'Needs Work'}
                                        </span>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
