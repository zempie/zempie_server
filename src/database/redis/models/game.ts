import * as _ from 'lodash';
import CacheModel from './_cache';


const Key = 'zempie:games';

class GameCache extends CacheModel {
    public readonly name = 'game';

    async getList() {
        const games: string | null = await this.redis.get(Key);
        if ( games ) {
            return JSON.parse(games);
        }
        return null
    }

    setList(games: any) {
        this.redis.set(Key, JSON.stringify(games), () => {
            this.redis.expire(Key, 1000 * 60, () => {});
        });
    }
}


export default new GameCache()
