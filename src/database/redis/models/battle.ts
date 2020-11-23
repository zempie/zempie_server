import * as _ from 'lodash';
import CacheModel from './_cache';


class BattleCache extends CacheModel {
    public readonly name = 'battle';

    async gameStart (battle_uid: string, battle_key: string, user_uid: string, best_score?: number) {
        this.redis.hset(`zempie:battle:${battle_uid}:users`, user_uid, JSON.stringify({
            user_uid,
            best_score: best_score || -1,
        }))
    }

    async gameOver (battle_uid: string, user_uid: string, score: number) {
        this.redis.zadd(`zempie:battle:${battle_uid}`)
    }
}


export default new BattleCache()
