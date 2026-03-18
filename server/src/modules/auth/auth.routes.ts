import { Router, Request, Response, NextFunction } from 'express';
import { authGuard, AuthRequest } from '../../common/authGuard';
import * as authService from './auth.service';

export const authRouter = Router();

// POST /api/auth/send-otp
authRouter.post('/send-otp', async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { mobile } = req.body;
        if (!mobile || !/^\+91\d{10}$/.test(mobile)) {
            return res.status(400).json({ success: false, error: { message: 'Valid Indian mobile required (+91XXXXXXXXXX)' } });
        }
        const result = await authService.sendOtp(mobile);
        res.json({ success: true, data: result });
    } catch (err: any) {
        res.status(err.statusCode || 500).json({ success: false, error: { message: err.message } });
    }
});

// POST /api/auth/verify-otp
authRouter.post('/verify-otp', async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { mobile, otp } = req.body;
        if (!mobile || !otp) {
            return res.status(400).json({ success: false, error: { message: 'Mobile and OTP are required' } });
        }
        const result = await authService.verifyOtp(mobile, otp);
        res.json({ success: true, data: result });
    } catch (err: any) {
        res.status(err.statusCode || 500).json({ success: false, error: { message: err.message } });
    }
});

// GET /api/auth/profile
authRouter.get('/profile', authGuard, async (req: AuthRequest, res: Response) => {
    try {
        const result = await authService.getUserProfile(req.userId!);
        res.json({ success: true, data: result });
    } catch (err: any) {
        res.status(err.statusCode || 500).json({ success: false, error: { message: err.message } });
    }
});
