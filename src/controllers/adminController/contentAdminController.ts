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
    async login(params: any, admin: IAdmin) {
        const { account, password } = params;
        const record = await dbs.Admin.findOne({account});
        if ( !record ) {
            throw CreateError(ErrorCodes.INVALID_ADMIN_USERNAME);
        }

        if ( !verifyPassword(password, record.password) ) {
            throw CreateError(ErrorCodes.INVALID_ADMIN_PASSWORD);
        }

        if ( !record.activated ) {
            throw CreateError(ErrorCodes.FORBIDDEN_ADMIN);
        }

        const access_token = signJWT({
            is_admin: true,
            id: record.id,
            uid: record.uid,
            account: record.account,
            name: record.name,
            level: record.level,
            sub_level: record.sub_level,
        }, '1d');
        const refresh_token = signJWT({
            is_admin: true,
            id: record.id,
            account: record.account,
            name: record.name,
            level: record.level,
            sub_level: record.sub_level,
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


    async verifyToken({}, admin: IAdmin) {
        return {
            name: admin.name,
            level: admin.level,
            sub_level: admin.sub_level,
        }
    }


    /**
     * 관리자
     */
    async getAdminLogs({ admin_id, limit = 50, offset = 0, sort = 'id', dir = 'desc' }: any, admin: IAdmin) {
        const { count, rows } = await dbs.AdminLog.getLogs({ admin_id, limit, offset, sort, dir });
        return {
            count,
            logs: _.map(rows, (row: any) => {
                const admin = row.admin;
                return {
                    id: row.id,
                    admin: {
                        id: admin.id,
                        account: admin.account,
                        name: admin.name,
                        level: admin.level,
                        sub_level: admin.sub_level,
                    },
                    path: row.path,
                    body: JSON.parse(row.body),
                }
            })
        }
    }

    async getAdmins({ limit = 50, offset = 0, sort = 'id', dir = 'desc' }, admin: IAdmin) {
        const { count, rows } = await dbs.Admin.findAndCountAll({}, {
            attributes: {
                exclude: ['password']
            },
            order: [[sort, dir]],
            limit: _.toNumber(limit),
            offset: _.toNumber(offset),
        });
        return {
            count,
            admins: _.map(rows, record => record.get({ plain: true }))
        }
    }

    async addAdmin({ account, name, password, level, sub_level }: any, { id, uid }: IAdmin) {
        const admin = await dbs.Admin.findOne({ id });
        if ( admin.level < 10 ) {
            throw CreateError(ErrorCodes.INVALID_ADMIN_LEVEL)
        }

        level = _.toNumber(level);
        if ( isNaN(level) || level >= 10 || level < 1 ) {
            throw CreateError(ErrorCodes.INVALID_ADMIN_PARAMS)
        }
        sub_level = _.toNumber(level);
        if ( isNaN(sub_level) || sub_level >= 10 || sub_level < 0 ) {
            throw CreateError(ErrorCodes.INVALID_ADMIN_PARAMS)
        }

        const record = await dbs.Admin.findOne({ account });
        if ( record ) {
            throw CreateError(ErrorCodes.INVALID_ADMIN_USERNAME)
        }

        await dbs.Admin.model.create({
            uid: uuid(),
            account,
            name,
            level,
            sub_level,
            password: makePassword(password),
        })
    }

    async updateAdmin({ id: target_id, name, password, level, sub_level, activated }: any, { id, level: order_level, sub_level: order_sub_level }: IAdmin) {
        target_id = _.toNumber(target_id);

        const admin = await dbs.Admin.findOne({ id: target_id });
        if ( !admin ) {
            throw CreateError(ErrorCodes.INVALID_ADMIN_PARAMS)
        }

        if ( order_level === 10 && id !== target_id ) {
            if ( level ) {
                level = _.toNumber(level);
                if ( isNaN(level) || level >= 10 || level < 1 ) {
                    throw CreateError(ErrorCodes.INVALID_ADMIN_PARAMS)
                }
                admin.level = level || admin.level;
            }

            if ( sub_level ) {
                sub_level = _.toNumber(sub_level);
                if ( isNaN(sub_level) || level >= 10 || level < 0 ) {
                    throw CreateError(ErrorCodes.INVALID_ADMIN_PARAMS)
                }
                admin.sub_level = sub_level || admin.sub_level;
            }

            if ( activated ) {
                admin.activated = (activated === 'true');
            }
        }

        if ( id === target_id ) {
            admin.password = password? makePassword(password) : admin.password;
            admin.name = name || admin.name;
        }

        await admin.save()
    }


    /**
     *
     * @param params
     * @param admin
     */
    async getProjects(params: any, admin: IAdmin) {

    }


    /**
     * 사용자
     */
    async getUsers({ limit = 50, offset = 0, sort = 'id', dir = 'desc' }, admin: IAdmin) {
        const { count, rows } = await dbs.User.getProfileAll({ limit, offset, sort, dir });
        return {
            count,
            users: _.map(rows, (record: any) => record.get({plain: true}))
        }
    }

    async getUserProfile({ id, sort = 'id', dir = 'desc' }: any, admin: IAdmin) {
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

    async getUserQuestions({ user_id, no_answer, limit = 50, offset = 0, sort = 'id', dir = 'desc' }: any) {
        const { count, questions } = await dbs.UserQuestion.getList({ user_id, no_answer, limit, offset, sort, dir });
        return {
            count,
            questions
        }
    }

    async answerQuestion({ question_id, answer }: any, admin: IAdmin) {
        const question = await dbs.UserQuestion.findOne({ id: question_id });
        if ( question.answer ) {
            // 어쩔까?
        }

        question.answer = answer;
        question.admin_id = admin.id;
        question.save();

    }


    /**
     * 고객지원
     */
    async getSupportQuestions({ no_answer, limit = 50, offset = 0, sort = 'id', dir = 'desc' }: any, admin: IAdmin) {
        const { count, questions } = await dbs.UserQuestion.getList({ no_answer, limit, offset, sort, dir });
        return {
            count,
            questions
        }
    }


    async getNotices({ limit = 50, offset = 0, sort = 'id', dir = 'desc' }) {
        const { count, rows } = await dbs.Notice.findAndCountAll({}, {
            order: [[sort, dir]],
            limit: _.toNumber(limit),
            offset: _.toNumber(offset),
        })

        return {
            count,
            notices: _.map(rows, n => n.get({plain: true}))
        }
    }


    async createNotice({type, title, content, img_link, start_at, end_at}: INoticeParams) {
        await dbs.Notice.create({ type, title, content, img_link, start_at, end_at })
    }


    async updateNotice({id}: INoticeParams) {
        return dbs.Notice.getTransaction(async (transaction: Transaction) => {
            const notice = await dbs.Notice.findOne({id}, transaction);
            if( !notice ) {
                throw CreateError(ErrorCodes.INVALID_NOTICE_ID);
            }

            // 수정수정

            await notice.save({transaction});
        })
    }


    async deleteNotice({id}: INoticeParams) {
        return dbs.Notice.getTransaction(async (transaction: Transaction) => {
            const notice = await dbs.Notice.findOne({id}, transaction);
            if( !notice ) {
                throw CreateError(ErrorCodes.INVALID_NOTICE_ID);
            }

            await notice.destroy({ transaction });
        })
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
