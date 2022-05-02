import Model from "../../../_base/model";
import {DataTypes, Sequelize} from "sequelize";
import {dbs} from "../../../../commons/globals";

class GameJamModel extends Model {
    protected initialize(): void {
        this.name = 'gameJam';
        this.attributes = {
            jam_id:         { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0},
            title:          { type: DataTypes.STRING(100), allowNull: false, defaultValue: '' },
            game_id:        {type: DataTypes.INTEGER, allowNull: false, unique: 'compositeIndex'},
            user_id:        { type: DataTypes.INTEGER },
            is_awarded:     { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false },
        }
    }
    async afterSync(): Promise<void> {
        this.model.belongsTo(dbs.User.model);
    }

}

export default (rdb: Sequelize) => new GameJamModel(rdb)