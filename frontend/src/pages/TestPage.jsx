import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '@clerk/clerk-react';
import api from '../utils/api';
import { setGetTokenFn } from '../utils/api';
import './TestPage.css';

export default function TestPage() {
    const { roleId } = useParams();
    const { getToken } = useAuth();
    const navigate = useNavigate();

    const [test, setTest] = useState(null);
    const [answers, setAnswers] = useState({});
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState('');
    const [currentQ, setCurrentQ] = useState(0);

    useEffect(() => {
        setGetTokenFn(getToken);
        api.get(`/test/${roleId}`)
            .then(res => {
                setTest(res);
                setAnswers({});
            })
            .catch(err => setError(err.message))
            .finally(() => setLoading(false));
    }, [roleId, getToken]);

    const handleAnswer = (qIdx, optIdx) => {
        setAnswers(prev => ({ ...prev, [qIdx]: optIdx }));
    };

    const handleSubmit = async () => {
        if (Object.keys(answers).length < test.questions.length) {
            setError(`Please answer all ${test.questions.length} questions before submitting.`);
            return;
        }
        setSubmitting(true);
        setError('');
        try {
            const answersArray = test.questions.map((_, i) => answers[i] ?? -1);
            const result = await api.post('/test/submit', {
                testId: test.testId,
                roleId,
                answers: answersArray
            });
            navigate('/test-result', { state: result });
        } catch (err) {
            setError(err.message);
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) return <div className="loading-overlay"><div className="spinner" /></div>;
    if (error && !test) return <div className="alert alert-error" style={{ margin: 32 }}>{error}</div>;
    if (!test) return null;

    const q = test.questions[currentQ];
    const answeredCount = Object.keys(answers).length;
    const progress = (answeredCount / test.questions.length) * 100;

    return (
        <div className="test-page" style={{ maxWidth: '900px', margin: '0 auto', position: 'relative', zIndex: 1 }}>
            {/* Header */}
            <div className="page-header animate-fadeUp">
                <h1>Skill Assessment: <span className="text-gradient">{test.jobRole?.title}</span></h1>
                <p>Answer all {test.questions.length} questions. You can navigate between questions using the OMR grid.</p>
            </div>

            {/* Progress */}
            <div className="card animate-fadeUp-1" style={{ marginBottom: '24px' }}>
                <div className="progress-label">
                    <span>Progress</span>
                    <span>{answeredCount} / {test.questions.length} answered</span>
                </div>
                <div className="progress-bar" style={{ height: '10px' }}>
                    <div className="progress-fill success" style={{ width: `${progress}%` }} />
                </div>
            </div>

            <div className="test-layout animate-fadeUp-2">
                {/* OMR Grid */}
                <div className="omr-panel">
                    <div style={{ fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.1em', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '12px' }}>OMR Sheet</div>
                    <div className="omr-grid">
                        {test.questions.map((_, i) => (
                            <button
                                key={i}
                                className={`omr-bubble ${currentQ === i ? 'current' : ''} ${answers[i] !== undefined ? 'answered' : ''}`}
                                onClick={() => setCurrentQ(i)}
                            >
                                {i + 1}
                            </button>
                        ))}
                    </div>
                    <div className="omr-legend">
                        <div className="legend-item"><div className="legend-dot answered" /><span>Answered</span></div>
                        <div className="legend-item"><div className="legend-dot current" /><span>Current</span></div>
                        <div className="legend-item"><div className="legend-dot" /><span>Unanswered</span></div>
                    </div>
                </div>

                {/* Question */}
                <div className="question-panel">
                    <div className="question-header">
                        <span className="question-number">Q{currentQ + 1} of {test.questions.length}</span>
                        {q.topic && <span className="badge badge-cyan">{q.topic}</span>}
                    </div>
                    <h3 className="question-text">{q.questionText}</h3>

                    <div className="options-list">
                        {q.options.map((opt, optIdx) => {
                            const optLabels = ['A', 'B', 'C', 'D'];
                            const selected = answers[currentQ] === optIdx;
                            return (
                                <button
                                    key={optIdx}
                                    className={`option-btn ${selected ? 'selected' : ''}`}
                                    onClick={() => handleAnswer(currentQ, optIdx)}
                                >
                                    <div className="option-label">{optLabels[optIdx]}</div>
                                    <div className="option-text">{opt}</div>
                                </button>
                            );
                        })}
                    </div>

                    <div className="question-nav">
                        <button
                            className="btn btn-secondary"
                            onClick={() => setCurrentQ(q => Math.max(0, q - 1))}
                            disabled={currentQ === 0}
                        >
                            ← Previous
                        </button>
                        {currentQ < test.questions.length - 1 ? (
                            <button
                                className="btn btn-primary"
                                onClick={() => setCurrentQ(q => q + 1)}
                            >
                                Next →
                            </button>
                        ) : (
                            <button
                                className="btn btn-success"
                                onClick={handleSubmit}
                                disabled={submitting}
                            >
                                {submitting ? <><div className="spinner" style={{ width: '16px', height: '16px' }} /> Submitting...</> : '✅ Submit Test'}
                            </button>
                        )}
                    </div>

                    {error && <div className="alert alert-error" style={{ marginTop: '16px' }}>{error}</div>}
                </div>
            </div>
        </div>
    );
}
