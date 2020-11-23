import * as _ from 'lodash';
import { v4 as uuid } from 'uuid';
import { Transaction } from 'sequelize';
import { IAdmin, INoticeParams } from '../_interfaces';
import { dbs } from '../../commons/globals';
import NotifyService from '../../services/notifyService';
import { CreateError, ErrorCodes } from '../../commons/errorCodes';
import { makePassword, signJWT, verifyPassword } from '../../commons/utils';
import { EAdminTask } from '../../database/mysql/models/admin/adminLog';
import Opt from '../../../config/opt'
import { EBan } from '../../database/mysql/models/user/user';
const { Url, Deploy } = Opt;


class ContentAdminController {

    /**
     *
     * @param params
     * @param admin
     */
    async getProjects(params: any, admin: IAdmin) {

    }



    /**
     * 게임
     */
    // async getGames(params: any, admin: IAdmin) {
    //     const response = await fetch(`${Url.DeployApiV1}/games?key=${Deploy.api_key}`);
    //     if( response.status === 200 ) {
    //         const json = await response.json();
    //         return json.data
    //     }
    //     throw new Error(response.statusText);
    // }
    async getGames({ limit = 50, offset = 0 }) {
        const { count, rows } = await dbs.Games.findAndCountAll({}, {
            include: [{
                model: dbs.Developer.model,
            }],
            limit: _.toNumber(limit),
            offset: _.toNumber(offset),
        });
        return {
            count,
            games: _.map(rows, (row) => {
                return {
                    ...row
                }
            })
        }
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
