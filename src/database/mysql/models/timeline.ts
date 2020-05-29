import Model from '../../../database/mysql/model';
import { DataTypes, Sequelize, Transaction } from 'sequelize';
import { dbs } from '../../../commons/globals';
import { ITimelineParams } from "../../../controllers/_interfaces";


/**
 * 플랫폼 서비스 내에서 발생하는 사용자의 행동 결과
 */

class TimelineModel extends Model {
    protected initialize() {
        this.name = 'timeline';
        this.attributes = {
            uid:            { type: DataTypes.STRING(36), allowNull: false },
            user_uid:       { type: DataTypes.STRING(36), allowNull: false },
            game_uid:       { type: DataTypes.STRING(36), allowNull: false },
            type:           { type: DataTypes.SMALLINT, allowNull: false },
            extra:          { type: DataTypes.STRING(200) },
        };
    }


    async afterSync(): Promise<void> {
        this.model.belongsTo(dbs.User.model, {foreignKey: 'user_uid', targetKey: 'uid'});
    }


    async getList({user_uid, limit = 50, offset = 0}: ITimelineParams, transaction?: Transaction) {
        return this.model.findAll({
            where: {
                user_uid,
            },
            attributes: {
                exclude: ['updated_at', 'deleted_at']
            },
            order: [['id', 'desc']],
            include: [{
                model: dbs.User.model,
                attributes: [['uid', 'user_uid'], ['display_name', 'displayName'], ['photo_url', 'photoURL']]
            }],
            limit,
            offset,
            transaction
        })
    }

}

export default (rdb: Sequelize) => new TimelineModel(rdb);