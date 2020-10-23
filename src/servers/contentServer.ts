import { Router } from 'express';
import Server from './server';
import contentRoute from '../routes/contentRoute';


class ContentServer extends Server {
    protected routes(app: Router) {
        super.routes(app);

        contentRoute(app);
    }
}


export default ContentServer
