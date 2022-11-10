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
const globals_1 = require("../../../commons/globals");
/**
 * 플랫폼 서비스 내에서 발생하는 사용자의 행동 결과
 */
class AlarmModel extends model_1.default {
    initialize() {
        this.name = 'alarm';
        this.attributes = {
            user_uid: { type: sequelize_1.DataTypes.STRING(36), allowNull: false },
            target_uid: { type: sequelize_1.DataTypes.STRING(36), allowNull: false },
            type: { type: sequelize_1.DataTypes.SMALLINT, allowNull: false },
            extra: { type: sequelize_1.DataTypes.STRING(200) },
        };
    }
    afterSync() {
        return __awaiter(this, void 0, void 0, function* () {
            this.model.belongsTo(globals_1.dbs.User.model, { foreignKey: 'target_uid', targetKey: 'uid', as: 'target' });
        });
    }
    create({ user_uid, target_uid, type, extra = {} }, transaction) {
        const _super = Object.create(null, {
            create: { get: () => super.create }
        });
        return __awaiter(this, void 0, void 0, function* () {
            return _super.create.call(this, { user_uid, target_uid, type, extra: JSON.stringify(extra) }, transaction);
        });
    }
    getList({ user_uid, limit, offset }, transaction) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.model.findAll({
                where: { user_uid },
                attributes: ['id', 'type', 'extra', 'created_at'],
                include: [{
                        model: globals_1.dbs.User.model,
                        as: 'target',
                        attributes: ['uid', 'name', 'picture']
                    }],
                order: [['id', 'desc']],
                limit,
                offset,
                transaction
            });
        });
    }
}
exports.default = (rdb) => new AlarmModel(rdb);
//# sourceMappingURL=alarm.js.map