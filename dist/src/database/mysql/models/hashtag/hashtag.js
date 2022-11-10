"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const model_1 = require("../../../_base/model");
const sequelize_1 = require("sequelize");
const globals_1 = require("../../../../commons/globals");
const _ = require("lodash");
class HashtagModel extends model_1.default {
    constructor() {
        super(...arguments);
        this.processAddTags = (game_id, hashtags, transaction) => __awaiter(this, void 0, void 0, function* () {
            hashtags = hashtags.replace(/\s|,/gi, '#');
            const tags = _.union(_.map(_.filter(hashtags.split('#'), tag => tag !== ''), tag => tag.trim()));
            const dup = yield globals_1.dbs.Hashtag.findAll({
                name: {
                    [sequelize_1.Op.in]: tags
                }
            });
            const newTags = _.difference(tags, _.map(dup, d => d.name));
            const bulkTag = _.map(newTags, tag => {
                return {
                    fixed: false,
                    name: tag,
                };
            });
            const records = yield this.bulkCreate(bulkTag, {
                transaction,
                updateOnDuplicate: ['name'],
                // returning: true,
                individualHooks: true
            });
            // ref_hash
            const newRef = _.union([..._.map(dup, r => r.id), ..._.map(records, r => r.id)]);
            const bulkRef = _.map(newRef, tag_id => {
                return {
                    ref_id: game_id,
                    ref_type: 'game',
                    tag_id: tag_id,
                };
            });
            yield globals_1.dbs.RefTag.bulkCreate(bulkRef, { transaction });
        });
        this.addTags = (game_id, hashtags, transaction) => __awaiter(this, void 0, void 0, function* () {
            return this.processAddTags(game_id, hashtags, transaction);
            // if ( transaction ) {
            //     return this.processAddTags(game_id, hashtags, transaction);
            // }
            // return await this.getTransaction(async (transaction: Transaction) => {
            //     return this.processAddTags(game_id, hashtags, transaction);
            // })
        });
    }
    initialize() {
        this.name = 'hashtag';
        this.attributes = {
            fixed: { type: sequelize_1.DataTypes.BOOLEAN, allowNull: false, defaultValue: false },
            name: { type: sequelize_1.DataTypes.STRING(50), allowNull: false, unique: true },
        };
    }
    afterSync() {
        const _super = Object.create(null, {
            afterSync: { get: () => super.afterSync }
        });
        return __awaiter(this, void 0, void 0, function* () {
            yield _super.afterSync.call(this);
            this.model.hasMany(globals_1.dbs.RefTag.model, { sourceKey: 'id', foreignKey: 'tag_id' });
            try {
                if ((yield this.model.count()) < 1) {
                    let games = yield globals_1.dbs.Game.findAll({});
                    games = _.map(games, game => game.get({ plain: true }));
                    for (let i = 0; i < games.length; i++) {
                        const game = games[i];
                        if (game.id === 65 || game.id === 82) {
                            console.log(game);
                        }
                        if (game.hashtags.length > 0) {
                            yield this.addTags(game.id, game.hashtags);
                        }
                    }
                }
            }
            catch (e) {
                console.error(e);
            }
        });
    }
    delTags(ref_id, tag, transaction) {
        return __awaiter(this, void 0, void 0, function* () {
            yield globals_1.dbs.RefTag.destroy({ ref_id }, transaction);
        });
    }
    getTagsLike(tag) {
        return __awaiter(this, void 0, void 0, function* () {
            const records = yield this.model.findAll({
                where: {
                    name: {
                        [sequelize_1.Op.like]: `${tag}%`
                    }
                },
            });
            return _.map(records, record => record.get({ plain: true }));
        });
    }
    getGamesById(id, { limit = 50, offset = 0 }) {
        return __awaiter(this, void 0, void 0, function* () {
            const record = yield this.model.findOne({
                where: { id },
                include: [{
                        model: globals_1.dbs.RefTag.model,
                        include: [{
                                model: globals_1.dbs.Game.model,
                                include: [{
                                        model: globals_1.dbs.User.model,
                                        where: {
                                            activated: true,
                                            banned: false,
                                            deleted_at: null,
                                        },
                                        required: true,
                                    }]
                            }],
                        limit: _.toNumber(limit),
                        offset: _.toNumber(offset),
                    }]
            });
            return record === null || record === void 0 ? void 0 : record.get({ plain: true });
        });
    }
    getGamesByTag(tag, { limit = 50, offset = 0 }) {
        return __awaiter(this, void 0, void 0, function* () {
            const record = yield this.model.findOne({
                where: { name: tag },
                include: [{
                        model: globals_1.dbs.RefTag.model,
                        include: [{
                                model: globals_1.dbs.Game.model,
                                order: [['count_over', 'desc'], ['count_heart', 'desc']],
                            }]
                    }],
                limit: _.toNumber(limit),
                offset: _.toNumber(offset),
            });
            return record === null || record === void 0 ? void 0 : record.get({ plain: true });
        });
    }
    getGamesByTagLike(tag) {
        return __awaiter(this, void 0, void 0, function* () {
            const record = yield this.model.findOne({
                where: {
                    name: {
                        [sequelize_1.Op.like]: `${tag}%`
                    }
                },
                include: [{
                        model: globals_1.dbs.RefTag.model,
                        include: [{
                                model: globals_1.dbs.Game.model,
                            }]
                    }]
            });
            return record === null || record === void 0 ? void 0 : record.get({ plain: true });
        });
    }
}
exports.default = (rdb) => new HashtagModel(rdb);
//# sourceMappingURL=hashtag.js.map