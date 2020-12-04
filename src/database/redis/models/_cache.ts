import { Redis as IRedis } from 'ioredis';


class CacheModel {
    protected redis!: IRedis;

    protected async initialize (redis: IRedis) {
        this.redis = redis;
    }
}


export default CacheModel
