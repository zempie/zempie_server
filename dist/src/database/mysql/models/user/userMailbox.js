"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const model_1 = require("../../model");
const sequelize_1 = require("sequelize");
class UserMailboxModel extends model_1.default {
    initialize() {
        this.name = 'userMailbox';
        this.attributes = {
            user_id: { type: sequelize_1.DataTypes.INTEGER, allowNull: false },
            is_read: { type: sequelize_1.DataTypes.BOOLEAN, allowNull: false, defaultValue: false },
            title: { type: sequelize_1.DataTypes.STRING(100), allowNull: false },
            content: { type: sequelize_1.DataTypes.STRING(500), allowNull: false },
        };
    }
}
exports.default = (rdb) => new UserMailboxModel(rdb);
//# sourceMappingURL=userMailbox.js.map