import * as _ from 'lodash';
import { v4 as uuid } from 'uuid';
import Model from '../../model';
import { DataTypes, Sequelize } from 'sequelize';
import { dbs } from '../../../../commons/globals';
import { parseBoolean } from '../../../../commons/utils';
import { IGameListParams } from '../../../../controllers/_interfaces';


class GameModel extends Model {
    protected initialize(): void {
        this.name = 'game';
        this.attributes = {
            uid:                { type: DataTypes.UUID, allowNull: false },
            activated:          { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false },
            enabled:            { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false },

            official:           { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false },
            user_id:            { type: DataTypes.INTEGER },

            pathname:           { type: DataTypes.STRING(50), allowNull: false, unique: true },
            title:              { type: DataTypes.STRING(50), allowNull: false, defaultValue: '' },
            description:        { type: DataTypes.STRING(200), defaultValue: '' },
            version:            { type: DataTypes.STRING(20), defaultValue: '0.0.1' },

            control_type:       { type: DataTypes.SMALLINT, defaultValue: 0 },
            hashtags:           { type: DataTypes.STRING, allowNull: false },

            count_start:        { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
            count_over:         { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },

            url_game:           { type: DataTypes.STRING },
            url_thumb:          { type: DataTypes.STRING },
            url_thumb_gif:      { type: DataTypes.STRING },
            url_title:          { type: DataTypes.STRING },
        }
    }

    async afterSync(): Promise<void> {
        this.model.belongsTo(dbs.User.model);
        if ( process.env.NODE_ENV !== 'production' ) {
            if ( await this.model.count() < 1 ) {
                const sampleGames: any = [
                    {
                        uid: uuid(),
                        pathname: 'test-path',
                        title: 'test-title',
                        genre_tags: 'arcade,puzzle,knight',
                    }
                ];
                await this.bulkCreate(sampleGames);
            }
        }

        const desc = await this.model.sequelize.queryInterface.describeTable(this.model.tableName);
        if ( !desc['url_thumb_gif'] ) {
            this.model.sequelize.queryInterface.addColumn(this.model.tableName, 'url_thumb_gif', {
                type: DataTypes.STRING,
                after: 'url_thumb'
            })
        }
    }


    async getList({ limit = 50, offset = 0, official, sort = 'id', dir = 'asc' }: IGameListParams) {
        const where: any = {
            activated: true,
            enabled: true,
        }
        if ( official ) {
            where.official = parseBoolean(official)
        }

        return await this.model.findAll({
            where,
            attributes: {
                include: [['uid', 'game_uid']]
            },
            include: [{
                model: dbs.User.model,
                where: {
                    activated: true,
                    banned: false,
                    deleted_at: null,
                },
                required: true,
            }],
            order: [[sort, dir]],
            limit: _.toNumber(limit),
            offset: _.toNumber(offset),
        })
    }


    async getInfo(where: object) {
        const record = await this.model.findOne({
            where,
            attributes: {
                exclude: ['id', 'created_at', 'updated_at', 'deleted_at']
            },
            include: [{
                model: dbs.User.model,
                where: {
                    activated: true,
                    banned: false,
                    deleted_at: null,
                },
                required: true,
            }],
        })

        return record.get({ plain: true })
    }
}


export default (rdb: Sequelize) => new GameModel(rdb)
