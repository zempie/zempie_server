import { IAdmin } from '../_interfaces';
import { dbs } from '../../commons/globals';
import * as _ from 'lodash';
import { EBan } from '../../database/mysql/models/user/user';


/**
 * 사용자
 */

class AdminUserController {
    async getUsers({ limit = 50, offset = 0, sort = 'id', dir = 'asc' }, admin: IAdmin) {
        const { count, rows } = await dbs.User.getProfileAll({ limit, offset, sort, dir });
        return {
            count,
            users: _.map(rows, (record: any) => record.get({plain: true}))
        }
    }

    async getUserProfile({ id, sort = 'id', dir = 'asc' }: any, admin: IAdmin) {
        const user = await dbs.UserProfile.findAndCountAll({ user_id: id }, {
            order: [[sort, dir]],
        });
        return {
            user: user.get({ plain: true })
        }
    }

    async banUser({ id, activated, banned, reason, period }: any, admin: IAdmin) {
        const user = await dbs.User.getInfo({ user_id: id });
        if ( activated ) user.activated = activated;
        if ( banned && reason && period && Object.values(EBan).includes(banned) ) {
            user.banned = banned;
            await dbs.UserBan.create({
                user_id: id,
                admin_id: admin.id,
                reason,
                period,
            })
        }
        user.save();
    }

}


export default new AdminUserController()