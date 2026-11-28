import { RequestHandler, Request, Response, NextFunction } from 'express';
import { isObjectIdOrHexString } from 'mongoose';
 
export const checkObjectId: RequestHandler = (request: Request, response: Response, next: NextFunction) => {
   const { id } = request.params;
 
   if (!isObjectIdOrHexString(id)) {
      return response.status(400).json({ error: 'Niepoprawny identyfikator!' });
   }
 
   next();
};

    