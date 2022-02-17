import {IAdmin} from '../_interfaces';
import {dbs} from '../../commons/globals';
import * as _ from 'lodash';
import {EBan} from '../../database/mysql/models/user/user';

import {Transaction} from 'sequelize';
import NotifyService from '../../services/notifyService';
import {CreateError, ErrorCodes} from '../../commons/errorCodes';

/**
 * 사용자
 */

class AdminUserController {
    async notify({title, body}: any, admin: IAdmin) {
        const topic = 'test-topic';
        const data = {
            title,
            body,
        }
        await NotifyService.send({topic, data});
    }

    /**
     * mail
     */
    async sendMail({user_uid, category, title, content}: any, _admin: IAdmin) {
        await dbs.UserMailbox.create({
            user_uid,
            category,
            title,
            content,
        });
    }

    async cancelMail({mail_id}: any) {
        const mail = await dbs.UserMailbox.findOne({id: mail_id});
        if (mail.is_read) {
            throw CreateError(ErrorCodes.ALREADY_ADMIN_USER_READ_MAIL);
        }
        await mail.destroy({});
    }


    /**
     * user
     */
    async getUsers({limit = 50, offset = 0, sort = 'id', dir = 'asc'}, admin: IAdmin) {
        const {count, rows} = await dbs.User.getProfileAll({limit, offset, sort, dir});
        return {
            count,
            users: _.map(rows, (record: any) => record.get({plain: true}))
        }
    }

    async getUserProfile({id, sort = 'id', dir = 'asc'}: any, admin: IAdmin) {
        const user = await dbs.UserProfile.findAndCountAll({user_id: id}, {
            order: [[sort, dir]],
        });
        return {
            user: user.get({plain: true})
        }
    }


    async banUser({report_id, user_id, reason, period}: any, admin: IAdmin) {
        const isUserBan = await dbs.UserBan.getUserBan({user_id})

        if( isUserBan ) {
            await dbs.UserReport.update({is_done: true}, {id: report_id})
            throw CreateError(ErrorCodes.ALREADY_BANNED_USER);
        }
        await dbs.UserBan.getTransaction(async (transaction: Transaction) => {
            await dbs.UserReport.update({is_done: true}, {id: report_id})

            await dbs.UserBan.create({
                user_id,
                admin_id: admin.id,
                reason,
                period,
            }, transaction)
        })
    }

    async cancelBanUser({report_id, user_id}: any, admin: IAdmin ) {
        await dbs.UserBan.getTransaction(async (transaction: Transaction) => {
            await dbs.UserReport.update({is_done: true}, {id: report_id});

            await dbs.UserBan.update({
                period : new Date(),

            }, {user_id:user_id})
        })

    }



    async getBadWords({limit = 50, offset = 0}) {
        const records = await dbs.BadWords.findAll({}, {
            limit,
            offset,
        });
        return {
            bad_words: _.map(records, (r: any) => {
                return {
                    activated: r.activated,
                    word: r.word,
                }
            })
        }
    }

    async addBadWord({word}: { word: string }, admin: IAdmin) {
        await dbs.BadWords.create({word});
    }

    async delBadWord({id}: { id: number }, admin: IAdmin) {
        await dbs.BadWords.destroy({id});
    }

    async setBadWord({id, activated}: { id: number, activated: boolean }, admin: IAdmin) {
        await dbs.BadWords.update({activated}, {id});
    }

    async getForbiddenWord({limit = 50, offset = 0}) {
        const records = await dbs.ForbiddenWords.findAll({}, {
            limit,
            offset,
        });
        return {
            forbidden_words: _.map(records, (r: any) => {
                return {
                    activated: r.activated,
                    word: r.word,
                }
            })
        }
    }

    async addForbiddenWord({word}: { word: string }, admin: IAdmin) {
        await dbs.ForbiddenWords.create({word});
    }

    async delForbiddenWord({id}: { id: number }, admin: IAdmin) {
        await dbs.ForbiddenWords.destroy({id});
    }

    async setForbiddenWord({id, activated}: { id: number, activated: boolean }, admin: IAdmin) {
        await dbs.ForbiddenWords.update({activated}, {id});
    }
}


export default new AdminUserController()
