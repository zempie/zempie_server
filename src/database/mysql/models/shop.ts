import Model from '../../_base/model';
import { dbs } from '../../../commons/globals';
import { DataTypes, Sequelize } from 'sequelize';
import { eItemUsingType } from '../../../commons/enums';


class ShopModel extends Model {
    protected initialize(): void {
        this.name = 'shop';
        this.attributes = {
            refitem_idx: {type: DataTypes.INTEGER,defaultValue: 0,},
            shop: {type: DataTypes.TINYINT,defaultValue: 0,},
            sort: {type: DataTypes.INTEGER,defaultValue: 0,allowNull: false,},
            order: {type: DataTypes.INTEGER,defaultValue: 0,allowNull: false,},
            lv_min: {type: DataTypes.INTEGER,defaultValue: 0,},
            lv_max: {type: DataTypes.INTEGER,defaultValue: 0,},
            quantity: {type: DataTypes.BIGINT,defaultValue: 0,},
            store_type: {type: DataTypes.TINYINT,defaultValue: 0,},
            store_code: {type: DataTypes.STRING(100),defaultValue: '',},
            currency: {type: DataTypes.TINYINT,defaultValue: 0,},
            price: {type: DataTypes.INTEGER,defaultValue: 0,},
            tag: {type: DataTypes.TINYINT,defaultValue: 0,},
            discount: {type: DataTypes.TINYINT,defaultValue: 0,},
            start_at: {type: DataTypes.DATE,defaultValue: '1970-01-01 00:00:01',},
            end_at: {type: DataTypes.DATE,defaultValue: '2038-01-19 03:14:07',},
            suppulment: {type: DataTypes.TINYINT,defaultValue: 0,},
        }
    }


    async afterSync(): Promise<void> {
        await super.afterSync()
        const itemCount = await this.model.count();
        if (itemCount === 0) {
          const initData:any = [
            { refitem_idx: 1, quantity: 10, store_code: 'zem_10', price:  1200},
            { refitem_idx: 2, quantity: 50, store_code: 'zem_50', price:  6000},
            { refitem_idx: 3, quantity: 100, store_code: 'zem_100', price: 12000},
            { refitem_idx: 4, quantity: 300, store_code: 'zem_300', price:  36000},
            { refitem_idx: 5, quantity: 500, store_code: 'zem_500', price:  60000},
            { refitem_idx: 6, quantity: 1000, store_code: 'zem_1000', price:  120000},
          ];
    
          this.bulkCreate(initData);
        }
    }
}

export default (rdb: Sequelize) => new ShopModel(rdb)

