const User = require('../models/User');

/**
 * Middleware to require Admin role.
 * Must be used after requireAuth middleware.
 */
const requireAdmin = async (req, res, next) => {
    try {
        const user = await User.findOne({ clerkId: req.userId });
        if (!user || user.role !== 'Admin') {
            return res.status(403).json({ error: 'Forbidden: Admins only' });
        }
        req.user = user;
        next();
    } catch (err) {
        return res.status(500).json({ error: 'Server error checking admin status' });
    }
};

module.exports = { requireAdmin };
