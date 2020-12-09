import CacheModel from './_cache';


const Key = 'zempie:games:';

class GameCache extends CacheModel {
    public readonly name = 'game';

    async getList(query: string) {
        const games: string | null = await this.redis.get(Key + query);
        if ( games ) {
            return JSON.parse(games);
        }
        return null
    }

    setList(games: any, query = '') {
        if ( games.length > 0 ) {
            this.redis.set(Key + query, JSON.stringify(games), () => {
                this.redis.expire(Key, 60, () => {});
            });
        }
    }
}


export default new GameCache()
