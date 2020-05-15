import * as admin from 'firebase-admin';
import * as _ from 'lodash';
import { Request, Response } from 'express';
import { verifyJWT } from '../commons/utils';
import { dbs } from '../commons/globals';
import { Transaction } from 'sequelize';
import { CreateError } from '../commons/errorCodes';
import cfgOption from '../../config/opt';


function throwError(res: Response, e: string) {
    res.statusCode = 401;
    res.send({
        error: e
    });
}

export const validateToken = async (req: Request, res: Response, next: Function) => {
    try {
        if ( !req.headers.authorization || !req.headers.authorization.startsWith('Bearer ') ) {
            return throwError(res, 'Unauthorized')
        }

        const token = req.headers.authorization.split('Bearer ')[1];

        // @ts-ignore
        req.user = verifyJWT(token);
        next();
    }
    catch (e) {
        console.error(e);
        return throwError(res, 'invalid token')
    }
};


export const validateUid = async (req: Request, res: Response, next: Function) => {
    const { game_path, publisher_uid } = req.params;
    if ( !game_path ) {
        return throwError(res, 'invalid game_path')
    }
    if ( !publisher_uid ) {
        // return throwError(res, 'invalid publisher_uid')
    }

    next();
};


export const readyToPlay = async (req: Request, res: Response, next: Function) => {
    const { game_path, publisher_uid, user_uid } = req.params;

    if ( !game_path ) {
        return throwError(res, 'invalid game');
    }

    await dbs.Game.getTransaction(async (transaction: Transaction) => {
        const game = await dbs.Game.findOne({ pathname: game_path }, transaction);

        if ( publisher_uid ) {
            let publisherRecord = await dbs.Publisher.findOne({ uid: publisher_uid }, transaction);

            if ( user_uid ) {

            }
        }

        // @ts-ignore
        req.data = {
            game: {
                origin: '',
                url: game.url_game,
                title: game.title,
                frame_type: game.control_type
            },
            server: {
                url: cfgOption.Url.DeployApiV1,
                token: '',
                shared_url: `${cfgOption.Url.Host}/game/${game.pathname}/`,
            },
            publisher: {
                uid: publisher_uid || '',
            },
        };

    });

    next();
};


export const validateFirebaseIdToken = async (req: any, res: any, next: any) => {
    console.log('Check if request is authorized with Firebase ID token');

    if ((!req.headers.authorization || !req.headers.authorization.startsWith('Bearer ')) &&
        !(req.cookies && req.cookies.__session)) {
        console.error('No Firebase ID token was passed as a Bearer token in the Authorization header.',
            'Make sure you authorize your request by providing the following HTTP header:',
            'Authorization: Bearer <Firebase ID Token>',
            'or by passing a "__session" cookie.');
        res.status(403).send('Unauthorized');
        return;
    }

    let idToken;
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
        console.log('Found "Authorization" header');
        // Read the ID Token from the Authorization header.
        idToken = req.headers.authorization.split('Bearer ')[1];
    } else if(req.cookies) {
        console.log('Found "__session" cookie');
        // Read the ID Token from cookie.
        idToken = req.cookies.__session;
    } else {
        // No cookie
        res.status(403).send('Unauthorized');
        return;
    }

    try {
        const decodedIdToken = await admin.auth().verifyIdToken(idToken);
        console.log('ID Token correctly decoded', decodedIdToken);
        req.user = decodedIdToken;
        next();
        return;
    } catch (error) {
        console.error('Error while verifying Firebase ID token:', error);
        res.status(403).send('Unauthorized');
        return;
    }
};