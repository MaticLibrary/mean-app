import type { RequestHandler } from 'express';

export const requestLogger: RequestHandler = (request, _response, next) => {
    console.log(`[${request.method} ${request.url} ${new Date().toISOString()}]`);
    next();
};
