import { Request, Response, Router } from 'express';
import convert from '../controllers/_convert';
import { validateFirebaseIdToken } from './_common';
import UserController from '../controllers/userController';
import AlarmController from "../controllers/alarmController";
import RpcController from '../controllers/rpcController';


const apiVer = `/api/v1`;

export default (router: Router) => {

    router.post(`${apiVer}/user/sign-out`,      validateFirebaseIdToken,    convert(UserController.signOut));

    router.get(`${apiVer}/users/info`,              validateFirebaseIdToken,    convert(UserController.getInfo));
    router.get(`${apiVer}/users/info/:target_uid`,  validateFirebaseIdToken,    convert(UserController.getTargetInfo));

    router.post(`${apiVer}/user/setting`,       validateFirebaseIdToken,    convert(UserController.updateSetting));
    router.get(`${apiVer}/user/alarm`,          validateFirebaseIdToken,    convert(AlarmController.getList));

}

RpcController.generator('sign-out',         UserController.signOut, true);
RpcController.generator('user-info',        UserController.getInfo, true);
RpcController.generator('target-info',      UserController.getTargetInfo, true);
RpcController.generator('user-setting',     UserController.updateSetting, true);
RpcController.generator('get-user-alarms',  AlarmController.getList, true);