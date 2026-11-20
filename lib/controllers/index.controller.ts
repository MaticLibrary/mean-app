import { Router, type NextFunction, type Request, type Response } from "express";
import path from "path";
import type Controller from "../interfaces/controller.interface";

class IndexController implements Controller {
    public path = "/*";
    public router = Router();

    constructor() {
        this.initializeRoutes();
    }

    private initializeRoutes(): void {
        this.router.get(this.path, this.serveIndex);
        this.router.get("*", this.serveIndex);
    }

    private serveIndex = (
        _request: Request,
        response: Response,
        next: NextFunction,
    ): void => {
        response.sendFile(path.resolve(__dirname, "../../public/index.html"), (error) => {
            if (error) {
                next(error);
            }
        });
    };
}

export default IndexController;
