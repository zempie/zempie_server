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
/**
 * 플랫폼 서비스 내에서 발생하는 사용자의 게임 정보
 * 최고 점수 기록
 */
class UserGameModel extends model_1.default {
    initialize() {
        this.name = 'userGame';
        this.attributes = {
            // user_id:        { type: DataTypes.INTEGER, allowNull: false },
            // game_id:        { type: DataTypes.INTEGER, allowNull: false },
            user_uid: { type: sequelize_1.DataTypes.STRING(36), allowNull: false },
            game_uid: { type: sequelize_1.DataTypes.STRING(36), allowNull: false },
            score: { type: sequelize_1.DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
        };
    }
    afterSync() {
        return __awaiter(this, void 0, void 0, function* () {
            this.model.belongsTo(globals_1.dbs.User.model, { foreignKey: 'user_uid', targetKey: 'uid' });
            this.model.belongsTo(globals_1.dbs.Game.model, { foreignKey: 'game_uid', targetKey: 'uid' });
            // this.model.belongsTo(dbs.Follow.model, { foreignKey: 'user_uid', target: 'target_uid' });
        });
    }
}
exports.default = (rdb) => new UserGameModel(rdb);
//# sourceMappingURL=userGame.js.map