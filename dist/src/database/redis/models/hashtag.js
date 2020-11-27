"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const _ = require("lodash");
const _cache_1 = require("./_cache");
class HashtagCache extends _cache_1.default {
    constructor() {
        super(...arguments);
        this.name = 'hashtag';
    }
    addTag(keys, field, value) {
        let _keys;
        if (typeof keys === 'string') {
            _keys = [];
            _keys.push(keys);
        }
        else {
            _keys = [...keys];
        }
        _.forEach(_keys, (key) => {
            key = key.trim();
            if (key.indexOf('#') !== 0) {
                key = '#' + key;
            }
            this.redis.hset(key, field, value);
        });
    }
    delTag(key, field) {
        key = key.trim();
        if (key.indexOf('#') !== 0) {
            key = '#' + key;
        }
        this.redis.hdel(key, field);
    }
    findAll(key) {
        return __awaiter(this, void 0, void 0, function* () {
            key = key.trim();
            if (key.indexOf('#') !== 0) {
                key = '#' + key;
            }
            return this.redis.hgetall(key);
        });
    }
}
exports.default = new HashtagCache();
//# sourceMappingURL=hashtag.js.map