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
const _ = require("lodash");
const model_1 = require("../../../_base/model");
const sequelize_1 = require("sequelize");
const globals_1 = require("../../../../commons/globals");
const utils_1 = require("../../../../commons/utils");
const enums_1 = require("../../../../commons/enums");
class GameModel extends model_1.default {
    constructor() {
        super(...arguments);
        this.getListWithUser = (where, options = {}) => __awaiter(this, void 0, void 0, function* () {
            return yield this.model.findAll(Object.assign({ where, include: [
                    {
                        model: globals_1.dbs.GameEmotion.model,
                        as: 'emotions',
                    },
                    {
                        model: globals_1.dbs.User.model,
                        where: {
                            activated: true,
                            banned: false,
                            deleted_at: null,
                        },
                        required: false,
                    }
                ] }, options));
        });
    }
    initialize() {
        this.name = 'game';
        this.attributes = {
            // uid:                { type: DataTypes.UUID, allowNull: false },
            activated: { type: sequelize_1.DataTypes.BOOLEAN, allowNull: false, defaultValue: false },
            enabled: { type: sequelize_1.DataTypes.BOOLEAN, allowNull: false, defaultValue: false },
            official: { type: sequelize_1.DataTypes.BOOLEAN, defaultValue: false },
            category: { type: sequelize_1.DataTypes.INTEGER, allowNull: false, defaultValue: enums_1.eGameCategory.Challenge },
            user_id: { type: sequelize_1.DataTypes.INTEGER },
            pathname: { type: sequelize_1.DataTypes.STRING(50), allowNull: false, unique: true },
            title: { type: sequelize_1.DataTypes.STRING(50), allowNull: false, defaultValue: '' },
            description: { type: sequelize_1.DataTypes.STRING(2000), defaultValue: '' },
            version: { type: sequelize_1.DataTypes.STRING(20), defaultValue: '0.0.1' },
            stage: { type: sequelize_1.DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
            support_platform: { type: sequelize_1.DataTypes.INTEGER, defaultValue: 0 },
            game_type: { type: sequelize_1.DataTypes.INTEGER, defaultValue: 1 },
            control_type: { type: sequelize_1.DataTypes.SMALLINT, defaultValue: 0 },
            hashtags: { type: sequelize_1.DataTypes.STRING, allowNull: false },
            count_start: { type: sequelize_1.DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
            count_over: { type: sequelize_1.DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
            count_heart: { type: sequelize_1.DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
            url_game: { type: sequelize_1.DataTypes.STRING },
            url_thumb: { type: sequelize_1.DataTypes.STRING },
            url_thumb_webp: { type: sequelize_1.DataTypes.STRING },
            url_thumb_gif: { type: sequelize_1.DataTypes.STRING },
            url_banner: { type: sequelize_1.DataTypes.STRING }
            // url_title:          { type: DataTypes.STRING },
        };
    }
    afterSync() {
        return __awaiter(this, void 0, void 0, function* () {
            this.model.belongsTo(globals_1.dbs.User.model);
            this.model.hasOne(globals_1.dbs.GameEmotion.model, { sourceKey: 'id', foreignKey: 'game_id', as: 'emotions' });
            this.model.hasOne(globals_1.dbs.GameJam.model, { sourceKey: 'id', foreignKey: 'game_id', as: 'gameJam' });
            const desc = yield this.model.sequelize.queryInterface.describeTable(this.model.tableName);
            if (!desc['stage']) {
                this.model.sequelize.queryInterface.addColumn(this.model.tableName, 'stage', {
                    type: sequelize_1.DataTypes.INTEGER,
                    allowNull: false,
                    after: 'version'
                });
            }
            if (!desc['url_banner']) {
                this.model.sequelize.queryInterface.addColumn(this.model.tableName, 'url_banner', {
                    type: sequelize_1.DataTypes.STRING,
                    allowNull: true,
                    after: 'url_thumb_gif'
                });
            }
            if (!desc['support_platform']) {
                this.model.sequelize.queryInterface.addColumn(this.model.tableName, 'support_platform', {
                    type: sequelize_1.DataTypes.INTEGER,
                    defaultValue: 0,
                    after: 'stage'
                });
            }
            if (!desc['game_type']) {
                this.model.sequelize.queryInterface.addColumn(this.model.tableName, 'game_type', {
                    type: sequelize_1.DataTypes.INTEGER,
                    defaultValue: 1,
                    after: 'support_platform'
                });
            }
            // if ( !desc['category'] ) {
            //     this.model.sequelize.queryInterface.addColumn(this.model.tableName, 'category', {
            //         type: DataTypes.SMALLINT,
            //         allowNull: false,
            //         defaultValue: eGameCategory.Challenge,
            //         after: 'official'
            //     })
            // }
        });
    }
    getInfo(where) {
        return __awaiter(this, void 0, void 0, function* () {
            const record = yield this.model.findOne({
                where,
                // attributes: {
                //     exclude: ['id', 'created_at', 'updated_at', 'deleted_at']
                // },
                include: [{
                        model: globals_1.dbs.User.model,
                        where: {
                            activated: true,
                            banned: false,
                            deleted_at: null,
                        },
                        required: false,
                    }, {
                        model: globals_1.dbs.GameEmotion.model,
                        as: 'emotions',
                    }],
            });
            return record.get({ plain: true });
        });
    }
    getList({ official, category, limit = 50, offset = 0, sort = 'id', dir = 'desc' }) {
        return __awaiter(this, void 0, void 0, function* () {
            // where
            const where = {
                activated: true,
                enabled: true,
                category: {
                    [sequelize_1.Op.ne]: 2,
                },
            };
            if (category) {
                const ctgry = String(category).split(',');
                where.category = { [sequelize_1.Op.in]: ctgry };
            }
            else {
                if (official) {
                    where.official = (0, utils_1.parseBoolean)(official);
                }
            }
            // order by
            dir = 'desc';
            // dir = dir.toLowerCase();
            // if ( dir === 'd' || dir === 'desc' ) {
            //     dir = 'desc';
            // }
            // else {
            //     dir = 'asc';
            // }
            let order = [];
            sort = sort.toString().toLowerCase();
            if (sort === 'play' || sort === 'p') {
                order.push(['count_over', dir]);
                order.push(['id', dir]);
            }
            else if (sort === 'heart' || sort === 'h') {
                order.push(['count_heart', dir]);
                order.push(['id', dir]);
            }
            else if (sort === 'title' || sort === 't' || sort === 'a') {
                order.push(['title', 'asc']);
                order.push(['id', 'asc']);
            }
            else if (sort === 'latest' || sort === 'l' || sort === 'c') {
                order.push(['created_at', 'desc']);
                order.push(['id', 'desc']);
            }
            else {
                // order.push(['id', 'asc'])
                order.push(['created_at', 'desc']);
            }
            return this.getListWithUser(where, {
                order,
                include: [
                    {
                        model: globals_1.dbs.GameJam.model,
                        as: 'gameJam',
                    },
                    {
                        model: globals_1.dbs.User.model,
                        where: {
                            uid: {
                                //zemplay 관리 계정
                                [sequelize_1.Op.ne]: process.env.ZEMPLAY_UID || ''
                            }
                        }
                    }
                ],
                limit: _.toNumber(limit),
                offset: _.toNumber(offset),
            });
        });
    }
}
exports.default = (rdb) => new GameModel(rdb);
//# sourceMappingURL=game.js.map