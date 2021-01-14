"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const model_1 = require("../model");
const sequelize_1 = require("sequelize");
const sample = [
    {
        lang: 'ko',
        key: 'popular_games',
        value: '인기 게임',
    },
    {
        lang: 'en',
        key: 'popular_games',
        value: 'Popular Games',
    }
];
class StringModel extends model_1.default {
    initialize() {
        this.name = 'string';
        this.attributes = {
            lang: { type: sequelize_1.DataTypes.STRING(2), allowNull: false },
            key: { type: sequelize_1.DataTypes.STRING(100), allowNull: false },
            value: { type: sequelize_1.DataTypes.STRING(100), allowNull: false },
        };
    }
}
exports.default = (rdb) => new StringModel(rdb);
//# sourceMappingURL=string.js.map