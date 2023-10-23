import Model from '../../../_base/model';
import { DataTypes, Sequelize } from 'sequelize';
import { dbs } from '../../../../commons/globals';


/**
 * 유저 본인인증 정보
 */
class VerifiedUserModel extends Model {
    protected initialize(): void {
        this.name = 'verifiedUser';
        this.attributes = {
          user_uid:             { type: DataTypes.STRING(36), allowNull: false, unique: true },
          name:                 { type: DataTypes.STRING(100), allowNull: false },
          birth:                { type: DataTypes.STRING(8), allowNull: false },
          gender:               { type: DataTypes.STRING(1), defaultValue: '0' }, // 0: 여자, 1: 남자             
          national_info:        { type: DataTypes.STRING(1), defaultValue: '0' }, // 0: 내국인, 1: 외국인
          mobile_co:            { type: DataTypes.STRING(1), allowNull: true },
          mobile_num:           { type: DataTypes.STRING(11), defaultValue: '0' },
          ci:                   { type: DataTypes.STRING(88), defaultValue: '0' }, // 개인 식별 번호
        }
    }

    async afterSync(): Promise<void> {
      await super.afterSync()

      this.model.belongsTo(dbs.User.model, { foreignKey: 'user_uid', targetKey: 'uid' });

      const desc = await this.model.sequelize.queryInterface.describeTable(this.model.tableName);
      
      if (!desc['ci']) {
          this.model.sequelize.queryInterface.addColumn(this.model.tableName, 'ci', {
              type: DataTypes.STRING,
              after: 'mobile_num'
          })
      }

    }
}


export default (rdb: Sequelize) => new VerifiedUserModel(rdb)
