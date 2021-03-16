import * as _ from 'lodash';
import Model from '../../model';
import { DataTypes, Sequelize } from 'sequelize';
import { dbs } from '../../../../commons/globals';


class GameReplyModel extends Model {
    protected initialize(): void {
        this.name = 'gameReply';
        this.attributes = {
            activated:          { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: true },
            game_id:            { type: DataTypes.INTEGER, allowNull: false },
            user_uid:           { type: DataTypes.STRING(36), allowNull: false },
            parent_reply_id:    { type: DataTypes.INTEGER },
            target_uid:         { type: DataTypes.STRING(36) },
            content:            { type: DataTypes.STRING(500), allowNull: false },
            count_good:         { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
            count_bad:          { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
            count_reply:        { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
        }
    }


    async afterSync(): Promise<void> {
        await super.afterSync();

        this.model.belongsTo(dbs.User.model, { foreignKey: 'user_uid', targetKey: 'uid' });
        this.model.belongsTo(dbs.User.model, { foreignKey: 'target_uid', targetKey: 'uid', as: 'target' });
        this.model.hasOne(dbs.UserGameReplyReaction.model, { sourceKey: 'id', foreignKey: 'reply_id', as: 'my_reply' });

        const desc = await this.model.sequelize.queryInterface.describeTable(this.model.tableName);

        if ( !desc['count_reply'] ) {
            this.model.sequelize.queryInterface.addColumn(this.model.tableName, 'count_reply', {
                type: DataTypes.INTEGER,
                allowNull: false,
                defaultValue: 0,
                after: 'count_bad'
            })
        }
    }


    getReplies = async (game_id: number, { limit = 50, offset = 0 }, user_uid: string) => {
        return await this.model.findAll({
            where: {
                game_id,
                parent_reply_id: null,
            },
            include: [{
                model: dbs.User.model,
            }, {
                as: 'my_reply',
                model: dbs.UserGameReplyReaction.model,
                where: {
                    user_uid,
                },
                limit: 1,
            }],
            order: [['created_at', 'desc']],
            limit: _.toNumber(limit),
            offset: _.toNumber(offset),
        })
    }


    getReReplies = async (reply_id: number, { limit = 50, offset = 0 }, user_uid: string) => {
        return await this.model.findAll({
            where: {
                parent_reply_id: reply_id,
            },
            include: [{
                model: dbs.User.model,
            }, {
                as: 'target',
                model: dbs.User.model,
            }, {
                as: 'my_reply',
                model: dbs.UserGameReplyReaction.model,
                where: {
                    user_uid,
                },
                limit: 1,
            }],
            order: [['created_at', 'desc']],
            limit: _.toNumber(limit),
            offset: _.toNumber(offset),
        })
    }
}


export default (rdb: Sequelize) => new GameReplyModel(rdb)
