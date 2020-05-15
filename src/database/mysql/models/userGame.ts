import Model from '../../../database/mysql/model';
import { DataTypes, Sequelize } from 'sequelize';
import { dbs } from '../../../commons/globals';


/**
 * 플랫폼 서비스 내에서 발생하는 사용자의 게임 정보
 * 최고 점수 기록
 */

class UserGameModel extends Model {
    protected initialize() {
        this.name = 'userGame';
        this.attributes = {
            user_uid:       { type: DataTypes.STRING(36), allowNull: false },
            game_uid:       { type: DataTypes.STRING(36), allowNull: false },
            score:          { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
        };
    }


    async afterSync(): Promise<void> {
        this.model.belongsTo(dbs.User.model, {foreignKey: 'user_uid', targetKey: 'uid'});
        this.model.belongsTo(dbs.Follow.model, {foreignKey: 'user_uid', target: 'target_uid'});
    }



}

export default (rdb: Sequelize) => new UserGameModel(rdb);