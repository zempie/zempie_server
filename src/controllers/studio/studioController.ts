import { IRoute } from '../_interfaces';
import { dbs, caches } from '../../commons/globals';
import {Transaction} from "sequelize";
import {CreateError, ErrorCodes} from "../../commons/errorCodes";
import FileManager from "../../services/fileManager";
import { v4 as uuid } from 'uuid';
import admin from 'firebase-admin';
import DecodedIdToken = admin.auth.DecodedIdToken;

const replaceExt = require('replace-ext');

const ERROR_STUDIO = {
    NOT_FIND_USER : {
        code: 2001,
        message: '유저 정보를 찾을 수 없습니다.'
    },
    NOT_FIND_DEVELOPER : {
        code: 2002,
        message: '개발자 정보를 찾을 수 없습니다.'
    },
    ALREADY_EXIST_GAME_PATH : {
        code: 2101,
        message: '이미 존재하는 게임 경로 입니다.'
    },
    INVALID_VERSION_FILE : {
        code: 2102,
        message: '업로드된 게임 파일이 없습니다.'
    },
    INVALID_PROJECT_ID : {
        code: 2103,
        message: '프로젝트'
    },
    ACTIVE_VERSION : {
        code : 2104,
        message: '사용중인 버전 입니다.',
    },
    ALREADY_EXIST_UPDATE_VERSION : {
        code : 2105,
        message: '이미 등록된 버전이 있습니다.',
    },
}

interface ICreateProject extends IVersion, IProject{

}

interface IProject {
    name : string,
    developer_id? : number,
    description? : string,
    picture? : string,
    pathname : string,
}

interface IVersion {
    project_id? : number,
    startFile? : string,
    version? : string,
    url? : string,
    number? : number,
    state? : string,
    autoDeploy? : boolean
}

class StudioController {
    getDeveloper = async (params: any, {uid}: DecodedIdToken)=>{
        const user = await dbs.User.findOne({ uid });
        if( !user ) {
            throw CreateError(ERROR_STUDIO.NOT_FIND_USER)
        }

        const developer = await dbs.Developer.findOne( {user_id : user.id} );
        return {
            developer,
            user,
        }
    }

    createDeveloper = async (params: any, { uid }: DecodedIdToken, {req: {files: {file}}}: IRoute) =>{
        return dbs.Developer.getTransaction( async (transaction : Transaction) => {
            const user = await dbs.User.findOne({ uid });
            const dev = await dbs.Developer.findOne( { user_id : user.id } );
            if( dev ) {
                return dev;
            }
            else {

                let picture = params.picture || user.picture;
                if( file ) {
                    const webp = await FileManager.convertToWebp(file, 80);
                    const data: any = await FileManager.s3upload(replaceExt(file.name, '.webp'), webp[0].destinationPath, uid);
                    picture = data.Location;
                }

                return await dbs.Developer.create( {
                    user_id : user.id,
                    user_uid : uid,
                    name : params.name || user.name,
                    picture,
                }, transaction );
            }
        })
    }

    updateDeveloper = async  (params: any, { uid }: DecodedIdToken, {req: {files: {file}}}: IRoute) =>{
        return dbs.Developer.getTransaction( async (transaction : Transaction)=>{
            params = params || {};
            params.user_uid = uid;

            if ( file ) {
                const webp = await FileManager.convertToWebp(file, 80);
                const data: any = await FileManager.s3upload(replaceExt(file.name, '.webp'), webp[0].destinationPath, uid);
                params.picture = data.Location;
            }

            return await dbs.Developer.updateDeveloper( params, transaction ) ;
        })
    }

    getProjects = async ( params : any, {uid}: DecodedIdToken )=>{
        // const user = await dbs.User.findOne({ uid });
        const dev = await dbs.Developer.findOne( { user_uid : uid } );
        if( !dev ) {
            //등록된 개발자 찾을수 없음
            throw CreateError(ERROR_STUDIO.NOT_FIND_DEVELOPER);
        }

        return await dbs.Project.getProjects( { developer_id : dev.id } );
    }

