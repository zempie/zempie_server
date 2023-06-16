import Model from '../../../_base/model';
import { DataTypes, Sequelize } from 'sequelize';
import { dbs } from '../../../../commons/globals';


/**
 * 플랫폼 서비스 내에서 발생하는 사용자 정보 중  pie 정보
 */

class UserCoinModel extends Model {
    protected initialize() {
        this.name = 'userCoin';
        this.attributes = {
            user_id:        { type: DataTypes.INTEGER, allowNull: false },
            zem:            { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
            pie:            { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
        };
    }

    async afterSync(): Promise<void> {
        this.model.belongsTo(dbs.User.model, { foreignKey: 'user_id', targetKey: 'id' });
    }

}

export default (rdb: Sequelize) => new UserCoinModel(rdb);
