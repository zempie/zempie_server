import Model from '../model';
import { DataTypes, Sequelize } from 'sequelize';
import { dbs } from '../../../commons/globals';

class PublishingLogModel extends Model {
    protected initialize(): void {
        this.name = 'publishingLog';
        this.attributes = {
            user_id:    { type: DataTypes.INTEGER, allowNull: false },
            game_id:    { type: DataTypes.INTEGER, allowNull: false },
        }
    }

    async afterSync(): Promise<void> {
        this.model.belongsTo(dbs.User.model);
        this.model.belongsTo(dbs.Game.model);
    }
}


export default (rdb: Sequelize) => new PublishingLogModel(rdb)
