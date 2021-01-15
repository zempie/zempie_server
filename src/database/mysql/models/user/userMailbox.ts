import Model from '../../model';
import { DataTypes, Sequelize } from 'sequelize';


class UserMailboxModel extends Model {
    protected initialize(): void {
        this.name = 'userMailbox';
        this.attributes = {
            user_id:        { type: DataTypes.INTEGER, allowNull: false },
            is_read:        { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false },
            title:          { type: DataTypes.STRING(100), allowNull: false },
            content:        { type: DataTypes.STRING(500), allowNull: false },
        }
    }


}


export default (rdb: Sequelize) => new UserMailboxModel(rdb)
