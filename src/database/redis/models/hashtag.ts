import * as _ from 'lodash';
import CacheModel from './_cache';


class HashtagCache extends CacheModel {
    public readonly name = 'hashtag';

    addTag(keys: Array<string> | string, field: string, value: string) {
        let _keys: Array<string>;
        if ( typeof keys === 'string' ) {
            _keys = [];
            _keys.push(keys)
        }
        else {
            _keys = [...keys];
        }
        _.forEach(_keys, (key) => {
            key = key.trim();
            if ( key.indexOf('#') !== 0 ) {
                key = '#' + key;
            }
            this.redis.hset(key, field, value);
        })
    }

    delTag(key: string, field: string) {
        key = key.trim();
        if ( key.indexOf('#') !== 0 ) {
            key = '#' + key;
        }
        this.redis.hdel(key, field);
    }

    async findAll(key: string) {
        key = key.trim();
        if ( key.indexOf('#') !== 0 ) {
            key = '#' + key;
        }
        return this.redis.hgetall(key);
    }
}


export default new HashtagCache()
