import { dbs } from '../../commons/globals';
import { IAdmin, INoticeParams } from '../_interfaces';
import * as _ from 'lodash';
import { Transaction } from 'sequelize';
import { CreateError, ErrorCodes } from '../../commons/errorCodes';


/**
 * 고객지원
 */
class AdminSupportController {
    async getUserInquiries({ user_id, no_answer, limit = 50, offset = 0, sort = 'id', dir = 'asc' }: any) {
        return await dbs.UserInquiry.getList({ user_id, no_answer, limit, offset, sort, dir });
    }

    async respondInquiry({ id, response }: any, admin: IAdmin) {
        const inquiry = await dbs.UserInquiry.findOne({ id });
        if ( inquiry.response ) {
            // 어쩔까?
        }

        inquiry.response = response;
        inquiry.admin_id = admin.id;
        inquiry.save();

    }


    async getNotices({ limit = 50, offset = 0, sort = 'id', dir = 'asc' }) {
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


    async createNotice({category, title, content, img_link, start_at, end_at}: INoticeParams) {
        await dbs.Notice.create({ category, title, content, img_link, start_at, end_at })
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
}


export default new AdminSupportController()
