// ── Circuit Breaker Pattern ─────────────────────
// Reliability: Prevent cascading failures from BSE StarMF / Razorpay outages
// States: CLOSED → OPEN → HALF_OPEN → CLOSED

export enum CircuitState {
    CLOSED = 'CLOSED',       // Normal operation
    OPEN = 'OPEN',           // Failures exceeded threshold, reject calls
    HALF_OPEN = 'HALF_OPEN', // Allow one probe request
}

export interface CircuitBreakerOptions {
    name: string;
    failureThreshold: number;    // Number of failures before opening
    resetTimeout: number;        // Ms before trying half-open
    monitorWindow: number;       // Ms window for counting failures
}

export class CircuitBreaker {
    private state: CircuitState = CircuitState.CLOSED;
    private failureCount = 0;
    private lastFailureTime = 0;
    private nextRetryTime = 0;
    private readonly options: CircuitBreakerOptions;

    constructor(options: CircuitBreakerOptions) {
        this.options = {
            failureThreshold: 5,
            resetTimeout: 30000, // 30s
            monitorWindow: 60000, // 1 min
            ...options,
        };
    }

    async execute<T>(fn: () => Promise<T>, fallback?: () => Promise<T>): Promise<T> {
        if (this.state === CircuitState.OPEN) {
            if (Date.now() >= this.nextRetryTime) {
                this.state = CircuitState.HALF_OPEN;
                console.log(`[CIRCUIT_BREAKER] ${this.options.name}: HALF_OPEN — probing`);
            } else {
                console.log(`[CIRCUIT_BREAKER] ${this.options.name}: OPEN — rejecting request`);
                if (fallback) return fallback();
                throw new Error(`Service "${this.options.name}" is temporarily unavailable. Please retry later.`);
            }
        }

        try {
            const result = await fn();
            this.onSuccess();
            return result;
        } catch (error) {
            this.onFailure();
            if (fallback) return fallback();
            throw error;
        }
    }

    private onSuccess() {
        if (this.state === CircuitState.HALF_OPEN) {
            console.log(`[CIRCUIT_BREAKER] ${this.options.name}: CLOSED — service recovered`);
        }
        this.state = CircuitState.CLOSED;
        this.failureCount = 0;
    }

    private onFailure() {
        this.failureCount++;
        this.lastFailureTime = Date.now();

        if (this.failureCount >= this.options.failureThreshold) {
            this.state = CircuitState.OPEN;
            this.nextRetryTime = Date.now() + this.options.resetTimeout;
            console.log(
                `[CIRCUIT_BREAKER] ${this.options.name}: OPEN — ${this.failureCount} failures, retry at ${new Date(this.nextRetryTime).toISOString()}`
            );
        }
    }

    getState(): { name: string; state: CircuitState; failureCount: number } {
        return {
            name: this.options.name,
            state: this.state,
            failureCount: this.failureCount,
        };
    }
}

// ── Pre-configured circuit breakers ─────────────

export const bseStarMFBreaker = new CircuitBreaker({
    name: 'BSE-StarMF',
    failureThreshold: 3,
    resetTimeout: 30000,
    monitorWindow: 60000,
});

export const razorpayBreaker = new CircuitBreaker({
    name: 'Razorpay',
    failureThreshold: 3,
    resetTimeout: 20000,
    monitorWindow: 60000,
});

export const digiLockerBreaker = new CircuitBreaker({
    name: 'DigiLocker',
    failureThreshold: 5,
    resetTimeout: 60000,
    monitorWindow: 120000,
});
