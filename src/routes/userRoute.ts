import { Router } from 'express';
import convert from '../controllers/_convert';
import { isAuthenticated, validateFirebaseIdToken } from './_common';
import UserController from '../controllers/user/userController';
import UserPlayListController from '../controllers/user/userPlayListController';
import AlarmController from '../controllers/alarmController';
import RpcController from '../controllers/rpcController';
import FileManager from '../services/fileManager';
import PublishingController from '../controllers/publishingController';


const apiVer = `/api/v1`;

export default (router: Router) => {
    router.get(`${apiVer}/__cookie`, convert(UserController.setCookie))
    router.get(`${apiVer}/user/verify-session`,     convert(UserController.getCustomToken));
    router.post(`${apiVer}/user/sign-up`,           validateFirebaseIdToken,    convert(UserController.signUp));
    router.post(`${apiVer}/user/sign-out`,          validateFirebaseIdToken,    convert(UserController.signOut));
    router.post(`${apiVer}/user/leave-zempie`,      validateFirebaseIdToken,    convert(UserController.leaveZempie))
    router.post(`${apiVer}/user/verify-email`,      validateFirebaseIdToken,    convert(UserController.verifyEmail));
    router.post(`${apiVer}/user/verify-channel`,    validateFirebaseIdToken,    convert(UserController.verifyChannelId));

    router.post(`${apiVer}/user/update/info`,       validateFirebaseIdToken,    FileManager.uploadImage,    convert(UserController.setInfo));
    router.post(`${apiVer}/user/update/banner`,     validateFirebaseIdToken,    FileManager.uploadImage,    convert(UserController.setBanner));
    router.post(`${apiVer}/user/update/setting`,    validateFirebaseIdToken,    convert(UserController.updateSetting));
    router.post(`${apiVer}/user/update/e-link`,     validateFirebaseIdToken,    convert(UserController.updateExternalLink));
    router.post(`${apiVer}/user/delete/e-link`,     validateFirebaseIdToken,    convert(UserController.deleteExternalLink));

    router.get(`${apiVer}/user/info`,               validateFirebaseIdToken,    convert(UserController.getInfo));
    router.get(`${apiVer}/channel/:channel_id`,     validateFirebaseIdToken,    convert(UserController.getTargetInfoByChannelId));

    router.get(`${apiVer}/play-list/:uid`,          validateFirebaseIdToken,    convert(UserPlayListController.getPlayList));
    router.post(`${apiVer}/play-list/c`,            validateFirebaseIdToken,    isAuthenticated,    FileManager.uploadImage,    convert(UserPlayListController.createPlaylist));
    router.post(`${apiVer}/play-list/u`,            validateFirebaseIdToken,    isAuthenticated,    FileManager.uploadImage,    convert(UserPlayListController.updatePlaylist));
    router.post(`${apiVer}/play-list/d`,            validateFirebaseIdToken,    isAuthenticated,    convert(UserPlayListController.deletePlaylist));

    router.post(`${apiVer}/play-list/game/c`,       validateFirebaseIdToken,    isAuthenticated,    convert(UserPlayListController.addGame));
    router.post(`${apiVer}/play-list/game/u`,       validateFirebaseIdToken,    isAuthenticated,    convert(UserPlayListController.sortGame));
    router.post(`${apiVer}/play-list/game/d`,       validateFirebaseIdToken,    isAuthenticated,    convert(UserPlayListController.delGame));


    router.get(`${apiVer}/user/search`,             validateFirebaseIdToken,    convert(UserController.searchUser));
    router.get(`${apiVer}/user/alarm`,              validateFirebaseIdToken,    convert(AlarmController.getList));
    router.get(`${apiVer}/user/publishing`,         validateFirebaseIdToken,    convert(PublishingController.getList));
}
