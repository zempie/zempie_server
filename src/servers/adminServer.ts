import Server from "./server";
import {Router} from "express";
import adminRoute from '../routes/adminRoute';

class AdminServer extends Server {
    routes(app: Router) {
        super.routes(app);

        adminRoute(app);
    }
}


export default AdminServer;
