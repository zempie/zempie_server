import Model from '../../../_base/model';
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
            game_id:            { type: DataTypes.INTEGER, allowNull: true },
            number:             { type: DataTypes.INTEGER, allowNull: false },
            version:            { type: DataTypes.STRING(20), defaultValue: '0.0.1' },
            state:              { type: DataTypes.STRING(20), allowNull: false, defaultValue: 'none' },
            url:                { type: DataTypes.STRING, allowNull: true },
            size:               { type: DataTypes.FLOAT, defaultValue: 0 },
            description:        { type: DataTypes.STRING, allowNull: true },
            reason:             { type: DataTypes.STRING, allowNull: true },
            autoDeploy:         { type: DataTypes.BOOLEAN, defaultValue: false },
            file_type:          { type: DataTypes.INTEGER, defaultValue: 1 },  
            support_platform:   { type: DataTypes.INTEGER, defaultValue: 0 },
        }
    }

    async afterSync(): Promise<void> {
        this.model.belongsTo(dbs.Project.model);

        const desc = await this.model.sequelize.queryInterface.describeTable(this.model.tableName);
        if ( !desc['game_id'] ) {
            this.model.sequelize.queryInterface.addColumn(this.model.tableName, 'game_id', {
                type: DataTypes.INTEGER,
                after: 'project_id'
            })
        }
        if ( !desc['size'] ) {
            this.model.sequelize.queryInterface.addColumn(this.model.tableName, 'size', {
                type: DataTypes.FLOAT,
                defaultValue: 0,
                after: 'url'
            })
        }

        if ( !desc['file_type'] ) {
            this.model.sequelize.queryInterface.addColumn(this.model.tableName, 'file_type', {
                type: DataTypes.INTEGER,
                defaultValue: 1,
                after: 'size'
            })
        }
        if ( !desc['support_platform'] ) {
            this.model.sequelize.queryInterface.addColumn(this.model.tableName, 'support_platform', {
                type: DataTypes.INTEGER,
                defaultValue: 0,
                after: 'file_type'
            })
        }
    }

    async create( { project_id, game_id, version, url, description, number, state, autoDeploy, size, file_type, support_platform } : any, transaction?: Transaction ) {

        const value : any = {
            project_id,
            game_id,
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

        if( size ) {
            value.size = size;
        }

        if( file_type ) {
            value.file_type = file_type;

        }

        if( support_platform ) {
            value.support_platform = support_platform;

        }
        return super.create( value, transaction );
    }

    async updateVersion( { id, state, url, description, reason, autoDeploy, file_type, support_platform } : any, transaction?: Transaction ) {
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

        if( file_type ) {
            version.file_type = file_type;
        }
        
        if( support_platform ) {
            version.support_platform = support_platform;
        }


        await version.save({ transaction });
    }
}

export default (rdb: Sequelize) => new ProjectVersionModel(rdb);
