import * as _ from 'lodash';
import { v4 as uuid } from 'uuid';
import Model from '../../../_base/model';
import { DataTypes, Op, Sequelize } from 'sequelize';
import { dbs } from '../../../../commons/globals';
import { parseBoolean } from '../../../../commons/utils';
import { IGameListParams } from '../../../../controllers/_interfaces';
import { eGameCategory } from '../../../../commons/enums';


class GameModel extends Model {
    protected initialize(): void {
        this.name = 'game';
        this.attributes = {
            // uid:                { type: DataTypes.UUID, allowNull: false },
            activated:          { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false },
            enabled:            { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false },

            official:           { type: DataTypes.BOOLEAN, defaultValue: false },
            category:           { type: DataTypes.INTEGER, allowNull: false, defaultValue: eGameCategory.Challenge },
            user_id:            { type: DataTypes.INTEGER },

            pathname:           { type: DataTypes.STRING(50), allowNull: false, unique: true },
            title:              { type: DataTypes.STRING(50), allowNull: false, defaultValue: '' },
            description:        { type: DataTypes.STRING(2000), defaultValue: '' },
            version:            { type: DataTypes.STRING(20), defaultValue: '0.0.1' },
            stage:              { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
            support_platform:   { type: DataTypes.STRING(50), defaultValue: '' },
            game_type:          { type: DataTypes.INTEGER, defaultValue: 1 },

            control_type:       { type: DataTypes.SMALLINT, defaultValue: 0 },
            hashtags:           { type: DataTypes.STRING, allowNull: false },

            count_start:        { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
            count_over:         { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
            count_heart:        { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },

            url_game:           { type: DataTypes.STRING },
            url_thumb:          { type: DataTypes.STRING },
            url_thumb_webp:     { type: DataTypes.STRING },
            url_thumb_gif:      { type: DataTypes.STRING },

            url_banner:         { type: DataTypes.STRING }


            // url_title:          { type: DataTypes.STRING },
        }
    }

    async afterSync(): Promise<void> {
        this.model.belongsTo(dbs.User.model);
        this.model.hasOne(dbs.GameEmotion.model, { sourceKey: 'id', foreignKey: 'game_id', as: 'emotions' });
        this.model.hasOne(dbs.GameJam.model, { sourceKey: 'id', foreignKey: 'game_id', as: 'gameJam' })

        const desc = await this.model.sequelize.queryInterface.describeTable(this.model.tableName);

        if (!desc['stage']) {
            this.model.sequelize.queryInterface.addColumn(this.model.tableName, 'stage', {
                type: DataTypes.INTEGER,
                allowNull: false,
                after: 'version'
            })
        }
        if (!desc['url_banner']) {
            this.model.sequelize.queryInterface.addColumn(this.model.tableName, 'url_banner', {
                type: DataTypes.STRING,
                allowNull: true,
                after: 'url_thumb_gif'
            })
        }
        if (!desc['support_platform']) {
            this.model.sequelize.queryInterface.addColumn(this.model.tableName, 'support_platform', {
                type: DataTypes.STRING(50),
                defaultValue: '',
                after: 'stage'
            })
        }
        if (!desc['game_type']) {
            this.model.sequelize.queryInterface.addColumn(this.model.tableName, 'game_type', {
                type: DataTypes.INTEGER,
                defaultValue: 1,
                after: 'support_platform'
            })
        }
        // if ( !desc['category'] ) {
        //     this.model.sequelize.queryInterface.addColumn(this.model.tableName, 'category', {
        //         type: DataTypes.SMALLINT,
        //         allowNull: false,
        //         defaultValue: eGameCategory.Challenge,
        //         after: 'official'
        //     })
        // }
    }


    async getInfo(where: object) {
        const record = await this.model.findOne({
            where,
            // attributes: {
            //     exclude: ['id', 'created_at', 'updated_at', 'deleted_at']
            // },
            include: [{
                model: dbs.User.model,
                where: {
                    activated: true,
                    banned: false,
                    deleted_at: null,
                },
                required: false,
            }, {
                model: dbs.GameEmotion.model,
                as: 'emotions',
            }],
        })

        return record.get({ plain: true })
    }


    async getList({ official, category, filter, game_type, support_platform, limit = 50, offset = 0, sort = 'id', dir = 'desc'}: IGameListParams) {
        // where
        const where: any = {
            activated: true,
            enabled: true,
            category: {
                [Op.ne]: 2,
            },
        }
        if(filter){
            where.stage = { [Op.eq]: filter };
        }



        if(support_platform){
            const platforms = String(support_platform).split(',').sort()
            const pf =  platforms.sort().join(',')
           
            let opLikes : any[] = []

            platforms.forEach((pl: string) => {
                opLikes.push(
                    {support_platform: {[Op.like]: `%${pl}%`} })
            });
            where[Op.or] = [
                {support_platform: {[Op.in]: platforms} },
                ...opLikes
            ]
        }

        if(game_type){
            where.game_type = { [Op.eq]: game_type };
        }

        if (category) {
           
            const ctgry = String(category).split(',')
            where.category = { [Op.in]: ctgry };
        }
        else {
            if (official) {
                where.official = parseBoolean(official)
            }
        }

        // order by
        dir = 'desc';
        // dir = dir.toLowerCase();
        // if ( dir === 'd' || dir === 'desc' ) {
        //     dir = 'desc';
        // }
        // else {
        //     dir = 'asc';
        // }

        let order = [];
        sort = sort.toString().toLowerCase();
        if (sort === 'play' || sort === 'p') {
            order.push(['count_over', dir]);
            order.push(['id', dir])
        }
        else if (sort === 'heart' || sort === 'h') {
            order.push(['count_heart', dir]);
            order.push(['id', dir])
        }
        else if (sort === 'title' || sort === 't' || sort === 'a') {
            order.push(['title', 'asc']);
            order.push(['id', 'asc'])
        }
        else if (sort === 'latest' || sort === 'l' || sort === 'c') {
            order.push(['created_at', 'desc']);
            order.push(['id', 'desc'])
        }
        else if( sort =='recommend' ){
            const sequelize = this.model.sequelize;
            order.push([sequelize.literal(`(IF(count_over >= 1000, 10, count_over / 100) + IF(DATEDIFF(NOW(), created_at) <= 30, 10 - DATEDIFF(NOW(), created_at) * 10 / 30, 0))`), 'DESC']);
        }
        else{
            // order.push(['id', 'asc'])
            order.push(['created_at', 'desc'])
        }

        return this.getListWithUser(where, {
            order,
            include: [
                {
                    model: dbs.GameJam.model,
                    as: 'gameJam',
                },
                {
                    model: dbs.User.model,
                    where: {
                        uid: {
                            //zemplay 관리 계정
                            [Op.ne]: process.env.ZEMPLAY_UID || ''
                        }
                    }
                }
            ],
            limit: _.toNumber(limit),
            offset: _.toNumber(offset),
        });
    }

    getListWithUser = async (where: any, options: any = {}) => {
        return await this.model.findAll({
            where,
            include: [
                {
                    model: dbs.GameEmotion.model,
                    as: 'emotions',
                },
                {
                    model: dbs.User.model,
                    where: {
                        activated: true,
                        banned: false,
                        deleted_at: null,
                    },
                    required: false,
                }
            ],
            ...options,
        })
    }
}


export default (rdb: Sequelize) => new GameModel(rdb)
