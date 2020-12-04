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
const model_1 = require("../../model");
const sequelize_1 = require("sequelize");
const globals_1 = require("../../../../commons/globals");
class BattleModel extends model_1.default {
    initialize() {
        this.name = 'battle';
        this.attributes = {
            uid: { type: sequelize_1.DataTypes.STRING(36), allowNull: false },
            user_uid: { type: sequelize_1.DataTypes.STRING(36), allowNull: false },
            game_uid: { type: sequelize_1.DataTypes.STRING(36), allowNull: false },
            title: { type: sequelize_1.DataTypes.STRING(50) },
            activated: { type: sequelize_1.DataTypes.BOOLEAN, allowNull: false, defaultValue: true },
            user_count: { type: sequelize_1.DataTypes.MEDIUMINT, allowNull: false, defaultValue: 0 },
            end_at: { type: sequelize_1.DataTypes.DATE },
        };
    }
    afterSync() {
        return __awaiter(this, void 0, void 0, function* () {
            this.model.belongsTo(globals_1.dbs.User.model, { foreignKey: 'user_uid', targetKey: 'uid', as: 'host' });
            this.model.belongsTo(globals_1.dbs.Game.model, { foreignKey: 'game_uid', targetKey: 'uid' });
        });
    }
    get({ battle_uid }, transaction) {
        return __awaiter(this, void 0, void 0, function* () {
            const record = yield this.model.findOne({
                where: {
                    uid: battle_uid,
                },
                include: [{
                        model: globals_1.dbs.User.model,
                        attributes: ['uid', 'name', 'picture'],
                    }, {
                        model: globals_1.dbs.Game.model,
                        attributes: ['uid', 'pathname', 'title', 'version', 'control_type', 'url_game', 'url_thumb', 'url_title']
                    }]
            });
            return record.get({ plain: true });
        });
    }
    getInfo(uid) {
        return __awaiter(this, void 0, void 0, function* () {
            const record = yield this.model.findOne({
                where: { uid },
                attributes: {
                    exclude: ['id', 'created_at', 'updated_at', 'deleted_at']
                },
                include: [{
                        model: globals_1.dbs.User.model,
                        as: 'host',
                        attributes: {
                            exclude: ['id', 'created_at', 'updated_at', 'deleted_at']
                        },
                    }, {
                        model: globals_1.dbs.Game.model,
                        attributes: {
                            exclude: ['id', 'created_at', 'updated_at', 'deleted_at']
                        },
                        include: [{
                                model: globals_1.dbs.User.model,
                                attributes: {
                                    exclude: ['id', 'created_at', 'updated_at', 'deleted_at']
                                },
                                required: true,
                            }],
                    }]
            });
            return record.get({ plain: true });
        });
    }
}
exports.default = (rdb) => new BattleModel(rdb);
//# sourceMappingURL=battle.js.map