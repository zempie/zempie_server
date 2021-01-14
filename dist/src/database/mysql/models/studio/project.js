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
class ProjectModel extends model_1.default {
    initialize() {
        this.name = 'project';
        this.attributes = {
            user_id: { type: sequelize_1.DataTypes.INTEGER, allowNull: false },
            name: { type: sequelize_1.DataTypes.STRING(50), allowNull: true },
            picture: { type: sequelize_1.DataTypes.STRING(250), allowNull: true },
            picture2: { type: sequelize_1.DataTypes.STRING(250), allowNull: true },
            picture_webp: { type: sequelize_1.DataTypes.STRING(250), allowNull: true },
            control_type: { type: sequelize_1.DataTypes.SMALLINT, defaultValue: 0 },
            description: { type: sequelize_1.DataTypes.STRING, defaultValue: '' },
            hashtags: { type: sequelize_1.DataTypes.STRING, defaultValue: '' },
            game_id: { type: sequelize_1.DataTypes.INTEGER, allowNull: true },
            deploy_version_id: { type: sequelize_1.DataTypes.INTEGER, allowNull: true },
            update_version_id: { type: sequelize_1.DataTypes.INTEGER, allowNull: true },
        };
    }
    afterSync() {
        return __awaiter(this, void 0, void 0, function* () {
            this.model.hasMany(globals_1.dbs.ProjectVersion.model);
            // this.model.belongsTo(dbs.Developer.model);
            this.model.belongsTo(globals_1.dbs.Game.model);
            this.model.hasOne(globals_1.dbs.ProjectVersion.model, { sourceKey: 'deploy_version_id' });
            this.model.hasOne(globals_1.dbs.ProjectVersion.model, { sourceKey: 'update_version_id' });
            const desc = yield this.model.sequelize.queryInterface.describeTable(this.model.tableName);
            if (!desc['hashtags']) {
                this.model.sequelize.queryInterface.addColumn(this.model.tableName, 'hashtags', {
                    type: sequelize_1.DataTypes.STRING(),
                    defaultValue: '',
                    after: 'description'
                });
            }
            if (!desc['picture_webp']) {
                this.model.sequelize.queryInterface.addColumn(this.model.tableName, 'picture_webp', {
                    type: sequelize_1.DataTypes.STRING(250),
                    defaultValue: '',
                    after: 'picture'
                });
            }
            if (!desc['picture2']) {
                this.model.sequelize.queryInterface.addColumn(this.model.tableName, 'picture2', {
                    type: sequelize_1.DataTypes.STRING(250),
                    allowNull: true,
                    after: 'picture_webp'
                });
            }
        });
    }
    create({ user_id, name, description, picture, picture_webp, picture2, hashtags }, transaction) {
        const _super = Object.create(null, {
            create: { get: () => super.create }
        });
        return __awaiter(this, void 0, void 0, function* () {
            const value = {
                user_id,
                name,
                description,
                hashtags,
            };
            if (picture) {
                value.picture = picture;
            }
            if (picture_webp) {
                value.picture_webp = picture_webp;
            }
            if (picture2) {
                value.picture2 = picture2;
            }
            return _super.create.call(this, value, transaction);
        });
    }
    getProjects({ user_id }, transaction) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.model.findAll({
                where: { user_id },
                include: [{
                        model: globals_1.dbs.Game.model,
                    }, {
                        model: globals_1.dbs.ProjectVersion.model,
                    }],
                transaction
            });
        });
    }
    getProject({ id }, transaction) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.model.findOne({
                where: { id },
                include: [{
                        model: globals_1.dbs.Game.model,
                    }, {
                        model: globals_1.dbs.ProjectVersion.model,
                    }],
                transaction
            });
        });
    }
    updateProject({ id, name, picture, picture2, picture_webp, control_type, description, hashtags, game_id, deploy_version_id, update_version_id }, transaction) {
        return __awaiter(this, void 0, void 0, function* () {
            const project = yield this.findOne({ id }, transaction);
            if (name) {
                project.name = name;
            }
            if (picture) {
                project.picture = picture;
            }
            if (picture2) {
                project.picture2 = picture2;
            }
            if (picture_webp) {
                project.picture_webp = picture_webp;
            }
            if (control_type) {
                project.control_type = control_type;
            }
            if (description) {
                project.description = description;
            }
            if (game_id) {
                project.game_id = game_id;
            }
            if (hashtags) {
                project.hashtags = hashtags;
            }
            if (deploy_version_id) {
                project.deploy_version_id = deploy_version_id;
            }
            if (update_version_id) {
                project.update_version_id = deploy_version_id;
            }
            return yield project.save({ transaction });
        });
    }
    delete() {
        return __awaiter(this, void 0, void 0, function* () {
        });
    }
}
exports.default = (rdb) => new ProjectModel(rdb);
//# sourceMappingURL=project.js.map