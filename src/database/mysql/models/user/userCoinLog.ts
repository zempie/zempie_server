import Model from '../../../_base/model';
import { DataTypes, Sequelize } from 'sequelize';
import { dbs } from '../../../../commons/globals';


/**
 * 충전 재화(zem, pie) 로그
 * type: 1 -> 결제, 2 -> 선물, 3 -> 이벤트
 * info: 해당 type에 따른 정보 
 */

class UserCoinLogModel extends Model {
    protected initialize() {
        this.name = 'userCoinLog';
        this.attributes = {
            user_uid:       { type: DataTypes.STRING(36), allowNull: false },
            zem:            { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
            pie:            { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
            type:           { type: DataTypes.TINYINT, defaultValue: 1 },  
            info:           { type: DataTypes.JSON },
        };
    }

    async afterSync(): Promise<void> {
        this.model.belongsTo(dbs.User.model, {foreignKey: 'user_uid', targetKey: 'uid'});
    }

}

export default (rdb: Sequelize) => new UserCoinLogModel(rdb);
