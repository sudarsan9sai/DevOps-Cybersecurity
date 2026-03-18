import { Router, Response } from 'express';
import { authGuard, AuthRequest } from '../../common/authGuard';
import * as authService from './auth.service';

export const kycRouter = Router();

// All KYC routes require authentication
kycRouter.use(authGuard as any);

// POST /api/kyc/verify-pan
kycRouter.post('/verify-pan', async (req: AuthRequest, res: Response) => {
    try {
        const { panNumber } = req.body;
        if (!panNumber) return res.status(400).json({ success: false, error: { message: 'PAN number is required' } });
        const result = await authService.verifyPan(req.userId!, panNumber.toUpperCase());
        res.json({ success: true, data: result });
    } catch (err: any) {
        res.status(err.statusCode || 500).json({ success: false, error: { message: err.message } });
    }
});

// POST /api/kyc/verify-aadhaar
kycRouter.post('/verify-aadhaar', async (req: AuthRequest, res: Response) => {
    try {
        const { aadhaarNumber } = req.body;
        if (!aadhaarNumber) return res.status(400).json({ success: false, error: { message: 'Aadhaar number is required' } });
        const result = await authService.verifyAadhaar(req.userId!, aadhaarNumber);
        res.json({ success: true, data: result });
    } catch (err: any) {
        res.status(err.statusCode || 500).json({ success: false, error: { message: err.message } });
    }
});

// POST /api/kyc/video-kyc
kycRouter.post('/video-kyc', async (req: AuthRequest, res: Response) => {
    try {
        const { videoUrl } = req.body;
        if (!videoUrl) return res.status(400).json({ success: false, error: { message: 'Video URL is required' } });
        const result = await authService.submitVideoKyc(req.userId!, videoUrl);
        res.json({ success: true, data: result });
    } catch (err: any) {
        res.status(err.statusCode || 500).json({ success: false, error: { message: err.message } });
    }
});

// GET /api/kyc/status
kycRouter.get('/status', async (req: AuthRequest, res: Response) => {
    try {
        const result = await authService.getKycStatus(req.userId!);
        res.json({ success: true, data: result });
    } catch (err: any) {
        res.status(err.statusCode || 500).json({ success: false, error: { message: err.message } });
    }
});
