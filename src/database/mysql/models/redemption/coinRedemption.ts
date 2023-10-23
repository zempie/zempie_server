import Model from '../../../_base/model';
import { Sequelize, DataTypes } from 'sequelize';
import { dbs } from '../../../../commons/globals';
import { eRedemptionStatus } from '../../../../commons/enums';


class CoinRedemptionModel extends Model {
    protected initialize() {
        this.name = 'coinRedemption';
        this.attributes = {
          user_uid:            { type: DataTypes.STRING(36), allowNull: false },
          bank_account_id:     { type: DataTypes.INTEGER, allowNull: false },
          amount:              { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 }, // 출금 신청 코인
          widthraw_amount:     { type: DataTypes.DOUBLE, allowNull: false, defaultValue: 0 }, // 출금 가격
          status:              { type: DataTypes.INTEGER, allowNull: false, defaultValue: eRedemptionStatus.Processing },
          memo:                { type: DataTypes.STRING(256), allowNull: true },
        };
    }

    async afterSync(): Promise<void> {
      this.model.belongsTo(dbs.User.model, { foreignKey: 'user_uid', targetKey: 'uid' });
      this.model.belongsTo(dbs.UserBankAccount.model, { foreignKey: 'bank_account_id', targetKey: 'id' });
    }
    

}

export default (rdb: Sequelize) => new CoinRedemptionModel(rdb);
