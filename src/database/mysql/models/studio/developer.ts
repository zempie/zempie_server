import Model from "../../model";
import { DataTypes, Op, Sequelize, Transaction } from 'sequelize';
import { dbs } from '../../../../commons/globals';


class DeveloperModel extends Model {
    protected initialize() {
        this.name = 'developer';
        this.attributes = {
            user_id:            { type: DataTypes.INTEGER, allowNull: false },
            name:               { type: DataTypes.STRING(50), allowNull: true },
            picture:            { type: DataTypes.STRING(250), allowNull: true },
        }
    }

    async afterSync(): Promise<void> {
        this.model.belongsTo(dbs.User.model);
        this.model.hasMany(dbs.Project.model);
    }

    async create({ user_id } : any, transaction?: Transaction) {
        return super.create({ user_id }, transaction);
    }

    async getDeveloper( { id } : any, transaction?: Transaction ) {
        return this.model.findOne( {
            where: { id },
            transaction
        });
    }

    async findDeveloper( { user_id } : any, transaction?: Transaction ) {
        return this.model.findOne( {
            where: { user_id },
            Transaction
        } );
    }
}

export default (rdb: Sequelize) => new DeveloperModel(rdb);