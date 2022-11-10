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
const sequelize_1 = require("sequelize");
const model_1 = require("../../../_base/model");
const utils_1 = require("../../../../commons/utils");
class UserGameEmotionModel extends model_1.default {
    constructor() {
        super(...arguments);
        this.feelLike = (game_id, user_uid, emotion, activated) => __awaiter(this, void 0, void 0, function* () {
            let changed = false;
            return yield this.getTransaction((transaction) => __awaiter(this, void 0, void 0, function* () {
                const record = yield this.findOne({ game_id, user_uid, emotion }, transaction);
                if (record) {
                    if (record.activated !== (0, utils_1.parseBoolean)(activated)) {
                        record.activated = activated;
                        yield record.save({ transaction });
                        changed = true;
                    }
                }
                else {
                    yield this.create({ game_id, user_uid, emotion, activated: true });
                    changed = true;
                }
                return changed;
            }));
        });
    }
    initialize() {
        this.name = 'userGameEmotion';
        this.attributes = {
            user_uid: { type: sequelize_1.DataTypes.STRING(36), allowNull: false, unique: 'compositeIndex' },
            game_id: { type: sequelize_1.DataTypes.INTEGER, allowNull: false, unique: 'compositeIndex' },
            emotion: { type: sequelize_1.DataTypes.STRING(4), allowNull: false, unique: 'compositeIndex' },
            activated: { type: sequelize_1.DataTypes.BOOLEAN, allowNull: false, defaultValue: false },
        };
    }
}
exports.default = (rdb) => new UserGameEmotionModel(rdb);
//# sourceMappingURL=userGameEmotion.js.map