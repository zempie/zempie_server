"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const model_1 = require("../../model");
const sequelize_1 = require("sequelize");
class GameEmotionModel extends model_1.default {
    initialize() {
        this.name = 'gameEmotion';
        this.attributes = {
            game_id: { type: sequelize_1.DataTypes.INTEGER, allowNull: false },
            e1: { type: sequelize_1.DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
            e2: { type: sequelize_1.DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
            e3: { type: sequelize_1.DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
            e4: { type: sequelize_1.DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
            e5: { type: sequelize_1.DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
        };
    }
}
exports.default = (rdb) => new GameEmotionModel(rdb);
//# sourceMappingURL=gameEmotion.js.map