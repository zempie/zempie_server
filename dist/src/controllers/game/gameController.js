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
const sequelize_1 = require("sequelize");
const globals_1 = require("../../commons/globals");
const messageQueueService_1 = require("../../services/messageQueueService");
const opt_1 = require("../../../config/opt");
const _common_1 = require("../_common");
const enums_1 = require("../../commons/enums");
const errorCodes_1 = require("../../commons/errorCodes");
const { Url } = opt_1.default;
class GameController {
    constructor() {
        this.featuredList = () => __awaiter(this, void 0, void 0, function* () {
            let ret = yield globals_1.caches.game.getFeatured();
            if (!ret) {
                const popular = yield globals_1.dbs.Game.getListIncludingUser({ activated: true, enabled: true }, { order: sequelize_1.Sequelize.literal('rand()'), limit: 5 });
                const recommended = yield globals_1.dbs.Game.getListIncludingUser({ activated: true, enabled: true }, { order: sequelize_1.Sequelize.literal('rand()'), limit: 5 });
                const latest = yield globals_1.dbs.Game.getListIncludingUser({ activated: true, enabled: true }, { order: [['id', 'asc']], limit: 5 });
                const certified = yield globals_1.dbs.Game.getListIncludingUser({ category: enums_1.eGameCategory.Certified, activated: true, enabled: true }, { order: sequelize_1.Sequelize.literal('rand()'), limit: 5 });
                const uncertified = yield globals_1.dbs.Game.getListIncludingUser({ category: enums_1.eGameCategory.Challenge, activated: true, enabled: true }, { order: sequelize_1.Sequelize.literal('rand()'), limit: 5 });
                ret = [
                    {
                        name: '인기 게임 Popular Games',
                        games: _.map(popular, obj => _common_1.getGameData(obj)),
                    },
                    {
                        name: '추천 게임 Recommended Games',
                        games: _.map(recommended, obj => _common_1.getGameData(obj)),
                    },
                    {
                        name: '최신 게임 New Games',
                        games: _.map(latest, obj => _common_1.getGameData(obj)),
                    },
                    {
                        name: '인증 게임 Certified Games',
                        games: _.map(certified, obj => _common_1.getGameData(obj)),
                        key: 'official',
                    },
                    {
                        name: '도전 게임 Challenging Games',
                        games: _.map(uncertified, obj => _common_1.getGameData(obj)),
                        key: 'unofficial',
                    },
                ];
                globals_1.caches.game.setFeatured(ret);
            }
            return ret;
        });
        this.playGame = ({ pathname, user_uid }) => __awaiter(this, void 0, void 0, function* () {
            if (!user_uid) {
                return;
            }
            messageQueueService_1.default.send({
                topic: 'pubPlayGame',
                messages: [{
                        value: JSON.stringify({
                            pathname,
                            user_uid,
                        })
                    }]
            });
        });
        this.redirectGame = ({ pathname, pid }, user, { req, res }) => {
            // const { pathname, pid } = _.assignIn({}, req.body, req.query, req.params);
            let url = `${Url.GameClient}/${pathname}`;
            if (pid) {
                url += `/${pid}`;
            }
            res.redirect(url);
        };
        // redirectGame = (req: Request, res: Response) => {
        //     const { pathname, pid } = _.assignIn({}, req.body, req.query, req.params);
        //     let url = `${Url.GameClient}/${pathname}`;
        //     if ( pid ) {
        //         url += `/${pid}`;
        //     }
        //     res.redirect(url);
        // }
        this.gameStart = ({ game_id }, user) => __awaiter(this, void 0, void 0, function* () {
            // const user_uid = user.uid;
            // await dbs.GameLog.create({
            //     user_uid: uid,
            //     game_uid
            // });
            return {
                value: 'okokoaksfojasdlkfjs'
            };
        });
        this.gameOver = ({ game_id, score, pid }, user) => __awaiter(this, void 0, void 0, function* () {
            const user_uid = user ? user.uid : null;
            // const { uid: user_uid } = user;
            // const user_uid = user.uid;
            // const userRecord = await dbs.User.findOne({ uid: user_uid });
            // const game = await dbs.Game.findOne({ uid: game_uid });
            // if ( !game ) {
            //     throw CreateError(ErrorCodes.INVALID_GAME_UID);
            // }
            //
            // const user_id = userRecord.id;
            // const game_id = game.id;
            messageQueueService_1.default.send({
                topic: 'gameOver',
                messages: [{
                        value: JSON.stringify({
                            user_uid,
                            game_id,
                            score,
                            pid,
                        }),
                    }]
            });
            if (!user_uid) {
                return;
            }
            return yield globals_1.dbs.UserGame.getTransaction((transaction) => __awaiter(this, void 0, void 0, function* () {
                const record = yield globals_1.dbs.UserGame.findOne({ user_uid, game_id }, transaction);
                const previous_score = record ? record.score : 0;
                const new_record = score > previous_score;
                if (new_record) {
                    if (record) {
                        record.score = score;
                        yield record.save({ transaction });
                    }
                    else {
                        yield globals_1.dbs.UserGame.create({ user_uid, game_id, score }, transaction);
                    }
                }
                return {
                    new_record
                };
            }));
        });
        this.getGame = ({ pathname }, user) => __awaiter(this, void 0, void 0, function* () {
            // let game = await caches.game.getByPathname(pathname);
            // if ( !game ) {
            //     game = await dbs.Game.getInfo({ pathname });
            //     game = getGameData(game);
            //     caches.game.setByPathname(game);
            //     caches.game.setByPathname(ret, pathname);
            // }
            // return {
            //     game
            // };
            const user_uid = user ? user.uid : '';
            const key = pathname + '_' + user_uid;
            let ret = yield globals_1.caches.game.getByPathname(key);
            if (!ret) {
                const game = yield globals_1.dbs.Game.getInfo({ pathname });
                const my_heart = yield globals_1.dbs.GameHeart.findOne({ game_id: game.id, user_uid });
                const my_emotions = { e1: false, e2: false, e3: false, e4: false, e5: false };
                const emotions = yield globals_1.dbs.UserGameEmotion.findAll({ game_id: game.id, user_uid });
                _.forEach(emotions, (obj) => {
                    const e = obj.get({ plain: true });
                    my_emotions[e.emotion] = e.activated;
                });
                ret = {
                    game: _common_1.getGameData(game),
                    my_heart: my_heart ? my_heart.activated : false,
                    my_emotions,
                };
                globals_1.caches.game.setByPathname(ret, key);
            }
            // const game = await dbs.Game.getInfo({ pathname });
            // const ret = {
            //     game: getGameData(game),
            // }
            return ret;
        });
        this.getGameList = ({ official, category, limit = 50, offset = 0, sort, dir }, user, { req }) => __awaiter(this, void 0, void 0, function* () {
            const query = JSON.stringify(req.query);
            let games = yield globals_1.caches.game.getList(query);
            if (!games) {
                const rows = yield globals_1.dbs.Game.getList({ official, category, limit, offset, sort, dir });
                games = _.map(rows, game => _common_1.getGameData(game));
                // caches.game.setList(games, query);
            }
            return {
                games
            };
        });
        this.getHashTags = ({ tag }, user) => __awaiter(this, void 0, void 0, function* () {
            const tags = yield globals_1.dbs.Hashtag.getTagsLike(tag);
            return {
                tags: _.map(tags, (tag) => {
                    return {
                        id: tag.id,
                        tag: tag.name,
                    };
                })
            };
        });
        this.getHashTagById = ({ id, limit = 50, offset = 0 }, user) => __awaiter(this, void 0, void 0, function* () {
            const ref = yield globals_1.dbs.Hashtag.getGamesById(id, { limit, offset });
            return {
                tag: ref.name,
                games: _.map(ref.refTags, ref => {
                    const { game } = ref;
                    return _common_1.getGameData(game);
                })
            };
        });
        this.getGameListByHashtag = ({ tag }, user) => __awaiter(this, void 0, void 0, function* () {
            const games = yield globals_1.caches.hashtag.findAll(tag);
            return {
                games: _.map(games, game => JSON.parse(game))
            };
        });
        this.sampleTest = ({}, user) => __awaiter(this, void 0, void 0, function* () {
            const data = yield messageQueueService_1.default.send({
                topic: 'gameOver',
                messages: [{
                        value: JSON.stringify({
                            key1: 'value1',
                            key2: 'value2',
                        }),
                    }]
            });
            console.log(data);
            console.log('sent');
        });
        this.cacheTest = () => __awaiter(this, void 0, void 0, function* () {
            globals_1.caches.hashtag.addTag('arcade', 'papa', JSON.stringify({
                uid: 'papa123',
                title: 'basketball papa',
            }));
            globals_1.caches.hashtag.addTag(['#arcade', 'puzzle'], 'shark', JSON.stringify({
                uid: 'shark000',
                title: 'shark frenzy',
            }));
        });
        this.cacheTest2 = ({ k }) => __awaiter(this, void 0, void 0, function* () {
            const records = yield globals_1.caches.hashtag.findAll(k);
            return {
                records: _.map(records, JSON.parse)
            };
        });
        this.tagTest = (params, user) => __awaiter(this, void 0, void 0, function* () {
            if (!globals_1.dbs.BadWords.areOk(params)) {
                throw errorCodes_1.CreateError(errorCodes_1.ErrorCodes.FORBIDDEN_STRING);
            }
        });
        this.tagTest2 = ({ tag }) => __awaiter(this, void 0, void 0, function* () {
            const r = yield globals_1.dbs.Hashtag.getGamesByTagLike(tag);
            return {
                tag,
                games: _.map(r === null || r === void 0 ? void 0 : r.refTags, (ref) => _common_1.getGameData(ref.game))
            };
        });
    }
}
exports.default = new GameController();
//# sourceMappingURL=gameController.js.map