    getProject = async ( params : any, { uid }: DecodedIdToken )=>{

        if( !params.id ) {
            throw CreateError(ErrorCodes.INVALID_PARAMS);
        }

        return await dbs.Project.getProject( { id : params.id } );
    }

    verifyGamePathname = async ( params : any, { uid }: DecodedIdToken ) => {
        const path = await dbs.Game.findOne( {
            pathname : params.pathname
        } );

        let success = true;

        if( path ) {
            success = false;
            // throw CreateError(ERROR_STUDIO.ALREADY_EXIST_GAME_PATH)
        }

        return {
            success,
        }
    }


    createProject = async ( params : ICreateProject, {uid}: DecodedIdToken, {req:{files}}: IRoute) => {
        return dbs.Project.getTransaction( async (transaction : Transaction)=>{
            const dev = await dbs.Developer.findOne( {user_uid : uid} );
            params.developer_id = dev.id;

            const picFile = files && files[ 'project_picture' ] || undefined;
            files[ 'project_picture' ] = undefined;

            if( picFile ) {
                const webp = await FileManager.convertToWebp(picFile, 80);
                const data: any = await FileManager.s3upload(replaceExt(picFile.name, '.webp'), webp[0].destinationPath, uid);
                params.picture = data.Location;
            }

            const project = await dbs.Project.create( params, transaction );


            const versionParams : IVersion = {};

            versionParams.project_id = project.id;
            versionParams.number = 1;
            versionParams.autoDeploy = params.autoDeploy || true;
            versionParams.version = params.version || '1.0.0';
            versionParams.startFile = params.startFile || '';


            const versionFiles = files;
            if( versionFiles && versionParams.startFile ) {
                const versionPath = `${project.id}/${uuid()}`;
                versionParams.url = await uploadVersionFile( versionFiles, uid, versionPath, versionParams.startFile );
                versionParams.state = 'process';
            }

            const version = await dbs.ProjectVersion.create( versionParams, transaction );
            project.update_version_id = version.id;

            const game = await dbs.Game.create( {
                uid : uuid(),
                activated : 0,
                enabled : 0,
                developer_id : project.developer_id,
                pathname : params.pathname,
                title : project.name,
                description : project.description,
                // version : version.version,
                // url_game : version.url,
                url_thumb : project.picture,
            }, transaction );
            project.game_id = game.id;

            return await project.save({transaction});
        })
    }

    deleteProject = async ( params : any, {uid}: DecodedIdToken ) => {
        if( !params.id ) {
            throw CreateError(ErrorCodes.INVALID_PARAMS);
        }

        return dbs.Project.getTransaction( async (transaction : Transaction) => {
            const project = await dbs.Project.findOne( {id : params.id} );
            const versions = await dbs.ProjectVersion.findAll( { project_id : params.id } );
            for( let i = 0; i < versions.length; i++ ) {
                await dbs.ProjectVersion.destroy( { id : versions[i].id }, transaction );
            }
            await dbs.Game.destroy( { id : project.game_id }, transaction );
            return await dbs.Project.destroy( { id : params.id }, transaction );
        });
    }

    /*
    project와 연관있는 game 필드
     description, version, title
     url_game, url_thumb, url_title
     activated
     */
    updateProject = async ( params : any, {uid}: DecodedIdToken, {req: {files: {file}}}: IRoute)=>{

        return dbs.Project.getTransaction( async (transaction : Transaction) => {
            const project = await dbs.Project.findOne( { id : params.id } );
            const game = await dbs.Game.findOne( {
                id : project.game_id,
            } );

            if ( file ) {
                const webp = await FileManager.convertToWebp(file, 80);
                const data: any = await FileManager.s3upload(replaceExt(file.name, '.webp'), webp[0].destinationPath, uid);
                params.picture = data.Location;
                game.url_thumb = params.picture;
            }

            if( params.description ) {
                game.description = params.description;
            }

            if( params.name ) {
                game.name = params.name;
            }

            if( params.deploy_version_id ) {
                if( project.deploy_version_id ) {
                    const preDeployVersion = await dbs.ProjectVersion.findOne(  {
                        id : project.deploy_version_id
                    }, transaction );
                    preDeployVersion.state = 'passed';
                    await preDeployVersion.save({transaction});
                }

                if( project.update_version_id === params.deploy_version_id ) {
                    params.update_version_id = null;
                }

                const deployVersion = await dbs.ProjectVersion.findOne( {
                    id : params.deploy_version_id
                },transaction );
                deployVersion.state = 'deploy';
                await deployVersion.save({transaction});
                game.version = deployVersion.version;
            }

            await game.save({transaction});
            return await dbs.Project.updateProject( params, transaction );
        })
    }

