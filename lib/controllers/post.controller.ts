import { Router, type Request, type Response } from 'express';
import mongoose from 'mongoose';
import type Controller from '../interfaces/controller.interface';
import { checkPostCount } from '../middlewares/checkPostCount.middleware';
import type { IData } from '../modules/models/data.model';
import DataService from '../modules/services/data.service';

class PostController implements Controller {
    public path = '/api/post';
    public router = Router();
    private readonly dataService = new DataService();

    constructor() {
        this.initializeRoutes();
    }

    private initializeRoutes(): void {
        this.router.get(`${this.path}/latest`, this.getAll);
        this.router.get(`${this.path}/:id`, this.getById);
        this.router.get('/api/posts', this.getAll);
        this.router.post(this.path, this.addData);
        this.router.post(`${this.path}/:num`, checkPostCount, this.getPostByNum);
        this.router.delete(`${this.path}/:id`, this.deleteById);
        this.router.delete('/api/posts', this.deleteAll);
    }

    private getAll = async (_request: Request, response: Response): Promise<void> => {
        try {
            const posts = await this.dataService.query({});
            response.status(200).json(posts);
        } catch (error) {
            this.respondWithServerError(response, error);
        }
    };

    private getById = async (request: Request<{ id: string }>, response: Response): Promise<void> => {
        const { id } = request.params;
        if (!mongoose.isObjectIdOrHexString(id)) {
            response.status(400).json({ error: 'Invalid post id' });
            return;
        }

        try {
            const post = await this.dataService.getById(id);
            if (!post) {
                response.status(404).json({ error: 'Post not found' });
                return;
            }
            response.status(200).json(post);
        } catch (error) {
            this.respondWithServerError(response, error);
        }
    };

    private addData = async (request: Request<Record<string, never>, unknown, IData>, response: Response): Promise<void> => {
        const { title, text, image } = request.body ?? {};
        if (typeof title !== 'string' || typeof text !== 'string' || typeof image !== 'string') {
            response.status(400).json({ error: 'title, text, and image must be strings' });
            return;
        }

        try {
            const post = await this.dataService.createPost({ title, text, image });
            response.status(200).json(post);
        } catch (error) {
            if (error instanceof mongoose.Error.ValidationError) {
                response.status(400).json({ error: 'Invalid post data' });
                return;
            }
            this.respondWithServerError(response, error);
        }
    };

    private getPostByNum = async (request: Request<{ num: string }>, response: Response): Promise<void> => {
        const index = Number(request.params.num);
        try {
            const posts = await this.dataService.query({});
            if (index >= posts.length) {
                response.status(404).json({ error: 'Post not found' });
                return;
            }
            response.status(200).json(posts[index]);
        } catch (error) {
            this.respondWithServerError(response, error);
        }
    };

    private deleteById = async (request: Request<{ id: string }>, response: Response): Promise<void> => {
        const { id } = request.params;
        if (!mongoose.isObjectIdOrHexString(id)) {
            response.status(400).json({ error: 'Invalid post id' });
            return;
        }

        try {
            const result = await this.dataService.deleteById(id);
            if (result.deletedCount === 0) {
                response.status(404).json({ error: 'Post not found' });
                return;
            }
            response.sendStatus(200);
        } catch (error) {
            this.respondWithServerError(response, error);
        }
    };

    private deleteAll = async (_request: Request, response: Response): Promise<void> => {
        try {
            await this.dataService.deleteAllPosts();
            response.sendStatus(200);
        } catch (error) {
            this.respondWithServerError(response, error);
        }
    };

    private respondWithServerError(response: Response, error: unknown): void {
        console.error('Post request failed:', error);
        response.status(500).json({ error: 'Internal server error' });
    }
}

export default PostController;
