import Model from "../../model";
import { DataTypes, Op, Sequelize, Transaction } from 'sequelize';
import { dbs } from '../../../../commons/globals';


class DeveloperModel extends Model {
    protected initialize() {
        this.name = 'developer';
        this.attributes = {
            user_id:        { type: DataTypes.INTEGER, allowNull: false },
            name:           { type: DataTypes.STRING(50), allowNull: true },
            picture:        { type: DataTypes.STRING(250), allowNull: true },
            mileages:       { type: DataTypes.INTEGER.UNSIGNED, allowNull: false, defaultValue: 0 },
        }
    }

    async afterSync(): Promise<void> {
        await super.afterSync()
        this.model.belongsTo(dbs.User.model);
        this.model.hasMany(dbs.Project.model);
    }

    async create({ user_id, name } : any, transaction?: Transaction) {
        return super.create({ user_id, name }, transaction);
    }

    async getDeveloper( { user_id } : any, transaction?: Transaction ) {
        return this.model.findOne( {
            where: { user_id },
            include : [
                {
                    model: dbs.User.model,
                }
            ],
            transaction
        });
    }

    async findDeveloper( { id } : any, transaction?: Transaction ) {
        return this.model.findOne( {
            where: { id },
            Transaction
        } );
    }

    async updateDeveloper({ user_id, name, picture } : any, transaction?: Transaction) {
        const developer = await this.getDeveloper( { user_id }, transaction );
        if( name ) {
            developer.name = name;
        }

        if( picture ) {
            developer.picture = picture;
        }

        return await developer.save({ transaction });
    }
}

export default (rdb: Sequelize) => new DeveloperModel(rdb);
