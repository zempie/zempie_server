import Model from "../model";
import { DataTypes, Sequelize } from "sequelize";
import { dbs } from "../../../commons/globals";

class UserSetting extends Model {
    protected initialize(): void {
        this.name = 'userSetting';
        this.attributes = {
            user_uid:       { type: DataTypes.STRING(36), allowNull: false },
            notify:         { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: true },
        }
    }

    async afterSync(): Promise<void> {
        this.model.belongsTo(dbs.User.model, {foreignKey: 'user_uid', targetKey: 'uid'});
    }
}

export default (rdb: Sequelize) => new UserSetting(rdb);