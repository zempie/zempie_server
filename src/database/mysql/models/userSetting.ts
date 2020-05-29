import Model from "../model";
import { DataTypes, Sequelize } from "sequelize";
import { dbs } from "../../../commons/globals";
import { eAppLang, eAppTheme } from '../../../commons/enums';

class UserSetting extends Model {
    protected initialize(): void {
        this.name = 'userSetting';
        this.attributes = {
            user_uid:           { type: DataTypes.STRING(36), allowNull: false },
            app_theme:          { type: DataTypes.SMALLINT, allowNull: false, defaultValue: eAppTheme.Default },
            app_theme_extra:    { type: DataTypes.SMALLINT },
            app_language:       { type: DataTypes.SMALLINT, allowNull: false, defaultValue: eAppLang.KO },
            notify_alarm:       { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: true },
            notify_battle:      { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: true },
            notify_beat:        { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: true },
            notify_follow:      { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: true },
            notify_like:        { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: true },
            notify_reply:       { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: true },
        }
    }

    async afterSync(): Promise<void> {
        this.model.belongsTo(dbs.User.model, {foreignKey: 'user_uid', targetKey: 'uid'});
    }
}

export default (rdb: Sequelize) => new UserSetting(rdb);