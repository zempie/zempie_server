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
const model_1 = require("../../model");
const sequelize_1 = require("sequelize");
const utils_1 = require("../../../../commons/utils");
class AdminModel extends model_1.default {
    initialize() {
        this.name = 'admin';
        this.attributes = {
            uid: { type: sequelize_1.DataTypes.UUID, allowNull: false },
            activated: { type: sequelize_1.DataTypes.BOOLEAN, allowNull: false, defaultValue: true },
            account: { type: sequelize_1.DataTypes.STRING(20), unique: true, allowNull: false },
            name: { type: sequelize_1.DataTypes.STRING(20), allowNull: false },
            level: { type: sequelize_1.DataTypes.SMALLINT, allowNull: false, defaultValue: 1 },
            sub_level: { type: sequelize_1.DataTypes.SMALLINT, allowNull: false, defaultValue: 0 },
            password: { type: sequelize_1.DataTypes.STRING(250), allowNull: false },
        };
    }
    afterSync() {
        return __awaiter(this, void 0, void 0, function* () {
            if ((yield this.model.count()) < 1) {
                const password = utils_1.makePassword('administrator');
                yield this.model.create({
                    uid: uuid_1.v4(),
                    account: 'master',
                    password,
                    name: 'master',
                    level: 10,
                });
            }
        });
    }
}
exports.default = (rdb) => new AdminModel(rdb);
//# sourceMappingURL=admin.js.map