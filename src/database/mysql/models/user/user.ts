import Model from '../../model';
import { DataTypes, Op, Sequelize, Transaction } from 'sequelize';
import { dbs } from '../../../../commons/globals';
import { eNotify } from '../../../../commons/enums';
import * as _ from 'lodash';
import admin from 'firebase-admin';
import DecodedIdToken = admin.auth.DecodedIdToken;


/**
 * firebase authentication 에서 얻어온 사용자 정보
 */
export enum EBan {
    not,
    suspension,
    permanent
}
class UserModel extends Model {
    protected initialize() {
        this.name = 'user';
        this.attributes = {
            uid:                { type: DataTypes.STRING(36), allowNull: false, unique: true },
            activated:          { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: true },
            banned:             { type: DataTypes.SMALLINT, allowNull: false, defaultValue: EBan.not },
            is_admin:           { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false },
            name:               { type: DataTypes.STRING(50), allowNull: true },
            channel_id:         { type: DataTypes.STRING(100), allowNull: false },
            picture:            { type: DataTypes.STRING(250), allowNull: true },
            provider:           { type: DataTypes.STRING(20), allowNull: true, defaultValue: 'password' },
            email:              { type: DataTypes.STRING(50), allowNull: true },
            email_verified:     { type: DataTypes.BOOLEAN, defaultValue: false },
            fcm_token:          { type: DataTypes.STRING },
        };
    }

    async afterSync(): Promise<void> {
        await super.afterSync()
        this.model.hasOne(dbs.UserProfile.model, { sourceKey: 'id', foreignKey: 'user_id', as: 'profile' });
        this.model.hasOne(dbs.UserSetting.model, { sourceKey: 'id', foreignKey: 'user_id', as: 'setting' });
        this.model.hasMany(dbs.UserGame.model, { sourceKey: 'uid', foreignKey: 'user_uid', as: 'gameRecords' });
        this.model.hasMany(dbs.UserPublishing.model, { sourceKey: 'uid', foreignKey: 'user_uid', as: 'publishing' });
        this.model.hasOne(dbs.Developer.model);
    }

    async getInfo({uid}: DecodedIdToken, transaction?: Transaction) {
        return this.model.findOne({
            where: {
                is_admin: {
                    [Op.ne]: true
                },
                uid
            },
            include: [
                {
                    model: dbs.UserProfile.model,
                    as: 'profile',
                    attributes: {
                        exclude: ['created_at', 'updated_at', 'deleted_at'],
                    }
                },
                {
                    model: dbs.UserSetting.model,
                    as: 'setting',
                    attributes: {
                        exclude: ['created_at', 'updated_at', 'deleted_at'],
                    }
                },
                {
                    model: dbs.UserGame.model,
                    as: 'gameRecords',
                    attributes: {
                        exclude: ['created_at', 'updated_at', 'deleted_at'],
                    },
                    include: [{
                        model: dbs.Game.model,
                    }]
                },
                {
                    model: dbs.Developer.model,
                    include: [{
                        model: dbs.Game.model,
                    }]
                }
            ],
            transaction
        })
    }

    private getProfile = async (where: object, transaction?: Transaction) => {
        const user = await this.model.findOne({
            where,
            include: [{
                model: dbs.UserProfile.model,
                as: 'profile',
                attributes: {
                    exclude: ['created_at', 'updated_at', 'deleted_at'],
                }
            }, {
                model: dbs.UserGame.model,
                as: 'gameRecords',
                attributes: {
                    exclude: ['created_at', 'updated_at', 'deleted_at'],
                },
                include: [{
                    model: dbs.Game.model,
                }]
            }],
            transaction
        });
        if( user ) {
            return user.get({plain: true});
        }
    }

    getProfileByUid = async ({ uid }: { uid: string }) => {
        return this.getProfile({ uid });
    }

    getProfileByChannelId = async ({ channel_id }: { channel_id: string }) => {
        return this.getProfile({ channel_id });
    }

    async getSetting({uid}: DecodedIdToken, transaction?: Transaction) {
        const user = await this.model.findOne({
            where: {
                is_admin: {
                    [Op.ne]: true
                },
                uid
            },
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
            const _user = user.get({plain:true});
            _user.notify = {};
            _user.notify[eNotify.Alarm] = _user.setting.notify_alarm;
            _user.notify[eNotify.Battle] = _user.setting.notify_battle;
            _user.notify[eNotify.Beat] = _user.setting.notify_beat;
            _user.notify[eNotify.Follow] = _user.setting.notify_follow;
            _user.notify[eNotify.Like] = _user.setting.notify_like;
            _user.notify[eNotify.Reply] = _user.setting.notify_reply;
            return _user;
        }
    }


    async getPublishing({ uid }: DecodedIdToken, transaction?: Transaction) {
        return this.model.findOne({
            where: { uid },
            include: [{
                model: dbs.UserPublishing.model,
                as: 'publishing',
                include: [{
                    model: dbs.Game.model,
                }]
            }],
            transaction
        })
    }


    async getProfileAll({limit = 50, offset = 0, sort = 'id', dir = 'asc'}, transaction?: Transaction) {
        return await this.model.findAndCountAll({
            where: {
                is_admin: {
                    [Op.ne]: true
                }
            },
            attributes: {
                exclude: ['is_admin', 'deleted_at'],
            },
            include: [{
                as: 'profile',
                model: dbs.UserProfile.model,
                attributes: {
                    exclude: ['id', 'created_at', 'updated_at', 'deleted_at'],
                }
            }],
            order: [[sort, dir]],
            limit: _.toNumber(limit),
            offset: _.toNumber(offset),
            transaction
        });

        // return records.map((record: any) => record.get({plain: true}))
    }

    search = async ({ search_name, limit = 100, offset = 0 }: any, transaction?: Transaction) => {
        return this.model.findAll({
            where: {
                is_admin: {
                    [Op.ne]: true
                },
                display_name: {
                    [Op.substring]: `%${search_name}%`,
                }
            },
            include: [{
                model: dbs.UserProfile.model,
                as: 'profile',
                attributes: {
                    exclude: ['created_at', 'updated_at', 'deleted_at'],
                }
            }],
            limit,
            offset,
            transaction
        })
    }
}

export default (rdb: Sequelize) => new UserModel(rdb);
