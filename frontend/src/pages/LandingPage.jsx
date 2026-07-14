import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './LandingPage.css';

/* ── Animated Counter ─────────────────────────────────────────────────── */
function Counter({ end, suffix = '', duration = 2000 }) {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  const started = useRef(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !started.current) {
          started.current = true;
          let start = 0;
          const step = end / (duration / 16);
          const timer = setInterval(() => {
            start += step;
            if (start >= end) { setCount(end); clearInterval(timer); }
            else setCount(Math.floor(start));
          }, 16);
        }
      },
      { threshold: 0.3 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [end, duration]);

  return <span ref={ref}>{count.toLocaleString()}{suffix}</span>;
}

/* ── Floating Particle ────────────────────────────────────────────────── */
function Particles() {
  return (
    <div className="lp-particles" aria-hidden="true">
      {Array.from({ length: 20 }).map((_, i) => (
        <span key={i} className="lp-particle" style={{
          '--x': `${Math.random() * 100}%`,
          '--y': `${Math.random() * 100}%`,
          '--size': `${Math.random() * 4 + 2}px`,
          '--delay': `${Math.random() * 8}s`,
          '--duration': `${Math.random() * 10 + 8}s`,
        }} />
      ))}
    </div>
  );
}

/* ── Feature Card ─────────────────────────────────────────────────────── */
function FeatureCard({ icon, title, desc, delay }) {
  return (
    <div className="lp-feature-card" style={{ animationDelay: delay }}>
      <div className="lp-feature-icon">{icon}</div>
      <h3>{title}</h3>
      <p>{desc}</p>
    </div>
  );
}

/* ── Step Card ────────────────────────────────────────────────────────── */
function StepCard({ num, title, desc, delay }) {
  return (
    <div className="lp-step-card" style={{ animationDelay: delay }}>
      <div className="lp-step-num">{num}</div>
      <h3>{title}</h3>
      <p>{desc}</p>
    </div>
  );
}

