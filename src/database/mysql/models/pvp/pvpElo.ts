import { dbs } from './../../../../commons/globals';
import { DataTypes, Sequelize } from 'sequelize';
import Model from '../../../_base/model';

class PvpEloModel extends Model {
    protected initialize(): void {
        this.name = 'pvpElo';
        this.attributes = {
            user_id:    { type: DataTypes.INTEGER, allowNull: false },
            game_type:  { type: DataTypes.INTEGER, allowNull: false },
            elo:        { type: DataTypes.INTEGER, allowNull: false },
        }
    }
}


export default (rdb: Sequelize) => new PvpEloModel(rdb)
