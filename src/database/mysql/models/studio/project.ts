import Model from "../../model";
import { DataTypes, Op, Sequelize, Transaction } from 'sequelize';
import { dbs } from '../../../../commons/globals';


class ProjectModel extends Model {
    protected initialize() {
        this.name = 'project';
        this.attributes = {
            developer_id:       { type: DataTypes.INTEGER, allowNull: false },
            name:               { type: DataTypes.STRING(50), allowNull: true },
            picture:            { type: DataTypes.STRING(250), allowNull: true },
            control_type:       { type: DataTypes.SMALLINT, defaultValue: 0 },
            description:        { type: DataTypes.STRING, defaultValue: '' },
            game_id:            { type: DataTypes.INTEGER, allowNull: true },
            deploy_version_id:  { type: DataTypes.INTEGER, allowNull: true },
            update_version_id:  { type: DataTypes.INTEGER, allowNull: true },
        }
    }

    async afterSync(): Promise<void> {
        this.model.hasMany(dbs.ProjectVersion.model);
        this.model.belongsTo(dbs.Developer.model);

        this.model.belongsTo( dbs.Game.model );
        this.model.hasOne(dbs.ProjectVersion.model, { sourceKey : 'deploy_version_id'});
        this.model.hasOne(dbs.ProjectVersion.model, { sourceKey : 'update_version_id'});
    }

    async create({ developer_id, name, description, picture } : any, transaction?: Transaction) {
        const value : any = {
            developer_id,
            name,
            description,
        }

        if( picture ) {
            value.picture = picture;
        }


        return super.create( value, transaction );
    }

    async getProjects({ developer_id } : any, transaction?: Transaction) {
        return this.model.findAll( {
            where: { developer_id },
            include: [{
                model: dbs.Game.model,
            },{
                model: dbs.ProjectVersion.model,
            }],
            transaction
        });

    }

    async getProject({ id } : any, transaction?: Transaction) {
        return this.model.findOne( {
            where: { id },
            include: [{
                model: dbs.Game.model,
            },{
                model: dbs.ProjectVersion.model,
            }],
            transaction
        });
    }

    async updateProject({ id, name, picture, control_type, description, game_id, deploy_version_id, update_version_id } : any, transaction?: Transaction) {
        const project = await this.model.findOne( { id }, transaction );

        if( name ) {
            project.name = name;
        }

        if( picture ) {
            project.picture = picture;
        }

        if( control_type ) {
            project.control_type = control_type;
        }

        if( description ) {
            project.description = description;
        }

        if( game_id ) {
            project.game_id = game_id;
        }

        if( deploy_version_id ) {
            project.deploy_version_id = deploy_version_id;
        }

        if( update_version_id ) {
            project.update_version_id = deploy_version_id;
        }

        return await project.save( { transaction } );
    }

    async delete() {

    }
}

export default (rdb: Sequelize) => new ProjectModel(rdb);