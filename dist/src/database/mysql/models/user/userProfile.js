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
 * 플랫폼 서비스 내에서 발생하는 사용자 정보
 */
class UserProfileModel extends model_1.default {
    initialize() {
        this.name = 'userProfile';
        this.attributes = {
            user_id: { type: sequelize_1.DataTypes.INTEGER, allowNull: false },
            level: { type: sequelize_1.DataTypes.MEDIUMINT, allowNull: false, defaultValue: 1 },
            exp: { type: sequelize_1.DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
            following_cnt: { type: sequelize_1.DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
            followers_cnt: { type: sequelize_1.DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
            state_msg: { type: sequelize_1.DataTypes.STRING(100) },
            description: { type: sequelize_1.DataTypes.STRING(500) },
            url_banner: { type: sequelize_1.DataTypes.STRING(250) },
            // points:         { type: DataTypes.INTEGER.UNSIGNED, allowNull: false, defaultValue: 0 },
        };
    }
    afterSync() {
        return __awaiter(this, void 0, void 0, function* () {
            this.model.belongsTo(globals_1.dbs.User.model, { foreignKey: 'user_id', targetKey: 'id' });
        });
    }
}
exports.default = (rdb) => new UserProfileModel(rdb);
//# sourceMappingURL=userProfile.js.map