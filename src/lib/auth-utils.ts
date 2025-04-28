import jwt from 'jsonwebtoken';

export const getCurrentUser = () => {
    try {
        const token = localStorage.getItem('authToken');
        if (!token) return null;
        
        const decoded = jwt.decode(token);
        if (!decoded) return null;
        
        return {
            id: decoded.userId,
            email: decoded.email,
            username: decoded.username,
            healthData: decoded.healthData
        };
    } catch (error) {
        console.error('Error decoding token:', error);
        return null;
    }
};