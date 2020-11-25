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
const model_1 = require("../../../database/mysql/model");
const sequelize_1 = require("sequelize");
const globals_1 = require("../../../commons/globals");
/**
 * 플랫폼 서비스 내에서 발생하는 사용자의 행동 결과
 */
class TimelineModel extends model_1.default {
    initialize() {
        this.name = 'timeline';
        this.attributes = {
            uid: { type: sequelize_1.DataTypes.STRING(36), allowNull: false },
            user_id: { type: sequelize_1.DataTypes.INTEGER, allowNull: false },
            game_id: { type: sequelize_1.DataTypes.INTEGER, allowNull: false },
            type: { type: sequelize_1.DataTypes.SMALLINT, allowNull: false },
            extra: { type: sequelize_1.DataTypes.STRING(200) },
        };
    }
    afterSync() {
        return __awaiter(this, void 0, void 0, function* () {
            this.model.belongsTo(globals_1.dbs.User.model, { foreignKey: 'user_id', targetKey: 'id' });
            this.model.belongsTo(globals_1.dbs.Game.model, { foreignKey: 'game_id', targetKey: 'id' });
        });
    }
    getList({ user_id, limit = 50, offset = 0 }, transaction) {
        return __awaiter(this, void 0, void 0, function* () {
            const records = yield this.model.findAll({
                where: {
                    user_id,
                },
                attributes: {
                    exclude: ['updated_at', 'deleted_at']
                },
                order: [['id', 'desc']],
                include: [{
                        model: globals_1.dbs.User.model,
                        attributes: [['uid', 'user_uid'], 'name', 'picture']
                    }, {
                        model: globals_1.dbs.Game.model,
                        attributes: {
                            exclude: ['id', 'created_at', 'updated_at', 'deleted_at']
                        }
                    }],
                limit,
                offset,
                transaction
            });
            return _.map(records, (record) => record.get({ plain: true }));
        });
    }
}
exports.default = (rdb) => new TimelineModel(rdb);
//# sourceMappingURL=timeline.js.map