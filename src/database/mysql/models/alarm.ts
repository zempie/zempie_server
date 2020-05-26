import Model from '../../../database/mysql/model';
import { DataTypes, Sequelize, Transaction } from 'sequelize';
import { dbs } from '../../../commons/globals';
import { IAlarmParams } from '../../../controllers/_interfaces';


/**
 * 플랫폼 서비스 내에서 발생하는 사용자의 행동 결과
 */

class AlarmModel extends Model {
    protected initialize() {
        this.name = 'alarm';
        this.attributes = {
            user_uid:       { type: DataTypes.STRING(36), allowNull: false },
            target_uid:     { type: DataTypes.STRING(36), allowNull: false },
            type:           { type: DataTypes.SMALLINT, allowNull: false },
            extra:          { type: DataTypes.STRING(200) },
        };
    }


    async afterSync(): Promise<void> {
        this.model.belongsTo(dbs.User.model, {foreignKey: 'target_uid', targetKey: 'uid', as: 'target'});
    }


    async create({user_uid, target_uid, game_uid, type, extra = {}}: IAlarmParams, transaction?: Transaction) {
        return super.create({user_uid, target_uid, game_uid, type, extra: JSON.stringify(extra)}, transaction);
    }


    async getList({ user_uid, limit, skip }: IAlarmParams, transaction?: Transaction) {
        return this.model.findAll({
            where: { user_uid },
            attributes: ['id', 'type', 'extra', 'created_at'],
            include: [{
                model: dbs.User.model,
                as: 'target',
                attributes: ['uid', ['display_name', 'displayName'], ['photo_url', 'photoURL']]
            }],
            limit,
            skip,
            transaction
        });
    }
}

export default (rdb: Sequelize) => new AlarmModel(rdb);