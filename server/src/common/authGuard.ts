import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { createError } from './errorHandler';

export interface AuthRequest extends Request {
    userId?: string;
    userMobile?: string;
}

const JWT_SECRET = process.env.JWT_SECRET || 'investwise-dev-secret-key-change-in-production';

export function authGuard(req: AuthRequest, _res: Response, next: NextFunction) {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return next(createError('Authentication required', 401));
    }

    const token = authHeader.split(' ')[1];

    try {
        const decoded = jwt.verify(token, JWT_SECRET) as { userId: string; mobile: string };
        req.userId = decoded.userId;
        req.userMobile = decoded.mobile;
        next();
    } catch {
        next(createError('Invalid or expired token', 401));
    }
}

export function generateTokens(userId: string, mobile: string) {
    const accessToken = jwt.sign({ userId, mobile }, JWT_SECRET, { expiresIn: '15m' });
    const refreshToken = jwt.sign(
        { userId, mobile, type: 'refresh' },
        process.env.JWT_REFRESH_SECRET || 'investwise-dev-refresh-secret',
        { expiresIn: '7d' }
    );
    return { accessToken, refreshToken };
}
