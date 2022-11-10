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
const enums_1 = require("../../../../commons/enums");
class UserSetting extends model_1.default {
    initialize() {
        this.name = 'userSetting';
        this.attributes = {
            user_id: { type: sequelize_1.DataTypes.INTEGER, allowNull: false, unique: true },
            app_theme: { type: sequelize_1.DataTypes.SMALLINT, allowNull: false, defaultValue: enums_1.eAppTheme.Default },
            app_theme_extra: { type: sequelize_1.DataTypes.SMALLINT },
            app_language: { type: sequelize_1.DataTypes.SMALLINT, allowNull: false, defaultValue: enums_1.eAppLang.KO },
            notify_alarm: { type: sequelize_1.DataTypes.BOOLEAN, allowNull: false, defaultValue: true },
            notify_battle: { type: sequelize_1.DataTypes.BOOLEAN, allowNull: false, defaultValue: true },
            notify_beat: { type: sequelize_1.DataTypes.BOOLEAN, allowNull: false, defaultValue: true },
            // notify_follow:      { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: true },
            notify_like: { type: sequelize_1.DataTypes.BOOLEAN, allowNull: false, defaultValue: true },
            notify_reply: { type: sequelize_1.DataTypes.BOOLEAN, allowNull: false, defaultValue: true },
        };
    }
    afterSync() {
        return __awaiter(this, void 0, void 0, function* () {
            this.model.belongsTo(globals_1.dbs.User.model, { foreignKey: 'user_id', targetKey: 'id' });
        });
    }
}
exports.default = (rdb) => new UserSetting(rdb);
//# sourceMappingURL=userSetting.js.map