import { Router, Request, Response } from 'express';
import { authGuard, AuthRequest } from '../../common/authGuard';
import * as watchlistService from './watchlist.service';

export const watchlistRouter = Router();
watchlistRouter.use(authGuard as any);

// GET /api/watchlist
watchlistRouter.get('/', async (req: AuthRequest, res: Response) => {
    try {
        const items = await watchlistService.getWatchlist(req.userId!);
        res.json({ success: true, data: items });
    } catch (err: any) {
        res.status(err.statusCode || 500).json({ success: false, error: { message: err.message } });
    }
});

// POST /api/watchlist
watchlistRouter.post('/', async (req: AuthRequest, res: Response) => {
    try {
        const result = await watchlistService.addToWatchlist(req.userId!, req.body);
        res.status(201).json({ success: true, data: result });
    } catch (err: any) {
        res.status(err.statusCode || 500).json({ success: false, error: { message: err.message } });
    }
});

// DELETE /api/watchlist/:id
watchlistRouter.delete('/:id', async (req: AuthRequest, res: Response) => {
    try {
        const result = await watchlistService.removeFromWatchlist(req.userId!, req.params.id);
        res.json({ success: true, data: result });
    } catch (err: any) {
        res.status(err.statusCode || 500).json({ success: false, error: { message: err.message } });
    }
});

// POST /api/watchlist/alerts
watchlistRouter.post('/alerts', async (req: AuthRequest, res: Response) => {
    try {
        const result = await watchlistService.createPriceAlert(req.userId!, req.body);
        res.status(201).json({ success: true, data: result });
    } catch (err: any) {
        res.status(err.statusCode || 500).json({ success: false, error: { message: err.message } });
    }
});

// GET /api/watchlist/alerts
watchlistRouter.get('/alerts', async (req: AuthRequest, res: Response) => {
    try {
        const alerts = await watchlistService.getAlerts(req.userId!);
        res.json({ success: true, data: alerts });
    } catch (err: any) {
        res.status(err.statusCode || 500).json({ success: false, error: { message: err.message } });
    }
});

// ── Discover routes (public) ────────────────────

export const discoverRouter = Router();

// GET /api/discover/search
discoverRouter.get('/search', async (req: Request, res: Response) => {
    try {
        const query = req.query.q as string;
        if (!query) return res.status(400).json({ success: false, error: { message: 'Search query "q" is required' } });
        const results = await watchlistService.searchAssets(query);
        res.json({ success: true, data: results });
    } catch (err: any) {
        res.status(err.statusCode || 500).json({ success: false, error: { message: err.message } });
    }
});

// GET /api/discover/trending
discoverRouter.get('/trending', async (_req: Request, res: Response) => {
    try {
        const result = await watchlistService.getTrending();
        res.json({ success: true, data: result });
    } catch (err: any) {
        res.status(err.statusCode || 500).json({ success: false, error: { message: err.message } });
    }
});
