import * as _ from 'lodash';
import admin from 'firebase-admin';
import DecodedIdToken = admin.auth.DecodedIdToken;
import { CreateError, ErrorCodes } from '../commons/errorCodes';
import { dbs } from '../commons/globals';


interface IQnaParams {
    category: number
    title: string
    text: string
}

class SupportController {
    async askInquiry ({ category, title, text }: IQnaParams, { uid }: DecodedIdToken) {
        if ( !title || title.length < 1 ) {
            throw CreateError(ErrorCodes.INVALID_QNA_PARAMS)
        }
        if ( !text || text.length < 5 ) {
            throw CreateError(ErrorCodes.INVALID_QNA_PARAMS)
        }

        const user = await dbs.User.findOne({ uid });
        await dbs.UserInquiry.create({ user_id: user.id, category, title, text });
    }


    async getMyInquiries ({ limit = 50, offset = 0 }, { uid }: DecodedIdToken) {
        const user = await dbs.User.findOne({ uid });
        return await dbs.UserInquiry.getList({ user_id: user.id, limit, offset });
    }


    async getMyInquiry ({ id }: { id: number }, { uid }: DecodedIdToken) {
        const user = await dbs.User.findOne({ uid });
        const inquiry = await dbs.UserInquiry.model.findOne({
            where: { user_id: user.id, id },
            include: [{
                model: dbs.Admin.model,
            }]
        });
        return {
            inquiry: {
                id: inquiry.id,
                category: inquiry.category,
                title: inquiry.title,
                text: inquiry.text,
                response: inquiry.response,
                created_at: inquiry.created_at,
                updated_at: inquiry.updated_at,
                admin: {
                    name: inquiry.admin.name,
                }
            }
        }
    }


    async getNotices ({ limit = 50, offset = 0, sort = 'id', dir = 'asc' }) {
        const { count, rows } = await dbs.Notice.findAndCountAll({ activated: true }, {
            order: [[sort, dir]],
            limit: _.toNumber(limit),
            offset: _.toNumber(offset),
        })
        return {
            count,
            notices: _.map(rows, (row) => {
                return {
                    id: row.id,
                    category: row.category,
                    title: row.title,
                    // content: row.content,
                    created_at: row.created_at,
                }
            })
        }
    }


    async getNotice ({ id }: { id: number }) {
        const notice = await dbs.Notice.model.findOne({
            where: { id },
            attributes: {
                exclude: ['updated_at', 'deleted_at']
            }
        });
        return {
            notice: notice.get({ plain: true })
        }
    }


    async getQna () {}

}


export default new SupportController()
