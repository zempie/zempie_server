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
            email_verified:     { type: DataTypes.BOOLEAN, defaultValue: false },
            fcm_token:          { type: DataTypes.STRING },
        };
    }

    async afterSync(): Promise<void> {
        this.model.hasOne(dbs.Profile.model, {sourceKey: 'uid', foreignKey: 'user_uid'});
        this.model.hasOne(dbs.UserSetting.model, {sourceKey: 'uid', foreignKey: 'user_uid', as: 'setting'});
        this.model.hasMany(dbs.UserGame.model, {sourceKey: 'uid', foreignKey: 'user_uid', as: 'gameRecords'});
    }


    async getInfo({uid}: IUser, transaction?: Transaction) {
        const user = await this.model.findOne({
            where: { uid },
            include: [{
                model: dbs.Profile.model,
                attributes: {
                    exclude: ['created_at', 'updated_at', 'deleted_at'],
                }
            }, {
                model: dbs.UserSetting.model,
                as: 'setting',
                attributes: {
                    exclude: ['id', 'created_at', 'updated_at', 'deleted_at'],
                }
            }, {
                model: dbs.UserGame.model,
                as: 'gameRecords',
                attributes: {
                    exclude: ['created_at', 'updated_at', 'deleted_at'],
                }
            }],
            transaction
        });
        if( user ) {
            return user.get({plain: true});
        }
    }

    async getProfile({uid}: IUser, transaction?: Transaction) {
        const user = await this.model.findOne({
            where: {
                uid,
            },
            include: [{
                model: dbs.Profile.model,
                attributes: {
                    exclude: ['created_at', 'updated_at', 'deleted_at'],
                }
            }, {
                model: dbs.UserGame.model,
                as: 'gameRecords',
                attributes: {
                    exclude: ['created_at', 'updated_at', 'deleted_at'],
                }
            }],
            transaction
        });
        if( user ) {
            return user.get({plain: true});
        }
    }

    async getSetting({uid}: IUser, transaction?: Transaction) {
        const user = await this.model.findOne({
            where: {uid},
            include: [{
                model: dbs.UserSetting.model,
                as: 'setting',
                attributes: {
                    exclude: ['created_at', 'updated_at', 'deleted_at'],
                }
            }],
            transaction
        });
        if( user ) {
            return user.get({plain: true});
        }
    }


    async getAllProfiles({}, transaction?: Transaction) {
        const records = await this.model.findAll({
            include: [{
                model: dbs.Profile.model,
                attributes: {
                    exclude: ['createdAt', 'updatedAt', 'deleted_at'],
                }
            }],
            transaction
        });

        return records.map((record: any) => record.get({plain: true}))
    }
}

export default (rdb: Sequelize) => new UserModel(rdb);