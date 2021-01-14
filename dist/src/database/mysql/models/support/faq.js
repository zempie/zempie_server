"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = require("sequelize");
const model_1 = require("../../model");
class FaqModel extends model_1.default {
    initialize() {
        this.name = 'faq';
        this.attributes = {
            category: { type: sequelize_1.DataTypes.SMALLINT, allowNull: false, defaultValue: 0 },
            q: { type: sequelize_1.DataTypes.STRING(100), allowNull: false },
            a: { type: sequelize_1.DataTypes.STRING(500), allowNull: false },
            url_img: { type: sequelize_1.DataTypes.STRING },
        };
    }
}
exports.default = (rdb) => new FaqModel(rdb);
//# sourceMappingURL=faq.js.map