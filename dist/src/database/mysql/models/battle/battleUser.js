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
class BattleUserModel extends model_1.default {
    initialize() {
        this.name = 'battleUser';
        this.attributes = {
            battle_uid: { type: sequelize_1.DataTypes.STRING(36), allowNull: false },
            user_uid: { type: sequelize_1.DataTypes.STRING(36), allowNull: false },
            name: { type: sequelize_1.DataTypes.STRING(20), defaultValue: 'noname' },
            best_score: { type: sequelize_1.DataTypes.INTEGER, allowNull: false, defaultValue: -1 },
        };
    }
    afterSync() {
        return __awaiter(this, void 0, void 0, function* () {
            this.model.belongsTo(globals_1.dbs.User.model, { foreignKey: 'user_uid', targetKey: 'uid' });
            this.model.belongsTo(globals_1.dbs.Battle.model, { foreignKey: 'battle_uid', target: 'uid' });
        });
    }
    updateBestScore({ battle_uid, user_uid, best_score }, transaction) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.update({ best_score }, {
                battle_uid,
                user_uid,
            }, transaction);
        });
    }
    updateUserName({ battle_uid, user_uid, name }, transaction) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.update({ name }, {
                battle_uid,
                user_uid,
            }, transaction);
        });
    }
    getRanking({ battle_uid }, transaction) {
        return __awaiter(this, void 0, void 0, function* () {
            const records = yield this.findAll({
                battle_uid,
                best_score: {
                    [sequelize_1.Op.gt]: 0,
                }
            }, {
                attributes: {
                    exclude: ['deleted_at']
                },
                include: [{
                        model: globals_1.dbs.User.model,
                    }],
                order: [['best_score', 'desc']],
            }, transaction);
            return _.map(records, (record, i) => {
                const user = record.user;
                return {
                    ranking: i + 1,
                    user_uid: record.user_uid,
                    name: user ? user.name : record.name,
                    picture: user ? user.picture : null,
                    channel_id: user ? user.channel_id : null,
                    score: record.best_score,
                };
            });
        });
    }
}
exports.default = (rdb) => new BattleUserModel(rdb);
//# sourceMappingURL=battleUser.js.map