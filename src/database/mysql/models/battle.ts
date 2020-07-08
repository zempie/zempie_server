import Model from '../model';
import { DataTypes, Sequelize } from 'sequelize';
import { dbs } from '../../../commons/globals';

class BattleModel extends Model {
    protected initialize(): void {
        this.name = 'battle'
        this.attributes = {
            uid:        { type: DataTypes.STRING(36), allowNull: false },
            user_uid:   { type: DataTypes.STRING(36), allowNull: false },
            game_uid:   { type: DataTypes.STRING(36), allowNull: false },
            title:      { type: DataTypes.STRING(50) },
            activated:  { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: true },
            user_count: { type: DataTypes.MEDIUMINT, allowNull: false, defaultValue: 0 },
            end_at:     { type: DataTypes.DATE },
        }
    }

    async afterSync(): Promise<void> {
        this.model.belongsTo(dbs.User.model, {foreignKey: 'user_uid', targetKey: 'uid'});
    }
}


export default (rdb: Sequelize) => new BattleModel(rdb);