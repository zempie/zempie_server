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
const model_1 = require("../../model");
const sequelize_1 = require("sequelize");
const globals_1 = require("../../../../commons/globals");
/**
 *
 */
class ProjectVersionModel extends model_1.default {
    initialize() {
        this.name = 'projectVersion';
        this.attributes = {
            project_id: { type: sequelize_1.DataTypes.INTEGER, allowNull: false },
            number: { type: sequelize_1.DataTypes.INTEGER, allowNull: false },
            version: { type: sequelize_1.DataTypes.STRING(20), defaultValue: '0.0.1' },
            state: { type: sequelize_1.DataTypes.STRING(20), allowNull: false, defaultValue: 'none' },
            url: { type: sequelize_1.DataTypes.STRING, allowNull: true },
            description: { type: sequelize_1.DataTypes.STRING, allowNull: true },
            reason: { type: sequelize_1.DataTypes.STRING, allowNull: true },
            autoDeploy: { type: sequelize_1.DataTypes.BOOLEAN, defaultValue: false },
        };
    }
    afterSync() {
        return __awaiter(this, void 0, void 0, function* () {
            this.model.belongsTo(globals_1.dbs.Project.model);
        });
    }
    create({ project_id, version, url, description, number, state, autoDeploy }, transaction) {
        const _super = Object.create(null, {
            create: { get: () => super.create }
        });
        return __awaiter(this, void 0, void 0, function* () {
            const value = {
                project_id,
                version,
                url,
                number
            };
            if (description) {
                value.description = description;
            }
            if (state) {
                value.state = state;
            }
            if (autoDeploy === false || autoDeploy) {
                value.autoDeploy = autoDeploy;
            }
            return _super.create.call(this, value, transaction);
        });
    }
    updateVersion({ id, state, url, description, reason, autoDeploy }, transaction) {
        const _super = Object.create(null, {
            findOne: { get: () => super.findOne }
        });
        return __awaiter(this, void 0, void 0, function* () {
            const version = yield _super.findOne.call(this, { id }, transaction);
            if (url) {
                version.url = url;
            }
            if (state) {
                version.state = state;
            }
            if (description) {
                version.description = description;
            }
            if (reason) {
                version.reason = reason;
            }
            if (autoDeploy === false || autoDeploy) {
                version.autoDeploy = autoDeploy;
            }
            yield version.save({ transaction });
        });
    }
}
exports.default = (rdb) => new ProjectVersionModel(rdb);
//# sourceMappingURL=projectVersion.js.map