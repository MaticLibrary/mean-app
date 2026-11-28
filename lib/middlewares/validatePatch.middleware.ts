import type { RequestHandler } from 'express';

const editableFields = ['title', 'text', 'image'] as const;

export const validatePatch: RequestHandler = (request, response, next) => {
   const body: unknown = request.body;

   if (body === null || typeof body !== 'object' || Array.isArray(body)) {
      response.status(400).json({ error: 'Body musi być obiektem JSON.' });
      return;
   }

   const fields = Object.keys(body);
   if (fields.length === 0) {
      response.status(400).json({ error: 'Podaj co najmniej jedno pole do zmiany.' });
      return;
   }

   const unknownFields = fields.filter((field) => !editableFields.includes(field as typeof editableFields[number]));
   if (unknownFields.length > 0) {
      response.status(400).json({ error: `Nieznane pola: ${unknownFields.join(', ')}` });
      return;
   }

   const values = body as Record<string, unknown>;
   const errors: string[] = [];

   if (Object.prototype.hasOwnProperty.call(values, 'title')) {
      const title = values.title;
      if (typeof title !== 'string' || title.trim().length < 3 || title.trim().length > 100) {
         errors.push('Pole title musi mieć od 3 do 100 znaków.');
      }
   }

   if (Object.prototype.hasOwnProperty.call(values, 'text')) {
      const text = values.text;
      if (typeof text !== 'string' || text.trim().length === 0) {
         errors.push('Pole text nie może być puste.');
      }
   }

   if (Object.prototype.hasOwnProperty.call(values, 'image')) {
      const image = values.image;
      if (typeof image !== 'string' || !/^https?:\/\/.+/.test(image.trim())) {
         errors.push('Pole image musi być poprawnym adresem URL.');
      }
   }

   if (errors.length > 0) {
      response.status(400).json({ errors });
      return;
   }

   next();
};