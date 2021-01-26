import Model from '../../model';
import { DataTypes, Sequelize, Transaction } from 'sequelize';


class GameHeartModel extends Model {
    protected initialize(): void {
        this.name = 'gameHeart';
        this.attributes = {
            game_id:    { type: DataTypes.INTEGER, allowNull: false, unique: 'compositeIndex' },
            user_uid:   { type: DataTypes.STRING, allowNull: false, unique: 'compositeIndex' },
            activated:  { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false },
        }
    }

    async afterSync(): Promise<void> {
        await super.afterSync();
    }

    likeIt = async ({game_id, user_uid, activated }: { game_id: number, user_uid: string, activated: boolean}) => {
        await this.model.getTransaction(async (transaction: Transaction) => {
            const record = await this.findOne({ game_id, user_uid }, transaction);
            if ( record && record.activated !== activated ) {
                record.activated = activated;
                await record.save({ transaction });
            }
        })
    }
}


export default (rdb: Sequelize) => new GameHeartModel(rdb)
