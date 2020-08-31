import {IUser} from "./_interfaces";
import { dbs, caches } from '../commons/globals';
import {Transaction} from "sequelize";
import {CreateError, ErrorCodes} from "../commons/errorCodes";
import FileManager from "../services/fileManager";
import { v4 as uuid } from 'uuid';

const replaceExt = require('replace-ext');

class StudioController {
    getDeveloper = async (params: any, {uid}: IUser)=>{
        return dbs.Developer.getTransaction( async (transaction : Transaction)=>{
            const user = await dbs.User.findOne({ uid });
            if( !user ) {
                throw CreateError({
                    code: 2002,
                    message: '유저 정보 찾을 수 없음.'
                })
            }

            return await dbs.Developer.getDeveloper( {user_id : user.id}, transaction );
        })
    }

    createDeveloper = async (params: any, {uid, name}: IUser) =>{
        return dbs.Developer.getTransaction( async (transaction : Transaction)=>{
            const user = await dbs.User.findOne({ uid });
            const dev = await dbs.Developer.getDeveloper( { user_id : user.id }, transaction );
            if( dev ) {
                return dev;
            }
            else {
                await dbs.Developer.create( {
                    user_id : user.id,
                    name : name,
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
                        throw CreateError({
                            code: 2001,
                            message: '이미 사용 중인 패스 입니다.'
                        })
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