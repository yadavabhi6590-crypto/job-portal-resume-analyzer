import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useUser, useClerk } from '@clerk/clerk-react';
import { useMongoUser } from '../context/UserContext';
import './Sidebar.css';

const navItems = [
    { to: '/dashboard', icon: '🏠', label: 'Dashboard' },
    { to: '/upload', icon: '📄', label: 'Resume Upload' },
    { to: '/analysis', icon: '📊', label: 'Analysis Result' },
    { to: '/roles', icon: '💼', label: 'Role Selection' },
    { to: '/ranking', icon: '🏆', label: 'Rankings' },
    { to: '/profile', icon: '👤', label: 'Profile' },
    { to: '/admin', icon: '⚙️', label: 'Admin Panel', adminOnly: true },
];

export default function Sidebar() {
    const { user: clerkUser } = useUser();
    const { signOut } = useClerk();
    const { mongoUser, isAdmin } = useMongoUser();
    const navigate = useNavigate();
    const location = useLocation();

    const filteredNavItems = navItems.filter(item => !item.adminOnly || isAdmin);

    const handleSignOut = async () => {
        await signOut();
        navigate('/sign-in');
    };

    if (!clerkUser) return null;

    const displayAvatar = mongoUser?.profilePicture || clerkUser.imageUrl;
    const displayName = mongoUser?.fullName || clerkUser.fullName;

    return (
        <aside className="sidebar">
            <div className="sidebar-brand">
                <div className="brand-icon">JP</div>
                <div className="brand-details">
                    <div className="brand-name">Job Portal</div>
                    <div className="brand-tagline">AI-Powered ATS</div>
                </div>
            </div>

            <nav className="sidebar-nav">
                <div className="nav-section-label">MAIN MENU</div>
                {filteredNavItems.map(item => (
                    <Link
                        key={item.to}
                        to={item.to}
                        className={`nav-item ${location.pathname === item.to ? 'active' : ''}`}
                    >
                        <span className="nav-icon">{item.icon}</span>
                        <span className="nav-label">{item.label}</span>
                    </Link>
                ))}
            </nav>

            <div className="sidebar-footer">
                <div className="user-info">
                    <img src={displayAvatar} alt="Avatar" className="user-avatar" />
                    <div className="user-details">
                        <p className="user-name">{displayName}</p>
                        <p className="user-email">{clerkUser.primaryEmailAddress.emailAddress}</p>
                    </div>
                </div>
                <button onClick={handleSignOut} className="sign-out-btn">
                    <span>🚪</span> Sign Out
                </button>
            </div>
        </aside>
    );
}
