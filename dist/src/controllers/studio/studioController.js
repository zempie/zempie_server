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
const errorCodes_1 = require("../../commons/errorCodes");
const fileManager_1 = require("../../services/fileManager");
const uuid_1 = require("uuid");
const path = require("path");
const opt_1 = require("../../../config/opt");
const replaceExt = require('replace-ext');
const ERROR_STUDIO = {
    NOT_FIND_USER: {
        code: 2001,
        message: '유저 정보를 찾을 수 없습니다.'
    },
    NOT_FIND_DEVELOPER: {
        code: 2002,
        message: '개발자 정보를 찾을 수 없습니다.'
    },
    ALREADY_EXIST_GAME_PATH: {
        code: 2101,
        message: '이미 존재하는 게임 경로 입니다.'
    },
    INVALID_VERSION_FILE: {
        code: 2102,
        message: '업로드된 게임 파일이 없습니다.'
    },
    INVALID_PROJECT_ID: {
        code: 2103,
        message: '프로젝트'
    },
    ACTIVE_VERSION: {
        code: 2104,
        message: '사용중인 버전 입니다.',
    },
    ALREADY_EXIST_UPDATE_VERSION: {
        code: 2105,
        message: '이미 등록된 버전이 있습니다.',
    },
};
class StudioController {
    constructor() {
        this.signupDeveloper = (params, { uid }) => __awaiter(this, void 0, void 0, function* () {
            return globals_1.dbs.User.getTransaction((transaction) => __awaiter(this, void 0, void 0, function* () {
                //권한 추가
                const user = yield globals_1.dbs.User.findOne({ uid }, transaction);
                user.is_developer = true;
                yield user.save({ transaction });
                return {
                    success: true
                };
            }));
        });
        this.getProjects = (params, { uid }) => __awaiter(this, void 0, void 0, function* () {
            // const user = await dbs.User.findOne({ uid });
            const user = yield globals_1.dbs.User.findOne({ uid });
            if (!user) {
                //등록된 개발자 찾을수 없음
                throw errorCodes_1.CreateError(ERROR_STUDIO.NOT_FIND_DEVELOPER);
            }
            return yield globals_1.dbs.Project.getProjects({ user_id: user.id });
        });
        this.getProject = (params, { uid }) => __awaiter(this, void 0, void 0, function* () {
            if (!params.id) {
                throw errorCodes_1.CreateError(errorCodes_1.ErrorCodes.INVALID_PARAMS);
            }
            return yield globals_1.dbs.Project.getProject({ id: params.id });
        });
        this.verifyGamePathname = (params, { uid }) => __awaiter(this, void 0, void 0, function* () {
            const path = yield globals_1.dbs.Game.findOne({
                pathname: params.pathname
            });
            let success = true;
            if (path) {
                success = false;
                // throw CreateError(ERROR_STUDIO.ALREADY_EXIST_GAME_PATH)
            }
            return {
                success,
            };
        });
        this.createProject = (params, { uid }, { req: { files } }) => __awaiter(this, void 0, void 0, function* () {
            return globals_1.dbs.Project.getTransaction((transaction) => __awaiter(this, void 0, void 0, function* () {
                // const dev = await dbs.Developer.findOne( {user_uid : uid} );
                // params.developer_id = dev.id;
                const user = yield globals_1.dbs.User.findOne({ uid });
                params.user_id = user.id;
                const picFile = files && files['project_picture'] || undefined;
                files['project_picture'] = undefined;
                const picFile2 = files && files['project_picture2'] || undefined;
                files['project_picture2'] = undefined;
                params.hashtags = params.hashtags || '';
                const project = yield globals_1.dbs.Project.create(params, transaction);
                if (picFile) {
                    const webp = yield fileManager_1.default.convertToWebp(picFile, 80, false);
                    const data = yield fileManager_1.default.s3upload({
                        bucket: opt_1.default.AWS.Bucket.RscPublic,
                        // key : file2.name,
                        key: replaceExt('thumb', path.extname(picFile.name)),
                        filePath: picFile.path,
                        uid,
                        subDir: `/project/${project.id}/thumb`
                    });
                    const data2 = yield fileManager_1.default.s3upload({
                        bucket: opt_1.default.AWS.Bucket.RscPublic,
                        key: replaceExt('thumb', '.webp'),
                        filePath: webp[0].destinationPath,
                        uid,
                        subDir: `/project/${project.id}/thumb`
                    });
                    project.picture = data.Location;
                    project.picture_webp = data2.Location;
                }
                if (picFile2) {
                    const data = yield fileManager_1.default.s3upload({
                        bucket: opt_1.default.AWS.Bucket.RscPublic,
                        key: replaceExt('thumb2', path.extname(picFile2.name)),
                        filePath: picFile2.path,
                        uid,
                        subDir: `/project/${project.id}/thumb`
                    });
                    project.picture2 = data.Location;
                }
                const game = yield globals_1.dbs.Game.create({
                    // uid : uuid(),
                    activated: 0,
                    enabled: 0,
                    user_id: user.id,
                    pathname: params.pathname,
                    title: project.name,
                    description: project.description,
                    hashtags: project.hashtags,
                    // version : version.version,
                    // url_game : version.url,
                    url_thumb: project.picture,
                    url_thumb_webp: project.picture_webp,
                    url_thumb_gif: project.picture2,
                }, transaction);
                project.game_id = game.id;
                const versionParams = {};
                versionParams.project_id = project.id;
                versionParams.game_id = game.id;
                versionParams.number = 1;
                versionParams.autoDeploy = params.autoDeploy || true;
                versionParams.version = params.version || '1.0.0';
                versionParams.startFile = params.startFile || '';
                versionParams.size = params.size || 0;
                versionParams.description = params.version_description || '';
                const versionFiles = files;
                if (versionFiles && versionParams.startFile) {
                    const subDir = `/project/${project.id}/${uuid_1.v4()}`;
                    versionParams.url = yield uploadVersionFile(versionFiles, uid, subDir, versionParams.startFile);
                    versionParams.state = 'process';
                }
                const version = yield globals_1.dbs.ProjectVersion.create(versionParams, transaction);
                project.update_version_id = version.id;
                return yield project.save({ transaction });
            }));
        });
        this.deleteProject = (params, { uid }) => __awaiter(this, void 0, void 0, function* () {
            if (!params.id) {
                throw errorCodes_1.CreateError(errorCodes_1.ErrorCodes.INVALID_PARAMS);
            }
            return globals_1.dbs.Project.getTransaction((transaction) => __awaiter(this, void 0, void 0, function* () {
                const project = yield globals_1.dbs.Project.findOne({ id: params.id });
                const versions = yield globals_1.dbs.ProjectVersion.findAll({ project_id: params.id });
                for (let i = 0; i < versions.length; i++) {
                    yield globals_1.dbs.ProjectVersion.destroy({ id: versions[i].id }, transaction);
                }
                yield globals_1.dbs.Game.destroy({ id: project.game_id }, transaction);
                return yield globals_1.dbs.Project.destroy({ id: params.id }, transaction);
            }));
        });
        /*
        project와 연관있는 game 필드
         description, version, title
         url_game, url_thumb, url_title
         activated
         */
        this.updateProject = (params, { uid }, { req: { files: { file, file2 } } }) => __awaiter(this, void 0, void 0, function* () {
            return globals_1.dbs.Project.getTransaction((transaction) => __awaiter(this, void 0, void 0, function* () {
                const project = yield globals_1.dbs.Project.findOne({ id: params.id });
                const game = yield globals_1.dbs.Game.findOne({
                    id: project.game_id,
                });
                if (file) {
                    const webp = yield fileManager_1.default.convertToWebp(file, 80, false);
                    const data = yield fileManager_1.default.s3upload({
                        bucket: opt_1.default.AWS.Bucket.RscPublic,
                        // key : file.name,
                        key: replaceExt('thumb', path.extname(file.name)),
                        filePath: file.path,
                        uid,
                        subDir: `/project/${project.id}/thumb`
                    });
                    const data2 = yield fileManager_1.default.s3upload({
                        bucket: opt_1.default.AWS.Bucket.RscPublic,
                        key: replaceExt('thumb', '.webp'),
                        filePath: webp[0].destinationPath,
                        uid,
                        subDir: `/project/${project.id}/thumb`
                    });
                    params.picture = data.Location;
                    game.url_thumb = params.picture;
                    params.picture_webp = data2.Location;
                    game.url_thumb_webp = params.picture_webp;
                }
                if (file2) {
                    const data = yield fileManager_1.default.s3upload({
                        bucket: opt_1.default.AWS.Bucket.RscPublic,
                        // key : file2.name,
                        key: replaceExt('thumb2', path.extname(file2.name)),
                        filePath: file2.path,
                        uid,
                        subDir: `/project/${project.id}/thumb`
                    });
                    params.picture2 = data.Location;
                    game.url_thumb_gif = params.picture2;
                }
                if (params.description) {
                    game.description = params.description;
                }
                if (params.name) {
                    game.title = params.name;
                }
                if (params.hashtags) {
                    game.hashtags = params.hashtags;
                }
                if (parseInt(params.deploy_version_id) === 0) {
                    if (project.deploy_version_id) {
                        const preDeployVersion = yield globals_1.dbs.ProjectVersion.findOne({
                            id: project.deploy_version_id
                        }, transaction);
                        preDeployVersion.state = 'passed';
                        yield preDeployVersion.save({ transaction });
                    }
                    game.activated = false;
                    game.enabled = false;
                    game.url_game = null;
                    params.deploy_version_id = null;
                }
                else if (params.deploy_version_id) {
                    if (project.deploy_version_id) {
                        const preDeployVersion = yield globals_1.dbs.ProjectVersion.findOne({
                            id: project.deploy_version_id
                        }, transaction);
                        preDeployVersion.state = 'passed';
                        yield preDeployVersion.save({ transaction });
                    }
                    if (project.update_version_id === params.deploy_version_id) {
                        params.update_version_id = null;
                    }
                    const deployVersion = yield globals_1.dbs.ProjectVersion.findOne({
                        id: params.deploy_version_id
                    }, transaction);
                    deployVersion.state = 'deploy';
                    yield deployVersion.save({ transaction });
                    game.version = deployVersion.version;
                    game.activated = true;
                    game.enabled = true;
                    game.url_game = deployVersion.url;
                }
                yield game.save({ transaction });
                return yield globals_1.dbs.Project.updateProject(params, transaction);
            }));
        });
        this.createVersion = (params, { uid }, { req: { files } }) => __awaiter(this, void 0, void 0, function* () {
            const project_id = params.project_id;
            // const data: any = await FileManager.s3upload(replaceExt(file.name, '.webp'), webp[0].destinationPath, uid);
            return globals_1.dbs.ProjectVersion.getTransaction((transaction) => __awaiter(this, void 0, void 0, function* () {
                const project = yield globals_1.dbs.Project.findOne({ id: project_id }, transaction);
                if (project.update_version_id) {
                    const preUpdateVersion = yield globals_1.dbs.ProjectVersion.findOne({ id: project.update_version_id }, transaction);
                    if (preUpdateVersion.state !== 'fail' && preUpdateVersion.state !== 'passed') {
                        throw errorCodes_1.CreateError(ERROR_STUDIO.ALREADY_EXIST_UPDATE_VERSION);
                    }
                }
                const result = yield globals_1.dbs.ProjectVersion.findAndCountAll({
                    project_id
                });
                let maxNum = 0;
                if (result.rows.length) {
                    const lastVersion = result.rows[result.rows.length - 1];
                    maxNum = lastVersion.number;
                }
                const subDir = `/project/${project_id}/${uuid_1.v4()}`;
                const url = yield uploadVersionFile(files, uid, subDir, params.startFile);
                params.number = maxNum + 1;
                params.state = 'process';
                params.url = url;
                params.game_id = project.game_id;
                const version = yield globals_1.dbs.ProjectVersion.create(params, transaction);
                project.update_version_id = version.id;
                yield project.save({ transaction });
                return version;
            }));
        });
        // getVersions = async  ( params : any, {uid}: DecodedIdToken )=>{
        //     return await dbs.ProjectVersion.findAll( {
        //         project_id : params.project_id
        //     } )
        // }
        // getVersion = async  ( params : any, {uid}: DecodedIdToken )=>{
        //     return await dbs.ProjectVersion.findOne( {
        //         id : params.id
        //     } );
        // }
        this.deleteVersion = (params, { uid }) => __awaiter(this, void 0, void 0, function* () {
            return globals_1.dbs.ProjectVersion.getTransaction((transaction) => __awaiter(this, void 0, void 0, function* () {
                const version = yield globals_1.dbs.ProjectVersion.findOne({ id: params.id });
                const project = yield globals_1.dbs.Project.findOne({ id: version.project_id }, transaction);
                if (project.update_version_id === version.id) {
                    project.update_version_id = null;
                }
                if (project.deploy_version_id === version.id) {
                    throw errorCodes_1.CreateError(ERROR_STUDIO.ACTIVE_VERSION);
                }
                yield project.save({ transaction });
                return yield globals_1.dbs.ProjectVersion.destroy({
                    id: params.id
                });
            }));
        });
        // updateVersion = async  ( params : any, {uid}: DecodedIdToken )=>{
        //     return dbs.ProjectVersion.getTransaction( async (transaction : Transaction)=>{
        //         return await dbs.ProjectVersion.updateVersion( params, transaction );
        //     });
        // }
    }
}
exports.default = new StudioController();
class Version {
    constructor(ver = '') {
        this.major = 0;
        this.minor = 0;
        this.patch = 0;
        if (ver) {
            const split = ver.split('.');
            if (split.length >= 3) {
                this.major = Number(split[0]);
                this.minor = Number(split[1]);
                this.patch = Number(split[2]);
            }
        }
    }
    nextPatch() {
        return `${this.major}.${this.minor}.${this.patch + 1}`;
    }
    toString() {
        return `${this.major}.${this.minor}.${this.patch}`;
    }
}
function uploadVersionFile(files, uid, subDir, startFile) {
    return __awaiter(this, void 0, void 0, function* () {
        let url = '';
        for (let key in files) {
            const file = files[key];
            if (file) {
                const data = yield fileManager_1.default.s3upload({
                    bucket: opt_1.default.AWS.Bucket.Rsc,
                    key: file.name,
                    filePath: file.path,
                    uid,
                    subDir,
                });
                if (file.name === startFile) {
                    url = data.Location;
                }
            }
        }
        return new Promise(function (resolve) {
            resolve(url);
        });
    });
}
//# sourceMappingURL=studioController.js.map