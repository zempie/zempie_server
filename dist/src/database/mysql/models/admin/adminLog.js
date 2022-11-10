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
exports.EAdminTask = void 0;
const _ = require("lodash");
const model_1 = require("../../../_base/model");
const globals_1 = require("../../../../commons/globals");
const sequelize_1 = require("sequelize");
var EAdminTask;
(function (EAdminTask) {
    EAdminTask[EAdminTask["login"] = 0] = "login";
    EAdminTask[EAdminTask["logout"] = 1] = "logout";
    EAdminTask[EAdminTask["admin_add"] = 2] = "admin_add";
    EAdminTask[EAdminTask["admin_mod"] = 3] = "admin_mod";
    EAdminTask[EAdminTask["admin_del"] = 4] = "admin_del";
    EAdminTask[EAdminTask["admin_list"] = 5] = "admin_list";
})(EAdminTask = exports.EAdminTask || (exports.EAdminTask = {}));
class AdminLogModel extends model_1.default {
    initialize() {
        this.name = 'adminLog';
        this.attributes = {
            admin_id: { type: sequelize_1.DataTypes.INTEGER, allowNull: false },
            path: { type: sequelize_1.DataTypes.STRING(50), allowNull: false },
            body: { type: sequelize_1.DataTypes.STRING(500) },
        };
    }
    afterSync() {
        const _super = Object.create(null, {
            afterSync: { get: () => super.afterSync }
        });
        return __awaiter(this, void 0, void 0, function* () {
            yield _super.afterSync.call(this);
            this.model.belongsTo(globals_1.dbs.Admin.model);
        });
    }
    getLogs({ admin_id, limit = 50, offset = 0, sort = 'id', dir = 'asc' }) {
        return __awaiter(this, void 0, void 0, function* () {
            const where = {};
            if (admin_id)
                where.admin_id = admin_id;
            return this.model.findAndCountAll({
                where,
                include: [{
                        model: globals_1.dbs.Admin.model,
                    }],
                order: [[sort, dir]],
                limit: _.toNumber(limit),
                offset: _.toNumber(offset),
            });
        });
    }
}
exports.default = (rdb) => new AdminLogModel(rdb);
//# sourceMappingURL=adminLog.js.map