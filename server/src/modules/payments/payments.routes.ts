import { Router, Response } from 'express';
import { authGuard, AuthRequest } from '../../common/authGuard';
import * as paymentsService from './payments.service';

export const paymentsRouter = Router();
paymentsRouter.use(authGuard as any);

// POST /api/payments/initiate
paymentsRouter.post('/initiate', async (req: AuthRequest, res: Response) => {
    try {
        const { amount, method, orderId } = req.body;
        if (!amount || !method) return res.status(400).json({ success: false, error: { message: 'amount and method required' } });
        const result = await paymentsService.initiatePayment(req.userId!, { amount: Number(amount), method, orderId });
        res.status(201).json({ success: true, data: result });
    } catch (err: any) {
        res.status(err.statusCode || 500).json({ success: false, error: { message: err.message } });
    }
});

// POST /api/payments/verify
paymentsRouter.post('/verify', async (req: AuthRequest, res: Response) => {
    try {
        const result = await paymentsService.verifyPayment(req.userId!, req.body);
        res.json({ success: true, data: result });
    } catch (err: any) {
        res.status(err.statusCode || 500).json({ success: false, error: { message: err.message } });
    }
});

// GET /api/payments/history
paymentsRouter.get('/history', async (req: AuthRequest, res: Response) => {
    try {
        const page = parseInt(req.query.page as string) || 1;
        const result = await paymentsService.getPaymentHistory(req.userId!, page);
        res.json({ success: true, data: result });
    } catch (err: any) {
        res.status(err.statusCode || 500).json({ success: false, error: { message: err.message } });
    }
});

// POST /api/payments/bank-account
paymentsRouter.post('/bank-account', async (req: AuthRequest, res: Response) => {
    try {
        const result = await paymentsService.linkBankAccount(req.userId!, req.body);
        res.status(201).json({ success: true, data: result });
    } catch (err: any) {
        res.status(err.statusCode || 500).json({ success: false, error: { message: err.message } });
    }
});

// GET /api/payments/bank-accounts
paymentsRouter.get('/bank-accounts', async (req: AuthRequest, res: Response) => {
    try {
        const result = await paymentsService.getBankAccounts(req.userId!);
        res.json({ success: true, data: result });
    } catch (err: any) {
        res.status(err.statusCode || 500).json({ success: false, error: { message: err.message } });
    }
});
