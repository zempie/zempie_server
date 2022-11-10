"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const model_1 = require("../../../_base/model");
const sequelize_1 = require("sequelize");
class UserExternalLinkModel extends model_1.default {
    initialize() {
        this.name = 'userExternalLink';
        this.attributes = {
            user_id: { type: sequelize_1.DataTypes.INTEGER, allowNull: false },
            name: { type: sequelize_1.DataTypes.STRING(30), allowNull: false },
            url_link: { type: sequelize_1.DataTypes.STRING(250), allowNull: false },
        };
    }
}
exports.default = (rdb) => new UserExternalLinkModel(rdb);
//# sourceMappingURL=userExternalLink.js.map