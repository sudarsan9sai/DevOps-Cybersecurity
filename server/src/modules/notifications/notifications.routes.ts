import { Router, Response } from 'express';
import { authGuard, AuthRequest } from '../../common/authGuard';
import * as notifService from './notifications.service';

export const notificationsRouter = Router();
notificationsRouter.use(authGuard as any);

// GET /api/notifications
notificationsRouter.get('/', async (req: AuthRequest, res: Response) => {
    try {
        const page = parseInt(req.query.page as string) || 1;
        const result = await notifService.getNotifications(req.userId!, page);
        res.json({ success: true, data: result });
    } catch (err: any) {
        res.status(err.statusCode || 500).json({ success: false, error: { message: err.message } });
    }
});

// PUT /api/notifications/:id/read
notificationsRouter.put('/:id/read', async (req: AuthRequest, res: Response) => {
    try {
        const result = await notifService.markAsRead(req.userId!, req.params.id);
        res.json({ success: true, data: result });
    } catch (err: any) {
        res.status(err.statusCode || 500).json({ success: false, error: { message: err.message } });
    }
});

// PUT /api/notifications/read-all
notificationsRouter.put('/read-all', async (req: AuthRequest, res: Response) => {
    try {
        const result = await notifService.markAllAsRead(req.userId!);
        res.json({ success: true, data: result });
    } catch (err: any) {
        res.status(err.statusCode || 500).json({ success: false, error: { message: err.message } });
    }
});

// GET /api/notifications/preferences
notificationsRouter.get('/preferences', async (req: AuthRequest, res: Response) => {
    try {
        const result = await notifService.getPreferences(req.userId!);
        res.json({ success: true, data: result });
    } catch (err: any) {
        res.status(err.statusCode || 500).json({ success: false, error: { message: err.message } });
    }
});

// PUT /api/notifications/preferences
notificationsRouter.put('/preferences', async (req: AuthRequest, res: Response) => {
    try {
        const result = await notifService.updatePreferences(req.userId!, req.body);
        res.json({ success: true, data: result });
    } catch (err: any) {
        res.status(err.statusCode || 500).json({ success: false, error: { message: err.message } });
    }
});
