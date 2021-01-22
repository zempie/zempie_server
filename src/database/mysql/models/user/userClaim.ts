import Model from '../../model';
import { DataTypes, Sequelize } from 'sequelize';
import { dbs } from '../../../../commons/globals';


class UserClaimModel extends Model {
    protected initialize(): void {
        this.name = 'userClaim';
        this.attributes = {
            user_id:        { type: DataTypes.INTEGER, allowNull: false },
            user_uid:       { type: DataTypes.STRING(36), allowNull: false },
            data:           { type: DataTypes.JSON, allowNull: false },
        }
    }



}


export default (rdb: Sequelize) => new UserClaimModel(rdb)
