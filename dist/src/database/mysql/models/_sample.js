"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const model_1 = require("../../../database/mysql/model");
const sequelize_1 = require("sequelize");
class SampleModel extends model_1.default {
    initialize() {
        this.name = 'sample';
        this.attributes = {
            sample_attribute_1: { type: sequelize_1.DataTypes.INTEGER, allowNull: false },
            sample_attribute_2: { type: sequelize_1.DataTypes.STRING(20), allowNull: false },
        };
    }
}
exports.default = (rdb) => new SampleModel(rdb);
//# sourceMappingURL=_sample.js.map