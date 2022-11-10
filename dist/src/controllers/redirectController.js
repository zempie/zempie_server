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
const globals_1 = require("../commons/globals");
const _common_1 = require("./_common");
const opt_1 = require("../../config/opt");
const { Url } = opt_1.default;
class RedirectController {
    constructor() {
        this.checkUserAgent = (req) => {
            const userAgent = req.headers['User-Agent'.toLowerCase()];
            return userAgent === null || userAgent === void 0 ? void 0 : userAgent.match(/GuzzleHttp|baiduspider|twitterbot|facebookexternalhit|rogerbot|linkedinbot|embedly|quora link preview|showyoubot|outbrain|pinterest|slackbot|vkShare|W3C_Validator/i);
        };
        this.responseGame = (res, game, url) => {
            res.status(200).set('Content-Type', 'text/html')
                .end(`<html>
                                <head>
                                    <title>${game.title}</title>
                                    <meta name="description" content="${game.description}">
                                    <meta property="og:url" content="${url}">
                                    <meta property="og:site_name" content="Zempie">
                                    <meta property="og:title" content="${game.title}">
                                    <meta property="og:description" content="${game.description}">
                                    <meta property="og:image" content="${game.url_thumb}">
                                    <meta property="og:type" content="website">
                                </head>
                            </html>`);
        };
        this.site = (req, res) => __awaiter(this, void 0, void 0, function* () {
            if (this.checkUserAgent(req)) {
                res.redirect(Url.Host);
            }
            else {
                res.redirect(`${Url.Redirect}/${req.params.url}`);
            }
        });
        this.play = (req, res) => __awaiter(this, void 0, void 0, function* () {
            const { pathname } = req.params;
            if (this.checkUserAgent(req)) {
                let game = yield globals_1.caches.game.getByPathname(pathname);
                if (!game) {
                    game = yield globals_1.dbs.Game.findOne({ pathname: pathname });
                }
                if (!game) {
                    res.redirect(Url.Host);
                }
                else {
                    game = (0, _common_1.getGameData)(game);
                    globals_1.caches.game.setByPathname(game, pathname);
                    this.responseGame(res, game, `${Url.Host}/play/${req.params.pathname}`);
                }
            }
            else {
                res.redirect(`${Url.Redirect}/play/${req.params.pathname}`);
            }
        });
        this.battle = (req, res) => __awaiter(this, void 0, void 0, function* () {
            const { battle_uid } = req.params;
            const keyType = `zempie:redirect:`;
            if (this.checkUserAgent(req)) {
                let game = yield globals_1.caches.game.getData(keyType, battle_uid);
                if (!game) {
                    const record = yield globals_1.dbs.Battle.model.findOne({
                        where: { uid: battle_uid },
                        include: [{
                                model: globals_1.dbs.Game.model,
                            }]
                    });
                    if (!record) {
                        res.redirect(Url.Host);
                        return;
                    }
                    game = (0, _common_1.getGameData)(record.game);
                    globals_1.caches.game.setData(game, keyType, battle_uid);
                }
                this.responseGame(res, game, `${Url.Launcher}/battle/${battle_uid}`);
            }
            else {
                res.redirect(`${Url.LauncherRedirect}/battle/${battle_uid}`);
            }
        });
        this.shared = (req, res) => __awaiter(this, void 0, void 0, function* () {
            const { shared_uid } = req.params;
            const keyType = `zempie:redirect:`;
            if (this.checkUserAgent(req)) {
                let game = yield globals_1.caches.game.getData(keyType, shared_uid);
                if (!game) {
                    const record = yield globals_1.dbs.SharedGame.model.findOne({
                        where: { uid: shared_uid },
                        include: [{
                                model: globals_1.dbs.Game.model,
                            }]
                    });
                    if (!record) {
                        res.redirect(Url.Host);
                        return;
                    }
                    game = (0, _common_1.getGameData)(record.game);
                    globals_1.caches.game.setData(game, keyType, shared_uid);
                }
                this.responseGame(res, game, `${Url.Launcher}/shared/${shared_uid}`);
            }
            else {
                res.redirect(`${Url.LauncherRedirect}/shared/${shared_uid}`);
            }
        });
        this.game = (req, res) => __awaiter(this, void 0, void 0, function* () {
            const { pathname } = req.params;
            if (this.checkUserAgent(req)) {
                let game = yield globals_1.caches.game.getByPathname(pathname);
                if (!game) {
                    game = yield globals_1.dbs.Game.findOne({ pathname: pathname });
                }
                if (!game) {
                    res.redirect(Url.Host);
                }
                else {
                    game = (0, _common_1.getGameData)(game);
                    globals_1.caches.game.setByPathname(game, pathname);
                    this.responseGame(res, game, `${Url.Launcher}/game/${req.params.pathname}`);
                }
            }
            else {
                res.redirect(`${Url.LauncherRedirect}/game/${req.params.pathname}`);
            }
        });
        this.community = (req, res) => __awaiter(this, void 0, void 0, function* () {
            res.redirect(`${Url.Redirect}/community/${req.params.community_id}/timeline`);
        });
        this.members = (req, res) => __awaiter(this, void 0, void 0, function* () {
            res.redirect(`${Url.Redirect}/community/${req.params.community_id}/members`);
        });
        this.user = (req, res) => __awaiter(this, void 0, void 0, function* () {
            res.redirect(`${Url.Redirect}/user/${req.params.user_id}/settings`);
        });
    }
}
exports.default = new RedirectController();
//# sourceMappingURL=redirectController.js.map