import * as _ from 'lodash';
import { v4 as uuid } from 'uuid';
import Model from '../../model';
import { DataTypes, Sequelize } from 'sequelize';
import { dbs } from '../../../../commons/globals';


class GameModel extends Model {
    protected initialize(): void {
        this.name = 'game';
        this.attributes = {
            uid:                { type: DataTypes.UUID, allowNull: false },
            activated:          { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false },
            enabled:            { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false },

            official:           { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false },

            developer_id:       { type: DataTypes.INTEGER, allowNull: false },
            // developer_type:     { type: DataTypes.SMALLINT, defaultValue: 0 },

            pathname:           { type: DataTypes.STRING(50), allowNull: false, unique: true },
            title:              { type: DataTypes.STRING(50), allowNull: false, defaultValue: '' },
            description:        { type: DataTypes.STRING(200), defaultValue: '' },
            version:            { type: DataTypes.STRING(20), defaultValue: '0.0.1' },

            // min_ratio:          { type: DataTypes.SMALLINT, defaultValue: 1 },
            control_type:       { type: DataTypes.SMALLINT, defaultValue: 0 },

            // genre_arcade:       { type: DataTypes.BOOLEAN, defaultValue: false },
            // genre_puzzle:       { type: DataTypes.BOOLEAN, defaultValue: false },
            // genre_sports:       { type: DataTypes.BOOLEAN, defaultValue: false },
            // genre_racing:       { type: DataTypes.BOOLEAN, defaultValue: false },
            hashtags:           { type: DataTypes.STRING, allowNull: false },

            count_start:        { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
            count_over:         { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },

            url_game:           { type: DataTypes.STRING },
            url_thumb:          { type: DataTypes.STRING },
            url_title:          { type: DataTypes.STRING },
        }
    }

    async afterSync(): Promise<void> {
        this.model.belongsTo(dbs.Developer.model, { foreignKey: 'developer_id', targetKey: 'id' });

        if ( await this.model.count() < 1 ) {
            const sampleGames: any = [
                {
                    uid: uuid(),
                    developer_id: 1,
                    pathname: 'test-path',
                    title: 'test-title',
                    genre_tags: 'arcade,puzzle,knight',
                }
            ];
            await this.bulkCreate(sampleGames);
        }
    }


    async getList({ limit = 50, offset = 0, sort = 'id', dir = 'asc' }) {
        return await this.model.findAll({
            where: {
                activated: true,
                enabled: true,
            },
            attributes: {
                include: [['uid', 'game_uid']]
            },
            include: [{
                model: dbs.Developer.model,
            }],
            order: [[sort, dir]],
            limit: _.toNumber(limit),
            offset: _.toNumber(offset),
        })
    }


    async getInfo(uid: string) {
        const record = await this.model.findOne({
            where: { uid },
            attributes: {
                exclude: ['id', 'created_at', 'updated_at', 'deleted_at']
            },
            include: [{
                model: dbs.Developer.model,
                attributes: {
                    exclude: ['id', 'created_at', 'updated_at', 'deleted_at']
                },
            }],
        })

        return record.get({ plain: true })
    }
}


export default (rdb: Sequelize) => new GameModel(rdb)
