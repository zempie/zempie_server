import Model from '../../_base/model';
import { DataTypes, Sequelize } from 'sequelize';


/**
 * 사이트 초기 로딩시에 필요한 전반적인 정보
 */
class MetaModel extends Model {
    protected initialize(): void {
        this.name = 'meta';
        this.attributes = {
            and_build_no:        { type: DataTypes.INTEGER, allowNull: false },
            ios_build_no:        { type: DataTypes.INTEGER, allowNull: false },
        }
    }

    async afterSync(): Promise<void> {
      await super.afterSync()

      const build_cnt = await this.model.count()

      if( !build_cnt ){
        const initData = {and_build_no : 65, ios_build_no: 65}
        this.create(initData)
      }

    }

    async getRecetnVersion () {
      return await this.model.findOne({
        where:{},
        order: [['id', 'DESC' ]],
      }) 
    }

}


export default (rdb: Sequelize) => new MetaModel(rdb)
