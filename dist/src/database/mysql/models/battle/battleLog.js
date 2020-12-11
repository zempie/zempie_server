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
class BattleLogModel extends model_1.default {
    initialize() {
        this.name = 'battleLog';
        this.attributes = {
            battle_uid: { type: sequelize_1.DataTypes.STRING(36), allowNull: false },
            battle_user_id: { type: sequelize_1.DataTypes.INTEGER, allowNull: false },
            score: { type: sequelize_1.DataTypes.INTEGER, allowNull: false, defaultValue: -1 },
        };
    }
    afterSync() {
        return __awaiter(this, void 0, void 0, function* () {
            this.model.belongsTo(globals_1.dbs.User.model, { foreignKey: 'user_uid', targetKey: 'uid' });
            this.model.belongsTo(globals_1.dbs.Battle.model, { foreignKey: 'battle_uid', targetKey: 'uid' });
        });
    }
    updateScore({ id, score }, transaction) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.update({ score }, { id }, transaction);
        });
    }
}
exports.default = (rdb) => new BattleLogModel(rdb);
//# sourceMappingURL=battleLog.js.map