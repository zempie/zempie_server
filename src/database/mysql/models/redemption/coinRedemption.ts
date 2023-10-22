import Model from '../../../_base/model';
import { Sequelize, DataTypes } from 'sequelize';
import { dbs } from '../../../../commons/globals';


class CoinRedemptionModel extends Model {
    protected initialize() {
        this.name = 'coinRedemption';
        this.attributes = {
          user_uid:       { type: DataTypes.STRING(36), allowNull: false },
          amount:         { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
          status:         { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 }, 
          
        };
    }

    async afterSync(): Promise<void> {
      this.model.belongsTo(dbs.User.model, { foreignKey: 'user_uid', targetKey: 'uid' });
    }
    

}

export default (rdb: Sequelize) => new CoinRedemptionModel(rdb);
