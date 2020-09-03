import { IUser } from '../_interfaces';
import { dbs } from '../../commons/globals';


class StudioAdminController {
    getVersions = async  ( params : any, {uid}: IUser )=>{
        return await dbs.ProjectVersion.findAll( params.where, {
            include : [{
                model: dbs.Project.model,
            }]
        });
    }

    getVersion = async ({ version_id } : any, {uid}: IUser ) => {
        const version = await dbs.ProjectVersion.findOne( {
            id : version_id
        });
        const project = await dbs.Project.findOne( {
            id : version.project_id
        });
        const developer = await dbs.Developer.findOne( {
            id : project.developer_id
        });

        return  {
            version,
            project,
            developer
        }
    }

    setVersion = async ( params : any, {uid}: IUser )=>{
        return await dbs.ProjectVersion.update( params.value, {
            id : params.version_id
        });
    }
}

export default new StudioAdminController()
