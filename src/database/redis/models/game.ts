import CacheModel from './_cache';


const Key = 'zempie:game:i:';
const ListKey = 'zempie:games:';

class GameCache extends CacheModel {
    public readonly name = 'game';

    async getList(query: string) {
        const games: string | null = await this.redis.get(ListKey + query);
        if ( games ) {
            return JSON.parse(games);
        }
        return null
    }

    setList(games: any, query = '') {
        if ( games.length > 0 ) {
            this.redis.set(ListKey + query, JSON.stringify(games), () => {
                this.redis.expire(ListKey, 60, () => {});
            });
        }
    }

    async get(pathname: string) {
        const game = await this.redis.get(Key + pathname);
        if ( game ) {
            return JSON.parse(game)
        }
        return game;
    }

    set(game: any) {
        this.redis.set(Key + game.pathname, JSON.stringify(game), () => {
            this.redis.expire(Key + game.pathname, 60, () => {});
        })
    }
}


export default new GameCache()
