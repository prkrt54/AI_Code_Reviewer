import { verifyToken } from '../services/auth.service.js';

export function authMiddleware(req, res, next) {
    try {
        const authHeader = req.headers.authorization;
        
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({ message: 'No token provided' });
        }

        const token = authHeader.substring(7); 
        const decoded = verifyToken(token);
        
        req.userId = decoded.userId;
        req.userEmail = decoded.email;
        
        next();
    } catch (error) {
        return res.status(401).json({ message: error.message });
    }
}
