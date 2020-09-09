import { IAdmin } from '../_interfaces';
import { dbs } from '../../commons/globals';
import NotifyService from '../../services/notifyService';
import Opt from '../../../config/opt'
import { CreateError, ErrorCodes } from '../../commons/errorCodes';
import { signJWT, verifyPassword } from '../../commons/utils';
import { Transaction } from 'sequelize';
const { Url, Deploy } = Opt;


class ContentAdminController {
    async login(params: any, admin: IAdmin) {
        const { id: name, password } = params;
        const record = await dbs.Admin.findOne({name});
        if (!record) {
            throw CreateError(ErrorCodes.INVALID_ADMIN_USERNAME);
        }

        if (!verifyPassword(password, record.password)) {
            throw CreateError(ErrorCodes.INVALID_ADMIN_PASSWORD);
        }

        const access_token = signJWT({
            name: record.name,
            level: record.level,
        }, '1d');
        const refresh_token = signJWT({
            id: record.id,
            name: record.name,
            level: record.level,
        }, '30d');

        await dbs.AdminRefreshToken.getTransaction(async (transaction: Transaction) => {
            let r = await dbs.AdminRefreshToken.findOne({admin_id: record.id}, transaction)
            if (r) {
                r.token = refresh_token
                await r.save({transaction})
            } else {
                r = await dbs.AdminRefreshToken.create({admin_id: record.id, token: refresh_token}, transaction)
            }
        })

        return {
            access_token,
            refresh_token,
        }
    }



    async logout(params: any, admin: IAdmin) {

    }


    async getAccessTokens(params: any, admin: IAdmin) {
        const { token } = params;
        const access_token = await dbs.AdminRefreshToken.refresh(token);
        return {
            access_token,
        }
    }


    async getProjects(params: any, admin: IAdmin) {

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
