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
const model_1 = require("../../../_base/model");
const sequelize_1 = require("sequelize");
const globals_1 = require("../../../../commons/globals");
class GameJamModel extends model_1.default {
    initialize() {
        this.name = 'gameJam';
        this.attributes = {
            jam_id: { type: sequelize_1.DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
            title: { type: sequelize_1.DataTypes.STRING(100), allowNull: false, defaultValue: '' },
            game_id: { type: sequelize_1.DataTypes.INTEGER, allowNull: false, unique: 'compositeIndex' },
            user_id: { type: sequelize_1.DataTypes.INTEGER },
            is_awarded: { type: sequelize_1.DataTypes.BOOLEAN, allowNull: false, defaultValue: false },
        };
    }
    afterSync() {
        return __awaiter(this, void 0, void 0, function* () {
            this.model.belongsTo(globals_1.dbs.User.model);
        });
    }
}
exports.default = (rdb) => new GameJamModel(rdb);
//# sourceMappingURL=gameJam.js.map