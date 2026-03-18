import { v4 as uuid } from 'uuid';

// ── Notification Data ───────────────────────────

export interface Notification {
    id: string;
    userId: string;
    type: string;
    channel: string;
    title: string;
    body: string;
    data?: string;
    isRead: boolean;
    createdAt: string;
}

export interface NotificationPreference {
    userId: string;
    pushEnabled: boolean;
    smsEnabled: boolean;
    emailEnabled: boolean;
    sipReminders: boolean;
    orderUpdates: boolean;
    priceAlerts: boolean;
    navUpdates: boolean;
    promotional: boolean;
}

export const notifications: Notification[] = [
    { id: 'notif_001', userId: 'usr_demo_001', type: 'ORDER_CONFIRMED', channel: 'IN_APP', title: 'Order Confirmed', body: 'Your lumpsum order of ₹50,000 in Axis Bluechip Fund has been confirmed.', isRead: true, createdAt: '2025-01-15T10:10:00Z' },
    { id: 'notif_002', userId: 'usr_demo_001', type: 'SIP_EXECUTED', channel: 'IN_APP', title: 'SIP Executed', body: 'Your monthly SIP of ₹10,000 in Parag Parikh Flexi Cap Fund has been executed.', isRead: true, createdAt: '2025-03-01T10:30:00Z' },
    { id: 'notif_003', userId: 'usr_demo_001', type: 'SIP_REMINDER', channel: 'IN_APP', title: 'SIP Reminder', body: 'Your SIP of ₹5,000 in Axis Bluechip Fund is due on April 5.', isRead: false, createdAt: '2025-03-18T09:00:00Z' },
    { id: 'notif_004', userId: 'usr_demo_001', type: 'NAV_UPDATE', channel: 'IN_APP', title: 'NAV Update', body: 'ICICI Prudential Technology Fund NAV is ₹145.67, up 2.3% today.', isRead: false, createdAt: '2025-03-18T18:00:00Z' },
    { id: 'notif_005', userId: 'usr_demo_001', type: 'PRICE_ALERT', channel: 'IN_APP', title: 'Price Alert', body: 'ICICI Prudential Technology is approaching your target of ₹150.', isRead: false, createdAt: '2025-03-18T15:00:00Z' },
    { id: 'notif_006', userId: 'usr_demo_001', type: 'PAYMENT_STATUS', channel: 'IN_APP', title: 'Payment Successful', body: 'Payment of ₹20,000 via UPI has been processed successfully.', isRead: false, createdAt: '2025-03-05T10:10:00Z' },
    { id: 'notif_007', userId: 'usr_demo_001', type: 'KYC_UPDATE', channel: 'IN_APP', title: 'KYC Approved', body: 'Your KYC verification has been approved. You can now invest!', isRead: true, createdAt: '2025-01-10T14:00:00Z' },
    { id: 'notif_008', userId: 'usr_demo_001', type: 'GENERAL', channel: 'IN_APP', title: 'Welcome to InvestWise!', body: 'Start your investment journey with India\'s most trusted platform.', isRead: true, createdAt: '2025-01-10T10:00:00Z' },
];

export const notifPreferences = new Map<string, NotificationPreference>();
notifPreferences.set('usr_demo_001', {
    userId: 'usr_demo_001',
    pushEnabled: true, smsEnabled: true, emailEnabled: true,
    sipReminders: true, orderUpdates: true, priceAlerts: true,
    navUpdates: false, promotional: false,
});

// ── Service ─────────────────────────────────────

export async function getNotifications(userId: string, page = 1, limit = 20) {
    const userNotifs = notifications
        .filter((n) => n.userId === userId)
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    const unreadCount = userNotifs.filter((n) => !n.isRead).length;
    const total = userNotifs.length;
    const paginated = userNotifs.slice((page - 1) * limit, page * limit);

    return { notifications: paginated, unreadCount, pagination: { page, limit, total, totalPages: Math.ceil(total / limit) } };
}

export async function markAsRead(userId: string, notifId: string) {
    const notif = notifications.find((n) => n.id === notifId && n.userId === userId);
    if (!notif) throw { statusCode: 404, message: 'Notification not found' };
    notif.isRead = true;
    return { message: 'Marked as read' };
}

export async function markAllAsRead(userId: string) {
    notifications.filter((n) => n.userId === userId && !n.isRead).forEach((n) => { n.isRead = true; });
    return { message: 'All notifications marked as read' };
}

export async function getPreferences(userId: string) {
    return notifPreferences.get(userId) || {
        userId, pushEnabled: true, smsEnabled: true, emailEnabled: true,
        sipReminders: true, orderUpdates: true, priceAlerts: true,
        navUpdates: false, promotional: false,
    };
}

export async function updatePreferences(userId: string, prefs: Partial<NotificationPreference>) {
    const current = await getPreferences(userId);
    const updated = { ...current, ...prefs, userId };
    notifPreferences.set(userId, updated);
    return updated;
}

// ── Notification Dispatch (Mock) ────────────────

export async function sendNotification(userId: string, data: { type: string; title: string; body: string; channel?: string }) {
    const prefs = await getPreferences(userId);

    const notif: Notification = {
        id: `notif_${uuid().slice(0, 8)}`,
        userId,
        type: data.type,
        channel: data.channel || 'IN_APP',
        title: data.title,
        body: data.body,
        isRead: false,
        createdAt: new Date().toISOString(),
    };

    notifications.push(notif);

    // Mock multi-channel dispatch
    if (prefs.pushEnabled) console.log(`[FCM] Push sent to ${userId}: ${data.title}`);
    if (prefs.smsEnabled) console.log(`[Twilio] SMS sent to ${userId}: ${data.title}`);
    if (prefs.emailEnabled) console.log(`[SendGrid] Email sent to ${userId}: ${data.title}`);

    return notif;
}
