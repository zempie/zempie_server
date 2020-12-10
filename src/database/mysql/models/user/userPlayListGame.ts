import { DataTypes, Sequelize } from 'sequelize';
import Model from '../../model';
import { dbs } from '../../../../commons/globals';


class UserPlayListGameModel extends Model {
    protected initialize(): void {
        this.name = 'userPlayListGame';
        this.attributes = {
            userPlayList_id:    { type: DataTypes.INTEGER, allowNull: false },
            game_id:            { type: DataTypes.INTEGER, allowNull: false },
        }
    }

    async afterSync(): Promise<void> {
        await super.afterSync();

        this.model.belongsTo(dbs.Game.model);
    }
}


export default (rdb: Sequelize) => new UserPlayListGameModel(rdb)
