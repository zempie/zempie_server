import { Request, Response, Router } from 'express';
import convert from '../controllers/_convert';
import { validateFirebaseIdToken } from './_common';
import UserController from '../controllers/userController'


const apiVer = `/api/v1`;

export default (router: Router) => {

    router.post(`${apiVer}/user/sign-out`,      validateFirebaseIdToken,    convert(UserController.signOut));

    router.get(`${apiVer}/users/info`,              validateFirebaseIdToken,    convert(UserController.getInfo));
    router.get(`${apiVer}/users/info/:target_uid`,  validateFirebaseIdToken,    convert(UserController.getTargetInfo));
    // router.get(`${apiVer}/users/game-records`,      validateFirebaseIdToken,    convert(UserController.getUserGameRecords));

    router.post(`${apiVer}/user/setting`,       validateFirebaseIdToken,    convert(UserController.updateSetting));

}