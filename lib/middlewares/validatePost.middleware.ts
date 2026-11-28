import { RequestHandler, Request, Response, NextFunction } from 'express';
 
export const validatePost: RequestHandler = (request: Request, response: Response, next: NextFunction) => {
   const { title, text, image } = request.body;
   const errors: string[] = [];
 
   if (typeof title !== 'string' || title.trim().length < 3 || title.trim().length > 100) {
      errors.push('Pole title jest wymagane i musi mieć od 3 do 100 znaków.');
   }
   if (typeof text !== 'string' || text.trim().length === 0) {
      errors.push('Pole text jest wymagane.');
   }
   if (typeof image !== 'string' || !/^https?:\/\/.+/.test(image)) {
      errors.push('Pole image musi być poprawnym adresem URL.');
   }
 
   if (errors.length > 0) {
      return response.status(400).json({ errors });
   } 
   next();
};
