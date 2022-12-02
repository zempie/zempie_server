import Model from '../../_base/model';
import { DataTypes, Sequelize, Op } from 'sequelize';
import { dbs } from '../../../commons/globals';

enum eNotificationType{
  notice = 1,
  post,
  post_like,
  comment,
  comment_like,
  report,
  retweet,
}

class Notification extends Model {
    protected initialize() {
        this.name = 'notification';
        this.attributes = {
            user_id:         { type: DataTypes.INTEGER },
            target_user_id:  { type: DataTypes.INTEGER },
            is_read:         { type: DataTypes.BOOLEAN,      allowNull: false, defaultValue: false },
            content:         { type: DataTypes.STRING(500),  allowNull: false },
            target_id:       { type: DataTypes.STRING(36) },
            type:            { type: DataTypes.SMALLINT,     allowNull: false, defaultValue: eNotificationType.notice },

        }
    }

    async afterSync(): Promise<void> {
      this.model.belongsTo(dbs.User.model, { foreignKey: 'user_id', targetKey: 'id' });
   }

   async count(start:Date, end:Date): Promise<void> {
    return this.model.count({
      where:{
        created_at:{
          [Op.between]:[start, end]
        }
      }
    })
   }
}


export default (rdb: Sequelize) => new Notification(rdb)
