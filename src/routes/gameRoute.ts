import { Request, Response, Router } from 'express';
import convert from '../controllers/_convert';
import { validateFirebaseIdToken } from './_common';
import GameController from '../controllers/gameController'
import TimelineController from '../controllers/timelineController'
import AlarmController from '../controllers/alarmController'
import NoticeController from '../controllers/noticeController'


const apiVer = `/api/v1`;

export default (router: Router) => {

    router.get(`${apiVer}/games`,   convert(GameController.getList));
    router.get(`${apiVer}/games/ranking/:game_path/g`,  validateFirebaseIdToken,    convert(GameController.getGlobalRanking));
    router.get(`${apiVer}/games/ranking/:game_path/f`,  validateFirebaseIdToken,    convert(GameController.getFollowingRanking));

    router.post(`${apiVer}/game/:game_path/start`,      validateFirebaseIdToken,    convert(GameController.gameStart));
    router.post(`${apiVer}/game/:game_path/over`,       validateFirebaseIdToken,    convert(GameController.gameOver));

}