import Model from '../../model';
import { DataTypes, Op, Sequelize, Transaction } from 'sequelize';
import { dbs } from '../../../../commons/globals';
import * as _ from 'lodash';
import { getGameData } from '../../../../controllers/_common';

class HashtagModel extends Model {
    protected initialize(): void {
        this.name = 'hashtag';
        this.attributes = {
            fixed:  { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false },
            name:   { type: DataTypes.STRING(50), allowNull: false, unique: true },
        }
    }

    async afterSync(): Promise<void> {
        await super.afterSync();

        this.model.hasMany(dbs.RefTag.model, { sourceKey: 'id', foreignKey: 'tag_id' });
    }


    async addTags(game_id: number, hashtags: string, transaction: Transaction) {
        hashtags = hashtags.replace(/\s|,/gi, '#');
        const tags = _.map(_.filter(hashtags.split('#'), tag => tag !== ''), tag => tag.trim());
        const dup = await dbs.Hashtag.findAll({
            name: {
                [Op.in]: tags
            }
        });

        const newTags = _.difference(tags, _.map(dup, d => d.name));
        const bulkTag: any = _.map(newTags, tag => {
            return {
                fixed: false,
                name: tag,
            }
        });
        const records = await this.bulkCreate(bulkTag, {
            transaction,
            updateOnDuplicate: ['name'],
            // returning: true,
            individualHooks: true
        });

        // ref_hash
        const newRef = [..._.map(dup, r => r.id), ..._.map(records, r => r.id)];
        const bulkRef: any = _.map(newRef, tag_id => {
            return {
                ref_id: game_id,
                ref_type: 'game',
                tag_id: tag_id,
            }
        });
        await dbs.RefTag.bulkCreate(bulkRef, {transaction});
    }


    async delTags(ref_id: number, tag: string, transaction?: Transaction) {
        await dbs.RefTag.destroy({ref_id}, transaction);
    }


    async getTagsLike(tag: string) {
        const records = await this.model.findAll({
            where: {
                name: {
                    [Op.like]: `${tag}%`
                }
            },
        });
        return _.map(records, record => record.get({ plain: true }))
    }
    async getGamesById(id: number) {
        const records = await this.model.findAll({
            where: { id },
            include: [{
                model: dbs.Game.model,
            }]
        });
        return _.map(records, record => record.get({ plain: true }))
    }


    async getGamesByTag(tag: string) {
        const record = await this.model.findOne({
            where: { name: tag },
            include: [{
                model: dbs.RefTag.model,
                include: [{
                    model: dbs.Game.model,
                }]
            }]
        });

        return record?.get({ plain: true })
    }

    async getGamesByTagLike(tag: string) {
        const record = await this.model.findOne({
            where: {
                name: {
                    [Op.like]: `${tag}%`
                }
            },
            include: [{
                model: dbs.RefTag.model,
                include: [{
                    model: dbs.Game.model,
                }]
            }]
        });

        return record?.get({ plain: true })
    }
}


export default (rdb: Sequelize) => new HashtagModel(rdb)
