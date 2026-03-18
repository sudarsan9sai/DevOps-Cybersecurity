import { useState } from 'react';

const mockNotifications = [
    { id: 'notif_003', type: 'SIP_REMINDER', title: 'SIP Reminder', body: 'Your SIP of ₹5,000 in Axis Bluechip Fund is due on April 5.', isRead: false, createdAt: '2025-03-18T09:00:00Z', icon: '📅' },
    { id: 'notif_005', type: 'PRICE_ALERT', title: 'Price Alert', body: 'ICICI Prudential Technology is approaching your target of ₹150.', isRead: false, createdAt: '2025-03-18T15:00:00Z', icon: '🔔' },
    { id: 'notif_004', type: 'NAV_UPDATE', title: 'NAV Update', body: 'ICICI Prudential Technology Fund NAV is ₹145.67, up 2.3% today.', isRead: false, createdAt: '2025-03-18T18:00:00Z', icon: '📊' },
    { id: 'notif_006', type: 'PAYMENT_STATUS', title: 'Payment Successful', body: 'Payment of ₹20,000 via UPI has been processed successfully.', isRead: false, createdAt: '2025-03-05T10:10:00Z', icon: '💳' },
    { id: 'notif_002', type: 'SIP_EXECUTED', title: 'SIP Executed', body: 'Your monthly SIP of ₹10,000 in Parag Parikh Flexi Cap Fund has been executed.', isRead: true, createdAt: '2025-03-01T10:30:00Z', icon: '✅' },
    { id: 'notif_001', type: 'ORDER_CONFIRMED', title: 'Order Confirmed', body: 'Your lumpsum order of ₹50,000 in Axis Bluechip Fund has been confirmed.', isRead: true, createdAt: '2025-01-15T10:10:00Z', icon: '📝' },
    { id: 'notif_007', type: 'KYC_UPDATE', title: 'KYC Approved', body: 'Your KYC verification has been approved. You can now invest!', isRead: true, createdAt: '2025-01-10T14:00:00Z', icon: '🎉' },
    { id: 'notif_008', type: 'GENERAL', title: 'Welcome to InvestWise!', body: "Start your investment journey with India's most trusted platform.", isRead: true, createdAt: '2025-01-10T10:00:00Z', icon: '🚀' },
];

const typeColors: Record<string, string> = {
    SIP_REMINDER: 'border-l-accent-amber', PRICE_ALERT: 'border-l-accent-purple', NAV_UPDATE: 'border-l-accent-blue',
    PAYMENT_STATUS: 'border-l-accent-green', SIP_EXECUTED: 'border-l-brand-500', ORDER_CONFIRMED: 'border-l-brand-500',
    KYC_UPDATE: 'border-l-accent-green', GENERAL: 'border-l-gray-500',
};

function timeAgo(dateStr: string): string {
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    const days = Math.floor(hrs / 24);
    if (days < 30) return `${days}d ago`;
    return new Date(dateStr).toLocaleDateString('en-IN');
}

export default function NotificationsPage() {
    const [notifications, setNotifications] = useState(mockNotifications);
    const [filter, setFilter] = useState('all');

    const unreadCount = notifications.filter((n) => !n.isRead).length;

    const filtered = filter === 'unread'
        ? notifications.filter((n) => !n.isRead)
        : notifications;

    const markRead = (id: string) => {
        setNotifications((prev) => prev.map((n) => n.id === id ? { ...n, isRead: true } : n));
    };

    const markAllRead = () => {
        setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    };

    return (
        <div className="space-y-6 max-w-3xl mx-auto">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-white">Notifications</h1>
                    <p className="text-gray-400 text-sm mt-1">{unreadCount} unread</p>
                </div>
                {unreadCount > 0 && (
                    <button onClick={markAllRead} className="btn-secondary text-sm">
                        ✓ Mark all as read
                    </button>
                )}
            </div>

            {/* Filters */}
            <div className="flex gap-2">
                {[
                    { key: 'all', label: 'All' },
                    { key: 'unread', label: `Unread (${unreadCount})` },
                ].map((f) => (
                    <button
                        key={f.key}
                        onClick={() => setFilter(f.key)}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${filter === f.key ? 'bg-brand-500/20 text-brand-400' : 'bg-surface-card/50 text-gray-400 hover:text-white'
                            }`}
                    >
                        {f.label}
                    </button>
                ))}
            </div>

            {/* Notification List */}
            <div className="space-y-2">
                {filtered.map((notif) => (
                    <div
                        key={notif.id}
                        onClick={() => markRead(notif.id)}
                        className={`glass-card p-4 border-l-4 ${typeColors[notif.type] || 'border-l-gray-500'} cursor-pointer transition-all hover:bg-surface-hover/30
              ${!notif.isRead ? 'bg-brand-500/[0.03]' : ''}`}
                    >
                        <div className="flex items-start gap-3">
                            <span className="text-xl mt-0.5">{notif.icon}</span>
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2">
                                    <h4 className={`text-sm font-semibold ${notif.isRead ? 'text-gray-300' : 'text-white'}`}>
                                        {notif.title}
                                    </h4>
                                    {!notif.isRead && <div className="w-2 h-2 rounded-full bg-brand-500" />}
                                </div>
                                <p className="text-sm text-gray-400 mt-1">{notif.body}</p>
                                <p className="text-xs text-gray-600 mt-2">{timeAgo(notif.createdAt)}</p>
                            </div>
                        </div>
                    </div>
                ))}

                {filtered.length === 0 && (
                    <div className="text-center py-12">
                        <p className="text-4xl mb-3">🔔</p>
                        <p className="text-gray-400">No notifications to show</p>
                    </div>
                )}
            </div>
        </div>
    );
}
