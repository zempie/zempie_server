"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const model_1 = require("../model");
const sequelize_1 = require("sequelize");
const enums_1 = require("../../../commons/enums");
class ItemModel extends model_1.default {
    initialize() {
        this.name = 'item';
        this.attributes = {
            name: { type: sequelize_1.DataTypes.STRING(20), allowNull: false },
            used_type: { type: sequelize_1.DataTypes.SMALLINT, allowNull: false, defaultValue: enums_1.eItemUsingType.Permanent },
            // is_using:       { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: true },
            period: { type: sequelize_1.DataTypes.INTEGER },
            is_used: { type: sequelize_1.DataTypes.BOOLEAN, allowNull: false, defaultValue: false },
        };
    }
}
exports.default = (rdb) => new ItemModel(rdb);
//# sourceMappingURL=item.js.map