import { IAdmin, IGame } from './_interfaces';
import { dbs } from '../commons/globals';
import { Transaction, Op } from 'sequelize';
import { signJWT } from '../commons/utils';
import { CreateError, ErrorCodes } from '../commons/errorCodes';
import { v4 as uuid } from 'uuid';

class AdminController {
    async getProjects(params: any, admin: IAdmin) {

    }


    async getAccessTokens(params: any, admin: IAdmin) {

    }

    async getGames(params: any, admin: IAdmin) {
        const api_key = '5b94uen0k99mxn4t';
        const response = await fetch(`http://localhost:8288/api/v1/games?key=${api_key}`);
        if( response.status === 200 ) {
            const json = await response.json();
            return json.data
        }
        throw new Error(response.statusText);
    }

}

export default new AdminController()