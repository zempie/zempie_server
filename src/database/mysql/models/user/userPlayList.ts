import { DataTypes, Sequelize } from 'sequelize';
import Model from '../../model';
import { dbs } from '../../../../commons/globals';


class UserPlayListModel extends Model {
    protected initialize(): void {
        this.name = 'userPlayList';
        this.attributes = {
            user_id:    { type: DataTypes.INTEGER, allowNull: false },
            title:      { type: DataTypes.STRING(100), allowNull: false },

            count_visited:  { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
        }
    }

    async afterSync(): Promise<void> {
        await super.afterSync();

        this.model.belongsTo(dbs.User.model);
        this.model.hasMany(dbs.UserPlayListGame.model);
    }
}


export default (rdb: Sequelize) => new UserPlayListModel(rdb)
