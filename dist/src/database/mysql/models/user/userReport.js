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
const enums_1 = require("../../../../commons/enums");
const globals_1 = require("../../../../commons/globals");
/**
 * 신고 하기
 * user_id: 신고한 유저
 * target_id: 신고 당한 유저/게임/댓글/...
 */
class UserReportModel extends model_1.default {
    initialize() {
        this.name = 'userReport';
        this.attributes = {
            user_id: { type: sequelize_1.DataTypes.INTEGER, allowNull: false },
            target_type: { type: sequelize_1.DataTypes.SMALLINT, allowNull: false, defaultValue: enums_1.eReportType.Game },
            target_id: { type: sequelize_1.DataTypes.INTEGER, allowNull: false },
            reason_num: { type: sequelize_1.DataTypes.SMALLINT, allowNull: false },
            reason: { type: sequelize_1.DataTypes.STRING(300) },
            is_done: { type: sequelize_1.DataTypes.BOOLEAN, allowNull: false },
        };
    }
    afterSync() {
        const _super = Object.create(null, {
            afterSync: { get: () => super.afterSync }
        });
        return __awaiter(this, void 0, void 0, function* () {
            yield _super.afterSync.call(this);
            this.model.belongsTo(globals_1.dbs.User.model, { foreignKey: 'target_id', targetKey: 'id' });
            this.model.belongsTo(globals_1.dbs.Game.model, { foreignKey: 'target_id', targetKey: 'id' });
        });
    }
}
exports.default = (rdb) => new UserReportModel(rdb);
//# sourceMappingURL=userReport.js.map