import Model from '../../model';
import { DataTypes, Sequelize } from 'sequelize';
import { dbs } from '../../../../commons/globals';

class DeveloperModel extends Model {
    protected initialize(): void {
        this.name = 'developer';
        this.attributes = {
            user_id:    { type: DataTypes.INTEGER, allowNull: false },
            mileages:   { type: DataTypes.INTEGER.UNSIGNED, allowNull: false, defaultValue: 0 },
        }
    }

    async afterSync(): Promise<void> {
        await super.afterSync();

        this.model.belongsTo(dbs.User.model);
    }
}


export default (rdb: Sequelize) => new DeveloperModel(rdb)
