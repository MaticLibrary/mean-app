import type { ErrorRequestHandler } from 'express';
import mongoose from 'mongoose';

export const errorHandler: ErrorRequestHandler = (error, request, response, _next) => {
   console.error(`[${new Date().toISOString()}] ${request.method} ${request.url}:`, error);

   if (error instanceof mongoose.Error.ValidationError) {
      response.status(400).json({ error: error.message });
      return;
   }

   if (
      typeof error === 'object' &&
      error !== null &&
      'code' in error &&
      error.code === 11000
   ) {
      response.status(409).json({ error: 'Tytuł posta musi być unikalny.' });
      return;
   }

   const status =
      typeof error === 'object' &&
      error !== null &&
      'status' in error &&
      typeof error.status === 'number'
         ? error.status
         : 500;

   response.status(status).json({
      error: status === 500 ? 'Wewnętrzny błąd serwera.' : error instanceof Error ? error.message : 'Błąd żądania.'
   });
};

