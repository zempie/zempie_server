import Model from '../../../_base/model';
import { DataTypes, Sequelize } from 'sequelize';
import { dbs } from '../../../../commons/globals';


/**
 * 결제후 발생되는 영수증을 기록 한다. 
 * web, flutter( android, apple), unity( android, apple ) 
 */

class UserReceiptModel extends Model {
    protected initialize() {
        this.name = 'userReceipt';
        this.attributes = {
            user_id:        { type: DataTypes.INTEGER, allowNull: false },
            state:          { type: DataTypes.INTEGER, allowNull: false, default: 0 },
            store:          { type: DataTypes.STRING(100), allowNull: false, default: '' },
            package_name:   { type: DataTypes.STRING(100), allowNull: false, default: '' },
            product_id:     { type: DataTypes.STRING(100), allowNull: false, default: '' },
            price:          { type: DataTypes.INTEGER, allowNull: false, default: 0 },
            purchase_token: { type: DataTypes.TEXT, allowNull: false, default: '' },
            receipt:        { type: DataTypes.TEXT, allowNull: false, default: '' },
            subscription:   { type: DataTypes.INTEGER, allowNull: false },
            is_consume:     { type: DataTypes.BOOLEAN, allowNull: false, default: false },
        };
    }

    async afterSync(): Promise<void> {
        this.model.belongsTo(dbs.User.model, { foreignKey: 'user_id', targetKey: 'id' });

        const desc = await this.model.sequelize.queryInterface.describeTable(this.model.tableName);
        
        if (!desc['user_id']) {
            this.model.sequelize.queryInterface.addColumn(this.model.tableName, 'user_id', {
                type: DataTypes.INTEGER,
                after: 'id'
            })
        }
    }
}

export default (rdb: Sequelize) => new UserReceiptModel(rdb);
