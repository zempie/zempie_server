import * as _ from 'lodash';
import Model from '../../model';
import { DataTypes, Sequelize, Op } from 'sequelize';
import { CreateError, ErrorCodes } from '../../../../commons/errorCodes';
import { dbs } from '../../../../commons/globals';


interface IUserQuestionParams {
    user_id: number
    title?: string
    content?: string
    no_answer?: any
    sort: string,
    dir: string,
    limit: number
    offset: number
}

class UserQuestionModel extends Model {
    protected initialize(): void {
        this.name = 'userQuestion';
        this.attributes = {
            user_id:    { type: DataTypes.INTEGER, allowNull: false },
            category:   { type: DataTypes.STRING(10), allowNull: false },
            title:      { type: DataTypes.STRING(100), allowNull: false },
            content:    { type: DataTypes.STRING(500), allowNull: false },
            answer:     { type: DataTypes.STRING(500) },
            admin_id:   { type: DataTypes.INTEGER },
        }
    }

    async afterSync(): Promise<void> {
        await super.afterSync();

        this.model.belongsTo(dbs.User.model);
        this.model.belongsTo(dbs.Admin.model);
    }

    async getList({ user_id, no_answer, limit = 50, offset = 0, sort = 'id', dir = 'asc' }: IUserQuestionParams) {
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
                attributes: ['id', 'account', 'name', 'level', 'activated'],
            }],
            order: [[sort, dir]],
            limit: _.toNumber(limit),
            offset: _.toNumber(offset),
        });

        return {
            count,
            questions: _.map(rows, (r: any) => {
                return {
                    id: r.id,
                    name: r.user.name,
                    title: r.title,
                    content: r.content,
                    answer: r.answer,
                    asked_at: r.created_at,
                    answered_at: r.updated_at,
                    admin: r.admin
                }
            })
        }

    }


    async askQuestion({user_id, title, content}: IUserQuestionParams) {
        await this.create({
            user_id,
            title,
            content,
        })
    }
}


export default (rdb: Sequelize) => new UserQuestionModel(rdb)
