import Model from '../../../_base/model';
import { DataTypes, Sequelize, Transaction } from "sequelize";
import { dbs } from "../../../../commons/globals";
import { eAppLang, eAppTheme } from '../../../../commons/enums';


class UserSetting extends Model {
    protected initialize(): void {
        this.name = 'userSetting';
        this.attributes = {
            user_id:            { type: DataTypes.INTEGER, allowNull: false, unique: true },
            app_theme:          { type: DataTypes.SMALLINT, allowNull: false, defaultValue: eAppTheme.Default },
            app_theme_extra:    { type: DataTypes.SMALLINT },
            app_language:       { type: DataTypes.SMALLINT, allowNull: false, defaultValue: eAppLang.KO },
            notify_alarm:       { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: true },
            notify_battle:      { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: true },
            notify_beat:        { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: true },
            // notify_follow:      { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: true },
            notify_like:        { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: true },
            notify_reply:       { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: true },
            notify_chat:        { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: true },
        }
    }

    async afterSync(): Promise<void> {
        this.model.belongsTo(dbs.User.model, { foreignKey: 'user_id', targetKey: 'id' });

        const desc = await this.model.sequelize.queryInterface.describeTable(this.model.tableName);

        if (!desc['notify_chat']) {
            this.model.sequelize.queryInterface.addColumn(this.model.tableName, 'notify_chat', {
                type: DataTypes.BOOLEAN,
                after: 'notify_reply'
            })
        }
    }

   
}

export default (rdb: Sequelize) => new UserSetting(rdb);
