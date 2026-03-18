import { Router, Response } from 'express';
import { authGuard, AuthRequest } from '../../common/authGuard';
import * as portfolioService from './portfolio.service';

export const portfolioRouter = Router();
portfolioRouter.use(authGuard as any);

// GET /api/portfolio/holdings
portfolioRouter.get('/holdings', async (req: AuthRequest, res: Response) => {
    try {
        const holdings = await portfolioService.getHoldings(req.userId!);
        res.json({ success: true, data: holdings });
    } catch (err: any) {
        res.status(err.statusCode || 500).json({ success: false, error: { message: err.message } });
    }
});

// GET /api/portfolio/summary
portfolioRouter.get('/summary', async (req: AuthRequest, res: Response) => {
    try {
        const summary = await portfolioService.getPortfolioSummary(req.userId!);
        res.json({ success: true, data: summary });
    } catch (err: any) {
        res.status(err.statusCode || 500).json({ success: false, error: { message: err.message } });
    }
});

// GET /api/portfolio/allocation
portfolioRouter.get('/allocation', async (req: AuthRequest, res: Response) => {
    try {
        const allocation = await portfolioService.getAssetAllocation(req.userId!);
        res.json({ success: true, data: allocation });
    } catch (err: any) {
        res.status(err.statusCode || 500).json({ success: false, error: { message: err.message } });
    }
});

// GET /api/portfolio/transactions
portfolioRouter.get('/transactions', async (req: AuthRequest, res: Response) => {
    try {
        const page = parseInt(req.query.page as string) || 1;
        const limit = parseInt(req.query.limit as string) || 20;
        const result = await portfolioService.getTransactions(req.userId!, page, limit);
        res.json({ success: true, data: result });
    } catch (err: any) {
        res.status(err.statusCode || 500).json({ success: false, error: { message: err.message } });
    }
});
