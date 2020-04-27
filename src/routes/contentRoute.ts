import { Request, Response, Router } from 'express';
import convert from '../controllers/_convert';
import { validateFirebaseIdToken } from './_common';
import GameController from '../controllers/gameController'


const apiVer = `/api/v1`;

export default (router: Router) => {

    router.get(`${apiVer}/games`,                       /*validateFirebaseIdToken,*/    convert(GameController.getList));
    router.get(`${apiVer}/games/ranking/:game_path`,    validateFirebaseIdToken,    convert(GameController.getRanking));

    router.post(`${apiVer}/game/:game_path/start`,      validateFirebaseIdToken,    convert(GameController.gameStart));
    router.post(`${apiVer}/game/:game_path/over`,       validateFirebaseIdToken,    convert(GameController.gameOver));

}