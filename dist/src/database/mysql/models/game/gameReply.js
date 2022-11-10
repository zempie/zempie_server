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
const _ = require("lodash");
const model_1 = require("../../../_base/model");
const sequelize_1 = require("sequelize");
const globals_1 = require("../../../../commons/globals");
class GameReplyModel extends model_1.default {
    constructor() {
        super(...arguments);
        this.getReplies = (game_id, { limit = 50, offset = 0 }, user_uid) => __awaiter(this, void 0, void 0, function* () {
            const include = [{
                    model: globals_1.dbs.User.model,
                }];
            if (user_uid) {
                include.push({
                    as: 'my_reply',
                    model: globals_1.dbs.UserGameReplyReaction.model,
                    where: {
                        user_uid,
                    },
                    required: false,
                });
            }
            return yield this.model.findAll({
                where: {
                    game_id,
                    parent_reply_id: null,
                },
                include,
                order: [['created_at', 'desc']],
                limit: _.toNumber(limit),
                offset: _.toNumber(offset),
            });
        });
        this.getReReplies = (reply_id, { limit = 50, offset = 0 }, user_uid) => __awaiter(this, void 0, void 0, function* () {
            const include = [{
                    model: globals_1.dbs.User.model,
                }, {
                    as: 'target',
                    model: globals_1.dbs.User.model,
                }];
            if (user_uid) {
                include.push({
                    as: 'my_reply',
                    model: globals_1.dbs.UserGameReplyReaction.model,
                    where: {
                        user_uid,
                    },
                });
            }
            return yield this.model.findAll({
                where: {
                    parent_reply_id: reply_id,
                },
                include,
                order: [['created_at', 'desc']],
                limit: _.toNumber(limit),
                offset: _.toNumber(offset),
            });
        });
    }
    initialize() {
        this.name = 'gameReply';
        this.attributes = {
            activated: { type: sequelize_1.DataTypes.BOOLEAN, allowNull: false, defaultValue: true },
            game_id: { type: sequelize_1.DataTypes.INTEGER, allowNull: false },
            user_uid: { type: sequelize_1.DataTypes.STRING(36), allowNull: false },
            parent_reply_id: { type: sequelize_1.DataTypes.INTEGER },
            target_uid: { type: sequelize_1.DataTypes.STRING(36) },
            content: { type: sequelize_1.DataTypes.STRING(500), allowNull: false },
            count_good: { type: sequelize_1.DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
            count_bad: { type: sequelize_1.DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
            count_reply: { type: sequelize_1.DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
        };
    }
    afterSync() {
        const _super = Object.create(null, {
            afterSync: { get: () => super.afterSync }
        });
        return __awaiter(this, void 0, void 0, function* () {
            yield _super.afterSync.call(this);
            this.model.belongsTo(globals_1.dbs.User.model, { foreignKey: 'user_uid', targetKey: 'uid' });
            this.model.belongsTo(globals_1.dbs.User.model, { foreignKey: 'target_uid', targetKey: 'uid', as: 'target' });
            this.model.hasOne(globals_1.dbs.UserGameReplyReaction.model, { sourceKey: 'id', foreignKey: 'reply_id', as: 'my_reply' });
            const desc = yield this.model.sequelize.queryInterface.describeTable(this.model.tableName);
            if (!desc['count_reply']) {
                this.model.sequelize.queryInterface.addColumn(this.model.tableName, 'count_reply', {
                    type: sequelize_1.DataTypes.INTEGER,
                    allowNull: false,
                    defaultValue: 0,
                    after: 'count_bad'
                });
            }
        });
    }
}
exports.default = (rdb) => new GameReplyModel(rdb);
//# sourceMappingURL=gameReply.js.map