import Model from '../../_base/model';
import { DataTypes, Sequelize } from 'sequelize';
import { eItemUsingType } from '../../../commons/enums';


class RefItemModel extends Model {
    protected initialize(): void {
        this.name = 'refItem';
        this.attributes = {
            name: {type: DataTypes.STRING(100),allowNull: true,},
              description: {type: DataTypes.STRING(100),allowNull: true,},
              used_type: {type: DataTypes.TINYINT,allowNull: true,defaultValue: eItemUsingType.Permanent,},
              lv_min: {type: DataTypes.INTEGER,allowNull: true,defaultValue: 0,},
              lv_max: {type: DataTypes.INTEGER,allowNull: true,defaultValue: 0,},
              img: {type: DataTypes.STRING(100),allowNull: true,},
              tag: {type: DataTypes.TINYINT,allowNull: true,defaultValue: 0,},
              quantity: {type: DataTypes.BIGINT,allowNull: true,defaultValue: 0,},
              time_limit: {type: DataTypes.INTEGER.UNSIGNED,allowNull: true,defaultValue: 0,},
              start_at: {type: DataTypes.DATE,allowNull: false,defaultValue: '1970-01-01 00:00:01',},
              end_at: {type: DataTypes.DATE,allowNull: false,defaultValue: '2038-01-19 03:14:07',},
              application_method: {type: DataTypes.TINYINT,allowNull: true,defaultValue: 0,},
              package: {type: DataTypes.JSON,allowNull: true,},
              payload: {type: DataTypes.JSON,allowNull: true,},
        }
    }

    async afterSync(): Promise<void> {
        await super.afterSync()
        const itemCount = await this.model.count();
        if (itemCount === 0) {
          const initData:any = [
            { name: 'REF_ITEM_ZEM_10', description: 'REF_ITEM_ZEM_10_DESC', used_type: eItemUsingType.Zem, img: 'ref_item_zem_10', quantity: 10, package: []},
            { name: 'REF_ITEM_ZEM_50', description: 'REF_ITEM_ZEM_50_DESC', used_type: eItemUsingType.Zem, img: 'ref_item_zem_10', quantity: 50, package: []},
            { name: 'REF_ITEM_ZEM_100', description: '젬 100개', used_type: eItemUsingType.Zem, img: 'ref_item_zem_10', quantity: 100, package: []},
            { name: 'REF_ITEM_ZEM_300', description: '젬 300개', used_type: eItemUsingType.Zem, img: 'ref_item_zem_10', quantity: 300, package: []},
            { name: 'REF_ITEM_ZEM_500', description: '젬 500개', used_type: eItemUsingType.Zem, img: 'ref_item_zem_10', quantity: 500, package: []},
            { name: 'REF_ITEM_ZEM_1000', description: '젬 1000개', used_type: eItemUsingType.Zem, img: 'ref_item_zem_10', quantity: 1000, package: []},
          ];
    
          this.bulkCreate(initData);
        }
    }

}

export default (rdb: Sequelize) => new RefItemModel(rdb)
