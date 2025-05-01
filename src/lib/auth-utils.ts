import jwt, { JwtPayload } from 'jsonwebtoken';

// Define a custom JwtPayload interface to include specific properties
interface CustomJwtPayload extends JwtPayload {
    userId: string;
    email: string;
    username: string;
    healthData: any; // Replace with the actual type for healthData
}

export const getCurrentUser = () => {
    try {
        const token = localStorage.getItem('authToken');
        if (!token) return null;

        const decoded = jwt.decode(token) as CustomJwtPayload | null;
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
