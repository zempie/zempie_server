import { Request, Response, Router } from 'express';
import convert from '../controllers/_convert';
import { validateFirebaseIdToken } from './_common';
import GameController from '../controllers/gameController'
import TimelineController from '../controllers/timelineController'
import AlarmController from '../controllers/alarmController'
import NoticeController from '../controllers/noticeController'
import RpcController from '../controllers/rpcController';


const apiVer = `/api/v1`;

export default (router: Router) => {

    router.get(`${apiVer}/games`,               convert(GameController.getGameList));
    router.get(`${apiVer}/games/ranking/g`,     validateFirebaseIdToken,    convert(GameController.getGlobalRanking));
    router.get(`${apiVer}/games/ranking/f`,     validateFirebaseIdToken,    convert(GameController.getFollowingRanking));

    router.post(`${apiVer}/game/start`,         validateFirebaseIdToken,    convert(GameController.gameStart));
    router.post(`${apiVer}/game/over`,          validateFirebaseIdToken,    convert(GameController.gameOver));

    router.post(`${apiVer}/rpc`, RpcController.routeRpc);
}



RpcController.generator('get-games',        GameController.getGameList);
RpcController.generator('game-start',   GameController.gameStart, true);
RpcController.generator('game-over',    GameController.gameOver, true);
RpcController.generator('get-ranking-global',   GameController.getGlobalRanking, true);
RpcController.generator('get-ranking-follow',   GameController.getFollowingRanking, true);