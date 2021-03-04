import { Response, Request } from 'express';
import { IRoute } from './_interfaces';
import { dbs } from '../commons/globals';
import { CreateError } from '../commons/errorCodes';


class RedirectController {
    play = async (req: Request, res: Response) => {
        const { pathname } = req.params;
        const userAgent: any = req.headers['User-Agent'.toLowerCase()];
        if (userAgent?.match(/GuzzleHttp|baiduspider|twitterbot|facebookexternalhit|rogerbot|linkedinbot|embedly|quora link preview|showyoubot|outbrain|pinterest|slackbot|vkShare|W3C_Validator/i)) {
            const game = await dbs.Game.findOne({ pathname: pathname });
            if ( !game ) {
                res.redirect(`https://zempie.com`);
            }
            else {
                res.status(200).set('Content-Type', 'text/html')
                    .end(`<html>
                                <head>
                                    <title>${game.title}</title>
                                    <meta name="description" content="${game.description}">
                                    <meta property="og:url" content="https://zempie.com/play/${req.params.pathname}">
                                    <meta property="og:site_name" content="Zempie">
                                    <meta property="og:title" content="${game.title}">
                                    <meta property="og:description" content="${game.description}">
                                    <meta property="og:image" content="${game.url_thumb}">
                                    <meta property="og:type" content="website">
                                </head>
                            </html>`);
            }
        }
        else {
            res.redirect(`https://zempie.com/redirect/play/${req.params.pathname}`)
        }
    }
}


export default new RedirectController()
