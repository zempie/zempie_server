import Model from '../../../_base/model';
import { DataTypes, Sequelize } from 'sequelize';


/**
 * 코인관련 정보 ( 포인트 제외 )
 */
class CoinMetaModel extends Model {
    protected initialize(): void {
        this.name = 'coinMeta';
        this.attributes = {
          admin_id:               { type: DataTypes.INTEGER, allowNull: false },             
          commission_rate:        { type: DataTypes.DOUBLE, allowNull: false, defaultValue: 10 },
          coin_rate:              { type: DataTypes.INTEGER, allowNull: false, defaultValue: 100 }, // 비율이 100인경우 코인 1, 현금 100원
          point_rate:             { type: DataTypes.INTEGER, allowNull: false, defaultValue: 1000 }, // 비율이 1000인경우 코인 1, 포인트 1000,
          min_amount:             { type: DataTypes.INTEGER, allowNull: false }, //최소 환전 값               
        }
    }

    async afterSync(): Promise<void> {
      await super.afterSync()

      const meta_cnt = await this.model.count()

      if( !meta_cnt ){
        const initData = {
          admin_id: 1,
          commission_rate: 10,
          coin_rate: 10,
          point_rate: 1000,
          min_amount: 10
        }
        this.create(initData)
      }

    }

    async getCoinMeta () {
      return await this.model.findOne({
        where:{},
        order: [['id', 'DESC' ]],
      }) 
    }

}


export default (rdb: Sequelize) => new CoinMetaModel(rdb)
