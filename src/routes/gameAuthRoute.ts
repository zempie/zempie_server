import { Router } from 'express';
import convert from '../controllers/_convert';
import gameAuthController from '../controllers/gameAuthController';
import { validateGameToken } from './_common';

const apiVer = `/api/v1`;

export default (router: Router) => {

  //게임 토큰
  router.post(`${apiVer}/create/token`, convert(gameAuthController.createToken));
  router.post(`${apiVer}/verify/token`, convert(gameAuthController.verifyToken));

  router.get(`${apiVer}/game/user/info`, validateGameToken, convert(gameAuthController.getInfo))



}