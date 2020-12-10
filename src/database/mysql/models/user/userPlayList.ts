import { DataTypes, Sequelize } from 'sequelize';
import Model from '../../model';
import { dbs } from '../../../../commons/globals';


class UserPlayListModel extends Model {
    protected initialize(): void {
        this.name = 'userPlayList';
        this.attributes = {
            user_id:    { type: DataTypes.INTEGER, allowNull: false },
            uid:        { type: DataTypes.STRING(36), allowNull: false },

            title:      { type: DataTypes.STRING(100), allowNull: false },
            url_bg:     { type: DataTypes.STRING(250) },

            count_visited:  { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
        }
    }

    async afterSync(): Promise<void> {
        await super.afterSync();

        this.model.belongsTo(dbs.User.model);
        this.model.hasMany(dbs.UserPlayListGame.model, { as: 'games' });
    }

    async getPlayList({ uid }: { uid: string }) {
        const record = await this.model.findOne({
            where: { uid },
            include: [{
                model: dbs.User.model,
            }, {
                model: dbs.UserPlayListGame.model,
                as: 'games',
                include: [{
                    model: dbs.Game.model,
                    include: [{
                        model: dbs.User.model,
                    }]
                }]
            }]
        });
        return record.get({ plain: true });
    }
}


export default (rdb: Sequelize) => new UserPlayListModel(rdb)
