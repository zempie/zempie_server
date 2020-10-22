import { Router } from 'express'
import Server from './server'
import adminRoute from '../routes/adminRoute'
import contentRoute from '../routes/contentRoute';
import userRoute from '../routes/userRoute';
import gameRoute from "../routes/gameRoute";
import ExchangeManager from '../services/exchangeManager';
import launcherRoute from '../routes/launcherRoute';

class ApiServer extends Server {
    private timer: any;

    routes(app: Router) {
        super.routes(app);

        adminRoute(app);
        userRoute(app);
        contentRoute(app);
        gameRoute(app);
        launcherRoute(app);

        // scheduleService.start()
        // ExchangeManager.start()
    }

    protected beforeStart = async (): Promise<any> => {
        // await this.updateGameList();
    }

}


export default ApiServer;

