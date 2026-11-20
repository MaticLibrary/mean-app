
import bodyParser from 'body-parser';
import morgan from 'morgan';
import express, { type Application } from 'express';
import type { Server } from 'http';
import type Controller from './interfaces/controller.interface';
import { config } from './config';

class App {
    public app: Application;

    constructor(controllers: Controller[]) {
        this.app = express();
        this.initializeMiddlewares();
        this.initializeControllers(controllers);
    }

    private initializeMiddlewares(): void {
        this.app.use(bodyParser.json());
        this.app.use(morgan('dev'));
    }

    private initializeControllers(controllers: Controller[]): void {
        for (const controller of controllers) {
            this.app.use('/', controller.router);
        }
    }

    public listen(): Server {
        return this.app.listen(config.port, () => {
            console.log(`App listening on the port ${config.port}`);
        });
    }
}

export default App;
