import {dbs} from "../../commons/globals";
import {Transaction} from "sequelize";
import {IAdmin} from "../_interfaces";


class AdminStudioController {
    getVersions = async  ( params : any, admin: IAdmin )=>{
        return await dbs.ProjectVersion.findAll(  { state : 'process' }, {
            include : [{
                model: dbs.Project.model,
            }]
        });
    }

    getVersion = async ({ version_id } : any, admin: IAdmin ) => {
        const version = await dbs.ProjectVersion.findOne( {
            id : version_id
        });
        const project = await dbs.Project.findOne( {
            id : version.project_id
        });
        // const developer = await dbs.Developer.findOne( {
        //     id : project.developer_id
        // });

        return  {
            version,
            project,
            // developer
        }
    }

    setVersion = async ( params : any, admin: IAdmin )=>{
        return dbs.ProjectVersion.getTransaction( async (transaction : Transaction)=>{
            if( params.state === 'passed' ) {
                const version = await dbs.ProjectVersion.findOne( { id : params.id } );
                // params.id = version.id;

                if( version.autoDeploy ) {
                    const project = await dbs.Project.findOne( { id : version.project_id }, transaction );
                    const game = await dbs.Game.findOne( { id : project.game_id }, transaction );

                    game.activated = true;
                    game.enabled = true;
                    game.version = version.version;
                    game.url_game = version.url;
                    params.state = 'deploy';

                    if( project.deploy_version_id ) {
                        const preDeployVersion = await dbs.ProjectVersion.findOne( { id : project.deploy_version_id }, transaction );
                        preDeployVersion.state = 'passed';
                        preDeployVersion.save({transaction});
                    }
                    project.deploy_version_id = version.id;

                    if( project.update_version_id === version.id ) {
                        project.update_version_id = null;
                    }

                    await project.save( {transaction} );
                    await game.save( {transaction} );
                }

            }

            return await dbs.ProjectVersion.updateVersion( params, transaction );
        })
    }
}

export default new AdminStudioController();
