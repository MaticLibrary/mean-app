import { Router, type Request, type Response, type NextFunction } from 'express';
import type Controller from '../interfaces/controller.interface';
import { checkPostCount } from '../middlewares/checkPostCount.middleware';
import type { IData } from '../modules/models/data.model';
import DataService from '../modules/services/data.service';
import { checkObjectId } from '../middlewares/checkObjectId.middleware';
import { validatePost } from '../middlewares/validatePost.middleware';
import { validatePatch } from '../middlewares/validatePatch.middleware';

class PostController implements Controller {
    public path = '/api/post';
    public router = Router();
    private readonly dataService = new DataService();

    constructor() {
        this.initializeRoutes();
    }

    private initializeRoutes(): void {
        this.router.get(`${this.path}/page`, this.getPaginated);
        this.router.get(`${this.path}/search`, this.searchPosts);
        this.router.get(`${this.path}/stats`, this.getStats);
        this.router.get(`${this.path}/latest`, this.getAll);
        this.router.get('/api/posts', this.getAll);
        this.router.get(`${this.path}/:id`, checkObjectId, this.getElementById);
        this.router.post(`${this.path}/:num`, checkPostCount, this.getPostByNum);
        this.router.post(`${this.path}`, validatePost, this.addData);
        this.router.put(`${this.path}/:id`, checkObjectId, validatePost, this.updatePost);
        this.router.patch(`${this.path}/:id`, checkObjectId, validatePatch, this.updatePost);
        this.router.delete('/api/posts', this.deleteAll);
        this.router.delete(`${this.path}/:id`, checkObjectId, this.removePost);
    }

    private getAll = async (_request: Request, response: Response, next: NextFunction): Promise<void> => {
        try {
            const posts = await this.dataService.query({});
            response.status(200).json(posts);
        } catch (error) {
            next(error);
        }
    };

    private getElementById = async (
        request: Request<{ id: string }>,
        response: Response,
        next: NextFunction
    ): Promise<void> => {
        const { id } = request.params;
        try {
            const post = await this.dataService.getById(id);
            if (!post) {
                response.status(404).json({ error: 'Post not found' });
                return;
            }
            response.status(200).json(post);
        } catch (error) {
            next(error);
        }
    };

    private addData = async (
        request: Request<Record<string, never>, unknown, IData>,
        response: Response,
        next: NextFunction
    ): Promise<void> => {
        const { title, text, image } = request.body ?? {};
        if (typeof title !== 'string' || typeof text !== 'string' || typeof image !== 'string') {
            response.status(400).json({ error: 'title, text, and image must be strings' });
            return;
        }

        try {
            const post = await this.dataService.createPost({ title, text, image });
            response.status(200).json(post);
        } catch (error) {
            next(error);
        }
    };

    private getPostByNum = async (
        request: Request<{ num: string }>,
        response: Response,
        next: NextFunction
    ): Promise<void> => {
        const index = Number(request.params.num);
        try {
            const posts = await this.dataService.query({});
            if (index >= posts.length) {
                response.status(404).json({ error: 'Post not found' });
                return;
            }
            response.status(200).json(posts[index]);
        } catch (error) {
            next(error);
        }
    };

    private removePost = async (
        request: Request<{ id: string }>,
        response: Response,
        next: NextFunction
    ): Promise<void> => {
        const { id } = request.params;
        try {
            const result = await this.dataService.deleteById(id);
            if (result.deletedCount === 0) {
                response.status(404).json({ error: 'Post not found' });
                return;
            }
            response.sendStatus(200);
        } catch (error) {
            next(error);
        }
    };

    private deleteAll = async (
        _request: Request,
        response: Response,
        next: NextFunction
    ): Promise<void> => {
        try {
            await this.dataService.deleteAllPosts();
            response.sendStatus(200);
        } catch (error) {
            next(error);
        }
    };

    private getPaginated = async (request: Request, response: Response, next: NextFunction): Promise<void> => {
        const page = Math.max(parseInt(request.query.page as string, 10) || 1, 1);
        const limit = Math.min(parseInt(request.query.limit as string, 10) || 5, 50);
        const sort = request.query.sort as string;
        const sortField = ['title', 'createdAt'].includes(sort) ? sort : 'createdAt';
        const sortOrder = request.query.order === 'asc' ? 1 : -1;

        try {
            const result = await this.dataService.getPaginated(page, limit, sortField, sortOrder);
            response.status(200).json(result);
        } catch (error) {
            next(error);
        }
    };

    private searchPosts = async (request: Request, response: Response, next: NextFunction): Promise<void> => {
        const phrase = ((request.query.q as string) || '').trim();

        if (phrase.length < 2) {
            response.status(400).json({ error: 'Fraza musi mieć co najmniej 2 znaki.' });
            return;
        }

        try {
            const result = await this.dataService.search(phrase);
            response.status(200).json(result);
        } catch (error) {
            next(error);
        }
    };

    private getStats = async (_request: Request, response: Response, next: NextFunction): Promise<void> => {
        try {
            const result = await this.dataService.getStats();
            response.status(200).json(result);
        } catch (error) {
            next(error);
        }
    };

    private updatePost = async (
        request: Request<{ id: string }, unknown, Partial<IData>>,
        response: Response,
        next: NextFunction
    ): Promise<void> => {
        try {
            const updated = await this.dataService.updateById(request.params.id, request.body);

            if (!updated) {
                response.status(404).json({ error: 'Nie znaleziono posta.' });
                return;
            }
            response.status(200).json(updated);
        } catch (error) {
            next(error);
        }
    };
}

export default PostController;
