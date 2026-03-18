import { Request, Response, NextFunction } from 'express';

export interface AppError extends Error {
    statusCode: number;
    isOperational: boolean;
}

export function createError(message: string, statusCode: number): AppError {
    const error = new Error(message) as AppError;
    error.statusCode = statusCode;
    error.isOperational = true;
    return error;
}

export function errorHandler(err: AppError, _req: Request, res: Response, _next: NextFunction) {
    const statusCode = err.statusCode || 500;
    const message = err.isOperational ? err.message : 'Internal server error';

    console.error(`[ERROR] ${statusCode} - ${err.message}`);

    res.status(statusCode).json({
        success: false,
        error: {
            message,
            ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
        },
    });
}
