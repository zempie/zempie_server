import Model from '../../../_base/model';
import { DataTypes, Sequelize } from 'sequelize';
import { dbs } from '../../../../commons/globals';


/**
 * 
 */
class UserBankAccount extends Model {
    protected initialize() {
        this.name = 'userBankAccount';
        this.attributes = {
            user_uid:       { type: DataTypes.STRING(36), allowNull: false },
            name:           { type: DataTypes.STRING(100), allowNull: false },
            bank:           { type: DataTypes.STRING(100), allowNull: false },
            account_num:    { type: DataTypes.INTEGER, allowNull: false },
            is_auth:        { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false },
        };
    }

    async afterSync(): Promise<void> {
        this.model.belongsTo(dbs.User.model, { foreignKey: 'user_uid', targetKey: 'uid' });
    }

}

export default (rdb: Sequelize) => new UserBankAccount(rdb);
