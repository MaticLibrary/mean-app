import App from "./app";
import PostController from './controllers/post.controller';
import IndexController from "./controllers/index.controller";

const app = new App([new PostController(), new IndexController()]);
void app.start().catch((error: unknown) => {
    console.error('Failed to start application:', error);
    process.exitCode = 1;
});
