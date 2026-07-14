const { clerkClient } = require('@clerk/clerk-sdk-node');

/**
 * Middleware to verify Clerk JWT and attach user info to request
 */
const requireAuth = async (req, res, next) => {
    try {
        let token = req.headers.authorization?.split(' ')[1];

        // Also check query parameter for file downloads (browser requests)
        if (!token && req.query.token) {
            token = req.query.token;
        }

        if (!token) {
            return res.status(401).json({ error: 'Unauthorized: No token provided' });
        }

        const payload = await clerkClient.verifyToken(token);
        req.userId = payload.sub; // Clerk user ID
        next();
    } catch (err) {
        return res.status(401).json({ error: 'Unauthorized: Invalid token' });
    }
};

module.exports = { requireAuth };
