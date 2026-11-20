import { Router, type Request, type Response } from 'express';
import type Controller from '../interfaces/controller.interface';

type AddPostBody = { elem?: unknown; element?: unknown };

let testArr = [4, 5, 6, 3, 5, 3, 7, 5, 13, 5, 6, 4, 3, 6, 3, 6];

class PostController implements Controller {
    public path = '/api/post';
    public router = Router();

    constructor() {
        this.initializeRoutes();
    }

    private initializeRoutes(): void {
        this.router.get(`${this.path}/latest`, this.getAll);
        this.router.get(`${this.path}/:id`, this.getById);
        this.router.get('/api/posts', this.getPosts);
        this.router.post(this.path, this.addData);
        this.router.post(`${this.path}/:id`, this.addData);
        this.router.delete(`${this.path}/:id`, this.deleteById);
        this.router.delete('/api/posts', this.deleteAll);
    }

    private getAll = (_request: Request, response: Response): void => {
        response.status(200).json(testArr);
    };

    private getById = (request: Request<{ id: string }>, response: Response): void => {
        const id = this.parseNonNegativeInteger(request.params.id);
        if (id === null) {
            response.status(400).json({ error: 'id must be a non-negative integer' });
            return;
        }

        if (id >= testArr.length) {
            response.status(404).json({ error: 'Post not found' });
            return;
        }

        response.status(200).json(testArr[id]);
    };

    private getPosts = (request: Request, response: Response): void => {
        const limitQuery = request.query.limit;
        if (limitQuery === undefined) {
            response.status(200).json(testArr);
            return;
        }

        if (typeof limitQuery !== 'string') {
            response.status(400).json({ error: 'limit must be a non-negative integer' });
            return;
        }

        const limit = this.parseNonNegativeInteger(limitQuery);
        if (limit === null) {
            response.status(400).json({ error: 'limit must be a non-negative integer' });
            return;
        }

        response.status(200).json(testArr.slice(0, limit));
    };

    private addData = (
        request: Request<Record<string, string>, unknown, AddPostBody>,
        response: Response,
    ): void => {
        const value = request.body?.elem ?? request.body?.element;
        if (typeof value !== 'number' || !Number.isFinite(value)) {
            response.status(400).json({ error: 'Request body must contain a numeric elem or element' });
            return;
        }

        testArr.push(value);
        response.status(200).json(testArr);
    };

    private deleteById = (request: Request<{ id: string }>, response: Response): void => {
        const id = this.parseNonNegativeInteger(request.params.id);
        if (id === null) {
            response.status(400).json({ error: 'id must be a non-negative integer' });
            return;
        }

        if (id >= testArr.length) {
            response.status(404).json({ error: 'Post not found' });
            return;
        }

        testArr.splice(id, 1);
        response.status(200).json(testArr);
    };

    private deleteAll = (_request: Request, response: Response): void => {
        testArr = [];
        response.status(200).json(testArr);
    };

    private parseNonNegativeInteger(value: string): number | null {
        if (!/^\d+$/.test(value)) {
            return null;
        }

        const parsed = Number(value);
        return Number.isSafeInteger(parsed) ? parsed : null;
    }
}

export default PostController;
