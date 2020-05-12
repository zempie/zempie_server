import Model from '../../../database/mysql/model';
import { DataTypes, Sequelize, Op } from 'sequelize';
import { dbs } from '../../../commons/globals';


/**
 * 플랫폼 서비스 공지 사항
 */

class NoticeModel extends Model {
    protected initialize() {
        this.name = 'notice';
        this.attributes = {
            type:           { type: DataTypes.SMALLINT, allowNull: false },
            title:          { type: DataTypes.STRING(100), allowNull: false },
            content:        { type: DataTypes.STRING(500), allowNull: false },
            img_link:       { type: DataTypes.STRING(500) },
            start_at:       { type: DataTypes.DATE, allowNull: false },
            end_at:         { type: DataTypes.DATE, allowNull: false },
        };
    }

    async getList({ date }: {date: Date}) {
        await this.model.findAll({
            start_at: {
                [Op.lte]: date,
            },
            end_at: {
                [Op.gte]: date,
            }
        })
    }

}

export default (rdb: Sequelize) => new NoticeModel(rdb);