import Server from './server'
import { Router } from 'express'
import adminRoute from '../routes/adminRoute'
import contentRoute from '../routes/contentRoute';
import userRoute from '../routes/userRoute';
import { service } from '../commons/globals';
import { fetchHelper } from '../services/fetchHelper';
import gameRoute from "../routes/gameRoute";
import scheduleService from "../services/scheduleService";

class ApiServer extends Server {
    private timer: any;

    routes(app: Router) {
        super.routes(app);

        adminRoute(app);
        userRoute(app);
        contentRoute(app);
        gameRoute(app);

        scheduleService.start()
    }

    protected beforeStart = async (): Promise<any> => {
        // await this.updateGameList();
    }

    private async updateGameList() {
        service.games = [];
        service.refresh_token = '';
        service.access_token = 'yJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwiZG9tYWluIjoiaHR0cDovL2xvY2FsaG9zdDo4Mjg4IiwiaWF0IjoxNTg3MTE5NzEzLCJleHAiOjE1ODc5ODM3MTMsImlzcyI6ImZyb20gdGhlIHJlZCJ9.IJVhGPgb_s22o7BybXO67iB0Lnsv9CgtFXIgLUf7woc';

        const handler = async () => {
            const response = await fetchHelper('http://localhost:8288/api/v1/games')
            const json = await response.json();
            service.games = json.data.games;
        }

        if( !this.timer ) {
            await handler();
        }
        else {
            this.timer = setInterval(handler, 1000 * 60 * 60);
        }
    }
}


export default ApiServer;

