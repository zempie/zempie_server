import {IUser} from "./_interfaces";
import { dbs, caches } from '../commons/globals';
import {Transaction} from "sequelize";
import {CreateError, ErrorCodes} from "../commons/errorCodes";
import FileManager from "../services/fileManager";
import { v4 as uuid } from 'uuid';

const replaceExt = require('replace-ext');

const ERROR_STUDIO = {
    NOT_FIND_USER : {
        code: 2001,
        message: '유저 정보 찾을 수 없음.'
    },
    NOT_FIND_DEVELOPER : {
        code: 2002,
        message: '개발자 정보 찾을 수 없음.'
    },
    ALREADY_EXIST_GAME_PATH : {
        code: 2101,
        message: '이미 존재하는 게임 경로 입니다.'
    },
    INVALID_VERSION_FILE : {
        code: 2102,
        message: '업로드된 게임 파일이 없습니다.'
    },

}


class StudioController {
    getDeveloper = async (params: any, {uid}: IUser)=>{
        return dbs.Developer.getTransaction( async (transaction : Transaction)=>{
            const user = await dbs.User.findOne({ uid });
            if( !user ) {
                throw CreateError(ERROR_STUDIO.NOT_FIND_USER)
            }

            return await dbs.Developer.getDeveloper( {user_id : user.id}, transaction );
        })
    }

    createDeveloper = async (params: any, {uid, name}: IUser, {file} : any) =>{
        return dbs.Developer.getTransaction( async (transaction : Transaction)=>{
            const user = await dbs.User.findOne({ uid });
            const dev = await dbs.Developer.getDeveloper( { user_id : user.id }, transaction );
            if( dev ) {
                return dev;
            }
            else {

                let picture = undefined;
                if( file ) {
                    const webp = await FileManager.convertToWebp(file, 80);
                    const data: any = await FileManager.s3upload(replaceExt(file.name, '.webp'), webp[0].destinationPath, uid);
                    picture = data.Location;
                }

                await dbs.Developer.create( {
                    user_id : user.id,
                    name : name,
                    picture
                }, transaction );
                return await dbs.Developer.getDeveloper( { user_id : user.id } );
            }
        })
    }

    updateDeveloper = async  (params: any, {uid, name}: IUser, {file} : any) =>{
        return dbs.Developer.getTransaction( async (transaction : Transaction)=>{
            const user = await dbs.User.findOne({ uid });
            params = params || {};
            params.user_id = user.id;

            if ( file ) {
                const webp = await FileManager.convertToWebp(file, 80);
                const data: any = await FileManager.s3upload(replaceExt(file.name, '.webp'), webp[0].destinationPath, uid);
                params.picture = data.Location;
            }

            return await dbs.Developer.updateDeveloper( params, transaction ) ;
        })
    }

    getProjects = async ( params : any, {uid}: IUser )=>{
        return dbs.Project.getTransaction( async (transaction : Transaction)=>{
            const user = await dbs.User.findOne({ uid });
            const dev = await dbs.Developer.findOne( { user_id : user.id }, transaction );
            if( !dev ) {
                //등록된 개발자 찾을수 없음
                // throw CreateError(ErrorCodes.INVALID_ITEM_ID);
            }

            return await dbs.Project.getList( { developer_id : dev.id }, transaction ) ;
        })
    }

    getProject = async  ( params : any, {uid}: IUser )=>{
        return dbs.Project.getTransaction( async (transaction : Transaction)=>{
            return await dbs.Project.getProject( { id : params.id }, transaction );
        })
    }

    createProject = async ( params : any, {uid}: IUser )=>{
        return dbs.Project.getTransaction( async (transaction : Transaction)=>{
            const user = await dbs.User.findOne({ uid });
            const dev = await dbs.Developer.getDeveloper( {user_id : user.id}, transaction );
            return await dbs.Project.create( {
                name: params.name,
                control_type : params.control_type,
                description : params.description,
                developer_id : dev.id
            }, transaction );
        })
    }

    /*

    프로젝트 생성, 버전 생성,
     */
    createProjectAll = async ( params : { name : string, control_type : number, description : string, startFile : string }, {uid}: IUser, files: any)=>{

        if( !files ) {
            throw CreateError(ERROR_STUDIO.INVALID_VERSION_FILE)
        }

        const user = await dbs.User.findOne({ uid });
        if( !user ) {
            throw CreateError(ERROR_STUDIO.NOT_FIND_USER)
        }

        const dev = await dbs.Developer.getDeveloper( {user_id : user.id} );
        if( !dev ) {
            throw CreateError(ERROR_STUDIO.NOT_FIND_DEVELOPER)
        }


        return dbs.Project.getTransaction( async (transaction : Transaction)=>{

            let picture = undefined;
            const picFile = files[ 'project_picture' ];
            if( picFile ) {
                const webp = await FileManager.convertToWebp(picFile, 80);
                const data: any = await FileManager.s3upload(replaceExt(picFile.name, '.webp'), webp[0].destinationPath, uid);
                picture = data.Location;
            }

            const project =  await dbs.Project.create( {
                name: params.name,
                control_type : params.control_type,
                description : params.description,
                developer_id : dev.id,
                picture
            }, transaction );

            const versionPath = `${project.id}/${uuid()}`;

            const versionFiles = files.filter( (file : any) => file.includes('file_') );
            const version_url = await uploadVersionFile( versionFiles, uid, versionPath, params.startFile );
            const versionString = new Version().nextPatch();

            const version = dbs.ProjectVersion.create( {
                project_id : project.id,
                version : versionString,
                url : version_url,
                description : params.description,
                number : 1,
                state : 'process'
            }, transaction );

            project.update_version_id = version.id;
            await project.save({transaction});
            return project;
        });
    }

