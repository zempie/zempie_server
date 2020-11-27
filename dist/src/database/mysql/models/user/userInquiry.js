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
const globals_1 = require("../../../../commons/globals");
class UserInquiryModel extends model_1.default {
    initialize() {
        this.name = 'userInquiry';
        this.attributes = {
            user_id: { type: sequelize_1.DataTypes.INTEGER, allowNull: false },
            category: { type: sequelize_1.DataTypes.SMALLINT, allowNull: false },
            title: { type: sequelize_1.DataTypes.STRING(100), allowNull: false },
            text: { type: sequelize_1.DataTypes.STRING(500), allowNull: false },
            response: { type: sequelize_1.DataTypes.STRING(500) },
            admin_id: { type: sequelize_1.DataTypes.INTEGER },
        };
    }
    afterSync() {
        const _super = Object.create(null, {
            afterSync: { get: () => super.afterSync }
        });
        return __awaiter(this, void 0, void 0, function* () {
            yield _super.afterSync.call(this);
            this.model.belongsTo(globals_1.dbs.User.model);
            this.model.belongsTo(globals_1.dbs.Admin.model);
        });
    }
    getList({ user_id, no_answer, limit = 50, offset = 0, sort = 'id', dir = 'asc' }) {
        return __awaiter(this, void 0, void 0, function* () {
            const where = {};
            if (user_id) {
                where.user_id = user_id;
            }
            if (no_answer === 'true' || no_answer === '1') {
                where.answer = {
                    [sequelize_1.Op.eq]: null
                };
            }
            const { count, rows } = yield this.findAndCountAll(where, {
                include: [{
                        model: globals_1.dbs.User.model,
                        required: true,
                    }, {
                        model: globals_1.dbs.Admin.model,
                    }],
                order: [[sort, dir]],
                limit: _.toNumber(limit),
                offset: _.toNumber(offset),
            });
            return {
                count,
                inquiries: _.map(rows, (r) => {
                    return {
                        id: r.id,
                        category: r.category,
                        title: r.title,
                        text: r.text,
                        response: r.response,
                        asked_at: r.created_at,
                        responded_at: r.updated_at,
                        admin: {
                            name: r.admin ? r.admin.name : undefined,
                        }
                    };
                })
            };
        });
    }
}
exports.default = (rdb) => new UserInquiryModel(rdb);
//# sourceMappingURL=userInquiry.js.map