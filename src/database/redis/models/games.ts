import redis from '../';
import { KeyType, ValueType } from "ioredis";
import { eRedis } from "../../../commons/enums";
import * as _ from "lodash";
import { caches } from "../../../commons/globals";
import Opt from '../../../../config/opt';
const { Url, Deploy } = Opt;


class GamesCache {
    private key: KeyType = 'zemini:games:';

    expire = async (time: number = 1000 * 60) => {
        await redis.expire(this.key, time);
    }

    get = async() => {
        let _games = await redis.hgetall(this.key);
        let games;
        if( Object.keys(_games).length <= 0 ) {
            const response = await fetch(`${Url.DeployApiV1}/games?key=${Deploy.api_key}`);
            if( response.status !== 200 ) {
                throw new Error(response.statusText);
            }

            const json = await response.json();
            _games = json.data.games;
            games = _.map(_games, (game: any) => {
                // games[game.uid] = game;
                redis.hset(this.key, game.game_uid, JSON.stringify(game));
                return game;
            });
            await redis.expire(this.key, 1000 * 60 * 60 * 12); // 12시간

            caches.games = games;
        }
        else {
            games = _.map(_games, (game: any) => {
                return JSON.parse(game);
            });
        }

        return games;
    }
}
export const GameCache = new GamesCache();

class CacheModel {
    private readonly groupType: eRedis;
    private key: KeyType | undefined;

    constructor(groupType: eRedis = eRedis.Strings) {
        this.groupType = groupType;
    }

    expire = async (time: number = 1000 * 60) => {
        await redis.expire(this.key, time);
    }


}


class Ranking {
    private key: KeyType = 'zemini:ranking';

    // 전체 유저 수
    totalCount = (project_id: number, game_uid: string) => {
        return redis.zcard(`${this.key}:${project_id}:${game_uid}`);
    }

    // 점수 갱신
    updateScore = (project_id: number, game_uid: string, user_uid: string, score: number) => {
        redis.zadd(`${this.key}:${project_id}:${game_uid}`, score, user_uid);
    }

    // 랭킹 범위
    rankings = () => {
        redis.zrevrange()
    }

    // 특정 유저 랭킹
    rankOf = (project_id: number, game_uid: string, user_uid: string) => {
        redis
    }
}