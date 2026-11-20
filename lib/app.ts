import mongoose from 'mongoose';
import bodyParser from 'body-parser';
import express, { type Application } from 'express';
import type { Server } from 'http';
import type Controller from './interfaces/controller.interface';
import { config } from './config';
import { requestLogger } from './middlewares/requestLogger.middleware';

class App {
    public app: Application;
    private server?: Server;

    constructor(controllers: Controller[]) {
        this.app = express();
        this.initializeMiddlewares();
        this.initializeControllers(controllers);
    }

    private initializeMiddlewares(): void {
        this.app.use(requestLogger);
        this.app.use(bodyParser.json());
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

    public async start(): Promise<Server> {
        await this.connectToDatabase();
        this.server = this.listen();
        process.once('SIGINT', () => { void this.shutdown(); });
        process.once('SIGTERM', () => { void this.shutdown(); });
        return this.server;
    }

    private async connectToDatabase(): Promise<void> {
        mongoose.connection.on('error', (error) => {
            console.error('MongoDB connection error:', error);
        });
        mongoose.connection.on('disconnected', () => {
            console.log('MongoDB disconnected');
        });

        try {
            await mongoose.connect(config.databaseUrl);
            console.log('Connection with database established');
        } catch (error) {
            console.error('Error connecting to MongoDB:', error);
            throw error;
        }
    }

    private async shutdown(): Promise<void> {
        try {
            if (this.server) {
                await new Promise<void>((resolve, reject) => {
                    this.server?.close((error) => error ? reject(error) : resolve());
                });
            }
            await mongoose.disconnect();
            console.log('MongoDB connection closed due to app termination');
        } catch (error) {
            console.error('Error shutting down the application:', error);
            process.exitCode = 1;
        }
    }
}

export default App;
