import * as _ from 'lodash';
import { dbs } from '../../commons/globals';
import { Transaction } from 'sequelize';
import { parseBoolean } from '../../commons/utils';


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


    updateGame = async ({ game_id, official, enabled, activated, }: any) => {
        await dbs.Game.getTransaction(async (transaction: Transaction) => {
            const game = await dbs.Game.findOne({ game_id }, transaction);

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