/* ── Testimonial Card ─────────────────────────────────────────────────── */
function TestimonialCard({ quote, name, role, avatar, delay }) {
  return (
    <div className="lp-testimonial-card" style={{ animationDelay: delay }}>
      <div className="lp-stars">{'★'.repeat(5)}</div>
      <p className="lp-quote">"{quote}"</p>
      <div className="lp-testimonial-author">
        <div className="lp-avatar">{avatar}</div>
        <div>
          <p className="lp-author-name">{name}</p>
          <p className="lp-author-role">{role}</p>
        </div>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════════════════
   MAIN LANDING PAGE
══════════════════════════════════════════════════════════════════════════ */
export default function LandingPage() {
  const navigate = useNavigate();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const scrollTo = (id) => {
    setMenuOpen(false);
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="lp-root">
      <Particles />

      {/* ── NAVBAR ──────────────────────────────────────────── */}
      <nav className={`lp-nav ${scrolled ? 'lp-nav--scrolled' : ''}`}>
        <div className="lp-nav-inner">
          <div className="lp-logo">
            <span className="lp-logo-icon">⚡</span>
            <span className="lp-logo-text">TalentAI</span>
          </div>

          <ul className={`lp-nav-links ${menuOpen ? 'lp-nav-links--open' : ''}`}>
            {['features', 'how-it-works', 'stats', 'testimonials'].map(id => (
              <li key={id}>
                <button onClick={() => scrollTo(id)}>
                  {id.replace('-', ' ').replace(/\b\w/g, c => c.toUpperCase())}
                </button>
              </li>
            ))}
          </ul>

          <div className="lp-nav-actions">
            <button className="lp-btn lp-btn--ghost" onClick={() => navigate('/sign-in')}>
              Sign In
            </button>
            <button className="lp-btn lp-btn--primary" onClick={() => navigate('/sign-up')}>
              Get Started Free
            </button>
          </div>

          <button className="lp-hamburger" onClick={() => setMenuOpen(o => !o)} aria-label="Menu">
            <span /><span /><span />
          </button>
        </div>
      </nav>

      {/* ── HERO ────────────────────────────────────────────── */}
      <section className="lp-hero">
        <div className="lp-hero-glow lp-hero-glow--left" />
        <div className="lp-hero-glow lp-hero-glow--right" />

        <div className="lp-hero-content">
          <div className="lp-hero-badge animate-lp-1">
            <span>🚀</span>
            <span>AI-Powered Job Matching Platform</span>
          </div>

          <h1 className="lp-hero-title animate-lp-2">
            Land Your Dream Job
            <br />
            <span className="lp-gradient-text">10× Faster with AI</span>
          </h1>

          <p className="lp-hero-subtitle animate-lp-3">
            Upload your resume and let our AI instantly analyze skills, match you to top
            roles, score your fit, and guide you with personalized career insights.
          </p>

          <div className="lp-hero-ctas animate-lp-4">
            <button className="lp-btn lp-btn--primary lp-btn--xl" onClick={() => navigate('/sign-up')}>
              <span>Start Analyzing Free</span>
              <span className="lp-btn-arrow">→</span>
            </button>
            <button className="lp-btn lp-btn--outline lp-btn--xl" onClick={() => scrollTo('how-it-works')}>
              <span>▶</span>
              <span>See How It Works</span>
            </button>
          </div>

          <div className="lp-hero-trust animate-lp-5">
            <div className="lp-avatars">
              {['👨‍💻','👩‍💼','👨‍🔬','👩‍🎨','👨‍🏫'].map((e, i) => (
                <div key={i} className="lp-trust-avatar" style={{ zIndex: 5 - i }}>{e}</div>
              ))}
            </div>
            <p><strong>12,000+</strong> professionals hired this month</p>
          </div>
        </div>

        {/* Floating Dashboard Preview */}
        <div className="lp-hero-visual animate-lp-5">
          <div className="lp-dashboard-preview">
            <div className="lp-dp-header">
              <div className="lp-dp-dots">
                <span style={{ background: '#ff5f56' }} />
                <span style={{ background: '#ffbd2e' }} />
                <span style={{ background: '#27c93f' }} />
              </div>
              <span className="lp-dp-title">Resume Analysis</span>
            </div>
            <div className="lp-dp-body">
              <div className="lp-dp-score">
                <div className="lp-dp-ring">
                  <svg viewBox="0 0 80 80">
                    <circle cx="40" cy="40" r="32" className="lp-dp-ring-bg" />
                    <circle cx="40" cy="40" r="32" className="lp-dp-ring-fg"
                      strokeDasharray="201" strokeDashoffset="40" />
                  </svg>
                  <div className="lp-dp-ring-label">87%</div>
                </div>
                <p>Match Score</p>
              </div>
              <div className="lp-dp-skills">
                {[
                  { name: 'React.js', pct: 92 },
                  { name: 'Node.js', pct: 78 },
                  { name: 'Python',  pct: 85 },
                  { name: 'AWS',     pct: 60 },
                ].map(s => (
                  <div key={s.name} className="lp-dp-skill">
                    <div className="lp-dp-skill-top">
                      <span>{s.name}</span>
                      <span>{s.pct}%</span>
                    </div>
                    <div className="lp-dp-bar">
                      <div className="lp-dp-bar-fill" style={{ width: `${s.pct}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
            {/* Floating badge */}
            <div className="lp-dp-badge lp-dp-badge--green">
              ✓ &nbsp;Top 5% Match
            </div>
            <div className="lp-dp-badge lp-dp-badge--purple">
              🧠 &nbsp;AI Scored
            </div>
          </div>
        </div>
      </section>

      {/* ── STATS ───────────────────────────────────────────── */}
      <section className="lp-stats" id="stats">
        <div className="lp-container">
          {[
            { end: 50000, suffix: '+', label: 'Resumes Analyzed' },
            { end: 12000, suffix: '+', label: 'Hires This Month' },
            { end: 98,    suffix: '%', label: 'Satisfaction Rate' },
            { end: 3,     suffix: 'x', label: 'Faster Job Placement' },
          ].map((s, i) => (
            <div key={i} className="lp-stat-item">
              <div className="lp-stat-value">
                <Counter end={s.end} suffix={s.suffix} />
              </div>
              <div className="lp-stat-label">{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── FEATURES ────────────────────────────────────────── */}
      <section className="lp-section" id="features">
        <div className="lp-container">
          <div className="lp-section-header">
            <span className="lp-tag">✦ Features</span>
            <h2>Everything You Need to <span className="lp-gradient-text">Get Hired</span></h2>
            <p>Our AI-powered platform handles the heavy lifting so you can focus on landing the role.</p>
          </div>

          <div className="lp-features-grid">
            <FeatureCard delay="0s"   icon="🤖" title="AI Resume Scoring"     desc="Get an instant ATS-compatibility score and detailed skill analysis within seconds of uploading." />
            <FeatureCard delay=".08s" icon="🎯" title="Smart Job Matching"    desc="Our algorithm matches your profile to thousands of live openings based on skills, experience, and preference." />
            <FeatureCard delay=".16s" icon="📊" title="Skill Gap Analysis"    desc="See exactly which skills you're missing for your target role and get a custom learning roadmap." />
            <FeatureCard delay=".24s" icon="🏆" title="Competitive Ranking"   desc="Know where you stand among candidates and get tips to jump to the top of recruiter lists." />
            <FeatureCard delay=".32s" icon="📝" title="Knowledge Tests"       desc="Role-specific assessments that prove your expertise and boost your profile visibility to employers." />
            <FeatureCard delay=".4s"  icon="📈" title="Real-time Dashboard"   desc="Track applications, monitor your ranking, and watch your profile score improve in real time." />
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ────────────────────────────────────── */}
      <section className="lp-section lp-section--alt" id="how-it-works">
        <div className="lp-container">
          <div className="lp-section-header">
            <span className="lp-tag">✦ Process</span>
            <h2>From Resume to Offer in <span className="lp-gradient-text">4 Steps</span></h2>
            <p>Simple, fast, and powerful. Start in minutes.</p>
          </div>

          <div className="lp-steps-grid">
            <StepCard delay="0s"    num="01" title="Create Account" desc="Sign up free in 30 seconds — no credit card needed. Your journey starts now." />
            <StepCard delay=".1s"   num="02" title="Upload Resume"  desc="Drop your PDF or DOCX. Our AI extracts and understands your full experience instantly." />
            <StepCard delay=".2s"   num="03" title="Get AI Analysis" desc="Receive a detailed report: match score, missing skills, strengths, and top job roles for you." />
            <StepCard delay=".3s"   num="04" title="Apply & Get Hired" desc="Apply to matched jobs with one click. Land interviews faster with your optimized profile." />
          </div>

          <div className="lp-steps-cta">
            <button className="lp-btn lp-btn--primary lp-btn--xl" onClick={() => navigate('/sign-up')}>
              Start My Free Analysis
            </button>
          </div>
        </div>
      </section>

      {/* ── TESTIMONIALS ────────────────────────────────────── */}
      <section className="lp-section" id="testimonials">
        <div className="lp-container">
          <div className="lp-section-header">
            <span className="lp-tag">✦ Testimonials</span>
            <h2>Trusted by <span className="lp-gradient-text">Thousands</span></h2>
            <p>Real success stories from real professionals.</p>
          </div>

          <div className="lp-testimonials-grid">
            <TestimonialCard delay="0s"   avatar="👩‍💻" name="Priya Sharma"   role="Software Engineer @ Google"    quote="Got 3 interview calls in my first week. The AI analysis was spot-on about my skill gaps." />
            <TestimonialCard delay=".1s"  avatar="👨‍💼" name="Arjun Mehta"   role="Product Manager @ Flipkart"    quote="The job matching is incredible. It showed me roles I hadn't even considered but was a perfect fit for." />
            <TestimonialCard delay=".2s"  avatar="👩‍🎨" name="Neha Kapoor"   role="UX Designer @ Swiggy"          quote="My resume score jumped from 54% to 91% after following the AI suggestions. Life-changing platform!" />
          </div>
        </div>
      </section>

      {/* ── CTA BANNER ──────────────────────────────────────── */}
      <section className="lp-cta-banner">
        <div className="lp-cta-glow" />
        <div className="lp-container lp-cta-inner">
          <h2>Ready to <span className="lp-gradient-text">Accelerate</span> Your Career?</h2>
          <p>Join 50,000+ professionals who landed their dream jobs with TalentAI.</p>
          <div className="lp-cta-actions">
            <button className="lp-btn lp-btn--primary lp-btn--xl" onClick={() => navigate('/sign-up')}>
              Create Free Account
              <span className="lp-btn-arrow">→</span>
            </button>
            <button className="lp-btn lp-btn--ghost-light" onClick={() => navigate('/sign-in')}>
              Already have an account? Sign In
            </button>
          </div>
        </div>
      </section>

      {/* ── FOOTER ──────────────────────────────────────────── */}
      <footer className="lp-footer">
        <div className="lp-container lp-footer-inner">
          <div className="lp-logo">
            <span className="lp-logo-icon">⚡</span>
            <span className="lp-logo-text">TalentAI</span>
          </div>
          <p className="lp-footer-copy">© {new Date().getFullYear()} TalentAI. All rights reserved.</p>
          <div className="lp-footer-links">
            <button onClick={() => navigate('/sign-in')}>Sign In</button>
            <button onClick={() => navigate('/sign-up')}>Sign Up</button>
          </div>
        </div>
      </footer>
    </div>
  );
}
