import Model from '../../_base/model';
import { DataTypes, Sequelize } from 'sequelize';


class EventModel extends Model {
    /**
     * type: 이벤트 종류 ( 게임젬, 네트워킹 등..)
     * category: 해당 이벤트의 상세 카테고리 ( 게임젬의 경우 젬잼인지 글로벌게임젬인지 )
     */
    protected initialize(): void {
        this.name = 'event';
        this.attributes = {
            title:           { type: DataTypes.STRING(50), allowNull: false },
            url_img:         { type: DataTypes.STRING },
            desc:            { type: DataTypes.STRING(200) },
            start_date:      { type: DataTypes.DATE,  allowNull: false },
            end_date:        { type: DataTypes.DATE,  allowNull: false },
            type:            { type: DataTypes.INTEGER,  allowNull: false,  defaultValue: 1 },
            category:        { type: DataTypes.INTEGER }
        }
    }

    async afterSync(): Promise<void> {
      const desc = await this.model.sequelize.queryInterface.describeTable(this.model.tableName);

      if (!desc['type']) {
        this.model.sequelize.queryInterface.addColumn(this.model.tableName, 'type', {
            type: DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 1,
            after: 'end_date'
        })
      }

      if (!desc['category']) {
        this.model.sequelize.queryInterface.addColumn(this.model.tableName, 'category', {
            type: DataTypes.INTEGER,
            after: 'type'
        })
      }
  }

}


export default (rdb: Sequelize) => new EventModel(rdb)
