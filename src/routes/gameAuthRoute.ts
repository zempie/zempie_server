import { Router } from 'express';
import convert from '../controllers/_gameConvert';
import gameAuthController from '../controllers/gameAuthController';
import { isAuthenticated, validateFirebaseIdToken, validateGameToken } from './_common';

const apiVer = `/api/v1`;

export default (router: Router) => {

  //게임 토큰
  router.post(`${apiVer}/create/token`,            validateFirebaseIdToken, isAuthenticated, convert(gameAuthController.createUserToken));
  router.post(`${apiVer}/verify/token`,            convert(gameAuthController.verifyToken));

  //게임 서버 유저
  router.get(`${apiVer}/game/user/info`,           validateGameToken,       convert(gameAuthController.getInfo))

  //게임 서버 
  router.post(`${apiVer}/game/auth/access-token`,  convert(gameAuthController.createGameToken))
  router.get(`${apiVer}/game/auth/verify-token`,   convert(gameAuthController.verifyGameToken))


}