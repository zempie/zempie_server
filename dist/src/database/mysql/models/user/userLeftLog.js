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
const globals_1 = require("../../../../commons/globals");
const sequelize_1 = require("sequelize");
var EReasonLeft;
(function (EReasonLeft) {
    EReasonLeft[EReasonLeft["just_because"] = 0] = "just_because";
    EReasonLeft[EReasonLeft["no_zem"] = 1] = "no_zem";
    EReasonLeft[EReasonLeft["etc"] = 2] = "etc";
})(EReasonLeft || (EReasonLeft = {}));
class UserLeftLog extends model_1.default {
    initialize() {
        this.name = 'userLeftLog';
        this.attributes = {
            user_uid: { type: sequelize_1.DataTypes.STRING(36) },
            reason_num: { type: sequelize_1.DataTypes.SMALLINT, allowNull: false },
            reason_text: { type: sequelize_1.DataTypes.STRING(100) },
        };
    }
    afterSync() {
        const _super = Object.create(null, {
            afterSync: { get: () => super.afterSync }
        });
        return __awaiter(this, void 0, void 0, function* () {
            yield _super.afterSync.call(this);
            this.model.belongsTo(globals_1.dbs.User.model, { foreignKey: 'user_uid', targetKey: 'uid' });
        });
    }
}
exports.default = (rdb) => new UserLeftLog(rdb);
//# sourceMappingURL=userLeftLog.js.map