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
/**
 * 플랫폼 서비스 내에서 발생하는 사용자의 게임 결과
 * 모든 게임 로그
 */
class GameLogModel extends model_1.default {
    initialize() {
        this.name = 'gameLog';
        this.attributes = {
            user_uid: { type: sequelize_1.DataTypes.STRING(36) },
            game_id: { type: sequelize_1.DataTypes.INTEGER, allowNull: false },
            score: { type: sequelize_1.DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
            playtime: { type: sequelize_1.DataTypes.INTEGER, allowNull: false },
        };
    }
    afterSync() {
        return __awaiter(this, void 0, void 0, function* () {
            this.model.belongsTo(globals_1.dbs.User.model, { foreignKey: 'user_uid', targetKey: 'uid' });
        });
    }
}
exports.default = (rdb) => new GameLogModel(rdb);
//# sourceMappingURL=gameLog.js.map