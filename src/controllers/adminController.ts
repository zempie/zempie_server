import { IAdmin, IGame } from './_interfaces';
import { dbs } from '../commons/globals';
import Opt from '../../config/opt'
const { Url, Deploy } = Opt;
import firebase_admin from 'firebase-admin';

class AdminController {
    async getProjects(params: any, admin: IAdmin) {

    }


    async getAccessTokens(params: any, admin: IAdmin) {

    }


    async getUsers(params: any, admin: IAdmin) {
        const users = await dbs.User.getAllProfiles({});
        return {
            users
        }
    }


    async getGames(params: any, admin: IAdmin) {
        const response = await fetch(`${Url.DeployApiV1}/games?key=${Deploy.api_key}`);
        if( response.status === 200 ) {
            const json = await response.json();
            return json.data
        }
        throw new Error(response.statusText);
    }


    async notify(params: any, admin: IAdmin) {
        try {
            await firebase_admin.messaging().sendToTopic('test-topic', {
                data: {
                    v1: 'v111',
                    v2: 'v222',
                },
                notification: {
                    badge: '1',
                    color: 'red',
                }
            }, {})
        }
        catch ( e ) {
            console.error(e);
        }
    }
}

export default new AdminController()