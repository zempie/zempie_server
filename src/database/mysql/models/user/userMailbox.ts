import Model from '../../model';
import { DataTypes, Sequelize } from 'sequelize';


class UserMailboxModel extends Model {
    protected initialize(): void {
        this.name = 'userMailbox';
        this.attributes = {
            user_id:        { type: DataTypes.INTEGER, allowNull: false },
            content:        { type: DataTypes.STRING(500), allowNull: false },
        }
    }


}


export default (rdb: Sequelize) => new UserMailboxModel(rdb)