    createVersion = async ( params : any, {uid}: DecodedIdToken, {req: {files}}: IRoute ) => {

        const project_id = params.project_id;
        const versionPath = `${project_id}/${uuid()}`;

        // const data: any = await FileManager.s3upload(replaceExt(file.name, '.webp'), webp[0].destinationPath, uid);
        return dbs.ProjectVersion.getTransaction( async (transaction : Transaction)=>{

            const project = await dbs.Project.findOne( { id : project_id }, transaction );
            if( project.update_version_id ) {
                const preUpdateVersion = await dbs.ProjectVersion.findOne( { id : project.update_version_id }, transaction );
                if( preUpdateVersion.state !== 'fail' && preUpdateVersion.state !== 'passed' ) {
                    throw CreateError(ERROR_STUDIO.ALREADY_EXIST_UPDATE_VERSION);
                }
            }

            const result = await dbs.ProjectVersion.findAndCountAll( {
                project_id
            } );
            let maxNum = 0;
            if(result.rows.length) {
                const lastVersion = result.rows[ result.rows.length - 1 ];
                maxNum = lastVersion.number;
            }

            const url = await uploadVersionFile( files, uid, versionPath, params.startFile );
            params.number = maxNum + 1;
            params.state = 'process';
            params.url = url;

            const version = await dbs.ProjectVersion.create( params, transaction );
            project.update_version_id = version.id;
            await project.save({transaction});
            return version;
        })
    }

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

    deleteVersion = async  ( params : any, {uid}: DecodedIdToken )=>{

        return dbs.ProjectVersion.getTransaction( async (transaction : Transaction)=>{
            const version = await dbs.ProjectVersion.findOne( { id : params.id } );
            const project = await dbs.Project.findOne( { id : version.project_id }, transaction );

            if( project.update_version_id === version.id ) {
                project.update_version_id = null;
            }

            if( project.deploy_version_id === version.id ) {
                throw CreateError(ERROR_STUDIO.ACTIVE_VERSION);
            }

            await project.save({transaction});
            return await dbs.ProjectVersion.destroy( {
                id : params.id
            } );
        })


    }

    // updateVersion = async  ( params : any, {uid}: DecodedIdToken )=>{
    //     return dbs.ProjectVersion.getTransaction( async (transaction : Transaction)=>{
    //         return await dbs.ProjectVersion.updateVersion( params, transaction );
    //     });
    // }
}


export default new StudioController();

class Version {

    major : number = 0;
    minor : number = 0;
    patch : number = 0;

    constructor( ver : string = '' ) {
        if( ver ) {
            const split = ver.split('.');
            if( split.length >= 3 ) {
                this.major = Number(split[0]);
                this.minor = Number(split[1]);
                this.patch = Number(split[2]);
            }
        }
    }

    nextPatch() {
        return `${this.major}.${this.minor}.${this.patch + 1}`;
    }

    toString() : string {
        return `${this.major}.${this.minor}.${this.patch}`;
    }

}

async function uploadVersionFile( files : any, uid : string, versionPath : string, startFile : string ) : Promise<string> {

    let url = '';
    for( let key in files ) {
        const file = files[key];
        if( file ) {
            const data = await FileManager.s3upload2(
                file.name, file.path, uid, versionPath
            ) as any;

            if( file.name === startFile ) {
                url = data.Location;
            }
        }
    }

    return new Promise(function (resolve) {
        resolve(url);
    });
}