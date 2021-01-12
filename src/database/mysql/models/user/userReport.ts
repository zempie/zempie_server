import Model from '../../model';
import { DataTypes, Sequelize } from 'sequelize';
import { eReportType } from '../../../../commons/enums';
import { dbs } from '../../../../commons/globals';


class UserReportModel extends Model {
    protected initialize(): void {
        this.name = 'userReport';
        this.attributes = {
            user_id:        { type: DataTypes.INTEGER, allowNull: false },
            target_type:    { type: DataTypes.SMALLINT, allowNull: false, defaultValue: eReportType.Game },
            target_id:      { type: DataTypes.INTEGER, allowNull: false },
            reason_num:     { type: DataTypes.SMALLINT, allowNull: false },
            reason:         { type: DataTypes.STRING(300) },
        }
    }

    async afterSync(): Promise<void> {
        await super.afterSync();

        this.model.belongsTo(dbs.User.model, { foreignKey: 'target_id', targetKey: 'id' });
        this.model.belongsTo(dbs.Game.model, { foreignKey: 'target_id', targetKey: 'id' });
    }
}


export default (rdb: Sequelize) => new UserReportModel(rdb)
