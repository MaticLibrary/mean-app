import type { RequestHandler } from 'express';
import { config } from '../config';

export const checkPostCount: RequestHandler<{ num: string }> = (request, response, next) => {
    const { num } = request.params;
    if (!/^[1-9]\d*$/.test(num)) {
        response.status(400).send('Brak lub niepoprawna wartość!');
        return;
    }

    const parsedValue = Number(num);
    if (!Number.isSafeInteger(parsedValue) || parsedValue >= config.supportedPostCount) {
        response.status(400).send('Brak lub niepoprawna wartość!');
        return;
    }

    next();
};
