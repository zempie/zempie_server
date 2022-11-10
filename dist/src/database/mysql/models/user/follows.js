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
const globals_1 = require("../../../../commons/globals");
const sequelize_1 = require("sequelize");
class FollowModel extends model_1.default {
    initialize() {
        this.name = 'follow';
        this.attributes = {
            user_id: { type: sequelize_1.DataTypes.INTEGER },
            follow_id: { type: sequelize_1.DataTypes.INTEGER },
        };
        this.options = {
            freezeTableName: true
        };
    }
    afterSync() {
        return __awaiter(this, void 0, void 0, function* () {
            const desc = yield this.model.sequelize.queryInterface.describeTable(this.model.tableName);
            if (!desc['user_id']) {
                this.model.sequelize.queryInterface.addColumn(this.model.tableName, 'user_id', {
                    type: sequelize_1.DataTypes.INTEGER,
                    after: 'id'
                });
            }
            if (!desc['follow_id']) {
                this.model.sequelize.queryInterface.addColumn(this.model.tableName, 'follow_id', {
                    type: sequelize_1.DataTypes.INTEGER,
                    after: 'user_id'
                });
            }
        });
    }
    followingCnt(user_id) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.model.count({
                where: {
                    user_id: user_id
                }
            });
        });
    }
    followerCnt(user_id) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.model.count({
                where: {
                    follow_id: user_id
                }
            });
        });
    }
    followStatus(user_uid, follow_id) {
        var _a;
        return __awaiter(this, void 0, void 0, function* () {
            const user = yield globals_1.dbs.User.findOne({ uid: user_uid });
            return (_a = yield this.model.findOne({
                where: { user_id: user.id, follow_id }
            })) !== null && _a !== void 0 ? _a : false;
        });
    }
}
exports.default = (rdb) => new FollowModel(rdb);
//# sourceMappingURL=follows.js.map