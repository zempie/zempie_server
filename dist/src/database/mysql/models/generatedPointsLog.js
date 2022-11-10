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
const model_1 = require("../../_base/model");
const sequelize_1 = require("sequelize");
const enums_1 = require("../../../commons/enums");
class GeneratedPointsLogModel extends model_1.default {
    initialize() {
        this.name = 'generatedPointsLog';
        this.attributes = {
            user_id: { type: sequelize_1.DataTypes.INTEGER, allowNull: false },
            game_id: { type: sequelize_1.DataTypes.INTEGER, allowNull: false },
            pub_type: { type: sequelize_1.DataTypes.SMALLINT, allowNull: false, defaultValue: enums_1.ePubType.GamePlay },
            exchanged: { type: sequelize_1.DataTypes.BOOLEAN, allowNull: false, defaultValue: false },
        };
    }
    createPoints({ user_id, game_id, pub_type }) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.create({
                user_id,
                game_id,
                pub_type,
            });
        });
    }
}
exports.default = (rdb) => new GeneratedPointsLogModel(rdb);
//# sourceMappingURL=generatedPointsLog.js.map