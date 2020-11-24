import * as _ from 'lodash';
import Model from '../../model';
import { DataTypes, Sequelize, Op } from 'sequelize';
import { dbs } from '../../../../commons/globals';


interface IUserInquiryParams {
    user_id: number
    title?: string
    content?: string
    no_answer?: any
    sort: string,
    dir: string,
    limit: number
    offset: number
}

class UserInquiryModel extends Model {
    protected initialize(): void {
        this.name = 'userInquiry';
        this.attributes = {
            user_id:    { type: DataTypes.INTEGER, allowNull: false },
            category:   { type: DataTypes.SMALLINT, allowNull: false },
            title:      { type: DataTypes.STRING(100), allowNull: false },
            text:       { type: DataTypes.STRING(500), allowNull: false },
            response:   { type: DataTypes.STRING(500) },
            admin_id:   { type: DataTypes.INTEGER },
        }
    }

    async afterSync(): Promise<void> {
        await super.afterSync();

        this.model.belongsTo(dbs.User.model);
        this.model.belongsTo(dbs.Admin.model);
    }

    async getList({ user_id, no_answer, limit = 50, offset = 0, sort = 'id', dir = 'asc' }: IUserInquiryParams) {
        const where: any = {};
        if ( user_id ) {
            where.user_id = user_id;
        }
        if ( no_answer === 'true' || no_answer === '1' ) {
            where.answer = {
                [Op.eq]: null
            }
        }
        const { count, rows } = await this.findAndCountAll(where, {
            include: [{
                model: dbs.User.model,
            }, {
                model: dbs.Admin.model,
            }],
            order: [[sort, dir]],
            limit: _.toNumber(limit),
            offset: _.toNumber(offset),
        });

        return {
            count,
            inquiries: _.map(rows, (r: any) => {
                return {
                    id: r.id,
                    title: r.title,
                    text: r.text,
                    response: r.response,
                    asked_at: r.created_at,
                    responded_at: r.updated_at,
                    admin: {
                        name: r.admin.name
                    }
                }
            })
        }

    }


}


export default (rdb: Sequelize) => new UserInquiryModel(rdb)
