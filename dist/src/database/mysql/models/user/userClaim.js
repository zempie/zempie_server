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
class UserClaimModel extends model_1.default {
    initialize() {
        this.name = 'userClaim';
        this.attributes = {
            user_id: { type: sequelize_1.DataTypes.INTEGER, allowNull: false },
            user_uid: { type: sequelize_1.DataTypes.STRING(36), allowNull: false },
            data: { type: sequelize_1.DataTypes.JSON, allowNull: false },
        };
    }
    createDefault(user_id, user_uid) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.create({
                user_id,
                user_uid,
                data: JSON.stringify({
                    zempie: {
                        is_developer: false,
                        deny: {},
                    }
                })
            });
        });
    }
    getZempieClaim(user_id, user_uid) {
        return __awaiter(this, void 0, void 0, function* () {
            let userClaim = yield this.findOne({ user_id });
            if (!userClaim) {
                userClaim = yield this.createDefault(user_id, user_uid);
            }
            return userClaim;
        });
    }
}
exports.default = (rdb) => new UserClaimModel(rdb);
//# sourceMappingURL=userClaim.js.map