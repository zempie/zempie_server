import * as _ from 'lodash';
import * as uniqid from 'uniqid';
import { v4 as uuid } from 'uuid';
import { dbs } from '../commons/globals';
import { IBattleParams, IUser, IGamePlayParams, IGameKey, IBattlePlayParams } from './_interfaces';
import { Transaction } from 'sequelize';
import { signJWT, verifyJWT } from '../commons/utils';
import { CreateError, ErrorCodes } from '../commons/errorCodes';
import { gameCache } from '../database/redis/models/games';

class BattleController {
    getBattleList = async () => {

    }

    getInfo = async ({ battle_uid }: any) => {
        const battle = await dbs.Battle.model.findOne({
            where: { uid: battle_uid },
            include: [{
                model: dbs.User.model,
            }]
        });
        const games = await gameCache.get();
        const game = _.find(games, game => game.game_uid === battle.game_uid);
        const host = battle.user;

        return {
            battle_uid: battle.uid,
            host: {
                displayName: host.display_name,
                photoURL: host.photo_url,
            },
            game,
            battle,
        }
    }


    hostBattle = async ({ game_uid, is_infinity }: any, user: IUser) => {
        const uid = uniqid();

        await dbs.Battle.create({
            uid,
            user_uid: user.uid,
            game_uid,
            // end_at: is_infinity ? null : new Date()
            end_at: Date.now() + (1000 * 60 * 10)
        });

        return {
            battle_uid: uid,
            share_url: `http://localhost:8280/battle/${uid}`
        }
    }


    gameStart = async ({ battle_uid, battle_key }: IBattleParams, user: IUser) => {
        return dbs.BattleLog.getTransaction(async (transaction: Transaction) => {
            const battle = await dbs.Battle.findOne({uid: battle_uid}, transaction);
            if ( new Date(battle.end_at) < new Date() ) {
                throw CreateError(ErrorCodes.BATTLE_OVER);
            }
            battle.user_count += 1;
            await battle.save({transaction});


            let decoded = battle_key? verifyJWT(battle_key) : {
                user_uid: battle_uid + '_' + uniqid(),
                best_score: -1
            };
            let user_uid = user? user.uid : decoded.user_uid;


            const battle_user = await dbs.BattleUser.findOrCreate({
                battle_uid,
                user_uid,
                user_name: user? user.displayName : 'noname'
            });
            decoded.best_score = battle_user.best_score;


            const record = await dbs.BattleLog.create({
                battle_uid,
                battle_user_id: battle_user.id,
                score: -1
            }, transaction);


            const new_battle_key = signJWT({
                uid: battle_uid,
                game_uid: battle.game_uid,
                user_uid,
                secret_id: record.id,
                best_score: decoded.best_score,
            }, '10m');


            return {
                battle_key: new_battle_key
            }
        })
    }


    gameOver = async ({ battle_key, score }: IBattlePlayParams, user: IUser) => {
        const decoded = verifyJWT(battle_key);
        const { uid: battle_uid, game_uid, user_uid, secret_id, best_score } = decoded;

        return dbs.BattleLog.getTransaction(async (transaction: Transaction) => {
            await dbs.BattleLog.updateScore({ id: secret_id, score }, transaction);

            const new_record = score > best_score;
            if ( new_record ) {
                await dbs.BattleUser.updateBestScore({ battle_uid, user_uid, best_score: score }, transaction);
            }

            // timeline

            return {
                new_record
            }
        })
    }


    updateUserName = async ({ battle_key, user_name }: any, user: IUser) => {
        const decoded = verifyJWT(battle_key);
        const { uid: battle_uid, game_uid, user_uid, secret_id, best_score } = decoded;

        await dbs.BattleUser.updateUserName({ battle_uid, user_uid, user_name})
    }



    getRanking = async ({ battle_uid }: any, user: IUser) => {
        const ranking = await dbs.BattleUser.getRanking({ battle_uid });
        return {
            ranking
        }
    }
}

export default new BattleController()
