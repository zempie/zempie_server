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
const model_1 = require("../../model");
const sequelize_1 = require("sequelize");
const utils_1 = require("../../../../commons/utils");
class GameHeartModel extends model_1.default {
    constructor() {
        super(...arguments);
        this.likeIt = (game_id, user_uid, activated) => __awaiter(this, void 0, void 0, function* () {
            let changed = false;
            return yield this.getTransaction((transaction) => __awaiter(this, void 0, void 0, function* () {
                const record = yield this.findOne({ game_id, user_uid }, transaction);
                if (record) {
                    if (record.activated !== utils_1.parseBoolean(activated)) {
                        record.activated = activated;
                        yield record.save({ transaction });
                        changed = true;
                    }
                }
                else {
                    yield this.create({ game_id, user_uid, activated: true });
                    changed = true;
                }
                return changed;
            }));
        });
    }
    initialize() {
        this.name = 'gameHeart';
        this.attributes = {
            game_id: { type: sequelize_1.DataTypes.INTEGER, allowNull: false, unique: 'compositeIndex' },
            user_uid: { type: sequelize_1.DataTypes.STRING, allowNull: false, unique: 'compositeIndex' },
            activated: { type: sequelize_1.DataTypes.BOOLEAN, allowNull: false, defaultValue: false },
        };
    }
}
exports.default = (rdb) => new GameHeartModel(rdb);
//# sourceMappingURL=gameHeart.js.map