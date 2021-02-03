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
const model_1 = require("../../model");
const sequelize_1 = require("sequelize");
class UserMailboxModel extends model_1.default {
    constructor() {
        super(...arguments);
        this.getMails = ({ user_uid, hide = false, limit = 50, offset = 0 }) => __awaiter(this, void 0, void 0, function* () {
            return yield this.model.findAll({
                where: { user_uid, hide },
                attributes: {
                    exclude: ['created_at', 'updated_at', 'deleted_at'],
                },
                order: [['created_at', 'desc']],
                limit: _.toNumber(limit),
                offset: _.toNumber(offset),
            });
        });
    }
    initialize() {
        this.name = 'userMailbox';
        this.attributes = {
            user_uid: { type: sequelize_1.DataTypes.STRING(36), allowNull: false },
            is_read: { type: sequelize_1.DataTypes.BOOLEAN, allowNull: false, defaultValue: false },
            category: { type: sequelize_1.DataTypes.STRING(20), allowNull: false },
            title: { type: sequelize_1.DataTypes.STRING(100), allowNull: false },
            content: { type: sequelize_1.DataTypes.STRING(500), allowNull: false },
            hide: { type: sequelize_1.DataTypes.BOOLEAN, allowNull: false, defaultValue: false },
        };
    }
    afterSync() {
        const _super = Object.create(null, {
            afterSync: { get: () => super.afterSync }
        });
        return __awaiter(this, void 0, void 0, function* () {
            yield _super.afterSync.call(this);
            const desc = yield this.model.sequelize.queryInterface.describeTable(this.model.tableName);
            if (!desc['category']) {
                this.model.sequelize.queryInterface.addColumn(this.model.tableName, 'category', {
                    type: sequelize_1.DataTypes.STRING(20),
                    allowNull: false,
                    after: 'is_read'
                });
            }
        });
    }
}
exports.default = (rdb) => new UserMailboxModel(rdb);
//# sourceMappingURL=userMailbox.js.map