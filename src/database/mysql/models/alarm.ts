import Model from '../../../database/mysql/model';
import { DataTypes, Sequelize } from 'sequelize';
import { dbs } from '../../../commons/globals';


/**
 * 플랫폼 서비스 내에서 발생하는 사용자의 행동 결과
 */

class AlarmModel extends Model {
    protected initialize() {
        this.name = 'alarm';
        this.attributes = {
            user_uid:       { type: DataTypes.STRING(36), allowNull: false },
            type:           { type: DataTypes.SMALLINT, allowNull: false },
            extra:          { type: DataTypes.STRING(200) },
        };
    }


    async afterSync(): Promise<void> {
        this.model.belongsTo(dbs.User.model, {foreignKey: 'user_uid', targetKey: 'uid'});
    }



}

export default (rdb: Sequelize) => new AlarmModel(rdb);