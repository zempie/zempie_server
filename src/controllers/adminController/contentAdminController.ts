import { IAdmin } from '../_interfaces';
import { dbs } from '../../commons/globals';
import NotifyService from '../../services/notifyService';
import Opt from '../../../config/opt'
const { Url, Deploy } = Opt;


class ContentAdminController {
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


    async notify({ title, body }: any, admin: IAdmin) {
        const topic = 'test-topic';
        const data = {
            title,
            body,
        }
        await NotifyService.send({ topic, data });
    }
}

export default new ContentAdminController()
