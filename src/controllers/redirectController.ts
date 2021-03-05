import { Response, Request } from 'express';
import { IRoute } from './_interfaces';
import { caches, dbs } from '../commons/globals';
import { CreateError } from '../commons/errorCodes';
import { getGameData } from './_common';


class RedirectController {
    private checkUserAgent = (req: Request) => {
        const userAgent: any = req.headers['User-Agent'.toLowerCase()];
        return userAgent?.match(/GuzzleHttp|baiduspider|twitterbot|facebookexternalhit|rogerbot|linkedinbot|embedly|quora link preview|showyoubot|outbrain|pinterest|slackbot|vkShare|W3C_Validator/i)
    }

    private responseGame = (res: Response, game: any, url: string) => {
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
    }

    play = async (req: Request, res: Response) => {
        const { pathname } = req.params;
        if ( this.checkUserAgent(req) ) {
            let game = caches.game.getByPathname(pathname);
            if ( !game ) {
                game = await dbs.Game.findOne({ pathname: pathname });
            }
            if ( !game ) {
                res.redirect(`https://zempie.com`);
            }
            else {
                game = getGameData(game);
                caches.game.setByPathname(game, pathname);
                this.responseGame(res, game, `https://zempie.com/play/${req.params.pathname}`);
            }
        }
        else {
            res.redirect(`https://zempie.com/redirect/play/${req.params.pathname}`)
        }
    }


    battle = async (req: Request, res: Response) => {
        const { battle_uid } = req.params;
        if ( this.checkUserAgent(req) ) {
            let battle = caches.battle.getByUid(battle_uid);
            if ( !battle ) {
                battle = await dbs.Battle.model.findOne({
                    where: { uid: battle_uid },
                    include: [{
                        model: dbs.Game.model,
                    }]
                });
            }
            if ( !battle ) {
                res.redirect(`https://zempie.com`);
            }
            else {
                caches.game.setByUid(battle, battle_uid);
                const game = getGameData(battle.game)
                this.responseGame(res, game, `https://zempie.com/battle/${req.params.battle_uid}`);
            }
        }
        else {
            res.redirect(`https://zempie.com/redirect/battle/${req.params.pathname}`)
        }
    }

    shared = async (req: Request, res: Response) => {

    }
}


export default new RedirectController()
