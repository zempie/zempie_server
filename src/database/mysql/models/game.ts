import * as _ from 'lodash';
import Model from '../model';
import { DataTypes, Sequelize } from 'sequelize';
import { dbs } from '../../../commons/globals';

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

            genre_arcade:       { type: DataTypes.BOOLEAN, defaultValue: false },
            genre_puzzle:       { type: DataTypes.BOOLEAN, defaultValue: false },
            genre_sports:       { type: DataTypes.BOOLEAN, defaultValue: false },
            genre_racing:       { type: DataTypes.BOOLEAN, defaultValue: false },

            count_start:        { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
            count_over:         { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },

            url_game:           { type: DataTypes.STRING },
            url_thumb:          { type: DataTypes.STRING },
            url_title:          { type: DataTypes.STRING },
        }
    }

    async afterSync(): Promise<void> {
        this.model.belongsTo(dbs.User.model, { foreignKey: 'developer_id', targetKey: 'id', as: 'developer' });
    }


    async getList() {
        return this.model.findAll({
            where: {
                activated: true,
                enabled: true,
            },
            attributes: {
                include: [['uid', 'game_uid']]
            },
            include: [{
                model: dbs.User.model,
                as: 'developer',
            }]
        })

        // return _.map(records, (record: any) => record.get({ plain: true }))
    }
}


export default (rdb: Sequelize) => new GameModel(rdb)
