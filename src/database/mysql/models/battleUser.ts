import * as _ from 'lodash';
import Model from '../../../database/mysql/model';
import { DataTypes, Sequelize, Transaction, Op } from 'sequelize';
import { dbs } from '../../../commons/globals';


class BattleUserModel extends Model {
    protected initialize() {
        this.name = 'battleUser';
        this.attributes = {
            battle_uid:     { type: DataTypes.STRING(36), allowNull: false },
            user_uid:       { type: DataTypes.STRING(36), allowNull: false },
            user_name:      { type: DataTypes.STRING(36), defaultValue: 'noname' },
            // photo_url:      { type: DataTypes.STRING(250) },
            best_score:     { type: DataTypes.INTEGER, allowNull: false, defaultValue: -1 },
        };
    }


    async afterSync(): Promise<void> {
        this.model.belongsTo(dbs.User.model, {foreignKey: 'user_uid', targetKey: 'uid'});
        this.model.belongsTo(dbs.Battle.model, {foreignKey: 'battle_uid', target: 'uid'});
    }



    async findOrCreate(where: any, transaction?: Transaction) {
        let record = await this.model.findOne({
            where,
        });
        if ( !record ) {
            record = await this.model.create(where, {transaction});
        }

        return record
    }


    async updateBestScore({ battle_uid, user_uid, best_score }: any, transaction?: Transaction) {
        return this.update({ best_score }, {
                battle_uid,
                user_uid,
            }, transaction);
    }


    async updateUserName({ battle_uid, user_uid, user_name }: any, transaction?: Transaction) {
        return this.update({ user_name }, {
            where: {
                battle_uid,
                user_uid,
            },
            transaction
        })
    }


    async getRanking({ battle_uid }: any, transaction?: Transaction) {
        const records = await this.findAll({
            battle_uid,
            best_score: {
                [Op.gt]: 0,
            }
        }, {
            attributes: {
                exclude: ['deleted_at']
            },
            order: [['best_score', 'desc']],
        }, transaction);
        return _.map(records, (record: any, i: number) => {
            return {
                ranking: i + 1,
                user_uid: record.user_uid,
                name: record.user_name,
                score: record.best_score,
            }
        })
    }
}

export default (rdb: Sequelize) => new BattleUserModel(rdb);
