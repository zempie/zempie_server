import Model from '../../../database/mysql/model';
import { DataTypes, Sequelize, Transaction } from 'sequelize';
import { dbs } from '../../../commons/globals';
import { IUser } from '../../../controllers/_interfaces';


/**
 * firebase authentication 에서 얻어온 사용자 정보
 */

class UserModel extends Model {
    protected initialize() {
        this.name = 'user';
        this.attributes = {
            uid:                { type: DataTypes.STRING(36), allowNull: false, unique: true },
            activated:          { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: true },
            is_admin:           { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false },
            display_name:       { type: DataTypes.STRING(50), allowNull: true },
            photo_url:          { type: DataTypes.STRING(250), allowNull: true },
            provider_id:        { type: DataTypes.STRING(20), allowNull: true, defaultValue: 'password' },
            email:              { type: DataTypes.STRING(50), allowNull: true },
            emailVerified:      { type: DataTypes.BOOLEAN, defaultValue: false },
            fcm_token:          { type: DataTypes.STRING },
        };
    }

    async afterSync(): Promise<void> {
        this.model.hasOne(dbs.Profile.model, {sourceKey: 'uid', foreignKey: 'user_uid'});
    }


    async getProfile({uid}: IUser, transaction?: Transaction) {
        const profile = await this.model.findOne({
            where: {
                uid,
            },
            include: [{
                model: dbs.Profile.model,
                attributes: {
                    exclude: ['created_at', 'updated_at', 'deleted_at'],
                }
            }],
            transaction
        });
        return profile.get({plain: true});
    }
}

export default (rdb: Sequelize) => new UserModel(rdb);