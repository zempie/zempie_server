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
        // getDeveloper = async (params: any, {uid}: DecodedIdToken)=>{
        //     const user = await dbs.User.findOne({ uid });
        //     if( !user ) {
        //         throw CreateError(ERROR_STUDIO.NOT_FIND_USER)
        //     }
        //
        //     const developer = await dbs.Developer.findOne( {user_id : user.id} );
        //     return {
        //         developer,
        //         user,
        //     }
        // }
        // createDeveloper = async (params: any, { uid }: DecodedIdToken, {req: {files: {file}}}: IRoute) =>{
        //     return dbs.Developer.getTransaction( async (transaction : Transaction) => {
        //         const user = await dbs.User.findOne({ uid });
        //         const dev = await dbs.Developer.findOne( { user_id : user.id } );
        //         if( dev ) {
        //             return dev;
        //         }
        //         else {
        //
        //             let picture = params.picture || user.picture;
        //             if( file ) {
        //                 const webp = await FileManager.convertToWebp(file, 80);
        //                 const data: any = await FileManager.s3upload(replaceExt(file.name, '.webp'), webp[0].destinationPath, uid);
        //                 picture = data.Location;
        //             }
        //
        //             return await dbs.Developer.create( {
        //                 user_id : user.id,
        //                 user_uid : uid,
        //                 name : params.name || user.name,
        //                 picture,
        //             }, transaction );
        //         }
        //     })
        // }
        // updateDeveloper = async  (params: any, { uid }: DecodedIdToken, {req: {files: {file}}}: IRoute) =>{
        //     return dbs.Developer.getTransaction( async (transaction : Transaction)=>{
        //         params = params || {};
        //         params.user_uid = uid;
        //
        //         if ( file ) {
        //             const webp = await FileManager.convertToWebp(file, 80);
        //             const data: any = await FileManager.s3upload(replaceExt(file.name, '.webp'), webp[0].destinationPath, uid);
        //             params.picture = data.Location;
        //         }
        //
        //         return await dbs.Developer.updateDeveloper( params, transaction ) ;
        //     })
        // }
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
                if (picFile) {
                    const webp = yield fileManager_1.default.convertToWebp(picFile, 80);
                    const data = yield fileManager_1.default.s3upload(replaceExt(picFile.name, '.webp'), webp[0].destinationPath, uid);
                    params.picture = data.Location;
                }
                const project = yield globals_1.dbs.Project.create(params, transaction);
                const versionParams = {};
                versionParams.project_id = project.id;
                versionParams.number = 1;
                versionParams.autoDeploy = params.autoDeploy || true;
                versionParams.version = params.version || '1.0.0';
                versionParams.startFile = params.startFile || '';
                const versionFiles = files;
                if (versionFiles && versionParams.startFile) {
                    const versionPath = `${project.id}/${uuid_1.v4()}`;
                    versionParams.url = yield uploadVersionFile(versionFiles, uid, versionPath, versionParams.startFile);
                    versionParams.state = 'process';
                }
                const version = yield globals_1.dbs.ProjectVersion.create(versionParams, transaction);
                project.update_version_id = version.id;
                const game = yield globals_1.dbs.Game.create({
                    uid: uuid_1.v4(),
                    activated: 0,
                    enabled: 0,
                    user_id: user.id,
                    pathname: params.pathname,
                    title: project.name,
                    description: project.description,
                    hashtags: '',
                    // version : version.version,
                    // url_game : version.url,
                    url_thumb: project.picture,
                }, transaction);
                project.game_id = game.id;
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
        this.updateProject = (params, { uid }, { req: { files: { file } } }) => __awaiter(this, void 0, void 0, function* () {
            return globals_1.dbs.Project.getTransaction((transaction) => __awaiter(this, void 0, void 0, function* () {
                const project = yield globals_1.dbs.Project.findOne({ id: params.id });
                const game = yield globals_1.dbs.Game.findOne({
                    id: project.game_id,
                });
                if (file) {
                    const webp = yield fileManager_1.default.convertToWebp(file, 80);
                    const data = yield fileManager_1.default.s3upload(replaceExt(file.name, '.webp'), webp[0].destinationPath, uid);
                    params.picture = data.Location;
                    game.url_thumb = params.picture;
                }
                if (params.description) {
                    game.description = params.description;
                }
                if (params.name) {
                    game.name = params.name;
                }
                if (params.deploy_version_id) {
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
                }
                yield game.save({ transaction });
                return yield globals_1.dbs.Project.updateProject(params, transaction);
            }));
        });
        this.createVersion = (params, { uid }, { req: { files } }) => __awaiter(this, void 0, void 0, function* () {
            const project_id = params.project_id;
            const versionPath = `${project_id}/${uuid_1.v4()}`;
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
                const url = yield uploadVersionFile(files, uid, versionPath, params.startFile);
                params.number = maxNum + 1;
                params.state = 'process';
                params.url = url;
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
function uploadVersionFile(files, uid, versionPath, startFile) {
    return __awaiter(this, void 0, void 0, function* () {
        let url = '';
        for (let key in files) {
            const file = files[key];
            if (file) {
                const data = yield fileManager_1.default.s3upload2(file.name, file.path, uid, versionPath);
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