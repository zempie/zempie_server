import Model from '../model';
import { DataTypes, Sequelize, Transaction } from 'sequelize';
import { dbs } from '../../../commons/globals';

class UserPublishingModel extends Model {
    protected initialize(): void {
        this.name = 'userPublishing';
        this.attributes = {
            user_id:        { type: DataTypes.INTEGER, allowNull: false },
            game_id:        { type: DataTypes.INTEGER, allowNull: false },
            count_open:     { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
            count_play:     { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
            count_ad:       { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
        }
    }

    async afterSync(): Promise<void> {
        this.model.belongsTo(dbs.User.model);
        this.model.belongsTo(dbs.Game.model);
    }


    async findAll({ user_id }: { user_id: number }, transaction?: Transaction) {

    }


    async updateCount({ user_id, game_id, type }: { user_id: number, game_id: number, type: string }, transaction?: Transaction) {
        const publishing = await this.findOrCreate({
            findOption: {
                user_id,
                game_id,
            }}, transaction);

        publishing[`count_${type}`] += 1;
        await publishing.save({ transaction });
    }
}

export default (rdb: Sequelize) => new UserPublishingModel(rdb)
