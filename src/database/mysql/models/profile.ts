import Model from '../../../database/mysql/model';
import { DataTypes, Sequelize } from 'sequelize';
import { dbs } from '../../../commons/globals';


/**
 * 플랫폼 서비스 내에서 발생하는 사용자 정보
 */

class ProfileModel extends Model {
    protected initialize() {
        this.name = 'profile';
        this.attributes = {
            user_uid:       { type: DataTypes.STRING(36), allowNull: false },
            level:          { type: DataTypes.MEDIUMINT, allowNull: false, defaultValue: 1 },
            exp:            { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
            following_cnt:  { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
            followers_cnt:  { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
        };
    }


    async afterSync(): Promise<void> {
        this.model.belongsTo(dbs.User.model, {foreignKey: 'user_uid', targetKey: 'uid'});
    }

}

export default (rdb: Sequelize) => new ProfileModel(rdb);