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
const model_1 = require("../../model");
const sequelize_1 = require("sequelize");
const globals_1 = require("../../../../commons/globals");
const utils_1 = require("../../../../commons/utils");
class GameModel extends model_1.default {
    initialize() {
        this.name = 'game';
        this.attributes = {
            uid: { type: sequelize_1.DataTypes.UUID, allowNull: false },
            activated: { type: sequelize_1.DataTypes.BOOLEAN, allowNull: false, defaultValue: false },
            enabled: { type: sequelize_1.DataTypes.BOOLEAN, allowNull: false, defaultValue: false },
            official: { type: sequelize_1.DataTypes.BOOLEAN, allowNull: false, defaultValue: false },
            user_id: { type: sequelize_1.DataTypes.INTEGER },
            pathname: { type: sequelize_1.DataTypes.STRING(50), allowNull: false, unique: true },
            title: { type: sequelize_1.DataTypes.STRING(50), allowNull: false, defaultValue: '' },
            description: { type: sequelize_1.DataTypes.STRING(200), defaultValue: '' },
            version: { type: sequelize_1.DataTypes.STRING(20), defaultValue: '0.0.1' },
            control_type: { type: sequelize_1.DataTypes.SMALLINT, defaultValue: 0 },
            hashtags: { type: sequelize_1.DataTypes.STRING, allowNull: false },
            count_start: { type: sequelize_1.DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
            count_over: { type: sequelize_1.DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
            url_game: { type: sequelize_1.DataTypes.STRING },
            url_thumb: { type: sequelize_1.DataTypes.STRING },
            url_thumb_gif: { type: sequelize_1.DataTypes.STRING },
            url_title: { type: sequelize_1.DataTypes.STRING },
        };
    }
    afterSync() {
        return __awaiter(this, void 0, void 0, function* () {
            this.model.belongsTo(globals_1.dbs.User.model);
            if (process.env.NODE_ENV !== 'production') {
                if ((yield this.model.count()) < 1) {
                    const sampleGames = [
                        {
                            // uid: uuid(),
                            pathname: 'test-path',
                            title: 'test-title',
                            genre_tags: 'arcade,puzzle,knight',
                        }
                    ];
                    yield this.bulkCreate(sampleGames);
                }
            }
            const desc = yield this.model.sequelize.queryInterface.describeTable(this.model.tableName);
            if (!desc['url_thumb_gif']) {
                this.model.sequelize.queryInterface.addColumn(this.model.tableName, 'url_thumb_gif', {
                    type: sequelize_1.DataTypes.STRING,
                    after: 'url_thumb'
                });
            }
        });
    }
    getList({ limit = 50, offset = 0, official, sort = 'id', dir = 'asc' }) {
        return __awaiter(this, void 0, void 0, function* () {
            const where = {
                activated: true,
                enabled: true,
            };
            if (official) {
                where.official = utils_1.parseBoolean(official);
            }
            return yield this.model.findAll({
                where,
                // attributes: {
                //     include: [['uid', 'game_uid']]
                // },
                include: [{
                        model: globals_1.dbs.User.model,
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
            });
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
                        required: true,
                    }],
            });
            return record.get({ plain: true });
        });
    }
}
exports.default = (rdb) => new GameModel(rdb);
//# sourceMappingURL=game.js.map