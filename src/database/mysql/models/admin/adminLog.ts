import Model from '../../model';
import { dbs } from '../../../../commons/globals';
import { DataTypes, Sequelize } from 'sequelize';


export enum EAdminTask {
    login,
    logout,
    admin_add,
    admin_mod,
    admin_del,
    admin_list,
}

class AdminLogModel extends Model {
    protected initialize(): void {
        this.name = 'adminLog';
        this.attributes = {
            admin_id:       { type: DataTypes.INTEGER, allowNull: false },
            path:           { type: DataTypes.STRING(30), allowNull: false },
            body:           { type: DataTypes.STRING(150) },
        }
    }

    async afterSync(): Promise<void> {
        await super.afterSync();

        this.model.belongsTo(dbs.Admin.model)
    }


}


export default (rdb: Sequelize) => new AdminLogModel(rdb)
