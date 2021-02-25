import * as _ from 'lodash';
import { dbs } from '../../commons/globals';
import { Transaction } from 'sequelize';
import { parseBoolean } from '../../commons/utils';
import { CreateError, ErrorCodes } from '../../commons/errorCodes';
import { eGameCategory } from '../../commons/enums';


class AdminGameController {
    getGames = async ({ limit = 50, offset = 0 }) => {
        const games = await dbs.Game.findAll({}, {
            include: [{
                model: dbs.User.model,
            }],
            order: [['id', 'asc']],
            limit: _.toNumber(limit),
            offset: _.toNumber(offset),
        });
        return {
            games: _.map(games, (game: any) => game.get({ plain: true }))
        }
    }


    createAffiliatedGame = async ({ pathname, title, description, hashtags, url_game, url_thumb, url_thumb_webp, url_thumb_gif}: any) => {
        const exist = await dbs.Game.findOne({ pathname });
        if ( exist ) {
            throw CreateError(ErrorCodes.ADMIN_GAME_PATHNAME_DUPLICATED);
        }

        return dbs.Game.getTransaction(async (transaction: Transaction) => {
            const game = await dbs.Game.create({
                category: eGameCategory.Affiliated,
                pathname,
                title, description,
                hashtags,
                url_game, url_thumb, url_thumb_webp, url_thumb_gif,
            }, transaction);

            await dbs.Hashtag.addTags(game.id, hashtags, transaction);

            return {
                game: game.get({ plain: true }),
            }
        })
    }

    updateAffiliatedGame = async ({ game_id, pathname, title, description, hashtags, url_game, url_thumb, url_thumb_webp, url_thumb_gif }: any) => {
        await dbs.Game.getTransaction(async (transaction: Transaction) => {
            const game = await dbs.Game.findOne({ id: game_id, category: eGameCategory.Affiliated }, transaction);
            if ( !game ) {
                throw CreateError(ErrorCodes.INVALID_GAME_ID);
            }

            game.pathname = pathname || game.pathname;
            game.title = title || game.title;
            game.description = description || game.description;
            game.url_game = url_game || game.url_game;
            game.url_thumb = url_thumb || game.url_thumb;
            game.url_thumb_webp = url_thumb_webp || game.url_thumb_webp;
            game.url_thumb_gif = url_thumb_gif || game.url_thumb_gif;
            await game.save({ transaction });

            if ( hashtags ) {
                await dbs.Hashtag.delTags(game.id, 'game', transaction);
                await dbs.Hashtag.addTags(game.id, game.hashtags, transaction);
            }
        });
    }


    updateGame = async (params: any) => {
        // 불량 단어 색출
        if ( !dbs.BadWords.areOk(params) ) {
            throw CreateError(ErrorCodes.FORBIDDEN_STRING);
        }
        const { game_id, official, category, enabled, activated } = params;
        await dbs.Game.getTransaction(async (transaction: Transaction) => {
            const game = await dbs.Game.findOne({ game_id }, transaction);

            if ( !!category ) {
                game.category = _.toNumber(category);
            }

            if ( !!official ) {
                game.official = parseBoolean(official);
            }

            if ( !!enabled ) {
                game.enabled = parseBoolean(enabled);
            }

            if ( !!activated ) {
                game.activated = parseBoolean(activated);
            }

            await game.save({ transaction });
        })
    }
}


export default new AdminGameController()
