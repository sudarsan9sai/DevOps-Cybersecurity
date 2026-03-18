// ── In-Memory Cache with TTL ────────────────────
// Performance: Portfolio cached, refreshed every 15 min during market hours
// Production: Replace with Redis via ElastiCache

interface CacheEntry<T> {
    data: T;
    expiresAt: number;
    createdAt: number;
}

class AppCache {
    private store = new Map<string, CacheEntry<any>>();

    /**
     * Get cached value. Returns null if expired or missing.
     */
    get<T>(key: string): T | null {
        const entry = this.store.get(key);
        if (!entry) return null;

        if (Date.now() > entry.expiresAt) {
            this.store.delete(key);
            return null;
        }

        return entry.data as T;
    }

    /**
     * Set value with TTL in seconds.
     */
    set<T>(key: string, data: T, ttlSeconds: number): void {
        this.store.set(key, {
            data,
            expiresAt: Date.now() + ttlSeconds * 1000,
            createdAt: Date.now(),
        });
    }

    /**
     * Delete a specific key.
     */
    delete(key: string): boolean {
        return this.store.delete(key);
    }

    /**
     * Invalidate all keys matching a prefix.
     */
    invalidatePrefix(prefix: string): number {
        let count = 0;
        for (const key of this.store.keys()) {
            if (key.startsWith(prefix)) {
                this.store.delete(key);
                count++;
            }
        }
        return count;
    }

    /**
     * Get cache stats.
     */
    stats(): { size: number; keys: string[] } {
        return { size: this.store.size, keys: Array.from(this.store.keys()) };
    }

    /**
     * Cleanup expired entries.
     */
    cleanup(): number {
        let cleaned = 0;
        const now = Date.now();
        for (const [key, entry] of this.store) {
            if (now > entry.expiresAt) {
                this.store.delete(key);
                cleaned++;
            }
        }
        return cleaned;
    }
}

export const cache = new AppCache();

// ── Market Hours Helper ─────────────────────────
// IST: 9:15 AM to 3:30 PM, Mon-Fri

export function isMarketHours(): boolean {
    const now = new Date();
    // Convert to IST (UTC+5:30)
    const istOffset = 5.5 * 60 * 60 * 1000;
    const ist = new Date(now.getTime() + istOffset + now.getTimezoneOffset() * 60 * 1000);

    const day = ist.getDay();
    if (day === 0 || day === 6) return false; // Weekend

    const hours = ist.getHours();
    const minutes = ist.getMinutes();
    const totalMinutes = hours * 60 + minutes;

    return totalMinutes >= 9 * 60 + 15 && totalMinutes <= 15 * 60 + 30;
}

/**
 * Get cache TTL based on market hours.
 * During market hours: 15 minutes (for live data)
 * After hours: 1 hour (data doesn't change)
 */
export function getPortfolioCacheTTL(): number {
    return isMarketHours() ? 15 * 60 : 60 * 60; // seconds
}

// Periodic cleanup every 10 minutes
setInterval(() => cache.cleanup(), 10 * 60 * 1000);
