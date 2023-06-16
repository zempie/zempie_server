import Model from '../../_base/model';
import { DataTypes, Sequelize } from 'sequelize';
import { dbs } from '../../../commons/globals';
import { eItemUsingType, eItemState } from '../../../commons/enums';

class InventoryModel extends Model {
    protected initialize(): void {
        this.name = 'inventory';
        this.attributes = {
            user_id:    { type: DataTypes.INTEGER, allowNull: false },
            refitem_id: { type: DataTypes.INTEGER, allowNull: false },
            used_type: {type: DataTypes.TINYINT,allowNull: true,defaultValue: eItemUsingType.Permanent,},
            quantity:   { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
            state:      { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false }, // 아이템 상태 
            time_limit: { type: DataTypes.INTEGER.UNSIGNED, allowNull: true },              // 아이템 사용가능 시간. ( 100분간 사용가능 )
            end_at:     {type: DataTypes.DATE,allowNull: false,defaultValue: '2038-01-19 03:14:07',}, // 사용 유효 기간, ( ex: 크리스마스 전까지 사용 가능 )
        }
    }

    async afterSync(): Promise<void> {
        await super.afterSync();

        this.model.belongsTo(dbs.User.model);
        this.model.belongsTo(dbs.RefItem.model);
    }

    async getUserInventory({ user_id }: { user_id: number}) {
        return this.model.findAll({
            where: {
                user_id,
            },
            include: [{
                model: dbs.RefItem.model,
                attributes: {
                    exclude: ['created_at', 'updated_at', 'deleted_at'],
                },
            }]
        })
    }
}


export default (rdb: Sequelize) => new InventoryModel(rdb)
