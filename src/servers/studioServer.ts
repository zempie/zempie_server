import Server from "./server";
import {Router} from "express";

class StudioServer extends Server {
    routes(app: Router) {
        super.routes(app);

        // adminRoute(app);
        // userRoute(app);
        // contentRoute(app);
        // gameRoute(app);
    }
}


export default StudioServer;