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
const model_1 = require("../../../database/mysql/model");
const sequelize_1 = require("sequelize");
const globals_1 = require("../../../commons/globals");
const errorCodes_1 = require("../../../commons/errorCodes");
/**
 * follower, following
 */
class FollowModel extends model_1.default {
    initialize() {
        this.name = 'follow';
        this.attributes = {
            user_uid: { type: sequelize_1.DataTypes.STRING(36), allowNull: false },
            target_uid: { type: sequelize_1.DataTypes.STRING(36), allowNull: false },
        };
    }
    afterSync() {
        return __awaiter(this, void 0, void 0, function* () {
            this.model.belongsTo(globals_1.dbs.User.model, { foreignKey: 'user_uid', targetKey: 'uid', as: 'user' });
            this.model.belongsTo(globals_1.dbs.User.model, { foreignKey: 'target_uid', targetKey: 'uid', as: 'target' });
            // this.model.belongsTo(dbs.UserGame.model, { foreignKey: 'target_id', targetKey: 'user_id', as: 'gameRecord' });
        });
    }
    follow({ user_uid, target_uid }, transaction) {
        return __awaiter(this, void 0, void 0, function* () {
            const record = yield this.findOne({ user_uid, target_uid }, transaction);
            if (record) {
                throw errorCodes_1.CreateError(errorCodes_1.ErrorCodes.ALREADY_FOLLOWING_TARGET);
            }
            yield this.create({ user_uid, target_uid }, transaction);
        });
    }
    unFollow({ user_uid, target_uid }, transaction) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.destroy({ user_uid, target_uid }, transaction);
        });
    }
    following({ user_uid }, transaction) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.model.findAll({
                where: {
                    user_uid: {
                        [sequelize_1.Op.eq]: user_uid,
                    },
                    target_uid: {
                        [sequelize_1.Op.ne]: user_uid,
                    }
                },
                include: [{
                        model: globals_1.dbs.User.model,
                        as: 'target',
                        required: true,
                    }],
                transaction
            });
        });
    }
    followers({ user_uid }, transaction) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.model.findAll({
                where: {
                    target_uid: {
                        [sequelize_1.Op.eq]: user_uid,
                    },
                    user_uid: {
                        [sequelize_1.Op.ne]: user_uid,
                    },
                },
                include: [{
                        model: globals_1.dbs.User.model,
                        as: 'user',
                        required: true,
                    }],
                transaction
            });
        });
    }
}
exports.default = (rdb) => new FollowModel(rdb);
//# sourceMappingURL=follow.js.map