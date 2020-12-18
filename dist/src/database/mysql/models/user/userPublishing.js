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
const globals_1 = require("../../../../commons/globals");
const enums_1 = require("../../../../commons/enums");
class UserPublishingModel extends model_1.default {
    initialize() {
        this.name = 'userPublishing';
        this.attributes = {
            user_id: { type: sequelize_1.DataTypes.INTEGER, allowNull: false },
            game_id: { type: sequelize_1.DataTypes.INTEGER, allowNull: false },
            count_open: { type: sequelize_1.DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
            count_play: { type: sequelize_1.DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
            count_ad: { type: sequelize_1.DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
        };
    }
    afterSync() {
        return __awaiter(this, void 0, void 0, function* () {
            this.model.belongsTo(globals_1.dbs.User.model);
            this.model.belongsTo(globals_1.dbs.Game.model);
        });
    }
    findAll({ user_id }, transaction) {
        return __awaiter(this, void 0, void 0, function* () {
        });
    }
    updateCount({ user_id, game_id, pub_type }, transaction) {
        return __awaiter(this, void 0, void 0, function* () {
            const { record, isNew } = yield this.findOrCreate({
                user_id,
                game_id,
            }, undefined, transaction);
            let type = '';
            switch (pub_type) {
                case enums_1.ePubType.GamePlay:
                case enums_1.ePubType.PubGamePlay:
                    type = 'play';
                    break;
                case enums_1.ePubType.AD:
                    type = 'ad';
                    break;
            }
            record[`count_${type}`] += 1;
            yield record.save({ transaction });
        });
    }
}
exports.default = (rdb) => new UserPublishingModel(rdb);
//# sourceMappingURL=userPublishing.js.map