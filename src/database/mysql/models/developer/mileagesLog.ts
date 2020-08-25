import Model from '../../model';
import { DataTypes, Sequelize } from 'sequelize';
import { dbs } from '../../../../commons/globals';

class MileagesLogModel extends Model {
    protected initialize(): void {
        this.name = 'mileagesLog';
        this.attributes = {
            developer_id:   { type: DataTypes.INTEGER, allowNull: false },
            usedMileages:   { type: DataTypes.INTEGER.UNSIGNED },
        }
    }

    async afterSync(): Promise<void> {
        await super.afterSync();

        this.model.belongsTo(dbs.Developer.model);
    }
}


export default (rdb: Sequelize) => new MileagesLogModel(rdb)
