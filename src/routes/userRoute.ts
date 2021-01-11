import { Router } from 'express';
import convert from '../controllers/_convert';
import { isAuthenticated, validateFirebaseIdToken } from './_common';
import UserController from '../controllers/user/userController';
import UserPlaylistController from '../controllers/user/userPlaylistController';
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

    router.post(`${apiVer}/user/update/info`,       validateFirebaseIdToken,    FileManager.uploadImage2(1, 1),    convert(UserController.setInfo));
    router.post(`${apiVer}/user/update/banner`,     validateFirebaseIdToken,    FileManager.uploadImage2(10, 10),    convert(UserController.setBanner));
    router.post(`${apiVer}/user/update/setting`,    validateFirebaseIdToken,    convert(UserController.updateSetting));
    router.post(`${apiVer}/user/update/e-link`,     validateFirebaseIdToken,    convert(UserController.updateExternalLink));
    router.post(`${apiVer}/user/delete/e-link`,     validateFirebaseIdToken,    convert(UserController.deleteExternalLink));

    router.get(`${apiVer}/user/filter/bad-word`,    validateFirebaseIdToken,    convert(UserController.filterBadWord));

    router.get(`${apiVer}/user/info`,               validateFirebaseIdToken,    isAuthenticated,    convert(UserController.getInfo));
    router.get(`${apiVer}/channel/:channel_id`,     validateFirebaseIdToken,    convert(UserController.getTargetInfoByChannelId));

    router.get(`${apiVer}/playlists`,               validateFirebaseIdToken,    convert(UserPlaylistController.getPlaylists));
    router.get(`${apiVer}/playlist/:uid`,           validateFirebaseIdToken,    convert(UserPlaylistController.getPlaylist));
    router.post(`${apiVer}/playlist/c`,             validateFirebaseIdToken,    isAuthenticated,    FileManager.uploadImage,    convert(UserPlaylistController.createPlaylist));
    router.post(`${apiVer}/playlist/u`,             validateFirebaseIdToken,    isAuthenticated,    FileManager.uploadImage,    convert(UserPlaylistController.updatePlaylist));
    router.post(`${apiVer}/playlist/d`,             validateFirebaseIdToken,    isAuthenticated,    convert(UserPlaylistController.deletePlaylist));

    router.post(`${apiVer}/playlist/game/c`,        validateFirebaseIdToken,    isAuthenticated,    convert(UserPlaylistController.addGame));
    router.post(`${apiVer}/playlist/game/u`,        validateFirebaseIdToken,    isAuthenticated,    convert(UserPlaylistController.sortGame));
    router.post(`${apiVer}/playlist/game/d`,        validateFirebaseIdToken,    isAuthenticated,    convert(UserPlaylistController.delGame));
    router.post(`${apiVer}/playlist/game/s`,        validateFirebaseIdToken,    isAuthenticated,    convert(UserPlaylistController.sortGame));


    router.get(`${apiVer}/user/search`,             validateFirebaseIdToken,    convert(UserController.searchUser));
    router.get(`${apiVer}/user/alarm`,              validateFirebaseIdToken,    convert(AlarmController.getList));
    router.get(`${apiVer}/user/publishing`,         validateFirebaseIdToken,    convert(PublishingController.getList));



    // for testing
    router.get(`${apiVer}/test-mongo`,      convert(UserController.testMongo));
}