    updateProjectAll = async (params : any, {uid}: IUser)=>{

    }

    deleteProject = async  ( params : any, {uid}: IUser )=>{
        return dbs.Project.getTransaction( async (transaction : Transaction)=>{

        })
    }

    updateProject = async  ( params : any, {uid}: IUser, {file}: any )=>{


        return dbs.Project.getTransaction( async (transaction : Transaction)=>{


            if( params.deploy_version_id ) {
                const version = await dbs.ProjectVersion.findOne({ id : params.deploy_version_id });
                const project = await dbs.Project.getProject( { id : params.id }, transaction );
                let game_id = project.game_id;
                if( !game_id ) {

                    const path = await dbs.Game.findOne( {
                        pathname : params.pathname
                    }, transaction );

                    if( path ) {
                        throw CreateError(ERROR_STUDIO.ALREADY_EXIST_GAME_PATH)
                    }

                    const game = await dbs.Game.create( {
                        uid : uuid(),
                        activated : 1,
                        enabled : 1,
                        developer_id : project.developer_id,
                        pathname : params.pathname,
                        title : project.title,
                        version : version.version,
                        url_game : version.url,
                        control_type : project.control_type,
                        url_thumb : project.picture,
                    }, transaction );
                    params.game_id = game.id;
                }
                else {
                    const value : any = {
                        url_game : version.url,
                        version : version.version,
                    }

                    if( params.control_type !== undefined ) {
                        value.control_type = params.control_type;
                    }

                    const game = await dbs.Game.update(value, {id:game_id}, transaction);

                }

                if( project.deploy_version_id ) {
                    await dbs.ProjectVersion.updateVersion( { id : project.deploy_version_id, state : 'passed' }, transaction );
                }
                await dbs.ProjectVersion.updateVersion( { id : params.deploy_version_id, state : 'deploy' }, transaction );
            }

            if ( file ) {
                const webp = await FileManager.convertToWebp(file, 80);
                const data: any = await FileManager.s3upload(replaceExt(file.name, '.webp'), webp[0].destinationPath, uid);
                params.picture = data.Location;

                const project = await dbs.Project.getProject( { id : params.id }, transaction );
                if( project.game_id ) {
                    await dbs.Game.update({
                        url_thumb : params.picture
                    }, {id:project.game_id}, transaction);
                }
            }

            await dbs.Project.updateProject( params, transaction );

            return await dbs.Project.findOne( { id : params.id }, transaction );
        })
    }

    createVersion = async ( params : any, {uid}: IUser, files: any )=>{

        const project_id = params.project_id;
        const version = params.version;
        const versionPath = `${project_id}/${uuid()}`;
        const startFile = params.startFile;
        const description = params.description;

        const url = await uploadVersionFile( files, uid, versionPath, startFile );

        // const data: any = await FileManager.s3upload(replaceExt(file.name, '.webp'), webp[0].destinationPath, uid);
        return dbs.ProjectVersion.getTransaction( async (transaction : Transaction)=>{
            // return await

            const result = await dbs.ProjectVersion.findAndCountAll( {
                project_id
            }, transaction );

            if(result.rows.length) {
                const lastVersion = result.rows[ result.rows.length - 1 ];
            }

            return await dbs.ProjectVersion.create( { project_id, version, url, description, number : result.count + 1, state : 'process'  }, transaction );
        })
    }

    getVersions = async  ( params : any, {uid}: IUser )=>{
        return dbs.ProjectVersion.getTransaction( async (transaction : Transaction)=>{
            return await dbs.ProjectVersion.getList( params, transaction );
        })
    }

    getVersion = async  ( params : any, {uid}: IUser )=>{
        return dbs.ProjectVersion.getTransaction( async (transaction : Transaction)=>{
            return await dbs.ProjectVersion.getVersion( params, transaction );
        })
    }

    updateVersion = async  ( params : any, {uid}: IUser )=>{
        return dbs.ProjectVersion.getTransaction( async (transaction : Transaction)=>{
            return await dbs.ProjectVersion.updateVersion( params, transaction );
        })
    }

    adminGetVersions = async  ( params : any, {uid}: IUser )=>{
        return dbs.ProjectVersion.getTransaction( async (transaction : Transaction)=>{
            return await dbs.ProjectVersion.findAll( params.where, {
                include : [{
                    model: dbs.Project.model,
                }]
            }, transaction);
        })
    }

    adminGetVersion = async ({ version_id } : any, {uid}: IUser ) => {
        return dbs.ProjectVersion.getTransaction( async (transaction : Transaction)=>{

            const version = await dbs.ProjectVersion.findOne( {
                id : version_id
            }, transaction );
            const project = await dbs.Project.findOne( {
                id : version.project_id
            }, transaction );
            const developer = await dbs.Developer.findOne( {
                id : project.developer_id
            }, transaction );

            return  {
                version,
                project,
                developer
            }
        })
    }

    adminSetVersion = async ( params : any, {uid}: IUser )=>{
        return dbs.ProjectVersion.getTransaction( async (transaction : Transaction)=>{
            return await dbs.ProjectVersion.update( params.value, {
                id : params.version_id
            }, transaction);
        })
    }
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

async function uploadVersionFile( files : any, uid : string, versionPath : string, startFile : string ) {

    let url = '';
    for( let key in files ) {
        const file = files[key];
        const data = await FileManager.s3upload2(
            file.name, file.path, uid, versionPath
        ) as any;

        if( file.name === startFile ) {
            url = data.Location;
        }
    }

    return new Promise(function (resolve) {
        resolve(url);
    });
}