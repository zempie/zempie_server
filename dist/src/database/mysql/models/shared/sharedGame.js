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
const uuid_1 = require("uuid");
const model_1 = require("../../../_base/model");
const sequelize_1 = require("sequelize");
const globals_1 = require("../../../../commons/globals");
class SharedGameModel extends model_1.default {
    initialize() {
        this.name = 'sharedGame';
        this.attributes = {
            uid: { type: sequelize_1.DataTypes.STRING(36), allowNull: false, unique: true },
            user_uid: { type: sequelize_1.DataTypes.STRING(36), allowNull: false, unique: 'compositeIndex' },
            game_id: { type: sequelize_1.DataTypes.INTEGER, allowNull: false, unique: 'compositeIndex' },
            count_open: { type: sequelize_1.DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
            count_play: { type: sequelize_1.DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
            count_ad: { type: sequelize_1.DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
        };
    }
    afterSync() {
        const _super = Object.create(null, {
            afterSync: { get: () => super.afterSync }
        });
        return __awaiter(this, void 0, void 0, function* () {
            yield _super.afterSync.call(this);
            this.model.belongsTo(globals_1.dbs.User.model, { foreignKey: 'user_uid', targetKey: 'uid' });
            this.model.belongsTo(globals_1.dbs.Game.model, { foreignKey: 'game_id', targetKey: 'id' });
        });
    }
    getInfo(where) {
        return __awaiter(this, void 0, void 0, function* () {
            const record = yield this.model.findOne({
                where,
                attributes: {
                    exclude: ['id', 'created_at', 'updated_at', 'deleted_at'],
                },
                include: [{
                        model: globals_1.dbs.User.model,
                        attributes: {
                            exclude: ['id', 'created_at', 'updated_at', 'deleted_at'],
                        },
                    }, {
                        model: globals_1.dbs.Game.model,
                        attributes: {
                            exclude: ['created_at', 'updated_at', 'deleted_at'],
                        },
                        include: [{
                                model: globals_1.dbs.User.model,
                                attributes: {
                                    exclude: ['id', 'created_at', 'updated_at', 'deleted_at']
                                },
                                required: true,
                            }],
                    }]
            });
            return record.get({ plain: true });
        });
    }
    getSharedUid({ user_uid, game_id }) {
        return __awaiter(this, void 0, void 0, function* () {
            let record = yield this.findOne({ user_uid, game_id });
            if (!record) {
                record = yield this.create({
                    uid: (0, uuid_1.v4)(),
                    user_uid,
                    game_id,
                });
            }
            return record.uid;
        });
    }
}
exports.default = (rdb) => new SharedGameModel(rdb);
//# sourceMappingURL=sharedGame.js.map