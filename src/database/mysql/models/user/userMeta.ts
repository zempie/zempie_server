import Model from '../../../_base/model';
import { DataTypes, Sequelize, Transaction } from "sequelize";
import { dbs } from "../../../../commons/globals";
import { eAppLang, eAppTheme } from '../../../../commons/enums';


class UserMeta extends Model {
    protected initialize(): void {
        this.name = 'userMeta';
        this.attributes = {
            user_id:                  { type: DataTypes.INTEGER, allowNull: false, unique: true },
            notification_check_time:  { type: DataTypes.DATE, allowNull:false}
        }
    }

    async afterSync(): Promise<void> {
        this.model.belongsTo(dbs.User.model, { foreignKey: 'user_id', targetKey: 'id' });
    }
}

export default (rdb: Sequelize) => new UserMeta(rdb);
