import Model from '../../../_base/model';
import { DataTypes, Sequelize } from 'sequelize';


/**
 * 코인관련 정보
 */
class CoinMetaModel extends Model {
    protected initialize(): void {
        this.name = 'coinMeta';
        this.attributes = {
          admin_id:               { type: DataTypes.INTEGER, allowNull: false },             
          commission_rate:        { type: DataTypes.DOUBLE, allowNull: false },
        }
    }

    async afterSync(): Promise<void> {
      await super.afterSync()

      const meta_cnt = await this.model.count()

      if( !meta_cnt ){
        const initData = {admin_id: 1, commission_rate : 10}
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
