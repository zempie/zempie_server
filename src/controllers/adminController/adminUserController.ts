import {IAdmin} from '../_interfaces';
import {dbs} from '../../commons/globals';
import * as _ from 'lodash';
import {EBan} from '../../database/mysql/models/user/user';

import {Op, Transaction} from 'sequelize';
import NotifyService from '../../services/notifyService';
import {CreateError, ErrorCodes} from '../../commons/errorCodes';
import { ePlatformType } from '../../commons/enums';

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


    async banUser({report_id, user_id, reason, period, warns}: any, admin: IAdmin) {
        const isUserBan = await dbs.UserBan.getUserBan({user_id})

        if( isUserBan ) {
            if(report_id)
                await dbs.UserReport.update({is_done: true}, {id: report_id})
            throw CreateError(ErrorCodes.ALREADY_BANNED_USER);
        }
        await dbs.UserBan.getTransaction(async (transaction: Transaction) => {
            if(warns && warns.length){
                warns.forEach(async(warn : any) => {
                    await dbs.UserWarn.update({is_done : true}, {id: warn.id})
                })
            }
            if(report_id)
                await dbs.UserReport.update({is_done: true}, {id: report_id})
            await dbs.User.update({banned: true}, {id: user_id})
            await dbs.UserBan.create({
                user_id,
                admin_id: admin.id,
                reason,
                period : period? period : new Date(9999, 11, 31),
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


    async updateAllNickname ()  {
        const users = await dbs.User.findAll({
            nickname : {
                [Op.eq] : null
            }
        })
        return dbs.User.getTransaction(async (transaction: Transaction) => {
            for(const user of users){
                const [email] = user.email.split('@')
                await dbs.User.update({
                    nickname: email
                }, {uid:user.uid}, transaction)            
            }
        })
    }
    async warnUser({ user_id, reason_num, reason, report_id }:any, admin: IAdmin) {
        return dbs.User.getTransaction(async (transaction: Transaction) => {

            const warn = await dbs.UserWarn.create({
                user_id,
                admin_id: admin.id,
                reason_num,
                reason
            })

            if(report_id)
                await dbs.UserReport.update({is_done: true}, {id: report_id }, transaction)
            return warn
         })
    }
    async getUserWarning({user_id}: any, admin:IAdmin){
        return await dbs.UserWarn.userWarningList({user_id})
    }

    async cancelWarnUser({id, user_id, process_msg} : any ) {
        await dbs.UserBan.getTransaction(async (transaction: Transaction) => {
            const userWarn = await dbs.UserWarn.findOne( {user_id, id })

            if(!userWarn){
                throw CreateError(ErrorCodes.INVALID_PARAMS);
            }

            userWarn.is_done = true
            if(process_msg)
                userWarn.process_msg = process_msg

            await userWarn.save({ transaction });

            // await dbs.UserWarn.update({ is_done: true }, {user_id: user_id, id }, transaction);
        })
    }

    async updateBuildVersion({ type, build_num }: { type: ePlatformType, build_num: number}, admin: IAdmin) {
       return await dbs.UserBan.getTransaction(async (transaction: Transaction) => {
            
            const target_type = Number(type)
            const build_no = Number(build_num)

            const recentVersion = await dbs.Meta.getRecetnVersion()

            switch(target_type){
                case ePlatformType.Android:
                    recentVersion.and_build_no = build_no
                    break
                case ePlatformType.Ios:
                    recentVersion.ios_build_no = build_no
                    break
            }
            
            await recentVersion.save({transaction})
            return recentVersion
        })


    }
}


export default new AdminUserController()
