import Model from '../../../database/mysql/model';
import { DataTypes, Sequelize, Transaction, Op } from 'sequelize';
import { dbs } from '../../../commons/globals';
import { IUser } from '../../../controllers/_interfaces';
import { CreateError, ErrorCodes } from '../../../commons/errorCodes';


/**
 * follower, following
 */

class FollowModel extends Model {
    protected initialize() {
        this.name = 'follow';
        this.attributes = {
            user_id:   { type: DataTypes.INTEGER, allowNull: false },
            target_id: { type: DataTypes.INTEGER, allowNull: false },
        };
    }

    async afterSync(): Promise<void> {
        this.model.belongsTo(dbs.User.model, { foreignKey: 'user_id', targetKey: 'id', as: 'user' });
        this.model.belongsTo(dbs.User.model, { foreignKey: 'target_id', targetKey: 'id', as: 'target' });
        this.model.belongsTo(dbs.UserGame.model, { foreignKey: 'target_id', targetKey: 'user_id', as: 'gameRecord' });
    }


    async follow({user_id, target_id}: any, transaction?: Transaction) {
        const record = await this.findOne({ user_id, target_id }, transaction);
        if ( record ) {
            throw CreateError(ErrorCodes.ALREADY_FOLLOWING_TARGET);
        }

        await this.create({ user_id, target_id }, transaction);
    }

    async unFollow({ user_id, target_id }: any, transaction?: Transaction) {
        await this.destroy({ user_id, target_id }, transaction);
    }


    async following({user_id}: any, transaction?: Transaction) {
        return this.model.findAll({
            where: {
                user_id: {
                    [Op.eq]: user_id,
                },
                target_id: {
                    [Op.ne]: user_id,
                }
            },
            include: [{
                model: dbs.User.model,
                as: 'target',
            }],
            transaction
        });
    }

    async followers({user_id}: any, transaction?: Transaction) {
        return this.model.findAll({
            where: {
                target_id: {
                    [Op.eq]: user_id,
                },
                user_id: {
                    [Op.ne]: user_id,
                },
            },
            include: [{
                model: dbs.User.model,
                as: 'user',
            }],
            transaction
        })
    }
}

export default (rdb: Sequelize) => new FollowModel(rdb);
