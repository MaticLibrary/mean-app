import App from "./app";
import PostController from './controllers/post.controller';
import IndexController from "./controllers/index.controller";

const app = new App([new PostController(), new IndexController()]);
app.listen();
