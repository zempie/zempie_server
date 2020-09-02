import Server from "./server";
import {Router} from "express";
import userRoute from '../routes/userRoute';
import studioRoute from '../routes/studioRoute';

class StudioServer extends Server {
    routes(app: Router) {
        super.routes(app);

        // adminRoute(app);
        userRoute(app);
        studioRoute(app);
        // contentRoute(app);
        // gameRoute(app);
    }
}


export default StudioServer;