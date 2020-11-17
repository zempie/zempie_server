import { Router } from 'express';
import convert from '../controllers/_convert';
import { validateFirebaseIdToken } from './_common';
import UserController from '../controllers/userController';
import AlarmController from '../controllers/alarmController';
import RpcController from '../controllers/rpcController';
import FileManager from '../services/fileManager';
import PublishingController from '../controllers/publishingController';


const apiVer = `/api/v1`;

export default (router: Router) => {
    router.post(`${apiVer}/user/sign-up`,           validateFirebaseIdToken,    convert(UserController.signUp));
    router.post(`${apiVer}/user/sign-out`,          validateFirebaseIdToken,    convert(UserController.signOut));
    router.post(`${apiVer}/user/leave-zempie`,      validateFirebaseIdToken,    convert(UserController.leaveZempie))
    router.post(`${apiVer}/user/verify-email`,      validateFirebaseIdToken,    convert(UserController.verifyEmail));

    router.post(`${apiVer}/user/update/info`,       validateFirebaseIdToken,    FileManager.uploadImage,    convert(UserController.setInfo));
    router.post(`${apiVer}/user/update/setting`,    validateFirebaseIdToken,    convert(UserController.updateSetting));

    router.get(`${apiVer}/user/info`,               validateFirebaseIdToken,    convert(UserController.getInfo));
    router.get(`${apiVer}/user/info/:target_uid`,   validateFirebaseIdToken,    convert(UserController.getTargetInfo));
    router.get(`${apiVer}/user/search`,             validateFirebaseIdToken,    convert(UserController.searchUser));
    router.get(`${apiVer}/user/alarm`,              validateFirebaseIdToken,    convert(AlarmController.getList));
    router.get(`${apiVer}/user/publishing`,         validateFirebaseIdToken,    convert(PublishingController.getList));
}

RpcController.generator('sign-out',         UserController.signOut, true);
RpcController.generator('set-user-info',    UserController.setInfo, true);
RpcController.generator('get-user-info',    UserController.getInfo, true);
RpcController.generator('get-target-info',  UserController.getTargetInfo, true);
RpcController.generator('get-search-user',  UserController.searchUser, true);
RpcController.generator('set-user-setting', UserController.updateSetting, true);
RpcController.generator('get-alarms',       AlarmController.getList, true);


RpcController.generator('get-publishing',   PublishingController.getList, true);
