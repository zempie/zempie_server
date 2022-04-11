import Model from '../../../_base/model';
import { DataTypes, Sequelize, Transaction } from 'sequelize';
import { parseBoolean } from '../../../../commons/utils';
import {dbs} from "../../../../commons/globals";


class GameHeartModel extends Model {
    protected initialize(): void {
        this.name = 'gameHeart';
        this.attributes = {
            game_id:    { type: DataTypes.INTEGER, allowNull: false, unique: 'compositeIndex' },
            user_uid:   { type: DataTypes.STRING, allowNull: false, unique: 'compositeIndex' },
            activated:  { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false },
        }
    }

    likeIt = async (game_id: number, user_uid: string, activated: any) => {
        let game = await dbs.Game.findOne({ id: game_id });
        let changed = false;

        return await this.getTransaction(async (transaction: Transaction) => {
            const record = await this.findOne({ game_id, user_uid }, transaction);
            if ( record ) {
                if ( record.activated !== parseBoolean(activated)  ) {
                    record.activated = activated;
                    await record.save({ transaction });
                    changed = true;
                }
                game.count_heart += record.activated ? 1 : -1;
                await game.save({transaction});

            }
            else {
                await this.create({ game_id, user_uid, activated: true });
                changed = true;
            }
            return changed;
        })
    }

    isLike = async (game_id: number, user_uid: string) => {
        return await this.findOne({game_id, user_uid})
    }

}


export default (rdb: Sequelize) => new GameHeartModel(rdb)
