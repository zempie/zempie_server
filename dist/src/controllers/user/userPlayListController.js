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
const uniqid = require("uniqid");
const globals_1 = require("../../commons/globals");
const errorCodes_1 = require("../../commons/errorCodes");
const _common_1 = require("../_common");
const fileManager_1 = require("../../services/fileManager");
const replaceExt = require('replace-ext');
class UserPlayListController {
    constructor() {
        this.getPlayList = ({ uid }, _user) => __awaiter(this, void 0, void 0, function* () {
            const playlist = yield globals_1.dbs.UserPlayList.getPlayList({ uid });
            if (!playlist) {
                throw errorCodes_1.CreateError(errorCodes_1.ErrorCodes.INVALID_PLAYLIST_UID);
            }
            const { user } = playlist;
            return {
                uid: playlist.uid,
                title: playlist.title,
                url_bg: playlist.url_bg,
                user: {
                    uid: user.uid,
                    name: user.name,
                    picture: user.picture,
                },
                games: _.map(playlist.games, (obj) => {
                    const { game } = obj;
                    return _common_1.getGameData(game);
                }),
            };
        });
        this.createPlaylist = ({ title }, user, { req: { files: { file } } }) => __awaiter(this, void 0, void 0, function* () {
            let data;
            const playlist_uid = uniqid();
            if (file) {
                const webp = yield fileManager_1.default.convertToWebp(file, 80);
                data = yield fileManager_1.default.s3upload3({
                    key: replaceExt(`playlist_${playlist_uid}`, '.webp'),
                    filePath: webp[0].destinationPath,
                    uid: user.uid,
                    bucket: '/playlist',
                });
            }
            const playlist = yield globals_1.dbs.UserPlayList.create({
                uid: playlist_uid,
                user_uid: user.uid,
                title,
                url_bg: data.Location,
            });
            return {
                playlist: {
                    uid: playlist.uid,
                    title: playlist.title,
                    url_bg: data ? data.Location : null,
                    updated_at: playlist.updated_at,
                }
            };
        });
        this.updatePlaylist = ({ uid, title }, user, { req: { files: { file } } }) => __awaiter(this, void 0, void 0, function* () {
            yield globals_1.dbs.UserPlayList.getTransaction((transaction) => __awaiter(this, void 0, void 0, function* () {
                const playlist = yield globals_1.dbs.UserPlayList.findOne({ uid, user_uid: user.uid }, transaction);
                if (!playlist) {
                    throw errorCodes_1.CreateError(errorCodes_1.ErrorCodes.INVALID_PLAYLIST_UID);
                }
                let data;
                if (file) {
                    const webp = yield fileManager_1.default.convertToWebp(file, 80);
                    data = yield fileManager_1.default.s3upload3({
                        key: replaceExt(`playlist_${uid}`, '.webp'),
                        filePath: webp[0].destinationPath,
                        uid: user.uid,
                        bucket: '/playlist',
                    });
                }
                playlist.title = title || playlist.title;
                playlist.url_bg = data ? data.Location : playlist.url_bg;
                playlist.save({ transaction });
                return {
                    playlist: {
                        uid,
                        title: playlist.title,
                        url_bg: playlist.url_bg,
                        updated_at: playlist.updated_at,
                    }
                };
            }));
        });
        this.deletePlaylist = ({ uid }, user) => __awaiter(this, void 0, void 0, function* () {
            yield globals_1.dbs.UserPlayList.destroy({ uid, user_uid: user.uid });
        });
        /**
         * game in a playlist
         */
        this.addGame = ({ uid, game_id }, user) => __awaiter(this, void 0, void 0, function* () {
            const playlist = yield globals_1.dbs.UserPlayList.findOne({ uid, user_uid: user.uid });
            if (!playlist) {
                throw errorCodes_1.CreateError(errorCodes_1.ErrorCodes.INVALID_PLAYLIST_UID);
            }
            const game = yield globals_1.dbs.Game.findOne({ game_id });
            if (!game) {
                throw errorCodes_1.CreateError(errorCodes_1.ErrorCodes.INVALID_GAME_ID);
            }
            const count = yield globals_1.dbs.UserPlayListGame.count({ userPlayList_id: playlist.id });
            yield globals_1.dbs.UserPlayListGame.create({
                userPlayList_id: playlist.id,
                num: count + 1,
                game_id: game.id,
            });
        });
        this.delGame = ({ uid, game_id }, user) => __awaiter(this, void 0, void 0, function* () {
            const playlist = yield globals_1.dbs.UserPlayList.findOne({ uid, user_uid: user.uid });
            if (!playlist) {
                throw errorCodes_1.CreateError(errorCodes_1.ErrorCodes.INVALID_PLAYLIST_UID);
            }
        });
        this.sortGame = () => __awaiter(this, void 0, void 0, function* () {
        });
    }
}
exports.default = new UserPlayListController();
//# sourceMappingURL=userPlayListController.js.map