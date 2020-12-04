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
const globals_1 = require("../../commons/globals");
class StudioAdminController {
    constructor() {
        this.getVersions = (params, { uid }) => __awaiter(this, void 0, void 0, function* () {
            return yield globals_1.dbs.ProjectVersion.findAll(params.where, {
                include: [{
                        model: globals_1.dbs.Project.model,
                    }]
            });
        });
        this.getVersion = ({ version_id }, { uid }) => __awaiter(this, void 0, void 0, function* () {
            const version = yield globals_1.dbs.ProjectVersion.findOne({
                id: version_id
            });
            const project = yield globals_1.dbs.Project.findOne({
                id: version.project_id
            });
            // const developer = await dbs.Developer.findOne( {
            //     id : project.developer_id
            // });
            return {
                version,
                project,
            };
        });
        this.setVersion = (params, { uid }) => __awaiter(this, void 0, void 0, function* () {
            return globals_1.dbs.ProjectVersion.getTransaction((transaction) => __awaiter(this, void 0, void 0, function* () {
                if (params.state === 'passed') {
                    const version = yield globals_1.dbs.ProjectVersion.findOne({ id: params.id });
                    // params.id = version.id;
                    if (version.autoDeploy) {
                        const project = yield globals_1.dbs.Project.findOne({ id: version.project_id }, transaction);
                        const game = yield globals_1.dbs.Game.findOne({ id: project.game_id }, transaction);
                        game.activated = true;
                        game.enabled = true;
                        game.version = version.version;
                        game.url_game = version.url;
                        params.state = 'deploy';
                        if (project.deploy_version_id) {
                            const preDeployVersion = yield globals_1.dbs.ProjectVersion.findOne({ id: project.deploy_version_id }, transaction);
                            preDeployVersion.state = 'passed';
                            preDeployVersion.save({ transaction });
                        }
                        project.deploy_version_id = version.id;
                        if (project.update_version_id === version.id) {
                            project.update_version_id = null;
                        }
                        yield project.save({ transaction });
                        yield game.save({ transaction });
                    }
                }
                return yield globals_1.dbs.ProjectVersion.updateVersion(params, transaction);
            }));
        });
    }
}
exports.default = new StudioAdminController();
//# sourceMappingURL=studioAdminController.js.map