"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const model_1 = require("../../model");
const sequelize_1 = require("sequelize");
class UserClaimModel extends model_1.default {
    initialize() {
        this.name = 'userClaim';
        this.attributes = {
            user_id: { type: sequelize_1.DataTypes.INTEGER, allowNull: false },
            user_uid: { type: sequelize_1.DataTypes.STRING(36), allowNull: false },
            data: { type: sequelize_1.DataTypes.JSON, allowNull: false },
        };
    }
}
exports.default = (rdb) => new UserClaimModel(rdb);
//# sourceMappingURL=userClaim.js.map