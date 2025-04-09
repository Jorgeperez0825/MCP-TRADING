import { Request, Response, NextFunction } from 'express';
import { SERVER_CONFIG } from '../config/server';
import { AppError } from './error-handler';

export const validateRequest = (req: Request, res: Response, next: NextFunction) => {
  const { body, method, path } = req;

  // Validate request body for POST/PUT requests
  if (['POST', 'PUT'].includes(method) && Object.keys(body).length === 0) {
    return res.status(400).json(SERVER_CONFIG.errorResponses.validation);
  }

  // Validate required parameters based on endpoint
  if (path.includes('/api/quote') && !body.symbol) {
    return res.status(400).json({
      ...SERVER_CONFIG.errorResponses.validation,
      message: 'Symbol is required'
    });
  }

  // Validate request body if present
  if (body && Object.keys(body).length > 0) {
    if (typeof body !== 'object') {
      throw new AppError('Invalid request body', 400);
    }
  }

  // Validate query parameters if present
  if (req.query && Object.keys(req.query).length > 0) {
    for (const [key, value] of Object.entries(req.query)) {
      if (typeof value !== 'string' && typeof value !== 'undefined') {
        throw new AppError(`Invalid query parameter: ${key}`, 400);
      }
    }
  }

  next();
}; 