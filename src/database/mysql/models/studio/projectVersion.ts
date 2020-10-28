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
            autoDeploy:         { type: DataTypes.BOOLEAN, defaultValue: false },
        }
    }

    async afterSync(): Promise<void> {
        this.model.belongsTo(dbs.Project.model);
    }

    async create( { project_id, version, url, description, number, state, autoDeploy } : any, transaction?: Transaction ) {

        const value : any = {
            project_id,
            version,
            url,
            number
        }

        if( description ) {
            value.description = description;
        }

        if( state ) {
            value.state = state;
        }

        if( autoDeploy === false || autoDeploy ) {
            value.autoDeploy = autoDeploy
        }

        return super.create( value, transaction );
    }

    async updateVersion( { id, state, url, description, reason, autoDeploy } : any, transaction?: Transaction ) {
        const version = await super.findOne( { id }, transaction );


        if( url ) {
            version.url = url;
        }

        if( state ) {
            version.state = state;
        }

        if( description ) {
            version.description = description;
        }

        if( reason ) {
            version.reason = reason;
        }

        if( autoDeploy === false || autoDeploy ) {
            version.autoDeploy = autoDeploy;
        }

        await version.save({ transaction });
    }
}

export default (rdb: Sequelize) => new ProjectVersionModel(rdb);