import * as _ from 'lodash';
import { v4 as uuid } from 'uuid';
import Model from '../../model';
import { DataTypes, Sequelize } from 'sequelize';
import { dbs } from '../../../../commons/globals';
import { parseBoolean } from '../../../../commons/utils';
import { IGameListParams } from '../../../../controllers/_interfaces';
import { eGameCategory } from '../../../../commons/enums';


class GameModel extends Model {
    protected initialize(): void {
        this.name = 'game';
        this.attributes = {
            // uid:                { type: DataTypes.UUID, allowNull: false },
            activated:          { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false },
            enabled:            { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false },

            official:           { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false },
            category:           { type: DataTypes.INTEGER, allowNull: false, defaultValue: eGameCategory.Challenge },
            user_id:            { type: DataTypes.INTEGER },

            pathname:           { type: DataTypes.STRING(50), allowNull: false, unique: true },
            title:              { type: DataTypes.STRING(50), allowNull: false, defaultValue: '' },
            description:        { type: DataTypes.STRING(200), defaultValue: '' },
            version:            { type: DataTypes.STRING(20), defaultValue: '0.0.1' },

            control_type:       { type: DataTypes.SMALLINT, defaultValue: 0 },
            hashtags:           { type: DataTypes.STRING, allowNull: false },

            count_start:        { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
            count_over:         { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
            count_heart:        { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },

            url_game:           { type: DataTypes.STRING },
            url_thumb:          { type: DataTypes.STRING },
            url_thumb_webp:     { type: DataTypes.STRING },
            url_thumb_gif:      { type: DataTypes.STRING },
            // url_title:          { type: DataTypes.STRING },
        }
    }

    async afterSync(): Promise<void> {
        this.model.belongsTo(dbs.User.model);

        this.model.hasOne(dbs.GameEmotion.model);

        // if ( process.env.NODE_ENV !== 'production' ) {
        //     if ( await this.model.count() < 1 ) {
        //         const sampleGames: any = [
        //             {
        //                 // uid: uuid(),
        //                 pathname: 'test-path',
        //                 title: 'test-title',
        //                 genre_tags: 'arcade,puzzle,knight',
        //             }
        //         ];
        //         await this.bulkCreate(sampleGames);
        //     }
        // }

        const desc = await this.model.sequelize.queryInterface.describeTable(this.model.tableName);
        if ( !desc['url_thumb_webp'] ) {
            this.model.sequelize.queryInterface.addColumn(this.model.tableName, 'url_thumb_webp', {
                type: DataTypes.STRING,
                after: 'url_thumb'
            })
        }
        if ( !desc['url_thumb_gif'] ) {
            this.model.sequelize.queryInterface.addColumn(this.model.tableName, 'url_thumb_gif', {
                type: DataTypes.STRING,
                after: 'url_thumb_webp'
            })
        }
        if ( !desc['count_heart'] ) {
            this.model.sequelize.queryInterface.addColumn(this.model.tableName, 'count_heart', {
                type: DataTypes.INTEGER,
                allowNull: false,
                defaultValue: 0,
                after: 'count_over'
            })
        }
        if ( !desc['category'] ) {
            this.model.sequelize.queryInterface.addColumn(this.model.tableName, 'category', {
                type: DataTypes.SMALLINT,
                allowNull: false,
                defaultValue: eGameCategory.Challenge,
                after: 'official'
            })
        }
    }


    async getInfo(where: object) {
        const record = await this.model.findOne({
            where,
            // attributes: {
            //     exclude: ['id', 'created_at', 'updated_at', 'deleted_at']
            // },
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


    async getList({ official, category, limit = 50, offset = 0, sort = 'id', dir = 'asc' }: IGameListParams) {
        // where
        const where: any = {
            activated: true,
            enabled: true,
        }
        if ( category ) {
            where.category = _.toNumber(category);
        }
        else {
            if ( official ) {
                where.official = parseBoolean(official)
            }
        }

        // order by
        dir = dir.toLowerCase();
        if ( dir === 'd' || dir === 'desc' ) {
            dir = 'desc';
        }
        else {
            dir = 'asc';
        }

        sort = sort.toLowerCase();
        if ( sort === 'u' || sort === 'updated' ) {
            sort = 'updated_at';
        }
        else if ( sort === 'c' || sort === 'created' ) {
            sort = 'created_at';
        }
        else if ( sort === 't' || sort === 'title' ) {
            sort = 'title';
        }
        else {
            sort = 'id';
        }

        return this.getListIncludingUser(where, {
            order: [[sort, dir]],
            limit: _.toNumber(limit),
            offset: _.toNumber(offset),
        });
        // return await this.model.findAll({
        //     where,
        //     // attributes: {
        //     //     include: [['uid', 'game_uid']]
        //     // },
        //     include: [{
        //         model: dbs.User.model,
        //         where: {
        //             activated: true,
        //             banned: false,
        //             deleted_at: null,
        //         },
        //         required: true,
        //     }],
        //     order: [[sort, dir]],
        //     limit: _.toNumber(limit),
        //     offset: _.toNumber(offset),
        // })
    }

    getListIncludingUser = async (where: any, options: any = {}) => {
        return await this.model.findAll({
            where,
            include: [
                {
                    model: dbs.GameEmotion.model,
                },
                {
                    model: dbs.User.model,
                    where: {
                        activated: true,
                        banned: false,
                        deleted_at: null,
                    },
                    required: false,
                }
            ],
            ...options,
        })
    }
}


export default (rdb: Sequelize) => new GameModel(rdb)
