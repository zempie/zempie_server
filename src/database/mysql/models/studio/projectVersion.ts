import Model from "../../model";
import { DataTypes, Op, Sequelize, Transaction } from 'sequelize';
import { dbs } from '../../../../commons/globals';

/**
 *
 */

class ProjectVersionModel extends Model {
    protected initialize() {
        this.name = 'projectVersion';
        this.attributes = {
            project_id:         { type: DataTypes.INTEGER, allowNull: false },
            number:             { type: DataTypes.INTEGER, allowNull: false },
            version:            { type: DataTypes.STRING(20), defaultValue: '0.0.1' },
            state:              { type: DataTypes.STRING(20), allowNull: false, defaultValue: 'none' },
            url:                { type: DataTypes.STRING, allowNull: true },
            description:        { type: DataTypes.STRING, allowNull: true },
            reason:             { type: DataTypes.STRING, allowNull: true },
        }
    }

    async afterSync(): Promise<void> {
        this.model.belongsTo(dbs.Project.model);
    }

    async create( { project_id, version, url, description, number, state} : any, transaction?: Transaction ) {
        return super.create( { project_id, version, url, description, number, state }, transaction );
    }

    async getList( {project_id} : any, transaction?: Transaction ) {
        return this.model.findAll( {
            where: { project_id },
            transaction
        });
    }

    async getVersion( { id } : any, transaction?: Transaction) {
        return this.model.findOne({
            where: {
                id
            }
        });
    }

    async updateVersion( {id, state, url, description} : any, transaction?: Transaction ) {
        const version = await this.getVersion( { id }, transaction );

        if( url ) {
            version.url = url;
        }

        if( state ) {
            version.state = state;
        }

        if( description ) {
            version.description = description;
        }

        await version.save({ transaction });
    }
}

export default (rdb: Sequelize) => new ProjectVersionModel(rdb);