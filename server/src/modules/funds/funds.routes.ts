import { Router, Request, Response } from 'express';
import { authGuard, AuthRequest } from '../../common/authGuard';
import * as fundsService from './funds.service';

export const fundsRouter = Router();

// GET /api/funds — Browse funds
fundsRouter.get('/', async (req: Request, res: Response) => {
    try {
        const result = await fundsService.browseFunds({
            category: req.query.category as string,
            riskLevel: req.query.riskLevel as string,
            fundHouse: req.query.fundHouse as string,
            search: req.query.search as string,
            sortBy: req.query.sortBy as string,
            sortOrder: req.query.sortOrder as string,
            page: req.query.page ? parseInt(req.query.page as string) : undefined,
            limit: req.query.limit ? parseInt(req.query.limit as string) : undefined,
        });
        res.json({ success: true, data: result });
    } catch (err: any) {
        res.status(err.statusCode || 500).json({ success: false, error: { message: err.message } });
    }
});

// GET /api/funds/orders — User orders (auth required)
fundsRouter.get('/orders', authGuard as any, async (req: AuthRequest, res: Response) => {
    try {
        const result = await fundsService.getUserOrders(req.userId!, req.query.status as string);
        res.json({ success: true, data: result });
    } catch (err: any) {
        res.status(err.statusCode || 500).json({ success: false, error: { message: err.message } });
    }
});

// GET /api/funds/sip — User SIPs (auth required)
fundsRouter.get('/sip', authGuard as any, async (req: AuthRequest, res: Response) => {
    try {
        const result = await fundsService.getUserSips(req.userId!);
        res.json({ success: true, data: result });
    } catch (err: any) {
        res.status(err.statusCode || 500).json({ success: false, error: { message: err.message } });
    }
});

// GET /api/funds/:id — Fund detail
fundsRouter.get('/:id', async (req: Request, res: Response) => {
    try {
        const result = await fundsService.getFundDetail(req.params.id);
        res.json({ success: true, data: result });
    } catch (err: any) {
        res.status(err.statusCode || 500).json({ success: false, error: { message: err.message } });
    }
});

// POST /api/funds/sip — Create SIP
fundsRouter.post('/sip', authGuard as any, async (req: AuthRequest, res: Response) => {
    try {
        const { fundId, amount, sipDate, startDate, endDate } = req.body;
        if (!fundId || !amount || !sipDate || !startDate) {
            return res.status(400).json({ success: false, error: { message: 'fundId, amount, sipDate, startDate are required' } });
        }
        const result = await fundsService.createSip(req.userId!, { fundId, amount: Number(amount), sipDate: Number(sipDate), startDate, endDate });
        res.status(201).json({ success: true, data: result });
    } catch (err: any) {
        res.status(err.statusCode || 500).json({ success: false, error: { message: err.message } });
    }
});

// PUT /api/funds/sip/:id — Modify SIP
fundsRouter.put('/sip/:id', authGuard as any, async (req: AuthRequest, res: Response) => {
    try {
        const result = await fundsService.modifySip(req.userId!, req.params.id, req.body);
        res.json({ success: true, data: result });
    } catch (err: any) {
        res.status(err.statusCode || 500).json({ success: false, error: { message: err.message } });
    }
});

// DELETE /api/funds/sip/:id — Cancel SIP
fundsRouter.delete('/sip/:id', authGuard as any, async (req: AuthRequest, res: Response) => {
    try {
        const result = await fundsService.cancelSip(req.userId!, req.params.id);
        res.json({ success: true, data: result });
    } catch (err: any) {
        res.status(err.statusCode || 500).json({ success: false, error: { message: err.message } });
    }
});

// POST /api/funds/purchase — Lumpsum purchase
fundsRouter.post('/purchase', authGuard as any, async (req: AuthRequest, res: Response) => {
    try {
        const { fundId, amount } = req.body;
        if (!fundId || !amount) {
            return res.status(400).json({ success: false, error: { message: 'fundId and amount are required' } });
        }
        const result = await fundsService.lumpsumPurchase(req.userId!, { fundId, amount: Number(amount) });
        res.status(201).json({ success: true, data: result });
    } catch (err: any) {
        res.status(err.statusCode || 500).json({ success: false, error: { message: err.message } });
    }
});
