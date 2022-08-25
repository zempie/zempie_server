import Model from '../../_base/model';
import { DataTypes, Sequelize } from 'sequelize';


class PostModel extends Model {
  protected initialize(): void {
    this.name = 'post';
    // this.attributes = {
    //     name:           { type: DataTypes.STRING(20), allowNull: false },
    //     used_type:      { type: DataTypes.SMALLINT, allowNull: false, defaultValue: eItemUsingType.Permanent },
    //     // is_using:       { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: true },
    //     period:         { type: DataTypes.INTEGER },
    //     is_used:        { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false },
    // }
  }
}


export default (rdb: Sequelize) => new PostModel(rdb)
