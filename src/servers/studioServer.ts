import Server from "./server";
import {Router} from "express";
import userRoute from '../routes/userRoute';
import studioRoute from '../routes/studioRoute';
import { IServerOptions } from '../commons/interfaces';


class StudioServer extends Server {
    initialize = async (options: IServerOptions) => {
        this.options = options;

        this.setExpress(options);
        this.setFirebase();
        await StudioServer.setRDB();
    }

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
