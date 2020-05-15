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
            user_uid:   { type: DataTypes.STRING(36), allowNull: false },
            target_uid: { type: DataTypes.STRING(36), allowNull: false },
        };
    }

    async afterSync(): Promise<void> {
        this.model.belongsTo(dbs.User.model, {foreignKey: 'user_uid', targetKey: 'uid', as: 'user'});
        this.model.belongsTo(dbs.User.model, {foreignKey: 'target_uid', targetKey: 'uid', as: 'target'});
        this.model.belongsTo(dbs.UserGame.model, {foreignKey: 'target_uid', targetKey: 'user_uid', as: 'gameRecord'});
    }


    async following({user_uid}: any, transaction?: Transaction) {
        return this.model.findAll({
            where: {
                user_uid: {
                    [Op.eq]: user_uid,
                },
                target_uid: {
                    [Op.ne]: user_uid,
                }
            },
            include: [{
                model: dbs.User.model,
                as: 'target',
            }],
            transaction
        });
    }

    async followers({user_uid}: any, transaction?: Transaction) {
        return this.model.findAll({
            where: {
                target_uid: {
                    [Op.eq]: user_uid,
                },
                user_uid: {
                    [Op.ne]: user_uid,
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