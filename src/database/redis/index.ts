import * as redis from 'ioredis';
import db_options from '../../../config/dbs';

/**
 * sudo docker run -v /home/loki/redis/redis.conf:/usr/local/etc/redis/redis.conf --name redis -d -p 6379:6379 redis redis-server /usr/local/etc/redis/redis.conf
 */

class Redis {
    private redis: any = null;
    private interval: any = null;

    constructor() {
        this.initialize()
    }

    public initialize() {
        if ( this.redis ) {
            //
        }
        this.redis = new redis(db_options.redis);
        if ( this.redis ) {
            this.redis.hset('server:platform', 'status', 'running');
            this.setTimer();
        }
        console.log('redis is ready.'.cyan);

        return this;
    }

    private setTimer() {
        if ( this.interval ) {
            clearInterval(this.interval);
        }

        const time = !!this.interval? 30 : 0;
        this.interval = setInterval(() => {
            this.redis.expire('server:deploy', 30);
        }, 1000* time);
    }

    public getRedis() {
        return this.redis;
    }
}

export default new Redis().getRedis();