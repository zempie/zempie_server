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
class UserReportResultModel extends model_1.default {
    initialize() {
        this.name = 'userReportResult';
        this.attributes = {
            report_id: { type: sequelize_1.DataTypes.INTEGER, allowNull: false },
            admin_id: { type: sequelize_1.DataTypes.INTEGER, allowNull: false },
            content: { type: sequelize_1.DataTypes.STRING(500), allowNull: false },
        };
    }
    afterSync() {
        const _super = Object.create(null, {
            afterSync: { get: () => super.afterSync }
        });
        return __awaiter(this, void 0, void 0, function* () {
            yield _super.afterSync.call(this);
            this.model.belongsTo(globals_1.dbs.UserReport.model, { foreignKey: 'report_id', as: 'report' });
            this.model.belongsTo(globals_1.dbs.Admin.model);
        });
    }
}
exports.default = (rdb) => new UserReportResultModel(rdb);
//# sourceMappingURL=userReportResult.js.map