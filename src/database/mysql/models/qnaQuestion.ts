import * as _ from 'lodash';
import Model from '../model';
import { DataTypes, Sequelize, Op } from 'sequelize';
import { CreateError, ErrorCodes } from '../../../commons/errorCodes';
import { dbs } from '../../../commons/globals';


interface IQnaParams {
    user_id: number
    title?: string
    content?: string
    answer?: boolean
}

class QnaQuestionModel extends Model {
    protected initialize(): void {
        this.name = 'qnaQuestion';
        this.attributes = {
            user_id:    { type: DataTypes.INTEGER, allowNull: false },
            title:      { type: DataTypes.STRING(100), allowNull: false },
            content:    { type: DataTypes.STRING(500), allowNull: false },
            answer:     { type: DataTypes.STRING(500) },
            admin_id:   { type: DataTypes.INTEGER },
        }
    }

    async afterSync(): Promise<void> {
        await super.afterSync();

        this.model.belongsTo(dbs.Admin.model);
    }

    async getMyQuestionList({ user_id, answer }: IQnaParams) {
        const records = await this.findAll({
            user_id,
            answer: !!answer ? {
                [Op.ne]: null,
            } : undefined
        }, {
            include: [{
                model: dbs.Admin.model,
            }]
        });

        return _.map(records, (r: any) => {
            return {
                title: r.title,
                content: r.content,
                answer: r.answer,
                asked_at: r.created_at,
                answered_at: r.updated_at,
                admin: r.admin? r.admin.name : undefined
            }
        })

    }


    async askQuestion({user_id, title, content}: IQnaParams) {
        await this.create({
            user_id,
            title,
            content,
        })
    }
}


export default (rdb: Sequelize) => new QnaQuestionModel(rdb)
